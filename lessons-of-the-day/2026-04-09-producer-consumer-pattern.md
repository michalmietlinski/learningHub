# Producer–Consumer Pattern

## 📋 Learning Objectives

- [ ] Understand the Producer–Consumer problem and why it appears everywhere
- [ ] Learn how a bounded queue decouples producers and consumers
- [ ] Know when to use blocking vs non-blocking queues
- [ ] Recognize pitfalls (deadlock, live lock, unbounded memory, poison pills)
- [ ] Relate the pattern to thread pools, async pipelines, and message systems

---

## 🎯 Definition

The **Producer–Consumer** pattern separates **work generation** from **work processing**:

- **Producers** create tasks or data items and put them into a **queue** (or buffer).
- **Consumers** take items from the queue and process them.

A **bounded queue** limits memory and applies **backpressure**: producers slow down when consumers fall behind (or producers block/drop per policy).

This pattern maps to:

- **Thread pools** and work queues
- **Async pipelines** (streams of jobs)
- **Message queues** (Kafka, RabbitMQ, SQS) at system level

---

## 🧭 Core Concepts

### 1) Decoupling and throughput

Producers and consumers can run at **different rates**. The queue **absorbs bursts** and smooths load.

### 2) Bounded vs unbounded

| Type | Risk |
|------|------|
| **Unbounded** | Memory can grow if producers outpace consumers |
| **Bounded** | Producers must wait, drop, or fail when full (policy choice) |

### 3) Multiple producers / consumers

You can scale **consumers** (worker pool) or **producers** independently—often limited by contention on the queue.

### 4) Poison pill

A special message that tells consumers to **shut down gracefully**—useful for clean thread pool termination.

---

## 📊 When to Use Producer–Consumer

| Situation | Use? |
|-----------|------|
| Web requests enqueue background jobs | ✅ |
| Log aggregation, batching writes | ✅ |
| CPU work + I/O work at different speeds | ✅ |
| Trivial single-threaded sequential task | ❌ |

---

## ⚠️ Common Pitfalls

1. **Unbounded queue under load** — OOM risk.
2. **Too few consumers** — queue grows, latency spikes.
3. **Too many consumers** — contention, context-switch overhead.
4. **Shared mutable state** without synchronization — data races.
5. **No shutdown strategy** — hanging threads or lost work.

---

## 🎯 Best Practices

1. **Prefer bounded queues** with explicit overflow policy (block, reject, drop oldest).

2. **Monitor queue depth** as a key metric (backlog = stress signal).

3. **Use clear shutdown**: poison pill, `close()`, or cancellation tokens.

4. **Keep tasks small** so consumers make progress and fairness improves.

5. **Avoid huge messages**; pass references/ids when possible.

---

## 💻 Sketch (conceptual pseudocode)

```
queue = BoundedQueue(capacity: 100)

producer():
  while hasWork:
    item = nextItem()
    queue.put(item)   // may block if full

consumer():
  while running:
    item = queue.take()  // blocks if empty
    process(item)
```

---

## 🔗 Related Topics

| Topic | Relationship |
|-------|--------------|
| Thread pool | Workers as consumers |
| Promise / async | Async pipelines are a variant |
| Message queues (EIP) | Distributed producer–consumer |
| Backpressure | Reactive Streams formalize this |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks

1. Implement an in-memory bounded queue with `put`/`take` (or use your language’s `BlockingQueue`).
2. Describe what happens when producers exceed consumers indefinitely.
3. Explain how a poison pill stops workers cleanly.

### Interview questions

1. Why use a bounded queue?
2. What is backpressure?
3. How does this relate to Kafka or SQS?
4. What can go wrong with an unbounded queue?

---

## 📝 Key Takeaways

1. Producer–Consumer **decouples generation from processing** via a queue.
2. **Bounded queues** protect memory and create **backpressure**.
3. **Scaling consumers** increases throughput until contention dominates.
4. **Graceful shutdown** needs an explicit strategy.
5. The same idea appears from **in-process queues** to **distributed messaging**.

---

**Date Created:** 2026-04-09  
**Topic Type:** Concurrency Patterns  
**Difficulty:** Intermediate  
**Related:** Thread pools, Message queue (EIP), Reactive Streams, Async pipelines
