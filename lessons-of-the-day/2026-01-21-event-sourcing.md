# Event Sourcing - Deep Dive

## 📋 Learning Objectives

- [ ] Understand Event Sourcing definition and principles
- [ ] Learn how events replace traditional state storage
- [ ] Master event store, aggregates, and projections
- [ ] Recognize when to use Event Sourcing vs traditional storage
- [ ] Understand event replay and rebuilding state
- [ ] Practice implementing Event Sourcing in real scenarios
- [ ] Learn CQRS integration with Event Sourcing
- [ ] Explore real-world applications and use cases
- [ ] Understand common pitfalls and best practices
- [ ] Compare with traditional CRUD and other patterns

---

## 🎯 Definition

**Event Sourcing** is an architectural pattern where the state of an application is determined by a sequence of events. Instead of storing the current state, the system stores a log of all events that have occurred, and the current state is derived by replaying these events.

**Origin:**
- Concept from domain-driven design (DDD)
- Popularized by Greg Young and Martin Fowler
- Based on event-driven architecture principles
- Often used with CQRS pattern

**Key Principles:**
- **Events as Source of Truth** - Events are the primary data store
- **Immutable Event Log** - Events are append-only and never modified
- **State Reconstruction** - Current state is derived from events
- **Complete History** - Full audit trail of all changes
- **Time Travel** - Can reconstruct state at any point in time

**Key Principle:**
> "Event Sourcing stores all changes to application state as a sequence of events. Instead of updating a record, we append an event. The current state is reconstructed by replaying all events from the beginning. This provides a complete audit trail and enables time travel." - Greg Young

**Alternative Formulation:**
> "Event Sourcing treats events as first-class citizens. Every state change is captured as an event and stored in an event log. The current state is computed by replaying events, and projections can create read models optimized for queries."

---

## 🏗️ Structure

### Traditional CRUD vs Event Sourcing

**Traditional CRUD:**
```
┌─────────────────────────────────────────────────────────┐
│                    Current State                        │
│  (User: id=1, email=john@example.com, name=John)       │
│                                                          │
│  UPDATE users SET name='John Doe' WHERE id=1           │
│                                                          │
│  Result: State is overwritten, history is lost         │
└─────────────────────────────────────────────────────────┘
```

**Event Sourcing:**
```
┌─────────────────────────────────────────────────────────┐
│                    Event Store                           │
│  (Immutable, Append-Only Event Log)                     │
│                                                          │
│  1. UserCreatedEvent(id=1, email=john@example.com)    │
│  2. UserNameChangedEvent(id=1, name=John)              │
│  3. UserNameChangedEvent(id=1, name=John Doe)           │
│                                                          │
│  Current State = Replay all events                      │
│  History = Complete audit trail                        │
└─────────────────────────────────────────────────────────┘
```

### Event Sourcing Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Command                               │
│  (CreateUser, UpdateUser, DeleteUser)                    │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    Aggregate                             │
│  (Domain Logic, Business Rules)                          │
│  - Validates command                                     │
│  - Generates events                                      │
│  - Maintains current state                               │
└─────────────────────────────────────────────────────────┘
                        │
                        │ Events
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    Event Store                          │
│  (Immutable Event Log)                                   │
│  - Append-only                                           │
│  - Never modified                                        │
│  - Complete history                                      │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Aggregate   │ │  Projections  │ │  Event        │
│  Replay       │ │  (Read Models)│ │  Handlers     │
│               │ │               │ │               │
│  Rebuild      │ │  Denormalized │ │  Side Effects │
│  State        │ │  Views        │ │  (Email, etc) │
└──────────────┘ └──────────────┘ └──────────────┘
```

### Component Descriptions

**1. Events**
- Immutable records of something that happened
- Represent facts about the past
- Never modified or deleted
- Examples: UserCreatedEvent, OrderPlacedEvent, PaymentProcessedEvent

**2. Event Store**
- Append-only log of all events
- Immutable and persistent
- Enables event replay
- Examples: EventStore DB, Kafka, Custom event store

**3. Aggregates**
- Domain entities that handle commands
- Generate events
- Maintain current state by replaying events
- Examples: User aggregate, Order aggregate

**4. Projections**
- Read models built from events
- Denormalized for queries
- Updated when events occur
- Examples: UserReadModel, OrderHistoryView

---

## 🔍 Core Concepts Deep Dive

### 1. Events

**Definition:** Immutable records representing something that happened in the domain.

**Purpose:**
- Capture domain facts
- Represent state changes
- Provide audit trail
- Enable state reconstruction

**Characteristics:**
- **Immutable** - Never changed after creation
- **Append-Only** - Events are only added, never removed
- **Domain Language** - Use domain terminology
- **Timestamped** - Include when event occurred
- **Idempotent** - Can be safely replayed

**Example:**

```typescript
// Events/UserCreatedEvent.ts
export class UserCreatedEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly birthDate: Date,
    public readonly occurredAt: Date = new Date(),
    public readonly version: number = 1
  ) {}
}

// Events/UserNameChangedEvent.ts
export class UserNameChangedEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly oldName: string,
    public readonly newName: string,
    public readonly occurredAt: Date = new Date(),
    public readonly version: number
  ) {}
}

// Events/UserEmailChangedEvent.ts
export class UserEmailChangedEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly oldEmail: string,
    public readonly newEmail: string,
    public readonly occurredAt: Date = new Date(),
    public readonly version: number
  ) {}
}

// Events/UserDeletedEvent.ts
export class UserDeletedEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly reason: string,
    public readonly occurredAt: Date = new Date(),
    public readonly version: number
  ) {}
}

// Events/BaseEvent.ts
export abstract class DomainEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly occurredAt: Date = new Date(),
    public readonly version: number
  ) {}
}
```

**Key Points:**
- ✅ Immutable and append-only
- ✅ Use domain language
- ✅ Include metadata (timestamp, version)
- ✅ Represent facts, not commands
- ❌ Never modify events
- ❌ Never delete events

### 2. Event Store

**Definition:** Append-only log that stores all events in the system.

**Purpose:**
- Store all events permanently
- Enable event replay
- Provide audit trail
- Support time travel queries

**Characteristics:**
- **Append-Only** - Events are only added
- **Immutable** - Events never modified
- **Ordered** - Events stored in sequence
- **Versioned** - Track aggregate versions
- **Queryable** - Can query events by aggregate, type, time

**Example:**

```typescript
// EventStore/EventStore.ts
export interface IEventStore {
  saveEvents(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void>;
  getEvents(aggregateId: string): Promise<DomainEvent[]>;
  getEventsByType(eventType: string): Promise<DomainEvent[]>;
  getEventsSince(timestamp: Date): Promise<DomainEvent[]>;
}

// EventStore/InMemoryEventStore.ts (Simple implementation)
export class InMemoryEventStore implements IEventStore {
  private events: Map<string, DomainEvent[]> = new Map();

  async saveEvents(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void> {
    const existingEvents = this.events.get(aggregateId) || [];
    
    // Optimistic concurrency check
    if (existingEvents.length !== expectedVersion) {
      throw new Error('Concurrency conflict: aggregate version mismatch');
    }

    const newEvents = [...existingEvents, ...events];
    this.events.set(aggregateId, newEvents);
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    return this.events.get(aggregateId) || [];
  }

  async getEventsByType(eventType: string): Promise<DomainEvent[]> {
    const allEvents: DomainEvent[] = [];
    for (const events of this.events.values()) {
      allEvents.push(...events.filter(e => e.constructor.name === eventType));
    }
    return allEvents;
  }

  async getEventsSince(timestamp: Date): Promise<DomainEvent[]> {
    const allEvents: DomainEvent[] = [];
    for (const events of this.events.values()) {
      allEvents.push(...events.filter(e => e.occurredAt >= timestamp));
    }
    return allEvents.sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
  }
}

// EventStore/DatabaseEventStore.ts (Database implementation)
import { Pool } from 'pg';

export class DatabaseEventStore implements IEventStore {
  constructor(private db: Pool) {}

  async saveEvents(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Check current version
      const versionResult = await client.query(
        'SELECT MAX(version) as version FROM events WHERE aggregate_id = $1',
        [aggregateId]
      );
      const currentVersion = versionResult.rows[0]?.version || 0;

      if (currentVersion !== expectedVersion) {
        throw new Error('Concurrency conflict: aggregate version mismatch');
      }

      // Insert events
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const version = expectedVersion + i + 1;
        
        await client.query(
          `INSERT INTO events (aggregate_id, event_type, event_data, version, occurred_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            aggregateId,
            event.constructor.name,
            JSON.stringify(event),
            version,
            event.occurredAt
          ]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getEvents(aggregateId: string): Promise<DomainEvent[]> {
    const result = await this.db.query(
      'SELECT event_type, event_data, version, occurred_at FROM events WHERE aggregate_id = $1 ORDER BY version',
      [aggregateId]
    );

    return result.rows.map(row => this.deserializeEvent(row));
  }

  async getEventsByType(eventType: string): Promise<DomainEvent[]> {
    const result = await this.db.query(
      'SELECT event_type, event_data, version, occurred_at FROM events WHERE event_type = $1 ORDER BY occurred_at',
      [eventType]
    );

    return result.rows.map(row => this.deserializeEvent(row));
  }

  async getEventsSince(timestamp: Date): Promise<DomainEvent[]> {
    const result = await this.db.query(
      'SELECT event_type, event_data, version, occurred_at FROM events WHERE occurred_at >= $1 ORDER BY occurred_at',
      [timestamp]
    );

    return result.rows.map(row => this.deserializeEvent(row));
  }

  private deserializeEvent(row: any): DomainEvent {
    const eventData = JSON.parse(row.event_data);
    // Map event type to class (simplified)
    const eventClass = this.getEventClass(row.event_type);
    return Object.assign(Object.create(eventClass.prototype), eventData);
  }

  private getEventClass(eventType: string): any {
    // Event class mapping (simplified)
    const eventClasses: { [key: string]: any } = {
      'UserCreatedEvent': UserCreatedEvent,
      'UserNameChangedEvent': UserNameChangedEvent,
      'UserEmailChangedEvent': UserEmailChangedEvent,
      'UserDeletedEvent': UserDeletedEvent
    };
    return eventClasses[eventType] || DomainEvent;
  }
}
```

**Key Points:**
- ✅ Append-only storage
- ✅ Immutable events
- ✅ Optimistic concurrency control
- ✅ Event versioning
- ✅ Query capabilities
- ❌ Never modify stored events
- ❌ Never delete events

### 3. Aggregates

**Definition:** Domain entities that handle commands and generate events. They maintain current state by replaying events.

**Purpose:**
- Handle commands
- Validate business rules
- Generate events
- Maintain current state
- Enforce invariants

**Characteristics:**
- **Command Handlers** - Process commands
- **Event Replay** - Rebuild state from events
- **Event Generation** - Create new events
- **Invariant Enforcement** - Maintain business rules
- **Version Tracking** - Track aggregate version

**Example:**

```typescript
// Domain/User.ts (Aggregate)
import { UserCreatedEvent, UserNameChangedEvent, UserEmailChangedEvent, UserDeletedEvent } from '../Events';

export class User {
  private id: string;
  private email: string;
  private name: string;
  private birthDate: Date;
  private deleted: boolean = false;
  private version: number = 0;
  private uncommittedEvents: DomainEvent[] = [];

  // Factory method - create new aggregate
  static create(id: string, email: string, name: string, birthDate: Date): User {
    const user = new User();
    const event = new UserCreatedEvent(id, email, name, birthDate);
    user.apply(event);
    user.uncommittedEvents.push(event);
    return user;
  }

  // Rebuild aggregate from events
  static fromEvents(events: DomainEvent[]): User {
    const user = new User();
    events.forEach(event => user.apply(event));
    return user;
  }

  // Command: Change name
  changeName(newName: string): void {
    if (this.deleted) {
      throw new Error('Cannot change name of deleted user');
    }
    if (newName.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    if (newName === this.name) {
      return; // No change needed
    }

    const event = new UserNameChangedEvent(
      this.id,
      this.name,
      newName,
      new Date(),
      this.version + 1
    );
    this.apply(event);
    this.uncommittedEvents.push(event);
  }

  // Command: Change email
  changeEmail(newEmail: string): void {
    if (this.deleted) {
      throw new Error('Cannot change email of deleted user');
    }
    if (!this.isValidEmail(newEmail)) {
      throw new Error('Invalid email format');
    }
    if (newEmail === this.email) {
      return; // No change needed
    }

    const event = new UserEmailChangedEvent(
      this.id,
      this.email,
      newEmail,
      new Date(),
      this.version + 1
    );
    this.apply(event);
    this.uncommittedEvents.push(event);
  }

  // Command: Delete user
  delete(reason: string): void {
    if (this.deleted) {
      throw new Error('User already deleted');
    }

    const event = new UserDeletedEvent(
      this.id,
      reason,
      new Date(),
      this.version + 1
    );
    this.apply(event);
    this.uncommittedEvents.push(event);
  }

  // Apply event to rebuild state
  private apply(event: DomainEvent): void {
    if (event instanceof UserCreatedEvent) {
      this.id = event.aggregateId;
      this.email = event.email;
      this.name = event.name;
      this.birthDate = event.birthDate;
      this.version = event.version;
    } else if (event instanceof UserNameChangedEvent) {
      this.name = event.newName;
      this.version = event.version;
    } else if (event instanceof UserEmailChangedEvent) {
      this.email = event.newEmail;
      this.version = event.version;
    } else if (event instanceof UserDeletedEvent) {
      this.deleted = true;
      this.version = event.version;
    }
  }

  // Get uncommitted events (for saving)
  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  // Mark events as committed
  markEventsAsCommitted(): void {
    this.uncommittedEvents = [];
  }

  // Getters
  getId(): string { return this.id; }
  getEmail(): string { return this.email; }
  getName(): string { return this.name; }
  getBirthDate(): Date { return this.birthDate; }
  isDeleted(): boolean { return this.deleted; }
  getVersion(): number { return this.version; }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
```

**Key Points:**
- ✅ Handle commands and generate events
- ✅ Rebuild state from events
- ✅ Enforce business rules
- ✅ Track version for concurrency
- ✅ Maintain uncommitted events
- ❌ Should not directly modify state (only through events)
- ❌ Should not have side effects in apply methods

### 4. Projections (Read Models)

**Definition:** Denormalized read models built from events, optimized for queries.

**Purpose:**
- Create read-optimized views
- Support complex queries
- Denormalize data for performance
- Enable CQRS pattern

**Characteristics:**
- **Event-Driven** - Built from events
- **Denormalized** - Optimized for reads
- **Rebuildable** - Can be rebuilt from events
- **Multiple Views** - Different projections for different needs
- **Eventually Consistent** - May lag behind events

**Example:**

```typescript
// Projections/UserReadModelProjection.ts
import { UserReadModel } from '../ReadModels/UserReadModel';
import { UserReadRepository } from '../Repositories/UserReadRepository';

export class UserReadModelProjection {
  constructor(private userReadRepository: UserReadRepository) {}

  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    const age = this.calculateAge(event.birthDate);
    const readModel = new UserReadModel(
      event.aggregateId,
      event.email,
      event.name,
      age,
      event.occurredAt
    );
    await this.userReadRepository.save(readModel);
  }

  async handleUserNameChanged(event: UserNameChangedEvent): Promise<void> {
    const readModel = await this.userReadRepository.findById(event.aggregateId);
    if (readModel) {
      readModel.name = event.newName;
      readModel.updatedAt = event.occurredAt;
      await this.userReadRepository.save(readModel);
    }
  }

  async handleUserEmailChanged(event: UserEmailChangedEvent): Promise<void> {
    const readModel = await this.userReadRepository.findById(event.aggregateId);
    if (readModel) {
      readModel.email = event.newEmail;
      readModel.updatedAt = event.occurredAt;
      await this.userReadRepository.save(readModel);
    }
  }

  async handleUserDeleted(event: UserDeletedEvent): Promise<void> {
    await this.userReadRepository.delete(event.aggregateId);
  }

  // Rebuild projection from all events
  async rebuild(events: DomainEvent[]): Promise<void> {
    for (const event of events) {
      if (event instanceof UserCreatedEvent) {
        await this.handleUserCreated(event);
      } else if (event instanceof UserNameChangedEvent) {
        await this.handleUserNameChanged(event);
      } else if (event instanceof UserEmailChangedEvent) {
        await this.handleUserEmailChanged(event);
      } else if (event instanceof UserDeletedEvent) {
        await this.handleUserDeleted(event);
      }
    }
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}

// ReadModels/UserReadModel.ts
export class UserReadModel {
  constructor(
    public id: string,
    public email: string,
    public name: string,
    public age: number,
    public createdAt: Date,
    public updatedAt?: Date
  ) {}
}
```

**Key Points:**
- ✅ Built from events
- ✅ Denormalized for performance
- ✅ Can be rebuilt
- ✅ Multiple projections possible
- ✅ Eventually consistent
- ❌ Not source of truth (events are)
- ❌ May lag behind events

### 5. Command Handlers

**Definition:** Components that handle commands, load aggregates, and save events.

**Purpose:**
- Receive commands
- Load aggregates from events
- Execute commands on aggregates
- Save generated events
- Handle concurrency

**Example:**

```typescript
// CommandHandlers/CreateUserCommandHandler.ts
export class CreateUserCommandHandler {
  constructor(
    private eventStore: IEventStore
  ) {}

  async handle(command: CreateUserCommand): Promise<void> {
    // Check if user already exists
    const existingEvents = await this.eventStore.getEvents(command.userId);
    if (existingEvents.length > 0) {
      throw new Error('User already exists');
    }

    // Create aggregate
    const user = User.create(
      command.userId,
      command.email,
      command.name,
      command.birthDate
    );

    // Save events
    const events = user.getUncommittedEvents();
    await this.eventStore.saveEvents(
      user.getId(),
      events,
      0 // Expected version for new aggregate
    );

    user.markEventsAsCommitted();
  }
}

// CommandHandlers/UpdateUserCommandHandler.ts
export class UpdateUserCommandHandler {
  constructor(
    private eventStore: IEventStore
  ) {}

  async handle(command: UpdateUserCommand): Promise<void> {
    // Load aggregate from events
    const events = await this.eventStore.getEvents(command.userId);
    if (events.length === 0) {
      throw new Error('User not found');
    }

    const user = User.fromEvents(events);
    const expectedVersion = user.getVersion();

    // Execute command
    if (command.name) {
      user.changeName(command.name);
    }
    if (command.email) {
      user.changeEmail(command.email);
    }

    // Save new events
    const newEvents = user.getUncommittedEvents();
    if (newEvents.length > 0) {
      await this.eventStore.saveEvents(
        user.getId(),
        newEvents,
        expectedVersion // Optimistic concurrency check
      );
      user.markEventsAsCommitted();
    }
  }
}
```

---

## 💡 When to Use

### Use Event Sourcing When:

✅ **Audit Trail Requirements**
- Need complete history of changes
- Compliance requirements
- Legal requirements
- Example: Financial systems, Healthcare systems

✅ **Time Travel Queries**
- Need to see state at any point in time
- Historical analysis
- Debugging past states
- Example: Analytics, Debugging tools

✅ **Complex Business Logic**
- Rich domain models
- Complex workflows
- Event-driven business processes
- Example: E-commerce, Banking systems

✅ **CQRS Integration**
- Using CQRS pattern
- Need to rebuild read models
- Multiple read views
- Example: High-performance systems

✅ **Event-Driven Architecture**
- Event-driven system
- Microservices communication
- Asynchronous processing
- Example: Microservices, Distributed systems

✅ **High Write Throughput**
- Many state changes
- Append-only is efficient
- No updates needed
- Example: IoT systems, Logging systems

### Don't Use Event Sourcing When:

❌ **Simple CRUD Applications**
- Simple data operations
- No audit requirements
- Overhead not justified
- Example: Simple admin panels, Basic blogs

❌ **Low Complexity**
- Straightforward state management
- No history requirements
- Traditional storage sufficient
- Example: Small applications, MVPs

❌ **High Read Performance Critical**
- Read performance is critical
- Can't tolerate eventual consistency
- Need immediate consistency
- Example: Real-time systems, High-frequency reads

❌ **Simple Queries**
- Straightforward queries
- No complex reporting
- No time travel needed
- Example: Basic applications

❌ **Small Teams**
- Limited resources
- High complexity
- Steep learning curve
- Example: Startups, Small projects

---

## 🏛️ Event Sourcing with CQRS

### Combined Architecture

```
Commands → Aggregates → Events → Event Store
                                    │
                                    ├─→ Aggregate Replay
                                    │
                                    ├─→ Projections → Read Models
                                    │
                                    └─→ Event Handlers → Side Effects
```

### Benefits of Combining

✅ **Separation of Concerns**
- Commands handle writes
- Queries handle reads
- Events synchronize

✅ **Performance**
- Optimize reads independently
- Optimize writes independently
- Scale separately

✅ **Flexibility**
- Multiple read models
- Different databases
- Independent evolution

---

## 📚 Complete Implementation Example

### File Structure

```
src/
├── Domain/
│   └── User.ts (Aggregate)
│
├── Events/
│   ├── UserCreatedEvent.ts
│   ├── UserNameChangedEvent.ts
│   └── UserEmailChangedEvent.ts
│
├── EventStore/
│   ├── IEventStore.ts
│   └── DatabaseEventStore.ts
│
├── Commands/
│   ├── CreateUserCommand.ts
│   └── UpdateUserCommand.ts
│
├── CommandHandlers/
│   ├── CreateUserCommandHandler.ts
│   └── UpdateUserCommandHandler.ts
│
├── Projections/
│   └── UserReadModelProjection.ts
│
├── ReadModels/
│   └── UserReadModel.ts
│
└── Controllers/
    └── UserController.ts
```

### Complete Flow Example

```typescript
// 1. Command received
const command = new CreateUserCommand('user1', 'john@example.com', 'John', new Date('1990-01-01'));

// 2. Command handler loads aggregate (empty for new)
const handler = new CreateUserCommandHandler(eventStore);
await handler.handle(command);

// 3. Aggregate generates events
// UserCreatedEvent generated

// 4. Events saved to event store
// Event stored with version 1

// 5. Projection handles event
const projection = new UserReadModelProjection(userReadRepository);
await projection.handleUserCreated(event);

// 6. Read model updated
// UserReadModel created in read database

// 7. Query can now read from read model
const query = new GetUserQuery('user1');
const user = await queryHandler.handle(query);
```

---

## ⚠️ Common Pitfalls

### 1. Modifying Events

**Problem:** Trying to modify or delete events after they're stored.

**❌ Wrong:**

```typescript
// ❌ Trying to modify events
await eventStore.updateEvent(eventId, newData);
await eventStore.deleteEvent(eventId);
```

**✅ Correct:**

```typescript
// ✅ Events are immutable
// If correction needed, create compensating event
await eventStore.saveEvents(aggregateId, [new CompensatingEvent(...)]);
```

### 2. Side Effects in Apply Methods

**Problem:** Performing side effects when applying events to rebuild state.

**❌ Wrong:**

```typescript
// ❌ Side effects in apply method
private apply(event: UserCreatedEvent): void {
  this.email = event.email;
  // ❌ Side effect in apply
  this.sendWelcomeEmail(event.email);
}
```

**✅ Correct:**

```typescript
// ✅ Pure state reconstruction
private apply(event: UserCreatedEvent): void {
  this.email = event.email;
  // Side effects handled by event handlers/projections
}

// Event handler handles side effects
async handleUserCreated(event: UserCreatedEvent): Promise<void> {
  await this.emailService.sendWelcomeEmail(event.email);
}
```

### 3. Not Handling Concurrency

**Problem:** Not checking aggregate version, leading to lost updates.

**❌ Wrong:**

```typescript
// ❌ No concurrency check
async saveEvents(aggregateId: string, events: DomainEvent[]): Promise<void> {
  await this.db.insert(events); // ❌ No version check
}
```

**✅ Correct:**

```typescript
// ✅ Optimistic concurrency control
async saveEvents(aggregateId: string, events: DomainEvent[], expectedVersion: number): Promise<void> {
  const currentVersion = await this.getCurrentVersion(aggregateId);
  if (currentVersion !== expectedVersion) {
    throw new Error('Concurrency conflict');
  }
  await this.db.insert(events);
}
```

### 4. Not Rebuilding Projections

**Problem:** Projections get out of sync and can't be rebuilt.

**❌ Wrong:**

```typescript
// ❌ Projection can't be rebuilt
// Missing event handling logic
```

**✅ Correct:**

```typescript
// ✅ Projection can rebuild from events
async rebuild(events: DomainEvent[]): Promise<void> {
  for (const event of events) {
    await this.handleEvent(event);
  }
}
```

---

## ✅ Best Practices

### 1. Immutable Events

✅ **Do:**
- Make events immutable
- Never modify events
- Never delete events
- Use compensating events for corrections

❌ **Don't:**
- Modify stored events
- Delete events
- Update events in place
- Skip event versioning

### 2. Pure Apply Methods

✅ **Do:**
- Keep apply methods pure
- Only update state
- No side effects
- Idempotent operations

❌ **Don't:**
- Perform side effects in apply
- Call external services
- Send emails in apply
- Modify external state

### 3. Concurrency Control

✅ **Do:**
- Use optimistic concurrency
- Check aggregate versions
- Handle conflicts gracefully
- Retry on conflicts

❌ **Don't:**
- Ignore concurrency
- Skip version checks
- Assume no conflicts
- Lose updates

### 4. Event Versioning

✅ **Do:**
- Version all events
- Track aggregate versions
- Handle version migrations
- Support event schema evolution

❌ **Don't:**
- Skip versioning
- Ignore schema changes
- Break backward compatibility
- Mix event versions

---

## 🔀 Event Sourcing vs Other Patterns

### Event Sourcing vs Traditional CRUD

**Traditional CRUD:**
- Stores current state
- Updates overwrite data
- No history
- Simple queries

**Event Sourcing:**
- Stores events
- Appends events
- Complete history
- Rebuild state from events

**Key Difference:** Event Sourcing stores events instead of current state.

### Event Sourcing vs Event-Driven Architecture

**Event Sourcing:**
- Events are the source of truth
- State derived from events
- Event store is primary storage
- Focus on state reconstruction

**Event-Driven Architecture:**
- Events for communication
- State stored separately
- Events for integration
- Focus on loose coupling

**Key Difference:** Event Sourcing uses events as storage, Event-Driven uses events for communication.

### Event Sourcing vs CQRS

**Event Sourcing:**
- Events are the source of truth
- State derived from events by replaying
- Event store is primary storage
- Focus on event storage and state reconstruction
- Complete audit trail and time travel capabilities
- Can work without CQRS

**CQRS:**
- Separates read and write operations
- Different models for reads and writes
- Focus on model separation and optimization
- Can use traditional databases or event store
- Independent optimization of read/write sides
- Can work without Event Sourcing

**Key Differences:**

| Aspect | Event Sourcing | CQRS |
|--------|---------------|------|
| **Core Purpose** | Store events as source of truth | Separate read/write operations |
| **Storage Model** | Append-only event log | Can be traditional DB or event store |
| **State Management** | State reconstructed from events | Write model stores current state |
| **Read Models** | Built via projections from events | Denormalized read models (independent) |
| **History** | Complete audit trail (built-in) | May or may not have complete history |
| **Time Travel** | Can reconstruct state at any point | Not inherently supported |
| **Independence** | Can work standalone | Can work standalone |
| **Complexity** | Complex due to event replay | Complex due to model synchronization |
| **Use Case Focus** | Audit trail, history, time travel | Performance optimization, scalability |
| **When Combined** | Events feed CQRS read models | CQRS read models built from ES events |

**When to Use Each:**

**Use Event Sourcing When:**
- Need complete audit trail
- Time travel queries required
- Complete history is important
- Regulatory/compliance requirements
- Need to rebuild state from events

**Use CQRS When:**
- Read/write workloads differ significantly
- Need independent optimization
- Complex domain models
- Different scalability requirements
- Multiple read views needed

**Use Both Together When:**
- Need audit trail AND performance optimization
- Event sourcing provides events for CQRS projections
- Complex systems requiring both patterns
- High-performance systems with compliance needs

---

## 🌍 Real-World Applications

### 1. Financial Systems

**Events:**
- AccountOpened, MoneyDeposited, MoneyWithdrawn, TransferCompleted

**Benefits:**
- Complete audit trail
- Regulatory compliance
- Time travel for investigations
- Fraud detection

### 2. E-Commerce Platforms

**Events:**
- OrderPlaced, PaymentProcessed, OrderShipped, OrderDelivered

**Benefits:**
- Order history
- Customer service
- Analytics
- Inventory tracking

### 3. Healthcare Systems

**Events:**
- PatientAdmitted, DiagnosisRecorded, TreatmentAdministered, PatientDischarged

**Benefits:**
- Medical history
- Compliance
- Audit requirements
- Legal protection

---

## 📊 Benefits and Trade-offs

### Benefits

✅ **Complete Audit Trail**
- Every change is recorded
- Full history available
- Compliance support
- Legal protection

✅ **Time Travel**
- Reconstruct state at any time
- Historical analysis
- Debugging past states
- Point-in-time queries

✅ **Event Replay**
- Rebuild state from events
- Fix bugs by replaying
- Create new projections
- Data migration

✅ **Scalability**
- Append-only is efficient
- Can scale event store
- Independent projections
- Better write performance

✅ **Flexibility**
- Multiple read models
- Easy to add new views
- Schema evolution
- Technology flexibility

### Trade-offs

❌ **Complexity**
- More complex than CRUD
- Steeper learning curve
- More moving parts
- Higher maintenance

❌ **Eventual Consistency**
- Read models may lag
- Need to handle consistency
- More complex queries
- Potential stale data

❌ **Storage Overhead**
- Store all events
- More storage needed
- Event versioning
- Storage costs

❌ **Performance Considerations**
- Rebuilding state can be slow
- Large event streams
- Need snapshots
- Query complexity

---

## 🎓 Summary

### Key Takeaways

1. **Event Sourcing** stores events instead of current state
2. **Events are Immutable** - append-only, never modified
3. **State Reconstruction** - current state derived from events
4. **Complete History** - full audit trail of all changes
5. **Time Travel** - can reconstruct state at any point
6. **CQRS Integration** - often used with CQRS pattern
7. **Projections** - read models built from events
8. **Concurrency Control** - optimistic concurrency with versions

### When to Use

✅ **Use Event Sourcing When:**
- Need complete audit trail
- Time travel queries needed
- Complex business logic
- Using CQRS
- Event-driven architecture
- High write throughput

❌ **Avoid Event Sourcing When:**
- Simple CRUD applications
- Low complexity
- High read performance critical
- Simple queries
- Small teams

### Best Practices

- Keep events immutable
- Pure apply methods (no side effects)
- Handle concurrency with versions
- Version all events
- Rebuildable projections
- Use snapshots for performance
- Handle eventual consistency

### Next Steps

After mastering Event Sourcing, consider:
- **Projections** - Transform events into read models ([2026-01-21-projections.md](./2026-01-21-projections.md))
- **CQRS** - Combine with Event Sourcing ([2026-01-20-cqrs-pattern.md](./2026-01-20-cqrs-pattern.md))
- **Event-Driven Architecture** - Full event-driven system ([2026-01-27-event-driven-architecture.md](./2026-01-27-event-driven-architecture.md))
- **Domain-Driven Design** - Rich domain models
- **Microservices** - Apply Event Sourcing to services

---

## 📚 Additional Resources

**Original Sources:**
- Greg Young - Event Sourcing
- Martin Fowler - Event Sourcing pattern
- Domain-Driven Design community

**Related Patterns:**
- [Projections](./2026-01-21-projections.md) - Transform events into read models
- [CQRS](./2026-01-20-cqrs-pattern.md) (Command Query Responsibility Segregation)
- [Event-Driven Architecture](./2026-01-27-event-driven-architecture.md) - Event-based communication
- Domain-Driven Design
- Microservices

**Books:**
- "Implementing Domain-Driven Design" by Vaughn Vernon
- "Domain-Driven Design" by Eric Evans
- "Building Microservices" by Sam Newman
- "Event Sourcing" by Greg Young

**Tools:**
- EventStore DB - Event store database
- Apache Kafka - Event streaming platform
- Axon Framework - CQRS/ES framework

---

