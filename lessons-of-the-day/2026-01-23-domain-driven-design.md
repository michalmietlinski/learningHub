# Domain-Driven Design (DDD) - Deep Dive

## 📋 Learning Objectives

- [ ] Understand Domain-Driven Design definition and principles
- [ ] Learn strategic design: Bounded Contexts, Ubiquitous Language, Context Mapping
- [ ] Master tactical design: Entities, Value Objects, Aggregates, Repositories
- [ ] Recognize when to use DDD vs other approaches
- [ ] Understand domain modeling and domain experts collaboration
- [ ] Practice implementing DDD in real scenarios
- [ ] Learn aggregate design and consistency boundaries
- [ ] Explore real-world applications and use cases
- [ ] Understand common pitfalls and best practices
- [ ] Compare with other architectural approaches

---

## 🎯 Definition

**Domain-Driven Design (DDD)** is a software development approach that focuses on creating software that reflects a deep understanding of the business domain. It emphasizes collaboration between technical and domain experts to build a shared model that captures the essential business concepts and rules.

**Origin:**
- Coined by Eric Evans in his 2003 book "Domain-Driven Design: Tackling Complexity in the Heart of Software"
- Addresses complexity in software development
- Emphasizes domain modeling over technical concerns
- Foundation for many modern architectural patterns

**Key Principles:**
- **Focus on Domain** - Business domain is the heart of the software
- **Ubiquitous Language** - Shared language between developers and domain experts
- **Model-Driven Design** - Code reflects the domain model
- **Strategic Design** - Organizing large systems with bounded contexts
- **Tactical Design** - Building blocks for domain models

**Key Principle:**
> "Domain-Driven Design is an approach to software development that centers the development on programming a domain model that has a rich understanding of the processes and rules of a domain. The domain model should be the primary focus of the software, not the technical infrastructure." - Eric Evans

**Alternative Formulation:**
> "DDD emphasizes building software that reflects the business domain. Developers and domain experts collaborate to create a shared model using a ubiquitous language. The domain model drives the design, not the database or framework."

---

## 🏗️ Structure

### DDD Layers

```
┌─────────────────────────────────────────────────────────┐
│              User Interface Layer                        │
│  (Controllers, Views, API Endpoints)                    │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Application Layer                           │
│  (Use Cases, Application Services, DTOs)                 │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Domain Layer (CORE)                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Entities, Value Objects, Aggregates              │  │
│  │  Domain Services, Domain Events                   │  │
│  │  Repository Interfaces                            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Infrastructure Layer                        │
│  (Repository Implementations, External Services)        │
└─────────────────────────────────────────────────────────┘
```

### Strategic Design vs Tactical Design

**Strategic Design:**
- Organizing large systems
- Bounded Contexts
- Ubiquitous Language
- Context Mapping
- Large-scale structure

**Tactical Design:**
- Building blocks for domain models
- Entities, Value Objects
- Aggregates, Repositories
- Domain Services
- Domain Events

---

## 🔍 Strategic Design

### 1. Bounded Context

**Definition:** An explicit boundary within which a domain model applies. Each bounded context has its own domain model and ubiquitous language.

**Purpose:**
- Define clear boundaries
- Isolate domain models
- Prevent model confusion
- Enable independent development

**Characteristics:**
- **Explicit Boundary** - Clear definition of what's inside
- **Own Model** - Each context has its own domain model
- **Ubiquitous Language** - Shared language within context
- **Independent** - Can evolve independently

**Example:**

```typescript
// Bounded Context: E-Commerce
// Domain: Order Management

// Order Aggregate
export class Order {
  constructor(
    private id: OrderId,
    private customerId: CustomerId,
    private items: OrderItem[],
    private status: OrderStatus,
    private total: Money
  ) {}

  // Domain logic
  addItem(productId: ProductId, quantity: number, price: Money): void {
    // Business rule: Can't modify shipped orders
    if (this.status === OrderStatus.SHIPPED) {
      throw new DomainError('Cannot modify shipped order');
    }
    
    const item = new OrderItem(productId, quantity, price);
    this.items.push(item);
    this.recalculateTotal();
  }

  ship(): void {
    // Business rule: Can only ship confirmed orders
    if (this.status !== OrderStatus.CONFIRMED) {
      throw new DomainError('Order must be confirmed before shipping');
    }
    this.status = OrderStatus.SHIPPED;
    DomainEventPublisher.publish(new OrderShippedEvent(this.id));
  }

  private recalculateTotal(): void {
    this.total = this.items.reduce(
      (sum, item) => sum.add(item.getSubtotal()),
      Money.zero()
    );
  }
}

// Bounded Context: Inventory Management
// Domain: Product Inventory (Different model, same "Product" concept)

export class InventoryItem {
  constructor(
    private productId: ProductId,
    private quantity: number,
    private reservedQuantity: number
  ) {}

  // Different domain logic for inventory
  reserve(quantity: number): void {
    if (this.availableQuantity() < quantity) {
      throw new DomainError('Insufficient inventory');
    }
    this.reservedQuantity += quantity;
  }

  availableQuantity(): number {
    return this.quantity - this.reservedQuantity;
  }
}
```

**Key Points:**
- ✅ Clear boundaries between contexts
- ✅ Each context has its own model
- ✅ Same concept can exist in different contexts with different meanings
- ✅ Prevents model confusion

### 2. Ubiquitous Language

**Definition:** A shared language between developers and domain experts used throughout the codebase to describe domain concepts.

**Purpose:**
- Bridge communication gap
- Reflect domain accurately
- Reduce translation errors
- Make code self-documenting

**Characteristics:**
- **Shared Vocabulary** - Same terms used everywhere
- **Domain-Focused** - Terms from domain, not technical
- **Evolving** - Refined through collaboration
- **Code Reflection** - Code uses same terms

**Example:**

```typescript
// ✅ Good: Uses ubiquitous language
export class Order {
  // Domain terms: Order, Customer, Item, Ship
  ship(): void {
    // Business term "ship" used in code
    this.status = OrderStatus.SHIPPED;
  }
}

// ❌ Bad: Technical terms instead of domain terms
export class OrderEntity {
  // Technical term "Entity" instead of domain term
  markAsShipped(): void {
    // Technical term instead of domain term "ship"
    this.status = OrderStatus.SHIPPED;
  }
}
```

**Key Points:**
- ✅ Use domain terms in code
- ✅ Collaborate with domain experts
- ✅ Avoid technical jargon
- ✅ Code should read like domain language

### 3. Context Mapping

**Definition:** A technique for visualizing relationships between bounded contexts in a large system.

**Purpose:**
- Understand context relationships
- Identify integration points
- Plan system evolution
- Manage dependencies

**Relationship Types:**

**1. Partnership:**
- Two teams work closely together
- Shared kernel or integration
- Mutual dependency

**2. Shared Kernel:**
- Shared code between contexts
- Requires coordination
- Use sparingly

**3. Customer-Supplier:**
- Upstream (Supplier) → Downstream (Customer)
- Customer depends on supplier
- Supplier may not care about customer needs

**4. Conformist:**
- Downstream conforms to upstream
- No influence on upstream
- Accept upstream model as-is

**5. Anticorruption Layer:**
- Translates between contexts
- Protects downstream from upstream changes
- Adapter pattern

**6. Separate Ways:**
- No integration needed
- Independent contexts
- No dependencies

**7. Open Host Service:**
- Published language for integration
- Multiple consumers
- Stable API

**Example:**

```
┌─────────────────────┐
│  Order Management   │
│   (Bounded Context) │
└─────────────────────┘
         │
         │ Customer-Supplier
         ▼
┌─────────────────────┐
│  Payment Processing  │
│   (Bounded Context)  │
└─────────────────────┘
         │
         │ Anticorruption Layer
         ▼
┌─────────────────────┐
│  Legacy Billing     │
│   (Bounded Context)  │
└─────────────────────┘
```

---

## 🔍 Tactical Design

### 1. Entities

**Definition:** Objects with unique identity that persist over time, even if their attributes change.

**Purpose:**
- Represent domain concepts with identity
- Track objects over time
- Maintain identity through changes

**Characteristics:**
- **Identity** - Unique identifier
- **Mutable** - Can change attributes
- **Equality by Identity** - Same ID = same entity
- **Lifecycle** - Created, modified, deleted

**Example:**

```typescript
// Entity: Has identity
export class User {
  constructor(
    private id: UserId, // Identity
    private email: Email,
    private name: string
  ) {}

  // Can change attributes but identity remains
  updateEmail(newEmail: Email): void {
    this.email = newEmail;
    // ID stays the same
  }

  updateName(newName: string): void {
    this.name = newName;
    // ID stays the same
  }

  // Equality by identity
  equals(other: User): boolean {
    return this.id.equals(other.id);
  }

  getId(): UserId {
    return this.id;
  }
}

// Value Object: UserId (identity)
export class UserId {
  constructor(private readonly value: string) {}

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}
```

**Key Points:**
- ✅ Has unique identity
- ✅ Mutable attributes
- ✅ Equality by identity
- ✅ Persists over time

### 2. Value Objects

**Definition:** Objects defined by their attributes rather than identity. Two value objects are equal if all their attributes are equal.

**Purpose:**
- Represent domain concepts without identity
- Encapsulate related attributes
- Ensure immutability
- Simplify domain model

**Characteristics:**
- **No Identity** - Defined by attributes
- **Immutable** - Cannot be changed
- **Equality by Value** - Same attributes = equal
- **Self-Validating** - Validates on creation

**Example:**

```typescript
// Value Object: Money
export class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {
    this.validate();
  }

  // Immutable - returns new instance
  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new DomainError('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  // Equality by value
  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  private validate(): void {
    if (this.amount < 0) {
      throw new DomainError('Money amount cannot be negative');
    }
    if (!this.isValidCurrency(this.currency)) {
      throw new DomainError('Invalid currency');
    }
  }

  private isValidCurrency(currency: string): boolean {
    return ['USD', 'EUR', 'GBP'].includes(currency);
  }

  getAmount(): number { return this.amount; }
  getCurrency(): string { return this.currency; }
}

// Value Object: Email
export class Email {
  constructor(private readonly value: string) {
    this.validate();
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  private validate(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.value)) {
      throw new DomainError('Invalid email format');
    }
  }
}
```

**Key Points:**
- ✅ No identity, defined by attributes
- ✅ Immutable
- ✅ Equality by value
- ✅ Self-validating
- ✅ Can be replaced, not modified

### 3. Aggregates

**Definition:** A cluster of entities and value objects treated as a single unit for data changes. An aggregate has a root entity (aggregate root) that controls access to the aggregate.

**Purpose:**
- Define consistency boundaries
- Control access to domain objects
- Maintain invariants
- Simplify complex relationships

**Characteristics:**
- **Aggregate Root** - Single entry point
- **Consistency Boundary** - All changes within aggregate are consistent
- **Invariants** - Business rules enforced within aggregate
- **References** - Other aggregates referenced by ID, not direct reference

**Example:**

```typescript
// Aggregate Root: Order
export class Order {
  private items: OrderItem[] = [];
  private payments: Payment[] = [];

  constructor(
    private id: OrderId,
    private customerId: CustomerId,
    private status: OrderStatus,
    private total: Money
  ) {}

  // Aggregate root controls access
  addItem(productId: ProductId, quantity: number, price: Money): void {
    // Invariant: Can't modify shipped orders
    if (this.status === OrderStatus.SHIPPED) {
      throw new DomainError('Cannot modify shipped order');
    }

    // Invariant: Item quantity must be positive
    if (quantity <= 0) {
      throw new DomainError('Quantity must be positive');
    }

    const item = new OrderItem(productId, quantity, price);
    this.items.push(item);
    this.recalculateTotal();
  }

  // Aggregate root controls access
  removeItem(itemId: OrderItemId): void {
    if (this.status === OrderStatus.SHIPPED) {
      throw new DomainError('Cannot modify shipped order');
    }

    this.items = this.items.filter(item => !item.getId().equals(itemId));
    this.recalculateTotal();
  }

  // Aggregate root enforces invariants
  confirm(): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new DomainError('Only pending orders can be confirmed');
    }
    if (this.items.length === 0) {
      throw new DomainError('Order must have at least one item');
    }
    this.status = OrderStatus.CONFIRMED;
    DomainEventPublisher.publish(new OrderConfirmedEvent(this.id));
  }

  // Reference other aggregates by ID, not direct reference
  applyPayment(paymentId: PaymentId, amount: Money): void {
    // Don't load Payment aggregate, just reference by ID
    const payment = new Payment(paymentId, amount, new Date());
    this.payments.push(payment);
    
    if (this.isFullyPaid()) {
      this.status = OrderStatus.PAID;
    }
  }

  private recalculateTotal(): void {
    this.total = this.items.reduce(
      (sum, item) => sum.add(item.getSubtotal()),
      Money.zero()
    );
  }

  private isFullyPaid(): boolean {
    const paidAmount = this.payments.reduce(
      (sum, payment) => sum.add(payment.getAmount()),
      Money.zero()
    );
    return paidAmount.greaterThanOrEqual(this.total);
  }

  // Getters
  getId(): OrderId { return this.id; }
  getItems(): ReadonlyArray<OrderItem> { return [...this.items]; }
  getTotal(): Money { return this.total; }
  getStatus(): OrderStatus { return this.status; }
}

// Entity within aggregate (not aggregate root)
export class OrderItem {
  constructor(
    private id: OrderItemId,
    private productId: ProductId,
    private quantity: number,
    private unitPrice: Money
  ) {}

  getSubtotal(): Money {
    return this.unitPrice.multiply(this.quantity);
  }

  getId(): OrderItemId { return this.id; }
  getProductId(): ProductId { return this.productId; }
  getQuantity(): number { return this.quantity; }
}
```

**Key Points:**
- ✅ Aggregate root controls access
- ✅ Consistency boundary
- ✅ Invariants enforced
- ✅ Reference other aggregates by ID
- ✅ Load entire aggregate together

### 4. Repositories

**Definition:** An abstraction for accessing aggregates. Repositories provide the illusion of an in-memory collection of aggregates.

**Purpose:**
- Abstract data access
- Provide aggregate access interface
- Hide persistence details
- Enable testing

**Characteristics:**
- **Aggregate-Focused** - Works with aggregates, not entities
- **Collection-Like** - Interface like in-memory collection
- **Persistence Abstraction** - Hides database details
- **Query Interface** - Methods to find aggregates

**Example:**

```typescript
// Repository Interface (in Domain layer)
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  findByCustomerId(customerId: CustomerId): Promise<Order[]>;
  delete(id: OrderId): Promise<void>;
}

// Repository Implementation (in Infrastructure layer)
export class OrderRepositoryImpl implements OrderRepository {
  constructor(private db: Database) {}

  async save(order: Order): Promise<void> {
    // Save entire aggregate
    const orderData = {
      id: order.getId().toString(),
      customerId: order.getCustomerId().toString(),
      status: order.getStatus(),
      total: order.getTotal().getAmount(),
      currency: order.getTotal().getCurrency(),
      items: order.getItems().map(item => ({
        id: item.getId().toString(),
        productId: item.getProductId().toString(),
        quantity: item.getQuantity(),
        unitPrice: item.getUnitPrice().getAmount()
      }))
    };

    await this.db.orders.save(orderData);
  }

  async findById(id: OrderId): Promise<Order | null> {
    const orderData = await this.db.orders.findById(id.toString());
    if (!orderData) {
      return null;
    }

    // Reconstruct entire aggregate
    return this.toAggregate(orderData);
  }

  async findByCustomerId(customerId: CustomerId): Promise<Order[]> {
    const ordersData = await this.db.orders.findByCustomerId(customerId.toString());
    return ordersData.map(data => this.toAggregate(data));
  }

  private toAggregate(data: any): Order {
    // Reconstruct aggregate from database
    const order = new Order(
      new OrderId(data.id),
      new CustomerId(data.customerId),
      data.status as OrderStatus,
      new Money(data.total, data.currency)
    );

    // Restore items
    data.items.forEach((itemData: any) => {
      order.addItem(
        new ProductId(itemData.productId),
        itemData.quantity,
        new Money(itemData.unitPrice, data.currency)
      );
    });

    return order;
  }
}
```

**Key Points:**
- ✅ Works with aggregates
- ✅ Collection-like interface
- ✅ Hides persistence
- ✅ Interface in domain, implementation in infrastructure

### 5. Domain Services

**Definition:** Operations that don't naturally belong to any entity or value object. Domain services contain domain logic that involves multiple aggregates or doesn't fit in a single aggregate.

**Purpose:**
- Handle cross-aggregate operations
- Encapsulate domain logic that doesn't fit entities
- Coordinate between aggregates
- Express domain concepts

**Characteristics:**
- **Stateless** - No internal state
- **Domain Logic** - Contains business rules
- **Cross-Aggregate** - Works with multiple aggregates
- **Domain Language** - Uses ubiquitous language

**Example:**

```typescript
// Domain Service: Transfer Money
export class MoneyTransferService {
  constructor(
    private accountRepository: AccountRepository,
    private transactionRepository: TransactionRepository
  ) {}

  // Domain logic that involves multiple aggregates
  async transfer(
    fromAccountId: AccountId,
    toAccountId: AccountId,
    amount: Money
  ): Promise<void> {
    // Load aggregates
    const fromAccount = await this.accountRepository.findById(fromAccountId);
    const toAccount = await this.accountRepository.findById(toAccountId);

    if (!fromAccount || !toAccount) {
      throw new DomainError('Account not found');
    }

    // Business rule: Can't transfer to same account
    if (fromAccountId.equals(toAccountId)) {
      throw new DomainError('Cannot transfer to same account');
    }

    // Business rule: Sufficient balance
    if (!fromAccount.hasSufficientBalance(amount)) {
      throw new DomainError('Insufficient balance');
    }

    // Business rule: Transfer limits
    if (amount.getAmount() > 10000) {
      throw new DomainError('Transfer amount exceeds limit');
    }

    // Perform transfer
    fromAccount.withdraw(amount);
    toAccount.deposit(amount);

    // Save aggregates
    await this.accountRepository.save(fromAccount);
    await this.accountRepository.save(toAccount);

    // Create transaction record
    const transaction = new Transaction(
      TransactionId.create(),
      fromAccountId,
      toAccountId,
      amount,
      new Date()
    );
    await this.transactionRepository.save(transaction);
  }
}
```

**Key Points:**
- ✅ Stateless operations
- ✅ Domain logic
- ✅ Cross-aggregate operations
- ✅ Uses ubiquitous language

### 6. Domain Events

**Definition:** Events that represent something meaningful that happened in the domain. Domain events are used to communicate between aggregates and bounded contexts.

**Purpose:**
- Communicate domain occurrences
- Decouple aggregates
- Enable eventual consistency
- Support event-driven architecture

**Example:**

```typescript
// Domain Event
export class OrderConfirmedEvent {
  constructor(
    public readonly orderId: OrderId,
    public readonly customerId: CustomerId,
    public readonly total: Money,
    public readonly occurredAt: Date = new Date()
  ) {}
}

// Publish event from aggregate
export class Order {
  confirm(): void {
    // ... confirmation logic ...
    this.status = OrderStatus.CONFIRMED;
    
    // Publish domain event
    DomainEventPublisher.publish(
      new OrderConfirmedEvent(
        this.id,
        this.customerId,
        this.total
      )
    );
  }
}

// Handle event in another bounded context
export class InventoryEventHandler {
  async handleOrderConfirmed(event: OrderConfirmedEvent): Promise<void> {
    // Reserve inventory for confirmed order
    const order = await this.orderRepository.findById(event.orderId);
    for (const item of order.getItems()) {
      await this.inventoryService.reserve(
        item.getProductId(),
        item.getQuantity()
      );
    }
  }
}
```

---

## 💡 When to Use

### Use DDD When:

✅ **Complex Business Domains**
- Rich business logic
- Complex rules and workflows
- Domain expertise required
- Example: Financial systems, Healthcare, E-commerce

✅ **Long-Lived Applications**
- Applications that evolve over years
- Business rules change frequently
- Need to maintain domain knowledge
- Example: Enterprise applications

✅ **Collaboration with Domain Experts**
- Domain experts available
- Need to bridge business-technical gap
- Complex domain concepts
- Example: Insurance, Banking, Logistics

✅ **Multiple Bounded Contexts**
- Large systems with multiple domains
- Different teams working on different contexts
- Need clear boundaries
- Example: Enterprise systems, Microservices

✅ **Rich Domain Models**
- Business logic is complex
- Domain concepts are rich
- Need to model domain accurately
- Example: Complex business applications

### Don't Use DDD When:

❌ **Simple CRUD Applications**
- Straightforward data operations
- No complex business logic
- Overhead not justified
- Example: Simple admin panels, Basic blogs

❌ **Data-Centric Applications**
- Focus is on data, not business logic
- Simple transformations
- No complex rules
- Example: Reporting tools, Data warehouses

❌ **No Domain Experts Available**
- Can't collaborate with domain experts
- Domain knowledge unclear
- Better to use simpler approach
- Example: Prototypes, MVPs

❌ **Simple Domains**
- Straightforward business logic
- No complex rules
- Traditional approach sufficient
- Example: Simple applications

---

## 🏛️ DDD Implementation Example

### Complete Example: E-Commerce Order System

```typescript
// Domain Layer

// Value Objects
export class OrderId {
  constructor(private readonly value: string) {}
  equals(other: OrderId): boolean {
    return this.value === other.value;
  }
}

export class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: string
  ) {}
  add(other: Money): Money {
    return new Money(this.amount + other.amount, this.currency);
  }
}

// Aggregate Root
export class Order {
  private items: OrderItem[] = [];

  constructor(
    private id: OrderId,
    private customerId: CustomerId,
    private status: OrderStatus
  ) {}

  addItem(productId: ProductId, quantity: number, price: Money): void {
    const item = new OrderItem(productId, quantity, price);
    this.items.push(item);
  }

  confirm(): void {
    this.status = OrderStatus.CONFIRMED;
    DomainEventPublisher.publish(new OrderConfirmedEvent(this.id));
  }
}

// Repository Interface
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
}

// Application Layer
export class OrderApplicationService {
  constructor(
    private orderRepository: OrderRepository,
    private inventoryService: InventoryService
  ) {}

  async createOrder(customerId: CustomerId, items: OrderItemData[]): Promise<OrderId> {
    // Check inventory
    for (const item of items) {
      const available = await this.inventoryService.checkAvailability(
        item.productId,
        item.quantity
      );
      if (!available) {
        throw new Error('Product not available');
      }
    }

    // Create aggregate
    const order = new Order(
      OrderId.create(),
      customerId,
      OrderStatus.PENDING
    );

    for (const item of items) {
      order.addItem(item.productId, item.quantity, item.price);
    }

    await this.orderRepository.save(order);
    return order.getId();
  }
}
```

---

## ⚠️ Common Pitfalls

### 1. Anemic Domain Model

**Problem:** Entities become data containers without behavior.

**❌ Wrong:**

```typescript
// ❌ Anemic - just data
export class Order {
  public id: string;
  public customerId: string;
  public items: OrderItem[];
  // No behavior
}
```

**✅ Correct:**

```typescript
// ✅ Rich domain model
export class Order {
  private items: OrderItem[] = [];
  
  addItem(productId: ProductId, quantity: number, price: Money): void {
    // Business logic here
    const item = new OrderItem(productId, quantity, price);
    this.items.push(item);
  }
}
```

### 2. Entities Instead of Value Objects

**Problem:** Using entities for concepts that should be value objects.

**❌ Wrong:**

```typescript
// ❌ Email as entity (has identity)
export class Email {
  constructor(private id: string, private value: string) {}
}
```

**✅ Correct:**

```typescript
// ✅ Email as value object (no identity)
export class Email {
  constructor(private readonly value: string) {
    this.validate();
  }
  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
```

### 3. Large Aggregates

**Problem:** Aggregates that are too large, causing performance and consistency issues.

**❌ Wrong:**

```typescript
// ❌ Too large aggregate
export class Order {
  private items: OrderItem[];
  private payments: Payment[];
  private shipments: Shipment[];
  private customer: Customer; // ❌ Should reference by ID
  private products: Product[]; // ❌ Should reference by ID
}
```

**✅ Correct:**

```typescript
// ✅ Focused aggregate
export class Order {
  private items: OrderItem[];
  private customerId: CustomerId; // ✅ Reference by ID
  // Only what's needed for consistency
}
```

---

## ✅ Best Practices

### 1. Rich Domain Models

✅ **Do:**
- Put business logic in domain models
- Make entities behavior-rich
- Use value objects for domain concepts
- Express domain language in code

❌ **Don't:**
- Create anemic domain models
- Put business logic in services
- Use primitives for domain concepts
- Mix technical and domain terms

### 2. Aggregate Design

✅ **Do:**
- Keep aggregates small
- Define clear consistency boundaries
- Reference other aggregates by ID
- Load entire aggregate together

❌ **Don't:**
- Create large aggregates
- Cross aggregate boundaries for consistency
- Direct references to other aggregates
- Partial aggregate loading

### 3. Ubiquitous Language

✅ **Do:**
- Use domain terms in code
- Collaborate with domain experts
- Refine language continuously
- Make code self-documenting

❌ **Don't:**
- Use technical jargon
- Translate domain terms
- Ignore domain experts
- Mix languages

---

## 🔀 DDD vs Other Approaches

### DDD vs Anemic Domain Model

**DDD:**
- Rich domain models with behavior
- Business logic in entities
- Domain-focused

**Anemic Domain Model:**
- Data containers
- Business logic in services
- Data-focused

**Key Difference:** DDD puts behavior in domain models.

### DDD vs Database-Driven Design

**DDD:**
- Domain model drives design
- Database is implementation detail
- Domain-first

**Database-Driven:**
- Database schema drives design
- Domain model reflects database
- Database-first

**Key Difference:** DDD starts with domain, not database.

---

## 🌍 Real-World Applications

### 1. E-Commerce Platform

**Bounded Contexts:**
- Order Management
- Inventory Management
- Payment Processing
- Shipping

**Aggregates:**
- Order (OrderItems)
- Product (Inventory)
- Customer
- Payment

### 2. Banking System

**Bounded Contexts:**
- Account Management
- Transaction Processing
- Loan Management
- Risk Assessment

**Aggregates:**
- Account (Transactions)
- Loan
- Customer
- Risk Profile

---

## 📊 Benefits and Trade-offs

### Benefits

✅ **Domain Focus**
- Software reflects business domain
- Better alignment with business
- Easier to understand
- Domain experts can understand code

✅ **Maintainability**
- Clear domain model
- Business logic in one place
- Easier to modify
- Better organization

✅ **Collaboration**
- Shared language
- Better communication
- Domain experts involved
- Reduced misunderstandings

### Trade-offs

❌ **Complexity**
- More complex than CRUD
- Steeper learning curve
- Requires domain expertise
- More abstraction

❌ **Overhead**
- More code
- More structure
- May be overkill for simple domains
- Higher development cost

---

## 🎓 Summary

### Key Takeaways

1. **DDD** focuses on domain modeling
2. **Strategic Design** - Bounded contexts, ubiquitous language
3. **Tactical Design** - Entities, Value Objects, Aggregates
4. **Ubiquitous Language** - Shared language between developers and experts
5. **Rich Domain Models** - Behavior in entities, not services
6. **Aggregates** - Consistency boundaries
7. **Repositories** - Aggregate access abstraction
8. **Domain Events** - Communication between aggregates

### When to Use

✅ **Use DDD When:**
- Complex business domains
- Long-lived applications
- Collaboration with domain experts
- Multiple bounded contexts
- Rich domain models

❌ **Avoid DDD When:**
- Simple CRUD applications
- Data-centric applications
- No domain experts available
- Simple domains

### Best Practices

- Use rich domain models
- Design aggregates carefully
- Use ubiquitous language
- Collaborate with domain experts
- Keep aggregates small
- Reference other aggregates by ID
- Use value objects for domain concepts

### Next Steps

After mastering DDD, consider:
- **Event Sourcing** - Store domain events
- **CQRS** - Separate read/write models
- **Microservices** - Apply DDD to services
- **Strategic Patterns** - Context mapping, large-scale structure

---

## 📚 Additional Resources

**Original Source:**
- Eric Evans - "Domain-Driven Design: Tackling Complexity in the Heart of Software" (2003)

**Related Books:**
- "Implementing Domain-Driven Design" by Vaughn Vernon
- "Domain-Driven Design Distilled" by Vaughn Vernon
- "Domain Modeling Made Functional" by Scott Wlaschin

**Related Patterns:**
- Event Sourcing
- CQRS
- Clean Architecture
- Onion Architecture

---

