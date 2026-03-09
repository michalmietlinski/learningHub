# Builder Pattern

## Overview

The Builder Pattern is a creational design pattern that **separates the construction of a complex object from its representation**, allowing the same construction process to create different representations.

**Also known as:** Fluent Builder (for fluent APIs), Step Builder (for guided construction).

## Core Problem Solved

- Avoids **telescoping constructors** (constructors with many parameters, especially optional ones)
- Makes object creation **readable and explicit**, especially when many combinations of parameters exist
- Allows you to **reuse the same construction steps** to build different representations

## Structure

```
Director (optional)
└── construct(builder): Product

Builder (Interface)
├── reset()
├── setPartA(...)
├── setPartB(...)
└── getResult(): Product

ConcreteBuilder
├── implements Builder
└── builds ConcreteProduct step-by-step

Product
└── complex object with many configuration options
```

### Participants

| Participant        | Role |
|--------------------|------|
| **Builder**        | Declares steps to build parts of the product |
| **ConcreteBuilder**| Implements steps and tracks the product under construction |
| **Director**       | (Optional) Calls builder methods in a specific sequence |
| **Product**        | Complex object being built |

## Common Use Cases

| Use Case | Example |
|----------|---------|
| Complex configuration objects | HTTP requests, database queries, UI components |
| Immutable objects | Value objects with many optional fields |
| Test data builders | Building rich test fixtures in unit tests |
| Object trees / documents | HTML builders, JSON/XML builders |
| Fluent APIs | Readable chained method calls for configuration |

## Variations

| Variation | Description |
|----------|-------------|
| **Fluent Builder** | Builder methods return `this` to allow chaining |
| **Step Builder** | Guides the order of calls using typed steps |
| **Immutable Builder** | Builder creates immutable products (no setters) |
| **Nested Builder** | Builder as a static inner class of Product |
| **Builder with Director** | Explicit Director orchestrates build steps |

## Builder vs Other Creational Patterns

| Pattern         | Difference |
|-----------------|------------|
| **Factory Method** | Decides **which** product to create, often simple construction |
| **Abstract Factory** | Creates **families of related** products |
| **Prototype**   | Creates objects by **cloning** existing instances |
| **Singleton**   | Ensures only **one instance** exists |

## Trade-offs

### ✅ Advantages

- **Readable construction** of complex objects
- **Avoids telescoping constructors** and long parameter lists
- Works well with **immutable products**
- Easy to create **different representations** with different builders
- Good for **incremental configuration** and **test data builders**

### ❌ Disadvantages

- **More boilerplate** (extra Builder types)
- Can be **overkill** for simple objects
- Director + multiple builders can make code harder to navigate

## When to Use vs When to Avoid

**Use when:**
- Objects have **many optional or related parameters**
- You want to **enforce a construction sequence** (required fields)
- Objects should be **immutable** after creation
- You need **readable, fluent configuration** APIs

**Avoid when:**
- Objects are simple with **few constructor parameters**
- A simple **Factory Method** or direct constructor is enough
- You don’t need incremental configuration

## Best Practices

1. **Name builders clearly** – `UserBuilder`, `HttpRequestBuilder`, etc.
2. Prefer **immutable products** – no public setters; only builder sets fields.
3. Use **fluent APIs** for readability: `builder.withName("Alice").withAge(30)`.
4. Consider **Step Builder** when some fields are mandatory and order matters.
5. Use builders heavily for **test data** to keep tests readable and DRY.

## Related Patterns

- **Factory Method** – often used internally by builders to create parts; factories can also return preconfigured builders
- **Abstract Factory** – can use builders to assemble more complex product trees
- **Prototype** – builder may clone prototypes and then customize
- **Director** – often a helper that coordinates construction using a builder

---

## 📚 References

### Lessons of the Day
- **[2025-12-16 - Builder Pattern](../../../../lessons-of-the-day/2025-12-16-builder-pattern.md)** – Full deep-dive with implementation examples, comparisons to telescoping constructors, and fluent/step builder variations

### Related Lessons
- [2025-12-14 - Factory Method Pattern](../../../../lessons-of-the-day/2025-12-14-factory-method-pattern.md)
- [2025-12-15 - Abstract Factory Pattern](../../../../lessons-of-the-day/2025-12-15-abstract-factory-pattern.md)
- [2025-12-16 - Prototype Pattern](../../../../lessons-of-the-day/2025-12-16-prototype-pattern.md)

