# Pessimistic Offline Lock Pattern

## 📋 Learning Objectives

- [ ] Understand the Pessimistic Offline Lock pattern and why it locks up front
- [ ] Learn when preventing conflicts is better than detecting them later
- [ ] Master lock lifecycle: acquire -> work -> commit/rollback -> release
- [ ] Distinguish pessimistic locking from optimistic locking
- [ ] Relate pessimistic locking to Unit of Work, Repository, and transaction boundaries
- [ ] Apply best practices and avoid common pitfalls

---

## 🎯 Definition

The **Pessimistic Offline Lock** is an enterprise pattern that assumes conflicts may be **frequent or expensive** and prevents them by acquiring a lock before changes are made. While one user/process holds the lock for a business transaction, others are blocked from modifying the same business entity (or can only read it, depending on lock mode).

In PoEAA terms, it protects long-running business transactions by coordinating exclusive access so that conflicting updates do not happen at all.

**Origin:**
- Martin Fowler, *Patterns of Enterprise Application Architecture* (PoEAA)
- Used when conflict cost is high and retry/merge flows are not acceptable
- Common in financial, inventory, and workflow approval scenarios

**Key Principle:**
> "When conflict is likely or expensive, lock the record first so only one transaction can update it at a time."

**Alternative formulation:**
> "Prevent write conflicts up front by reserving the target entity for one editor/process until completion."

---

## 🏗️ Core Concepts

### Why "Pessimistic"?

"Pessimistic" means we assume concurrent edits are likely enough that waiting/retrying later is worse than locking now.

### Lock-Then-Work Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  PESSIMISTIC OFFLINE LOCK FLOW                                  │
│                                                                  │
│  1) Acquire lock for entity (e.g., Order 42)                    │
│  2) Read and edit while lock is held                            │
│  3) Commit changes in transaction                                │
│  4) Release lock                                                 │
│                                                                  │
│  If lock cannot be acquired:                                     │
│  - wait (with timeout), or                                       │
│  - fail fast / return "currently being edited"                   │
│                                                                  │
│  Result: conflicting writes are prevented, not just detected     │
└─────────────────────────────────────────────────────────────────┘
```

### What Can Be Locked?

| Lock target | Example |
|-------------|---------|
| **Row/entity lock** | Lock one order/customer record for update. |
| **Logical business lock** | Lock by business key (e.g., `invoiceNumber`, `accountId`) in an app-level lock table. |
| **Aggregate lock** | Lock root plus related set that must stay consistent. |

Depending on DB and architecture, lock can be database-native (`SELECT ... FOR UPDATE`) or application-managed (lock service/table).

### Lock Modes

| Mode | Behavior |
|------|----------|
| **Exclusive write lock** | Only lock owner can modify; others block or fail. |
| **Shared/read lock** | Multiple readers allowed, writers blocked. |
| **Upgrade path** | Start shared then upgrade to exclusive (can risk deadlock). |

Most PoEAA use cases focus on exclusive locks for write operations.

---

## 📦 Relation to Other Patterns

| Pattern | Relationship |
|---------|---------------|
| **Optimistic Offline Lock** | Alternative: no up-front lock; detect conflict at save time with version checks. Better when conflicts are rare. |
| **Unit of Work** | UoW can run inside acquired lock scope and commit/release at boundary. Ensure lock lifecycle aligns with transaction lifecycle. |
| **Repository** | Repository methods may acquire/release locks or expose lock-aware operations (e.g., `getForUpdate`). |
| **Server Session State** | When lock spans user interaction, session state can track lock ownership and lease metadata. |

---

## 📊 When to Use Pessimistic Offline Lock

| Scenario | Use Pessimistic Offline Lock? |
|----------|-------------------------------|
| Conflicts are common and costly | ✅ Prevents conflicting writes entirely. |
| Merge/retry UX is unacceptable | ✅ Better to block early than ask users to resolve conflicts later. |
| Critical records (financial/approval/inventory) | ✅ Strong concurrency control often required. |
| Long operations with low conflict probability | ⚠️ Optimistic lock may be more scalable. |
| High-throughput systems needing max concurrency | ⚠️ Locks can reduce throughput and increase wait times. |

---

## ⚠️ Common Pitfalls

1. **Holding locks too long** - Long lock windows increase contention and user wait times.
2. **Deadlocks** - Multiple transactions acquiring locks in different orders can deadlock.
3. **No timeout/lease** - Stale locks can block work indefinitely if owner crashes.
4. **Locking too broad a scope** - Overly coarse locks reduce concurrency unnecessarily.
5. **UI unaware of lock state** - Users need clear feedback when an item is locked by someone else.

---

## 🎯 Best Practices

1. **Keep lock scope minimal** - Lock only what must be protected.
2. **Use timeouts/leases** - Expire stale locks and support safe recovery.
3. **Acquire locks in consistent order** - Reduces deadlock risk.
4. **Provide lock-aware UX/API errors** - Return explicit lock conflict messages and owner/expiry info when appropriate.
5. **Measure contention** - Track lock wait time, timeout rate, and deadlocks; tune strategy accordingly.

---

## 🔗 Related Patterns & Topics

| Topic | Relationship |
|-------|--------------|
| **Optimistic Offline Lock** | Alternative strategy based on conflict detection at save time. |
| **Unit of Work** | Coordinates writes while lock is held; commit and release should be aligned. |
| **Server Session State** | Can hold lock ownership/session metadata in conversational workflows. |
| **Saga / Distributed Transactions** | Different concern; pessimistic lock handles concurrent edits on shared records, not cross-service transaction orchestration. |

---

## 📝 Key Takeaways

1. **Pessimistic Offline Lock** prevents conflicts by locking before edits begin.
2. Use it when conflicts are likely/costly and retry/merge flows are unacceptable.
3. Manage full lock lifecycle (acquire, timeout/lease, commit/rollback, release) carefully.
4. Compared to optimistic locking, pessimistic locking trades higher safety for lower concurrency.
5. Keep locks short and measurable; pair with clear user/API conflict handling.

---

**Date Created:** 2026-03-22  
**Pattern Type:** Enterprise Application (PoEAA) – Offline Concurrency  
**Difficulty:** Intermediate  
**Related:** Optimistic Offline Lock, Unit of Work, Repository, Server Session State
