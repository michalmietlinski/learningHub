# Event-Driven Architecture - Deep Dive

## 📋 Learning Objectives

- [ ] Understand Event-Driven Architecture (EDA) principles and benefits
- [ ] Learn when to use EDA vs other architectural patterns
- [ ] Master event sourcing, CQRS, and pub/sub patterns
- [ ] Recognize real-world applications (microservices, real-time systems, IoT)
- [ ] Understand event buses, message brokers, and event streams
- [ ] Practice implementing EDA in different scenarios
- [ ] Learn common pitfalls and best practices
- [ ] Explore modern variations (Kafka, RabbitMQ, AWS EventBridge)
- [ ] Understand scalability, reliability, and consistency in EDA

---

## 🎯 Definition

**Event-Driven Architecture (EDA)** is a software architecture pattern that promotes the production, detection, consumption, and reaction to events. It enables loose coupling between components and supports asynchronous, reactive systems.

**Key Principles:**
- **Events as First-Class Citizens** - Events represent significant business occurrences
- **Loose Coupling** - Components communicate through events, not direct calls
- **Asynchronous Processing** - Events are processed asynchronously
- **Scalability** - Systems can scale by adding event processors
- **Reactivity** - Systems react to events in real-time
- Also known as: **Event-Based Architecture**, **Reactive Architecture**

**Key Principle:**
> "React to events, don't poll for changes" - Event-Driven Architecture decouples components by having them communicate through events. When something significant happens, an event is published, and interested components react to it asynchronously, enabling scalable, responsive systems.

---

## 🏗️ Structure

### Core Components

```
Event Producer
├── publish(event: Event): void
└── emit(event: Event): void

Event
├── type: string
├── payload: any
├── timestamp: Date
├── source: string
└── id: string

Event Bus / Message Broker
├── subscribe(eventType: string, handler: EventHandler): void
├── publish(event: Event): void
├── unsubscribe(eventType: string, handler: EventHandler): void
└── route(event: Event): void

Event Handler / Consumer
├── handle(event: Event): void
└── process(event: Event): Promise<void>

Event Store
├── append(event: Event): void
├── getEvents(streamId: string): Event[]
└── replay(streamId: string): void
```

### Architecture Patterns

**1. Mediator Topology (Event Bus)**
- Central event bus routes events
- Components publish/subscribe to bus
- Simple, centralized routing

**2. Broker Topology (Message Broker)**
- Distributed message brokers
- Events flow through broker network
- More scalable, distributed

**3. Event Sourcing**
- Store all events as log
- Reconstruct state by replaying events
- Complete audit trail

**4. CQRS (Command Query Responsibility Segregation)**
- Separate read and write models
- Commands generate events
- Queries read from optimized views

### Key Concepts

**Events:**
- Represent something that happened
- Immutable facts
- Carry all necessary data
- Have unique identifiers

**Event Producers:**
- Generate events when something happens
- Don't know about consumers
- Publish to event bus/broker

**Event Consumers:**
- Subscribe to event types
- Process events asynchronously
- Can be multiple consumers per event

**Event Bus/Broker:**
- Routes events to subscribers
- Decouples producers and consumers
- Can provide guarantees (at-least-once, exactly-once)

**Event Store:**
- Persists all events
- Enables event replay
- Supports event sourcing

**Asynchronous Processing:**
- Non-blocking event handling
- Better scalability
- Improved responsiveness

---

## 💡 When to Use

### Use Event-Driven Architecture When:

✅ **You need loose coupling between components**
- Example: Microservices architecture
- Example: Distributed systems
- Example: Third-party integrations
- Example: Plugin architectures

✅ **You need real-time responsiveness**
- Example: Real-time dashboards
- Example: Live notifications
- Example: IoT systems
- Example: Chat applications

✅ **You need high scalability**
- Example: High-throughput systems
- Example: Variable load patterns
- Example: Horizontal scaling needs
- Example: Peak traffic handling

✅ **You need audit trails and event history**
- Example: Financial systems
- Example: Compliance requirements
- Example: Debugging complex flows
- Example: Event sourcing

✅ **You have independent, asynchronous workflows**
- Example: Order processing
- Example: Email notifications
- Example: Analytics processing
- Example: Background jobs

✅ **You need to integrate multiple systems**
- Example: Enterprise integration
- Example: Legacy system integration
- Example: Multi-tenant systems
- Example: B2B integrations

### Don't Use When:

❌ **You need strong consistency** - Event-driven is eventually consistent
❌ **Simple request-response is sufficient** - EDA adds complexity
❌ **Synchronous workflows are required** - EDA is asynchronous
❌ **Low latency is critical** - Event processing adds latency
❌ **You can't handle eventual consistency** - Events propagate asynchronously

---

## 🔨 Implementation Examples

### Example 1: Basic Event Bus

```typescript
// Event Interface
interface Event {
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
  id: string;
}

// Event Handler Type
type EventHandler = (event: Event) => void | Promise<void>;

// Event Bus
class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private eventHistory: Event[] = [];
  private maxHistory: number = 1000;

  // Subscribe to event type
  subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
    
    console.log(`Handler subscribed to ${eventType}`);
    
    // Return unsubscribe function
    return () => this.unsubscribe(eventType, handler);
  }

  // Unsubscribe from event type
  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      console.log(`Handler unsubscribed from ${eventType}`);
    }
  }

  // Publish event
  async publish(event: Event): Promise<void> {
    console.log(`\nPublishing event: ${event.type}`, event.payload);
    
    // Store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift();
    }

    // Get handlers for this event type
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      // Execute all handlers asynchronously
      const promises = Array.from(handlers).map(async handler => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Error in handler for ${event.type}:`, error);
        }
      });
      
      await Promise.all(promises);
    }
  }

  // Create event helper
  createEvent(type: string, payload: any, source: string): Event {
    return {
      type,
      payload,
      timestamp: new Date(),
      source,
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  // Get event history
  getHistory(eventType?: string): Event[] {
    if (eventType) {
      return this.eventHistory.filter(e => e.type === eventType);
    }
    return [...this.eventHistory];
  }
}

// Usage
const eventBus = new EventBus();

// User Service
class UserService {
  constructor(private eventBus: EventBus) {
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    // Subscribe to user-related events
    this.eventBus.subscribe('user:created', this.handleUserCreated.bind(this));
  }

  private async handleUserCreated(event: Event): Promise<void> {
    console.log(`UserService: Processing user creation`, event.payload);
    // Process user creation
  }

  createUser(userData: any): void {
    console.log('UserService: Creating user...');
    const event = this.eventBus.createEvent(
      'user:created',
      userData,
      'UserService'
    );
    this.eventBus.publish(event);
  }
}

// Email Service
class EmailService {
  constructor(private eventBus: EventBus) {
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    this.eventBus.subscribe('user:created', this.sendWelcomeEmail.bind(this));
  }

  private async sendWelcomeEmail(event: Event): Promise<void> {
    console.log(`EmailService: Sending welcome email to ${event.payload.email}`);
    // Send email
  }
}

// Analytics Service
class AnalyticsService {
  constructor(private eventBus: EventBus) {
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    this.eventBus.subscribe('user:created', this.trackUserCreation.bind(this));
  }

  private async trackUserCreation(event: Event): Promise<void> {
    console.log(`AnalyticsService: Tracking user creation event`);
    // Track analytics
  }
}

// Usage
const bus = new EventBus();
const userService = new UserService(bus);
const emailService = new EmailService(bus);
const analyticsService = new AnalyticsService(bus);

console.log('=== Event-Driven Architecture Example ===\n');

userService.createUser({
  id: '123',
  name: 'Alice',
  email: 'alice@example.com'
});

console.log('\n--- Event History ---');
console.log(bus.getHistory('user:created').length, 'user:created events');
```

### Example 2: Event Sourcing

```typescript
// Domain Event
interface DomainEvent {
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  eventData: any;
  version: number;
  timestamp: Date;
}

// Event Store
class EventStore {
  private events: Map<string, DomainEvent[]> = new Map();

  // Append event to stream
  append(aggregateId: string, event: DomainEvent): void {
    if (!this.events.has(aggregateId)) {
      this.events.set(aggregateId, []);
    }
    
    const stream = this.events.get(aggregateId)!;
    event.version = stream.length + 1;
    stream.push(event);
    
    console.log(`Event appended: ${event.eventType} to ${aggregateId} (v${event.version})`);
  }

  // Get all events for aggregate
  getEvents(aggregateId: string): DomainEvent[] {
    return this.events.get(aggregateId) || [];
  }

  // Get events from version
  getEventsFromVersion(aggregateId: string, fromVersion: number): DomainEvent[] {
    const allEvents = this.getEvents(aggregateId);
    return allEvents.filter(e => e.version >= fromVersion);
  }
}

// Aggregate Root
abstract class AggregateRoot {
  protected id: string;
  protected version: number = 0;
  private uncommittedEvents: DomainEvent[] = [];

  constructor(id: string) {
    this.id = id;
  }

  getId(): string {
    return this.id;
  }

  getVersion(): number {
    return this.version;
  }

  // Get uncommitted events
  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  // Mark events as committed
  markEventsAsCommitted(): void {
    this.uncommittedEvents = [];
  }

  // Apply event (internal state change)
  protected apply(event: DomainEvent): void {
    this.handle(event);
    this.version++;
    this.uncommittedEvents.push(event);
  }

  // Replay events to rebuild state
  replay(events: DomainEvent[]): void {
    events.forEach(event => {
      this.handle(event);
      this.version = event.version;
    });
  }

  // Handle event (to be implemented by subclasses)
  protected abstract handle(event: DomainEvent): void;
}

// Account Aggregate
class Account extends AggregateRoot {
  private balance: number = 0;
  private isClosed: boolean = false;

  constructor(id: string) {
    super(id);
  }

  // Command: Open account
  open(initialBalance: number): void {
    if (this.isClosed) {
      throw new Error('Cannot open closed account');
    }

    this.apply({
      eventType: 'AccountOpened',
      aggregateId: this.id,
      aggregateType: 'Account',
      eventData: { initialBalance },
      version: 0,
      timestamp: new Date()
    });
  }

  // Command: Deposit
  deposit(amount: number): void {
    if (this.isClosed) {
      throw new Error('Cannot deposit to closed account');
    }
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }

    this.apply({
      eventType: 'MoneyDeposited',
      aggregateId: this.id,
      aggregateType: 'Account',
      eventData: { amount },
      version: 0,
      timestamp: new Date()
    });
  }

  // Command: Withdraw
  withdraw(amount: number): void {
    if (this.isClosed) {
      throw new Error('Cannot withdraw from closed account');
    }
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    if (this.balance < amount) {
      throw new Error('Insufficient funds');
    }

    this.apply({
      eventType: 'MoneyWithdrawn',
      aggregateId: this.id,
      aggregateType: 'Account',
      eventData: { amount },
      version: 0,
      timestamp: new Date()
    });
  }

  // Command: Close account
  close(): void {
    if (this.isClosed) {
      throw new Error('Account already closed');
    }

    this.apply({
      eventType: 'AccountClosed',
      aggregateId: this.id,
      aggregateType: 'Account',
      eventData: {},
      version: 0,
      timestamp: new Date()
    });
  }

  // Handle events to update state
  protected handle(event: DomainEvent): void {
    switch (event.eventType) {
      case 'AccountOpened':
        this.balance = event.eventData.initialBalance;
        break;
      case 'MoneyDeposited':
        this.balance += event.eventData.amount;
        break;
      case 'MoneyWithdrawn':
        this.balance -= event.eventData.amount;
        break;
      case 'AccountClosed':
        this.isClosed = true;
        break;
    }
  }

  getBalance(): number {
    return this.balance;
  }

  getIsClosed(): boolean {
    return this.isClosed;
  }
}

// Repository with Event Sourcing
class AccountRepository {
  constructor(private eventStore: EventStore) {}

  // Save aggregate
  save(account: Account): void {
    const events = account.getUncommittedEvents();
    events.forEach(event => {
      this.eventStore.append(account.getId(), event);
    });
    account.markEventsAsCommitted();
  }

  // Load aggregate by replaying events
  load(accountId: string): Account {
    const events = this.eventStore.getEvents(accountId);
    const account = new Account(accountId);
    account.replay(events);
    return account;
  }
}

// Usage
const eventStore = new EventStore();
const repository = new AccountRepository(eventStore);

console.log('=== Event Sourcing Example ===\n');

// Create and use account
const account = new Account('acc-123');
account.open(1000);
account.deposit(500);
account.withdraw(200);
repository.save(account);

console.log(`\nAccount balance: ${account.getBalance()}`);

// Load account from events
const loadedAccount = repository.load('acc-123');
console.log(`Loaded account balance: ${loadedAccount.getBalance()}`);
console.log(`Account version: ${loadedAccount.getVersion()}`);

// Show all events
console.log('\n--- Event History ---');
const events = eventStore.getEvents('acc-123');
events.forEach(event => {
  console.log(`v${event.version}: ${event.eventType}`, event.eventData);
});
```

### Example 3: CQRS with Event Sourcing

```typescript
// Command Side (Write Model)
class AccountCommandHandler {
  constructor(
    private repository: AccountRepository,
    private eventBus: EventBus
  ) {}

  async handleOpenAccount(command: OpenAccountCommand): Promise<void> {
    const account = new Account(command.accountId);
    account.open(command.initialBalance);
    this.repository.save(account);
    
    // Publish domain events
    const events = account.getUncommittedEvents();
    events.forEach(event => {
      this.eventBus.publish(this.eventBus.createEvent(
        event.eventType,
        event,
        'AccountCommandHandler'
      ));
    });
  }

  async handleDeposit(command: DepositCommand): Promise<void> {
    const account = this.repository.load(command.accountId);
    account.deposit(command.amount);
    this.repository.save(account);
    
    const events = account.getUncommittedEvents();
    events.forEach(event => {
      this.eventBus.publish(this.eventBus.createEvent(
        event.eventType,
        event,
        'AccountCommandHandler'
      ));
    });
  }
}

// Query Side (Read Model)
class AccountReadModel {
  private accounts: Map<string, AccountView> = new Map();

  constructor(private eventBus: EventBus) {
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    this.eventBus.subscribe('AccountOpened', this.handleAccountOpened.bind(this));
    this.eventBus.subscribe('MoneyDeposited', this.handleMoneyDeposited.bind(this));
    this.eventBus.subscribe('MoneyWithdrawn', this.handleMoneyWithdrawn.bind(this));
  }

  private handleAccountOpened(event: Event): void {
    const domainEvent = event.payload as DomainEvent;
    this.accounts.set(domainEvent.aggregateId, {
      id: domainEvent.aggregateId,
      balance: domainEvent.eventData.initialBalance,
      transactions: []
    });
  }

  private handleMoneyDeposited(event: Event): void {
    const domainEvent = event.payload as DomainEvent;
    const account = this.accounts.get(domainEvent.aggregateId);
    if (account) {
      account.balance += domainEvent.eventData.amount;
      account.transactions.push({
        type: 'deposit',
        amount: domainEvent.eventData.amount,
        timestamp: domainEvent.timestamp
      });
    }
  }

  private handleMoneyWithdrawn(event: Event): void {
    const domainEvent = event.payload as DomainEvent;
    const account = this.accounts.get(domainEvent.aggregateId);
    if (account) {
      account.balance -= domainEvent.eventData.amount;
      account.transactions.push({
        type: 'withdraw',
        amount: domainEvent.eventData.amount,
        timestamp: domainEvent.timestamp
      });
    }
  }

  getAccount(accountId: string): AccountView | null {
    return this.accounts.get(accountId) || null;
  }

  getAllAccounts(): AccountView[] {
    return Array.from(this.accounts.values());
  }
}

interface AccountView {
  id: string;
  balance: number;
  transactions: Array<{
    type: string;
    amount: number;
    timestamp: Date;
  }>;
}

// Commands
interface OpenAccountCommand {
  accountId: string;
  initialBalance: number;
}

interface DepositCommand {
  accountId: string;
  amount: number;
}

// Usage
const eventStore = new EventStore();
const repository = new AccountRepository(eventStore);
const eventBus = new EventBus();
const commandHandler = new AccountCommandHandler(repository, eventBus);
const readModel = new AccountReadModel(eventBus);

console.log('=== CQRS with Event Sourcing ===\n');

// Execute commands
await commandHandler.handleOpenAccount({
  accountId: 'acc-456',
  initialBalance: 1000
});

await commandHandler.handleDeposit({
  accountId: 'acc-456',
  amount: 500
});

// Query read model
setTimeout(() => {
  const accountView = readModel.getAccount('acc-456');
  console.log('\n--- Account View (Read Model) ---');
  console.log('Account:', accountView);
}, 100);
```

### Example 4: Message Broker Pattern

```typescript
// Message Interface
interface Message {
  topic: string;
  payload: any;
  headers: Map<string, string>;
  timestamp: Date;
  messageId: string;
}

// Message Broker
class MessageBroker {
  private subscriptions: Map<string, Set<(message: Message) => Promise<void>>> = new Map();
  private messageQueue: Message[] = [];
  private isProcessing: boolean = false;

  // Subscribe to topic
  subscribe(topic: string, handler: (message: Message) => Promise<void>): () => void {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }
    this.subscriptions.get(topic)!.add(handler);
    
    console.log(`Subscribed to topic: ${topic}`);
    return () => this.unsubscribe(topic, handler);
  }

  unsubscribe(topic: string, handler: (message: Message) => Promise<void>): void {
    const handlers = this.subscriptions.get(topic);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  // Publish message
  async publish(topic: string, payload: any, headers?: Map<string, string>): Promise<void> {
    const message: Message = {
      topic,
      payload,
      headers: headers || new Map(),
      timestamp: new Date(),
      messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    console.log(`\nPublishing to topic: ${topic}`, payload);
    this.messageQueue.push(message);
    await this.processQueue();
  }

  // Process message queue
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      await this.deliverMessage(message);
    }

    this.isProcessing = false;
  }

  // Deliver message to subscribers
  private async deliverMessage(message: Message): Promise<void> {
    const handlers = this.subscriptions.get(message.topic);
    if (handlers) {
      const promises = Array.from(handlers).map(async handler => {
        try {
          await handler(message);
        } catch (error) {
          console.error(`Error processing message ${message.messageId}:`, error);
          // In production, implement retry logic or dead letter queue
        }
      });
      await Promise.all(promises);
    }
  }
}

// Order Service
class OrderService {
  constructor(private broker: MessageBroker) {
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    this.broker.subscribe('order:created', this.handleOrderCreated.bind(this));
  }

  private async handleOrderCreated(message: Message): Promise<void> {
    console.log(`OrderService: Processing order`, message.payload);
    // Process order
  }

  createOrder(orderData: any): void {
    this.broker.publish('order:created', orderData);
  }
}

// Inventory Service
class InventoryService {
  constructor(private broker: MessageBroker) {
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    this.broker.subscribe('order:created', this.reserveInventory.bind(this));
  }

  private async reserveInventory(message: Message): Promise<void> {
    console.log(`InventoryService: Reserving inventory for order`, message.payload);
    // Reserve inventory
    this.broker.publish('inventory:reserved', {
      orderId: message.payload.orderId
    });
  }
}

// Payment Service
class PaymentService {
  constructor(private broker: MessageBroker) {
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    this.broker.subscribe('inventory:reserved', this.processPayment.bind(this));
  }

  private async processPayment(message: Message): Promise<void> {
    console.log(`PaymentService: Processing payment for order`, message.payload);
    // Process payment
    this.broker.publish('payment:processed', {
      orderId: message.payload.orderId
    });
  }
}

// Usage
const broker = new MessageBroker();
const orderService = new OrderService(broker);
const inventoryService = new InventoryService(broker);
const paymentService = new PaymentService(broker);

console.log('=== Message Broker Pattern ===\n');

orderService.createOrder({
  orderId: 'ord-123',
  items: [{ productId: 'prod-1', quantity: 2 }],
  total: 100
});
```

### Example 5: Event Stream Processing

```typescript
// Stream Event
interface StreamEvent {
  streamId: string;
  eventType: string;
  data: any;
  timestamp: Date;
  sequence: number;
}

// Event Stream
class EventStream {
  private events: StreamEvent[] = [];
  private subscribers: Set<(event: StreamEvent) => void> = new Set();

  // Append event to stream
  append(streamId: string, eventType: string, data: any): void {
    const event: StreamEvent = {
      streamId,
      eventType,
      data,
      timestamp: new Date(),
      sequence: this.events.length + 1
    };

    this.events.push(event);
    this.notifySubscribers(event);
  }

  // Subscribe to stream
  subscribe(handler: (event: StreamEvent) => void): () => void {
    this.subscribers.add(handler);
    return () => this.subscribers.delete(handler);
  }

  // Notify subscribers
  private notifySubscribers(event: StreamEvent): void {
    this.subscribers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in stream subscriber:', error);
      }
    });
  }

  // Get events from sequence
  getEventsFrom(sequence: number): StreamEvent[] {
    return this.events.filter(e => e.sequence >= sequence);
  }

  // Get all events
  getAllEvents(): StreamEvent[] {
    return [...this.events];
  }
}

// Stream Processor
class StreamProcessor {
  private processors: Map<string, (event: StreamEvent) => void> = new Map();

  register(eventType: string, processor: (event: StreamEvent) => void): void {
    this.processors.set(eventType, processor);
  }

  process(event: StreamEvent): void {
    const processor = this.processors.get(event.eventType);
    if (processor) {
      processor(event);
    }
  }
}

// Usage
const stream = new EventStream();
const processor = new StreamProcessor();

// Register processors
processor.register('user:clicked', (event) => {
  console.log(`Processing click event:`, event.data);
});

processor.register('user:purchased', (event) => {
  console.log(`Processing purchase event:`, event.data);
});

// Subscribe to stream
stream.subscribe((event) => {
  processor.process(event);
});

console.log('=== Event Stream Processing ===\n');

// Append events
stream.append('user-123', 'user:clicked', { button: 'buy-now' });
stream.append('user-123', 'user:purchased', { productId: 'prod-1', amount: 100 });

console.log('\n--- Stream Events ---');
stream.getAllEvents().forEach(event => {
  console.log(`#${event.sequence}: ${event.eventType}`, event.data);
});
```

---

## 🔄 Architecture Patterns

### Pattern 1: Event Bus (Mediator Topology)

```typescript
// Central event bus routes all events
class CentralEventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  
  publish(event: Event): void {
    const handlers = this.handlers.get(event.type) || [];
    handlers.forEach(handler => handler(event));
  }
}
```

### Pattern 2: Message Broker (Broker Topology)

```typescript
// Distributed message brokers
class MessageBroker {
  private topics: Map<string, Queue<Message>> = new Map();
  
  publish(topic: string, message: Message): void {
    const queue = this.topics.get(topic);
    queue?.enqueue(message);
  }
}
```

### Pattern 3: Event Sourcing

```typescript
// Store all events, reconstruct state
class EventSourcedAggregate {
  private events: Event[] = [];
  
  replay(events: Event[]): void {
    events.forEach(event => this.apply(event));
  }
}
```

### Pattern 4: CQRS

```typescript
// Separate command and query models
class CommandModel {
  execute(command: Command): void { }
}

class QueryModel {
  query(query: Query): Result { }
}
```

---

## 🔀 Pattern Comparisons

### EDA vs Request-Response

**Similarities:**
- Both enable communication
- Both can be distributed

**Differences:**

| Aspect | Event-Driven | Request-Response |
|--------|--------------|------------------|
| **Coupling** | Loose (async) | Tight (sync) |
| **Consistency** | Eventually consistent | Strongly consistent |
| **Scalability** | High | Lower |
| **Latency** | Variable | Predictable |

### EDA vs Message Queue

**Similarities:**
- Both use messages
- Both enable async processing

**Differences:**

| Aspect | Event-Driven | Message Queue |
|--------|--------------|---------------|
| **Focus** | Events (what happened) | Messages (what to do) |
| **Routing** | Event type-based | Queue-based |
| **Consumers** | Multiple per event | One per message |

---

## 🎯 Real-World Applications

### 1. Microservices Communication

```typescript
// Services communicate via events
class OrderService {
  publishOrderCreated(order: Order): void {
    eventBus.publish('order:created', order);
  }
}
```

### 2. Real-Time Dashboards

```typescript
// Dashboard subscribes to events
class Dashboard {
  constructor() {
    eventBus.subscribe('metrics:updated', this.updateDashboard.bind(this));
  }
}
```

### 3. IoT Systems

```typescript
// IoT devices publish events
class IoTDevice {
  sensorReading(value: number): void {
    eventBus.publish('sensor:reading', { deviceId: this.id, value });
  }
}
```

### 4. E-Commerce Systems

```typescript
// Order processing via events
eventBus.publish('order:placed', order);
// → InventoryService reserves items
// → PaymentService processes payment
// → ShippingService creates shipment
```

---

## ⚠️ Common Pitfalls and Best Practices

### Common Pitfalls

❌ **Event Ordering Issues**
```typescript
// BAD: No ordering guarantees
eventBus.publish('event1', data1);
eventBus.publish('event2', data2);
// event2 might be processed before event1

// GOOD: Use event versioning or sequence numbers
eventBus.publish('event1', { ...data1, sequence: 1 });
eventBus.publish('event2', { ...data2, sequence: 2 });
```

❌ **No Idempotency**
```typescript
// BAD: Processing same event multiple times causes issues
handler(event) {
  this.balance += event.amount; // Duplicate processing
}

// GOOD: Make handlers idempotent
handler(event) {
  if (!this.processedEvents.has(event.id)) {
    this.balance += event.amount;
    this.processedEvents.add(event.id);
  }
}
```

❌ **No Error Handling**
```typescript
// BAD: Errors break event processing
handler(event) {
  this.process(event); // Might throw
}

// GOOD: Handle errors gracefully
handler(event) {
  try {
    this.process(event);
  } catch (error) {
    this.handleError(event, error);
  }
}
```

### Best Practices

✅ **Use Event Versioning**
```typescript
interface Event {
  version: number;
  // Handle version migration
}
```

✅ **Implement Idempotency**
```typescript
class IdempotentHandler {
  private processed: Set<string> = new Set();
  
  handle(event: Event): void {
    if (!this.processed.has(event.id)) {
      this.process(event);
      this.processed.add(event.id);
    }
  }
}
```

✅ **Use Event Sourcing for Audit**
```typescript
class EventStore {
  append(event: Event): void {
    // Store all events for audit trail
  }
}
```

✅ **Implement Retry Logic**
```typescript
class RetryHandler {
  async handle(event: Event, retries = 3): Promise<void> {
    try {
      await this.process(event);
    } catch (error) {
      if (retries > 0) {
        await this.handle(event, retries - 1);
      }
    }
  }
}
```

✅ **Monitor Event Processing**
```typescript
class MonitoredEventBus {
  publish(event: Event): void {
    this.metrics.recordEvent(event.type);
    // Publish event
  }
}
```

---

## 🚀 Modern Variations and Extensions

### 1. Apache Kafka Integration

```typescript
// Kafka producer/consumer pattern
class KafkaEventBus {
  async publish(topic: string, event: Event): Promise<void> {
    await kafka.producer.send({
      topic,
      messages: [{ value: JSON.stringify(event) }]
    });
  }
}
```

### 2. AWS EventBridge

```typescript
// Cloud-native event bus
class EventBridgeBus {
  async publish(event: Event): Promise<void> {
    await eventBridge.putEvents({
      Entries: [{
        Source: event.source,
        DetailType: event.type,
        Detail: JSON.stringify(event.payload)
      }]
    });
  }
}
```

### 3. Reactive Streams

```typescript
// Reactive event processing
class ReactiveEventStream {
  private subject = new Subject<Event>();
  
  getStream(): Observable<Event> {
    return this.subject.asObservable();
  }
  
  publish(event: Event): void {
    this.subject.next(event);
  }
}
```

---

## 📚 Summary

### Key Takeaways

1. **Event-Driven Architecture** enables loose coupling through events
2. **Asynchronous Processing** - Events processed asynchronously
3. **Event Sourcing** - Store events, reconstruct state
4. **CQRS** - Separate read and write models
5. **Scalability** - Systems scale by adding processors

### When to Use

✅ Use when:
- Need loose coupling between components
- Need real-time responsiveness
- Need high scalability
- Need audit trails
- Have independent workflows

❌ Don't use when:
- Need strong consistency
- Simple request-response is sufficient
- Synchronous workflows required
- Low latency is critical

### Architecture Patterns

- **Event Bus** - Central routing
- **Message Broker** - Distributed routing
- **Event Sourcing** - Event log storage
- **CQRS** - Separate read/write models

### Next Steps

After mastering Event-Driven Architecture, consider:
- **Microservices Architecture** - EDA in distributed systems
- **Reactive Programming** - Reactive streams and observables
- **Message Queues** - RabbitMQ, Kafka, AWS SQS
- **Event Streaming** - Real-time event processing

---

## 🔗 Related Patterns

- **Observer**: Defines one-to-many dependency
- **Mediator**: Centralizes communication
- **Command**: Encapsulates requests
- **Pub/Sub**: Publish-subscribe pattern

---

## 📖 References

- **Martin Fowler**: "Event Sourcing", "CQRS"
- **AWS**: Event-Driven Architecture Best Practices
- **Microsoft**: Event-Driven Architecture Guide
- **Apache Kafka**: Event Streaming Platform





