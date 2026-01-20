# Onion Architecture - Deep Dive

## 📋 Learning Objectives

- [ ] Understand Onion Architecture definition and principles
- [ ] Learn the concentric layers: Domain, Application, Infrastructure, and Presentation
- [ ] Master the dependency inversion principle in Onion Architecture
- [ ] Recognize similarities and differences with Clean Architecture
- [ ] Understand the Domain-Driven Design focus
- [ ] Practice implementing Onion Architecture in real scenarios
- [ ] Learn testing strategies for each layer
- [ ] Explore real-world applications and use cases
- [ ] Understand common pitfalls and best practices
- [ ] Compare with Clean Architecture, Hexagonal Architecture, and Layered Architecture

---

## 🎯 Definition

**Onion Architecture** is an architectural pattern that organizes code into concentric layers with the domain at the center. The architecture emphasizes dependency inversion, where outer layers depend on inner layers, and the core domain is independent of infrastructure, frameworks, and external concerns.

**Origin:**
- Coined by Jeffrey Palermo in 2008
- Also known as: **Clean Architecture** (very similar, by Robert C. Martin)
- Strong focus on **Domain-Driven Design (DDD)**
- Designed to address coupling and dependency issues in software architecture

**Key Principles:**
- **Domain at the Center** - Business logic and domain models are at the core
- **Dependency Inversion** - Dependencies point inward toward the domain
- **Independence from Infrastructure** - Domain doesn't depend on databases, frameworks, or external services
- **Testability** - Core domain can be tested without external dependencies
- **Domain-Driven Design** - Strong emphasis on rich domain models

**Key Principle:**
> "Onion Architecture organizes code into concentric layers with the domain at the center. All dependencies point inward, ensuring that the core domain remains independent of infrastructure, frameworks, and external concerns. The domain is the most stable part of the application." - Jeffrey Palermo

**Alternative Formulation:**
> "Onion Architecture uses concentric layers where the domain (business logic) is at the center, surrounded by application services, then infrastructure, and finally presentation. Dependencies flow inward, making the domain completely independent of external concerns."

---

## 🏗️ Structure

### The Concentric Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  (UI, Web, API, Controllers)                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Infrastructure Layer                      │  │
│  │  (Database, External Services, Frameworks)            │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Application Services Layer                │  │  │
│  │  │  (Use Cases, Application Logic, Orchestration)    │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │         Domain Layer (Core)                │  │  │  │
│  │  │  │  (Entities, Value Objects, Domain Services)│  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Layer Descriptions

**1. Domain Layer (Core - Innermost)**
- Center of the architecture
- Contains domain entities, value objects, and domain services
- Pure business logic with no dependencies
- Most stable and reusable
- Examples: User, Order, Product, Domain rules

**2. Application Services Layer**
- Contains application-specific business logic
- Orchestrates domain entities
- Defines use cases and workflows
- Depends only on Domain layer
- Examples: CreateUserService, ProcessOrderService, SendEmailService

**3. Infrastructure Layer**
- Handles technical concerns
- Database implementations, external service integrations
- Implements interfaces defined in inner layers
- Depends on Application Services and Domain
- Examples: UserRepository (implementation), EmailService (implementation), Database connections

**4. Presentation Layer (Outermost)**
- User interface and API endpoints
- Controllers, Views, API handlers
- Depends on Application Services and Domain
- Examples: REST Controllers, Web pages, CLI interfaces

### Dependency Rule

**Critical Rule:** Dependencies point **inward** only.

- ✅ Inner layers don't know about outer layers
- ✅ Outer layers depend on inner layers
- ✅ Inner layers define interfaces
- ✅ Outer layers implement interfaces
- ❌ Domain doesn't depend on anything
- ❌ Application Services depend only on Domain
- ❌ Infrastructure depends on Application Services and Domain
- ❌ Presentation depends on Application Services and Domain

---

## 🔍 Core Concepts Deep Dive

### 1. Domain Layer (Core)

**Definition:** The innermost layer containing domain entities, value objects, and domain services - the heart of the application.

**Purpose:**
- Encapsulate core business concepts
- Represent domain entities
- Contain business rules that are universal to the domain
- Independent of any application, framework, or infrastructure
- Focus on domain-driven design

**Characteristics:**
- **No dependencies** on outer layers
- **Pure business logic** - no framework or infrastructure code
- **Highly reusable** across applications
- **Most stable** - changes infrequently
- **Rich domain models** - entities with behavior
- **Value objects** and **entities** from DDD

**Example:**

```typescript
// Domain/Entities/User.ts - Domain Layer
export class User {
  constructor(
    private id: UserId,
    private email: Email,
    private name: string,
    private passwordHash: string,
    private createdAt: Date
  ) {
    this.validate();
  }

  // Business rule: User must be at least 18 years old
  static create(id: UserId, email: Email, name: string, birthDate: Date, password: string): User {
    const age = this.calculateAge(birthDate);
    if (age < 18) {
      throw new DomainError('User must be at least 18 years old');
    }
    
    const passwordHash = this.hashPassword(password);
    return new User(id, email, name, passwordHash, new Date());
  }

  // Business rule: Password must meet requirements
  changePassword(oldPassword: string, newPassword: string): void {
    if (!this.verifyPassword(oldPassword)) {
      throw new DomainError('Invalid current password');
    }
    
    if (newPassword.length < 8) {
      throw new DomainError('Password must be at least 8 characters');
    }
    
    this.passwordHash = User.hashPassword(newPassword);
  }

  verifyPassword(password: string): boolean {
    return this.passwordHash === User.hashPassword(password);
  }

  // Business rule: Update email
  updateEmail(newEmail: Email): void {
    this.email = newEmail;
  }

  private validate(): void {
    if (!this.email.isValid()) {
      throw new DomainError('Invalid email address');
    }
    if (this.name.length < 2) {
      throw new DomainError('Name must be at least 2 characters');
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

  // Getters
  getId(): UserId { return this.id; }
  getEmail(): Email { return this.email; }
  getName(): string { return this.name; }
  getCreatedAt(): Date { return this.createdAt; }
}

// Domain/ValueObjects/UserId.ts
export class UserId {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new DomainError('User ID cannot be empty');
    }
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

// Domain/ValueObjects/Email.ts
export class Email {
  constructor(private readonly value: string) {
    if (!this.isValidEmail(value)) {
      throw new DomainError('Invalid email format');
    }
  }

  isValid(): boolean {
    return this.isValidEmail(this.value);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Domain/Exceptions/DomainError.ts
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}
```

**Key Points:**
- ✅ No dependencies on outer layers
- ✅ Pure business logic
- ✅ Rich domain models with behavior
- ✅ Value objects for domain concepts
- ✅ Domain exceptions
- ❌ No framework or infrastructure code
- ❌ No database or external service dependencies

### 2. Application Services Layer

**Definition:** The layer containing application-specific business logic that orchestrates domain entities to accomplish use cases.

**Purpose:**
- Define application workflows
- Orchestrate domain entities
- Implement application-specific business rules
- Coordinate between domain and infrastructure (through interfaces)
- Handle use cases

**Characteristics:**
- **Depends only on Domain** (and interfaces for infrastructure)
- **Application-specific** - not reusable across applications
- **Orchestrates** domain entities and services
- **Defines interfaces** for what it needs from infrastructure
- **Single responsibility** - one service per use case

**Example:**

```typescript
// Application/Services/CreateUserService.ts - Application Services Layer
import { User, UserId, Email, DomainError } from '../../Domain/Entities/User';
import { IUserRepository } from './Interfaces/IUserRepository';
import { IEmailService } from './Interfaces/IEmailService';

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

export class CreateUserService {
  constructor(
    private userRepository: IUserRepository, // Interface, not implementation
    private emailService: IEmailService // Interface, not implementation
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

    // Use domain entity to create user (domain handles validation)
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
    await this.emailService.sendWelcomeEmail(user.getEmail().toString(), user.getName());

    // Return response
    return {
      userId: user.getId().toString(),
      email: user.getEmail().toString(),
      name: user.getName()
    };
  }
}

// Application/Interfaces/IUserRepository.ts - Interface defined in Application layer
import { User, UserId } from '../../Domain/Entities/User';

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  delete(id: UserId): Promise<void>;
}

// Application/Interfaces/IEmailService.ts
export interface IEmailService {
  sendWelcomeEmail(email: string, name: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string): Promise<void>;
}
```

**Key Points:**
- ✅ Depends only on Domain and interfaces
- ✅ Defines interfaces for infrastructure needs
- ✅ Orchestrates domain entities
- ✅ Application-specific business rules
- ✅ Single service per use case
- ❌ Should not contain domain logic (delegates to Domain)
- ❌ Should not know about infrastructure implementations

### 3. Infrastructure Layer

**Definition:** The layer that handles technical concerns and implements interfaces defined in inner layers.

**Purpose:**
- Implement repository interfaces
- Handle database operations
- Integrate with external services
- Provide framework-specific implementations
- Convert between domain models and infrastructure models

**Characteristics:**
- **Implements interfaces** from Application layer
- **Handles technical concerns** - databases, external APIs, frameworks
- **Depends on** Application Services and Domain
- **Converts data** between domain and infrastructure formats
- **Most volatile** - changes frequently

**Example:**

```typescript
// Infrastructure/Repositories/UserRepository.ts - Infrastructure Layer
import { User, UserId, Email } from '../../Domain/Entities/User';
import { IUserRepository } from '../../Application/Interfaces/IUserRepository';
import { Database } from '../Database/Database'; // Framework dependency

export class UserRepository implements IUserRepository {
  constructor(private db: Database) {}

  async save(user: User): Promise<void> {
    // Convert domain model to database model
    const userData = {
      id: user.getId().toString(),
      email: user.getEmail().toString(),
      name: user.getName(),
      passwordHash: user.getPasswordHash(), // Would need getter in User
      createdAt: user.getCreatedAt()
    };

    await this.db.users.insert(userData);
  }

  async findById(id: UserId): Promise<User | null> {
    const userData = await this.db.users.findById(id.toString());
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
    await this.db.users.delete(id.toString());
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

// Infrastructure/Services/EmailService.ts
import { IEmailService } from '../../Application/Interfaces/IEmailService';
import sgMail from '@sendgrid/mail'; // External library

export class EmailService implements IEmailService {
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

// Infrastructure/Database/Database.ts
import { Pool } from 'pg'; // External library

export class Database {
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
```

**Key Points:**
- ✅ Implements interfaces from Application layer
- ✅ Handles technical concerns
- ✅ Converts between domain and infrastructure formats
- ✅ Depends on Application Services and Domain
- ❌ Should not contain business logic
- ❌ Should not define domain concepts

### 4. Presentation Layer

**Definition:** The outermost layer responsible for user interface and API endpoints.

**Purpose:**
- Handle user input
- Display data to users
- Convert between external formats and application formats
- Route requests to application services
- Handle presentation concerns

**Characteristics:**
- **User interface** - web pages, APIs, CLI
- **Depends on** Application Services and Domain
- **Converts formats** - HTTP to application, application to HTTP
- **Thin layer** - minimal logic, delegates to application services
- **Framework-dependent** - uses web frameworks, UI libraries

**Example:**

```typescript
// Presentation/Controllers/UserController.ts - Presentation Layer
import { Request, Response } from 'express'; // Framework dependency
import { CreateUserService, CreateUserRequest } from '../../Application/Services/CreateUserService';

export class UserController {
  constructor(private createUserService: CreateUserService) {}

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      // Convert HTTP request to application input
      const request: CreateUserRequest = {
        email: req.body.email,
        name: req.body.name,
        birthDate: new Date(req.body.birthDate),
        password: req.body.password
      };

      // ⚠️ Note: In practice, validation should be in Application layer, not Presentation
      // See: [Validation in Onion Architecture](./2026-01-20-validation-in-onion-architecture.md)
      // Validate input format (not business rules)
      if (!request.email || !request.name || !request.birthDate || !request.password) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Call application service
      const response = await this.createUserService.execute(request);

      // Convert application output to HTTP response
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

// Presentation/Web/ExpressApp.ts
import express, { Express } from 'express';
import { UserController } from '../Controllers/UserController';

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
```

**Key Points:**
- ✅ Handles user interface concerns
- ✅ Converts between external and application formats
- ✅ Delegates to application services
- ✅ Depends on Application Services and Domain
- ❌ Should not contain business logic
- ❌ Should not handle data persistence directly

---

## 🔄 Onion Architecture vs Clean Architecture

### Similarities

**Both patterns share:**

✅ **Concentric Layers**
- Both use concentric circles/layers
- Domain/Entities at the center
- Infrastructure/Frameworks at the edges
- Same dependency direction (inward)

✅ **Dependency Inversion**
- Dependencies point inward
- Inner layers define interfaces
- Outer layers implement interfaces
- Same dependency rule

✅ **Independence from Frameworks**
- Domain doesn't depend on frameworks
- Business logic is framework-agnostic
- Can swap frameworks easily
- Same independence principles

✅ **Testability**
- Core can be tested without external dependencies
- Easy to mock infrastructure
- Fast unit tests
- Same testing benefits

✅ **Separation of Concerns**
- Clear layer responsibilities
- Business logic separated from infrastructure
- Presentation separated from business logic
- Same separation principles

### Key Differences

| Aspect | Onion Architecture | Clean Architecture |
|--------|-------------------|-------------------|
| **Origin** | Jeffrey Palermo (2008) | Robert C. Martin (2012) |
| **Focus** | Domain-Driven Design (DDD) | Use Cases and Application Logic |
| **Terminology** | Domain, Application Services, Infrastructure, Presentation | Entities, Use Cases, Interface Adapters, Frameworks |
| **Emphasis** | Rich domain models, Domain services | Use cases, Application services |
| **Layer Names** | Domain → Application → Infrastructure → Presentation | Entities → Use Cases → Interface Adapters → Frameworks |
| **DDD Integration** | Strong DDD focus | DDD compatible but not required |

### Layer Mapping

**Onion Architecture → Clean Architecture:**

```
Onion Architecture          Clean Architecture
─────────────────          ──────────────────
Domain Layer        →      Entities Layer
Application Services →     Use Cases Layer
Infrastructure      →      Interface Adapters (Gateways)
Presentation        →      Interface Adapters (Controllers) + Frameworks
```

**Note:** They're essentially the same pattern with different terminology and emphasis. Onion Architecture emphasizes DDD more strongly, while Clean Architecture emphasizes use cases more explicitly.

---

## 💡 When to Use

### Use Onion Architecture When:

✅ **Domain-Driven Design Projects**
- Rich domain models needed
- Complex business domains
- DDD principles important
- Example: Enterprise applications, Complex business systems

✅ **Long-Lived Applications**
- Applications that will evolve over years
- Need to adapt to changing requirements
- Technology stack may change
- Example: Enterprise applications, SaaS platforms

✅ **Complex Business Logic**
- Rich domain models
- Complex workflows
- Multiple business rules
- Example: Financial systems, E-commerce platforms, Healthcare systems

✅ **Need Framework Independence**
- Want to switch frameworks without rewriting business logic
- Need to support multiple frameworks
- Framework upgrades shouldn't break business logic
- Example: Supporting REST and GraphQL, switching databases

✅ **High Testability Requirements**
- Need to test business logic in isolation
- Fast unit tests without external dependencies
- Test business rules without database or UI
- Example: Critical business applications, Regulated industries

✅ **Multiple Teams Working on Same Codebase**
- Clear boundaries between layers
- Teams can work on different layers independently
- Reduced coupling and conflicts
- Example: Large organizations, Microservices

### Don't Use Onion Architecture When:

❌ **Simple CRUD Applications**
- Overhead not justified
- Straightforward data operations
- No complex business logic
- Example: Simple admin panels, Basic blogs

❌ **Prototypes or MVPs**
- Too much structure for early stages
- Can add complexity prematurely
- Focus on speed over structure
- Example: Startup MVPs, Proof of concepts

❌ **Very Small Applications**
- Over-engineering for small projects
- Simple layered architecture sufficient
- Not enough complexity to justify
- Example: Small utilities, Simple scripts

❌ **Tight Performance Requirements**
- Additional abstraction layers add overhead
- Direct framework usage may be faster
- Need to measure and evaluate
- Example: High-frequency trading, Real-time systems

❌ **Team Lacks DDD Experience**
- Requires understanding of DDD principles
- Can lead to over-engineering if misunderstood
- Need training and mentoring
- Example: Junior teams, Tight deadlines

---

## 🏛️ Complete Implementation Example

### File Structure

```
src/
├── Domain/                          # Domain Layer (Core)
│   ├── Entities/
│   │   ├── User.ts
│   │   └── Order.ts
│   ├── ValueObjects/
│   │   ├── UserId.ts
│   │   ├── Email.ts
│   │   └── Money.ts
│   ├── DomainServices/
│   │   └── UserDomainService.ts
│   └── Exceptions/
│       └── DomainError.ts
│
├── Application/                     # Application Services Layer
│   ├── Services/
│   │   ├── CreateUserService.ts
│   │   └── ProcessOrderService.ts
│   └── Interfaces/
│       ├── IUserRepository.ts
│       ├── IOrderRepository.ts
│       └── IEmailService.ts
│
├── Infrastructure/                  # Infrastructure Layer
│   ├── Repositories/
│   │   ├── UserRepository.ts
│   │   └── OrderRepository.ts
│   ├── Services/
│   │   └── EmailService.ts
│   └── Database/
│       └── Database.ts
│
└── Presentation/                    # Presentation Layer
    ├── Controllers/
    │   ├── UserController.ts
    │   └── OrderController.ts
    └── Web/
        └── ExpressApp.ts
```

### Composition Root

```typescript
// Presentation/Web/App.ts - Composition Root
import { Database } from '../../Infrastructure/Database/Database';
import { UserRepository } from '../../Infrastructure/Repositories/UserRepository';
import { EmailService } from '../../Infrastructure/Services/EmailService';
import { CreateUserService } from '../../Application/Services/CreateUserService';
import { UserController } from '../Controllers/UserController';
import { ExpressApp } from './ExpressApp';

// Create infrastructure instances
const db = new Database(process.env.DATABASE_URL!);
const emailService = new EmailService(process.env.SENDGRID_API_KEY!);

// Create repositories (infrastructure)
const userRepository = new UserRepository(db);

// Create application services
const createUserService = new CreateUserService(userRepository, emailService);

// Create controllers (presentation)
const userController = new UserController(createUserService);

// Wire up application
const app = new ExpressApp(userController);
app.start(3000);
```

---

## ⚠️ Common Pitfalls

### 1. Anemic Domain Model

**Problem:** Domain entities become data containers without behavior.

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
    private id: UserId,
    private email: Email,
    private name: string
  ) {
    this.validate();
  }

  changePassword(oldPassword: string, newPassword: string): void {
    // Business logic here
  }

  updateEmail(newEmail: Email): void {
    // Business logic here
  }
}
```

### 2. Leaking Infrastructure Concerns to Domain

**Problem:** Domain layer depends on infrastructure.

**❌ Wrong:**

```typescript
// ❌ Domain depends on infrastructure
import { Database } from '../../Infrastructure/Database/Database';

export class User {
  constructor(private db: Database) {} // ❌ Infrastructure dependency
}
```

**✅ Correct:**

```typescript
// ✅ Domain is independent
export class User {
  constructor(
    private id: UserId,
    private email: Email
  ) {} // ✅ No dependencies
}
```

### 3. Business Logic in Application Services Instead of Domain

**Problem:** Application services contain domain logic.

**❌ Wrong:**

```typescript
// ❌ Domain logic in application service
export class CreateUserService {
  async execute(request: CreateUserRequest): Promise<void> {
    // ❌ Domain logic in application service
    if (request.age < 18) {
      throw new Error('User must be at least 18');
    }
    // ...
  }
}
```

**✅ Correct:**

```typescript
// ✅ Domain logic in domain entity
export class CreateUserService {
  async execute(request: CreateUserRequest): Promise<void> {
    // ✅ Domain handles validation (business rules)
    // See: [Validation in Onion Architecture](./2026-01-20-validation-in-onion-architecture.md) for detailed validation placement
    const user = User.create(/* ... */); // Domain validates age
    await this.userRepository.save(user);
  }
}
```

---

## ✅ Best Practices

### 1. Rich Domain Models

✅ **Do:**
- Put business rules in domain entities
- Make entities behavior-rich
- Use value objects for domain concepts
- Keep domain independent

❌ **Don't:**
- Create anemic domain models
- Put business logic in application services
- Use primitives for domain concepts
- Add infrastructure dependencies to domain

### 2. Dependency Inversion

✅ **Do:**
- Define interfaces in inner layers
- Implement interfaces in outer layers
- Use dependency injection
- Keep dependencies pointing inward

❌ **Don't:**
- Create outward dependencies
- Skip interfaces
- Direct instantiation in inner layers
- Circular dependencies

### 3. Layer Boundaries

✅ **Do:**
- Respect layer boundaries
- Keep layers independent
- Use interfaces between layers
- Document layer responsibilities

❌ **Don't:**
- Violate layer boundaries
- Mix layer concerns
- Skip layers for convenience
- Create tight coupling

---

## 🔀 Onion Architecture vs Other Patterns

### Onion Architecture vs Clean Architecture

**Similarities:**
- Concentric layers
- Dependency inversion
- Framework independence
- Same core principles

**Differences:**
- **Onion:** Stronger DDD focus
- **Clean:** More explicit about use cases
- **Terminology:** Different layer names
- **Emphasis:** Domain vs Use Cases

**Note:** They're essentially the same pattern with different terminology.

### Onion Architecture vs Hexagonal Architecture

**Onion Architecture:**
- Concentric layers
- Domain at center
- Strong DDD focus
- Layer-based structure

**Hexagonal Architecture:**
- Ports and adapters
- Application core
- Less formal layering
- Adapter-based structure

**Key Difference:** Onion uses layers, Hexagonal uses ports/adapters.

### Onion Architecture vs Layered Architecture

**Onion Architecture:**
- Concentric layers
- Dependency inversion
- Domain at center
- Framework independent

**Layered Architecture:**
- Horizontal layers
- Traditional dependencies
- No dependency inversion
- Framework dependent

**Key Difference:** Dependency direction and framework independence.

---

## 🌍 Real-World Applications

### 1. E-Commerce Platform

**Domain:**
- Product, Order, Customer, Payment entities
- Rich domain models with business rules

**Application Services:**
- CreateOrderService, ProcessPaymentService
- Orchestrate domain entities

**Infrastructure:**
- PostgreSQL repository implementations
- Stripe payment integration
- Email service implementation

**Presentation:**
- REST API controllers
- GraphQL resolvers
- Admin panel

### 2. Banking System

**Domain:**
- Account, Transaction, Customer entities
- Complex business rules

**Application Services:**
- TransferMoneyService, WithdrawMoneyService
- Application workflows

**Infrastructure:**
- Database repositories
- External API integrations
- Message queue implementations

**Presentation:**
- Web banking API
- Mobile API
- Admin interface

---

## 📊 Benefits and Trade-offs

### Benefits

✅ **Domain-Driven Design**
- Strong DDD focus
- Rich domain models
- Business logic at center
- Domain experts can understand

✅ **Framework Independence**
- Domain doesn't depend on frameworks
- Can switch frameworks easily
- Framework upgrades don't break core
- Technology flexibility

✅ **Testability**
- Domain can be tested in isolation
- Fast unit tests
- Easy to mock dependencies
- High test coverage

✅ **Maintainability**
- Clear separation of concerns
- Easy to understand and modify
- Changes are localized
- Better code organization

### Trade-offs

❌ **Complexity**
- More layers and structure
- More files and directories
- Steeper learning curve
- Requires DDD knowledge

❌ **Overhead for Simple Apps**
- Too much structure for CRUD apps
- Additional indirection
- May be over-engineering
- More boilerplate

❌ **Performance Overhead**
- Additional abstraction layers
- More object creation
- May impact performance
- Usually negligible

---

## 🎓 Summary

### Key Takeaways

1. **Onion Architecture** organizes code into concentric layers with domain at center
2. **Four Layers:** Domain, Application Services, Infrastructure, Presentation
3. **Dependency Rule:** Dependencies point inward only
4. **Domain at Center** - most stable and important
5. **Strong DDD Focus** - emphasizes rich domain models
6. **Similar to Clean Architecture** - same principles, different terminology
7. **Framework Independent** - domain doesn't depend on frameworks
8. **Highly Testable** - core can be tested in isolation

### When to Use

✅ **Use Onion Architecture When:**
- Building DDD-focused applications
- Complex business logic
- Need framework independence
- High testability requirements
- Long-lived applications

❌ **Avoid Onion Architecture When:**
- Simple CRUD applications
- Prototypes or MVPs
- Very small applications
- Tight performance requirements
- Team lacks DDD experience

### Similarities to Clean Architecture

- **Same Core Principles:** Dependency inversion, concentric layers
- **Same Benefits:** Framework independence, testability
- **Same Structure:** Domain/Entities at center, infrastructure at edges
- **Different Emphasis:** Onion focuses on DDD, Clean on use cases
- **Different Terminology:** Layer names differ, concepts same

### Best Practices

- Use rich domain models
- Keep domain independent
- Define interfaces in inner layers
- Implement interfaces in outer layers
- Use dependency injection
- Respect layer boundaries
- Test domain in isolation

### Next Steps

After mastering Onion Architecture, consider:
- **Domain-Driven Design** - Deep dive into DDD
- **CQRS** - Separate read/write models
- **Event Sourcing** - Store events instead of state
- **Microservices** - Apply Onion Architecture to services

---

## 📚 Additional Resources

**Original Source:**
- Jeffrey Palermo - "Onion Architecture" blog series (2008)
- "The Onion Architecture" by Jeffrey Palermo

**Related Patterns:**
- Clean Architecture (Robert C. Martin)
- Hexagonal Architecture (Ports & Adapters)
- Domain-Driven Design (Eric Evans)
- Dependency Inversion Principle (SOLID)

**Related Topics:**
- [Validation in Onion Architecture](./2026-01-20-validation-in-onion-architecture.md) - **Essential guide** on where to place validation in each layer

**Books:**
- "Domain-Driven Design" by Eric Evans
- "Implementing Domain-Driven Design" by Vaughn Vernon
- "Clean Architecture" by Robert C. Martin

---

