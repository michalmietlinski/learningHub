# Async / Await Patterns

## 📋 Learning Objectives

- [ ] Understand how `async`/`await` relates to Promises and futures
- [ ] Write readable asynchronous control flow without callback pyramids
- [ ] Use `try/catch` for async errors and know when errors propagate
- [ ] Recognize pitfalls (sequential by accident, blocking async, lost parallelism)
- [ ] Apply patterns for parallelism, retries, and timeouts

---

## 🎯 Definition

**`async`/`await`** is **syntactic sugar** over Promise-based (or `Future`-based) asynchronous code in languages like **JavaScript/TypeScript**, **C#**, **Python (`async`/`await`)**, and others.

- **`async` function** — returns a Promise (JS/TS) or Task (C#) / coroutine (Python).
- **`await`** — pauses the **async function** until the awaited value settles, **without blocking the thread** (in typical runtimes).

Mental model:

```text
await = "unwrap the Promise in a readable, linear style"
```

The **underlying** mechanism is still **callbacks / continuations** scheduled on the event loop or task scheduler.

---

## 🧭 Core Concepts

### 1) Async functions return Promises

```ts
async function f(): Promise<number> {
  return 1; // same as Promise.resolve(1)
}
```

Callers can `await f()` or use `.then`.

### 2) try/catch with await

```ts
async function safe(): Promise<void> {
  try {
    await mightFail();
  } catch (e) {
    // rejected Promise becomes thrown exception in async function
    console.error(e);
  }
}
```

This unifies **sync-style** error handling for async code.

### 3) Sequential vs parallel

**Sequential (slow if independent):**

```ts
const a = await fetchA();
const b = await fetchB();
```

**Parallel (when independent):**

```ts
const [a, b] = await Promise.all([fetchA(), fetchB()]);
```

### 4) Top-level await

Some environments allow **top-level `await`** in modules—useful for scripts; know your runtime.

---

## 📊 When Async/Await Helps

| Situation | Use async/await? |
|-----------|-------------------|
| Linear async workflows (fetch → parse → save) | ✅ |
| Error handling with try/catch | ✅ |
| Mixing several independent async calls | ✅ with `Promise.all` |
| Hot loops with millions of iterations | ⚠️ profile; may need different approach |
| Lowest-level callback APIs | ⚠️ wrap in Promise first |

---

## ⚠️ Common Pitfalls

1. **Forgetting `await`**
   - You get a Promise instead of a value; bugs are subtle.

2. **Sequential `await` in a loop** (`for` + `await`) when tasks could run in parallel
   - Fix: `Promise.all(array.map(...))` or appropriate batching.

3. **async function that doesn’t await**
   - “Fire and forget”; errors may become unhandled rejections.

4. **Blocking the event loop** with CPU-heavy sync work inside async function
   - `async` does not move CPU work off-thread in JS.

5. **Over-asyncing trivial sync code**
   - Adds noise; keep functions sync when possible.

---

## 🎯 Best Practices

1. **Mark functions `async` only when they use `await` or return a Promise.**

2. **Use `Promise.all` for independent parallel work**; use sequential `await` when order matters.

3. **Always handle errors** — `try/catch` or `.catch` at boundaries.

4. **Return values from async functions** rather than mutating outer state when possible.

5. **Use `Promise.allSettled`** when you need all outcomes (success or failure).

6. **For retries/timeouts**, compose small helpers around async calls.

---

## 💻 Mini Example (TypeScript)

```ts
async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function loadDashboard(): Promise<void> {
  try {
    const [user, prefs] = await Promise.all([
      fetchJson("/api/user"),
      fetchJson("/api/prefs"),
    ]);
    console.log({ user, prefs });
  } catch (e) {
    console.error("dashboard failed", e);
  }
}
```

---

## 🔗 Related Topics

| Topic | Relationship |
|-------|--------------|
| Promise / Future | Underlying abstraction for `await` in JS/TS |
| Producer–Consumer | Often built with async workers + queues |
| Error handling | try/catch maps Promise rejections |
| Event loop | Schedules continuation after `await` |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks

1. Refactor nested `.then` chains to `async/await` with `try/catch`.
2. Change sequential `await` in a loop to `Promise.all` where safe.
3. Write an `async` helper `withTimeout(promise, ms)` using `Promise.race`.

### Interview questions

1. What does `await` actually do under the hood?
2. Why is `for...of` + `await` sequential and when is that desired?
3. How do errors propagate in `async` functions?
4. Difference between `Promise.all` and `Promise.allSettled`?
5. Does `async` make code run on another thread in JavaScript?

---

## 📝 Key Takeaways

1. `async`/`await` is **readable syntax** over Promises/futures.
2. **`await` pauses the async function**, not necessarily the whole process/thread.
3. **Parallelism** requires explicit patterns like `Promise.all`.
4. **Errors** surface as exceptions in `try/catch` when using `await`.
5. **Correctness** still depends on not blocking the runtime with heavy sync work.

---

**Date Created:** 2026-04-08  
**Topic Type:** Concurrency Patterns  
**Difficulty:** Intermediate  
**Related:** Promise/Future, Event loop, Error handling, Integration testing async code
