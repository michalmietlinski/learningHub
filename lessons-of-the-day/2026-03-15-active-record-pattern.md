# Active Record Pattern

## 📋 Learning Objectives

- [ ] Understand the Active Record pattern and how it combines data and persistence
- [ ] Learn the one-class-per-table idea: object wraps a row and knows how to save/load
- [ ] Distinguish Active Record from Repository and Data Mapper
- [ ] Know when Active Record fits (simple domains, CRUD, rapid prototyping) vs when to prefer alternatives
- [ ] Recognize trade-offs: simplicity vs testability and domain purity
- [ ] Apply best practices and avoid common pitfalls

---

## 🎯 Definition

**Active Record** is an enterprise pattern in which an **object that represents a row** in a table (or view) **encapsulates both the data and the behavior** for accessing and persisting that data. Each Active Record instance corresponds to one row; the class typically provides methods such as find (by id or criteria), save (insert or update), and delete. The domain logic for that entity often lives in the same class.

**Origin:**
- Martin Fowler, *Patterns of Enterprise Application Architecture* (PoEAA)
- Named after the Ruby on Rails “Active Record” implementation
- Common in ORMs and frameworks (Rails, Laravel Eloquent, Yii ActiveRecord, etc.)

**Key Principle:**
> "An object that wraps a row in a database table or view, encapsulates the database access, and adds domain logic on that data. The object carries both data and behavior; typically one class per table."

**Alternative formulation:**
> "Put persistence methods (load, save, delete) on the same class that holds the row data, so each object knows how to read and write itself to the database."

---

## 🏗️ Core Concepts

### One Object = One Row

```
┌─────────────────────────────────────────────────────────────────┐
│  ACTIVE RECORD                                                  │
│                                                                  │
│  Table: orders                                                  │
│  ┌──────────┬────────────┬────────┬────────┐                   │
│  │ id       │ customer_id│ status │ total  │                    │
│  ├──────────┼────────────┼────────┼────────┤                   │
│  │ 1        │ 101       │ PAID   │ 99.00  │  ← one row         │
│  └──────────┴────────────┴────────┴────────┘                   │
│                              │                                   │
│                              ▼                                   │
│  Order (Active Record instance)                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  id, customerId, status, total   (data = row)            │   │
│  │  save()  → INSERT or UPDATE                              │   │
│  │  delete()                                                │   │
│  │  static find(id), findWhere(...)  → load from DB         │   │
│  │  + optional domain methods (e.g. markAsPaid())          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  No separate Repository or Mapper; the class does it all.        │
└─────────────────────────────────────────────────────────────────┘
```

### Typical API

| Operation | Meaning |
|-----------|---------|
| **Find by id** | Class method: load one row, return an instance (or null). |
| **Find by criteria** | Class method: query table, return one or many instances. |
| **Save** | Instance method: if new (no id), INSERT; otherwise UPDATE. |
| **Delete** | Instance method: DELETE the row for this instance. |

The class holds **data** (fields matching the row) and **persistence** (save, delete, static finders). It may also hold **domain logic** (e.g. validation, state transitions) in the same class.

### No Separate Mapper or Repository

- **Data Mapper** – A separate mapper class moves data between domain objects and the database; the domain object is unaware of persistence. Active Record does **not** use a separate mapper; the object maps itself.
- **Repository** – A Repository presents a collection-like API and hides persistence behind an interface. In Active Record, the **entity class itself** is the entry point for persistence; you may still introduce a thin Repository or facade over Active Record for queries or testing, but the core pattern is “object knows how to persist itself.”

---

## 📦 Relation to Other Patterns

| Pattern | Relationship |
|---------|---------------|
| **Data Mapper** | **Alternative.** Data Mapper separates domain object from persistence; Active Record combines them. Use Data Mapper when you want a rich domain model independent of the database. |
| **Repository** | Repository can **wrap** Active Record to provide a collection-like API, centralize queries, and simplify swapping for tests. Active Record alone is “object does everything”; Repository adds a facade. |
| **Unit of Work** | Active Record often saves immediately (each save() commits). To group multiple changes in one transaction, you need either a Unit of Work that Active Records register with, or framework support (e.g. Rails transactions). |
| **Table Data Gateway** | Table Data Gateway is a single object per table that executes SQL and returns rows (no domain behavior). Active Record adds domain object + persistence on top of “one row → one object.” |

---

## 📊 When to Use Active Record

| Scenario | Use Active Record? |
|----------|---------------------|
| Simple domain, mostly CRUD | ✅ Fast to build; one class per table is easy to follow. |
| Rapid prototyping or small app | ✅ Few layers; persistence and data in one place. |
| Framework already uses it (e.g. Rails, Laravel) | ✅ Fits the framework’s style and tooling. |
| Rich domain with complex rules and many aggregates | ⚠️ Prefer Data Mapper + Repository so domain stays persistence-ignorant and testable without a DB. |
| Need to test domain logic without a database | ⚠️ Active Record usually hits the DB; use Data Mapper + Repository and mock the repository. |
| Multiple representations of same data (e.g. different tables/views) | ⚠️ Data Mapper can map one domain type to several tables; Active Record is typically one class per table. |

---

## ⚠️ Common Pitfalls

1. **Domain logic mixed with SQL and schema** – The class can become a mix of business rules and persistence. Keep persistence in dedicated methods; avoid scattering table/column names through domain logic.
2. **Hard to test without a database** – Saving and loading usually go to the real DB. To test domain logic in isolation, extract it to a separate domain type and use that from Active Record, or introduce a thin Repository over Active Record and mock it.
3. **Anemic Active Record** – If the class is only getters/setters plus save/load, it’s just a row wrapper with no domain behavior. Either add meaningful domain methods or consider a Table Data Gateway or DTO for simple cases.
4. **Transaction boundaries unclear** – Each save() often commits. For multi-entity operations, use explicit transactions or a Unit of Work so you don’t get partial commits.
5. **Tight coupling to one table** – Active Record fits “one class per table.” If the domain model doesn’t match tables (e.g. inheritance, value objects, multiple tables per aggregate), Data Mapper is usually a better fit.

---

## 🎯 Best Practices

1. **Keep persistence methods focused** – save(), delete(), and static finders should only handle DB access; keep complex domain logic in other methods or services.
2. **Use transactions for multi-step operations** – When one use case updates several Active Records, wrap in a single transaction (or Unit of Work) so all or nothing is committed.
3. **Consider a Repository facade** – For complex queries or testability, add a Repository that uses Active Record internally; the application depends on the Repository interface, not Active Record directly.
4. **Avoid leaking schema into domain API** – Prefer domain-named methods and properties; hide column names behind a clear interface.
5. **Document the “one row = one object” rule** – So developers don’t expect the same flexibility as with a full Data Mapper (e.g. mapping one domain type to multiple tables).

---

## 🔗 Related Patterns & Topics

| Topic | Relationship |
|-------|--------------|
| **Data Mapper** | Alternative: domain object is separate; mapper handles persistence. Use when domain is rich and must stay free of DB concerns. |
| **Repository** | Can sit in front of Active Record to provide collection-like API and centralize queries. |
| **Unit of Work** | Use when you need to group several Active Record saves in one transaction. |
| **Table Data Gateway** | Returns rows; no domain behavior. Active Record adds object + persistence on top. |

---

## 📝 Key Takeaways

1. **Active Record** = one class per table, one instance per row; the object holds **data and persistence** (save, delete, static find).
2. **No separate Data Mapper or Repository** in the core pattern; the class encapsulates its own database access.
3. **Good fit** for simple domains, CRUD, and frameworks that use it; **weaker fit** for rich domains and testing without a DB.
4. **Data Mapper** is the main alternative when you want persistence-ignorant domain objects and easier unit testing.
5. Use **transactions** (or Unit of Work) when one operation updates multiple Active Records; avoid implicit commit-per-save when consistency across entities matters.

---

**Date Created:** 2026-03-15  
**Pattern Type:** Enterprise Application (PoEAA) – Data Source  
**Difficulty:** Intermediate  
**Related:** Data Mapper, Repository, Unit of Work, Table Data Gateway
