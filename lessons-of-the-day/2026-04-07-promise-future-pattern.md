# Promise / Future Pattern

## 📋 Learning Objectives

- [ ] Understand what Promises and Futures represent in concurrent / asynchronous programming
- [ ] Learn how they decouple “starting work” from “getting a result”
- [ ] Distinguish eager vs lazy futures where relevant
- [ ] Recognize common pitfalls (forgotten rejection, nested `.then`, mixing sync/async)
- [ ] Relate Promises to async/await and to callback-based APIs

---

## 🎯 Definition

A **Future** (and the JavaScript **Promise**, or `CompletableFuture` in Java, `Task` in .NET) is a **handle for a value that will be available later**. It represents the **result of an asynchronous computation**—or a failure—without blocking the calling thread (in the typical non-blocking style).

**Core idea:**
> “I don’t have the result yet, but I have an object I can attach continuations to, or await later.”

- **Future / Promise** = placeholder + state machine (pending → fulfilled / rejected).
- **Producer** resolves or rejects when work completes.
- **Consumer** registers callbacks or awaits the outcome.

Naming varies by language:

| Language / platform | Common name |
|---------------------|-------------|
| JavaScript / TypeScript | `Promise` |
| Java | `CompletableFuture`, Guava `ListenableFuture` |
| C# | `Task`, `Task<T>` |
| Python 3 | `Future` (with `asyncio`) |
| Rust | `Future` (polled by executor) |

---

## 🧭 Core Concepts

### 1) Deferred result

Instead of:

```text
result = blockingFetch();  // thread waits
```

you get:

```text
future = startFetch();     // returns immediately
// later: future yields value or error
```

### 2) Composition

Promises/futures are often **composed**:

- **then / map** — transform success value
- **catch / recover** — handle or map errors
- **all / race** — combine multiple async operations

This avoids “callback pyramids” when used consistently.

### 3) Single resolution

A standard Promise **settles once**: either fulfilled with a value or rejected with a reason. Multiple settles are ignored (safety against double completion bugs).

### 4) Threading model (mental model)

- In **JavaScript**, Promises run on the **event loop**; “async” does not mean extra OS threads per Promise.
- In **JVM / .NET**, async work may use **thread pools**; the Future still abstracts **when** the result is ready.

The pattern is the same **abstraction**; the **runtime** differs.

---

## 📊 When to Use Promises / Futures

| Situation | Use? | Why |
|-----------|------|-----|
| Network, disk, timers, message replies | ✅ | Work completes unpredictably later |
| Avoid blocking UI or request threads | ✅ | Register completion instead of blocking |
| Composing several async steps | ✅ | Chain or `Promise.all` |
| CPU-heavy parallel work on one machine | ⚠️ | Often **workers / thread pools**, not only Promises |
| Simple synchronous logic | ❌ | Unnecessary abstraction |

---

## ⚠️ Common Pitfalls

1. **Unhandled rejections**
   - Always end chains with `.catch` or use `try/catch` with `async/await`.

2. **Nested `.then` hell**
   - Prefer `async/await` or flat chains with returned Promises.

3. **Mixing sync throws and Promise rejections**
   - Inconsistency confuses callers; document errors clearly.

4. **Assuming parallel when it is sequential**
   - `await a(); await b();` is sequential; use `Promise.all` for parallel when independent.

5. **Creating Promises in tight loops without batching**
   - Can overwhelm I/O or connection limits; use pooling / limits.

---

## 🎯 Best Practices

1. **Return Promises from async APIs** instead of taking success/error callbacks for new code.

2. **Propagate errors** — don’t swallow rejections silently.

3. **Use `Promise.all` / `allSettled`** when combining independent tasks; choose based on “fail fast” vs “see all results.”

4. **Document whether API is cancelable** — Promises in JS are generally **not cancelable** unless you add `AbortController` or similar.

5. **Prefer `async/await` for readability** when control flow is linear (see next lesson).

---

## 💻 Mini Example (TypeScript / JavaScript)

```ts
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadUser(id: string): Promise<{ id: string; name: string }> {
  await delay(10);
  if (id === "0") throw new Error("not found");
  return { id, name: "Ada" };
}

// Consumer
loadUser("1")
  .then((u) => console.log(u.name))
  .catch((e) => console.error(e));
```

**Composition:**

```ts
const [a, b] = await Promise.all([loadUser("1"), loadUser("2")]);
```

---

## 🔗 Related Topics

| Topic | Relationship |
|-------|--------------|
| Async/Await | Syntactic sugar over Promises in many languages |
| Producer–Consumer | Often implemented with queues + async workers |
| Reactive Streams | Different model (streams vs single value), but also async |
| Event loop | How JS schedules Promise callbacks |
| Thread (computing) | OS threads vs async concurrency |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks

1. Wrap a callback-based API (e.g. `setTimeout` or Node `fs.readFile`) in a Promise.
2. Run two independent async calls in **parallel** vs **sequential**; measure or log order.
3. Fix a snippet that forgets `.catch` and causes unhandled rejection.

### Interview questions

1. What is the difference between a Promise and a callback?
2. How does `Promise.all` differ from `Promise.allSettled`?
3. Why can `async/await` be easier to read than nested `.then`?
4. What is an unhandled rejection?
5. Is a JavaScript Promise always asynchronous?

---

## 📝 Key Takeaways

1. Promise/Future is a **deferred result** abstraction for async work.
2. It enables **composition** and clearer control flow than raw callbacks.
3. **Errors** must be handled—rejections are part of the contract.
4. **Parallel vs sequential** async must be intentional (`Promise.all` vs sequential `await`).
5. **Runtime details** (threads vs event loop) vary by platform; the pattern is widely applicable.

---

**Date Created:** 2026-04-07  
**Topic Type:** Concurrency Patterns  
**Difficulty:** Intermediate  
**Related:** Async/Await, Producer–Consumer, Event loop, Promises (language-specific docs)
