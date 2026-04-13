# Actor Model Pattern

## 📋 Learning Objectives

- [ ] Understand the actor model: actors, messages, and mailboxes
- [ ] Learn how it avoids shared mutable state by design
- [ ] Know when actors fit (distributed systems, concurrency isolation)
- [ ] Recognize pitfalls (mailbox overflow, distributed failure, debugging)
- [ ] Relate actors to threads, async message queues, and microservices

---

## 🎯 Definition

The **Actor Model** is a concurrency model where **actors** are the unit of computation. Each actor:

- has a **private state** (not shared directly),
- receives **messages** (async, typically queued in a **mailbox**),
- processes **one message at a time** (per actor),
- can **create** other actors and **send** messages to them.

There is **no shared memory** between actors—only **message passing**. This avoids many **data race** issues by construction (within the model).

**Examples:** Erlang/OTP, Akka (JVM), Orleans (.NET), some libraries in other languages.

---

## 🧭 Core Concepts

### 1) Message passing, not sharing

> “Don’t share memory to communicate; communicate to share memory.” (often attributed to Erlang community)

### 2) Mailbox and ordering

Messages arrive in a **mailbox**; processing is **sequential per actor**—easy reasoning about actor-local state.

**Between** actors, ordering is **not guaranteed** unless you design protocols (e.g. sequence numbers, acknowledgments).

### 3) Location transparency

In distributed actor systems, a message may cross the network—**failure modes** include latency, loss, and partition (needs **supervision** and retries).

### 4) Supervision

**Supervisor** actors restart failed children—**fault isolation** is a core OTP idea.

---

## 📊 When to Use Actors

| Situation | Use actors? |
|-----------|-------------|
| Many isolated stateful entities (sessions, game entities, IoT devices) | ✅ |
| Distributed systems with message-based boundaries | ✅ |
| Simple CRUD with one DB | ⚠️ Often overkill |
| Tight shared-memory numerical parallel code | ⚠️ Other models (threads, SIMD) may fit better |

---

## ⚠️ Common Pitfalls

1. **Mailbox overflow** if producers outpace consumer—need **backpressure** or dropping policies.

2. **Designing synchronous request/response on async messaging** — leads to timeouts and complexity; use **ask** patterns carefully.

3. **Distributed debugging** — harder than stack traces in one process.

4. **Granularity** — too many tiny actors → overhead; too few → lost isolation.

5. **Leaking shared state** — breaking the model with static globals defeats the purpose.

---

## 🎯 Best Practices

1. **Keep actor responsibilities focused** — one clear concern per actor.

2. **Use immutable messages** when possible—easier to reason and log.

3. **Design supervision trees** for failure recovery.

4. **Monitor mailbox depth** and processing time.

5. **Learn your runtime’s delivery guarantees** (at-most-once, at-least-once, ordering).

---

## 💻 Mental sketch

```
Actor A                    Actor B
  |                          |
  | ---- message M --------> |
  |                          | process M, update self state
  | <---- reply R ---------  |
```

No direct peek at B’s state from A—only messages.

---

## 🔗 Related Topics

| Topic | Relationship |
|-------|--------------|
| Message Queue (EIP) | System-level messaging |
| Producer–Consumer | Mailbox is a queue |
| Microservices | Often “actors at cluster scale” |
| CSP (channels) | Different formalism; also message-based |
| Reactive Streams | Stream processing vs discrete messages |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks

1. Model one domain object (e.g. “shopping cart”) as an actor with allowed messages.
2. Contrast actor isolation with shared-memory + locks.
3. Name one failure mode in **distributed** actors that local actors avoid.

### Interview questions

1. How does the actor model prevent data races?
2. What is a mailbox?
3. Why can distributed actors be hard to debug?
4. How does supervision relate to fault tolerance?
5. Difference between actors and thread pools?

---

## 📝 Key Takeaways

1. Actors encapsulate **state + behavior** and communicate only via **messages**.
2. **No shared mutable state** between actors—core concurrency benefit.
3. **Ordering and reliability** are design concerns, especially **distributed**.
4. **Supervision** enables fault isolation and recovery.
5. Actors are a strong fit for **many independent stateful entities** and **message-native** systems.

---

**Date Created:** 2026-04-11  
**Topic Type:** Concurrency Patterns  
**Difficulty:** Intermediate  
**Related:** Message passing, Producer–Consumer, Microservices, Fault tolerance
