# Validation in Onion Architecture - Best Practices

## 📋 Learning Objectives

- [ ] Understand the distinction between input format validation and business rules validation
- [ ] Learn where validation should be placed in Onion Architecture layers
- [ ] Recognize the difference between syntactic and semantic validation
- [ ] Practice implementing validation at the correct architectural layer
- [ ] Understand trade-offs between different validation approaches

---

## 🎯 The Validation Problem

In Onion Architecture, validation can be confusing because there are different types of validation, and they should be placed in different layers. This document clarifies where each type belongs.

---

## 🔍 Types of Validation

### 1. Input Format Validation (Syntactic)

**What it checks:**
- Are required fields present?
- Are data types correct?
- Is the format valid (e.g., email format, date format)?

**Examples:**
- "Email field is missing"
- "Birth date must be a valid date"
- "Password must be at least 8 characters"

**Characteristics:**
- Technical/syntactic checks
- Not domain-specific
- Can be reused across different domains
- Often framework-agnostic

### 2. Business Rules Validation (Semantic)

**What it checks:**
- Does the data satisfy business rules?
- Are domain invariants maintained?
- Is the operation allowed in the current state?

**Examples:**
- "User must be at least 18 years old"
- "Email must be unique"
- "Order cannot be cancelled after shipping"
- "Account balance cannot be negative"

**Characteristics:**
- Domain-specific logic
- Business-critical
- Encodes business knowledge
- Must be in domain layer

---

## 🏗️ Where Validation Belongs in Onion Architecture

### Layer Responsibilities

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  ✅ HTTP concerns only (request/response mapping)           │
│  ❌ NO validation (even input format)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Infrastructure Layer                      │  │
│  │  ✅ Technical implementations                         │  │
│  │  ❌ NO validation                                      │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │         Application Services Layer                │  │  │
│  │  │  ✅ Input format validation (syntactic)            │  │  │
│  │  │  ✅ Orchestration and coordination                 │  │  │
│  │  │  ❌ Business rules (delegate to domain)            │  │  │
│  │  │  ┌───────────────────────────────────────────┐  │  │  │
│  │  │  │         Domain Layer (Core)                │  │  │  │
│  │  │  │  ✅ Business rules validation (semantic)    │  │  │  │
│  │  │  │  ✅ Domain invariants                        │  │  │  │
│  │  │  │  ✅ Entity creation rules                   │  │  │  │
│  │  │  └───────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## ❌ Anti-Pattern: Validation in Presentation Layer

### Example of What NOT to Do

```typescript
// Presentation/Controllers/UserController.ts
export class UserController {
  async createUser(req: Request, res: Response): Promise<void> {
    const request: CreateUserRequest = {
      email: req.body.email,
      name: req.body.name,
      birthDate: new Date(req.body.birthDate),
      password: req.body.password
    };

    // ❌ BAD: Input validation in Presentation layer
    if (!request.email || !request.name || !request.birthDate || !request.password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // ❌ BAD: Business rule validation in Presentation layer
    const age = this.calculateAge(request.birthDate);
    if (age < 18) {
      res.status(400).json({ error: 'User must be at least 18 years old' });
      return;
    }

    const response = await this.createUserService.execute(request);
    res.status(201).json(response);
  }
}
```

**Problems:**
1. **Not reusable** - If you add GraphQL, CLI, or gRPC, you duplicate validation
2. **Hard to test** - Requires HTTP framework for testing
3. **Violates separation** - Presentation should only handle HTTP concerns
4. **Business logic leakage** - Business rules in wrong layer

---

## ✅ Correct Approach: Validation in Application Layer

### Option 1: Application Layer Handles Input Format Validation

```typescript
// Presentation/Controllers/UserController.ts
export class UserController {
  constructor(private createUserService: CreateUserService) {}

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      // ✅ ONLY HTTP concerns - mapping request to DTO
      const request: CreateUserRequest = {
        email: req.body.email,
        name: req.body.name,
        birthDate: new Date(req.body.birthDate),
        password: req.body.password
      };

      // ✅ NO validation here - delegate to Application layer
      const response = await this.createUserService.execute(request);

      // ✅ ONLY HTTP concerns - mapping response to HTTP
      res.status(201).json({
        id: response.userId,
        email: response.email,
        name: response.name
      });
    } catch (error) {
      // ✅ Error handling (HTTP concern)
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof DomainError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}

// Application/Services/CreateUserService.ts
export class CreateUserService {
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // ✅ Input format validation in Application layer
    this.validateInputFormat(request);

    // ✅ Convert to domain types
    const userId = UserId.generate();
    const email = new Email(request.email);
    
    // ✅ Delegate business rules to Domain layer
    const user = User.create(
      userId,
      email,
      request.name,
      request.birthDate,
      request.password
    );

    // ✅ Orchestration
    await this.userRepository.save(user);
    await this.emailService.sendWelcomeEmail(email);

    return {
      userId: userId.toString(),
      email: email.toString(),
      name: user.getName()
    };
  }

  private validateInputFormat(request: CreateUserRequest): void {
    // ✅ Syntactic validation - reusable across all entry points
    if (!request.email || request.email.trim().length === 0) {
      throw new ValidationError('Email is required');
    }
    
    if (!request.name || request.name.trim().length === 0) {
      throw new ValidationError('Name is required');
    }
    
    if (!request.birthDate || isNaN(request.birthDate.getTime())) {
      throw new ValidationError('Valid birth date is required');
    }
    
    if (!request.password || request.password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    // ✅ Format validation (syntactic)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
      throw new ValidationError('Invalid email format');
    }
  }
}
```

**Benefits:**
- ✅ Reusable across REST, GraphQL, CLI, etc.
- ✅ Easy to unit test (no HTTP framework needed)
- ✅ Presentation layer stays thin
- ✅ Clear separation of concerns

---

## ✅ Best Practice: Domain Layer Handles Business Rules

```typescript
// Domain/ValueObjects/Email.ts
export class Email {
  constructor(private readonly value: string) {
    // ✅ Input format validation in value object
    if (!value || value.trim().length === 0) {
      throw new DomainError('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new DomainError('Invalid email format');
    }

    this.value = value.toLowerCase().trim();
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

// Domain/Entities/User.ts
export class User {
  private constructor(
    private id: UserId,
    private email: Email,
    private name: string,
    private birthDate: Date,
    private passwordHash: string
  ) {}

  static create(
    id: UserId,
    email: Email,
    name: string,
    birthDate: Date,
    password: string
  ): User {
    // ✅ Business rule validation in Domain layer
    if (!name || name.trim().length === 0) {
      throw new DomainError('Name is required');
    }

    if (name.trim().length < 2) {
      throw new DomainError('Name must be at least 2 characters');
    }

    // ✅ Business rule: Age validation
    const age = this.calculateAge(birthDate);
    if (age < 18) {
      throw new DomainError('User must be at least 18 years old');
    }

    if (age > 120) {
      throw new DomainError('Invalid age');
    }

    // ✅ Business rule: Password strength
    if (!password || password.length < 8) {
      throw new DomainError('Password must be at least 8 characters');
    }

    const passwordHash = this.hashPassword(password);
    return new User(id, email, name.trim(), birthDate, passwordHash);
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
    // Password hashing logic
    return `hashed_${password}`;
  }
}
```

**Benefits:**
- ✅ Business rules are encapsulated in domain
- ✅ Invariants are always enforced
- ✅ Domain is self-validating
- ✅ Cannot create invalid entities

---

## 📊 Validation Placement Summary

| Validation Type | Where It Belongs | Why |
|----------------|------------------|-----|
| **Input Format (Syntactic)** | Application Layer | Reusable, testable, framework-agnostic |
| **Business Rules (Semantic)** | Domain Layer | Encapsulates business knowledge, enforces invariants |
| **HTTP Concerns** | Presentation Layer | Request/response mapping, error formatting |
| **Technical Validation** | Infrastructure Layer | Database constraints, external API validation |

---

## 🎯 Recommended Validation Flow

### Complete Example

```typescript
// 1. Presentation Layer - ONLY HTTP mapping
export class UserController {
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const request: CreateUserRequest = {
        email: req.body.email,
        name: req.body.name,
        birthDate: new Date(req.body.birthDate),
        password: req.body.password
      };

      const response = await this.createUserService.execute(request);
      res.status(201).json(response);
    } catch (error) {
      this.handleError(error, res);
    }
  }
}

// 2. Application Layer - Input format validation
export class CreateUserService {
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // ✅ Syntactic validation
    this.validateInputFormat(request);

    // ✅ Convert to domain types (value objects validate themselves)
    const userId = UserId.generate();
    const email = new Email(request.email); // Email validates format

    // ✅ Domain handles business rules
    const user = User.create(
      userId,
      email,
      request.name,
      request.birthDate,
      request.password
    );

    // ✅ Check uniqueness (business rule - could be in domain service)
    // Note: Uniqueness checks often require infrastructure (database queries)
    // Consider using a Domain Service for complex business rules that need infrastructure
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new DomainError('Email already exists');
    }

    await this.userRepository.save(user);
    return { userId: userId.toString(), email: email.toString() };
  }

  private validateInputFormat(request: CreateUserRequest): void {
    if (!request.email?.trim()) throw new ValidationError('Email required');
    if (!request.name?.trim()) throw new ValidationError('Name required');
    if (!request.birthDate || isNaN(request.birthDate.getTime())) {
      throw new ValidationError('Valid birth date required');
    }
    if (!request.password) throw new ValidationError('Password required');
  }
}

// 3. Domain Layer - Business rules
export class User {
  static create(
    id: UserId,
    email: Email,
    name: string,
    birthDate: Date,
    password: string
  ): User {
    // ✅ Business rules
    if (name.trim().length < 2) {
      throw new DomainError('Name must be at least 2 characters');
    }

    const age = this.calculateAge(birthDate);
    if (age < 18) {
      throw new DomainError('User must be at least 18 years old');
    }

    if (password.length < 8) {
      throw new DomainError('Password must be at least 8 characters');
    }

    return new User(id, email, name.trim(), birthDate, this.hashPassword(password));
  }
}
```

---

## 🔄 Alternative: Domain-Driven Validation

### Using Value Objects for All Validation

```typescript
// Domain/ValueObjects/Email.ts
export class Email {
  constructor(private readonly value: string) {
    if (!value?.trim()) {
      throw new DomainError('Email is required');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new DomainError('Invalid email format');
    }
    
    this.value = value.toLowerCase().trim();
  }
}

// Domain/ValueObjects/Name.ts
export class Name {
  constructor(private readonly value: string) {
    if (!value?.trim()) {
      throw new DomainError('Name is required');
    }
    
    if (value.trim().length < 2) {
      throw new DomainError('Name must be at least 2 characters');
    }
    
    this.value = value.trim();
  }
}

// Domain/ValueObjects/Password.ts
export class Password {
  constructor(private readonly value: string) {
    if (!value) {
      throw new DomainError('Password is required');
    }
    
    if (value.length < 8) {
      throw new DomainError('Password must be at least 8 characters');
    }
    
    // Additional password strength rules...
    this.value = value;
  }
}

// Application Layer - Minimal validation, domain does the rest
export class CreateUserService {
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    // ✅ Convert to domain types - validation happens in constructors
    const userId = UserId.generate();
    const email = new Email(request.email);        // Validates format
    const name = new Name(request.name);            // Validates format
    const password = new Password(request.password); // Validates format
    const birthDate = new Date(request.birthDate);

    // ✅ Domain handles business rules
    const user = User.create(userId, email, name, birthDate, password);
    
    await this.userRepository.save(user);
    return { userId: userId.toString(), email: email.toString() };
  }
}
```

**Benefits:**
- ✅ All validation in domain (strongest encapsulation)
- ✅ Value objects are self-validating
- ✅ Impossible to create invalid values
- ✅ Application layer is very thin

---

## ⚖️ Trade-offs

### Application Layer Validation

**Pros:**
- Clear separation: syntactic vs semantic
- Can validate before creating domain objects
- Easier to provide user-friendly error messages

**Cons:**
- Some duplication if using value objects
- Two places to maintain validation rules

### Domain Layer Validation (Value Objects)

**Pros:**
- Single source of truth
- Impossible to have invalid values
- Strong encapsulation

**Cons:**
- All validation errors are domain errors (less granular)
- Harder to distinguish input format vs business rules

### Hybrid Approach (Recommended)

**Best of both worlds:**
- Application layer: Basic presence checks, type validation
- Domain layer (Value Objects): Format validation, business rules

---

## 🔧 Error Types

### ValidationError vs DomainError

**ValidationError:**
- Used for input format validation (syntactic)
- Thrown in Application layer
- Indicates user input problems
- Examples: "Email is required", "Invalid date format"

**DomainError:**
- Used for business rule validation (semantic)
- Thrown in Domain layer
- Indicates business rule violations
- Examples: "User must be at least 18 years old", "Email already exists"

**Example:**
```typescript
// Application Layer
if (!request.email?.trim()) {
  throw new ValidationError('Email is required'); // Input format issue
}

// Domain Layer
if (age < 18) {
  throw new DomainError('User must be at least 18 years old'); // Business rule
}
```

## 📝 Key Takeaways

1. **Presentation Layer**: NO validation - only HTTP concerns
2. **Application Layer**: Input format validation (syntactic) - throws `ValidationError`
3. **Domain Layer**: Business rules validation (semantic) - throws `DomainError`
4. **Value Objects**: Self-validating, enforce invariants
5. **Reusability**: Validation in Application/Domain layers can be reused across all entry points
6. **Error Types**: Use `ValidationError` for input issues, `DomainError` for business rules

---

## 🎓 Related Topics

- [Onion Architecture](./2026-01-19-onion-architecture.md) - Full architecture overview
- [Clean Architecture](./2026-01-15-clean-architecture.md) - Similar validation principles
- [Domain-Driven Design](../subjects/architectural-patterns/ddd/README.md) - Value objects and entities
- [Single Responsibility Principle](./2026-01-08-single-responsibility-principle.md) - Each layer has one responsibility

---

## 📚 References

- Onion Architecture by Jeffrey Palermo
- Clean Architecture by Robert C. Martin
- Domain-Driven Design by Eric Evans

