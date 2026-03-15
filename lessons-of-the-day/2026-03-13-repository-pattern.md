# Repository Pattern

## 📋 Learning Objectives

- [ ] Understand the Repository pattern and its role in data access
- [ ] Learn why Repositories sit between domain and persistence
- [ ] Master the collection-like API (add, remove, get by id, query)
- [ ] Distinguish Repository interface (domain) from implementation (infrastructure)
- [ ] Relate Repository to Unit of Work, DDD, and DTOs
- [ ] Know when to use a Repository vs direct data access or other patterns
- [ ] Apply best practices and avoid common pitfalls

---

## 🎯 Definition

The **Repository** is an enterprise pattern that mediates between the **domain layer** and the **data source**. It presents a **collection-like** interface for domain objects so that the rest of the application can load, add, remove, and query entities without knowing whether data comes from a database, a remote API, or in-memory storage. The domain talks in terms of domain objects; the Repository hides persistence details.

**Origin:**
- Martin Fowler, *Patterns of Enterprise Application Architecture* (PoEAA)
- Central in Domain-Driven Design (Eric Evans): “Repository represents all objects of a type as a conceptual set”
- Widely used in layered and hexagonal architectures

**Key Principle:**
> "A Repository mediates between the domain and data mapping layers, acting like an in-memory domain object collection. Client objects construct query criteria and submit them to the Repository. Objects can be added and removed as with a collection, and the Repository encapsulates the logic to get them to and from the data store."

---

## 🏗️ Core Concepts

### The Problem Without a Repository

```
┌─────────────────────────────────────────────────────────────────┐
│  WITHOUT REPOSITORY                                              │
│                                                                  │
│  Domain / Application Layer                                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  OrderService, InvoiceService, ...                        │   │
│  │  → SQL strings, table names, connection handling           │   │
│  │  → Tightly coupled to database schema and technology      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  Database (tables, SQL, ORM)                                     │
│                                                                  │
│  Problems:                                                       │
│  ❌ Domain knows about persistence (tables, SQL, connections)    │
│  ❌ Hard to test (need real DB or complex mocks)                │
│  ❌ Hard to switch or add data sources                          │
│  ❌ Query logic scattered across services                       │
└─────────────────────────────────────────────────────────────────┘
```

### The Solution: Repository as Mediator

```
┌─────────────────────────────────────────────────────────────────┐
│  WITH REPOSITORY                                                 │
│                                                                  │
│  Domain Layer                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  IOrderRepository (interface)                             │   │
│  │  findById(id), save(order), findPending(), ...             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  Application / Domain                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  OrderService uses IOrderRepository                      │   │
│  │  → "Get order by id", "Save order", "Find pending"        │   │
│  │  → No SQL, no table names                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  Infrastructure                                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  OrderRepositoryImpl implements IOrderRepository           │   │
│  │  → SQL, ORM, connection, mapping                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  Database / External API / File                                │
│                                                                  │
│  Benefits:                                                      │
│  ✅ Domain stays persistence-ignorant                           │
│  ✅ Testable with in-memory or fake repositories                │
│  ✅ One place to change persistence or add caching              │
│  ✅ Clear, domain-oriented API                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Collection-Like API

The Repository is used **as if** it were a collection of domain objects:

| Operation | Meaning |
|-----------|---------|
| **Get by id** | `findById(id)` – return one entity or null. |
| **Add** | `add(entity)` or `save(entity)` – register for persistence (often persisted when Unit of Work commits). |
| **Remove** | `remove(entity)` – mark for deletion. |
| **Query** | `findByStatus(...)`, `findAll()`, or a generic `find(criteria)` – return a list or stream of entities. |

The interface is expressed in **domain terms** (e.g. “find pending orders”), not in data terms (“SELECT * FROM orders WHERE status = 'pending'”).

### Interface in Domain, Implementation in Infrastructure

- **Repository interface** – Lives in the **domain** (or application) layer. Defines methods the domain needs. No references to databases, SQL, or ORM.
- **Repository implementation** – Lives in **infrastructure**. Implements the interface using a specific data source (SQL DB, NoSQL, REST, in-memory for tests).

This keeps the domain independent of persistence and makes testing and swapping implementations straightforward.

---

## 📦 Design Choices

### Per-Aggregate vs Generic Repositories

- **Per-aggregate (per-entity-type):** One interface per aggregate root, e.g. `IOrderRepository`, `IProductRepository`. Matches DDD and keeps the API focused.
- **Generic:** `IRepository<T>` with `findById`, `save`, `find(criteria)`. Less code duplication but weaker domain semantics; criteria often become generic (e.g. “where status = X”) instead of named methods like `findPendingOrders()`.

**Recommendation:** Prefer **per-aggregate** repositories with **domain-named methods** for clarity and testability.

### Query Methods: Named vs Specification vs Query Object

- **Named methods:** `findPendingOrders()`, `findByCustomerId(id)`. Simple and explicit; can grow many methods.
- **Specification (or criteria) object:** `find(specification)` where the specification encapsulates conditions. Flexible but more complex.
- **Query object / query DSL:** Pass a structured query from the application. Balance between expressiveness and complexity.

Start with **named methods**; introduce specifications or query objects when you have many overlapping criteria.

### Return Type: Entity vs DTO

- **Entity (domain object):** Repository returns the same object type the domain uses. Changes to the entity are tracked (with Unit of Work) and persisted on commit.
- **DTO / read model:** Repository can return a DTO or projection for read-only use cases (e.g. list views, reports). Keeps reads simple and can use a different store (CQRS-style).

Use **entities** for write paths and when the domain needs to change state; use **DTOs/projections** when you only need to display or report.

---

## 🔄 Relation to Other Patterns

| Pattern | Relationship |
|---------|---------------|
| **Unit of Work** | Tracks changes to entities loaded via Repositories and commits them in one transaction. Repository often registers with a Unit of Work instead of persisting immediately. |
| **Data Mapper** | Repository can **use** a Data Mapper (or ORM) to map between domain objects and the database. Repository is the facade; Mapper does the actual mapping. |
| **Active Record** | Active Record entities know how to save/load themselves. A Repository can wrap Active Record objects to provide a collection-like API and centralize queries. |
| **DTO** | Repository usually returns domain entities. When returning data for read-only views, it may return DTOs or projections. |
| **DDD** | In DDD, one Repository per aggregate root; it represents the whole aggregate as a conceptual collection and hides persistence. |

---

## 📊 When to Use a Repository

| Scenario | Use Repository? |
|----------|------------------|
| Layered or hexagonal app with a domain layer | ✅ Standard way to access aggregates. |
| Need to test domain without a real database | ✅ Swap in an in-memory or fake implementation. |
| Multiple data sources or possible migration | ✅ Change implementation without touching domain. |
| Rich domain model with clear aggregate roots | ✅ One repository per aggregate. |
| Simple CRUD app, no domain logic | ⚠️ Repository still helps testability; otherwise Table Data Gateway or Active Record may be enough. |
| Read-only reporting over raw SQL/views | ⚠️ Use a separate read model or query service; not necessarily the same Repository as for writes. |

---

## ⚠️ Common Pitfalls

1. **Repository doing business logic** – Repository should only coordinate loading/saving and simple queries. No validation, calculations, or workflow; that belongs in the domain or application layer.
2. **Leaking persistence into the interface** – Avoid methods like `findByTableColumn()` or parameters that are clearly database concepts. Keep the API in domain language.
3. **One huge generic repository** – Prefer one repository per aggregate with a focused API.
4. **Returning persistence types** – Return domain entities (or DTOs), not ORM entities or rows, so the domain stays independent.
5. **Saving inside every method** – With Unit of Work, repositories usually just register changes; the Unit of Work commits once. Avoid implicit save in every add/update unless that’s the chosen design.

---

## 🎯 Best Practices

1. **Interface in domain, implementation in infrastructure** – Domain depends only on the interface.
2. **One repository per aggregate root** – Align with DDD; keep each repository focused.
3. **Domain-named methods** – e.g. `findPendingOrders()`, not `findByStatus('pending')` in the public API.
4. **Return domain objects** – Not raw rows or ORM-specific types.
5. **Use with Unit of Work for writes** – So multiple changes are committed in one transaction.
6. **Keep queries in the repository** – Don’t scatter query logic in services; centralize in the repository implementation.

---

## 🔗 Related Patterns & Topics

| Topic | Relationship |
|-------|--------------|
| **Unit of Work** | Groups repository operations into a single transaction; typically used with Repository for writes. |
| **Data Mapper** | Repository can delegate mapping to a Data Mapper or ORM. |
| **Active Record** | Alternative: entity handles its own persistence; Repository can wrap it. |
| **DDD** | Repository is a tactical building block; one per aggregate root. |
| **DTO** | Use DTOs for read-only data returned by a repository when not returning domain entities. |

---

## 📝 Key Takeaways

1. **Repository** mediates between domain and data source and offers a **collection-like** API (get by id, add, remove, query).
2. **Interface** lives in the domain; **implementation** (SQL, ORM, API) lives in infrastructure so the domain stays **persistence-ignorant**.
3. Prefer **one repository per aggregate root** with **domain-named** methods.
4. **Unit of Work** often coordinates Repositories so multiple changes are committed in one transaction.
5. Repository **encapsulates** persistence and query logic; keep business logic in the domain and application layers.

---

**Date Created:** 2026-03-13  
**Pattern Type:** Enterprise Application (PoEAA) – Data Source  
**Difficulty:** Intermediate  
**Related:** Unit of Work, Data Mapper, Active Record, DDD, DTO
