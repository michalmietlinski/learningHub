# Data Mapper Pattern

## 📋 Learning Objectives

- [ ] Understand the Data Mapper pattern and its role in separating domain from persistence
- [ ] Learn how the mapper moves data between domain objects and the database without coupling them
- [ ] Master the idea: domain objects are persistence-ignorant; the mapper does the translation
- [ ] Relate Data Mapper to Repository, Unit of Work, and Active Record
- [ ] Know when to use Data Mapper vs Active Record (rich domain, complex mapping, testability)
- [ ] Apply best practices and avoid common pitfalls

---

## 🎯 Definition

The **Data Mapper** is an enterprise pattern that moves data between **domain objects** and the **database** (or any persistent store) through a **separate mapper layer**. The domain objects have no knowledge of the database schema, SQL, or persistence; the mapper is responsible for loading data into domain objects and writing domain object state back to the database. This keeps the domain model independent of persistence and makes it easier to test and evolve each side separately.

**Origin:**
- Martin Fowler, *Patterns of Enterprise Application Architecture* (PoEAA)
- Foundation for many ORMs in “domain-centric” mode (e.g. Hibernate with plain POJOs, Entity Framework with POCOs)
- Core pattern when you want a rich, persistence-ignorant domain model

**Key Principle:**
> "A layer of mappers that moves data between objects and a database while keeping them independent of each other and the mapper itself. The domain objects need know nothing of the database structure; the mapper handles the translation in both directions."

**Alternative formulation:**
> "Domain objects stay pure: no save(), no load(), no SQL. A separate mapper knows how to read rows and construct or update domain objects, and how to take domain object state and write it to the database."

---

## 🏗️ Core Concepts

### Separation of Concerns

```
┌─────────────────────────────────────────────────────────────────┐
│  DATA MAPPER                                                    │
│                                                                  │
│  Domain Layer (persistence-ignorant)                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Order (domain object)                                    │   │
│  │  – id, customerId, status, total, lineItems              │   │
│  │  – domain methods only; no save(), no load(), no SQL      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              │  mapper loads / saves              │
│                              ▼                                   │
│  Data Mapper Layer                                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  OrderMapper                                              │   │
│  │  – load(id) → read rows, build Order (and line items)    │   │
│  │  – save(order) → write Order to orders + order_items     │   │
│  │  – knows table names, columns, SQL, mapping rules         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  Database                                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  orders table, order_items table, ...                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Domain never sees the database. Mapper is the only bridge.      │
└─────────────────────────────────────────────────────────────────┘
```

### What the Mapper Does

| Direction | Responsibility |
|-----------|----------------|
| **Load (DB → domain)** | Execute query; read rows; instantiate or reconstitute domain objects; map columns to properties; handle relationships (e.g. order lines), inheritance, or value objects. |
| **Save (domain → DB)** | Take domain object state; determine INSERT vs UPDATE; write to one or more tables; handle relationships and key generation. |

The domain object has **no** reference to the mapper, to the database, or to tables. It only holds data and domain behavior.

### Why Separate the Mapper?

- **Domain stays pure** – No persistence code in the domain; easier to reason about and test without a database.
- **Schema and domain can diverge** – Table layout can change (normalization, denormalization, new columns) without forcing the domain API to change; only the mapper changes.
- **Complex mappings** – One domain object can map to several tables; one table can feed several domain object types (e.g. inheritance); value objects can be in separate columns or tables. The mapper encapsulates this complexity.
- **Testability** – Domain logic can be unit-tested with plain objects; persistence is tested via the mapper (or integration tests).

---

## 📦 Relation to Other Patterns

| Pattern | Relationship |
|---------|---------------|
| **Repository** | Repository uses the Data Mapper (or an ORM that implements it). Repository provides the collection-like API and calls the mapper to load/save. Domain depends on Repository interface, not on the mapper. |
| **Unit of Work** | Unit of Work tracks which domain objects are new/dirty/removed and, on commit, asks the mapper(s) to write them to the database in one transaction. The mapper performs the actual INSERT/UPDATE/DELETE. |
| **Active Record** | **Alternative.** In Active Record, the object maps itself; there is no separate mapper. Use Data Mapper when you want the domain to be persistence-ignorant and mapping to be more flexible (e.g. multiple tables, inheritance). |
| **Identity Map** | Often used with the mapper: when loading, the mapper checks the Identity Map first so the same entity id always yields the same in-memory instance. |

---

## 📦 Mapping Complexity

The mapper can handle cases that are awkward in Active Record:

- **One domain object ↔ multiple tables** – e.g. Order aggregate maps to `orders` + `order_items`; the mapper loads/saves both in a consistent way.
- **Inheritance** – e.g. Single Table Inheritance (one table, discriminator column), Class Table Inheritance (base + subclass tables), Concrete Table Inheritance; the mapper knows which tables and columns to use for each type.
- **Value objects** – e.g. Money, Address stored in columns or a separate table; the mapper assembles/disassembles them when loading/saving.
- **References to other aggregates** – Load by id (lazy or eager); save only the foreign key; the mapper does not necessarily load the whole graph unless the Unit of Work or Repository requests it.

---

## 📊 When to Use Data Mapper

| Scenario | Use Data Mapper? |
|----------|------------------|
| Rich domain model that must stay free of persistence | ✅ Domain has no DB code; mapper handles all translation. |
| Domain structure differs from database schema | ✅ Mapper encapsulates the translation (multiple tables, inheritance, value objects). |
| Need to unit-test domain without a database | ✅ Domain objects are plain; no persistence in the domain layer. |
| Using Repository + Unit of Work with a persistence-ignorant domain | ✅ Mapper is the layer that actually reads/writes; Repository and UoW coordinate. |
| Simple CRUD, one table per entity, no complex rules | ⚠️ Active Record or Table Data Gateway may be enough. |
| Team or framework strongly prefers Active Record | ⚠️ Data Mapper adds a layer; use when the benefits (decoupling, complex mapping) matter. |

---

## ⚠️ Common Pitfalls

1. **Leaking persistence into the domain** – Avoid putting table names, column names, or “is persisted” flags in the domain. Keep all persistence knowledge in the mapper.
2. **Mapper doing domain logic** – The mapper should only map data (and perhaps simple conversions like string ↔ enum). Validation, calculations, and business rules belong in the domain.
3. **Anemic domain with a heavy mapper** – If the domain is only getters/setters and the mapper contains all the “behavior,” consider moving behavior into the domain and keeping the mapper thin.
4. **Loading too much or too little** – Eager-loading entire graphs can be slow; lazy-loading everywhere can cause N+1 or unexpected DB access. Define clear boundaries (e.g. aggregate) and load what the use case needs.
5. **Forgetting Unit of Work** – If the mapper writes immediately on every change, you lose the “one transaction per use case” benefit. Use the mapper with a Unit of Work so commits are coordinated.

---

## 🎯 Best Practices

1. **Keep domain persistence-ignorant** – No SQL, no table names, no mapper references in the domain.
2. **One mapper per aggregate root (or per entity type)** – So each mapper has a clear responsibility and mapping stays maintainable.
3. **Use with Unit of Work** – Let the Unit of Work decide when to flush; the mapper performs the actual writes when the UoW commits.
4. **Centralize mapping rules** – All “how does this object map to the DB?” logic lives in the mapper (or in declarative ORM config), not scattered in the domain or services.
5. **Test mapping separately** – Integration tests that load/save through the mapper and assert domain state and DB state help catch mapping bugs without touching domain unit tests.

---

## 🔗 Related Patterns & Topics

| Topic | Relationship |
|-------|--------------|
| **Repository** | Repository exposes a domain-friendly API and uses the Data Mapper (or ORM) to load and save. |
| **Unit of Work** | UoW tracks changed objects and, on commit, invokes the mapper to persist them in one transaction. |
| **Active Record** | Alternative: object maps itself; no separate mapper. Choose Data Mapper for persistence-ignorant domain and complex mapping. |
| **Identity Map** | Mapper often uses an Identity Map so repeated loads of the same id return the same instance. |
| **DTO** | Mapper maps between domain and DB; another layer (or the same) may map between domain and DTOs for the API. |

---

## 📝 Key Takeaways

1. **Data Mapper** is a **separate layer** that moves data between **domain objects** and the **database**; the domain has no persistence logic.
2. **Domain stays persistence-ignorant** – no save/load, no SQL, no schema knowledge; the mapper handles all translation in both directions.
3. **Mapper handles complexity** – multiple tables per aggregate, inheritance, value objects, relationships; Repository and Unit of Work coordinate when to load/save.
4. **Use with Repository and Unit of Work** – Repository provides the API; UoW groups changes; mapper does the actual read/write.
5. **Prefer Data Mapper** when you have a rich domain and need testability or flexible mapping; **Active Record** when the domain is simple and you want fewer layers.

---

**Date Created:** 2026-03-16  
**Pattern Type:** Enterprise Application (PoEAA) – Data Source  
**Difficulty:** Intermediate  
**Related:** Repository, Unit of Work, Active Record, Identity Map, DTO
