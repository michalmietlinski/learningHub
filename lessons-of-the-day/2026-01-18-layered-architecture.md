# Layered Architecture - Deep Dive

## 📋 Learning Objectives

- [ ] Understand Layered Architecture definition and principles
- [ ] Learn the traditional 3-layer architecture: Presentation, Business, Data
- [ ] Master the N-tier architecture variations
- [ ] Recognize when to use Layered Architecture vs other patterns
- [ ] Understand the separation of concerns across layers
- [ ] Practice implementing Layered Architecture in real scenarios
- [ ] Learn testing strategies for each layer
- [ ] Explore real-world applications and use cases
- [ ] Understand common pitfalls and best practices
- [ ] Compare with Clean Architecture, Hexagonal Architecture, and MVC

---

## 🎯 Definition

**Layered Architecture** (also known as **N-tier Architecture** or **Multi-tier Architecture**) is an architectural pattern that organizes code into horizontal layers, each with specific responsibilities. Each layer provides services to the layer above it and uses services from the layer below it.

**Origin:**
- Traditional architecture pattern used since the early days of software development
- Widely adopted in enterprise applications
- Foundation for many modern architectural patterns

**Key Principles:**
- **Separation of Concerns** - Each layer has a specific responsibility
- **Layered Structure** - Code organized into horizontal layers
- **Dependency Direction** - Upper layers depend on lower layers
- **Abstraction** - Each layer abstracts the complexity of layers below
- **Modularity** - Layers can be developed and maintained independently

**Key Principle:**
> "Layered Architecture organizes code into horizontal layers where each layer provides services to the layer above and uses services from the layer below. This creates a clear separation of concerns and makes the system easier to understand and maintain."

**Alternative Formulation:**
> "Each layer in the architecture has a specific role: Presentation handles user interaction, Business contains business logic, and Data manages persistence. Layers communicate through well-defined interfaces."

---

## 🏗️ Structure

### Traditional 3-Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Presentation Layer (UI)                     │
│  (Web, Desktop, Mobile, API Controllers)                │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Business Logic Layer                        │
│  (Services, Domain Logic, Business Rules)               │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Data Access Layer                           │
│  (Repositories, DAOs, Database Connections)             │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Database                                    │
│  (PostgreSQL, MySQL, MongoDB, etc.)                     │
└─────────────────────────────────────────────────────────┘
```

### Layer Descriptions

**1. Presentation Layer (UI Layer)**
- Topmost layer
- Handles user interaction
- Displays data to users
- Collects user input
- Examples: Web pages, REST controllers, Desktop UI, Mobile apps

**2. Business Logic Layer (Service Layer)**
- Middle layer
- Contains business rules and logic
- Orchestrates data flow
- Validates business rules
- Examples: Service classes, Business logic, Domain services

**3. Data Access Layer (DAL)**
- Bottom layer
- Handles data persistence
- Abstracts database operations
- Manages database connections
- Examples: Repositories, DAOs, ORM mappings

**4. Database**
- External storage
- Not part of application code
- Stores persistent data

### N-Tier Architecture Variations

**2-Tier (Client-Server):**
- Presentation + Business Logic (Client)
- Database (Server)

**3-Tier:**
- Presentation
- Business Logic
- Data Access + Database

**4-Tier:**
- Presentation
- Business Logic
- Data Access
- Database

**N-Tier:**
- Can have additional layers like:
  - API Gateway Layer
  - Integration Layer
  - Caching Layer
  - Message Queue Layer

---

## 🔍 Core Concepts Deep Dive

### 1. Presentation Layer

**Definition:** The topmost layer responsible for user interaction and data presentation.

**Purpose:**
- Handle user input
- Display data to users
- Format data for presentation
- Validate input format (not business rules)
- Route requests to business layer

**Characteristics:**
- **Thin layer** - minimal logic
- **Format conversion** - converts between UI format and business format
- **Input validation** - format validation, not business validation
- **User experience** - handles UI/UX concerns

**Example:**

```typescript
// Presentation/Controllers/UserController.ts
import { Request, Response } from 'express';
import { UserService } from '../Business/UserService';

export class UserController {
  constructor(private userService: UserService) {}

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      // Input format validation
      if (!req.body.email || !req.body.name) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Call business layer
      const user = await this.userService.createUser({
        email: req.body.email,
        name: req.body.name,
        password: req.body.password
      });

      // Format response
      res.status(201).json({
        id: user.id,
        email: user.email,
        name: user.name
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.getUserById(req.params.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

**Key Points:**
- ✅ Handles HTTP concerns
- ✅ Converts between HTTP and business formats
- ✅ Validates input format
- ✅ Delegates business logic to service layer
- ❌ Should not contain business rules

### 2. Business Logic Layer

**Definition:** The middle layer containing business rules, validation, and orchestration logic.

**Purpose:**
- Implement business rules
- Validate business constraints
- Orchestrate operations
- Coordinate between presentation and data layers
- Handle business workflows

**Characteristics:**
- **Business rules** - core business logic
- **Validation** - business rule validation
- **Orchestration** - coordinates operations
- **Domain logic** - domain-specific operations

**Example:**

```typescript
// Business/Services/UserService.ts
import { UserRepository } from '../Data/UserRepository';
import { EmailService } from './EmailService';

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export class UserService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  async createUser(request: CreateUserRequest): Promise<User> {
    // Business rule: Email must be unique
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Business rule: Password must meet requirements
    if (request.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Business rule: Email must be valid format
    if (!this.isValidEmail(request.email)) {
      throw new Error('Invalid email format');
    }

    // Create user
    const user = {
      id: this.generateUserId(),
      email: request.email,
      name: request.name,
      passwordHash: this.hashPassword(request.password),
      createdAt: new Date()
    };

    // Persist user
    await this.userRepository.save(user);

    // Business rule: Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.name);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    };
  }

  async updateUser(id: string, updates: Partial<CreateUserRequest>): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Business rule: If email is being updated, check uniqueness
    if (updates.email && updates.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(updates.email);
      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    // Update user
    const updatedUser = {
      ...user,
      ...updates,
      email: updates.email || user.email,
      name: updates.name || user.name
    };

    await this.userRepository.update(id, updatedUser);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      createdAt: updatedUser.createdAt
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private hashPassword(password: string): string {
    // Simplified - use proper hashing in production
    return `hashed_${password}`;
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

**Key Points:**
- ✅ Contains business rules
- ✅ Validates business constraints
- ✅ Orchestrates operations
- ✅ Coordinates between layers
- ❌ Should not handle data access directly
- ❌ Should not handle presentation concerns

### 3. Data Access Layer

**Definition:** The bottom layer responsible for data persistence and retrieval.

**Purpose:**
- Abstract database operations
- Handle data persistence
- Manage database connections
- Convert between database and business formats
- Provide data access interfaces

**Characteristics:**
- **Data abstraction** - hides database details
- **CRUD operations** - Create, Read, Update, Delete
- **Connection management** - manages database connections
- **Data mapping** - converts between formats

**Example:**

```typescript
// Data/Repositories/UserRepository.ts
import { Pool } from 'pg';

export interface UserData {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}

export class UserRepository {
  constructor(private db: Pool) {}

  async save(user: UserData): Promise<void> {
    const query = `
      INSERT INTO users (id, email, name, password_hash, created_at)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await this.db.query(query, [
      user.id,
      user.email,
      user.name,
      user.passwordHash,
      user.createdAt
    ]);
  }

  async findById(id: string): Promise<UserData | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await this.db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  async findByEmail(email: string): Promise<UserData | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.db.query(query, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]);
  }

  async update(id: string, user: Partial<UserData>): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (user.email) {
      updates.push(`email = $${paramIndex++}`);
      values.push(user.email);
    }
    if (user.name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(user.name);
    }
    if (user.passwordHash) {
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(user.passwordHash);
    }

    if (updates.length === 0) {
      return;
    }

    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`;
    await this.db.query(query, values);
  }

  async delete(id: string): Promise<void> {
    const query = 'DELETE FROM users WHERE id = $1';
    await this.db.query(query, [id]);
  }

  private mapRowToUser(row: any): UserData {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      passwordHash: row.password_hash,
      createdAt: row.created_at
    };
  }
}
```

**Key Points:**
- ✅ Abstracts database operations
- ✅ Handles data persistence
- ✅ Manages database connections
- ✅ Converts between formats
- ❌ Should not contain business logic
- ❌ Should not handle presentation concerns

---

## 💡 When to Use

### Use Layered Architecture When:

✅ **Traditional Enterprise Applications**
- Well-established pattern
- Easy to understand
- Good for teams familiar with it
- Example: Enterprise CRUD applications

✅ **Simple to Moderate Complexity**
- Straightforward data flow
- Clear separation of concerns
- Not too many cross-cutting concerns
- Example: Content management systems, Admin panels

✅ **Team Familiarity**
- Team understands the pattern
- Quick to implement
- Less learning curve
- Example: Teams transitioning from monolithic apps

✅ **Rapid Development**
- Fast to set up
- Clear structure
- Good for MVPs
- Example: Startup applications, prototypes

✅ **Standard CRUD Operations**
- Simple data operations
- Clear request-response flow
- Straightforward business logic
- Example: Basic web applications

### Don't Use Layered Architecture When:

❌ **Complex Business Logic**
- Rich domain models needed
- Complex workflows
- Better suited for Clean Architecture or DDD
- Example: Financial systems, Healthcare systems

❌ **Need Framework Independence**
- Want to switch frameworks easily
- Need to support multiple interfaces
- Better suited for Clean/Hexagonal Architecture
- Example: Multi-platform applications

❌ **High Testability Requirements**
- Need to test business logic in isolation
- Want fast unit tests
- Better suited for Clean Architecture
- Example: Critical business applications

❌ **Microservices Architecture**
- Need service independence
- Better suited for service-oriented patterns
- Example: Distributed systems

---

## 🏛️ Architecture Patterns

### Request Flow

```
User Request
    │
    ▼
Presentation Layer (Controller)
    │
    ▼
Business Logic Layer (Service)
    │
    ▼
Data Access Layer (Repository)
    │
    ▼
Database
```

### Response Flow

```
Database
    │
    ▼
Data Access Layer (Repository)
    │
    ▼
Business Logic Layer (Service)
    │
    ▼
Presentation Layer (Controller)
    │
    ▼
User Response
```

---

## 📚 Implementation Examples

### Complete Example: User Management System

#### File Structure

```
src/
├── Presentation/
│   ├── Controllers/
│   │   └── UserController.ts
│   └── DTOs/
│       └── UserDTO.ts
│
├── Business/
│   ├── Services/
│   │   ├── UserService.ts
│   │   └── EmailService.ts
│   └── Models/
│       └── User.ts
│
└── Data/
    ├── Repositories/
    │   └── UserRepository.ts
    └── Database/
        └── DatabaseConnection.ts
```

#### Complete Implementation

```typescript
// Presentation/DTOs/UserDTO.ts
export interface CreateUserDTO {
  email: string;
  name: string;
  password: string;
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// Business/Models/User.ts
export class User {
  constructor(
    public id: string,
    public email: string,
    public name: string,
    public passwordHash: string,
    public createdAt: Date
  ) {}
}

// Data/Database/DatabaseConnection.ts
import { Pool } from 'pg';

export class DatabaseConnection {
  private static pool: Pool;

  static initialize(connectionString: string): void {
    this.pool = new Pool({ connectionString });
  }

  static getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }
    return this.pool;
  }
}

// Main application setup
import express from 'express';
import { DatabaseConnection } from './Data/Database/DatabaseConnection';
import { UserRepository } from './Data/Repositories/UserRepository';
import { UserService } from './Business/Services/UserService';
import { UserController } from './Presentation/Controllers/UserController';

// Initialize database
DatabaseConnection.initialize(process.env.DATABASE_URL!);

// Create layers (bottom to top)
const userRepository = new UserRepository(DatabaseConnection.getPool());
const emailService = new EmailService(); // Simplified
const userService = new UserService(userRepository, emailService);
const userController = new UserController(userService);

// Setup Express
const app = express();
app.use(express.json());

app.post('/users', (req, res) => userController.createUser(req, res));
app.get('/users/:id', (req, res) => userController.getUser(req, res));

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

---

## ⚠️ Common Pitfalls

### 1. Anemic Domain Model

**Problem:** Business layer becomes just data transfer without behavior.

**❌ Wrong:**

```typescript
// ❌ Anemic - just data transfer
export class UserService {
  async createUser(data: any): Promise<any> {
    return await this.userRepository.save(data); // No business logic
  }
}
```

**✅ Correct:**

```typescript
// ✅ Rich business logic
export class UserService {
  async createUser(request: CreateUserRequest): Promise<User> {
    // Business rules
    await this.validateEmailUniqueness(request.email);
    this.validatePasswordStrength(request.password);
    
    // Business logic
    const user = this.createUserEntity(request);
    await this.userRepository.save(user);
    await this.sendWelcomeEmail(user);
    
    return user;
  }
}
```

### 2. Leaking Database Concerns to Business Layer

**Problem:** Business layer knows about database details.

**❌ Wrong:**

```typescript
// ❌ Business layer knows about SQL
export class UserService {
  async getUsers(): Promise<User[]> {
    const query = 'SELECT * FROM users WHERE active = true'; // ❌ SQL in business layer
    return await this.db.query(query);
  }
}
```

**✅ Correct:**

```typescript
// ✅ Business layer uses repository interface
export class UserService {
  async getUsers(): Promise<User[]> {
    return await this.userRepository.findActive(); // ✅ Repository method
  }
}
```

### 3. Business Logic in Presentation Layer

**Problem:** Controllers contain business rules.

**❌ Wrong:**

```typescript
// ❌ Business logic in controller
export class UserController {
  async createUser(req: Request, res: Response): Promise<void> {
    // ❌ Business rule in presentation layer
    if (req.body.email.includes('@company.com')) {
      req.body.role = 'employee';
    }
    await this.userRepository.save(req.body);
  }
}
```

**✅ Correct:**

```typescript
// ✅ Business logic in service layer
export class UserController {
  async createUser(req: Request, res: Response): Promise<void> {
    const user = await this.userService.createUser(req.body); // ✅ Delegates to service
    res.json(user);
  }
}
```

### 4. Tight Coupling Between Layers

**Problem:** Layers directly depend on concrete implementations.

**❌ Wrong:**

```typescript
// ❌ Tight coupling
export class UserService {
  private repository = new UserRepository(); // ❌ Direct instantiation
}
```

**✅ Correct:**

```typescript
// ✅ Dependency injection
export class UserService {
  constructor(private repository: UserRepository) {} // ✅ Injected dependency
}
```

### 5. Circular Dependencies

**Problem:** Layers depend on each other.

**❌ Wrong:**

```typescript
// ❌ Circular dependency
// Business layer imports from Presentation
import { UserController } from '../Presentation/UserController';
```

**✅ Correct:**

```typescript
// ✅ Dependencies flow downward
// Presentation → Business → Data
// No upward dependencies
```

---

## ✅ Best Practices

### 1. Clear Layer Boundaries

✅ **Do:**
- Define clear responsibilities for each layer
- Use interfaces between layers
- Enforce layer boundaries
- Document layer responsibilities

❌ **Don't:**
- Mix layer concerns
- Skip layers for "convenience"
- Create circular dependencies
- Violate layer boundaries

### 2. Dependency Direction

✅ **Do:**
- Dependencies flow downward (Presentation → Business → Data)
- Use dependency injection
- Program to interfaces
- Keep layers independent

❌ **Don't:**
- Create upward dependencies
- Direct instantiation in layers
- Tight coupling
- Circular dependencies

### 3. Business Logic Location

✅ **Do:**
- Put business rules in Business layer
- Keep presentation layer thin
- Keep data layer focused on persistence
- Validate business rules in service layer

❌ **Don't:**
- Put business logic in controllers
- Put business logic in repositories
- Duplicate business rules
- Skip business validation

### 4. Data Transfer Objects (DTOs)

✅ **Do:**
- Use DTOs between layers
- Convert between layer formats
- Keep DTOs simple
- Separate DTOs from domain models

❌ **Don't:**
- Pass database entities to presentation
- Expose internal models
- Mix concerns in DTOs
- Skip data conversion

### 5. Error Handling

✅ **Do:**
- Handle errors at appropriate layers
- Convert errors to appropriate format
- Log errors appropriately
- Return meaningful error messages

❌ **Don't:**
- Let database errors leak to presentation
- Expose internal error details
- Ignore errors
- Mix error handling concerns

---

## 🔀 Layered Architecture vs Other Patterns

### Layered Architecture vs Clean Architecture

**Layered Architecture:**
- Horizontal layers
- Dependencies can be bidirectional
- Framework-dependent
- Simpler structure
- Traditional approach

**Clean Architecture:**
- Concentric circles
- Dependencies point inward only
- Framework-independent
- More structured
- Modern approach

**Key Difference:** Dependency direction and framework independence.

### Layered Architecture vs MVC

**Layered Architecture:**
- 3+ layers (Presentation, Business, Data)
- More structure
- Better for complex applications
- Clear separation

**MVC:**
- 3 components (Model, View, Controller)
- Simpler structure
- Better for UI-focused applications
- Less formal separation

**Key Difference:** Layered Architecture has explicit business and data layers.

### Layered Architecture vs Hexagonal Architecture

**Layered Architecture:**
- Horizontal layers
- Traditional dependency flow
- Framework-dependent
- Simpler concept

**Hexagonal Architecture:**
- Ports and adapters
- Dependency inversion
- Framework-independent
- More flexible

**Key Difference:** Hexagonal Architecture uses dependency inversion.

---

## 🌍 Real-World Applications

### 1. Enterprise Web Applications

**Layers:**
- Presentation: Web controllers, REST APIs
- Business: Service classes, business logic
- Data: Repositories, ORM

**Example:** Enterprise resource planning (ERP) systems

### 2. Content Management Systems

**Layers:**
- Presentation: Admin UI, Public website
- Business: Content services, workflow logic
- Data: Content repositories, file storage

**Example:** WordPress, Drupal

### 3. E-Commerce Platforms

**Layers:**
- Presentation: Web storefront, Admin panel
- Business: Order processing, Payment logic
- Data: Product repositories, Order repositories

**Example:** Traditional e-commerce sites

### 4. Banking Applications

**Layers:**
- Presentation: Web banking, Mobile apps
- Business: Transaction services, Account logic
- Data: Account repositories, Transaction repositories

**Example:** Traditional banking systems

---

## 📊 Benefits and Trade-offs

### Benefits

✅ **Simplicity**
- Easy to understand
- Clear structure
- Familiar pattern
- Quick to implement

✅ **Separation of Concerns**
- Clear layer responsibilities
- Easy to locate code
- Better organization
- Maintainable structure

✅ **Team Collaboration**
- Teams can work on different layers
- Clear boundaries
- Less conflicts
- Parallel development

✅ **Testability**
- Can test layers independently
- Mock dependencies easily
- Clear test boundaries
- Isolated testing

### Trade-offs

❌ **Tight Coupling Risk**
- Layers can become tightly coupled
- Hard to change implementations
- Framework dependency
- Less flexible

❌ **Anemic Domain Model**
- Business logic can become anemic
- Data transfer objects instead of rich models
- Less domain-driven
- Business rules scattered

❌ **Performance Overhead**
- Multiple layer transitions
- Data conversion overhead
- Additional abstraction
- May impact performance

❌ **Framework Dependency**
- Hard to switch frameworks
- Business logic tied to frameworks
- Less portable
- Technology lock-in

---

## 🎓 Summary

### Key Takeaways

1. **Layered Architecture** organizes code into horizontal layers
2. **Three Main Layers:** Presentation, Business Logic, Data Access
3. **Dependency Flow:** Upper layers depend on lower layers
4. **Separation of Concerns:** Each layer has specific responsibilities
5. **Simple Structure:** Easy to understand and implement
6. **Traditional Pattern:** Widely used in enterprise applications
7. **Clear Boundaries:** Well-defined layer responsibilities
8. **Team Collaboration:** Teams can work on different layers

### When to Use

✅ **Use Layered Architecture When:**
- Building traditional enterprise applications
- Simple to moderate complexity
- Team is familiar with the pattern
- Need rapid development
- Standard CRUD operations

❌ **Avoid Layered Architecture When:**
- Complex business logic (use Clean Architecture)
- Need framework independence (use Hexagonal Architecture)
- High testability requirements (use Clean Architecture)
- Microservices architecture (use service-oriented patterns)

### Best Practices

- Keep clear layer boundaries
- Dependencies flow downward
- Put business logic in Business layer
- Use DTOs between layers
- Handle errors appropriately
- Use dependency injection
- Avoid circular dependencies
- Keep presentation layer thin

### Next Steps

After mastering Layered Architecture, consider:
- **Clean Architecture** - For more structure and independence
- **Hexagonal Architecture** - For dependency inversion
- **Domain-Driven Design** - For rich domain models
- **CQRS** - For separating read and write operations
- **Microservices** - For distributed systems

---

## 📚 Additional Resources

**Related Patterns:**
- Clean Architecture
- Hexagonal Architecture (Ports & Adapters)
- MVC (Model-View-Controller)
- MVVM (Model-View-ViewModel)
- N-Tier Architecture

**Implementation Examples:**
- Spring Framework (Java) - Built-in layered structure
- ASP.NET MVC (C#) - Traditional layered approach
- Django (Python) - Follows layered pattern
- Express.js (Node.js) - Can be structured in layers

**Books:**
- "Patterns of Enterprise Application Architecture" by Martin Fowler
- "Enterprise Application Architecture" by Martin Fowler
- "Clean Architecture" by Robert C. Martin

---

