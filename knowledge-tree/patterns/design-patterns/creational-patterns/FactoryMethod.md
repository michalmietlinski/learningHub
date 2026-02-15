# Factory Method Pattern

## Overview

The Factory Method Pattern is a creational design pattern that provides an interface for creating objects in a superclass, but allows **subclasses to alter the type** of objects that will be created.

**Also known as:** Virtual Constructor

## Core Problem Solved

- Define an interface for creating an object, but let subclasses decide which class to instantiate
- Class defers instantiation to subclasses
- "Don't call us, we'll call you" - framework calls your factory method when it needs an object

## Structure

```
Creator (Abstract)
├── factoryMethod(): Product (abstract)
└── someOperation(): void

ConcreteCreatorA
└── factoryMethod(): ConcreteProductA

ConcreteCreatorB
└── factoryMethod(): ConcreteProductB

Product (Interface)
├── ConcreteProductA
└── ConcreteProductB
```

### Participants

| Participant | Role |
|-------------|------|
| **Product** | Interface of objects the factory method creates |
| **ConcreteProduct** | Implements the Product interface |
| **Creator** | Declares the factory method returning Product |
| **ConcreteCreator** | Overrides factory method to return ConcreteProduct |

## Common Use Cases

| Use Case | Example |
|----------|---------|
| Framework extension | Users define their own components |
| Cross-platform UI | Different buttons/dialogs per OS |
| Database connections | MySQL, PostgreSQL, MongoDB factories |
| Notification systems | Email, SMS, Push notification creators |
| Document processing | PDF, Word, Spreadsheet handlers |

## Variations

| Variation | Description |
|-----------|-------------|
| **Parameterized** | Factory accepts parameters to determine product type |
| **Lazy Initialization** | Products created only when needed |
| **Default Implementation** | Base creator provides default, subclasses override |
| **Static Factory** | Factory method is static (class method) |
| **Registry Pattern** | Products registered dynamically at runtime |

## Factory Method vs Other Patterns

| Pattern | Difference |
|---------|------------|
| **Simple Factory** | No inheritance, single class with switch statement |
| **Abstract Factory** | Creates families of related products (multiple methods) |
| **Builder** | Focuses on HOW to construct complex objects step-by-step |
| **Prototype** | Creates by cloning existing instances |

## Trade-offs

### ✅ Advantages
- **Single Responsibility** - Product creation code isolated
- **Open/Closed Principle** - Add new products without modifying existing code
- **Eliminates tight coupling** - Client works with abstractions
- **Testability** - Easy to mock products for testing
- **Flexibility** - Easy to change which products are created

### ❌ Disadvantages
- **Code complexity** - Requires many new subclasses
- **Can be overkill** - For simple creation, use direct instantiation
- **Inheritance-based** - If you prefer composition, consider Abstract Factory
- **Indirection** - Can make code harder to follow

## When to Use vs When to Avoid

**Use when:**
- You don't know exact types beforehand
- Framework/library needs user extension
- Want to localize object creation logic
- Need resource reuse (connection pooling)

**Avoid when:**
- Simple object creation (always know the type)
- Need families of related objects (use Abstract Factory)
- Object creation is straightforward

## Best Practices

1. **Use meaningful names** - `createTransport()` not `create()`
2. **Keep factory methods simple** - focused on creation only
3. **Use template methods** - hide factory method from clients
4. **Handle errors gracefully** - proper exception handling
5. **Document factory methods** - clear JSDoc/comments

## Related Patterns

- **Abstract Factory** - Often uses Factory Methods internally
- **Template Method** - Often works hand-in-hand with Factory Method
- **Builder** - Alternative for complex object construction
- **Prototype** - Alternative using cloning instead of inheritance

---

## 📚 References

### Lessons of the Day
- **[2025-12-14 - Factory Method Pattern](../../../lessons-of-the-day/2025-12-14-factory-method-pattern.md)** - Comprehensive deep-dive with 6 implementation examples (JS/TS/Python/Java), real-world examples (React, jQuery, Node.js, Express), variations, and best practices

### Related Lessons
- [2025-12-15 - Abstract Factory Pattern](../../../lessons-of-the-day/2025-12-15-abstract-factory-pattern.md) - Creates families of related products
- [2025-12-13 - Patterns & Architectures Overview](../../../lessons-of-the-day/2025-12-13-patterns-architectures.md)

