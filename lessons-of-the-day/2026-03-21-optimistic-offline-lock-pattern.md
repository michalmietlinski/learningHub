# Optimistic Offline Lock Pattern

## 📋 Learning Objectives

- [ ] Understand the Optimistic Offline Lock pattern and what "offline" means in business transactions
- [ ] Learn how version checks prevent lost updates without long-lived DB locks
- [ ] Master conflict detection flow (read version -> modify -> compare-and-swap on save)
- [ ] Distinguish optimistic locking from pessimistic locking
- [ ] Relate optimistic locking to Unit of Work, Repository, and transaction boundaries
- [ ] Apply best practices and avoid common pitfalls

---

## 🎯 Definition

The **Optimistic Offline Lock** is an enterprise pattern that assumes conflicts are **rare** and allows concurrent users/processes to work on the same record without acquiring a long database lock. Instead of locking up front, the system detects conflicts at save time by checking whether the record changed since it was read.

The common mechanism is a **version field** (or timestamp/checksum): when saving, update succeeds only if the stored version equals the version originally read. If not, another transaction already changed the record, and the update is rejected as a conflict.

**Origin:**
- Martin Fowler, *Patterns of Enterprise Application Architecture* (PoEAA)
- Designed for long-running business transactions where holding DB locks for user think-time is impractical
- Common in web apps and APIs (ETag/If-Match semantics are similar)

**Key Principle:**
> "Let transactions proceed without locks, but verify on commit that nobody changed the data in the meantime. If they did, fail the write and resolve the conflict."

**Alternative formulation:**
> "Don't prevent concurrent edits up front; detect and handle write conflicts when persisting changes."

---

## 🏗️ Core Concepts

### Why "Offline"?

In PoEAA, "offline" refers to a **business transaction** that spans multiple system transactions:
- User loads data
- User thinks/edits (seconds or minutes)
- User submits save later

Keeping a DB lock across that whole period is not feasible. Optimistic Offline Lock protects consistency at save time.

### Conflict Detection Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  OPTIMISTIC OFFLINE LOCK FLOW                                   │
│                                                                  │
│  1) Read record: (id=42, amount=100, version=7)                 │
│  2) User/process modifies amount -> 120                          │
│  3) Save with condition: update ... where id=42 and version=7    │
│     - if 1 row updated: success; version increments to 8         │
│     - if 0 rows updated: conflict (someone changed it first)     │
│                                                                  │
│  Result: no long lock, but lost updates are prevented            │
└─────────────────────────────────────────────────────────────────┘
```

### Version Strategies

| Strategy | How it works |
|----------|---------------|
| **Integer version** | Increment integer on every successful update (`version = version + 1`). Most explicit and common. |
| **Timestamp** | Compare last-modified timestamp. Works, but clock precision and timezone issues can complicate edge cases. |
| **Hash/checksum** | Compare hash of relevant fields. Useful in some APIs, but more complex and less common than version integers. |

Integer version columns are usually the safest and easiest to reason about.

### What Happens on Conflict?

When save fails due to version mismatch:
- Return a **concurrency conflict** error
- Reload latest state
- Ask user to retry/reapply changes or perform merge
- Optionally provide diff info (what changed)

Do not silently overwrite newer data.

---

## 📦 Relation to Other Patterns

| Pattern | Relationship |
|---------|---------------|
| **Pessimistic Offline Lock** | Alternative approach: lock before editing to prevent conflicts rather than detect them later. Better when conflicts are frequent/costly. |
| **Unit of Work** | UoW can coordinate optimistic checks at commit for all modified entities and fail the whole commit if any version mismatch occurs. |
| **Repository** | Repository save/update methods often include version checks (e.g., update-by-id-and-version) and map DB mismatch to domain-level concurrency errors. |
| **Identity Map** | Identity Map ensures one in-memory instance per identity within a request/UoW; optimistic lock still needed across concurrent requests/users. |

---

## 📊 When to Use Optimistic Offline Lock

| Scenario | Use Optimistic Offline Lock? |
|----------|-------------------------------|
| Web/API edits where users can concurrently modify same records | ✅ Prevents lost updates without long-lived DB locks. |
| Long user think-time between read and save | ✅ Designed for this exact case. |
| Conflict rate is low to moderate | ✅ Optimistic strategy is efficient when retries are rare. |
| Conflict rate is high and merge/retry is costly | ⚠️ Consider Pessimistic Offline Lock or redesigned workflow. |
| Critical operation where "first writer wins" is unacceptable but retries are okay | ✅ Good fit with clear conflict UX. |

---

## ⚠️ Common Pitfalls

1. **No version check on update** - If update ignores version, you still get lost updates.
2. **Swallowing conflicts** - Returning generic errors hides concurrency issues; surface conflict explicitly.
3. **Partial optimistic checks** - If only some tables/entities are version-checked, consistency holes remain.
4. **Auto-retrying blindly** - Repeating failed writes without reloading/merging can still lose intent.
5. **Incorrect conflict UX** - Users need clear message and resolution path (reload, merge, retry).

---

## 🎯 Best Practices

1. **Use explicit version column** - Integer `version` updated atomically in write condition.
2. **Check rows affected** - If update-by-id-and-version affects 0 rows, treat as conflict.
3. **Map to domain error** - Expose a clear concurrency error type, not low-level SQL details.
4. **Handle at use-case boundary** - Application/service layer decides retry, merge, or user feedback.
5. **Test concurrency paths** - Add tests for concurrent updates and expected conflict handling.

---

## 🔗 Related Patterns & Topics

| Topic | Relationship |
|-------|--------------|
| **Pessimistic Offline Lock** | Alternative with up-front locking when conflicts are frequent or expensive. |
| **Unit of Work** | Coordinates optimistic checks for multiple modified entities in one commit. |
| **Repository** | Implements compare-and-swap update semantics behind domain API. |
| **Distributed Transactions / Saga** | Different scope: optimistic lock handles single-record/aggregate concurrency, not cross-service transaction coordination. |

---

## 📝 Key Takeaways

1. **Optimistic Offline Lock** avoids long-lived locks and detects conflicts at save time.
2. Use **version-based compare-and-swap** (`WHERE id=? AND version=?`) to prevent lost updates.
3. Conflict means someone changed data first; return clear error and resolve by reload/merge/retry.
4. Best when conflict probability is relatively low and long-running edits are common.
5. Combine with Repository/Unit of Work to keep concurrency handling consistent across writes.

---

**Date Created:** 2026-03-21  
**Pattern Type:** Enterprise Application (PoEAA) – Offline Concurrency  
**Difficulty:** Intermediate  
**Related:** Pessimistic Offline Lock, Unit of Work, Repository, Identity Map
