# CAP Theorem

## 📋 Learning Objectives

- [ ] Understand what C, A, and P mean in the CAP theorem and what they do **not** mean
- [ ] Learn why the theorem is often summarized as “pick two of three”
- [ ] Recognize common misconceptions (e.g. confusing latency with P)
- [ ] Relate CAP to trade-offs in databases, replication, and microservices
- [ ] Connect CAP to your existing lessons on Saga, distributed transactions, and consistency

---

## 🎯 Definition

The **CAP theorem** (Brewer’s conjecture, later formalized) describes fundamental trade-offs in **distributed systems** that replicate **shared data** over a **network**.

The three letters stand for:

| Letter | Stands for | Intuition (informal) |
|--------|------------|----------------------|
| **C** | **Consistency** | Every read receives the **most recent write** or an error (linearizable / strong consistency in the original formulation) |
| **A** | **Availability** | Every request **eventually receives a reply** (success or failure), not indefinite hang or silent drop |
| **P** | **Partition tolerance** | The system **continues** despite **network partitions** (messages lost/delayed between nodes) |

**Partition tolerance** in practice means: you design for **network splits** because they **will** happen in real systems.

---

## 🧭 Core Concepts

### 1) The “pick two” story

In the presence of a **network partition**, you **cannot** simultaneously guarantee **strong linearizable consistency** and **full availability** for arbitrary reads/writes in the classic formulation.

So under **P**, you often choose between:

- **CP** — favor consistency (may **refuse** or **fail** some operations during partition)
- **AP** — favor availability (may return **stale** or **conflicting** data until reconciled)

**CA** systems (no partition tolerance) are **not** realistic for distributed deployments over unreliable networks—they assume **no partition**, which is a **single-site** or **non-distributed** mental model.

### 2) What “consistency” means here

CAP’s **C** is **not** “eventual consistency” or “ACID” in the database sense alone—it refers to **strong** consistency (single copy **linearizability** style) in the original CAP discussion.

**Eventual consistency** is a different **consistency model** (weaker C)—often chosen for **AP** systems.

### 3) Partitions are real

A **partition** is when nodes in a cluster **cannot talk** to each other even though each side may still serve clients. **P** is not “optional” for multi-region / multi-node systems.

### 4) Not about latency

CAP is **not** about “slow vs fast.” **Latency** is related but **different** (see PACELC and related extensions).

---

## 📊 CAP and System Design (informal)

| Style | Typical emphasis | Examples (conceptual) |
|-------|------------------|------------------------|
| **CP** | Correctness, reject/fail when unsure | Strong consistency stores, quorum writes that block |
| **AP** | Always respond, reconcile later | Dynamo-style systems, eventual consistency with conflict resolution |
| **“CA”** | Single datacenter, no partition in model | Legacy diagrams; real systems in production still face partitions |

---

## ⚠️ Common Pitfalls

1. **“Our database is CAP-compliant”** — meaningless without **which** C/A/P trade-offs under **which** failure model.

2. **Confusing “consistency” with “having replicas”** — replicas can be **inconsistent** under partitions.

3. **Ignoring business needs** — sometimes **short unavailability** (CP) is better than **wrong money** (AP).

4. **Forgetting operational semantics** — retries, timeouts, and partial failures interact with CAP.

5. **Treating CAP as the only lens** — also consider **latency**, **durability**, **operational complexity**, **PACELC** (latency vs consistency when not partitioned).

---

## 🎯 Best Practices

1. **State assumptions** — partition model, failure detection, replication factor.

2. **Match consistency to use case** — financial ledger vs social feed differ.

3. **Document behavior during partitions** — fail? degrade? stale reads?

4. **Combine with patterns you already know** — **Saga** for cross-service consistency without 2PC; **outbox** for reliable publishing; **eventual** where acceptable.

5. **Learn consistency models** as a follow-up (strong, eventual, causal)—next lesson in your roadmap.

---

## 📖 Relation to Your Other Lessons

| Topic | Relationship |
|-------|----------------|
| **Distributed Transactions (2PC)** | Strong consistency across nodes is **hard**; partitions block or break naive 2PC |
| **Saga** | Chooses **per-service local consistency** + **eventual** global alignment via compensations |
| **Microservices** | Network between services ⇒ **P** matters; **global strong C** is expensive |
| **Eventual consistency** | Often an **AP**-leaning choice |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks

1. For a **payment authorization** and a **news feed**, argue CP vs AP preferences.
2. Explain why **P** is not “optional” for a multi-region deployment.
3. Draw a partition scenario: two replicas, two clients, conflicting writes—what can each system do?

### Interview questions

1. What do C, A, and P stand for in CAP?
2. Why can’t you have all three during a partition in the classic formulation?
3. What is a network partition?
4. How does CAP differ from ACID “consistency”?
5. What is a common **AP** system design pattern?

---

## 📝 Key Takeaways

1. **CAP** is about **trade-offs** when **data is replicated** and the **network can fail**.
2. **P** (partitions) is a reality for distributed deployments.
3. Under partition, **strong C** and **full A** conflict in the classic model—design chooses **CP** or **AP** (or weaker consistency).
4. **“CA”** is not a realistic distributed category; clarify what you mean.
5. Use CAP as a **conversation starter**, not a **vendor scorecard**—always combine with **latency**, **durability**, and **product requirements**.

---

## 📚 Further Reading (optional)

- **Brewer** (2000) — original CAP intuition  
- **Gilbert & Lynch** (2002) — formalization  
- **PACELC** — extends CAP with latency vs consistency when **no** partition  

---

**Date Created:** 2026-04-13  
**Topic Type:** Distributed Systems  
**Difficulty:** Intermediate  
**Related:** Distributed Transactions, Saga, Microservices, Consistency Models (next in series)
