# Projections in CQRS and Event Sourcing - Deep Dive

## 📋 Learning Objectives

- [ ] Understand projection definition and principles
- [ ] Learn how projections transform events into read models
- [ ] Master different types of projections (event-driven, rebuild, multiple views)
- [ ] Recognize when to use projections vs direct queries
- [ ] Understand projection lifecycle and state management
- [ ] Practice implementing projections in real scenarios
- [ ] Learn projection patterns and best practices
- [ ] Explore real-world applications and use cases
- [ ] Understand common pitfalls and how to avoid them
- [ ] Compare projections with other data synchronization patterns

---

## 🎯 Definition

**Projections** are processes that transform events from the write side (command side) into read-optimized models (read models) for the query side. They listen to events, process them, and update denormalized views that are optimized for specific query patterns.

**Origin:**
- Concept from CQRS (Command Query Responsibility Segregation)
- Popularized by Greg Young and Udi Dahan
- Essential component of Event Sourcing architectures
- Based on materialized view patterns from databases

**Key Principles:**
- **Event-Driven** - React to events from write side
- **Transformative** - Convert events into read-optimized structures
- **Idempotent** - Processing same event multiple times produces same result
- **Denormalized** - Optimize for read performance, not normalization
- **Eventually Consistent** - Read models may lag behind write models

**Key Principle:**
> "Projections are the bridge between the write side and read side in CQRS. They listen to events, transform them, and build read models optimized for queries. Projections enable eventual consistency and allow read models to be optimized independently from write models." - Greg Young

**Alternative Formulation:**
> "A projection is a process that subscribes to events and transforms them into read models. It takes the event stream from the write side and creates denormalized, query-optimized views that the read side can efficiently query. Projections are idempotent and can be rebuilt from scratch by replaying events."

---

## 🏗️ Structure

### Traditional Approach vs Projections

**Traditional Approach:**
```
┌─────────────────────────────────────────────────────────┐
│                    Write Operation                       │
│  UPDATE users SET name='John' WHERE id=1                │
│                                                          │
│         ┌──────────────────────────┐                    │
│         │   Same Database          │                    │
│         │   (Normalized)           │                    │
│         └──────────────────────────┘                    │
│                                                          │
│                    Read Operation                       │
│  SELECT * FROM users WHERE id=1                         │
│  (May require joins, complex queries)                   │
└─────────────────────────────────────────────────────────┘
```

**Projection-Based Approach:**
```
┌─────────────────────────────────────────────────────────┐
│                    Command Side                         │
│  CreateUserCommand → UserCreatedEvent                   │
│                                                          │
│                        │                                │
│                        │ Events                         │
│                        ▼                                │
│              ┌──────────────────┐                      │
│              │  Event Store /    │                      │
│              │  Message Bus      │                      │
│              └──────────────────┘                      │
│                        │                                │
│                        │ Subscribe                      │
│                        ▼                                │
│  ┌──────────────────────────────────────────────────┐ │
│  │              Projection                          │ │
│  │  - Listens to events                            │ │
│  │  - Transforms data                              │ │
│  │  - Calculates derived values                    │ │
│  │  - Denormalizes for queries                     │ │
│  └──────────────────────────────────────────────────┘ │
│                        │                                │
│                        │ Updates                        │
│                        ▼                                │
│  ┌──────────────────────────────────────────────────┐ │
│  │              Read Model                          │ │
│  │  (Denormalized, Optimized)                      │ │
│  │  - Fast queries                                 │ │
│  │  - Pre-computed values                          │ │
│  │  - Query-optimized structure                    │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Projection Architecture Components

**1. Event Source**
- Event store or message bus
- Publishes events from command side
- Immutable event log

**2. Projection Handler**
- Subscribes to events
- Processes events
- Transforms data
- Updates read models

**3. Read Model**
- Denormalized data structure
- Optimized for queries
- Stored in read database

**4. Projection State**
- Tracks last processed event
- Enables resumability
- Supports rebuilds

---

## 🔍 Core Concepts Deep Dive

### 1. What is a Projection?

**Definition:** A projection is a process that transforms a stream of events into one or more read models optimized for specific query patterns.

**Purpose:**
- Transform events into read models
- Denormalize data for performance
- Calculate derived values
- Create query-optimized views
- Maintain eventual consistency

**Characteristics:**
- **Event-Driven** - Reacts to events
- **Idempotent** - Safe to replay
- **Transformative** - Converts event data
- **Denormalized** - Optimized for reads
- **Eventually Consistent** - May lag behind writes

**Example:**

```typescript
// Events/UserCreatedEvent.ts
export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly birthDate: Date,
    public readonly occurredAt: Date = new Date()
  ) {}
}

// Events/UserUpdatedEvent.ts
export class UserUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email?: string,
    public readonly name?: string,
    public readonly occurredAt: Date = new Date()
  ) {}
}

// Events/OrderPlacedEvent.ts
export class OrderPlacedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly amount: number,
    public readonly items: Array<{ productId: string; quantity: number }>,
    public readonly occurredAt: Date = new Date()
  ) {}
}

// ReadModels/UserReadModel.ts
export class UserReadModel {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly age: number, // Calculated from birthDate
    public readonly createdAt: Date,
    public readonly lastLoginAt?: Date,
    public readonly orderCount: number = 0, // Aggregated
    public readonly totalSpent: number = 0, // Aggregated
    public readonly recentOrders: Array<{
      id: string;
      amount: number;
      date: Date;
    }> = [] // Denormalized
  ) {}
}

// Projections/UserReadModelProjection.ts
export class UserReadModelProjection {
  constructor(
    private userReadRepository: UserReadRepository,
    private projectionStateRepository: ProjectionStateRepository
  ) {}

  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    const age = this.calculateAge(event.birthDate);
    const readModel = new UserReadModel(
      event.userId,
      event.email,
      event.name,
      age,
      event.occurredAt
    );
    await this.userReadRepository.save(readModel);
    await this.projectionStateRepository.savePosition(
      'UserReadModelProjection',
      event.occurredAt
    );
  }

  async handleUserUpdated(event: UserUpdatedEvent): Promise<void> {
    const readModel = await this.userReadRepository.findById(event.userId);
    if (!readModel) {
      // Handle missing read model (might need to rebuild)
      console.warn(`Read model not found for user ${event.userId}`);
      return;
    }

    // Update read model
    const updates: Partial<UserReadModel> = {};
    if (event.email) updates.email = event.email;
    if (event.name) updates.name = event.name;

    await this.userReadRepository.update(event.userId, updates);
    await this.projectionStateRepository.savePosition(
      'UserReadModelProjection',
      event.occurredAt
    );
  }

  async handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    const user = await this.userReadRepository.findById(event.userId);
    if (!user) return;

    // Update aggregated values
    const updatedUser = new UserReadModel(
      user.id,
      user.email,
      user.name,
      user.age,
      user.createdAt,
      user.lastLoginAt,
      user.orderCount + 1, // Increment order count
      user.totalSpent + event.amount, // Add to total spent
      [
        // Add to recent orders (keep last 10)
        { id: event.orderId, amount: event.amount, date: event.occurredAt },
        ...user.recentOrders.slice(0, 9)
      ]
    );

    await this.userReadRepository.save(updatedUser);
    await this.projectionStateRepository.savePosition(
      'UserReadModelProjection',
      event.occurredAt
    );
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
```

**Key Points:**
- ✅ Transforms events into read models
- ✅ Calculates derived values (age from birthDate)
- ✅ Aggregates data (orderCount, totalSpent)
- ✅ Denormalizes data (recentOrders)
- ✅ Tracks projection state
- ❌ Should not contain business logic
- ❌ Should not modify events

### 2. Types of Projections

#### A. Event-Driven Projections (Reactive)

**Definition:** Projections that react to events as they occur, updating read models in real-time or near real-time.

**Characteristics:**
- Real-time or near real-time updates
- Subscribes to event stream
- Processes events as they arrive
- Low latency

**Example:**

```typescript
// Projections/ReactiveUserProjection.ts
export class ReactiveUserProjection {
  constructor(
    private userReadRepository: UserReadRepository,
    private eventBus: EventBus
  ) {
    // Subscribe to events
    this.eventBus.subscribe('UserCreatedEvent', this.handleUserCreated.bind(this));
    this.eventBus.subscribe('UserUpdatedEvent', this.handleUserUpdated.bind(this));
  }

  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    // Process immediately when event occurs
    const readModel = this.transformToReadModel(event);
    await this.userReadRepository.save(readModel);
  }

  async handleUserUpdated(event: UserUpdatedEvent): Promise<void> {
    // Update read model immediately
    await this.userReadRepository.update(event.userId, {
      email: event.email,
      name: event.name
    });
  }

  private transformToReadModel(event: UserCreatedEvent): UserReadModel {
    // Transform event to read model
    return new UserReadModel(
      event.userId,
      event.email,
      event.name,
      this.calculateAge(event.birthDate),
      event.occurredAt
    );
  }
}
```

**Use Cases:**
- Real-time dashboards
- Live user profiles
- Current inventory levels
- Active session data

#### B. Rebuild Projections (Batch)

**Definition:** Projections that rebuild read models from scratch by replaying all events from the event store.

**Characteristics:**
- Rebuilds from scratch
- Replays all events
- Used for recovery or schema changes
- Can be time-consuming

**Example:**

```typescript
// Projections/RebuildUserProjection.ts
export class RebuildUserProjection {
  constructor(
    private userReadRepository: UserReadRepository,
    private eventStore: EventStore
  ) {}

  async rebuild(): Promise<void> {
    // Clear existing read models
    await this.userReadRepository.deleteAll();

    // Get all events from event store
    const events = await this.eventStore.getAllEvents();

    // Process events in order
    for (const event of events) {
      await this.processEvent(event);
    }

    console.log(`Rebuilt projection with ${events.length} events`);
  }

  async rebuildForUser(userId: string): Promise<void> {
    // Delete existing read model for user
    await this.userReadRepository.delete(userId);

    // Get all events for this user
    const events = await this.eventStore.getEventsForAggregate(userId);

    // Replay events
    for (const event of events) {
      await this.processEvent(event);
    }
  }

  private async processEvent(event: any): Promise<void> {
    switch (event.type) {
      case 'UserCreatedEvent':
        await this.handleUserCreated(event);
        break;
      case 'UserUpdatedEvent':
        await this.handleUserUpdated(event);
        break;
      case 'OrderPlacedEvent':
        await this.handleOrderPlaced(event);
        break;
    }
  }

  private async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    const readModel = new UserReadModel(
      event.userId,
      event.email,
      event.name,
      this.calculateAge(event.birthDate),
      event.occurredAt
    );
    await this.userReadRepository.save(readModel);
  }

  // ... other handlers
}
```

**Use Cases:**
- Recovery after failure
- Schema changes in read models
- Fixing data corruption
- Initial setup

#### C. Multiple Projections (Different Views)

**Definition:** Multiple projections that create different read models from the same events, optimized for different query patterns.

**Characteristics:**
- Same events, different views
- Optimized for specific queries
- Independent read models
- Flexible query patterns

**Example:**

```typescript
// Projections/UserListProjection.ts (Optimized for list views)
export class UserListProjection {
  constructor(private userListRepository: UserListReadRepository) {}

  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    const listModel = new UserListReadModel(
      event.userId,
      event.email,
      event.name,
      0, // orderCount
      undefined // lastOrderDate
    );
    await this.userListRepository.save(listModel);
  }

  async handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    const user = await this.userListRepository.findById(event.userId);
    if (!user) return;

    await this.userListRepository.update(event.userId, {
      orderCount: user.orderCount + 1,
      lastOrderDate: event.occurredAt
    });
  }
}

// ReadModels/UserListReadModel.ts
export class UserListReadModel {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly orderCount: number,
    public readonly lastOrderDate?: Date
  ) {}
}

// Projections/UserDetailProjection.ts (Optimized for detail views)
export class UserDetailProjection {
  constructor(private userDetailRepository: UserDetailReadRepository) {}

  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    const detailModel = new UserDetailReadModel(
      event.userId,
      event.email,
      event.name,
      this.calculateAge(event.birthDate),
      event.occurredAt,
      [], // orders
      [] // preferences
    );
    await this.userDetailRepository.save(detailModel);
  }

  async handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    const user = await this.userDetailRepository.findById(event.userId);
    if (!user) return;

    await this.userDetailRepository.update(event.userId, {
      orders: [
        ...user.orders,
        {
          id: event.orderId,
          amount: event.amount,
          items: event.items,
          date: event.occurredAt
        }
      ]
    });
  }
}

// ReadModels/UserDetailReadModel.ts
export class UserDetailReadModel {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly age: number,
    public readonly createdAt: Date,
    public readonly orders: Array<{
      id: string;
      amount: number;
      items: Array<{ productId: string; quantity: number }>;
      date: Date;
    }>,
    public readonly preferences: Array<{ key: string; value: string }>
  ) {}
}
```

**Use Cases:**
- Different UI views (list vs detail)
- Different query patterns
- Different performance requirements
- Different data requirements

### 3. Projection State Management

**Definition:** Tracking the position of a projection in the event stream to enable resumability and prevent duplicate processing.

**Purpose:**
- Track last processed event
- Enable resumability
- Prevent duplicate processing
- Support rebuilds
- Monitor projection health

**Example:**

```typescript
// ProjectionState.ts
export interface ProjectionState {
  projectionName: string;
  lastProcessedEventId: string;
  lastProcessedEventTimestamp: Date;
  version: number;
  status: 'running' | 'stopped' | 'error';
  lastError?: string;
  processedEventCount: number;
}

// Repositories/ProjectionStateRepository.ts
export interface ProjectionStateRepository {
  getState(projectionName: string): Promise<ProjectionState | null>;
  saveState(state: ProjectionState): Promise<void>;
  updatePosition(projectionName: string, eventId: string, timestamp: Date): Promise<void>;
  incrementVersion(projectionName: string): Promise<void>;
}

// Projections/StatefulUserProjection.ts
export class StatefulUserProjection {
  constructor(
    private userReadRepository: UserReadRepository,
    private projectionStateRepository: ProjectionStateRepository,
    private eventStore: EventStore
  ) {}

  async processEvents(): Promise<void> {
    const state = await this.projectionStateRepository.getState('UserProjection');
    
    // Get events since last processed
    const events = await this.eventStore.getEventsSince(
      state?.lastProcessedEventId || null
    );

    for (const event of events) {
      try {
        await this.processEvent(event);
        await this.projectionStateRepository.updatePosition(
          'UserProjection',
          event.id,
          event.occurredAt
        );
      } catch (error) {
        // Log error and update state
        await this.projectionStateRepository.saveState({
          projectionName: 'UserProjection',
          lastProcessedEventId: state?.lastProcessedEventId || '',
          lastProcessedEventTimestamp: state?.lastProcessedEventTimestamp || new Date(),
          version: (state?.version || 0) + 1,
          status: 'error',
          lastError: error instanceof Error ? error.message : 'Unknown error',
          processedEventCount: state?.processedEventCount || 0
        });
        throw error;
      }
    }
  }

  private async processEvent(event: any): Promise<void> {
    switch (event.type) {
      case 'UserCreatedEvent':
        await this.handleUserCreated(event);
        break;
      // ... other handlers
    }
  }
}
```

**Key Points:**
- ✅ Track last processed event
- ✅ Enable resumability
- ✅ Handle errors gracefully
- ✅ Monitor projection health
- ❌ Don't skip events
- ❌ Don't process events out of order

### 4. Idempotency in Projections

**Definition:** A projection is idempotent if processing the same event multiple times produces the same result without side effects.

**Purpose:**
- Enable safe replay
- Handle duplicate events
- Support rebuilds
- Ensure consistency

**Example:**

```typescript
// Projections/IdempotentUserProjection.ts
export class IdempotentUserProjection {
  constructor(
    private userReadRepository: UserReadRepository,
    private processedEventsRepository: ProcessedEventsRepository
  ) {}

  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    // Check if event already processed
    const alreadyProcessed = await this.processedEventsRepository.exists(
      event.id
    );
    
    if (alreadyProcessed) {
      // Event already processed, skip (idempotent)
      return;
    }

    // Process event
    const readModel = new UserReadModel(
      event.userId,
      event.email,
      event.name,
      this.calculateAge(event.birthDate),
      event.occurredAt
    );
    
    // Use upsert to handle duplicates
    await this.userReadRepository.upsert(readModel);
    
    // Mark event as processed
    await this.processedEventsRepository.markProcessed(event.id);
  }

  async handleUserUpdated(event: UserUpdatedEvent): Promise<void> {
    // Check if event already processed
    if (await this.processedEventsRepository.exists(event.id)) {
      return; // Already processed
    }

    // Get current read model
    const readModel = await this.userReadRepository.findById(event.userId);
    
    if (!readModel) {
      // Read model doesn't exist, might need to rebuild
      // For idempotency, we can either:
      // 1. Skip (if event will be processed later)
      // 2. Create with default values
      // 3. Throw error and trigger rebuild
      console.warn(`Read model not found for user ${event.userId}`);
      return;
    }

    // Update read model (idempotent - same update multiple times = same result)
    const updates: Partial<UserReadModel> = {};
    if (event.email) updates.email = event.email;
    if (event.name) updates.name = event.name;

    await this.userReadRepository.update(event.userId, updates);
    await this.processedEventsRepository.markProcessed(event.id);
  }
}
```

**Key Points:**
- ✅ Same event processed multiple times = same result
- ✅ Use upsert operations
- ✅ Track processed events
- ✅ Handle missing read models gracefully
- ❌ Don't assume events are unique
- ❌ Don't have side effects beyond read model updates

### 5. Projection Patterns

#### Pattern 1: Simple Transformation

**Use Case:** Direct mapping from event to read model.

```typescript
async handleUserCreated(event: UserCreatedEvent): Promise<void> {
  const readModel = new UserReadModel(
    event.userId,
    event.email,
    event.name,
    event.occurredAt
  );
  await this.repository.save(readModel);
}
```

#### Pattern 2: Calculated Fields

**Use Case:** Derive values from event data.

```typescript
async handleUserCreated(event: UserCreatedEvent): Promise<void> {
  const age = this.calculateAge(event.birthDate);
  const readModel = new UserReadModel(
    event.userId,
    event.email,
    event.name,
    age, // Calculated
    event.occurredAt
  );
  await this.repository.save(readModel);
}
```

#### Pattern 3: Aggregation

**Use Case:** Aggregate data from multiple events.

```typescript
async handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
  const user = await this.repository.findById(event.userId);
  if (!user) return;

  const updatedUser = new UserReadModel(
    user.id,
    user.email,
    user.name,
    user.age,
    user.createdAt,
    user.orderCount + 1, // Aggregate
    user.totalSpent + event.amount // Aggregate
  );
  await this.repository.save(updatedUser);
}
```

#### Pattern 4: Denormalization

**Use Case:** Include related data in read model.

```typescript
async handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
  const user = await this.repository.findById(event.userId);
  if (!user) return;

  // Get product details (denormalize)
  const productDetails = await this.productService.getProducts(
    event.items.map(item => item.productId)
  );

  const updatedUser = new UserReadModel(
    user.id,
    user.email,
    user.name,
    user.age,
    user.createdAt,
    user.orderCount + 1,
    user.totalSpent + event.amount,
    [
      ...user.recentOrders,
      {
        id: event.orderId,
        amount: event.amount,
        products: productDetails, // Denormalized
        date: event.occurredAt
      }
    ]
  );
  await this.repository.save(updatedUser);
}
```

#### Pattern 5: Multi-Entity Projection

**Use Case:** Update multiple read models from one event.

```typescript
async handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
  // Update user read model
  const user = await this.userRepository.findById(event.userId);
  await this.userRepository.update(event.userId, {
    orderCount: user.orderCount + 1,
    totalSpent: user.totalSpent + event.amount
  });

  // Update product read model
  for (const item of event.items) {
    const product = await this.productRepository.findById(item.productId);
    await this.productRepository.update(item.productId, {
      totalSold: product.totalSold + item.quantity,
      revenue: product.revenue + (item.quantity * product.price)
    });
  }

  // Update order read model
  const orderReadModel = new OrderReadModel(
    event.orderId,
    event.userId,
    event.amount,
    event.items,
    event.occurredAt
  );
  await this.orderRepository.save(orderReadModel);
}
```

---

## 💡 When to Use Projections

### Use Projections When:

✅ **CQRS Architecture**
- Separating read and write models
- Need to optimize reads independently
- Different query patterns than write patterns
- Example: E-commerce, Banking systems

✅ **Event Sourcing**
- Using event sourcing
- Need to build read models from events
- Want to rebuild read models
- Example: Financial systems, Audit systems

✅ **Performance Optimization**
- Read performance is critical
- Need denormalized data
- Complex queries on normalized data
- Example: High-traffic applications, Analytics

✅ **Multiple Read Views**
- Different views of same data
- Different query patterns
- Different optimization needs
- Example: Dashboards, Reports, Search

✅ **Eventual Consistency Acceptable**
- Can tolerate slight delay
- Read models don't need immediate updates
- Example: User profiles, Product catalogs

### Don't Use Projections When:

❌ **Immediate Consistency Required**
- Need immediate read-after-write consistency
- Can't tolerate any delay
- Example: Real-time trading, Critical transactions

❌ **Simple CRUD**
- Simple read/write operations
- No performance issues
- Traditional approach sufficient
- Example: Simple admin panels

❌ **Low Complexity**
- Straightforward queries
- No complex transformations
- Overhead not justified
- Example: Small applications, MVPs

❌ **Tight Coupling Needed**
- Read and write must be tightly coupled
- Can't separate models
- Example: Some real-time systems

---

## 🏛️ Implementation Patterns

### Pattern 1: Simple CQRS with Projections

```
Commands → Write Model → Events → Projection → Read Model
```

### Pattern 2: Event Sourcing with Projections

```
Commands → Aggregate → Events → Event Store → Projection → Read Model
```

### Pattern 3: Multiple Projections

```
Events → Projection 1 → Read Model 1 (List View)
      → Projection 2 → Read Model 2 (Detail View)
      → Projection 3 → Read Model 3 (Search View)
```

### Pattern 4: Projection with External Data

```
Events → Projection → External Service → Read Model (Denormalized)
```

---

## 📚 Complete Implementation Example

### File Structure

```
src/
├── Events/                           # Events
│   ├── UserCreatedEvent.ts
│   ├── UserUpdatedEvent.ts
│   └── OrderPlacedEvent.ts
│
├── ReadModels/                       # Read Models
│   ├── UserReadModel.ts
│   ├── UserListReadModel.ts
│   └── UserDetailReadModel.ts
│
├── Projections/                      # Projections
│   ├── UserReadModelProjection.ts
│   ├── UserListProjection.ts
│   └── UserDetailProjection.ts
│
├── Repositories/                     # Repositories
│   ├── Read/
│   │   ├── UserReadRepository.ts
│   │   └── UserListReadRepository.ts
│   └── ProjectionStateRepository.ts
│
├── Services/                          # Services
│   ├── ProjectionService.ts
│   └── RebuildService.ts
│
└── EventHandlers/                    # Event Handlers
    └── ProjectionEventHandlers.ts
```

### Complete Example

```typescript
// Services/ProjectionService.ts
export class ProjectionService {
  constructor(
    private eventBus: EventBus,
    private projections: Map<string, Projection>
  ) {}

  async start(): Promise<void> {
    // Subscribe all projections to events
    for (const [name, projection] of this.projections) {
      await this.subscribeProjection(name, projection);
    }
  }

  private async subscribeProjection(name: string, projection: Projection): Promise<void> {
    // Subscribe to relevant events
    if (projection.handlesEvent('UserCreatedEvent')) {
      this.eventBus.subscribe('UserCreatedEvent', async (event) => {
        await projection.handleUserCreated(event);
      });
    }
    // ... other events
  }
}

// Projections/UserReadModelProjection.ts
export class UserReadModelProjection implements Projection {
  constructor(
    private userReadRepository: UserReadRepository,
    private projectionStateRepository: ProjectionStateRepository
  ) {}

  handlesEvent(eventType: string): boolean {
    return ['UserCreatedEvent', 'UserUpdatedEvent', 'OrderPlacedEvent'].includes(eventType);
  }

  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    try {
      const age = this.calculateAge(event.birthDate);
      const readModel = new UserReadModel(
        event.userId,
        event.email,
        event.name,
        age,
        event.occurredAt
      );
      
      await this.userReadRepository.save(readModel);
      await this.updateProjectionState(event);
    } catch (error) {
      await this.handleError(error, event);
      throw error;
    }
  }

  async handleUserUpdated(event: UserUpdatedEvent): Promise<void> {
    try {
      const readModel = await this.userReadRepository.findById(event.userId);
      if (!readModel) {
        console.warn(`Read model not found for user ${event.userId}`);
        return;
      }

      const updates: Partial<UserReadModel> = {};
      if (event.email) updates.email = event.email;
      if (event.name) updates.name = event.name;

      await this.userReadRepository.update(event.userId, updates);
      await this.updateProjectionState(event);
    } catch (error) {
      await this.handleError(error, event);
      throw error;
    }
  }

  async handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
    try {
      const user = await this.userReadRepository.findById(event.userId);
      if (!user) return;

      const updatedUser = new UserReadModel(
        user.id,
        user.email,
        user.name,
        user.age,
        user.createdAt,
        user.lastLoginAt,
        user.orderCount + 1,
        user.totalSpent + event.amount,
        [
          { id: event.orderId, amount: event.amount, date: event.occurredAt },
          ...user.recentOrders.slice(0, 9)
        ]
      );

      await this.userReadRepository.save(updatedUser);
      await this.updateProjectionState(event);
    } catch (error) {
      await this.handleError(error, event);
      throw error;
    }
  }

  private async updateProjectionState(event: any): Promise<void> {
    await this.projectionStateRepository.updatePosition(
      'UserReadModelProjection',
      event.id || event.userId,
      event.occurredAt || new Date()
    );
  }

  private async handleError(error: any, event: any): Promise<void> {
    await this.projectionStateRepository.saveState({
      projectionName: 'UserReadModelProjection',
      lastProcessedEventId: event.id || '',
      lastProcessedEventTimestamp: event.occurredAt || new Date(),
      version: 0,
      status: 'error',
      lastError: error instanceof Error ? error.message : 'Unknown error',
      processedEventCount: 0
    });
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

// Services/RebuildService.ts
export class RebuildService {
  constructor(
    private eventStore: EventStore,
    private projections: Map<string, Projection>
  ) {}

  async rebuildAll(): Promise<void> {
    for (const [name, projection] of this.projections) {
      await this.rebuildProjection(name, projection);
    }
  }

  async rebuildProjection(projectionName: string): Promise<void> {
    const projection = this.projections.get(projectionName);
    if (!projection) {
      throw new Error(`Projection ${projectionName} not found`);
    }

    // Get all events
    const events = await this.eventStore.getAllEvents();

    // Process events in order
    for (const event of events) {
      if (projection.handlesEvent(event.type)) {
        await this.processEvent(projection, event);
      }
    }
  }

  private async processEvent(projection: Projection, event: any): Promise<void> {
    switch (event.type) {
      case 'UserCreatedEvent':
        await projection.handleUserCreated(event);
        break;
      case 'UserUpdatedEvent':
        await projection.handleUserUpdated(event);
        break;
      case 'OrderPlacedEvent':
        await projection.handleOrderPlaced(event);
        break;
    }
  }
}
```

---

## ⚠️ Common Pitfalls

### 1. Not Making Projections Idempotent

**Problem:** Processing same event multiple times causes incorrect state.

**❌ Wrong:**

```typescript
async handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
  const user = await this.repository.findById(event.userId);
  // ❌ Not idempotent - will increment multiple times
  user.orderCount++;
  await this.repository.save(user);
}
```

**✅ Correct:**

```typescript
async handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
  // ✅ Check if event already processed
  if (await this.processedEventsRepository.exists(event.id)) {
    return; // Already processed
  }

  const user = await this.repository.findById(event.userId);
  user.orderCount++;
  await this.repository.save(user);
  await this.processedEventsRepository.markProcessed(event.id);
}
```

### 2. Processing Events Out of Order

**Problem:** Events processed out of order cause incorrect read model state.

**❌ Wrong:**

```typescript
// ❌ No ordering guarantee
async processEvents(events: Event[]): Promise<void> {
  await Promise.all(events.map(event => this.processEvent(event)));
}
```

**✅ Correct:**

```typescript
// ✅ Process events in order
async processEvents(events: Event[]): Promise<void> {
  const sortedEvents = events.sort((a, b) => 
    a.occurredAt.getTime() - b.occurredAt.getTime()
  );
  
  for (const event of sortedEvents) {
    await this.processEvent(event);
  }
}
```

### 3. Not Handling Missing Read Models

**Problem:** Updating non-existent read model causes errors.

**❌ Wrong:**

```typescript
async handleUserUpdated(event: UserUpdatedEvent): Promise<void> {
  const readModel = await this.repository.findById(event.userId);
  // ❌ Will throw error if readModel is null
  readModel.email = event.email;
  await this.repository.save(readModel);
}
```

**✅ Correct:**

```typescript
async handleUserUpdated(event: UserUpdatedEvent): Promise<void> {
  const readModel = await this.repository.findById(event.userId);
  if (!readModel) {
    // Handle missing read model
    // Option 1: Trigger rebuild
    await this.rebuildService.rebuildForUser(event.userId);
    return;
    // Option 2: Skip and log
    // console.warn(`Read model not found for user ${event.userId}`);
    // return;
  }

  readModel.email = event.email;
  await this.repository.save(readModel);
}
```

### 4. Not Tracking Projection State

**Problem:** Can't resume after failure, must rebuild from scratch.

**❌ Wrong:**

```typescript
// ❌ No state tracking
async handleUserCreated(event: UserCreatedEvent): Promise<void> {
  const readModel = new UserReadModel(...);
  await this.repository.save(readModel);
  // No tracking - can't resume
}
```

**✅ Correct:**

```typescript
// ✅ Track projection state
async handleUserCreated(event: UserCreatedEvent): Promise<void> {
  const readModel = new UserReadModel(...);
  await this.repository.save(readModel);
  await this.projectionStateRepository.updatePosition(
    'UserProjection',
    event.id,
    event.occurredAt
  );
}
```

### 5. Business Logic in Projections

**Problem:** Projections contain business logic instead of just transformations.

**❌ Wrong:**

```typescript
async handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
  // ❌ Business logic in projection
  if (event.amount > 1000) {
    // Apply discount - this is business logic!
    event.amount = event.amount * 0.9;
  }
  // ...
}
```

**✅ Correct:**

```typescript
async handleOrderPlaced(event: OrderPlacedEvent): Promise<void> {
  // ✅ Just transform - business logic is in command handler
  const user = await this.repository.findById(event.userId);
  user.orderCount++;
  user.totalSpent += event.amount; // Use amount from event (already calculated)
  await this.repository.save(user);
}
```

---

## ✅ Best Practices

### 1. Idempotency

✅ **Do:**
- Make projections idempotent
- Track processed events
- Use upsert operations
- Handle duplicate events gracefully

❌ **Don't:**
- Assume events are unique
- Have side effects beyond read model updates
- Skip idempotency checks

### 2. Error Handling

✅ **Do:**
- Handle errors gracefully
- Log errors with context
- Track error state
- Support retry mechanisms
- Handle missing read models

❌ **Don't:**
- Swallow errors silently
- Continue processing after errors
- Ignore missing read models

### 3. State Management

✅ **Do:**
- Track projection position
- Enable resumability
- Monitor projection health
- Support rebuilds
- Version projection state

❌ **Don't:**
- Skip state tracking
- Process events out of order
- Ignore projection state

### 4. Performance

✅ **Do:**
- Optimize read model structure
- Use appropriate indexes
- Batch updates when possible
- Monitor projection lag
- Scale projections independently

❌ **Don't:**
- Create unnecessary indexes
- Process events synchronously if not needed
- Ignore performance metrics

### 5. Testing

✅ **Do:**
- Test idempotency
- Test event ordering
- Test error handling
- Test rebuilds
- Test with missing data

❌ **Don't:**
- Skip idempotency tests
- Assume events are in order
- Ignore edge cases

---

## 🔀 Projections vs Other Patterns

### Projections vs Materialized Views

**Materialized Views:**
- Database-level feature
- Automatically maintained
- Limited transformation capabilities
- Database-specific

**Projections:**
- Application-level feature
- Custom transformation logic
- Full programming capabilities
- Database-agnostic

**Key Difference:** Projections are application-level with full control, materialized views are database-level with limited control.

### Projections vs ETL Processes

**ETL Processes:**
- Extract, Transform, Load
- Usually batch-oriented
- Scheduled execution
- Data warehouse focus

**Projections:**
- Event-driven
- Real-time or near real-time
- Continuous execution
- Application focus

**Key Difference:** ETL is batch-oriented and scheduled, projections are event-driven and continuous.

### Projections vs Caching

**Caching:**
- Stores computed results
- TTL-based expiration
- Cache invalidation needed
- Performance optimization

**Projections:**
- Transforms events to read models
- Event-driven updates
- No expiration needed
- Data synchronization

**Key Difference:** Caching is about performance with expiration, projections are about data synchronization with events.

---

## 🌍 Real-World Applications

### 1. E-Commerce Platform

**Projections:**
- Product catalog projection (denormalized for search)
- User order history projection
- Shopping cart projection
- Product recommendation projection

**Benefits:**
- Fast product searches
- Quick order history retrieval
- Optimized cart display
- Personalized recommendations

### 2. Social Media Platform

**Projections:**
- User feed projection (denormalized posts)
- User profile projection
- Friend list projection
- Notification projection

**Benefits:**
- Fast feed generation
- Quick profile loading
- Efficient friend queries
- Real-time notifications

### 3. Banking System

**Projections:**
- Account balance projection
- Transaction history projection
- Account summary projection
- Report projection

**Benefits:**
- Fast balance queries
- Quick transaction history
- Efficient reporting
- Audit trail

### 4. Analytics Platform

**Projections:**
- Dashboard projection
- Report projection
- Metric projection
- Aggregation projection

**Benefits:**
- Fast dashboard loading
- Quick report generation
- Efficient metric queries
- Real-time analytics

---

## 📊 Benefits and Trade-offs

### Benefits

✅ **Performance Optimization**
- Denormalized read models
- Query-optimized structures
- Pre-computed values
- Fast read operations

✅ **Separation of Concerns**
- Write side focuses on business logic
- Read side focuses on query performance
- Independent optimization
- Clear boundaries

✅ **Flexibility**
- Multiple read models from same events
- Different views for different needs
- Easy to add new projections
- Technology flexibility

✅ **Scalability**
- Scale projections independently
- Process events asynchronously
- Handle high event volumes
- Distribute across services

✅ **Recoverability**
- Rebuild from events
- Fix data corruption
- Handle failures gracefully
- Complete audit trail

### Trade-offs

❌ **Eventual Consistency**
- Read models may lag behind
- Need to handle consistency
- Potential data staleness
- More complex error handling

❌ **Complexity**
- More moving parts
- Event handling logic
- State management
- Higher maintenance

❌ **Data Duplication**
- Read models duplicate data
- Storage overhead
- Sync complexity
- More data to manage

❌ **Latency**
- Processing delay
- Not immediate updates
- May need to wait for projection
- Eventual consistency delay

---

## 🎓 Summary

### Key Takeaways

1. **Projections** transform events into read-optimized models
2. **Event-Driven** - React to events from write side
3. **Idempotent** - Safe to replay events
4. **Denormalized** - Optimized for query performance
5. **Eventually Consistent** - May lag behind writes
6. **Multiple Views** - Different projections for different needs
7. **State Management** - Track position for resumability
8. **Rebuildable** - Can rebuild from events

### When to Use

✅ **Use Projections When:**
- Using CQRS or Event Sourcing
- Need to optimize reads independently
- Multiple read views needed
- Eventual consistency acceptable
- Performance optimization critical

❌ **Avoid Projections When:**
- Immediate consistency required
- Simple CRUD operations
- Low complexity
- Tight coupling needed

### Best Practices

- Make projections idempotent
- Track projection state
- Handle errors gracefully
- Process events in order
- Handle missing read models
- Monitor projection health
- Support rebuilds
- Test thoroughly

### Next Steps

After mastering Projections, consider:
- **Event Sourcing** - Store events as source of truth ([2026-01-21-event-sourcing.md](./2026-01-21-event-sourcing.md))
- **CQRS** - Separate read and write models ([2026-01-20-cqrs-pattern.md](./2026-01-20-cqrs-pattern.md))
- **Event-Driven Architecture** - Full event-driven system ([2026-01-27-event-driven-architecture.md](./2026-01-27-event-driven-architecture.md))
- **Microservices** - Apply projections across services

---

## 📚 Additional Resources

**Original Sources:**
- Greg Young - Projections in CQRS
- Udi Dahan - Event-Driven Projections
- Martin Fowler - Event Sourcing and Projections

**Related Patterns:**
- [CQRS](./2026-01-20-cqrs-pattern.md) (Command Query Responsibility Segregation)
- [Event Sourcing](./2026-01-21-event-sourcing.md) - Store events as source of truth
- [Event-Driven Architecture](./2026-01-27-event-driven-architecture.md) - Event-based communication
- Materialized Views

**Books:**
- "Implementing Domain-Driven Design" by Vaughn Vernon
- "Domain-Driven Design" by Eric Evans
- "Building Microservices" by Sam Newman
- "Event Sourcing" by Greg Young

---

