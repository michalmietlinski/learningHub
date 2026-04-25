# Distributed Consensus (Raft & Paxos Basics)

## 📋 Learning Objectives

- [ ] State what **consensus** means in a replicated system and why it matters
- [ ] Understand **Paxos** at a high level (roles, quorums, two phases)
- [ ] Understand **Raft** at a high level (leader election, log replication, safety)
- [ ] Compare **Raft vs Paxos** for learning and for product choices
- [ ] Connect consensus to **strong consistency**, **CAP**, and real systems (etcd, Consul, …)

---

## 🎯 Definition

**Consensus** is the problem of getting a group of **nodes** to **agree** on **one value** (or on an **ordered log** of commands) even when some nodes **crash** or messages are **delayed**—as long as enough nodes stay up and connected.

**Why it matters:** replicated state machines (databases, config stores, coordination services) need **one authoritative order** of operations so clients see **coherent** behavior.

This lesson is **conceptual**—enough to read papers and docs, not a full protocol implementation guide.

---

## 🧭 Core Concepts

### 1) What we are solving

A set of **replicas** must:

- **Agree** on the same sequence of decisions (or on a single value in single-decree Paxos)
- **Survive** **crash failures** of a **minority** of nodes (typical assumption)
- Avoid **split brain**: two leaders believing they can commit **conflicting** orders

**Quorum idea:** if any two quorums **overlap**, at least one correct node carries information that prevents incompatible decisions—classic **majority** \( \lfloor n/2 \rfloor + 1 \) of nodes.

---

### 2) Paxos (basics)

**Paxos** solves **consensus** for a **single value** (single-decree); **Multi-Paxos** extends this to a **log** of values (like a replicated state machine).

**Roles (conceptual):**

| Role | Responsibility |
|------|----------------|
| **Proposer** | Suggests a value (with a proposal number) |
| **Acceptor** | Votes to accept; stores promises / accepted values |
| **Learner** | Learns the chosen value once a quorum agrees |

**Two phases (intuition):**

1. **Prepare / promise** — proposer picks a **monotonically increasing** proposal ID; acceptors **promise** not to accept lower IDs and reveal any value they already accepted.
2. **Accept** — proposer asks acceptors to **accept** a value (often the **latest** value seen in phase 1, or its own if none).

**Safety:** no two different values can be chosen; **liveness** needs stronger assumptions (timeouts, failure detection)—related to **FLP**: in a fully **asynchronous** model with even one crash, **no deterministic algorithm** guarantees consensus termination (you add **partial synchrony** or randomness in real systems).

**Reputation:** **correct but hard to teach**; many production systems use **Raft** or **Multi-Paxos** with a **stable leader** pattern instead of exposing raw Paxos to every engineer.

---

### 3) Raft (basics)

**Raft** targets the **same goal** (replicated log) with **strong leader** semantics and **separable** subproblems—often easier to learn than Paxos.

**Subproblems:**

1. **Leader election** — **timeouts** and **randomized backoff** reduce split votes; candidate requests votes; **majority** wins.
2. **Log replication** — **leader** appends entries; followers **append** in order; **committed** when replicated on a **majority**.
3. **Safety** — matching **terms**, **election safety** (at most one leader per term), **log matching** (if same index/term, same entry and prefix).

**Properties engineers remember:**

- **Strong leader** — normal writes go through the **current** leader
- **Majority commit** — durability and agreement before “done”
- **Partition behavior** — minority partition **cannot** commit; may need **new leader** after timeouts

**Used in:** **etcd**, **Consul** (Raft-based), many educational and commercial systems.

---

### 4) Raft vs Paxos (practical)

| Aspect | Paxos family | Raft |
|--------|----------------|------|
| **Teaching** | Steeper curve | Designed for understandability |
| **Implementation** | Many variants (Multi-Paxos, etc.) | Clear paper + reference concerns |
| **Leadership** | Can be optimized with stable leader | First-class leader model |
| **Correctness** | Long literature | Raft paper + TLA+ specs |

Many **large systems** use **consensus under the hood**; your job is often **operating** and **tuning** them (election timeouts, snapshotting, quorum size), not writing a new protocol.

---

## 📊 Where this shows up

| System | Typical algorithm / note |
|--------|-------------------------|
| **etcd** | Raft |
| **Consul** | Raft |
| **ZooKeeper** | ZAB (similar problem space) |
| **Chubby** | Paxos family |
| **Some DBs** | Paxos/Raft for replication control path |

---

## ⚠️ Common Pitfalls

1. **“We use Raft so we have no splits”** — **network partitions** still happen; **minority** side **stalls** or **read-only**; **split brain** is avoided by **not** committing without a **quorum**.

2. **Confusing consensus with CAP “C”** — consensus helps **replicas agree**; **client-visible** consistency still depends on **read policies**, **leases**, and **session** semantics.

3. **Ignoring latency** — **leader** can be a **hotspot**; cross-region clusters pay **RTT** on every commit.

4. **Assuming Paxos == Raft** — same **problem class**, different **structure** and **operational** trade-offs.

5. **Skipping failure testing** — **leader death**, **slow disks**, and **clock skew** expose real bugs; chaos testing matters.

---

## 🎯 Best Practices

1. **Use battle-tested libraries** (etcd, Consul, …) before rolling your own consensus.

2. **Tune election timeouts** for your RTT and SLOs; document **expected failover** time.

3. **Snapshot and compact logs** so replicas do not replay forever.

4. **Monitor**: leader changes, commit latency, failed proposals.

5. **Next lesson:** **Two Generals & Byzantine** faults—consensus above assumes **crash** model, not arbitrary malicious nodes.

---

## 📖 Relation to Your Other Lessons

| Topic | Relationship |
|-------|----------------|
| **Consistency models** | Consensus **implements** agreement needed for **strong** replicated logs |
| **CAP** | Under partition, **minority** cannot progress writes—**CP**-leaning behavior |
| **Distributed transactions** | Different layer; **2PC** is not the same as **Raft**, but both deal with agreement |
| **Vector clocks** | Other tool for **ordering** without a single leader—often **weaker** guarantees |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks

1. Why is a **majority quorum** better than “any 2 of 3” without overlap rules?
2. In one sentence: what does a **Raft leader** do?
3. Name one reason **Paxos** is considered hard to implement.

### Interview questions

1. What problem does distributed consensus solve?
2. What is the difference between **Paxos** and **Raft** at a high level?
3. What is a **quorum**?
4. Why can a **minority partition** not commit new writes in Raft?
5. What is the **FLP** result (informally)?

---

## 📝 Key Takeaways

1. **Consensus** = replicas **agree** on an **order** of operations despite **crashes** (with quorum assumptions).
2. **Paxos** = classic **two-phase** agreement; **Multi-Paxos** = sequence of agreements for a **log**.
3. **Raft** = **leader-based** replicated log; **easier narrative**, widely deployed.
4. **Majority** overlap is the **safety** backbone; **liveness** needs real-world timeouts and ops.
5. **Next:** **Two Generals** (message loss) and **Byzantine** faults (malicious nodes)—different failure models.

---

## 📚 Further Reading (optional)

- Lamport — “The Part-Time Parliament” (Paxos)  
- Ongaro & Ousterhout — **Raft** paper  
- Fischer, Lynch, Paterson — **FLP** impossibility  

---

**Date Created:** 2026-04-15  
**Topic Type:** Distributed Systems  
**Difficulty:** Intermediate  
**Related:** Consistency Models, CAP, Two Generals / Byzantine (next in series)
