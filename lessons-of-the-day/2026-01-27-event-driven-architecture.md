# Event-Driven Architecture (EDA) - Deep Dive

## 📋 Learning Objectives

- [ ] Understand Event-Driven Architecture definition and principles
- [ ] Learn how events enable loose coupling between components
- [ ] Master event bus, publishers, subscribers, and event handlers
- [ ] Recognize when to use EDA vs request-response patterns
- [ ] Understand event patterns (pub/sub, event streaming, event sourcing)
- [ ] Practice implementing EDA in real scenarios
- [ ] Learn integration with CQRS and Event Sourcing
- [ ] Explore real-world applications and use cases
- [ ] Understand common pitfalls and best practices
- [ ] Compare with traditional request-response and other patterns

---

## 🎯 Definition

**Event-Driven Architecture (EDA)** is an architectural pattern where system components communicate by producing and consuming events. Instead of direct method calls or request-response patterns, components publish events when something significant happens, and other components subscribe to and react to these events.

**Origin:**
- Concept from distributed systems and messaging patterns
- Popularized by Martin Fowler, Gregor Hohpe, and others
- Based on publish-subscribe and observer patterns
- Foundation for microservices communication

**Key Principles:**
- **Loose Coupling** - Components don't know about each other directly
- **Asynchronous Communication** - Events are processed asynchronously
- **Event-Driven** - System reacts to events, not requests
- **Scalability** - Components can scale independently
- **Resilience** - System continues even if some components fail

**Key Principle:**
> "Event-Driven Architecture enables systems to be loosely coupled and highly scalable. Components communicate through events, allowing them to evolve independently and react to changes in real-time. This pattern is particularly powerful for distributed systems and microservices." - Martin Fowler

**Alternative Formulation:**
> "In Event-Driven Architecture, components publish events when something significant happens, and other components subscribe to events they care about. This decouples producers from consumers, enabling asynchronous processing, better scalability, and system resilience."

---

## 🏗️ Structure

### Request-Response vs Event-Driven

**Request-Response (Traditional):**
```
┌─────────────────────────────────────────────────────────┐
│                    Service A                            │
│                                                          │
│  ┌──────────────┐         ┌──────────────┐            │
│  │   Client     │────────▶│   Service    │            │
│  │              │ Request │              │            │
│  │              │◀────────│              │            │
│  │              │Response │              │            │
│  └──────────────┘         └──────────────┘            │
│                                                          │
│  Tight Coupling - Direct dependencies                  │
│  Synchronous - Blocking calls                          │
│  Point-to-Point - One-to-one communication            │
└─────────────────────────────────────────────────────────┘
```

**Event-Driven Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│                    Event Bus / Message Broker            │
│  (Kafka, RabbitMQ, AWS EventBridge, etc.)                │
│                                                          │
│  ┌──────────────┐         ┌──────────────┐            │
│  │  Publisher   │────────▶│  Event Bus   │◀───────────│
│  │  (Service A) │  Event  │              │  Subscribe │
│  └──────────────┘         └──────────────┘            │
│                                                          │
│         │                        │                       │
│         │                        │                       │
│         ▼                        ▼                       │
│  ┌──────────────┐         ┌──────────────┐            │
│  │  Subscriber  │         │  Subscriber  │            │
│  │  (Service B) │         │  (Service C) │            │
│  └──────────────┘         └──────────────┘            │
│                                                          │
│  Loose Coupling - No direct dependencies               │
│  Asynchronous - Non-blocking                           │
│  Many-to-Many - Multiple publishers/subscribers         │
└─────────────────────────────────────────────────────────┘
```

### Event-Driven Architecture Components

**1. Event**
- Represents something that happened
- Immutable and timestamped
- Contains relevant data
- Examples: UserCreated, OrderPlaced, PaymentProcessed

**2. Event Publisher/Producer**
- Component that publishes events
- Doesn't know who consumes events
- Publishes to event bus
- Examples: Order Service, User Service

**3. Event Subscriber/Consumer**
- Component that subscribes to events
- Reacts to events
- Processes events asynchronously
- Examples: Notification Service, Analytics Service

**4. Event Bus/Message Broker**
- Infrastructure for event distribution
- Routes events to subscribers
- Provides reliability and ordering
- Examples: Kafka, RabbitMQ, AWS EventBridge

**5. Event Handler**
- Logic that processes events
- Contains business logic
- Updates state or triggers actions
- Examples: SendEmailHandler, UpdateInventoryHandler

---

## 🔍 Core Concepts Deep Dive

### 1. Events

**Definition:** An event is a record of something that happened in the system. It represents a fact that occurred at a specific point in time.

**Purpose:**
- Communicate state changes
- Trigger reactions in other components
- Enable loose coupling
- Provide audit trail

**Characteristics:**
- **Immutable** - Events never change after creation
- **Timestamped** - When the event occurred
- **Idempotent** - Processing same event multiple times is safe
- **Self-Contained** - Contains all necessary data
- **Named** - Clear, domain-specific names

**Example:**

```typescript
// Events/UserCreatedEvent.ts
export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly occurredAt: Date = new Date(),
    public readonly eventId: string = this.generateEventId(),
    public readonly version: number = 1
  ) {}

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Events/OrderPlacedEvent.ts
export class OrderPlacedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>,
    public readonly totalAmount: number,
    public readonly shippingAddress: {
      street: string;
      city: string;
      country: string;
    },
    public readonly occurredAt: Date = new Date(),
    public readonly eventId: string = this.generateEventId(),
    public readonly version: number = 1
  ) {}

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Events/PaymentProcessedEvent.ts
export class PaymentProcessedEvent {
  constructor(
    public readonly paymentId: string,
    public readonly orderId: string,
    public readonly amount: number,
    public readonly paymentMethod: string,
    public readonly status: 'success' | 'failed',
    public readonly occurredAt: Date = new Date(),
    public readonly eventId: string = this.generateEventId(),
    public readonly version: number = 1
  ) {}

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

**Key Points:**
- ✅ Events represent facts (something that happened)
- ✅ Immutable and timestamped
- ✅ Self-contained with all necessary data
- ✅ Clear, domain-specific names
- ❌ Don't include commands or requests
- ❌ Don't mutate events after creation

### 2. Event Bus / Message Broker

**Definition:** Infrastructure component that routes events from publishers to subscribers. Provides reliability, ordering, and scalability.

**Purpose:**
- Decouple publishers from subscribers
- Provide reliable event delivery
- Enable event routing and filtering
- Support scalability and performance

**Characteristics:**
- **Message Queue** - Stores events temporarily
- **Routing** - Routes events to subscribers
- **Reliability** - Ensures event delivery
- **Ordering** - Maintains event order (when needed)
- **Scalability** - Handles high throughput

**Types:**

**A. Message Queue (Point-to-Point)**
- One consumer per message
- Messages removed after consumption
- Examples: RabbitMQ, ActiveMQ

**B. Pub/Sub (Publish-Subscribe)**
- Multiple consumers per message
- Messages broadcast to all subscribers
- Examples: Redis Pub/Sub, AWS SNS

**C. Event Streaming**
- Events stored in log
- Multiple consumers can read
- Supports replay
- Examples: Apache Kafka, AWS Kinesis

**Example:**

```typescript
// Infrastructure/EventBus.ts
export interface EventBus {
  publish(event: Event): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): Promise<void>;
  unsubscribe(eventType: string, handler: EventHandler): Promise<void>;
}

// Infrastructure/InMemoryEventBus.ts
export class InMemoryEventBus implements EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  async publish(event: Event): Promise<void> {
    const eventType = event.constructor.name;
    const handlers = this.handlers.get(eventType) || [];

    // Publish to all subscribers asynchronously
    await Promise.all(
      handlers.map(handler => this.handleEvent(handler, event))
    );
  }

  async subscribe(eventType: string, handler: EventHandler): Promise<void> {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async unsubscribe(eventType: string, handler: EventHandler): Promise<void> {
    const handlers = this.handlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  private async handleEvent(handler: EventHandler, event: Event): Promise<void> {
    try {
      await handler.handle(event);
    } catch (error) {
      console.error(`Error handling event ${event.constructor.name}:`, error);
      // Implement retry logic or dead letter queue
    }
  }
}

// Infrastructure/KafkaEventBus.ts (Example with Kafka)
import { Kafka, Producer, Consumer } from 'kafkajs';

export class KafkaEventBus implements EventBus {
  private producer: Producer;
  private consumer: Consumer;
  private handlers: Map<string, EventHandler[]> = new Map();

  constructor(private kafka: Kafka) {
    this.producer = kafka.producer();
    this.consumer = kafka.consumer({ groupId: 'event-driven-architecture' });
  }

  async connect(): Promise<void> {
    await this.producer.connect();
    await this.consumer.connect();
  }

  async publish(event: Event): Promise<void> {
    const eventType = event.constructor.name;
    await this.producer.send({
      topic: eventType,
      messages: [{
        key: event.eventId,
        value: JSON.stringify(event),
        timestamp: event.occurredAt.getTime().toString()
      }]
    });
  }

  async subscribe(eventType: string, handler: EventHandler): Promise<void> {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
      await this.consumer.subscribe({ topic: eventType, fromBeginning: false });
    }
    this.handlers.get(eventType)!.push(handler);

    // Start consuming messages
    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (topic === eventType && message.value) {
          const event = JSON.parse(message.value.toString());
          const handlers = this.handlers.get(eventType) || [];
          await Promise.all(handlers.map(h => h.handle(event)));
        }
      }
    });
  }

  async unsubscribe(eventType: string, handler: EventHandler): Promise<void> {
    const handlers = this.handlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }
}
```

**Key Points:**
- ✅ Decouples publishers from subscribers
- ✅ Provides reliable event delivery
- ✅ Supports multiple subscribers
- ✅ Handles high throughput
- ❌ Adds infrastructure complexity
- ❌ Requires monitoring and maintenance

### 3. Event Handlers

**Definition:** Components that process events and execute business logic in response to events.

**Purpose:**
- React to events
- Execute business logic
- Update state
- Trigger side effects

**Characteristics:**
- **Event-Specific** - Handle specific event types
- **Idempotent** - Safe to process same event multiple times
- **Asynchronous** - Process events asynchronously
- **Independent** - Don't depend on other handlers
- **Resilient** - Handle errors gracefully

**Example:**

```typescript
// Handlers/EventHandler.ts
export interface EventHandler {
  handle(event: Event): Promise<void>;
}

// Handlers/SendWelcomeEmailHandler.ts
export class SendWelcomeEmailHandler implements EventHandler {
  constructor(private emailService: EmailService) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    await this.emailService.send({
      to: event.email,
      subject: 'Welcome!',
      body: `Welcome ${event.name}! Thank you for joining.`
    });
  }
}

// Handlers/UpdateInventoryHandler.ts
export class UpdateInventoryHandler implements EventHandler {
  constructor(private inventoryRepository: InventoryRepository) {}

  async handle(event: OrderPlacedEvent): Promise<void> {
    for (const item of event.items) {
      await this.inventoryRepository.decreaseStock(
        item.productId,
        item.quantity
      );
    }
  }
}

// Handlers/CreateShippingLabelHandler.ts
export class CreateShippingLabelHandler implements EventHandler {
  constructor(private shippingService: ShippingService) {}

  async handle(event: PaymentProcessedEvent): Promise<void> {
    if (event.status === 'success') {
      await this.shippingService.createLabel(event.orderId);
    }
  }
}

// Handlers/UpdateAnalyticsHandler.ts
export class UpdateAnalyticsHandler implements EventHandler {
  constructor(private analyticsRepository: AnalyticsRepository) {}

  async handle(event: OrderPlacedEvent): Promise<void> {
    await this.analyticsRepository.recordOrder({
      orderId: event.orderId,
      userId: event.userId,
      amount: event.totalAmount,
      timestamp: event.occurredAt
    });
  }
}
```

**Key Points:**
- ✅ Handle specific event types
- ✅ Idempotent processing
- ✅ Asynchronous execution
- ✅ Independent and isolated
- ❌ Don't have side effects beyond their scope
- ❌ Don't depend on other handlers

### 4. Event Patterns

#### Pattern 1: Simple Pub/Sub

**Use Case:** One publisher, multiple subscribers.

```typescript
// Publisher
await eventBus.publish(new UserCreatedEvent(userId, email, name));

// Subscribers
await eventBus.subscribe('UserCreatedEvent', sendWelcomeEmailHandler);
await eventBus.subscribe('UserCreatedEvent', createUserProfileHandler);
await eventBus.subscribe('UserCreatedEvent', updateAnalyticsHandler);
```

#### Pattern 2: Event Chaining

**Use Case:** Events trigger other events.

```typescript
// OrderPlacedEvent triggers PaymentProcessedEvent
export class ProcessPaymentHandler implements EventHandler {
  async handle(event: OrderPlacedEvent): Promise<void> {
    const payment = await this.paymentService.process({
      orderId: event.orderId,
      amount: event.totalAmount
    });

    await eventBus.publish(new PaymentProcessedEvent(
      payment.id,
      event.orderId,
      event.totalAmount,
      payment.method,
      payment.status
    ));
  }
}
```

#### Pattern 3: Saga Pattern

**Use Case:** Distributed transactions across services.

```typescript
// Saga orchestrator
export class OrderSaga {
  async handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    try {
      // Step 1: Reserve inventory
      await this.inventoryService.reserve(event.items);
      
      // Step 2: Process payment
      const payment = await this.paymentService.process({
        orderId: event.orderId,
        amount: event.totalAmount
      });

      if (payment.status === 'success') {
        // Step 3: Create shipping label
        await this.shippingService.createLabel(event.orderId);
        
        // Step 4: Confirm order
        await eventBus.publish(new OrderConfirmedEvent(event.orderId));
      } else {
        // Compensate: Release inventory
        await this.inventoryService.release(event.items);
        await eventBus.publish(new OrderCancelledEvent(event.orderId));
      }
    } catch (error) {
      // Compensate all steps
      await this.compensate(event);
    }
  }

  private async compensate(event: OrderPlacedEvent): Promise<void> {
    await this.inventoryService.release(event.items);
    await this.paymentService.refund(event.orderId);
    await eventBus.publish(new OrderCancelledEvent(event.orderId));
  }
}
```

#### Pattern 4: Event Sourcing Integration

**Use Case:** Store events as source of truth.

```typescript
// Event store integration
export class EventSourcingHandler implements EventHandler {
  constructor(private eventStore: EventStore) {}

  async handle(event: Event): Promise<void> {
    // Store event in event store
    await this.eventStore.append(event);
    
    // Publish to event bus for other handlers
    await eventBus.publish(event);
  }
}
```

### 5. Event-Driven Microservices

**Definition:** Microservices architecture where services communicate through events instead of direct API calls.

**Benefits:**
- Loose coupling between services
- Independent deployment
- Better scalability
- Resilience to failures

**Example:**

```typescript
// Order Service (Publisher)
export class OrderService {
  constructor(private eventBus: EventBus) {}

  async placeOrder(orderData: OrderData): Promise<string> {
    const order = await this.createOrder(orderData);
    
    // Publish event
    await this.eventBus.publish(new OrderPlacedEvent(
      order.id,
      order.userId,
      order.items,
      order.totalAmount,
      order.shippingAddress
    ));

    return order.id;
  }
}

// Inventory Service (Subscriber)
export class InventoryService {
  constructor(private eventBus: EventBus) {
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    this.eventBus.subscribe('OrderPlacedEvent', this.handleOrderPlaced.bind(this));
  }

  async handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    for (const item of event.items) {
      await this.decreaseStock(item.productId, item.quantity);
    }
  }
}

// Shipping Service (Subscriber)
export class ShippingService {
  constructor(private eventBus: EventBus) {
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    this.eventBus.subscribe('PaymentProcessedEvent', this.handlePaymentProcessed.bind(this));
  }

  async handlePaymentProcessed(event: PaymentProcessedEvent): Promise<void> {
    if (event.status === 'success') {
      await this.createShippingLabel(event.orderId);
    }
  }
}
```

---

## 💡 When to Use Event-Driven Architecture

### Use EDA When:

✅ **Loose Coupling Required**
- Services need to evolve independently
- Don't want direct dependencies
- Need flexibility in service communication
- Example: Microservices architecture

✅ **Asynchronous Processing**
- Operations can be processed asynchronously
- Don't need immediate responses
- Background processing needed
- Example: Email notifications, Analytics

✅ **High Scalability**
- Need to handle high event volumes
- Components scale independently
- Eventual consistency acceptable
- Example: High-traffic applications

✅ **Event Sourcing / CQRS**
- Using event sourcing
- Using CQRS pattern
- Need event replay
- Example: Financial systems, Audit systems

✅ **Real-Time Updates**
- Need real-time notifications
- Multiple consumers need updates
- Event streaming required
- Example: Live dashboards, Notifications

✅ **Distributed Systems**
- Multiple services need coordination
- Cross-service workflows
- Saga pattern needed
- Example: E-commerce, Order processing

### Don't Use EDA When:

❌ **Immediate Consistency Required**
- Need immediate responses
- Can't tolerate eventual consistency
- Synchronous operations required
- Example: Real-time trading, Critical transactions

❌ **Simple CRUD**
- Simple operations
- No complex workflows
- Direct calls sufficient
- Example: Simple admin panels

❌ **Low Complexity**
- Straightforward operations
- Overhead not justified
- Traditional approach sufficient
- Example: Small applications, MVPs

❌ **Tight Coupling Needed**
- Services must be tightly coupled
- Need immediate feedback
- Can't tolerate delays
- Example: Some real-time systems

---

## 🏛️ Implementation Patterns

### Pattern 1: Simple Event Bus

```
Publisher → Event Bus → Subscribers
```

### Pattern 2: Event Streaming

```
Publishers → Event Stream (Kafka) → Multiple Consumers
```

### Pattern 3: Event Sourcing + EDA

```
Commands → Aggregates → Events → Event Store → Event Bus → Handlers
```

### Pattern 4: Saga Pattern

```
Event 1 → Handler 1 → Event 2 → Handler 2 → Event 3 → Handler 3
   ↓         ↓          ↓         ↓          ↓         ↓
Compensate ←─────────────┴─────────┴──────────┴─────────┘
```

---

## 📚 Complete Implementation Example

### File Structure

```
src/
├── Events/                           # Events
│   ├── UserCreatedEvent.ts
│   ├── OrderPlacedEvent.ts
│   └── PaymentProcessedEvent.ts
│
├── Handlers/                         # Event Handlers
│   ├── SendWelcomeEmailHandler.ts
│   ├── UpdateInventoryHandler.ts
│   └── CreateShippingLabelHandler.ts
│
├── Infrastructure/                   # Infrastructure
│   ├── EventBus.ts
│   ├── InMemoryEventBus.ts
│   └── KafkaEventBus.ts
│
├── Services/                         # Services
│   ├── OrderService.ts
│   ├── InventoryService.ts
│   └── ShippingService.ts
│
└── Sagas/                            # Sagas
    └── OrderSaga.ts
```

### Complete Example

```typescript
// Services/OrderService.ts
export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private eventBus: EventBus
  ) {}

  async placeOrder(orderData: OrderData): Promise<string> {
    // Create order
    const order = await this.orderRepository.create({
      userId: orderData.userId,
      items: orderData.items,
      totalAmount: this.calculateTotal(orderData.items),
      shippingAddress: orderData.shippingAddress,
      status: 'pending'
    });

    // Publish event
    await this.eventBus.publish(new OrderPlacedEvent(
      order.id,
      order.userId,
      order.items,
      order.totalAmount,
      order.shippingAddress
    ));

    return order.id;
  }

  private calculateTotal(items: OrderItem[]): number {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
}

// Services/InventoryService.ts
export class InventoryService {
  constructor(
    private inventoryRepository: InventoryRepository,
    private eventBus: EventBus
  ) {
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    this.eventBus.subscribe('OrderPlacedEvent', this.handleOrderPlaced.bind(this));
    this.eventBus.subscribe('OrderCancelledEvent', this.handleOrderCancelled.bind(this));
  }

  async handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    for (const item of event.items) {
      const available = await this.inventoryRepository.getStock(item.productId);
      if (available < item.quantity) {
        // Publish out of stock event
        await this.eventBus.publish(new InventoryInsufficientEvent(
          event.orderId,
          item.productId,
          item.quantity,
          available
        ));
        return;
      }

      await this.inventoryRepository.decreaseStock(item.productId, item.quantity);
    }
  }

  async handleOrderCancelled(event: OrderCancelledEvent): Promise<void> {
    const order = await this.orderRepository.findById(event.orderId);
    if (!order) return;

    for (const item of order.items) {
      await this.inventoryRepository.increaseStock(item.productId, item.quantity);
    }
  }
}

// Application/Application.ts
export class Application {
  private eventBus: EventBus;
  private orderService: OrderService;
  private inventoryService: InventoryService;
  private shippingService: ShippingService;

  constructor() {
    // Initialize event bus
    this.eventBus = new InMemoryEventBus();

    // Initialize services
    this.orderService = new OrderService(
      new OrderRepository(),
      this.eventBus
    );

    this.inventoryService = new InventoryService(
      new InventoryRepository(),
      this.eventBus
    );

    this.shippingService = new ShippingService(
      new ShippingRepository(),
      this.eventBus
    );

    // Setup handlers
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Email handler
    this.eventBus.subscribe(
      'UserCreatedEvent',
      new SendWelcomeEmailHandler(new EmailService())
    );

    // Analytics handler
    this.eventBus.subscribe(
      'OrderPlacedEvent',
      new UpdateAnalyticsHandler(new AnalyticsRepository())
    );
  }

  async placeOrder(orderData: OrderData): Promise<string> {
    return await this.orderService.placeOrder(orderData);
  }
}
```

---

## ⚠️ Common Pitfalls

### 1. Not Handling Event Ordering

**Problem:** Events processed out of order cause incorrect state.

**❌ Wrong:**

```typescript
// ❌ No ordering guarantee
async handleEvents(events: Event[]): Promise<void> {
  await Promise.all(events.map(event => this.processEvent(event)));
}
```

**✅ Correct:**

```typescript
// ✅ Process events in order
async handleEvents(events: Event[]): Promise<void> {
  const sortedEvents = events.sort((a, b) => 
    a.occurredAt.getTime() - b.occurredAt.getTime()
  );
  
  for (const event of sortedEvents) {
    await this.processEvent(event);
  }
}
```

### 2. Not Making Handlers Idempotent

**Problem:** Processing same event multiple times causes incorrect state.

**❌ Wrong:**

```typescript
async handle(event: OrderPlacedEvent): Promise<void> {
  // ❌ Not idempotent - will send email multiple times
  await this.emailService.sendWelcomeEmail(event.userId);
}
```

**✅ Correct:**

```typescript
async handle(event: OrderPlacedEvent): Promise<void> {
  // ✅ Check if already processed
  if (await this.processedEventsRepository.exists(event.eventId)) {
    return;
  }

  await this.emailService.sendWelcomeEmail(event.userId);
  await this.processedEventsRepository.markProcessed(event.eventId);
}
```

### 3. Tight Coupling Through Events

**Problem:** Events contain too much coupling information.

**❌ Wrong:**

```typescript
// ❌ Event contains implementation details
export class OrderPlacedEvent {
  constructor(
    public readonly orderId: string,
    public readonly sendEmail: boolean, // ❌ Implementation detail
    public readonly updateInventory: boolean // ❌ Implementation detail
  ) {}
}
```

**✅ Correct:**

```typescript
// ✅ Event contains only domain data
export class OrderPlacedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly items: OrderItem[],
    public readonly totalAmount: number
  ) {}
}
```

### 4. Not Handling Failures

**Problem:** Event processing failures are not handled.

**❌ Wrong:**

```typescript
async handle(event: Event): Promise<void> {
  // ❌ No error handling
  await this.processEvent(event);
}
```

**✅ Correct:**

```typescript
async handle(event: Event): Promise<void> {
  try {
    await this.processEvent(event);
  } catch (error) {
    // Log error
    console.error(`Error processing event ${event.eventId}:`, error);
    
    // Retry or send to dead letter queue
    await this.deadLetterQueue.send(event);
    
    // Notify monitoring
    await this.monitoringService.recordError(event, error);
  }
}
```

---

## ✅ Best Practices

### 1. Event Design

✅ **Do:**
- Use clear, domain-specific event names
- Include all necessary data
- Make events immutable
- Version events
- Include timestamps and IDs

❌ **Don't:**
- Include implementation details
- Make events too large
- Mutate events
- Skip versioning

### 2. Handler Design

✅ **Do:**
- Make handlers idempotent
- Handle errors gracefully
- Keep handlers focused
- Test handlers independently
- Log processing

❌ **Don't:**
- Have side effects beyond scope
- Depend on other handlers
- Ignore errors
- Process events synchronously if not needed

### 3. Event Bus

✅ **Do:**
- Use appropriate message broker
- Monitor event bus health
- Handle backpressure
- Use dead letter queues
- Monitor event lag

❌ **Don't:**
- Ignore event bus failures
- Skip monitoring
- Ignore event ordering
- Overload event bus

### 4. Testing

✅ **Do:**
- Test event publishing
- Test event handling
- Test error scenarios
- Test idempotency
- Test event ordering

❌ **Don't:**
- Skip integration tests
- Ignore error cases
- Test in isolation only

---

## 🔀 EDA vs Other Patterns

### EDA vs Request-Response

**Request-Response:**
- Synchronous communication
- Direct dependencies
- Immediate feedback
- Tight coupling

**EDA:**
- Asynchronous communication
- Loose coupling
- Eventual consistency
- Independent services

**Key Difference:** EDA is asynchronous and decoupled, request-response is synchronous and coupled.

### EDA vs Message Queue

**Message Queue:**
- Point-to-point communication
- One consumer per message
- Request-response pattern
- Task distribution

**EDA:**
- Pub/sub communication
- Multiple consumers
- Event-driven pattern
- Event broadcasting

**Key Difference:** Message queues are for task distribution, EDA is for event broadcasting.

### EDA vs Event Sourcing

**Event Sourcing:**
- Events as source of truth
- State reconstruction
- Event store
- Complete history

**EDA:**
- Events for communication
- Loose coupling
- Event bus
- Real-time processing

**Key Difference:** Event Sourcing is about storage, EDA is about communication.

---

## 🌍 Real-World Applications

### 1. E-Commerce Platform

**Events:**
- OrderPlaced, PaymentProcessed, OrderShipped
- InventoryUpdated, ProductPriceChanged

**Benefits:**
- Loose coupling between services
- Independent scaling
- Real-time inventory updates
- Order processing workflow

### 2. Social Media Platform

**Events:**
- PostCreated, UserFollowed, CommentAdded
- LikeAdded, NotificationSent

**Benefits:**
- Real-time feed updates
- Independent service scaling
- Notification system
- Analytics processing

### 3. Banking System

**Events:**
- AccountCreated, TransactionProcessed
- BalanceUpdated, FraudDetected

**Benefits:**
- Audit trail
- Real-time fraud detection
- Independent service updates
- Compliance reporting

### 4. IoT Platform

**Events:**
- DeviceConnected, SensorReadingReceived
- AlertTriggered, CommandExecuted

**Benefits:**
- Real-time processing
- High throughput
- Independent device handling
- Scalable architecture

---

## 📊 Benefits and Trade-offs

### Benefits

✅ **Loose Coupling**
- Services independent
- Easy to evolve
- Flexible architecture
- Better maintainability

✅ **Scalability**
- Independent scaling
- High throughput
- Better resource utilization
- Handle peak loads

✅ **Resilience**
- Services can fail independently
- Event replay possible
- Better error handling
- System continues operating

✅ **Flexibility**
- Easy to add consumers
- Multiple views of data
- Technology diversity
- Independent deployment

### Trade-offs

❌ **Eventual Consistency**
- Not immediately consistent
- Need to handle consistency
- More complex error handling
- Potential data staleness

❌ **Complexity**
- More moving parts
- Event handling logic
- Infrastructure complexity
- Higher maintenance

❌ **Debugging**
- Harder to trace flows
- Distributed debugging
- Event ordering issues
- More complex testing

❌ **Latency**
- Asynchronous processing
- Not immediate responses
- Event processing delay
- Eventual consistency delay

---

## 🎓 Summary

### Key Takeaways

1. **Event-Driven Architecture** uses events for communication
2. **Loose Coupling** - Services don't know about each other
3. **Asynchronous** - Events processed asynchronously
4. **Scalable** - Components scale independently
5. **Resilient** - System continues even if components fail
6. **Event Bus** - Infrastructure for event distribution
7. **Event Handlers** - Process events and execute logic
8. **Patterns** - Pub/sub, event streaming, saga pattern

### When to Use

✅ **Use EDA When:**
- Loose coupling required
- Asynchronous processing needed
- High scalability needed
- Using event sourcing/CQRS
- Real-time updates needed
- Distributed systems

❌ **Avoid EDA When:**
- Immediate consistency required
- Simple CRUD operations
- Low complexity
- Tight coupling needed

### Best Practices

- Design events carefully
- Make handlers idempotent
- Handle errors gracefully
- Monitor event bus
- Test thoroughly
- Use appropriate message broker
- Version events
- Log everything

### Next Steps

After mastering Event-Driven Architecture, consider:
- **[CQRS](./2026-01-20-cqrs-pattern.md)** - Separate read and write models
- **[Event Sourcing](./2026-01-21-event-sourcing.md)** - Store events as source of truth
- **[Projections](./2026-01-21-projections.md)** - Transform events into read models
- **Microservices** - Apply EDA to microservices
- **Saga Pattern** - Distributed transactions

---

## 📚 Additional Resources

**Original Sources:**
- Martin Fowler - Event-Driven Architecture
- Gregor Hohpe - Enterprise Integration Patterns
- Udi Dahan - Event-Driven Architecture
- Apache Kafka documentation

**Related Patterns:**
- [CQRS](./2026-01-20-cqrs-pattern.md) (Command Query Responsibility Segregation)
- [Event Sourcing](./2026-01-21-event-sourcing.md) - Store events as source of truth
- [Projections](./2026-01-21-projections.md) - Transform events into read models
- Microservices Architecture
- Saga Pattern

**Books:**
- "Enterprise Integration Patterns" by Gregor Hohpe
- "Building Microservices" by Sam Newman
- "Designing Event-Driven Systems" by Ben Stopford
- "Microservices Patterns" by Chris Richardson

**Tools:**
- Apache Kafka - Event streaming platform
- RabbitMQ - Message broker
- AWS EventBridge - Serverless event bus
- Redis Pub/Sub - Pub/sub messaging
- NATS - Lightweight messaging system

---

