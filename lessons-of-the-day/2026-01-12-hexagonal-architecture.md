# Hexagonal Architecture (Ports & Adapters) - Deep Dive

## 📋 Learning Objectives

- [ ] Understand Hexagonal Architecture (Ports & Adapters) definition and principles
- [ ] Learn the core concepts: ports, adapters, application core, and boundaries
- [ ] Master dependency inversion in architectural context
- [ ] Recognize when to use Hexagonal Architecture vs other patterns
- [ ] Understand primary (driving) and secondary (driven) adapters
- [ ] Practice implementing Hexagonal Architecture in real scenarios
- [ ] Learn testing benefits and strategies
- [ ] Explore real-world applications and use cases
- [ ] Understand common pitfalls and best practices
- [ ] Compare with Clean Architecture, Layered Architecture, and MVC

---

## 🎯 Definition

**Hexagonal Architecture**, also known as **Ports & Adapters**, is an architectural pattern that isolates the application core from external dependencies by using ports (interfaces) and adapters (implementations). The application core defines what it needs through ports, and adapters provide the implementations, allowing the core to remain independent of external frameworks, databases, and UI technologies.

**Origin:**
- Coined by Alistair Cockburn in 2005
- Also known as: **Ports & Adapters**, **Onion Architecture** (similar concept)
- Designed to address the problem of framework and technology coupling

**Key Principles:**
- **Application Core is Independent** - Business logic doesn't depend on external frameworks
- **Ports Define Contracts** - Interfaces define what the application needs
- **Adapters Implement Ports** - External implementations adapt to port contracts
- **Dependency Inversion** - Dependencies point inward toward the core
- **Testability** - Core can be tested without external dependencies

**Key Principle:**
> "Allow an application to equally be driven by users, programs, automated test or batch scripts, and to be developed and tested in isolation from its eventual run-time devices and databases." - Alistair Cockburn

**Alternative Formulation:**
> "The application core defines ports (interfaces) that it needs, and adapters (implementations) provide those capabilities. The core doesn't know about databases, web frameworks, or external services - it only knows about the ports."

---

## 🏗️ Structure

### Core Components

```
┌─────────────────────────────────────────────────────────┐
│                    External World                        │
│  (Users, Web, CLI, Database, APIs, Message Queues)      │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Adapters
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Application Core                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │            Business Logic                        │   │
│  │  (Use Cases, Domain Models, Services)            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Ports (Interfaces)                  │   │
│  │  • Primary Ports (Inbound)                       │   │
│  │  • Secondary Ports (Outbound)                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Adapters
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    External World                        │
│  (Users, Web, CLI, Database, APIs, Message Queues)      │
└─────────────────────────────────────────────────────────┘
```

### Key Concepts

**1. Application Core (Business Logic)**
- Contains all business rules and domain logic
- Has no dependencies on external frameworks
- Defines what it needs through ports
- Can be tested in isolation

**2. Ports (Interfaces)**
- Define contracts for what the application needs
- **Primary Ports (Inbound)**: Define how external actors interact with the application
- **Secondary Ports (Outbound)**: Define what the application needs from external systems

**3. Adapters (Implementations)**
- Implement ports and adapt external systems to port contracts
- **Primary Adapters (Driving)**: Allow external actors to use the application (REST API, CLI, GraphQL)
- **Secondary Adapters (Driven)**: Provide implementations for outbound needs (Database, Email, Payment Gateway)

**4. Dependency Direction**
- Dependencies point **inward** toward the core
- Core doesn't depend on adapters
- Adapters depend on ports (interfaces defined by core)

---

## 🔍 Core Concepts Deep Dive

### 1. Primary Ports (Inbound / Driving Ports)

**Definition:** Interfaces that define how external actors can interact with the application.

**Purpose:**
- Define application use cases
- Specify how the application can be used
- Represent application's public API

**Examples:**
- `CreateUserUseCase` interface
- `ProcessOrderUseCase` interface
- `SendNotificationUseCase` interface

**Characteristics:**
- Defined by the application core
- Represent business operations
- Input/output models are part of the core

### 2. Primary Adapters (Driving Adapters)

**Definition:** Implementations that allow external actors to interact with the application through primary ports.

**Purpose:**
- Translate external requests to use case calls
- Handle protocol-specific concerns (HTTP, CLI, GraphQL)
- Transform external data formats to core models

**Examples:**
- REST API controller
- GraphQL resolver
- CLI command handler
- WebSocket handler
- gRPC service

**Characteristics:**
- Depend on primary ports (use cases)
- Handle protocol-specific concerns
- Transform external formats to core models

### 3. Secondary Ports (Outbound / Driven Ports)

**Definition:** Interfaces that define what the application needs from external systems.

**Purpose:**
- Define what external capabilities the application needs
- Abstract away external system details
- Enable testability and flexibility

**Examples:**
- `UserRepository` interface
- `EmailService` interface
- `PaymentGateway` interface
- `EventPublisher` interface

**Characteristics:**
- Defined by the application core
- Represent external dependencies
- Abstract away implementation details

### 4. Secondary Adapters (Driven Adapters)

**Definition:** Implementations that provide external capabilities through secondary ports.

**Purpose:**
- Implement secondary port interfaces
- Adapt external systems to port contracts
- Handle external system specifics

**Examples:**
- PostgreSQL repository implementation
- MongoDB repository implementation
- SendGrid email service implementation
- Stripe payment gateway implementation
- RabbitMQ event publisher implementation

**Characteristics:**
- Implement secondary ports
- Handle external system specifics
- Can be swapped without changing core

---

## 💡 When to Use

### Use Hexagonal Architecture When:

✅ **You need framework independence**
- Example: Want to switch from Express to Fastify
- Example: Need to support multiple UI frameworks
- Example: Framework upgrades shouldn't break business logic

✅ **You need testability**
- Example: Test business logic without database
- Example: Test without external API calls
- Example: Fast, isolated unit tests

✅ **You have complex business logic**
- Example: Financial systems
- Example: E-commerce platforms
- Example: Domain-heavy applications

✅ **You need to integrate multiple external systems**
- Example: Multiple databases
- Example: Multiple payment gateways
- Example: Multiple notification services

✅ **You're building long-lived applications**
- Example: Applications that will evolve over years
- Example: Need to adapt to changing requirements
- Example: Technology stack may change

✅ **You need to support multiple interfaces**
- Example: REST API + GraphQL + CLI
- Example: Web + Mobile + Desktop
- Example: Multiple protocols

### Don't Use Hexagonal Architecture When:

❌ **Simple CRUD applications**
- Overhead not justified
- Straightforward data operations
- No complex business logic

❌ **Prototypes or MVPs**
- Too much structure for early stages
- Can add complexity prematurely
- Focus on speed over structure

❌ **Very small applications**
- Over-engineering for small projects
- Simple layered architecture sufficient
- Not enough complexity to justify

❌ **Tight performance requirements**
- Additional abstraction layers add overhead
- Direct framework usage may be faster
- Need to measure and evaluate

---

## 🏛️ Architecture Layers

### Layer Structure

```
┌─────────────────────────────────────────┐
│         Primary Adapters                 │
│  (REST, GraphQL, CLI, WebSocket)         │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Primary Ports                    │
│  (Use Case Interfaces)                   │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Application Core                  │
│  (Business Logic, Domain Models)         │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Secondary Ports                  │
│  (Repository, Service Interfaces)        │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Secondary Adapters               │
│  (Database, External Services)           │
└─────────────────────────────────────────┘
```

### Dependency Rule

**Critical Rule:** Dependencies point **inward** toward the core.

- ✅ Core depends on nothing (except domain concepts)
- ✅ Adapters depend on ports (interfaces)
- ✅ Ports are defined by core
- ❌ Core never depends on adapters
- ❌ Core never depends on frameworks

---

## 📚 Implementation Examples

### Example 1: User Management System

#### Step 1: Define Domain Models (Core)

```typescript
// Domain/User.ts - Core domain model
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    private readonly createdAt: Date
  ) {}

  static create(email: string, name: string): User {
    // Business rules
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address');
    }
    if (!name || name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters');
    }

    return new User(
      crypto.randomUUID(),
      email.toLowerCase().trim(),
      name.trim(),
      new Date()
    );
  }

  // Business logic methods
  canReceiveEmails(): boolean {
    // Business rule: can receive emails if created more than 1 day ago
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return this.createdAt < oneDayAgo;
  }
}
```

#### Step 2: Define Secondary Ports (Outbound)

```typescript
// Ports/UserRepository.ts - Secondary port (outbound)
export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
}

// Ports/EmailService.ts - Secondary port (outbound)
export interface EmailService {
  sendWelcomeEmail(user: User): Promise<void>;
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}
```

#### Step 3: Define Primary Ports (Inbound / Use Cases)

```typescript
// UseCases/CreateUserUseCase.ts - Primary port (inbound)
export interface CreateUserRequest {
  email: string;
  name: string;
}

export interface CreateUserResponse {
  id: string;
  email: string;
  name: string;
}

export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // Business logic in the core
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = User.create(request.email, request.name);
    await this.userRepository.save(user);

    // Send welcome email if user can receive emails
    if (user.canReceiveEmails()) {
      await this.emailService.sendWelcomeEmail(user);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name
    };
  }
}
```

#### Step 4: Implement Secondary Adapters (Driven)

```typescript
// Adapters/Persistence/PostgreSQLUserRepository.ts
import { UserRepository } from '../../Ports/UserRepository';
import { User } from '../../Domain/User';
import { Pool } from 'pg';

export class PostgreSQLUserRepository implements UserRepository {
  constructor(private db: Pool) {}

  async save(user: User): Promise<void> {
    await this.db.query(
      'INSERT INTO users (id, email, name, created_at) VALUES ($1, $2, $3, $4)',
      [user.id, user.email, user.name, user.createdAt]
    );
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return null;
    return this.mapToUser(result.rows[0]);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) return null;
    return this.mapToUser(result.rows[0]);
  }

  async findAll(): Promise<User[]> {
    const result = await this.db.query('SELECT * FROM users');
    return result.rows.map(row => this.mapToUser(row));
  }

  private mapToUser(row: any): User {
    return new User(row.id, row.email, row.name, row.created_at);
  }
}

// Adapters/Email/SendGridEmailService.ts
import { EmailService } from '../../Ports/EmailService';
import { User } from '../../Domain/User';
import sgMail from '@sendgrid/mail';

export class SendGridEmailService implements EmailService {
  constructor(private apiKey: string) {
    sgMail.setApiKey(apiKey);
  }

  async sendWelcomeEmail(user: User): Promise<void> {
    await this.sendEmail(
      user.email,
      'Welcome!',
      `Hello ${user.name}, welcome to our platform!`
    );
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    await sgMail.send({
      to,
      from: 'noreply@example.com',
      subject,
      text: body
    });
  }
}
```

#### Step 5: Implement Primary Adapters (Driving)

```typescript
// Adapters/Web/ExpressUserController.ts
import { Request, Response } from 'express';
import { CreateUserUseCase, CreateUserRequest } from '../../UseCases/CreateUserUseCase';

export class ExpressUserController {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const request: CreateUserRequest = {
        email: req.body.email,
        name: req.body.name
      };

      const response = await this.createUserUseCase.execute(request);

      res.status(201).json(response);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}

// Adapters/CLI/CLIUserHandler.ts
import { CreateUserUseCase, CreateUserRequest } from '../../UseCases/CreateUserUseCase';
import readline from 'readline';

export class CLIUserHandler {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  async handleCreateUser(rl: readline.Interface): Promise<void> {
    const email = await this.question(rl, 'Email: ');
    const name = await this.question(rl, 'Name: ');

    try {
      const request: CreateUserRequest = { email, name };
      const response = await this.createUserUseCase.execute(request);
      console.log(`User created: ${response.id} - ${response.email}`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private question(rl: readline.Interface, query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
  }
}
```

#### Step 6: Wire Everything Together

```typescript
// Infrastructure/App.ts - Dependency Injection / Composition Root
import express from 'express';
import { Pool } from 'pg';
import { CreateUserUseCase } from './UseCases/CreateUserUseCase';
import { PostgreSQLUserRepository } from './Adapters/Persistence/PostgreSQLUserRepository';
import { SendGridEmailService } from './Adapters/Email/SendGridEmailService';
import { ExpressUserController } from './Adapters/Web/ExpressUserController';

export class App {
  private app: express.Application;
  private createUserUseCase: CreateUserUseCase;

  constructor() {
    this.app = express();
    this.app.use(express.json());
    this.setupDependencies();
    this.setupRoutes();
  }

  private setupDependencies(): void {
    // Secondary adapters (driven)
    const db = new Pool({ /* connection config */ });
    const userRepository = new PostgreSQLUserRepository(db);
    const emailService = new SendGridEmailService(process.env.SENDGRID_API_KEY!);

    // Use cases (core)
    this.createUserUseCase = new CreateUserUseCase(userRepository, emailService);
  }

  private setupRoutes(): void {
    // Primary adapter (driving)
    const userController = new ExpressUserController(this.createUserUseCase);
    this.app.post('/users', (req, res) => userController.createUser(req, res));
  }

  public start(port: number): void {
    this.app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
}

// main.ts
const app = new App();
app.start(3000);
```

### Example 2: Testing with Mock Adapters

```typescript
// Tests/Mocks/InMemoryUserRepository.ts
import { UserRepository } from '../../Ports/UserRepository';
import { User } from '../../Domain/User';

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Test helper methods
  clear(): void {
    this.users.clear();
  }

  getCount(): number {
    return this.users.size;
  }
}

// Tests/Mocks/MockEmailService.ts
import { EmailService } from '../../Ports/EmailService';
import { User } from '../../Domain/User';

export class MockEmailService implements EmailService {
  public sentEmails: Array<{ to: string; subject: string; body: string }> = [];

  async sendWelcomeEmail(user: User): Promise<void> {
    this.sentEmails.push({
      to: user.email,
      subject: 'Welcome!',
      body: `Hello ${user.name}, welcome!`
    });
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    this.sentEmails.push({ to, subject, body });
  }

  // Test helper methods
  clear(): void {
    this.sentEmails = [];
  }

  getEmailCount(): number {
    return this.sentEmails.length;
  }
}

// Tests/UseCases/CreateUserUseCase.test.ts
import { CreateUserUseCase } from '../../UseCases/CreateUserUseCase';
import { InMemoryUserRepository } from '../Mocks/InMemoryUserRepository';
import { MockEmailService } from '../Mocks/MockEmailService';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: InMemoryUserRepository;
  let emailService: MockEmailService;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    emailService = new MockEmailService();
    useCase = new CreateUserUseCase(userRepository, emailService);
  });

  it('should create a user successfully', async () => {
    const request = {
      email: 'test@example.com',
      name: 'Test User'
    };

    const response = await useCase.execute(request);

    expect(response.email).toBe('test@example.com');
    expect(response.name).toBe('Test User');
    expect(response.id).toBeDefined();

    const savedUser = await userRepository.findById(response.id);
    expect(savedUser).not.toBeNull();
    expect(savedUser?.email).toBe('test@example.com');
  });

  it('should throw error if email already exists', async () => {
    const request = {
      email: 'test@example.com',
      name: 'Test User'
    };

    await useCase.execute(request);

    await expect(useCase.execute(request)).rejects.toThrow(
      'User with this email already exists'
    );
  });

  it('should validate email format', async () => {
    const request = {
      email: 'invalid-email',
      name: 'Test User'
    };

    await expect(useCase.execute(request)).rejects.toThrow('Invalid email address');
  });

  it('should validate name length', async () => {
    const request = {
      email: 'test@example.com',
      name: 'A'
    };

    await expect(useCase.execute(request)).rejects.toThrow(
      'Name must be at least 2 characters'
    );
  });
});
```

### Example 3: Multiple Secondary Adapters

```typescript
// Ports/PaymentGateway.ts - Secondary port
export interface PaymentGateway {
  processPayment(amount: number, currency: string, token: string): Promise<PaymentResult>;
  refundPayment(transactionId: string): Promise<RefundResult>;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amount: number;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
}

// Adapters/Payment/StripePaymentGateway.ts
import { PaymentGateway, PaymentResult, RefundResult } from '../../Ports/PaymentGateway';
import Stripe from 'stripe';

export class StripePaymentGateway implements PaymentGateway {
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, { apiVersion: '2023-10-16' });
  }

  async processPayment(amount: number, currency: string, token: string): Promise<PaymentResult> {
    const charge = await this.stripe.charges.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      source: token
    });

    return {
      success: charge.status === 'succeeded',
      transactionId: charge.id,
      amount: charge.amount / 100
    };
  }

  async refundPayment(transactionId: string): Promise<RefundResult> {
    const refund = await this.stripe.refunds.create({
      charge: transactionId
    });

    return {
      success: refund.status === 'succeeded',
      refundId: refund.id
    };
  }
}

// Adapters/Payment/PayPalPaymentGateway.ts
import { PaymentGateway, PaymentResult, RefundResult } from '../../Ports/PaymentGateway';
import paypal from 'paypal-rest-sdk';

export class PayPalPaymentGateway implements PaymentGateway {
  constructor(config: { clientId: string; clientSecret: string; mode: string }) {
    paypal.configure(config);
  }

  async processPayment(amount: number, currency: string, token: string): Promise<PaymentResult> {
    return new Promise((resolve, reject) => {
      paypal.payment.execute(token, {}, (error, payment) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            success: payment.state === 'approved',
            transactionId: payment.id,
            amount: parseFloat(payment.transactions[0].amount.total)
          });
        }
      });
    });
  }

  async refundPayment(transactionId: string): Promise<RefundResult> {
    return new Promise((resolve, reject) => {
      paypal.sale.refund(transactionId, {}, (error, refund) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            success: refund.state === 'completed',
            refundId: refund.id
          });
        }
      });
    });
  }
}

// Use case can work with either payment gateway
export class ProcessOrderUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private paymentGateway: PaymentGateway // Works with any implementation
  ) {}

  async execute(request: ProcessOrderRequest): Promise<ProcessOrderResponse> {
    // Business logic doesn't care which payment gateway is used
    const paymentResult = await this.paymentGateway.processPayment(
      request.amount,
      request.currency,
      request.paymentToken
    );

    if (!paymentResult.success) {
      throw new Error('Payment processing failed');
    }

    // ... rest of business logic
  }
}
```

---

## 🔄 Dependency Inversion in Practice

### Traditional Layered Architecture (Violates DIP)

```typescript
// ❌ BAD: Core depends on concrete implementations
// Domain/UserService.ts
import { PostgreSQLUserRepository } from '../Infrastructure/PostgreSQLUserRepository';

export class UserService {
  private repository: PostgreSQLUserRepository; // Depends on concrete class!

  constructor() {
    this.repository = new PostgreSQLUserRepository(); // Tight coupling
  }

  async createUser(email: string, name: string) {
    // Can't test without PostgreSQL
    // Can't switch to MongoDB easily
    await this.repository.save(/* ... */);
  }
}
```

**Problems:**
- Core depends on infrastructure
- Hard to test (needs real database)
- Hard to swap implementations
- Violates Dependency Inversion Principle

### Hexagonal Architecture (Follows DIP)

```typescript
// ✅ GOOD: Core depends on abstractions (ports)
// Domain/UserService.ts
import { UserRepository } from '../Ports/UserRepository'; // Interface!

export class UserService {
  constructor(private repository: UserRepository) { // Depends on interface
    // Can inject any implementation
  }

  async createUser(email: string, name: string) {
    // Easy to test with mock
    // Easy to swap implementations
    await this.repository.save(/* ... */);
  }
}
```

**Benefits:**
- Core depends on interfaces
- Easy to test (inject mocks)
- Easy to swap implementations
- Follows Dependency Inversion Principle

---

## 🧪 Testing Benefits

### 1. Isolated Unit Tests

```typescript
// Tests run fast - no database, no network calls
describe('CreateUserUseCase', () => {
  it('should create user', async () => {
    const mockRepo = new InMemoryUserRepository();
    const mockEmail = new MockEmailService();
    const useCase = new CreateUserUseCase(mockRepo, mockEmail);

    // Fast, isolated test
    const result = await useCase.execute({
      email: 'test@example.com',
      name: 'Test'
    });

    expect(result.id).toBeDefined();
  });
});
```

### 2. Integration Tests with Real Adapters

```typescript
// Can test with real adapters when needed
describe('CreateUserUseCase Integration', () => {
  it('should work with real database', async () => {
    const realRepo = new PostgreSQLUserRepository(testDb);
    const mockEmail = new MockEmailService();
    const useCase = new CreateUserUseCase(realRepo, mockEmail);

    // Integration test with real database
    const result = await useCase.execute({
      email: 'test@example.com',
      name: 'Test'
    });

    expect(result.id).toBeDefined();
  });
});
```

### 3. Adapter-Specific Tests

```typescript
// Test adapters independently
describe('PostgreSQLUserRepository', () => {
  it('should save and retrieve user', async () => {
    const repo = new PostgreSQLUserRepository(testDb);
    const user = User.create('test@example.com', 'Test');

    await repo.save(user);
    const retrieved = await repo.findById(user.id);

    expect(retrieved).toEqual(user);
  });
});
```

---

## 🎨 Multiple Primary Adapters

### Supporting Multiple Interfaces

```typescript
// Same use case, different adapters
const createUserUseCase = new CreateUserUseCase(userRepository, emailService);

// REST API adapter
const restController = new ExpressUserController(createUserUseCase);
app.post('/api/users', (req, res) => restController.createUser(req, res));

// GraphQL adapter
const graphqlResolver = {
  createUser: async (args: any) => {
    return await createUserUseCase.execute(args);
  }
};

// CLI adapter
const cliHandler = new CLIUserHandler(createUserUseCase);
cliHandler.handleCreateUser(readlineInterface);

// gRPC adapter
class UserServiceGrpc {
  async CreateUser(call: any, callback: any) {
    const result = await createUserUseCase.execute(call.request);
    callback(null, result);
  }
}
```

**Benefits:**
- Same business logic
- Multiple interfaces
- Easy to add new interfaces
- No changes to core

---

## ⚠️ Common Pitfalls

### Pitfall 1: Leaking Framework Details into Core

❌ **BAD: Framework types in core**
```typescript
// UseCases/CreateUserUseCase.ts
import { Request, Response } from 'express'; // ❌ Framework dependency!

export class CreateUserUseCase {
  async execute(req: Request): Promise<Response> { // ❌ Framework types!
    // ...
  }
}
```

✅ **GOOD: Core uses domain types**
```typescript
// UseCases/CreateUserUseCase.ts
export interface CreateUserRequest {
  email: string;
  name: string;
}

export interface CreateUserResponse {
  id: string;
  email: string;
  name: string;
}

export class CreateUserUseCase {
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // Core uses domain types, not framework types
  }
}
```

### Pitfall 2: Business Logic in Adapters

❌ **BAD: Business logic in controller**
```typescript
// Adapters/Web/ExpressUserController.ts
export class ExpressUserController {
  async createUser(req: Request, res: Response) {
    // ❌ Business logic in adapter!
    if (!req.body.email || !req.body.email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }
    if (req.body.email === 'admin@example.com') {
      return res.status(403).json({ error: 'Cannot create admin' });
    }
    // ...
  }
}
```

✅ **GOOD: Business logic in core**
```typescript
// UseCases/CreateUserUseCase.ts
export class CreateUserUseCase {
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // ✅ Business logic in core
    if (!request.email || !request.email.includes('@')) {
      throw new Error('Invalid email address');
    }
    if (request.email === 'admin@example.com') {
      throw new Error('Cannot create admin user');
    }
    // ...
  }
}

// Adapters/Web/ExpressUserController.ts
export class ExpressUserController {
  async createUser(req: Request, res: Response) {
    try {
      const request: CreateUserRequest = {
        email: req.body.email,
        name: req.body.name
      };
      const response = await this.createUserUseCase.execute(request);
      res.status(201).json(response);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
```

### Pitfall 3: Anemic Domain Models

❌ **BAD: Anemic domain model**
```typescript
// Domain/User.ts
export class User {
  public id: string;
  public email: string;
  public name: string;
  // No behavior, just data
}

// UseCases/CreateUserUseCase.ts
export class CreateUserUseCase {
  async execute(request: CreateUserRequest) {
    const user = new User();
    user.id = crypto.randomUUID();
    user.email = request.email; // ❌ Logic outside domain
    user.name = request.name;
    // Business rules scattered in use cases
  }
}
```

✅ **GOOD: Rich domain model**
```typescript
// Domain/User.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string
  ) {}

  static create(email: string, name: string): User {
    // ✅ Business rules in domain
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address');
    }
    return new User(crypto.randomUUID(), email, name);
  }

  canReceiveEmails(): boolean {
    // ✅ Business logic in domain
    // ...
  }
}
```

### Pitfall 4: Ports Too Specific

❌ **BAD: Port too specific to implementation**
```typescript
// Ports/UserRepository.ts
export interface UserRepository {
  // ❌ Too specific to SQL
  findByEmailUsingSQL(email: string): Promise<User | null>;
  saveWithTransaction(transaction: Transaction, user: User): Promise<void>;
}
```

✅ **GOOD: Port abstracts implementation details**
```typescript
// Ports/UserRepository.ts
export interface UserRepository {
  // ✅ Abstract, implementation-agnostic
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

### Pitfall 5: Adapters Knowing About Each Other

❌ **BAD: Adapters depend on each other**
```typescript
// Adapters/Web/ExpressUserController.ts
import { PostgreSQLUserRepository } from '../Persistence/PostgreSQLUserRepository'; // ❌

export class ExpressUserController {
  constructor() {
    this.repository = new PostgreSQLUserRepository(); // ❌ Direct dependency
  }
}
```

✅ **GOOD: Dependencies injected from outside**
```typescript
// Adapters/Web/ExpressUserController.ts
import { CreateUserUseCase } from '../../UseCases/CreateUserUseCase'; // ✅

export class ExpressUserController {
  constructor(private createUserUseCase: CreateUserUseCase) { // ✅ Depends on use case
    // Dependencies injected from composition root
  }
}
```

---

## ✅ Best Practices

### 1. Keep Core Framework-Agnostic

```typescript
// ✅ GOOD: Core uses plain TypeScript/JavaScript
export class CreateUserUseCase {
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // No Express, no Fastify, no framework types
  }
}

// ❌ BAD: Core imports framework
import { Request } from 'express';
export class CreateUserUseCase {
  async execute(req: Request) { /* ... */ }
}
```

### 2. Use Dependency Injection

```typescript
// ✅ GOOD: Dependencies injected
export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}
}

// ❌ BAD: Dependencies created inside
export class CreateUserUseCase {
  private userRepository = new PostgreSQLUserRepository(); // ❌
}
```

### 3. Define Ports at Appropriate Abstraction Level

```typescript
// ✅ GOOD: Appropriate abstraction
export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
}

// ❌ BAD: Too low-level (leaks implementation)
export interface UserRepository {
  executeSQL(query: string): Promise<any>; // ❌
}

// ❌ BAD: Too high-level (business logic in port)
export interface UserRepository {
  createUserIfNotExists(email: string): Promise<User>; // ❌ Business logic!
}
```

### 4. Keep Adapters Thin

```typescript
// ✅ GOOD: Thin adapter, just translation
export class ExpressUserController {
  async createUser(req: Request, res: Response) {
    const request: CreateUserRequest = {
      email: req.body.email,
      name: req.body.name
    };
    const response = await this.createUserUseCase.execute(request);
    res.status(201).json(response);
  }
}

// ❌ BAD: Thick adapter with logic
export class ExpressUserController {
  async createUser(req: Request, res: Response) {
    // ❌ Validation logic
    if (!req.body.email) { /* ... */ }
    // ❌ Business logic
    if (req.body.email === 'admin@example.com') { /* ... */ }
    // ❌ Data transformation
    const user = { /* complex transformation */ };
    // ...
  }
}
```

### 5. Use Value Objects for Domain Concepts

```typescript
// ✅ GOOD: Value objects for domain concepts
export class Email {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid email');
    }
  }

  private isValid(email: string): boolean {
    return email.includes('@') && email.length > 3;
  }

  toString(): string {
    return this.value;
  }
}

export class User {
  constructor(
    public readonly id: string,
    public readonly email: Email, // ✅ Value object
    public readonly name: string
  ) {}
}
```

### 6. Separate Input/Output Models

```typescript
// ✅ GOOD: Separate models for different layers
// Domain/User.ts - Domain model
export class User {
  // Rich domain model with behavior
}

// UseCases/CreateUserRequest.ts - Use case input
export interface CreateUserRequest {
  email: string;
  name: string;
}

// UseCases/CreateUserResponse.ts - Use case output
export interface CreateUserResponse {
  id: string;
  email: string;
  name: string;
}

// Adapters/Web/UserDTO.ts - API DTO
export interface UserDTO {
  id: string;
  email: string;
  name: string;
  createdAt: string; // Different format for API
}
```

---

## 🔀 Hexagonal Architecture vs Other Patterns

### Hexagonal Architecture vs Layered Architecture

| Aspect | Layered Architecture | Hexagonal Architecture |
|--------|---------------------|------------------------|
| **Dependency Direction** | Top to bottom | Inward to core |
| **Framework Coupling** | High (layers depend on frameworks) | Low (core is framework-agnostic) |
| **Testability** | Hard (needs all layers) | Easy (mock adapters) |
| **Flexibility** | Low (hard to swap layers) | High (easy to swap adapters) |
| **Complexity** | Lower | Higher |
| **When to Use** | Simple applications | Complex, long-lived applications |

### Hexagonal Architecture vs Clean Architecture

**Similarities:**
- Both use dependency inversion
- Both separate business logic from frameworks
- Both emphasize testability
- Both have clear boundaries

**Differences:**

| Aspect | Hexagonal Architecture | Clean Architecture |
|--------|----------------------|-------------------|
| **Focus** | Ports and adapters | Layers and dependencies |
| **Structure** | Hexagon metaphor | Concentric circles |
| **Layers** | Core + Adapters | Entities, Use Cases, Interface Adapters, Frameworks |
| **Complexity** | Moderate | Higher (more layers) |
| **When to Use** | Most applications | Very complex domains |

**Note:** Clean Architecture is an evolution of Hexagonal Architecture with more explicit layering.

### Hexagonal Architecture vs MVC

| Aspect | MVC | Hexagonal Architecture |
|--------|-----|------------------------|
| **Focus** | UI separation | Complete application isolation |
| **Scope** | Presentation layer | Entire application |
| **Business Logic** | Can leak into controllers | Isolated in core |
| **Framework** | Often framework-specific | Framework-agnostic |
| **Testability** | Moderate | High |
| **When to Use** | UI-heavy applications | Full-stack applications |

---

## 🌍 Real-World Applications

### Example 1: E-Commerce Platform

```
Application Core:
├── Domain Models (Product, Order, Cart, User)
├── Use Cases
│   ├── CreateOrderUseCase
│   ├── ProcessPaymentUseCase
│   ├── CalculateShippingUseCase
│   └── SendOrderConfirmationUseCase
└── Ports
    ├── OrderRepository
    ├── PaymentGateway
    ├── ShippingService
    └── EmailService

Primary Adapters:
├── REST API (Express)
├── GraphQL API
├── Admin Dashboard (React)
└── Mobile App API

Secondary Adapters:
├── PostgreSQL (Orders, Users)
├── MongoDB (Products, Catalog)
├── Stripe (Payments)
├── PayPal (Payments)
├── FedEx API (Shipping)
└── SendGrid (Email)
```

### Example 2: Banking System

```
Application Core:
├── Domain Models (Account, Transaction, Transfer)
├── Use Cases
│   ├── TransferFundsUseCase
│   ├── CheckBalanceUseCase
│   ├── ProcessInterestUseCase
│   └── GenerateStatementUseCase
└── Ports
    ├── AccountRepository
    ├── TransactionRepository
    ├── AuditLogger
    └── NotificationService

Primary Adapters:
├── REST API (Banking API)
├── SOAP API (Legacy integration)
├── Web Interface
└── ATM Interface

Secondary Adapters:
├── Oracle Database (Accounts)
├── PostgreSQL (Transactions)
├── File System (Audit logs)
├── SMS Gateway (Notifications)
└── Email Service (Statements)
```

### Example 3: Microservices Communication

```
Service A (Order Service)
├── Core: Order domain logic
├── Primary Adapters: REST API, Message Consumer
└── Secondary Adapters: Database, Event Publisher

Service B (Payment Service)
├── Core: Payment domain logic
├── Primary Adapters: REST API, Message Consumer
└── Secondary Adapters: Database, Payment Gateway

Communication:
├── REST API calls (synchronous)
├── Message Queue (asynchronous)
└── Event Bus (event-driven)
```

---

## 📊 Benefits and Trade-offs

### Benefits

✅ **Framework Independence**
- Switch frameworks without changing business logic
- Example: Express → Fastify, PostgreSQL → MongoDB

✅ **Testability**
- Test business logic in isolation
- Fast unit tests with mocks
- Easy integration tests

✅ **Flexibility**
- Swap implementations easily
- Support multiple interfaces
- Add new adapters without changing core

✅ **Maintainability**
- Clear separation of concerns
- Business logic isolated
- Easy to understand and modify

✅ **Long-term Viability**
- Technology changes don't break core
- Easy to migrate to new technologies
- Future-proof architecture

### Trade-offs

❌ **Increased Complexity**
- More files and structure
- More abstraction layers
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

---

## 🎓 Summary

### Key Takeaways

1. **Hexagonal Architecture** isolates application core from external dependencies
2. **Ports** define contracts (interfaces) for what the application needs
3. **Adapters** implement ports and adapt external systems
4. **Primary Ports/Adapters** handle inbound interactions (use cases)
5. **Secondary Ports/Adapters** handle outbound dependencies (repositories, services)
6. **Dependencies point inward** - core doesn't depend on adapters
7. **High testability** - core can be tested in isolation
8. **Framework independence** - core doesn't know about frameworks

### When to Use

✅ **Use Hexagonal Architecture When:**
- Building long-lived applications
- Complex business logic
- Need framework independence
- High testability requirements
- Multiple external integrations
- Supporting multiple interfaces

❌ **Avoid Hexagonal Architecture When:**
- Simple CRUD applications
- Prototypes or MVPs
- Very small applications
- Tight performance requirements
- Team lacks experience

### Best Practices

- Keep core framework-agnostic
- Use dependency injection
- Define ports at appropriate abstraction level
- Keep adapters thin (just translation)
- Use value objects for domain concepts
- Separate input/output models
- Don't leak framework details into core
- Keep business logic in core, not adapters

### Next Steps

After mastering Hexagonal Architecture, consider:
- **Clean Architecture** - More explicit layering
- **CQRS** - Separate read/write models
- **Domain-Driven Design** - Rich domain modeling
- **Event Sourcing** - Store events instead of state

---

## 📚 Additional Resources

**Original Paper:**
- Alistair Cockburn - "Hexagonal Architecture" (2005)

**Related Patterns:**
- Dependency Inversion Principle (SOLID)
- Clean Architecture (Robert C. Martin)
- Onion Architecture (similar concept)
- Ports and Adapters (same pattern, different name)

**Implementation Examples:**
- Spring Boot (Java) - Built-in support
- NestJS (Node.js) - Module system supports hexagonal
- Django (Python) - Can be structured hexagonally
- .NET Core (C#) - Dependency injection supports it

---



