# Unit of Work Pattern

## 📋 Learning Objectives

- [ ] Understand the Unit of Work pattern and its role in coordinating writes
- [ ] Learn why grouping changes into one transaction matters
- [ ] Master tracking new, modified, and removed entities
- [ ] Relate Unit of Work to Repository and to database transactions
- [ ] Know when to use Unit of Work vs per-call commits
- [ ] Apply best practices and avoid common pitfalls

---

## 🎯 Definition

The **Unit of Work** is an enterprise pattern that maintains a **list of objects affected by a business transaction** and coordinates the **writing out of changes** so that all modifications are persisted in a **single database transaction**. The application loads and changes entities through Repositories; the Unit of Work tracks which entities are new, modified, or removed and commits (or rolls back) them together.

**Origin:**
- Martin Fowler, *Patterns of Enterprise Application Architecture* (PoEAA)
- Often used with Repository and Data Mapper
- Many ORMs implement the idea (e.g. DbContext in Entity Framework, Session in NHibernate)

**Key Principle:**
> "Maintain a list of objects affected by a business transaction and coordinate the writing out of changes and the resolution of concurrency problems. When you're pulling data in and out of a database, it's important to keep track of what you've changed; otherwise, that data won't be written back out to the database. Similarly you have to insert new objects you create and remove any you delete."

---

## 🏗️ Core Concepts

### The Problem Without a Unit of Work

```
┌─────────────────────────────────────────────────────────────────┐
│  WITHOUT UNIT OF WORK                                            │
│                                                                  │
│  Application: "Update order and create invoice"                 │
│                                                                  │
│  Step 1: orderRepository.save(order)     → COMMIT               │
│  Step 2: invoiceRepository.add(invoice)  → COMMIT                │
│                                                                  │
│  If Step 2 fails:                                                │
│  ❌ Order is already committed; invoice never created             │
│  ❌ Data left inconsistent (order updated, no invoice)           │
│  ❌ No single rollback for the whole operation                   │
│                                                                  │
│  Or: many small transactions → harder to reason about            │
│      consistency and performance                                 │
└─────────────────────────────────────────────────────────────────┘
```

### The Solution: One Logical Transaction

```
┌─────────────────────────────────────────────────────────────────┐
│  WITH UNIT OF WORK                                               │
│                                                                  │
│  Application:                                                    │
│    1. Begin Unit of Work (or receive from context)               │
│    2. Load order via orderRepository → UoW tracks it             │
│    3. Change order (e.g. set status)                             │
│    4. Create invoice; invoiceRepository.add(invoice) → UoW      │
│       tracks new entity                                          │
│    5. unitOfWork.commit()                                        │
│       → Single database transaction                              │
│       → All inserts/updates/deletes applied                       │
│       → Commit or rollback as one                                │
│                                                                  │
│  If anything fails before commit:                                │
│  ✅ Roll back the whole transaction                              │
│  ✅ No partial writes; consistency preserved                     │
└─────────────────────────────────────────────────────────────────┘
```

### What the Unit of Work Tracks

| Category | Meaning |
|----------|---------|
| **New** | Entities created in this unit of work; must be inserted. |
| **Dirty (modified)** | Entities loaded and then changed; must be updated. |
| **Removed** | Entities marked for deletion; must be deleted. |

The Unit of Work keeps lists (or equivalent) of these objects. On **commit**, it flushes all changes to the database inside one transaction. On **rollback** (or dispose without commit), it discards the transaction and does not persist changes.

### Typical API

- **Register new** – When the application creates an entity and adds it via a repository, the repository (or the application) registers it with the Unit of Work as “new”.
- **Register dirty** – When an entity is loaded through a repository that uses the Unit of Work, changes to that entity are tracked (e.g. by identity map or change tracking). No need to call “update” explicitly; the Unit of Work detects modifications.
- **Register removed** – When the application removes an entity via a repository, the Unit of Work marks it for deletion.
- **Commit** – Open a transaction, execute all inserts/updates/deletes, commit the transaction, then clear the tracked lists.
- **Rollback / Abort** – Discard the transaction and clear the tracked lists.

---

## 📦 Relation to Repository and Transaction

- **Repositories** load and register entities with the Unit of Work. They do not open or commit transactions; they hand off to the Unit of Work. Same Unit of Work instance is shared by all repositories involved in one logical operation.
- **Unit of Work** owns the **transaction boundary**. It starts the transaction (or receives it), coordinates all writes, and commits or rolls back once.
- **One Unit of Work per use case or request** – Typical: create the Unit of Work at the start of the operation (e.g. request or application service call), inject it into repositories, perform domain work, then call commit at the end. If an exception occurs, roll back (or do not commit).

---

## 🔄 Relation to Other Patterns

| Pattern | Relationship |
|---------|---------------|
| **Repository** | Repositories work with the Unit of Work: they register new/dirty/removed entities instead of persisting immediately. The Unit of Work commits all repositories’ changes in one transaction. |
| **Data Mapper** | Unit of Work often uses a Data Mapper (or ORM) to perform the actual inserts/updates/deletes when committing. The UoW decides *what* to write; the mapper does *how*. |
| **Identity Map** | Unit of Work often maintains an Identity Map so the same entity is not loaded twice and changes are tracked per identity. |
| **Transaction Script** | Alternative: no Unit of Work; each script opens a transaction, does its work, and commits. UoW is useful when you have a rich domain and multiple entities changing in one operation. |

---

## 📊 When to Use a Unit of Work

| Scenario | Use Unit of Work? |
|----------|-------------------|
| Multiple entities changed in one business operation | ✅ Ensures one transaction and consistent commit/rollback. |
| Using Repositories (or similar) for writes | ✅ Natural fit; UoW coordinates repositories. |
| Rich domain with many potential changes per request | ✅ Track all changes and flush once. |
| Need clear transaction boundary per use case | ✅ One UoW per operation, one commit. |
| Simple single-entity updates, one per request | ⚠️ Can use a single transaction without a formal UoW; still consistent. |
| Read-only operations | ❌ No writes to coordinate; no UoW needed. |
| Distributed transaction across services | ❌ UoW is for one database; use Saga or outbox for cross-service. |

---

## ⚠️ Common Pitfalls

1. **Multiple commits inside one logical operation** – Avoid committing after each repository call; that breaks the “one transaction” guarantee. Commit once at the end of the unit of work.
2. **Unit of Work spanning multiple requests** – Keep one Unit of Work per logical business transaction (e.g. one per HTTP request or application service call). Do not reuse across requests.
3. **Forgetting to commit or roll back** – Ensure every code path either commits or rolls back (or disposes without commit). Use try/finally or similar so failures do not leave transactions open.
4. **Mixing units of work** – Repositories must use the same Unit of Work instance for one operation. If each repository creates its own transaction, you lose the single-transaction guarantee.
5. **Loading data outside the Unit of Work** – Entities that are changed should be loaded through repositories that participate in the same Unit of Work so their changes are tracked.

---

## 🎯 Best Practices

1. **One Unit of Work per business transaction** – Align scope with one use case, request, or application service call.
2. **Inject the same Unit of Work into all repositories** for that operation so they share one transaction.
3. **Commit once** at the end of the operation; roll back (or do not commit) on failure.
4. **Do not hold the Unit of Work open** across async boundaries or multiple user interactions; keep it short-lived.
5. **Combine with Identity Map** when the same entity can be loaded more than once so you have one in-memory instance per identity and consistent change tracking.

---

## 🔗 Related Patterns & Topics

| Topic | Relationship |
|-------|--------------|
| **Repository** | Repositories register changes with the Unit of Work; UoW commits them in one transaction. |
| **Data Mapper** | UoW typically uses a Data Mapper or ORM to execute the actual SQL on commit. |
| **Identity Map** | Often used inside the UoW to ensure one instance per entity identity and to detect dirty entities. |
| **ACID / Transactions** | Unit of Work implements a single transactional boundary; relies on the database’s ACID guarantees. |

---

## 📝 Key Takeaways

1. **Unit of Work** groups all changes (new, modified, removed) for one business operation and **persists them in a single database transaction**.
2. It **tracks** which entities are new, dirty, or removed and **commits or rolls back** them together.
3. **Repositories** work with the same Unit of Work so that multiple repositories’ changes are committed in one transaction.
4. **One Unit of Work per logical operation** (e.g. per request); commit once at the end, roll back on failure.
5. Unit of Work is the **transaction coordinator** for the domain and repositories; it does not replace the database transaction, it uses it.

---

**Date Created:** 2026-03-14  
**Pattern Type:** Enterprise Application (PoEAA) – Behavioral (Object-Relational)  
**Difficulty:** Intermediate  
**Related:** Repository, Data Mapper, Identity Map, ACID Transactions
