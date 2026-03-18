# Identity Map Pattern

## 📋 Learning Objectives

- [ ] Understand the Identity Map pattern and why one instance per identity matters
- [ ] Learn how the map ensures repeated loads return the same in-memory object
- [ ] Master scope: per request, per session, or per Unit of Work
- [ ] Relate Identity Map to Unit of Work, Data Mapper, and Repository
- [ ] Know when to use it (object graphs, change tracking, consistency) vs when it’s unnecessary
- [ ] Apply best practices and avoid common pitfalls

---

## 🎯 Definition

The **Identity Map** is an enterprise pattern that ensures each **entity (identified by type and id)** is loaded **at most once** within a given scope (e.g. one request, one Unit of Work, or one session). When the application asks for an entity by id a second time, the Identity Map returns the **same in-memory instance** instead of hitting the database again and creating a duplicate object. This prevents duplicate objects for the same logical entity and keeps in-memory state consistent.

**Origin:**
- Martin Fowler, *Patterns of Enterprise Application Architecture* (PoEAA)
- Commonly implemented inside ORMs (e.g. Hibernate Session, Entity Framework DbContext) and Repository/Data Mapper stacks
- Works with Unit of Work for change tracking and with Data Mapper for loading

**Key Principle:**
> "Keeps a record of all objects that have been read from the database in a single business transaction. Whenever you want an object, you look in the Identity Map first to see if you already have it. If you have it, return it; if not, load it and add it to the map."

**Alternative formulation:**
> "One identity (e.g. Order id 123) → one in-memory object per scope. No two instances represent the same entity in the same transaction or request."

---

## 🏗️ Core Concepts

### The Problem Without an Identity Map

```
┌─────────────────────────────────────────────────────────────────┐
│  WITHOUT IDENTITY MAP                                            │
│                                                                  │
│  Request: load Order 123, then load Order 123 again (e.g. via   │
│           a reference from another entity)                       │
│                                                                  │
│  First load:   repository.findById(123)  →  Order A (in memory) │
│  Second load: repository.findById(123)   →  Order B (new load!) │
│                                                                  │
│  Problems:                                                       │
│  ❌ Two in-memory objects for the same entity                    │
│  ❌ Changes to Order A are not visible when using Order B        │
│  ❌ Which one gets saved? Risk of overwriting or confusion       │
│  ❌ Extra database round-trips                                  │
└─────────────────────────────────────────────────────────────────┘
```

### The Solution: One Instance per Identity

```
┌─────────────────────────────────────────────────────────────────┐
│  WITH IDENTITY MAP                                               │
│                                                                  │
│  Identity Map (e.g. key = type + id)                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  (Order, 123)  →  Order instance A                        │   │
│  │  (Order, 456)  →  Order instance B                        │   │
│  │  (Customer, 101) → Customer instance C                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  First load:   findById(123)  →  not in map → load from DB       │
│               → put (Order, 123) → instance A; return A         │
│  Second load: findById(123)  →  found (Order, 123) → return A    │
│               (no DB call; same instance)                        │
│                                                                  │
│  Benefits:                                                       │
│  ✅ One instance per entity identity                             │
│  ✅ Consistent state: everyone sees the same object              │
│  ✅ Change tracking (e.g. for Unit of Work) works correctly      │
│  ✅ Fewer database reads                                         │
└─────────────────────────────────────────────────────────────────┘
```

### What the Map Stores

- **Key** – Usually (entity type, id) or a composite key that uniquely identifies the entity. Some implementations use only id if the scope is per-entity-type.
- **Value** – The in-memory domain object (or a reference to it).

When loading by id, the Repository or Data Mapper checks the Identity Map first. If the key is present, return the stored instance. If not, load from the database, put the instance in the map, then return it.

### Scope

| Scope | When the map is cleared | Typical use |
|-------|--------------------------|-------------|
| **Per Unit of Work** | When the Unit of Work is committed or discarded | One map per transaction; all repositories in that UoW share it. |
| **Per request** | At the end of the HTTP request (or similar) | Web apps: one map per request. |
| **Per session** | When the session ends or is cleared | Long-lived session (e.g. desktop app, stateful server). |

Scope determines how long “same identity = same instance” holds. Too long a scope can lead to stale data if the database changes elsewhere; too short and you lose the benefit within a single logical operation.

---

## 📦 Relation to Other Patterns

| Pattern | Relationship |
|---------|---------------|
| **Unit of Work** | The Unit of Work often **owns** or **uses** an Identity Map. It tracks loaded entities so it knows what is dirty and so repeated loads return the same instance. When the UoW commits or rolls back, the map is cleared (or the UoW is disposed). |
| **Data Mapper** | When the mapper loads an entity, it checks the Identity Map first. If found, return that instance (and optionally refresh from DB if needed). If not found, load from DB and add to the map. |
| **Repository** | Repository implementations that use a Unit of Work or a shared session will typically go through an Identity Map when loading by id, so the map is transparent to the application. |
| **Lazy Load** | When a lazy reference is resolved (e.g. order.getCustomer()), the loader should use the same Identity Map so the loaded customer is the same instance as elsewhere. |

---

## 📊 When to Use an Identity Map

| Scenario | Use Identity Map? |
|----------|-------------------|
| Loading the same entity by id more than once in one transaction or request | ✅ Avoids duplicates and ensures consistent state. |
| Unit of Work or change-tracking over domain objects | ✅ UoW must see one instance per identity to track changes correctly. |
| Object graph with shared references (e.g. two orders reference the same customer) | ✅ Both references point to the same customer instance. |
| ORM or Repository that loads entities by id | ✅ Standard in most ORMs; implement when building your own persistence layer. |
| Stateless, single-call APIs with no shared scope | ⚠️ Less benefit; each call may have its own map for that call only. |
| Read-only batch job, no object graph | ⚠️ May still help avoid duplicate loads; scope can be per batch. |

---

## ⚠️ Common Pitfalls

1. **Map shared across requests or transactions** – If the map is not cleared between requests, one request can see another request’s entities (stale or wrong data, concurrency bugs). Keep scope to one Unit of Work or one request.
2. **Different identity keys for the same entity** – Key must be consistent (e.g. always type+id). If sometimes you use id only and sometimes type+id, you can get two instances for the same row.
3. **Stale data** – Within a transaction, the map prevents reloading from DB. If you need to refresh (e.g. after a concurrent update), you need a way to evict or reload from the map; otherwise you may serve outdated state.
4. **Memory growth** – Long-lived scope with many loaded entities can grow the map. Clear when the unit of work or request ends; avoid keeping a global map forever.
5. **Bypassing the map** – If some code path loads via raw SQL or a different repository that doesn’t use the map, you can still get duplicate instances. Ensure all load-by-id paths go through the same Identity Map.

---

## 🎯 Best Practices

1. **One Identity Map per Unit of Work (or per request)** – Clear when the UoW commits or is discarded so the next transaction starts clean.
2. **Consistent key** – Use (type, id) or a well-defined composite key so the same entity always maps to the same key.
3. **Use with Unit of Work and Data Mapper** – Repository or mapper checks the map on load and registers in the map when loading from DB.
4. **Consider refresh/evict** – When you need to reload from DB (e.g. optimistic concurrency), support evicting an entity from the map or refreshing it so the next load gets fresh data.
5. **Don’t expose the map to the domain** – The domain uses Repository or services; the Identity Map is an implementation detail of the persistence layer.

---

## 🔗 Related Patterns & Topics

| Topic | Relationship |
|-------|--------------|
| **Unit of Work** | Often owns or uses the Identity Map; clears it on commit/rollback. |
| **Data Mapper** | Consults the map before loading; adds to the map after loading from DB. |
| **Repository** | Repository implementation uses the map when loading by id. |
| **Lazy Load** | Lazy loader should use the same Identity Map when resolving references. |

---

## 📝 Key Takeaways

1. **Identity Map** ensures **one in-memory instance per entity identity** (e.g. per type + id) within a given scope.
2. **Repeated loads** of the same id return the **same object**; no duplicate instances and no extra DB round-trips for that id.
3. **Scope** is usually per Unit of Work or per request; clear the map when the scope ends so the next transaction doesn’t see stale objects.
4. **Unit of Work** and **Data Mapper** use the Identity Map so change tracking and object graphs stay consistent.
5. Keep the map **behind** Repository and mapper; the domain does not depend on the Identity Map directly.

---

**Date Created:** 2026-03-17  
**Pattern Type:** Enterprise Application (PoEAA) – Behavioral (Object-Relational)  
**Difficulty:** Intermediate  
**Related:** Unit of Work, Data Mapper, Repository, Lazy Load
