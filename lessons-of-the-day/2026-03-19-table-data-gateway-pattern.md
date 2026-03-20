# Table Data Gateway Pattern

## 📋 Learning Objectives

- [ ] Understand the Table Data Gateway pattern and its role in encapsulating table access
- [ ] Learn the one-class-per-table idea: one gateway owns all SQL for that table
- [ ] Distinguish Table Data Gateway from Row Data Gateway, Active Record, and Repository
- [ ] Know when to use it (simple data access, no rich domain) vs when to prefer domain-oriented patterns
- [ ] Apply best practices and avoid common pitfalls

---

## 🎯 Definition

The **Table Data Gateway** is an enterprise pattern that provides an **object that acts as a gateway to a single table**. It encapsulates all SQL for that table: find (by id or criteria), insert, update, delete. It returns **rows** (records, result sets, or simple data structures such as maps or DTOs), not domain objects. It contains **no domain logic**—only the mechanics of reading and writing table data.

**Origin:**
- Martin Fowler, *Patterns of Enterprise Application Architecture* (PoEAA)
- Sometimes called **Table Gateway** or **Data Access Object (DAO)** in a narrow sense (one per table, row-based)
- Fits simple CRUD and transaction-script-style applications

**Key Principle:**
> "An object that acts as a gateway to a database table. One instance handles all the rows in the table. It encapsulates the logic of finding, inserting, updating, and deleting rows and returns data in a row-based representation (e.g. record set, array of maps, or simple data structures)."

**Alternative formulation:**
> "One class per table; that class knows how to run SELECT, INSERT, UPDATE, DELETE for that table and returns rows or row-like structures. The rest of the application uses the gateway instead of writing SQL directly."

---

## 🏗️ Core Concepts

### One Gateway per Table

```
┌─────────────────────────────────────────────────────────────────┐
│  TABLE DATA GATEWAY                                             │
│                                                                  │
│  Table: orders                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  OrderTableGateway                                        │   │
│  │  – findById(id)        → one row (map/record)             │   │
│  │  – findByStatus(status) → many rows                       │   │
│  │  – insert(row)         → new id                           │   │
│  │  – update(id, row)    → void                             │   │
│  │  – delete(id)         → void                             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  Database: orders table                                          │
│                                                                  │
│  Returns: rows / records / maps / simple DTOs                    │
│  Does not return: domain objects with behavior                    │
└─────────────────────────────────────────────────────────────────┘
```

### What It Does

| Operation | Responsibility |
|-----------|----------------|
| **Find** | Execute SELECT; return one row (or null) or a list of rows. Rows are typically maps, arrays, or simple data holders—not domain entities. |
| **Insert** | Take row data; execute INSERT; return generated id (if any). |
| **Update** | Take id and row data; execute UPDATE. |
| **Delete** | Take id; execute DELETE. |

The gateway **does not** add business rules, validation, or domain behavior. It only translates between the application and the table.

### Row-Based, Not Domain-Based

- **Table Data Gateway** returns **rows** (e.g. `{ id: 1, customerId: 101, status: 'PAID', total: 99 }`). The caller may pass that data to a service or build a domain object elsewhere, but the gateway itself does not work with domain objects.
- **Repository** returns **domain objects** and uses domain terms (e.g. `findPendingOrders()`). It may use a Table Data Gateway or a Data Mapper under the hood, but its API is domain-oriented.
- **Active Record** is **one object per row** and that object has behavior (save, delete). Table Data Gateway is **one object per table** and returns row data only.

---

## 📦 Relation to Other Patterns

| Pattern | Relationship |
|---------|---------------|
| **Row Data Gateway** | Row Data Gateway is **one object per row** (each row is an object with getters/setters and possibly save/delete). Table Data Gateway is **one object per table** and returns rows, not row objects. |
| **Active Record** | Active Record combines row data and persistence behavior in one class per row. Table Data Gateway has no row object; it's one class per table and returns plain row data. |
| **Repository** | Repository presents a domain-oriented, collection-like API and returns domain objects. A Repository **implementation** might use a Table Data Gateway to run SQL and then map rows to domain objects (or use a Data Mapper). |
| **Data Mapper** | Data Mapper maps between domain objects and the database. Table Data Gateway does not deal with domain objects; it only deals with rows. You can use a gateway to fetch rows and then a separate component to map them to domain objects. |

---

## 📊 When to Use a Table Data Gateway

| Scenario | Use Table Data Gateway? |
|----------|--------------------------|
| Simple CRUD, transaction script, or thin domain | ✅ Centralize SQL for each table; return rows for the script or service to use. |
| Need a simple data access layer without a rich domain model | ✅ Gateway is easy to test (mock or replace) and keeps SQL in one place. |
| Building a Repository or service that needs raw table access | ✅ Repository or service can use the gateway to get rows and then build domain objects or DTOs. |
| Rich domain model with aggregates and domain logic | ⚠️ Prefer Repository + Data Mapper (or Active Record) so the domain stays in the driver's seat; gateway returns rows, not domain. |
| Need one object per row with behavior (save, validate) | ❌ Use Row Data Gateway or Active Record instead. |

---

## ⚠️ Common Pitfalls

1. **Putting domain logic in the gateway** – The gateway should only run SQL and return rows. Validation, calculations, and business rules belong in the domain or application layer.
2. **Leaking SQL and schema everywhere** – Keep all table and column names inside the gateway (or configuration it uses). Callers should pass and receive data by logical names or DTOs, not raw column names if you want to keep flexibility.
3. **Returning domain objects** – If the gateway starts returning domain entities and growing behavior, it drifts toward Active Record or Repository; decide whether you want a row-based gateway or a domain-oriented API and stick to it.
4. **One gateway doing too much** – Stick to one table per gateway (or one logical table, e.g. view). For complex queries spanning tables, use a separate query object or a service that coordinates multiple gateways.
5. **Transaction handling** – The gateway usually does not own the transaction; the application or a Unit of Work opens the transaction and passes the connection (or context) to the gateway. Ensure the gateway uses the same transaction as the rest of the operation.

---

## 🎯 Best Practices

1. **One class per table** – Clear responsibility; easy to find and maintain all SQL for that table.
2. **Return row-like structures** – Records, maps, or simple DTOs—not domain objects. Let the service or Repository build domain objects if needed.
3. **No domain logic** – Only data access: find, insert, update, delete. Keep the gateway thin.
4. **Use with transactions** – Gateway methods should use the connection or transaction provided by the caller (e.g. Unit of Work or service) so multiple gateways participate in one transaction.
5. **Name methods clearly** – e.g. `findById`, `findByStatus`, `insert`, `update`, `delete`. Optional: domain-style names like `findPendingOrders` if they only wrap a simple query and still return rows.

---

## 🔗 Related Patterns & Topics

| Topic | Relationship |
|-------|--------------|
| **Row Data Gateway** | One object per row; Table Data Gateway is one object per table and returns rows. |
| **Active Record** | One object per row with behavior; Table Data Gateway has no row object, only row data. |
| **Repository** | Domain-oriented API and domain objects; may use a Table Data Gateway internally to get rows. |
| **Data Mapper** | Maps between domain objects and DB; gateway deals only with rows. |
| **DTO** | Rows returned by the gateway can be seen as DTOs or raw data that the caller maps to DTOs or domain objects. |

---

## 📝 Key Takeaways

1. **Table Data Gateway** = **one object per table** that encapsulates all SQL for that table (find, insert, update, delete).
2. It returns **rows** (records, maps, or simple data), **not** domain objects, and contains **no domain logic**.
3. Fits **simple data access**, **transaction scripts**, or as the **data-access building block** used by a Repository or service.
4. **Row Data Gateway** and **Active Record** are one-per-row and carry behavior; **Repository** and **Data Mapper** are domain-oriented. Table Data Gateway stays row-based and thin.
5. Keep **transactions** and **connection** under the caller's control; the gateway runs SQL within that context.

---

**Date Created:** 2026-03-19  
**Pattern Type:** Enterprise Application (PoEAA) – Data Source  
**Difficulty:** Intermediate  
**Related:** Row Data Gateway, Active Record, Repository, Data Mapper, DTO
