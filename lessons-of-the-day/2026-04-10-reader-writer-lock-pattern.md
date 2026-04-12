# Reader–Writer Lock Pattern

## 📋 Learning Objectives

- [ ] Understand the readers–writers problem and why naive locking hurts throughput
- [ ] Learn how reader–writer locks allow concurrent reads but exclusive writes
- [ ] Know when they help and when simpler locks suffice
- [ ] Recognize pitfalls (writer starvation, lock reentrancy, deadlocks)
- [ ] Relate the pattern to databases and concurrent data structures

---

## 🎯 Definition

A **reader–writer lock** (shared–exclusive lock) allows:

- **Multiple concurrent readers** when no writer holds the lock.
- **Exclusive access for writers** — when a writer is active, **no** concurrent readers or other writers.

**Problem it solves:** A simple **mutex** around a read-heavy shared resource forces **one reader at a time**, wasting parallelism. RW locks optimize the common case: **many readers, rare writers**.

---

## 🧭 Core Concepts

### 1) Shared vs exclusive modes

| Mode | Also called | Holds when |
|------|-------------|------------|
| Read | Shared | Many readers OK together |
| Write | Exclusive | One writer only; blocks all readers |

### 2) Typical API (names vary)

- `readLock().lock()` / `unlock()`
- `writeLock().lock()` / `unlock()`

### 3) Writer starvation

If readers keep arriving, writers may **wait indefinitely** on some implementations. Good implementations use **fairness** policies or **writer-priority** options.

### 4) Reentrancy

Some locks allow the **same thread** to acquire the same lock again (reentrant). Rules differ for read vs write reentrancy—**check your library**.

---

## 📊 When to Use Reader–Writer Locks

| Situation | Use RW lock? |
|-----------|----------------|
| Read-heavy shared data (config cache, lookup tables) | ✅ Often |
| Writes as frequent as reads | ⚠️ May behave like a mutex; measure |
| Very short critical sections | ⚠️ Simple mutex may be faster (less overhead) |
| Single-threaded async (JS) | ❌ Not applicable (no shared-memory threading model) |

**Note:** In **JavaScript**, you typically don’t use RW locks in application code—**single-threaded event loop**. The pattern matters for **JVM, .NET, C++, Go**, etc.

---

## ⚠️ Common Pitfalls

1. **Holding read lock while calling something that upgrades to write** — can **deadlock** if not supported (upgradeable locks are special).

2. **Long read critical sections** — block writers and increase latency for updates.

3. **Assuming fairness** — verify policy if writers must not starve.

4. **Nested locks** — ordering mistakes → deadlock.

5. **Using RW lock for tiny data** — overhead may exceed benefit.

---

## 🎯 Best Practices

1. **Keep critical sections short** for both read and write paths.

2. **Prefer immutable snapshots** for reads when possible—**no lock** for read path.

3. **Document upgrade rules** if your API supports read→write upgrade.

4. **Profile** under real contention; sometimes `Mutex` wins.

5. **In databases**, isolation levels and row/table locks realize similar **read/write** tradeoffs.

---

## 💻 Sketch (Java-style pseudocode)

```java
ReadWriteLock rw = new ReentrantReadWriteLock();

void readData() {
  rw.readLock().lock();
  try {
    // many threads can enter here concurrently
    return cache.get(key);
  } finally {
    rw.readLock().unlock();
  }
}

void writeData(Value v) {
  rw.writeLock().lock();
  try {
    cache.put(key, v);
  } finally {
    rw.writeLock().unlock();
  }
}
```

---

## 🔗 Related Topics

| Topic | Relationship |
|-------|--------------|
| Mutex / monitor | Exclusive-only variant |
| Database isolation | Readers/writers at storage layer |
| Copy-on-write | Alternative: readers see immutable version |
| ConcurrentHashMap | Lock striping / finer granularity |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks

1. Compare throughput: mutex vs RW lock for 99% reads (conceptually or with a small benchmark in JVM/C#).
2. Explain writer starvation and one policy that mitigates it.
3. Why is RW lock rarely discussed in browser JavaScript?

### Interview questions

1. What is the readers–writers problem?
2. When does an RW lock not beat a mutex?
3. What is lock upgrade and why is it dangerous?
4. How do databases relate to reader–writer contention?

---

## 📝 Key Takeaways

1. Reader–writer locks increase **parallelism for read-heavy** workloads.
2. **Writers are exclusive**; readers are **shared**—rules must be enforced strictly.
3. **Starvation and upgrade deadlocks** are real risks—know your implementation.
4. **Measure**—not every workload benefits.
5. **JS single-thread model** uses different concurrency idioms; RW locks matter in **multi-threaded** runtimes.

---

**Date Created:** 2026-04-10  
**Topic Type:** Concurrency Patterns  
**Difficulty:** Intermediate  
**Related:** Mutex, Thread safety, Database isolation, Immutable data
