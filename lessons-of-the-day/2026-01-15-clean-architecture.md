# Clean Architecture - Deep Dive

## 📋 Learning Objectives

- [ ] Understand Clean Architecture definition and principles
- [ ] Learn the four layers: Entities, Use Cases, Interface Adapters, and Frameworks
- [ ] Master the dependency rule and dependency inversion in Clean Architecture
- [ ] Recognize when to use Clean Architecture vs other patterns
- [ ] Understand the separation of concerns across layers
- [ ] Practice implementing Clean Architecture in real scenarios
- [ ] Learn testing strategies for each layer
- [ ] Explore real-world applications and use cases
- [ ] Understand common pitfalls and best practices
- [ ] Compare with Hexagonal Architecture, Layered Architecture, and MVC

---

## 🎯 Definition

**Clean Architecture** is an architectural pattern that organizes code into concentric layers with clear boundaries and dependency rules. The architecture emphasizes independence from frameworks, UI, databases, and external agencies, making the system testable, independent, and maintainable.

**Origin:**
- Coined by Robert C. Martin (Uncle Bob) in 2012
- Also known as: **Onion Architecture** (similar concept), **Ports & Adapters** (related)
- Designed to address coupling and dependency issues in software architecture

**Key Principles:**
- **Independence from Frameworks** - Business logic doesn't depend on frameworks
- **Testability** - Business logic can be tested without UI, database, or external services
- **Independence from UI** - UI can be changed without affecting business logic
- **Independence from Database** - Business logic doesn't depend on database
- **Independence from External Services** - Business logic doesn't know about external agencies

**Key Principle:**
> "The dependency rule says that source code dependencies can only point inward. Nothing in an inner circle can know anything at all about something in an outer circle. In particular, the name of something declared in an outer circle must not be mentioned by the code in an inner circle." - Robert C. Martin

**Alternative Formulation:**
> "Clean Architecture organizes code into layers with the most stable and important business rules at the center, and the most volatile and changeable details at the edges. Dependencies point inward, ensuring that the core business logic remains independent of frameworks, databases, and UI technologies."

---

## 🏗️ Structure

### The Four Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Frameworks & Drivers                       │
│  (Web, DB, Devices, External Interfaces)                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Interface Adapters                        │  │
│  │  (Controllers, Gateways, Presenters)                   │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │            Application Business Rules            │  │  │
│  │  │  (Use Cases, Application Services)               │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │      Enterprise Business Rules            │  │  │  │
│  │  │  │  (Entities, Domain Models)                │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Layer Descriptions

**1. Entities (Enterprise Business Rules)**
- Innermost layer
- Contains enterprise-wide business rules
- Pure business objects with no dependencies
- Most stable and reusable
- Examples: User, Order, Product, Account

**2. Use Cases (Application Business Rules)**
- Contains application-specific business rules
- Orchestrates entities to accomplish use cases
- Defines application workflows
- Examples: CreateUser, ProcessOrder, SendNotification

**3. Interface Adapters**
- Converts data between layers
- Controllers, Presenters, Gateways
- Adapts external formats to use case inputs
- Adapts use case outputs to external formats
- Examples: REST Controllers, Database Gateways, View Models

**4. Frameworks & Drivers**
- Outermost layer
- Web frameworks, databases, external services
- Most volatile and changeable
- Examples: Express.js, PostgreSQL, Redis, AWS SDK

### Dependency Rule

**Critical Rule:** Dependencies point **inward** only.

- ✅ Inner layers don't know about outer layers
- ✅ Outer layers depend on inner layers
- ✅ Inner layers define interfaces
- ✅ Outer layers implement interfaces
- ❌ Entities don't depend on anything
- ❌ Use Cases depend only on Entities
- ❌ Interface Adapters depend on Use Cases and Entities
- ❌ Frameworks depend on Interface Adapters

---

## 🔍 Core Concepts Deep Dive

### 1. Entities (Enterprise Business Rules)

**Definition:** The innermost layer containing enterprise-wide business rules and domain models.

**Purpose:**
- Encapsulate core business concepts
- Represent domain entities
- Contain business rules that are universal to the enterprise
- Independent of any application or framework

**Characteristics:**
- **No dependencies** on outer layers
- **Pure business logic** - no framework code
- **Highly reusable** across applications
- **Most stable** - changes infrequently
- **Value objects** and **entities** from DDD

**Example:**

```typescript
// Domain/User.ts - Entity Layer
export class User {
  constructor(
    public readonly id: UserId,
    public readonly email: Email,
    public readonly name: string,
    private passwordHash: string,
    private createdAt: Date
  ) {
    this.validate();
  }

  // Business rule: User must be at least 18 years old
  static create(id: UserId, email: Email, name: string, birthDate: Date, password: string): User {
    const age = this.calculateAge(birthDate);
    if (age < 18) {
      throw new Error('User must be at least 18 years old');
    }
    
    const passwordHash = this.hashPassword(password);
    return new User(id, email, name, passwordHash, new Date());
  }

  // Business rule: Password must meet requirements
  changePassword(oldPassword: string, newPassword: string): void {
    if (!this.verifyPassword(oldPassword)) {
      throw new Error('Invalid current password');
    }
    
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    
    this.passwordHash = User.hashPassword(newPassword);
  }

  verifyPassword(password: string): boolean {
    return this.passwordHash === User.hashPassword(password);
  }

  private validate(): void {
    if (!this.email.isValid()) {
      throw new Error('Invalid email address');
    }
    if (this.name.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
  }

  private static calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private static hashPassword(password: string): string {
    // Simplified - use proper hashing in production
    return `hashed_${password}`;
  }
}

// Value Objects
export class UserId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }
  }
}

export class Email {
  constructor(public readonly value: string) {
    if (!this.isValidEmail(value)) {
      throw new Error('Invalid email format');
    }
  }

  isValid(): boolean {
    return this.isValidEmail(this.value);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
```

**Key Points:**
- ✅ No dependencies on frameworks or databases
- ✅ Pure business logic
- ✅ Self-contained validation
- ✅ Immutable where possible
- ✅ Value objects for domain concepts

### 2. Use Cases (Application Business Rules)

**Definition:** The layer containing application-specific business rules that orchestrate entities to accomplish use cases.

**Purpose:**
- Define application workflows
- Orchestrate entities
- Implement application-specific business rules
- Coordinate between entities and external systems (through interfaces)

**Characteristics:**
- **Depends only on Entities** (and interfaces for external systems)
- **Application-specific** - not reusable across applications
- **Orchestrates** entities and external services
- **Defines interfaces** for what it needs from outer layers
- **Single responsibility** - one use case per class

**Example:**

```typescript
// UseCases/CreateUser.ts - Use Case Layer
import { User, UserId, Email } from '../Domain/User';
import { UserRepository } from './UserRepository'; // Interface, not implementation

export interface CreateUserRequest {
  email: string;
  name: string;
  birthDate: Date;
  password: string;
}

export interface CreateUserResponse {
  userId: string;
  email: string;
  name: string;
}

export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository, // Interface dependency
    private emailService: EmailService // Interface dependency
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // Application business rule: Check if email already exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Application business rule: Generate unique user ID
    const userId = UserId.createUnique();
    const email = new Email(request.email);

    // Use entity to create user (entity handles validation)
    const user = User.create(
      userId,
      email,
      request.name,
      request.birthDate,
      request.password
    );

    // Persist user
    await this.userRepository.save(user);

    // Application business rule: Send welcome email
    await this.emailService.sendWelcomeEmail(user.email.value, user.name);

    // Return response
    return {
      userId: user.id.value,
      email: user.email.value,
      name: user.name
    };
  }
}

// Interface for repository (defined in Use Case layer)
export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  delete(id: UserId): Promise<void>;
}

// Interface for email service (defined in Use Case layer)
export interface EmailService {
  sendWelcomeEmail(email: string, name: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
}
```

**Key Points:**
- ✅ Depends only on Entities and interfaces
- ✅ Defines interfaces for what it needs
- ✅ Orchestrates entities and services
- ✅ Application-specific business rules
- ✅ Single use case per class

### 3. Interface Adapters

**Definition:** The layer that converts data between the use cases/entities and external systems.

**Purpose:**
- Convert external data formats to use case inputs
- Convert use case outputs to external formats
- Adapt between layers
- Handle protocol-specific concerns

**Types of Adapters:**

**A. Controllers (Input Adapters)**
- Convert HTTP requests to use case inputs
- Handle routing and request parsing
- Validate input format
- Call use cases

**B. Presenters (Output Adapters)**
- Convert use case outputs to view models
- Format data for UI
- Handle presentation logic

**C. Gateways (Data Adapters)**
- Convert between domain models and database models
- Handle data persistence
- Implement repository interfaces

**Example:**

```typescript
// InterfaceAdapters/Controllers/UserController.ts
import { Request, Response } from 'express'; // Framework dependency
import { CreateUserUseCase, CreateUserRequest } from '../../UseCases/CreateUser';

export class UserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      // Convert HTTP request to use case input
      const request: CreateUserRequest = {
        email: req.body.email,
        name: req.body.name,
        birthDate: new Date(req.body.birthDate),
        password: req.body.password
      };

      // Validate input format (not business rules)
      if (!request.email || !request.name || !request.birthDate || !request.password) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Call use case
      const response = await this.createUserUseCase.execute(request);

      // Convert use case output to HTTP response
      res.status(201).json({
        id: response.userId,
        email: response.email,
        name: response.name
      });
    } catch (error) {
      // Handle errors
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}

// InterfaceAdapters/Presenters/UserPresenter.ts
import { User } from '../../Domain/User';

export class UserPresenter {
  static toViewModel(user: User): UserViewModel {
    return {
      id: user.id.value,
      email: user.email.value,
      name: user.name,
      createdAt: user.createdAt.toISOString()
    };
  }

  static toViewModelList(users: User[]): UserViewModel[] {
    return users.map(user => this.toViewModel(user));
  }
}

export interface UserViewModel {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// InterfaceAdapters/Gateways/UserRepositoryImpl.ts
import { User, UserId } from '../../Domain/User';
import { UserRepository } from '../../UseCases/CreateUser';
import { Database } from '../../Frameworks/Database'; // Framework dependency

export class UserRepositoryImpl implements UserRepository {
  constructor(private db: Database) {}

  async save(user: User): Promise<void> {
    // Convert domain model to database model
    const userData = {
      id: user.id.value,
      email: user.email.value,
      name: user.name,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt
    };

    await this.db.users.insert(userData);
  }

  async findById(id: UserId): Promise<User | null> {
    const userData = await this.db.users.findById(id.value);
    if (!userData) {
      return null;
    }

    // Convert database model to domain model
    return this.toDomainModel(userData);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userData = await this.db.users.findByEmail(email);
    if (!userData) {
      return null;
    }

    return this.toDomainModel(userData);
  }

  async delete(id: UserId): Promise<void> {
    await this.db.users.delete(id.value);
  }

  private toDomainModel(userData: any): User {
    // Reconstruct domain model from database data
    return new User(
      new UserId(userData.id),
      new Email(userData.email),
      userData.name,
      userData.passwordHash,
      userData.createdAt
    );
  }
}
```

**Key Points:**
- ✅ Converts between layers
- ✅ Handles protocol-specific concerns
- ✅ Implements interfaces defined in inner layers
- ✅ Thin layer - just adaptation
- ✅ Can depend on frameworks

### 4. Frameworks & Drivers

**Definition:** The outermost layer containing frameworks, tools, and external systems.

**Purpose:**
- Provide implementations for frameworks
- Connect to external systems
- Handle infrastructure concerns
- Most volatile layer

**Examples:**
- Web frameworks (Express, Fastify, NestJS)
- Databases (PostgreSQL, MongoDB, Redis)
- External APIs (Payment gateways, Email services)
- Message queues (RabbitMQ, Kafka)
- File systems, logging libraries

**Example:**

```typescript
// Frameworks/Web/ExpressApp.ts
import express, { Express } from 'express';
import { UserController } from '../../InterfaceAdapters/Controllers/UserController';

export class ExpressApp {
  private app: Express;

  constructor(private userController: UserController) {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    // CORS, authentication, etc.
  }

  private setupRoutes(): void {
    this.app.post('/users', (req, res) => this.userController.createUser(req, res));
    // Other routes...
  }

  start(port: number): void {
    this.app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
}

// Frameworks/Database/PostgreSQLDatabase.ts
import { Pool } from 'pg'; // External library

export class PostgreSQLDatabase {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  get users() {
    return {
      insert: async (data: any) => {
        const query = 'INSERT INTO users (id, email, name, password_hash, created_at) VALUES ($1, $2, $3, $4, $5)';
        await this.pool.query(query, [data.id, data.email, data.name, data.passwordHash, data.createdAt]);
      },
      findById: async (id: string) => {
        const result = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0] || null;
      },
      findByEmail: async (email: string) => {
        const result = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
      },
      delete: async (id: string) => {
        await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
      }
    };
  }
}

// Frameworks/Email/SendGridEmailService.ts
import sgMail from '@sendgrid/mail'; // External library
import { EmailService } from '../../UseCases/CreateUser';

export class SendGridEmailService implements EmailService {
  constructor(apiKey: string) {
    sgMail.setApiKey(apiKey);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await sgMail.send({
      to: email,
      from: 'noreply@example.com',
      subject: 'Welcome!',
      text: `Hello ${name}, welcome to our platform!`
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    await sgMail.send({
      to: email,
      from: 'noreply@example.com',
      subject: 'Password Reset',
      text: `Click here to reset your password: https://example.com/reset?token=${token}`
    });
  }
}
```

**Key Points:**
- ✅ Most volatile layer
- ✅ Contains framework-specific code
- ✅ Implements interfaces from inner layers
- ✅ Can be swapped easily
- ✅ Handles infrastructure concerns

---

## 💡 When to Use

### Use Clean Architecture When:

✅ **Building long-lived applications**
- Applications that will evolve over years
- Need to adapt to changing requirements
- Technology stack may change
- Example: Enterprise applications, SaaS platforms

✅ **Complex business logic**
- Rich domain models
- Complex workflows
- Multiple business rules
- Example: Financial systems, E-commerce platforms, Healthcare systems

✅ **Need framework independence**
- Want to switch frameworks without rewriting business logic
- Need to support multiple frameworks
- Framework upgrades shouldn't break business logic
- Example: Supporting REST and GraphQL, switching databases

✅ **High testability requirements**
- Need to test business logic in isolation
- Fast unit tests without external dependencies
- Test business rules without database or UI
- Example: Critical business applications, regulated industries

✅ **Multiple teams working on same codebase**
- Clear boundaries between layers
- Teams can work on different layers independently
- Reduced coupling and conflicts
- Example: Large organizations, microservices

✅ **Need to support multiple interfaces**
- REST API + GraphQL + CLI
- Web + Mobile + Desktop
- Multiple protocols
- Example: Multi-channel applications

✅ **Domain-driven design**
- Rich domain models
- Complex business domains
- Strategic design patterns
- Example: Enterprise applications with complex domains

### Don't Use Clean Architecture When:

❌ **Simple CRUD applications**
- Overhead not justified
- Straightforward data operations
- No complex business logic
- Example: Simple admin panels, basic blogs

❌ **Prototypes or MVPs**
- Too much structure for early stages
- Can add complexity prematurely
- Focus on speed over structure
- Example: Startup MVPs, proof of concepts

❌ **Very small applications**
- Over-engineering for small projects
- Simple layered architecture sufficient
- Not enough complexity to justify
- Example: Small utilities, simple scripts

❌ **Tight performance requirements**
- Additional abstraction layers add overhead
- Direct framework usage may be faster
- Need to measure and evaluate
- Example: High-frequency trading, real-time systems

❌ **Team lacks experience**
- Requires understanding of architectural principles
- Can lead to over-engineering if misunderstood
- Need training and mentoring
- Example: Junior teams, tight deadlines

---

## 🏛️ Architecture Layers Deep Dive

### Complete Layer Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frameworks & Drivers                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Web Framework (Express, Fastify)                          │  │
│  │  Database (PostgreSQL, MongoDB)                            │  │
│  │  External Services (Payment, Email)                       │  │
│  │  Message Queues (RabbitMQ, Kafka)                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                            │                                      │
│                            ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Interface Adapters                            │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  Controllers (HTTP, GraphQL, CLI)                    │ │  │
│  │  │  Presenters (View Models, Response Formatters)       │ │  │
│  │  │  Gateways (Repository Implementations)               │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│                            │                                      │
│                            ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │            Application Business Rules                      │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  Use Cases (CreateUser, ProcessOrder)                │ │  │
│  │  │  Application Services                                │ │  │
│  │  │  Interfaces (Repository, Service Interfaces)         │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│                            │                                      │
│                            ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │      Enterprise Business Rules                             │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  Entities (User, Order, Product)                     │ │  │
│  │  │  Value Objects (Email, Money, Address)               │ │  │
│  │  │  Domain Services                                     │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Dependency Flow

**Entities Layer:**
- No dependencies
- Pure business logic
- Most stable

**Use Cases Layer:**
- Depends on: Entities
- Defines interfaces for: Repositories, Services
- Application-specific logic

**Interface Adapters Layer:**
- Depends on: Use Cases, Entities
- Implements: Repository interfaces, Service interfaces
- Converts between layers

**Frameworks Layer:**
- Depends on: Interface Adapters
- Implements: Framework-specific code
- Most volatile

---

## 📚 Implementation Examples

### Example 1: E-Commerce Order Processing

#### Step 1: Define Entities (Domain Layer)

```typescript
// Domain/Order.ts
export class Order {
  constructor(
    public readonly id: OrderId,
    public readonly customerId: CustomerId,
    private items: OrderItem[],
    private status: OrderStatus,
    private total: Money,
    private createdAt: Date
  ) {
    this.validate();
  }

  static create(customerId: CustomerId, items: OrderItem[]): Order {
    const total = items.reduce(
      (sum, item) => sum.add(item.subtotal),
      Money.zero()
    );

    return new Order(
      OrderId.createUnique(),
      customerId,
      items,
      OrderStatus.PENDING,
      total,
      new Date()
    );
  }

  // Business rule: Can only cancel pending orders
  cancel(): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new Error('Only pending orders can be cancelled');
    }
    this.status = OrderStatus.CANCELLED;
  }

  // Business rule: Can only ship confirmed orders
  ship(): void {
    if (this.status !== OrderStatus.CONFIRMED) {
      throw new Error('Only confirmed orders can be shipped');
    }
    this.status = OrderStatus.SHIPPED;
  }

  confirm(): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new Error('Only pending orders can be confirmed');
    }
    this.status = OrderStatus.CONFIRMED;
  }

  private validate(): void {
    if (this.items.length === 0) {
      throw new Error('Order must have at least one item');
    }
    if (this.total.isNegative()) {
      throw new Error('Order total cannot be negative');
    }
  }

  getItems(): ReadonlyArray<OrderItem> {
    return [...this.items];
  }

  getStatus(): OrderStatus {
    return this.status;
  }

  getTotal(): Money {
    return this.total;
  }
}

export class OrderItem {
  constructor(
    public readonly productId: ProductId,
    public readonly quantity: number,
    public readonly unitPrice: Money
  ) {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
  }

  get subtotal(): Money {
    return this.unitPrice.multiply(this.quantity);
  }
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

// Value Objects
export class OrderId {
  constructor(public readonly value: string) {}
  static createUnique(): OrderId {
    return new OrderId(`order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }
}

export class CustomerId {
  constructor(public readonly value: string) {}
}

export class ProductId {
  constructor(public readonly value: string) {}
}

export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'USD'
  ) {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
  }

  static zero(currency: string = 'USD'): Money {
    return new Money(0, currency);
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  isNegative(): boolean {
    return this.amount < 0;
  }
}
```

#### Step 2: Define Use Cases (Application Layer)

```typescript
// UseCases/ProcessOrder.ts
import { Order, OrderId, CustomerId, OrderItem, ProductId, Money } from '../Domain/Order';
import { OrderRepository } from './OrderRepository';
import { PaymentService } from './PaymentService';
import { InventoryService } from './InventoryService';
import { NotificationService } from './NotificationService';

export interface ProcessOrderRequest {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

export interface ProcessOrderResponse {
  orderId: string;
  status: string;
  total: number;
}

export class ProcessOrderUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private paymentService: PaymentService,
    private inventoryService: InventoryService,
    private notificationService: NotificationService
  ) {}

  async execute(request: ProcessOrderRequest): Promise<ProcessOrderResponse> {
    // Application business rule: Check inventory availability
    for (const item of request.items) {
      const available = await this.inventoryService.checkAvailability(
        new ProductId(item.productId),
        item.quantity
      );
      if (!available) {
        throw new Error(`Product ${item.productId} is out of stock`);
      }
    }

    // Create order (entity handles validation)
    const orderItems = request.items.map(
      item => new OrderItem(
        new ProductId(item.productId),
        item.quantity,
        new Money(item.unitPrice)
      )
    );

    const order = Order.create(
      new CustomerId(request.customerId),
      orderItems
    );

    // Application business rule: Process payment
    const paymentResult = await this.paymentService.processPayment(
      order.getTotal(),
      request.customerId
    );

    if (!paymentResult.success) {
      throw new Error('Payment processing failed');
    }

    // Confirm order
    order.confirm();

    // Persist order
    await this.orderRepository.save(order);

    // Application business rule: Reserve inventory
    for (const item of request.items) {
      await this.inventoryService.reserve(
        new ProductId(item.productId),
        item.quantity
      );
    }

    // Application business rule: Send confirmation
    await this.notificationService.sendOrderConfirmation(
      request.customerId,
      order.id.value
    );

    return {
      orderId: order.id.value,
      status: order.getStatus(),
      total: order.getTotal().amount
    };
  }
}

// Interfaces defined in Use Case layer
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  findByCustomerId(customerId: CustomerId): Promise<Order[]>;
}

export interface PaymentService {
  processPayment(amount: Money, customerId: string): Promise<PaymentResult>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface InventoryService {
  checkAvailability(productId: ProductId, quantity: number): Promise<boolean>;
  reserve(productId: ProductId, quantity: number): Promise<void>;
}

export interface NotificationService {
  sendOrderConfirmation(customerId: string, orderId: string): Promise<void>;
  sendOrderShipped(customerId: string, orderId: string): Promise<void>;
}
```

#### Step 3: Create Interface Adapters

```typescript
// InterfaceAdapters/Controllers/OrderController.ts
import { Request, Response } from 'express';
import { ProcessOrderUseCase, ProcessOrderRequest } from '../../UseCases/ProcessOrder';

export class OrderController {
  constructor(private processOrderUseCase: ProcessOrderUseCase) {}

  async processOrder(req: Request, res: Response): Promise<void> {
    try {
      const request: ProcessOrderRequest = {
        customerId: req.body.customerId,
        items: req.body.items
      };

      // Input validation
      if (!request.customerId || !request.items || request.items.length === 0) {
        res.status(400).json({ error: 'Invalid request' });
        return;
      }

      const response = await this.processOrderUseCase.execute(request);

      res.status(201).json({
        orderId: response.orderId,
        status: response.status,
        total: response.total
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}

// InterfaceAdapters/Gateways/OrderRepositoryImpl.ts
import { Order, OrderId, CustomerId } from '../../Domain/Order';
import { OrderRepository } from '../../UseCases/ProcessOrder';
import { Database } from '../../Frameworks/Database';

export class OrderRepositoryImpl implements OrderRepository {
  constructor(private db: Database) {}

  async save(order: Order): Promise<void> {
    const orderData = {
      id: order.id.value,
      customerId: order.customerId.value,
      items: order.getItems().map(item => ({
        productId: item.productId.value,
        quantity: item.quantity,
        unitPrice: item.unitPrice.amount
      })),
      status: order.getStatus(),
      total: order.getTotal().amount,
      createdAt: order.createdAt
    };

    await this.db.orders.insert(orderData);
  }

  async findById(id: OrderId): Promise<Order | null> {
    const orderData = await this.db.orders.findById(id.value);
    if (!orderData) return null;
    return this.toDomainModel(orderData);
  }

  async findByCustomerId(customerId: CustomerId): Promise<Order[]> {
    const ordersData = await this.db.orders.findByCustomerId(customerId.value);
    return ordersData.map(data => this.toDomainModel(data));
  }

  private toDomainModel(orderData: any): Order {
    // Reconstruct domain model from database data
    // Implementation details...
    return orderData as Order; // Simplified
  }
}
```

#### Step 4: Implement Frameworks

```typescript
// Frameworks/Payment/StripePaymentService.ts
import Stripe from 'stripe';
import { PaymentService, PaymentResult } from '../../UseCases/ProcessOrder';
import { Money } from '../../Domain/Order';

export class StripePaymentService implements PaymentService {
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, { apiVersion: '2023-10-16' });
  }

  async processPayment(amount: Money, customerId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount.amount * 100), // Convert to cents
        currency: amount.currency.toLowerCase(),
        customer: customerId
      });

      return {
        success: true,
        transactionId: paymentIntent.id
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }
}
```

### Example 2: Complete File Structure

```
src/
├── Domain/                          # Entities Layer
│   ├── User.ts
│   ├── Order.ts
│   ├── Product.ts
│   └── ValueObjects/
│       ├── Email.ts
│       ├── Money.ts
│       └── Address.ts
│
├── UseCases/                        # Application Business Rules
│   ├── CreateUser.ts
│   ├── ProcessOrder.ts
│   ├── CancelOrder.ts
│   └── Interfaces/
│       ├── UserRepository.ts
│       ├── OrderRepository.ts
│       ├── PaymentService.ts
│       └── EmailService.ts
│
├── InterfaceAdapters/               # Interface Adapters
│   ├── Controllers/
│   │   ├── UserController.ts
│   │   └── OrderController.ts
│   ├── Presenters/
│   │   ├── UserPresenter.ts
│   │   └── OrderPresenter.ts
│   └── Gateways/
│       ├── UserRepositoryImpl.ts
│       ├── OrderRepositoryImpl.ts
│       └── EmailServiceImpl.ts
│
└── Frameworks/                      # Frameworks & Drivers
    ├── Web/
    │   ├── ExpressApp.ts
    │   └── Routes.ts
    ├── Database/
    │   ├── PostgreSQLDatabase.ts
    │   └── MongoDBDatabase.ts
    ├── Payment/
    │   ├── StripePaymentService.ts
    │   └── PayPalPaymentService.ts
    └── Email/
        ├── SendGridEmailService.ts
        └── SMTPEmailService.ts
```

---

## 🔄 Dependency Inversion in Practice

### The Dependency Rule

**Rule:** Source code dependencies can only point **inward**.

**What this means:**
- Inner layers define interfaces
- Outer layers implement interfaces
- Inner layers don't import from outer layers
- Outer layers import from inner layers

### Example: Repository Pattern

**❌ Wrong - Dependency Points Outward:**

```typescript
// ❌ BAD: Use case depends on concrete implementation
import { PostgreSQLUserRepository } from '../Frameworks/Database/PostgreSQLUserRepository';

export class CreateUserUseCase {
  constructor(private repository: PostgreSQLUserRepository) {} // ❌ Depends on framework
}
```

**✅ Correct - Dependency Points Inward:**

```typescript
// ✅ GOOD: Use case defines interface
export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
}

export class CreateUserUseCase {
  constructor(private repository: UserRepository) {} // ✅ Depends on interface
}

// Framework implements interface
export class PostgreSQLUserRepository implements UserRepository {
  // Implementation...
}
```

### Dependency Injection

**Purpose:** Invert dependencies at runtime.

**Example:**

```typescript
// Composition Root - Wire everything together
import { CreateUserUseCase } from './UseCases/CreateUser';
import { UserController } from './InterfaceAdapters/Controllers/UserController';
import { UserRepositoryImpl } from './InterfaceAdapters/Gateways/UserRepositoryImpl';
import { SendGridEmailService } from './Frameworks/Email/SendGridEmailService';
import { PostgreSQLDatabase } from './Frameworks/Database/PostgreSQLDatabase';

// Create framework instances
const db = new PostgreSQLDatabase(process.env.DATABASE_URL);
const emailService = new SendGridEmailService(process.env.SENDGRID_API_KEY);

// Create adapters
const userRepository = new UserRepositoryImpl(db);
const emailServiceAdapter = new SendGridEmailService(emailService);

// Create use cases
const createUserUseCase = new CreateUserUseCase(userRepository, emailServiceAdapter);

// Create controllers
const userController = new UserController(createUserUseCase);

// Wire up framework
const app = new ExpressApp(userController);
app.start(3000);
```

**Key Points:**
- ✅ Dependencies wired at composition root
- ✅ Inner layers don't know about outer layers
- ✅ Easy to swap implementations
- ✅ Testable with mocks

---

## 🧪 Testing Benefits

### Testing Strategy by Layer

**1. Entities (Unit Tests)**
- Fast, pure unit tests
- No external dependencies
- Test business rules
- No mocks needed

```typescript
describe('User Entity', () => {
  it('should create user with valid data', () => {
    const user = User.create(
      new UserId('123'),
      new Email('test@example.com'),
      'John Doe',
      new Date('1990-01-01'),
      'password123'
    );

    expect(user.email.value).toBe('test@example.com');
    expect(user.name).toBe('John Doe');
  });

  it('should throw error for invalid email', () => {
    expect(() => {
      new Email('invalid-email');
    }).toThrow('Invalid email format');
  });

  it('should enforce password requirements', () => {
    const user = User.create(/* ... */);
    
    expect(() => {
      user.changePassword('old', 'short');
    }).toThrow('Password must be at least 8 characters');
  });
});
```

**2. Use Cases (Unit Tests with Mocks)**
- Test application workflows
- Mock repository and service interfaces
- Fast, isolated tests
- Test business logic orchestration

```typescript
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: jest.Mocked<UserRepository>;
  let mockEmailService: jest.Mocked<EmailService>;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      delete: jest.fn()
    };

    mockEmailService = {
      sendWelcomeEmail: jest.fn(),
      sendPasswordResetEmail: jest.fn()
    };

    useCase = new CreateUserUseCase(mockRepository, mockEmailService);
  });

  it('should create user successfully', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);
    mockRepository.save.mockResolvedValue(undefined);
    mockEmailService.sendWelcomeEmail.mockResolvedValue(undefined);

    const request: CreateUserRequest = {
      email: 'test@example.com',
      name: 'John Doe',
      birthDate: new Date('1990-01-01'),
      password: 'password123'
    };

    const response = await useCase.execute(request);

    expect(response.email).toBe('test@example.com');
    expect(mockRepository.save).toHaveBeenCalled();
    expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalled();
  });

  it('should throw error if email already exists', async () => {
    const existingUser = User.create(/* ... */);
    mockRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(
      useCase.execute({ email: 'test@example.com', /* ... */ })
    ).rejects.toThrow('User with this email already exists');
  });
});
```

**3. Interface Adapters (Integration Tests)**
- Test data conversion
- Test protocol handling
- May use test doubles for frameworks

```typescript
describe('UserController', () => {
  let controller: UserController;
  let mockUseCase: jest.Mocked<CreateUserUseCase>;

  beforeEach(() => {
    mockUseCase = {
      execute: jest.fn()
    } as any;

    controller = new UserController(mockUseCase);
  });

  it('should convert HTTP request to use case input', async () => {
    const req = {
      body: {
        email: 'test@example.com',
        name: 'John Doe',
        birthDate: '1990-01-01',
        password: 'password123'
      }
    } as Request;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;

    mockUseCase.execute.mockResolvedValue({
      userId: '123',
      email: 'test@example.com',
      name: 'John Doe'
    });

    await controller.createUser(req, res);

    expect(mockUseCase.execute).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'John Doe',
      birthDate: new Date('1990-01-01'),
      password: 'password123'
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
```

**4. Frameworks (Integration/E2E Tests)**
- Test framework integration
- May use test databases
- Test external service integration

```typescript
describe('PostgreSQLUserRepository', () => {
  let repository: UserRepositoryImpl;
  let db: TestDatabase;

  beforeEach(async () => {
    db = await createTestDatabase();
    repository = new UserRepositoryImpl(db);
  });

  afterEach(async () => {
    await db.cleanup();
  });

  it('should save and retrieve user', async () => {
    const user = User.create(/* ... */);
    
    await repository.save(user);
    
    const retrieved = await repository.findById(user.id);
    
    expect(retrieved).not.toBeNull();
    expect(retrieved?.email.value).toBe(user.email.value);
  });
});
```

### Testing Benefits Summary

✅ **Fast Unit Tests**
- Entities and use cases can be tested without databases or external services
- Tests run in milliseconds

✅ **Isolated Testing**
- Each layer can be tested independently
- No need to set up entire system for unit tests

✅ **Easy Mocking**
- Interfaces make it easy to create mocks
- Test business logic without external dependencies

✅ **Test Coverage**
- Can achieve high test coverage
- Each layer has clear responsibilities

---

## 🎨 Multiple Interfaces Example

### Supporting REST and GraphQL

**Use Case (Same for Both):**

```typescript
// UseCases/GetUser.ts
export class GetUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(new UserId(userId));
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
```

**REST Controller:**

```typescript
// InterfaceAdapters/Controllers/UserController.ts
export class UserController {
  constructor(private getUserUseCase: GetUserUseCase) {}

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.getUserUseCase.execute(req.params.id);
      res.json({
        id: user.id.value,
        email: user.email.value,
        name: user.name
      });
    } catch (error) {
      res.status(404).json({ error: 'User not found' });
    }
  }
}
```

**GraphQL Resolver:**

```typescript
// InterfaceAdapters/GraphQL/UserResolver.ts
export class UserResolver {
  constructor(private getUserUseCase: GetUserUseCase) {}

  async user(parent: any, args: { id: string }): Promise<UserGraphQLType> {
    try {
      const user = await this.getUserUseCase.execute(args.id);
      return {
        id: user.id.value,
        email: user.email.value,
        name: user.name
      };
    } catch (error) {
      throw new Error('User not found');
    }
  }
}
```

**Key Point:** Same use case, different interfaces - business logic unchanged!

---

## ⚠️ Common Pitfalls

### 1. Anemic Domain Model

**Problem:** Entities become data containers without behavior.

**❌ Wrong:**

```typescript
// ❌ Anemic - just data
export class User {
  public id: string;
  public email: string;
  public name: string;
  // No behavior, just getters/setters
}
```

**✅ Correct:**

```typescript
// ✅ Rich domain model with behavior
export class User {
  constructor(
    public readonly id: UserId,
    public readonly email: Email,
    private passwordHash: string
  ) {}

  changePassword(oldPassword: string, newPassword: string): void {
    // Business logic here
  }

  verifyPassword(password: string): boolean {
    // Business logic here
  }
}
```

### 2. Leaking Framework Details into Core

**Problem:** Entities or use cases depend on frameworks.

**❌ Wrong:**

```typescript
// ❌ Entity depends on Express
import { Request } from 'express';

export class User {
  static fromRequest(req: Request): User {
    // Framework dependency in entity!
  }
}
```

**✅ Correct:**

```typescript
// ✅ Entity is framework-agnostic
export class User {
  static create(id: UserId, email: Email, name: string): User {
    // Pure business logic
  }
}

// Controller converts request to domain objects
export class UserController {
  createUser(req: Request, res: Response): void {
    const user = User.create(
      new UserId(req.body.id),
      new Email(req.body.email),
      req.body.name
    );
  }
}
```

### 3. Use Cases Doing Too Much

**Problem:** Use cases contain infrastructure concerns.

**❌ Wrong:**

```typescript
// ❌ Use case handles HTTP, database directly
export class CreateUserUseCase {
  async execute(req: Request): Promise<void> {
    const db = new PostgreSQLDatabase(); // ❌ Infrastructure in use case
    const user = { email: req.body.email }; // ❌ HTTP in use case
    await db.users.insert(user);
  }
}
```

**✅ Correct:**

```typescript
// ✅ Use case orchestrates, doesn't handle infrastructure
export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    const user = User.create(/* ... */);
    await this.userRepository.save(user);
    return { userId: user.id.value };
  }
}
```

### 4. Circular Dependencies

**Problem:** Layers depend on each other.

**❌ Wrong:**

```typescript
// ❌ Circular dependency
// UseCases/CreateUser.ts
import { UserController } from '../InterfaceAdapters/Controllers/UserController';

// InterfaceAdapters/Controllers/UserController.ts
import { CreateUserUseCase } from '../UseCases/CreateUser';
```

**✅ Correct:**

```typescript
// ✅ Dependencies point inward
// UseCases/CreateUser.ts - no imports from outer layers

// InterfaceAdapters/Controllers/UserController.ts
import { CreateUserUseCase } from '../UseCases/CreateUser'; // ✅ Inward dependency
```

### 5. Over-Engineering

**Problem:** Too many layers for simple operations.

**❌ Wrong:**

```typescript
// ❌ Over-engineered for simple CRUD
// Creating 5 layers for a simple "get user by ID" operation
```

**✅ Correct:**

```typescript
// ✅ Use Clean Architecture when complexity justifies it
// For simple CRUD, consider simpler architecture
```

### 6. Not Using Value Objects

**Problem:** Primitive obsession - using strings/numbers instead of domain concepts.

**❌ Wrong:**

```typescript
// ❌ Primitive obsession
export class User {
  constructor(
    public email: string, // ❌ Just a string
    public amount: number // ❌ Just a number
  ) {}
}
```

**✅ Correct:**

```typescript
// ✅ Value objects for domain concepts
export class User {
  constructor(
    public readonly email: Email, // ✅ Value object
    public readonly balance: Money // ✅ Value object
  ) {}
}
```

### 7. Testing the Wrong Layer

**Problem:** Writing integration tests for everything.

**❌ Wrong:**

```typescript
// ❌ Slow integration test for simple business rule
describe('User', () => {
  it('should validate email', async () => {
    const db = await setupDatabase(); // ❌ Unnecessary
    const user = await createUserInDatabase(db); // ❌ Unnecessary
    // Test business rule
  });
});
```

**✅ Correct:**

```typescript
// ✅ Fast unit test for business rule
describe('User', () => {
  it('should validate email', () => {
    expect(() => new Email('invalid')).toThrow(); // ✅ Fast, no dependencies
  });
});
```

---

## ✅ Best Practices

### 1. Keep Entities Pure

✅ **Do:**
- Put business rules in entities
- Make entities framework-agnostic
- Use value objects for domain concepts
- Keep entities testable without mocks

❌ **Don't:**
- Add framework dependencies to entities
- Put infrastructure code in entities
- Use primitives for domain concepts

### 2. Single Responsibility for Use Cases

✅ **Do:**
- One use case per operation
- Keep use cases focused
- Orchestrate, don't implement
- Define interfaces for what you need

❌ **Don't:**
- Put multiple operations in one use case
- Handle infrastructure in use cases
- Put business rules in use cases (put in entities)

### 3. Thin Adapters

✅ **Do:**
- Keep adapters thin (just conversion)
- Convert data formats
- Handle protocol-specific concerns
- Implement interfaces from inner layers

❌ **Don't:**
- Put business logic in adapters
- Make adapters too complex
- Leak adapter details to inner layers

### 4. Dependency Injection

✅ **Do:**
- Use dependency injection
- Wire dependencies at composition root
- Inject interfaces, not implementations
- Make dependencies explicit

❌ **Don't:**
- Create dependencies inside classes
- Use singletons for dependencies
- Hide dependencies

### 5. Value Objects

✅ **Do:**
- Use value objects for domain concepts
- Make value objects immutable
- Put validation in value objects
- Use value objects in entities

❌ **Don't:**
- Use primitives for domain concepts
- Allow value objects to be mutable
- Skip validation in value objects

### 6. Testing Strategy

✅ **Do:**
- Unit test entities (fast, no mocks)
- Unit test use cases (with mocks)
- Integration test adapters
- E2E test critical paths

❌ **Don't:**
- Write slow tests for everything
- Skip unit tests
- Test implementation details
- Mock everything

### 7. Layer Boundaries

✅ **Do:**
- Respect layer boundaries
- Keep dependencies pointing inward
- Define interfaces in inner layers
- Implement interfaces in outer layers

❌ **Don't:**
- Violate dependency rule
- Import from outer layers in inner layers
- Skip interfaces
- Mix layer concerns

### 8. Composition Root

✅ **Do:**
- Wire dependencies at composition root
- Keep composition root in framework layer
- Use dependency injection container if needed
- Make wiring explicit

❌ **Don't:**
- Wire dependencies in inner layers
- Use service locator pattern
- Hide dependency wiring
- Create dependencies everywhere

---

## 🔀 Clean Architecture vs Other Patterns

### Clean Architecture vs Hexagonal Architecture

**Similarities:**
- Both emphasize dependency inversion
- Both isolate business logic from frameworks
- Both use ports/interfaces
- Both enable testability

**Differences:**

| Aspect | Clean Architecture | Hexagonal Architecture |
|--------|-------------------|------------------------|
| **Layers** | 4 explicit layers (Entities, Use Cases, Adapters, Frameworks) | 2 main concepts (Ports, Adapters) |
| **Structure** | Concentric circles | Hexagon (conceptual) |
| **Focus** | Explicit layer separation | Port/adapter separation |
| **Complexity** | More structured, more layers | Simpler structure |
| **Use Cases** | Explicit use case layer | Use cases in application core |
| **Entities** | Explicit entity layer | Domain models in core |

**When to Use Each:**
- **Clean Architecture:** When you need explicit layer separation, large teams, complex domains
- **Hexagonal Architecture:** When you want simpler structure, smaller teams, less formal layering

**Note:** They're often used together - Hexagonal provides the port/adapter concept, Clean Architecture provides the layer structure.

### Clean Architecture vs Layered Architecture

**Layered Architecture:**
- Traditional 3-layer: Presentation, Business, Data
- Dependencies can go both ways
- Framework-dependent
- Harder to test

**Clean Architecture:**
- 4+ layers with dependency rule
- Dependencies point inward only
- Framework-independent
- Easy to test

**Key Difference:** Dependency direction - Clean Architecture enforces inward dependencies.

### Clean Architecture vs MVC

**MVC:**
- Model-View-Controller pattern
- Framework-dependent
- No explicit business logic layer
- Tight coupling common

**Clean Architecture:**
- Multiple layers with clear boundaries
- Framework-independent
- Explicit business logic layers
- Loose coupling

**Key Difference:** Clean Architecture provides more structure and independence.

### Clean Architecture vs Onion Architecture

**Similarities:**
- Both use concentric layers
- Both emphasize dependency inversion
- Both isolate core from frameworks

**Differences:**
- **Onion Architecture:** More focused on domain-driven design
- **Clean Architecture:** More explicit about use cases and application logic
- **Terminology:** Slightly different layer names, same concepts

**Note:** They're essentially the same pattern with different names and slight variations.

---

## 🌍 Real-World Applications

### 1. E-Commerce Platform

**Entities:**
- Product, Order, Customer, Payment

**Use Cases:**
- CreateOrder, ProcessPayment, CancelOrder, ShipOrder

**Adapters:**
- REST API for web
- GraphQL for mobile
- Payment gateway adapters (Stripe, PayPal)
- Database adapters (PostgreSQL, MongoDB)

**Frameworks:**
- Express.js for REST
- Apollo Server for GraphQL
- Stripe SDK
- PostgreSQL driver

### 2. Banking System

**Entities:**
- Account, Transaction, Customer, Loan

**Use Cases:**
- TransferMoney, WithdrawMoney, ApplyForLoan, CalculateInterest

**Adapters:**
- REST API for web banking
- SOAP adapter for legacy systems
- Database adapters
- External service adapters (credit check, fraud detection)

**Frameworks:**
- Spring Boot (Java)
- PostgreSQL
- Redis for caching
- Message queues for async processing

### 3. Healthcare System

**Entities:**
- Patient, Appointment, MedicalRecord, Prescription

**Use Cases:**
- ScheduleAppointment, CreateMedicalRecord, PrescribeMedication, GenerateReport

**Adapters:**
- REST API for web portal
- HL7 adapter for medical devices
- Database adapters
- Notification adapters (SMS, Email)

**Frameworks:**
- .NET Core
- SQL Server
- HL7 libraries
- SMS/Email services

### 4. SaaS Platform

**Entities:**
- User, Subscription, Feature, Billing

**Use Cases:**
- SignUp, Subscribe, UpgradePlan, ProcessBilling

**Adapters:**
- REST API
- GraphQL API
- Webhook adapters
- Database adapters
- Payment adapters

**Frameworks:**
- Node.js/Express
- PostgreSQL
- Stripe
- AWS services

---

## 📊 Benefits and Trade-offs

### Benefits

✅ **Framework Independence**
- Business logic doesn't depend on frameworks
- Can switch frameworks without rewriting business logic
- Framework upgrades don't break core

✅ **Testability**
- Business logic can be tested without external dependencies
- Fast unit tests
- Easy to mock dependencies

✅ **Independence from UI**
- UI can be changed without affecting business logic
- Support multiple UIs (web, mobile, CLI)
- UI changes are isolated

✅ **Independence from Database**
- Can switch databases without changing business logic
- Business logic doesn't know about database
- Easy to test without database

✅ **Independence from External Services**
- Business logic doesn't depend on external services
- Easy to mock external services
- Can swap external service implementations

✅ **Maintainability**
- Clear separation of concerns
- Easy to understand and modify
- Changes are localized

✅ **Scalability**
- Can scale different layers independently
- Clear boundaries for microservices
- Easy to add new features

### Trade-offs

❌ **Complexity**
- More layers and structure
- More files and directories
- Steeper learning curve

❌ **Overhead for Simple Apps**
- Too much structure for CRUD apps
- Additional indirection
- May be over-engineering

❌ **Performance Overhead**
- Additional abstraction layers
- More object creation
- May impact performance (usually negligible)

❌ **Initial Setup Time**
- More upfront design
- More boilerplate code
- Takes longer to get started

❌ **Team Experience Required**
- Team needs to understand principles
- Can lead to misuse if misunderstood
- Requires training and mentoring

---

## 🎓 Summary

### Key Takeaways

1. **Clean Architecture** organizes code into concentric layers with clear boundaries
2. **Four Layers:** Entities, Use Cases, Interface Adapters, Frameworks
3. **Dependency Rule:** Dependencies point inward only
4. **Entities** contain enterprise business rules (innermost layer)
5. **Use Cases** contain application business rules (orchestrate entities)
6. **Interface Adapters** convert data between layers
7. **Frameworks** provide implementations (outermost layer)
8. **High testability** - business logic can be tested in isolation
9. **Framework independence** - core doesn't know about frameworks
10. **Maintainability** - clear separation of concerns

### When to Use

✅ **Use Clean Architecture When:**
- Building long-lived applications
- Complex business logic
- Need framework independence
- High testability requirements
- Multiple teams working on codebase
- Need to support multiple interfaces
- Domain-driven design

❌ **Avoid Clean Architecture When:**
- Simple CRUD applications
- Prototypes or MVPs
- Very small applications
- Tight performance requirements
- Team lacks experience

### Best Practices

- Keep entities pure and framework-agnostic
- Single responsibility for use cases
- Keep adapters thin (just conversion)
- Use dependency injection
- Use value objects for domain concepts
- Test entities with unit tests (fast, no mocks)
- Test use cases with mocks
- Respect layer boundaries
- Wire dependencies at composition root

### Next Steps

After mastering Clean Architecture, consider:
- **CQRS** - Separate read/write models
- **Event Sourcing** - Store events instead of state
- **Domain-Driven Design** - Rich domain modeling
- **Microservices** - Apply Clean Architecture to services
- **Functional Programming** - Combine with functional patterns

---

## 📚 Additional Resources

**Original Source:**
- Robert C. Martin - "Clean Architecture: A Craftsman's Guide to Software Structure and Design" (2017)
- Robert C. Martin - "The Clean Architecture" blog post (2012)

**Related Patterns:**
- Hexagonal Architecture (Ports & Adapters)
- Onion Architecture
- Dependency Inversion Principle (SOLID)
- Domain-Driven Design

**Implementation Examples:**
- Spring Boot (Java) - Built-in support
- NestJS (Node.js) - Module system supports Clean Architecture
- .NET Core (C#) - Dependency injection supports it
- Django (Python) - Can be structured with Clean Architecture

**Videos & Tutorials:**
- Robert C. Martin's Clean Architecture talks
- Various YouTube tutorials on Clean Architecture
- Conference talks on implementing Clean Architecture

---

