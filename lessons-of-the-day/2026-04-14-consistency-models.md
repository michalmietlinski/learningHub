# Consistency Models (Strong, Eventual, Causal)

## 📋 Learning Objectives

- [ ] Distinguish **consistency models** from vague “data is consistent” talk
- [ ] Understand **strong** (linearizable-style), **eventual**, and **causal** consistency at a practical level
- [ ] Recognize common **session guarantees** (read-your-writes, monotonic reads, …)
- [ ] Relate models to **CAP**, replication, and **business risk**
- [ ] Know when weaker models are acceptable and how teams document behavior

---

## 🎯 Definition

A **consistency model** is a **contract** between a distributed storage or replication system and its clients: it specifies **which values** reads may return given **when and where** writes happened.

Different models offer different **guarantees** and **costs** (latency, availability during partitions, implementation complexity).

**CAP’s “C”** (in the classic sense) points at **strong** consistency; **eventual** and **causal** are **weaker** models that are often chosen deliberately.

---

## 🧭 Core Concepts

### 1) Strong consistency (informal umbrella)

Often used to mean: operations behave as if there were **one copy** of the data and **one global order** of operations everyone agrees on.

**Linearizability** (a precise form): every operation appears to happen at **one instant** on a timeline, consistent with real-time ordering of non-overlapping operations. It is **strong** and **intuitive** for programmers used to single-threaded semantics.

**Sequential consistency** (weaker than linearizability): all nodes agree on **some** global order of operations; real-time ordering across clients is not required.

**Typical cost:** higher latency, more coordination, more failure modes when the network misbehaves—often **CP-leaning** under partitions.

---

### 2) Eventual consistency

If **no new writes** occur, **eventually** all replicas **converge** to the **same** values.

**Does not say:** how long “eventually” is, or what reads see **before** convergence.

**Typical use:** catalogs, social feeds, caches, many **AP**-style systems—paired with **conflict resolution** (last-write-wins, CRDTs, application merge rules).

---

### 3) Causal consistency

If process **A**’s write **influences** process **B**’s write (B saw A’s update), then **everyone** must observe those writes in an order that **respects that causal chain**.

**Weaker than** linearizability, **stronger than** “plain” eventual consistency without causal tracking.

**Often needs:** metadata such as **vector clocks** or similar (see your upcoming **vector clocks** lesson).

**Intuition:** “If I replied to your message, nobody should see my reply without your message.”

---

### 4) Session guarantees (client-centric)

These are **not** full global models by themselves; they constrain behavior **for one client’s sequence** of operations:

| Guarantee | Idea |
|-----------|------|
| **Read-your-writes** | After I write, my later reads see my write |
| **Monotonic reads** | I never see **older** data than I saw before in my session |
| **Monotonic writes** | My writes are applied in my send order |
| **Writes follow reads** | If I read X, a later write is “after” that causal context |

Products often advertise **“strong consistency”** or **“eventual”** plus a **subset** of these—read the vendor’s **exact** definitions.

---

## 📊 Quick comparison (mental model)

| Model | Programmer feel | Partition / latency | Typical domains |
|-------|-------------------|------------------------|-----------------|
| **Strong / linearizable** | Like one machine | Often stricter, higher cost | Money, inventory, strong invariants |
| **Eventual** | Replicas catch up later | Often more available, stale possible | Feeds, recommendations, caches |
| **Causal** | Respects “because of” ordering | Middle ground | Comments, collaboration, messaging |

---

## ⚠️ Common Pitfalls

1. **“We use eventual consistency”** — without defining **read paths**, **SLAs**, and **conflict** rules.

2. **Confusing ACID “consistency”** (invariants / constraints) with **replication consistency** (what different nodes return).

3. **Assuming “async replication” = eventual** — replication mode matters, but **client-visible** guarantees depend on **read routing**, **quorums**, and **failover** behavior.

4. **Ignoring monotonicity** — users can see **nonsensical** UI order (newer post disappears) without **session** or **causal** guarantees.

5. **One global choice** — different **bounded contexts** can use **different** models (CQRS: strong write model, eventually fresh read model).

---

## 🎯 Best Practices

1. **Name the model** in architecture docs (per aggregate, per use case).

2. **Define “stale is OK”** with examples: which screens, which APIs.

3. **Pair eventual with conflict strategy** — LWW, merge functions, CRDTs, or human resolution.

4. **Test partitions and retries** — weak models interact badly with **duplicate** requests unless **idempotency** is designed in.

5. **Learn consensus next** — many **strong** designs lean on **Raft/Paxos**-style agreement (your next distributed lesson).

---

## 📖 Relation to Your Other Lessons

| Topic | Relationship |
|-------|----------------|
| **CAP Theorem** | Strong C vs eventual/causal is the **consistency spectrum** under **P** |
| **Distributed Transactions / 2PC** | Aim for **strong** cross-resource behavior; expensive under failure |
| **Saga** | Often **per-service ACID** + **eventual** global alignment |
| **Vector clocks** (next topics) | Implementation tool for **causal** and conflict reasoning |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks

1. Name one **strong** and one **eventual** use case from your own domain and justify them.
2. Explain **causal** consistency with a **comment thread** example.
3. What does **read-your-writes** guarantee **not** give you (globally)?

### Interview questions

1. What is eventual consistency?
2. How does causal consistency differ from eventual?
3. What is linearizability in one sentence?
4. Name two session guarantees.
5. Why can’t you assume “consistent” means the same thing in every whitepaper?

---

## 📝 Key Takeaways

1. **Consistency models** are **precise contracts**—not vibes.
2. **Strong** models simplify reasoning; **eventual** favors availability and latency; **causal** targets **ordering** that matches human “because of” reasoning.
3. **Session guarantees** refine behavior for **one client** without full global linearizability.
4. **Document** per use case; **mix** models when boundaries are clear.
5. **Next:** **distributed consensus** (how clusters agree despite faults).

---

## 📚 Further Reading (optional)

- Herlihy & Wing — linearizability  
- Lamport — “Time, Clocks, and the Ordering of Events” (causal intuition)  
- Vogels — “Eventually Consistent” (classic blog)  
- Bailis et al. — **PACELC** and consistency/latency trade-offs  

---

**Date Created:** 2026-04-14  
**Topic Type:** Distributed Systems  
**Difficulty:** Intermediate  
**Related:** CAP Theorem, Vector Clocks, Distributed Consensus (next in series)
