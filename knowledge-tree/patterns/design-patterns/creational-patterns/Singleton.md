# Singleton Pattern

## Overview

The Singleton Pattern is a creational design pattern that ensures a class has **only one instance** and provides a **global point of access** to that instance.

## Core Problem Solved

1. **Ensure single instance** - Prevents multiple instances of a class from being created
2. **Provide global access** - Offers a single, well-known access point to that instance

## Common Use Cases

| Use Case | Example |
|----------|---------|
| Database Connections | Managing a single connection pool |
| Logger Instances | Centralized logging throughout an application |
| Configuration Managers | Single source of truth for application settings |
| Cache Managers | Shared cache across the application |
| Thread Pools | Managing a limited set of worker threads |

## Quick Reference

```
┌─────────────────────────────┐
│         Singleton           │
├─────────────────────────────┤
│ - static instance           │
│ - private constructor()     │
├─────────────────────────────┤
│ + static getInstance()      │
│ + businessMethod()          │
└─────────────────────────────┘
```

## Implementation Approaches Summary

| Approach | Thread-Safe | Lazy Init | Complexity |
|----------|-------------|-----------|------------|
| Eager Initialization | ✅ | ❌ | Low |
| Lazy Initialization | ❌ | ✅ | Low |
| Synchronized | ✅ | ✅ | Medium |
| Double-Checked Locking | ✅ | ✅ | High |
| Bill Pugh (Holder) | ✅ | ✅ | Low |
| Enum (Java) | ✅ | ✅ | Lowest |
| Module Pattern (JS) | ✅ | ✅ | Lowest |

## Trade-offs

### ✅ Benefits
- Controlled access - Only one instance can exist
- Lazy initialization - Instance created only when needed
- Global state management - Shared state across the application
- Resource efficiency - Avoids creating multiple expensive objects

### ❌ Drawbacks
- Global state - Can make code harder to test and reason about
- Hidden dependencies - Makes dependencies less explicit
- Thread safety concerns - Requires careful implementation
- Violates Single Responsibility Principle
- Difficult to test and mock

## When to Use vs When to Avoid

**Use when:**
- You need exactly one instance of a class
- The instance needs global access
- Managing shared resources (database, cache)

**Avoid when:**
- You need multiple instances
- You want to test with mocks easily
- You're building a library
- Following dependency injection principles

## Related Patterns

- **Factory Method** - Can be used together for controlled creation
- **Abstract Factory** - Often implemented as singletons
- **Dependency Injection** - Better alternative for testability

---

## 📚 References

### Lessons of the Day
- **[2025-12-13 - Singleton Pattern](../../../lessons-of-the-day/2025-12-13-singleton-pattern.md)** - Comprehensive deep-dive with implementation examples in multiple languages, real-world scenarios, and testing strategies

### Related Lessons
- [2025-12-13 - Patterns & Architectures Overview](../../../lessons-of-the-day/2025-12-13-patterns-architectures.md)
- [2025-01-15 - Clean Architecture](../../../lessons-of-the-day/2026-01-15-clean-architecture.md) - Mentions singleton in context of dependency management

