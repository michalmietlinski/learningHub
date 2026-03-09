# Saga Pattern - Distributed Transaction Management

## 📋 Learning Objectives

- [ ] Understand what the Saga pattern is and why it's needed
- [ ] Learn how Saga manages distributed transactions without distributed locks
- [ ] Master Saga orchestration vs choreography approaches
- [ ] Recognize when to use Saga vs traditional ACID transactions
- [ ] Understand compensation and rollback strategies
- [ ] Practice implementing Saga in real scenarios
- [ ] Learn common patterns and best practices
- [ ] Understand trade-offs and limitations

---

## 🎯 Definition

**Saga Pattern** is a design pattern for managing distributed transactions across multiple services without using distributed locks or two-phase commit. Instead, it uses a sequence of local transactions, each with a compensating transaction that can undo its effects if the saga needs to be rolled back.

**Origin:**
- Introduced by Hector Garcia-Molina and Kenneth Salem in 1987
- Popularized in microservices and event-driven architectures
- Alternative to Two-Phase Commit (2PC) for distributed systems
- Enables eventual consistency in distributed transactions

**Key Principles:**
- **Local Transactions** - Each step is a local ACID transaction
- **Compensation** - Each step has a compensating action to undo it
- **Eventual Consistency** - System eventually becomes consistent
- **No Distributed Locks** - Avoids blocking and coordination overhead
- **Failure Recovery** - Can recover from partial failures

**Key Principle:**
> "A saga is a sequence of local transactions. Each local transaction updates the database and publishes a message or event to trigger the next local transaction in the saga. If a local transaction fails, the saga executes compensating transactions that undo the changes made by the preceding local transactions." - Microservices Patterns

**Alternative Formulation:**
> "Saga pattern breaks down a distributed transaction into a series of local transactions, each with a compensating action. If any step fails, compensating transactions are executed in reverse order to rollback the saga, ensuring eventual consistency without distributed locks."

---

## 🏗️ Structure

### Traditional ACID Transaction vs Saga

**Traditional ACID Transaction (Single Database):**
```
┌─────────────────────────────────────────────────────────┐
│              ACID Transaction                            │
│                                                          │
│  BEGIN TRANSACTION                                      │
│    UPDATE users SET balance = balance - 100             │
│    UPDATE orders SET status = 'paid'                    │
│    INSERT INTO payments (amount, order_id)              │
│  COMMIT                                                 │
│                                                          │
│  → All or nothing                                       │
│  → Atomic, Consistent, Isolated, Durable                │
│  → Works in single database                             │
└─────────────────────────────────────────────────────────┘
```

**Saga Pattern (Distributed):**
```
┌─────────────────────────────────────────────────────────┐
│              Saga Transaction                           │
│                                                          │
│  Step 1: Reserve Inventory (Service A)                 │
│    → Local transaction                                  │
│    → Publish: InventoryReserved                        │
│                                                          │
│  Step 2: Charge Payment (Service B)                    │
│    → Local transaction                                  │
│    → Publish: PaymentCharged                          │
│                                                          │
│  Step 3: Create Order (Service C)                      │
│    → Local transaction                                  │
│    → Publish: OrderCreated                             │
│                                                          │
│  If Step 3 fails:                                       │
│    → Compensate Step 2: Refund Payment                │
│    → Compensate Step 1: Release Inventory             │
│                                                          │
│  → Eventual consistency                                 │
│  → No distributed locks                                 │
└─────────────────────────────────────────────────────────┘
```

### Comparison: ACID vs Saga

| Aspect | ACID Transaction | Saga Pattern |
|--------|------------------|--------------|
| **Scope** | Single database | Multiple services |
| **Consistency** | Immediate (strong) | Eventual |
| **Locks** | Database locks | No distributed locks |
| **Blocking** | Can block | Non-blocking |
| **Failure** | Rollback all | Compensate in reverse |
| **Complexity** | Simple | More complex |
| **Use Case** | Single database | Distributed systems |

---

## 🔍 Core Concepts

### 1. What is a Saga?

**Definition:** A saga is a sequence of local transactions that together form a distributed transaction. Each local transaction updates data in one service and publishes an event or message to trigger the next step.

**Characteristics:**
- Each step is a local ACID transaction
- Steps execute sequentially
- Each step has a compensating transaction
- Failure triggers compensation in reverse order
- System eventually becomes consistent

**Example: E-commerce Order Saga**

```typescript
// Saga: Create Order
// Step 1: Reserve Inventory
async function reserveInventory(orderId: string, items: Item[]) {
  // Local transaction in Inventory Service
  await inventoryService.reserve(orderId, items);
  // Publish event
  await eventBus.publish(new InventoryReservedEvent(orderId, items));
}

// Step 2: Charge Payment
async function chargePayment(orderId: string, amount: number) {
  // Local transaction in Payment Service
  await paymentService.charge(orderId, amount);
  // Publish event
  await eventBus.publish(new PaymentChargedEvent(orderId, amount));
}

// Step 3: Create Order
async function createOrder(orderId: string, orderData: OrderData) {
  // Local transaction in Order Service
  await orderService.create(orderId, orderData);
  // Publish event
  await eventBus.publish(new OrderCreatedEvent(orderId));
}

// Compensating Transactions
async function releaseInventory(orderId: string) {
  await inventoryService.release(orderId);
}

async function refundPayment(orderId: string) {
  await paymentService.refund(orderId);
}

async function cancelOrder(orderId: string) {
  await orderService.cancel(orderId);
}
```

### 2. Saga Orchestration vs Choreography

#### Orchestration (Centralized)

**Definition:** A central orchestrator coordinates the saga by invoking each service and managing the flow.

**Characteristics:**
- Central coordinator (orchestrator)
- Orchestrator knows all steps
- Easier to understand flow
- Centralized error handling
- Can be a bottleneck

```typescript
// Saga Orchestrator
class OrderSagaOrchestrator {
  async execute(orderData: OrderData): Promise<void> {
    const orderId = generateId();
    
    try {
      // Step 1: Reserve Inventory
      await this.inventoryService.reserve(orderId, orderData.items);
      
      // Step 2: Charge Payment
      await this.paymentService.charge(orderId, orderData.total);
      
      // Step 3: Create Order
      await this.orderService.create(orderId, orderData);
      
    } catch (error) {
      // Compensate in reverse order
      await this.compensate(orderId, error.step);
    }
  }
  
  private async compensate(orderId: string, failedStep: number) {
    if (failedStep >= 3) await this.orderService.cancel(orderId);
    if (failedStep >= 2) await this.paymentService.refund(orderId);
    if (failedStep >= 1) await this.inventoryService.release(orderId);
  }
}
```

#### Choreography (Decentralized)

**Definition:** Each service listens to events and decides what to do next. No central coordinator.

**Characteristics:**
- No central coordinator
- Services react to events
- More decoupled
- Harder to understand flow
- Distributed error handling

```typescript
// Inventory Service (Choreography)
class InventoryService {
  @EventHandler(OrderCreatedEvent)
  async handleOrderCreated(event: OrderCreatedEvent) {
    try {
      await this.reserve(event.orderId, event.items);
      await this.eventBus.publish(new InventoryReservedEvent(event.orderId));
    } catch (error) {
      await this.eventBus.publish(new InventoryReservationFailedEvent(event.orderId));
    }
  }
  
  @EventHandler(PaymentChargedEvent)
  async handlePaymentCharged(event: PaymentChargedEvent) {
    // Inventory already reserved, no action needed
  }
  
  @EventHandler(OrderCancelledEvent)
  async handleOrderCancelled(event: OrderCancelledEvent) {
    await this.release(event.orderId);
  }
}

// Payment Service (Choreography)
class PaymentService {
  @EventHandler(InventoryReservedEvent)
  async handleInventoryReserved(event: InventoryReservedEvent) {
    try {
      await this.charge(event.orderId, event.amount);
      await this.eventBus.publish(new PaymentChargedEvent(event.orderId));
    } catch (error) {
      await this.eventBus.publish(new PaymentFailedEvent(event.orderId));
      // Trigger compensation
      await this.eventBus.publish(new OrderCancelledEvent(event.orderId));
    }
  }
}
```

### 3. Compensation Strategies

**Compensation** is the action that undoes the effects of a completed local transaction.

#### Types of Compensation:

**1. Reversible Operations**
- Simple undo (e.g., release inventory, refund payment)
- Exact reverse of the operation

```typescript
// Original: Reserve inventory
await inventoryService.reserve(orderId, items);

// Compensation: Release inventory
await inventoryService.release(orderId);
```

**2. Compensating Actions**
- Different action to undo effect (e.g., cancel order instead of delete)
- May not be exact reverse

```typescript
// Original: Create order
await orderService.create(orderId, orderData);

// Compensation: Cancel order (not delete)
await orderService.cancel(orderId);
```

**3. No Compensation Needed**
- Idempotent operations
- Operations that can be safely repeated

```typescript
// Reading data doesn't need compensation
const user = await userService.getUser(userId);
```

### 4. Saga State Management

**Saga State** tracks the progress of a saga execution.

```typescript
enum SagaStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  COMPENSATING = 'compensating',
  COMPENSATED = 'compensated',
  FAILED = 'failed'
}

interface SagaState {
  sagaId: string;
  status: SagaStatus;
  currentStep: number;
  steps: SagaStep[];
  compensationData: Map<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface SagaStep {
  stepNumber: number;
  service: string;
  action: string;
  status: 'pending' | 'completed' | 'failed' | 'compensated';
  compensationAction?: string;
}
```

---

## 💡 When to Use Saga Pattern

### Use Saga Pattern When:

✅ **Distributed Transactions**
- Multiple services need to coordinate
- Each service has its own database
- Cannot use distributed transactions (2PC)

✅ **Eventual Consistency Acceptable**
- Don't need immediate consistency
- Can tolerate temporary inconsistencies
- Business logic allows eventual consistency

✅ **Long-Running Transactions**
- Transactions that take time
- Cannot hold locks for long periods
- Need non-blocking approach

✅ **Microservices Architecture**
- Services are independent
- Each service owns its data
- Need to coordinate across services

### Don't Use Saga Pattern When:

❌ **Immediate Consistency Required**
- Need ACID guarantees
- Cannot tolerate temporary inconsistencies
- Strong consistency is critical

❌ **Simple Single-Database Operations**
- All operations in one database
- Can use traditional transactions
- Saga adds unnecessary complexity

❌ **Compensation is Impossible**
- Cannot undo operations
- No way to compensate
- Operations are irreversible

---

## 🏛️ Implementation Examples

### Example 1: E-commerce Order Processing (Orchestration)

```typescript
class OrderSagaOrchestrator {
  constructor(
    private inventoryService: InventoryService,
    private paymentService: PaymentService,
    private orderService: OrderService,
    private sagaRepository: SagaRepository
  ) {}

  async execute(orderData: OrderData): Promise<string> {
    const sagaId = generateId();
    const sagaState: SagaState = {
      sagaId,
      status: SagaStatus.IN_PROGRESS,
      currentStep: 0,
      steps: [
        { stepNumber: 1, service: 'inventory', action: 'reserve', status: 'pending' },
        { stepNumber: 2, service: 'payment', action: 'charge', status: 'pending' },
        { stepNumber: 3, service: 'order', action: 'create', status: 'pending' }
      ],
      compensationData: new Map(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.sagaRepository.save(sagaState);

    try {
      // Step 1: Reserve Inventory
      sagaState.currentStep = 1;
      const inventoryResult = await this.inventoryService.reserve(
        sagaId,
        orderData.items
      );
      sagaState.steps[0].status = 'completed';
      sagaState.compensationData.set('inventory', inventoryResult);
      await this.sagaRepository.save(sagaState);

      // Step 2: Charge Payment
      sagaState.currentStep = 2;
      const paymentResult = await this.paymentService.charge(
        sagaId,
        orderData.total
      );
      sagaState.steps[1].status = 'completed';
      sagaState.compensationData.set('payment', paymentResult);
      await this.sagaRepository.save(sagaState);

      // Step 3: Create Order
      sagaState.currentStep = 3;
      await this.orderService.create(sagaId, orderData);
      sagaState.steps[2].status = 'completed';
      sagaState.status = SagaStatus.COMPLETED;
      await this.sagaRepository.save(sagaState);

      return sagaId;

    } catch (error) {
      await this.compensate(sagaState, error);
      throw error;
    }
  }

  private async compensate(sagaState: SagaState, error: any): Promise<void> {
    sagaState.status = SagaStatus.COMPENSATING;
    await this.sagaRepository.save(sagaState);

    // Compensate in reverse order
    for (let i = sagaState.currentStep - 1; i >= 0; i--) {
      const step = sagaState.steps[i];
      if (step.status === 'completed') {
        try {
          switch (step.stepNumber) {
            case 3:
              await this.orderService.cancel(sagaState.sagaId);
              break;
            case 2:
              await this.paymentService.refund(sagaState.sagaId);
              break;
            case 1:
              await this.inventoryService.release(sagaState.sagaId);
              break;
          }
          step.status = 'compensated';
        } catch (compError) {
          // Log compensation failure
          sagaState.status = SagaStatus.FAILED;
          throw compError;
        }
      }
    }

    sagaState.status = SagaStatus.COMPENSATED;
    await this.sagaRepository.save(sagaState);
  }
}
```

### Example 2: Travel Booking (Choreography)

```typescript
// Flight Service
class FlightService {
  @EventHandler(TripBookingInitiatedEvent)
  async handleTripBookingInitiated(event: TripBookingInitiatedEvent) {
    try {
      const flight = await this.bookFlight(event.tripId, event.flightDetails);
      await this.eventBus.publish(
        new FlightBookedEvent(event.tripId, flight.id)
      );
    } catch (error) {
      await this.eventBus.publish(
        new FlightBookingFailedEvent(event.tripId, error.message)
      );
    }
  }

  @EventHandler(TripCancelledEvent)
  async handleTripCancelled(event: TripCancelledEvent) {
    await this.cancelFlight(event.tripId);
  }
}

// Hotel Service
class HotelService {
  @EventHandler(FlightBookedEvent)
  async handleFlightBooked(event: FlightBookedEvent) {
    try {
      const hotel = await this.bookHotel(event.tripId, event.hotelDetails);
      await this.eventBus.publish(
        new HotelBookedEvent(event.tripId, hotel.id)
      );
    } catch (error) {
      await this.eventBus.publish(
        new HotelBookingFailedEvent(event.tripId, error.message)
      );
      // Trigger compensation
      await this.eventBus.publish(new TripCancelledEvent(event.tripId));
    }
  }

  @EventHandler(TripCancelledEvent)
  async handleTripCancelled(event: TripCancelledEvent) {
    await this.cancelHotel(event.tripId);
  }
}

// Car Rental Service
class CarRentalService {
  @EventHandler(HotelBookedEvent)
  async handleHotelBooked(event: HotelBookedEvent) {
    try {
      const car = await this.rentCar(event.tripId, event.carDetails);
      await this.eventBus.publish(
        new CarRentedEvent(event.tripId, car.id)
      );
      // Trip fully booked
      await this.eventBus.publish(new TripBookedEvent(event.tripId));
    } catch (error) {
      await this.eventBus.publish(
        new CarRentalFailedEvent(event.tripId, error.message)
      );
      // Trigger compensation
      await this.eventBus.publish(new TripCancelledEvent(event.tripId));
    }
  }

  @EventHandler(TripCancelledEvent)
  async handleTripCancelled(event: TripCancelledEvent) {
    await this.cancelCarRental(event.tripId);
  }
}
```

---

## ⚠️ Common Pitfalls

### 1. Forgetting Compensation Logic

**Problem:** Not implementing compensation for all steps.

**❌ Wrong:**
```typescript
// Step 1: Reserve inventory (no compensation)
await inventoryService.reserve(orderId, items);

// Step 2: Charge payment (no compensation)
await paymentService.charge(orderId, amount);
```

**✅ Correct:**
```typescript
// Step 1: Reserve inventory
await inventoryService.reserve(orderId, items);
// Compensation: Release inventory
async function compensateStep1(orderId: string) {
  await inventoryService.release(orderId);
}

// Step 2: Charge payment
await paymentService.charge(orderId, amount);
// Compensation: Refund payment
async function compensateStep2(orderId: string) {
  await paymentService.refund(orderId);
}
```

### 2. Compensation Failures

**Problem:** Compensation itself can fail, leaving system inconsistent.

**❌ Wrong:**
```typescript
// If compensation fails, saga is stuck
await paymentService.refund(orderId); // Might fail
```

**✅ Correct:**
```typescript
// Implement retry and monitoring for compensation
async function compensateWithRetry(orderId: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await paymentService.refund(orderId);
      return; // Success
    } catch (error) {
      if (i === maxRetries - 1) {
        // Log and alert - manual intervention needed
        await alertService.sendAlert({
          type: 'compensation_failed',
          sagaId: orderId,
          step: 'refund_payment'
        });
        throw error;
      }
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

### 3. Not Handling Idempotency

**Problem:** Retrying a step that already completed can cause duplicate operations.

**❌ Wrong:**
```typescript
// Not idempotent - can charge twice
await paymentService.charge(orderId, amount);
```

**✅ Correct:**
```typescript
// Idempotent - check if already charged
async function chargePayment(orderId: string, amount: number) {
  const existing = await paymentService.getPayment(orderId);
  if (existing && existing.status === 'charged') {
    return existing; // Already charged
  }
  return await paymentService.charge(orderId, amount);
}
```

---

## ✅ Best Practices

### 1. Saga Design

✅ **Do:**
- Keep sagas short (few steps)
- Make each step idempotent
- Implement proper compensation
- Track saga state
- Handle timeouts

❌ **Don't:**
- Create long sagas (many steps)
- Skip compensation logic
- Ignore idempotency
- Forget error handling
- Block on long operations

### 2. Compensation

✅ **Do:**
- Implement compensation for all steps
- Make compensation idempotent
- Handle compensation failures
- Log compensation actions
- Monitor compensation success rate

❌ **Don't:**
- Skip compensation
- Assume compensation always works
- Ignore compensation failures
- Forget to test compensation

### 3. State Management

✅ **Do:**
- Persist saga state
- Track current step
- Store compensation data
- Enable saga recovery
- Monitor saga progress

❌ **Don't:**
- Keep state only in memory
- Lose saga state on failure
- Forget to update state
- Skip state persistence

---

## 🔀 Saga vs Other Patterns

### Saga vs Two-Phase Commit (2PC)

**2PC:**
- Distributed locking
- Blocking protocol
- Strong consistency
- Coordinator can be bottleneck
- Doesn't scale well

**Saga:**
- No distributed locks
- Non-blocking
- Eventual consistency
- No single point of failure
- Scales better

See **[Distributed Transactions](./2026-01-26-distributed-transactions.md)** for detailed comparison.

### Saga vs Event Sourcing

**Event Sourcing:**
- Events are source of truth
- Rebuild state from events
- Full audit trail
- Time travel capability

**Saga:**
- Coordinates transactions
- Uses events for coordination
- Can use event sourcing
- Focus on transaction management

**They work together:** Saga can use event sourcing for state management.

---

## 🌍 Real-World Applications

### 1. E-commerce Order Processing

**Use Case:** Process order across inventory, payment, and order services.

```typescript
// Order Saga
1. Reserve Inventory → 2. Charge Payment → 3. Create Order
// If step 3 fails: Cancel Order → Refund Payment → Release Inventory
```

### 2. Travel Booking

**Use Case:** Book flight, hotel, and car rental together.

```typescript
// Trip Booking Saga
1. Book Flight → 2. Book Hotel → 3. Rent Car
// If step 3 fails: Cancel Car → Cancel Hotel → Cancel Flight
```

### 3. Financial Transactions

**Use Case:** Transfer money between accounts in different services.

```typescript
// Money Transfer Saga
1. Debit Source Account → 2. Credit Destination Account
// If step 2 fails: Credit Source Account (refund)
```

---

## 📊 Benefits and Trade-offs

### Benefits

✅ **Scalability**
- No distributed locks
- Non-blocking operations
- Better performance
- Handles long transactions

✅ **Flexibility**
- Works across services
- Supports different databases
- Event-driven coordination
- Decoupled services

### Trade-offs

❌ **Complexity**
- More complex than ACID
- Need compensation logic
- State management required
- Error handling is harder

❌ **Consistency**
- Eventual consistency only
- Temporary inconsistencies
- Need to handle failures
- Compensation can fail

---

## 🎓 Summary

### Key Takeaways

1. **Saga Pattern** manages distributed transactions without distributed locks
2. **Local Transactions** - Each step is a local ACID transaction
3. **Compensation** - Each step has a compensating action
4. **Orchestration** - Central coordinator manages flow
5. **Choreography** - Services coordinate via events
6. **Eventual Consistency** - System eventually becomes consistent
7. **Idempotency** - All operations must be idempotent

### When to Use

✅ **Use Saga When:**
- Distributed transactions across services
- Eventual consistency is acceptable
- Long-running transactions
- Microservices architecture

❌ **Avoid Saga When:**
- Immediate consistency required
- Single database operations
- Compensation is impossible

### Best Practices

- Keep sagas short
- Make operations idempotent
- Implement proper compensation
- Track saga state
- Handle compensation failures
- Monitor saga execution

### Next Steps

After mastering Saga Pattern, consider:
- **[Distributed Transactions](./2026-01-26-distributed-transactions.md)** - 2PC, 3PC, and other approaches
- **[Event-Driven Architecture](./2026-01-27-event-driven-architecture.md)** - Event-driven coordination
- **[CQRS](./2026-01-20-cqrs-pattern.md)** - Separate read and write models
- **[Microservices](./2026-01-24-microservices-architecture.md)** - Apply Saga to microservices

---

## 📚 Additional Resources

**Original Paper:**
- Garcia-Molina, H., & Salem, K. (1987). "Sagas" - ACM SIGMOD Record

**Books:**
- "Microservices Patterns" by Chris Richardson
- "Building Microservices" by Sam Newman

**Related Topics:**
- [Distributed Transactions](./2026-01-26-distributed-transactions.md) - 2PC, 3PC, and alternatives
- [Event-Driven Architecture](./2026-01-27-event-driven-architecture.md) - Event coordination
- [CQRS](./2026-01-20-cqrs-pattern.md) - Command Query Separation

---


























