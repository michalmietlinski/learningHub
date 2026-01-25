# Distributed Transactions - 2PC, 3PC, and Alternatives

## 📋 Learning Objectives

- [ ] Understand the challenges of distributed transactions
- [ ] Learn Two-Phase Commit (2PC) protocol
- [ ] Learn Three-Phase Commit (3PC) protocol
- [ ] Recognize limitations of 2PC/3PC
- [ ] Understand modern alternatives (Saga, TCC, etc.)
- [ ] Learn when to use each approach
- [ ] Understand trade-offs and best practices

---

## 🎯 Definition

**Distributed Transaction** is a transaction that spans multiple services or databases, requiring coordination to ensure all participants either commit or abort together. Unlike local transactions (ACID in single database), distributed transactions face the challenge of maintaining consistency across network boundaries.

**The Problem:**
- Multiple services/databases involved
- Network can fail
- Services can crash
- Need atomicity across all participants
- Cannot use simple ACID transactions

**Key Challenge:**
> "How do we ensure that a transaction that spans multiple services either completes entirely or rolls back entirely, even when services or networks can fail?"

---

## 🏗️ Structure

### Local Transaction vs Distributed Transaction

**Local Transaction (Single Database):**
```
┌─────────────────────────────────────────────────────────┐
│         Single Database                                  │
│                                                          │
│  BEGIN TRANSACTION                                      │
│    UPDATE accounts SET balance = balance - 100         │
│    UPDATE orders SET status = 'paid'                    │
│  COMMIT                                                 │
│                                                          │
│  → ACID guarantees                                       │
│  → All or nothing                                        │
│  → Simple and reliable                                   │
└─────────────────────────────────────────────────────────┘
```

**Distributed Transaction (Multiple Services):**
```
┌─────────────────────────────────────────────────────────┐
│  Service A (Database 1)    Service B (Database 2)      │
│                                                          │
│  BEGIN TRANSACTION        BEGIN TRANSACTION            │
│    UPDATE ...              UPDATE ...                   │
│  ??? COMMIT ???           ??? COMMIT ???              │
│                                                          │
│  → How to coordinate?                                    │
│  → What if one fails?                                    │
│  → Network partitions?                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Core Concepts

### 1. The Distributed Transaction Problem

**Challenges:**
- **Network Failures** - Messages can be lost or delayed
- **Service Failures** - Services can crash mid-transaction
- **Partial Failures** - Some services succeed, others fail
- **Consistency** - Need all-or-nothing guarantee
- **Performance** - Coordination overhead

**Requirements:**
- **Atomicity** - All or nothing
- **Consistency** - System remains consistent
- **Isolation** - Concurrent transactions don't interfere
- **Durability** - Committed changes persist

**The CAP Theorem Constraint:**
- In distributed systems, you can't have all three:
  - **Consistency** - All nodes see same data
  - **Availability** - System remains operational
  - **Partition Tolerance** - System works despite network failures

---

## 🏛️ Two-Phase Commit (2PC)

### Overview

**Two-Phase Commit (2PC)** is a distributed transaction protocol that ensures all participants either commit or abort together. It uses a coordinator to manage the transaction.

**Phases:**
1. **Prepare Phase** - Coordinator asks all participants to prepare
2. **Commit Phase** - Coordinator tells all participants to commit or abort

### How 2PC Works

```
┌─────────────────────────────────────────────────────────┐
│                   2PC Protocol                          │
│                                                          │
│  Coordinator          Participant 1    Participant 2  │
│                                                          │
│  ────────────────────────────────────────────────        │
│  Phase 1: Prepare                                      │
│  ────────────────────────────────────────────────        │
│     │                                                    │
│     ├─── PREPARE ────────────────────►                  │
│     │                                                    │
│     ├─── PREPARE ────────────────────────────►        │
│     │                                                    │
│     │                    ◄─── YES (ready) ────          │
│     │                                                    │
│     │                    ◄─── YES (ready) ────────────  │
│     │                                                    │
│  ────────────────────────────────────────────────        │
│  Phase 2: Commit (if all said YES)                     │
│  ────────────────────────────────────────────────        │
│     │                                                    │
│     ├─── COMMIT ────────────────────►                  │
│     │                                                    │
│     ├─── COMMIT ────────────────────────────►        │
│     │                                                    │
│     │                    ◄─── ACK ────                  │
│     │                                                    │
│     │                    ◄─── ACK ────────────         │
│     │                                                    │
└─────────────────────────────────────────────────────────┘
```

### 2PC Implementation Example

```typescript
class TwoPhaseCommitCoordinator {
  async executeTransaction(participants: Participant[], operations: Operation[]) {
    const transactionId = generateId();
    
    // Phase 1: Prepare
    const prepareResults: boolean[] = [];
    for (let i = 0; i < participants.length; i++) {
      try {
        const prepared = await participants[i].prepare(transactionId, operations[i]);
        prepareResults.push(prepared);
      } catch (error) {
        // Participant failed to prepare
        await this.abortAll(participants, transactionId);
        throw error;
      }
    }
    
    // Check if all prepared successfully
    if (prepareResults.every(result => result === true)) {
      // Phase 2: Commit
      await this.commitAll(participants, transactionId);
    } else {
      // Phase 2: Abort
      await this.abortAll(participants, transactionId);
    }
  }
  
  private async commitAll(participants: Participant[], transactionId: string) {
    for (const participant of participants) {
      await participant.commit(transactionId);
    }
  }
  
  private async abortAll(participants: Participant[], transactionId: string) {
    for (const participant of participants) {
      await participant.abort(transactionId);
    }
  }
}

// Participant Implementation
class DatabaseParticipant {
  private preparedTransactions = new Map<string, any>();
  
  async prepare(transactionId: string, operation: Operation): Promise<boolean> {
    try {
      // Perform operation but don't commit
      const result = await this.executeOperation(operation);
      // Store result for commit phase
      this.preparedTransactions.set(transactionId, result);
      return true; // Ready to commit
    } catch (error) {
      return false; // Cannot prepare
    }
  }
  
  async commit(transactionId: string): Promise<void> {
    const result = this.preparedTransactions.get(transactionId);
    if (result) {
      // Actually commit the prepared transaction
      await this.finalizeTransaction(transactionId, result);
      this.preparedTransactions.delete(transactionId);
    }
  }
  
  async abort(transactionId: string): Promise<void> {
    // Rollback prepared transaction
    await this.rollbackTransaction(transactionId);
    this.preparedTransactions.delete(transactionId);
  }
}
```

### 2PC Limitations

**Problems:**
- **Blocking** - If coordinator crashes, participants are blocked
- **Single Point of Failure** - Coordinator is critical
- **Performance** - Multiple round trips
- **Network Partitions** - Can't handle network splits well
- **Timeout Issues** - Hard to set appropriate timeouts

**Blocking Problem:**
```
If coordinator crashes after Phase 1:
- Participants are in "prepared" state
- They don't know if they should commit or abort
- They must wait for coordinator to recover
- System is blocked until coordinator returns
```

---

## 🏛️ Three-Phase Commit (3PC)

### Overview

**Three-Phase Commit (3PC)** extends 2PC with an additional phase to reduce blocking. It adds a "pre-commit" phase to ensure participants know others are ready.

**Phases:**
1. **CanCommit Phase** - Coordinator asks if participants can commit
2. **PreCommit Phase** - Coordinator tells participants to pre-commit
3. **DoCommit Phase** - Coordinator tells participants to commit

### How 3PC Works

```
┌─────────────────────────────────────────────────────────┐
│                   3PC Protocol                          │
│                                                          │
│  Phase 1: CanCommit?                                    │
│    Coordinator → Participants: "Can you commit?"        │
│    Participants → Coordinator: "Yes" or "No"           │
│                                                          │
│  Phase 2: PreCommit                                     │
│    Coordinator → Participants: "Pre-commit (others OK)"│
│    Participants → Coordinator: "ACK"                   │
│                                                          │
│  Phase 3: DoCommit                                      │
│    Coordinator → Participants: "Commit now"            │
│    Participants → Coordinator: "ACK"                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 3PC Benefits

**Advantages over 2PC:**
- **Less Blocking** - If coordinator fails in Phase 2, participants can decide
- **Better Timeout Handling** - Participants know state of others
- **Faster Recovery** - Can recover without coordinator in some cases

**Still Has Problems:**
- **More Complex** - Additional phase adds complexity
- **Still Blocking** - Can still block in some scenarios
- **Network Partitions** - Still can't handle all partition cases

---

## 🔀 Modern Alternatives

### 1. Saga Pattern

**Approach:** Sequence of local transactions with compensation.

**Characteristics:**
- No distributed locks
- Eventual consistency
- Compensating transactions
- Non-blocking

**When to Use:**
- Microservices architecture
- Long-running transactions
- Eventual consistency acceptable

See **[Saga Pattern](./2026-01-25-saga-pattern.md)** for detailed implementation.

### 2. Try-Confirm-Cancel (TCC)

**Approach:** Three-phase pattern: Try (reserve), Confirm (commit), Cancel (rollback).

**Phases:**
1. **Try** - Reserve resources (idempotent)
2. **Confirm** - Commit if all succeeded
3. **Cancel** - Release if any failed

**Example:**
```typescript
// Try Phase
await inventoryService.reserve(orderId, items);
await paymentService.reserve(orderId, amount);

// Confirm Phase (if all Try succeeded)
await inventoryService.confirm(orderId);
await paymentService.confirm(orderId);

// Cancel Phase (if any Try failed)
await inventoryService.cancel(orderId);
await paymentService.cancel(orderId);
```

**Characteristics:**
- Business-level compensation
- More control than Saga
- Requires business logic changes
- More complex implementation

### 3. Eventual Consistency

**Approach:** Accept temporary inconsistencies, eventually become consistent.

**Characteristics:**
- No distributed transactions
- Event-driven updates
- Compensating actions
- Eventual consistency

**Example:**
```typescript
// Service A updates its data
await serviceA.update(data);

// Publishes event
await eventBus.publish(new DataUpdatedEvent(data));

// Service B eventually updates
// (may be seconds/minutes later)
```

### 4. Outbox Pattern

**Approach:** Store events in database transaction, publish separately.

**Characteristics:**
- Atomic event storage
- Reliable event publishing
- No distributed transaction needed
- Eventual consistency

See **Event-Driven Architecture** for details.

---

## 📊 Comparison: 2PC vs 3PC vs Saga vs TCC

| Aspect | 2PC | 3PC | Saga | TCC |
|--------|-----|-----|------|-----|
| **Consistency** | Strong | Strong | Eventual | Strong (business level) |
| **Blocking** | Yes | Less | No | No |
| **Complexity** | Medium | High | Medium | High |
| **Performance** | Slow | Slower | Fast | Medium |
| **Failure Recovery** | Hard | Medium | Easy | Medium |
| **Use Case** | Short transactions | Short transactions | Long transactions | Business transactions |
| **Locks** | Distributed | Distributed | None | Business-level |

---

## 💡 When to Use Which?

### Use 2PC/3PC When:

✅ **Short Transactions**
- Transactions complete quickly
- Can tolerate blocking
- Need strong consistency
- Few participants

✅ **Traditional Systems**
- Legacy systems
- Database-level coordination
- ACID requirements

### Use Saga Pattern When:

✅ **Long Transactions**
- Transactions take time
- Cannot block
- Eventual consistency OK
- Microservices architecture

See **[Saga Pattern](./2026-01-25-saga-pattern.md)** for details.

### Use TCC When:

✅ **Business-Level Compensation**
- Need business logic in compensation
- More control needed
- Can modify business operations
- Complex compensation logic

### Use Eventual Consistency When:

✅ **High Availability**
- Need high availability
- Can tolerate temporary inconsistencies
- Event-driven architecture
- Performance is critical

---

## ⚠️ Common Pitfalls

### 1. Using 2PC in Microservices

**Problem:** 2PC doesn't scale well in microservices.

**❌ Wrong:**
```typescript
// Using 2PC across many microservices
await coordinator.execute2PC([
  inventoryService,
  paymentService,
  orderService,
  notificationService,
  analyticsService
]);
// Blocks all services, poor performance
```

**✅ Correct:**
```typescript
// Use Saga pattern instead
await sagaOrchestrator.execute([
  { service: inventoryService, action: 'reserve' },
  { service: paymentService, action: 'charge' },
  { service: orderService, action: 'create' }
]);
// Non-blocking, better performance
```

### 2. Ignoring Network Partitions

**Problem:** 2PC/3PC can't handle network partitions well.

**❌ Wrong:**
```typescript
// Assuming network is always reliable
await coordinator.execute2PC(participants);
// Fails during network partition
```

**✅ Correct:**
```typescript
// Use Saga with eventual consistency
// Handles network partitions gracefully
await sagaOrchestrator.execute(operations);
```

### 3. Not Handling Coordinator Failure

**Problem:** Coordinator failure blocks all participants in 2PC.

**❌ Wrong:**
```typescript
// No coordinator recovery
class Coordinator {
  async execute() {
    // If this crashes, participants are stuck
  }
}
```

**✅ Correct:**
```typescript
// Implement coordinator recovery
class Coordinator {
  async execute() {
    // Persist state
    await this.persistState();
    // Participants can query state
  }
  
  async recover() {
    // Recover from persisted state
    const state = await this.loadState();
    // Resume transaction
  }
}
```

---

## ✅ Best Practices

### 1. Choose the Right Approach

✅ **Do:**
- Use Saga for microservices
- Use 2PC for short, simple transactions
- Use eventual consistency when possible
- Consider TCC for business-level compensation

❌ **Don't:**
- Use 2PC in microservices
- Use Saga when you need immediate consistency
- Ignore network partitions
- Over-engineer simple cases

### 2. Handle Failures

✅ **Do:**
- Implement retry logic
- Handle timeouts properly
- Monitor transaction success rates
- Log all transaction steps

❌ **Don't:**
- Ignore failure scenarios
- Use infinite timeouts
- Skip error handling
- Forget to test failures

### 3. Performance Optimization

✅ **Do:**
- Minimize transaction scope
- Use async where possible
- Cache coordinator state
- Monitor performance

❌ **Don't:**
- Create long transactions
- Block unnecessarily
- Ignore performance metrics
- Over-coordinate

---

## 🌍 Real-World Applications

### 1. Database Replication

**Use Case:** Replicate data across multiple databases.

**Approach:** 2PC for synchronous replication, eventual consistency for async.

### 2. Microservices Order Processing

**Use Case:** Process order across multiple services.

**Approach:** Saga pattern for coordination.

### 3. Financial Transactions

**Use Case:** Transfer money between banks.

**Approach:** TCC or Saga with strong compensation logic.

---

## 📊 Benefits and Trade-offs

### 2PC/3PC Benefits

✅ **Strong Consistency**
- ACID-like guarantees
- All or nothing
- Predictable behavior

✅ **Simple Model**
- Easy to understand
- Well-documented
- Standard protocol

### 2PC/3PC Trade-offs

❌ **Blocking**
- Can block on coordinator failure
- Poor performance
- Doesn't scale well

❌ **Single Point of Failure**
- Coordinator is critical
- Network partitions problematic
- Hard to recover

### Modern Alternatives Benefits

✅ **Scalability**
- No distributed locks
- Better performance
- Handles failures better

✅ **Flexibility**
- Eventual consistency
- Event-driven
- More resilient

### Modern Alternatives Trade-offs

❌ **Complexity**
- More complex to implement
- Need compensation logic
- Harder to reason about

❌ **Consistency**
- Eventual consistency
- Temporary inconsistencies
- Need to handle failures

---

## 🎓 Summary

### Key Takeaways

1. **Distributed Transactions** are hard - network and service failures complicate coordination
2. **2PC** provides strong consistency but blocks on coordinator failure
3. **3PC** reduces blocking but adds complexity
4. **Saga Pattern** uses compensation for eventual consistency
5. **TCC** provides business-level compensation
6. **Eventual Consistency** trades immediate consistency for availability
7. **Choose based on requirements** - consistency vs availability vs performance

### Best Practices

- Choose approach based on requirements
- Handle failures gracefully
- Monitor transaction success
- Optimize for your use case
- Test failure scenarios

### Next Steps

After mastering Distributed Transactions, consider:
- **[Saga Pattern](./2026-01-25-saga-pattern.md)** - Detailed Saga implementation
- **[Event-Driven Architecture](./2026-01-27-event-driven-architecture.md)** - Event-driven coordination
- **[CQRS](./2026-01-20-cqrs-pattern.md)** - Separate read and write models
- **[Microservices](./2026-01-24-microservices-architecture.md)** - Apply to microservices

---

## 📚 Additional Resources

**Original Papers:**
- Two-Phase Commit Protocol
- Three-Phase Commit Protocol
- Garcia-Molina, H., & Salem, K. (1987). "Sagas" - ACM SIGMOD Record

**Books:**
- "Microservices Patterns" by Chris Richardson
- "Designing Data-Intensive Applications" by Martin Kleppmann

**Related Topics:**
- [Saga Pattern](./2026-01-25-saga-pattern.md) - Compensation-based transactions
- [Event-Driven Architecture](./2026-01-27-event-driven-architecture.md) - Event coordination
- [CQRS](./2026-01-20-cqrs-pattern.md) - Command Query Separation

---




