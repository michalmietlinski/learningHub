# Lazy Load Pattern

## 📋 Learning Objectives

- [ ] Understand the Lazy Load pattern and why deferring loading can help
- [ ] Learn when to load related data only on first access (lazy) vs up front (eager)
- [ ] Master common variants: lazy initialization, virtual proxy, value holder, ghost
- [ ] Relate Lazy Load to Identity Map, Data Mapper, and Unit of Work
- [ ] Know the N+1 problem and how to avoid or mitigate it
- [ ] Apply best practices and avoid common pitfalls

---

## 🎯 Definition

**Lazy Load** is an enterprise pattern that **defers loading** of a related object or collection until it is **first accessed**. Instead of loading the whole object graph when the parent is loaded, the parent holds a placeholder or reference; when the application asks for the related data (e.g. order.getCustomer()), the loader runs and fetches it at that moment. This can reduce initial load time and memory when only part of the graph is needed.

**Origin:**
- Martin Fowler, *Patterns of Enterprise Application Architecture* (PoEAA)
- Common in ORMs (e.g. Hibernate lazy associations, Entity Framework lazy loading)
- Often used with Identity Map so lazily loaded entities are the same instances as elsewhere

**Key Principle:**
> "An object that doesn't contain all of the data you need but knows how to get it. When you need data that isn't loaded, the object loads it from the database (or another source) and then provides it."

**Alternative formulation:**
> "Don't load related data until someone actually uses it. The parent object holds a reference that, on first access, triggers a load and then returns the real object or collection."

---

## 🏗️ Core Concepts

### The Idea

```
┌─────────────────────────────────────────────────────────────────┐
│  LAZY LOAD                                                       │
│                                                                  │
│  Load Order (without customer and line items):                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Order                                                    │   │
│  │  – id, total, status (loaded)                             │   │
│  │  – customer  →  not loaded yet (lazy reference)           │   │
│  │  – lineItems →  not loaded yet (lazy collection)           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  First access: order.getCustomer()                               │
│  → loader runs → fetch customer from DB → return Customer        │
│  → (optionally store in Identity Map)                            │
│                                                                  │
│  First access: order.getLineItems()                               │
│  → loader runs → fetch line items → return collection            │
│                                                                  │
│  Benefit: if the use case only needs order fields, we never      │
│  hit the DB for customer or line items.                          │
└─────────────────────────────────────────────────────────────────┘
```

### When It Helps

- **Large graphs** – Load the root entity; load related entities only when the code path needs them.
- **Optional relationships** – Many operations don't need the related object; lazy avoids loading it every time.
- **Reduced initial cost** – One query for the parent instead of JOINs or multiple queries up front.

### When It Hurts

- **N+1 queries** – If you iterate over N parents and access a lazy relation on each, you do 1 + N queries (one for the list, N for each relation). Can be mitigated by eager loading when you know you need the relation, or batch loading.
- **Unexpected DB access** – Accessing a property can trigger a load; if the persistence context is closed or not available (e.g. after serialization, or in a different layer), you get errors or stale data.
- **Transaction and scope** – Lazy load usually runs inside a transaction or session; holding entities and accessing lazy data outside that scope is a common bug.

---

## 📦 Common Variants

| Variant | Description |
|---------|-------------|
| **Lazy initialization** | The field is null (or empty); on first get, load from DB, assign to the field, return it. Subsequent gets return the cached value. |
| **Virtual proxy** | The field holds a proxy object that looks like the real entity. When any method or property is used, the proxy loads the real object and delegates. |
| **Value holder** | The field holds a small "value holder" object. When the holder's value is requested, it loads the real object and caches it. |
| **Ghost** | The object is partially loaded (e.g. only id). When any property other than id is read, the ghost loads the rest of its data from the DB. |

All share the same idea: **don't load until first access**.

---

## 📦 Relation to Other Patterns

| Pattern | Relationship |
|---------|---------------|
| **Identity Map** | When the lazy loader loads an entity, it should put it in the Identity Map (or load through a layer that uses the map) so the same entity is not loaded twice and references are consistent. |
| **Data Mapper** | The mapper (or ORM) typically implements lazy loading: it injects a proxy or lazy reference and knows how to load the real data when accessed. |
| **Unit of Work** | Lazy load usually runs in the context of a Unit of Work or session so that the load has a valid connection and transaction, and so loaded entities are tracked. |
| **Repository** | Repository can return entities with lazy references; the repository or the persistence layer is responsible for configuring what is lazy vs eager. |

---

## 📊 When to Use Lazy Load

| Scenario | Use Lazy Load? |
|----------|----------------|
| Large object graph; many use cases need only the root or a subset | ✅ Load related data only when the code path needs it. |
| Optional or rarely used relationship | ✅ Avoid loading it on every parent load. |
| ORM or persistence layer supports it and scope is clear | ✅ Use with Identity Map and within one transaction/request. |
| You know you will need the relation for every use case (e.g. always show order + lines) | ⚠️ Prefer eager load for that query to avoid N+1. |
| Serializing entities or passing them outside the persistence context | ❌ Lazy load can fail or cause unexpected DB access; use DTOs or eager load for that boundary. |
| Reporting or batch processing over many entities | ⚠️ Prefer explicit eager or batch loading; lazy in a loop causes N+1. |

---

## ⚠️ Common Pitfalls

1. **N+1 queries** – Looping over N entities and touching a lazy property on each triggers N extra queries. Fix: eager load that relation for the query, or batch load by ids.
2. **Accessing lazy data outside session/transaction** – Once the Unit of Work or session is closed, lazy load may throw or return stale data. Don't pass entities with unloaded lazy refs to layers that don't have a persistence context; load or project before leaving the persistence boundary.
3. **Over-relying on lazy everywhere** – Not every relation should be lazy. If 90% of use cases need the relation, eager load it and avoid N+1 and complexity.
4. **Testing and mocking** – Lazy loading can make tests depend on the DB or on proxy behavior. For unit tests, use entities with relations already set (or mocks) so you don't trigger real loads.
5. **Circular or deep graphs** – Lazy loading in both directions (e.g. order→customer, customer→orders) can lead to loading more than intended when traversing. Define clear boundaries (e.g. aggregate) and load what you need.

---

## 🎯 Best Practices

1. **Use with Identity Map** – So lazily loaded entities are the same instances as when loaded by id elsewhere; avoids duplicates and keeps consistency.
2. **Eager load when you know you need it** – For a use case that always needs order + line items, use a single query (or explicit eager load) instead of lazy so you don't get N+1.
3. **Limit scope** – Lazy load within one transaction or request; don't pass entities with unloaded lazy refs across boundaries (e.g. to API response); map to DTOs or load before leaving.
4. **Make lazy vs eager explicit in the API** – Repositories or query methods can expose "getOrderWithLines" (eager) vs "getOrder" (lazy), so callers know what they get.
5. **Document or configure** – Document which relations are lazy so developers don't trigger N+1 by accident; or configure per-relation in the ORM.

---

## 🔗 Related Patterns & Topics

| Topic | Relationship |
|-------|--------------|
| **Identity Map** | Lazy loader should load through the same persistence layer that uses the Identity Map. |
| **Data Mapper** | Implements lazy loading via proxies or lazy references. |
| **Unit of Work** | Lazy load runs inside the UoW/session; entities are tracked. |
| **Repository** | Can return entities with lazy relations; or offer explicit methods for eager loading. |

---

## 📝 Key Takeaways

1. **Lazy Load** defers loading of a related object or collection until **first access**, which can reduce initial load and memory when only part of the graph is needed.
2. **Variants**: lazy initialization, virtual proxy, value holder, ghost—all "load on first use."
3. **N+1 risk**: iterating over N parents and accessing a lazy relation does 1 + N queries; use eager or batch load when you know you need the relation.
4. **Scope**: use lazy within one transaction/request; don't pass entities with unloaded lazy refs across persistence boundaries—load or map to DTOs first.
5. **Combine with Identity Map** so lazily loaded entities are the same instances as elsewhere; configure or document what is lazy vs eager to avoid surprises.

---

**Date Created:** 2026-03-18  
**Pattern Type:** Enterprise Application (PoEAA) – Behavioral (Object-Relational)  
**Difficulty:** Intermediate  
**Related:** Identity Map, Data Mapper, Unit of Work, Repository
