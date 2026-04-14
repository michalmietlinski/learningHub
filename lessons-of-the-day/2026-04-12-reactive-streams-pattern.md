# Reactive Streams Pattern

## 📋 Learning Objectives

- [ ] Understand reactive streams as asynchronous stream processing with backpressure
- [ ] Learn the roles Publisher, Subscriber, Subscription, and Processor
- [ ] Know why backpressure matters in fast producer / slow consumer scenarios
- [ ] Recognize how this differs from single-value Promises and from batch ETL
- [ ] Relate reactive streams to observables (Rx) and to async iterators

---

## 🎯 Definition

**Reactive Streams** is a **specification** for **asynchronous stream processing** with **non-blocking** flow and **explicit backpressure**.

It standardizes (Java: `java.util.concurrent.Flow`, Project Reactor, RxJava interop; other languages have similar concepts):

| Component | Role |
|-----------|------|
| **Publisher** | Produces a stream of elements |
| **Subscriber** | Consumes elements, reacts to signals |
| **Subscription** | Connects publisher and subscriber; **request(n)** is how consumer **pulls** demand |
| **Processor** | Publisher + Subscriber (transform stage) |

**Backpressure:** Slow subscriber **requests** how much it can handle (`request(n)`); fast producer **does not** flood memory unbounded.

---

## 🧭 Core Concepts

### 1) Push with pull-based demand

Producers **push** items, but **only after** subscriber signals demand—combining **push** ergonomics with **pull** flow control.

### 2) Lifecycle signals

Typical signals: **subscribe**, **onNext** (element), **onError**, **onComplete**, **cancel**.

### 3) Difference from Promise

- **Promise** ≈ single async value.
- **Reactive stream** ≈ **many** values over time, with flow control.

### 4) Operators (in Rx-style libraries)

`map`, `filter`, `flatMap`, `buffer`, `debounce`, etc.—compose pipelines. **Hot vs cold** streams matter for when subscription starts.

---

## 📊 When to Use Reactive Streams

| Situation | Use? |
|-----------|------|
| High-throughput event processing, live feeds | ✅ |
| UI streams (search-as-you-type with debounce) | ✅ |
| Fast producer / slow consumer (need backpressure) | ✅ |
| One-shot HTTP request/response | ⚠️ Often simpler with async/await |
| Simple batch ETL offline | ⚠️ May prefer plain batch jobs |

---

## ⚠️ Common Pitfalls

1. **Subscribing without understanding hot vs cold** — duplicate side effects or missed events.

2. **Ignoring backpressure** — unbounded internal buffers → memory issues.

3. **Overusing reactive for linear code** — harder to read than `async/await`.

4. **Blocking inside operators** — stalls schedulers; keep work non-blocking.

5. **Complex error propagation** — errors must be handled in stream or via operators.

---

## 🎯 Best Practices

1. **Request demand explicitly** in low-level APIs; in high-level libraries, defaults often handle it.

2. **Choose schedulers** appropriate to work (I/O vs computation).

3. **Prefer immutable** passed-through events.

4. **Test** with virtual time schedulers where available.

5. **Document** stream characteristics (hot/cold, replay, error behavior).

---

## 💻 Conceptual sketch (Java Flow-style)

```
Subscriber subscribes
Publisher sends Subscription
Subscriber calls subscription.request(10)  // demand
Publisher emits onNext ... up to demand
... onComplete or onError
```

---

## 🔗 Related Topics

| Topic | Relationship |
|-------|--------------|
| Producer–Consumer | Shared queue idea; reactive adds **standardized** demand |
| Promise / Async | Complementary for single values vs streams |
| Observable (Rx) | Popular implementation surface |
| Async iteration | `for await` in JS is related for pull-based async |
| Event-driven architecture | Streams as backbone |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks

1. Explain why **request(n)** prevents unbounded buffering.
2. Contrast a **cold** Observable with a **hot** one with a concrete UI example.
3. Name one problem reactive solves that Promises alone do not.

### Interview questions

1. What is backpressure?
2. Who calls `request` in Reactive Streams?
3. Difference between reactive streams and a simple event listener?
4. When would you avoid reactive programming?

---

## 📝 Key Takeaways

1. Reactive Streams model **many async values** with **standardized backpressure**.
2. **Subscription.request(n)** is the demand signal—core to flow control.
3. Fits **high-throughput**, **event-heavy**, **push** scenarios.
4. **Complexity** is real—use where benefits outweigh cognitive cost.
5. **Promises** and **reactive streams** address different shapes: **one value** vs **stream over time**.

---

**Date Created:** 2026-04-12  
**Topic Type:** Concurrency Patterns  
**Difficulty:** Intermediate  
**Related:** Producer–Consumer, Observable/Rx, Async iterators, Event-driven systems
