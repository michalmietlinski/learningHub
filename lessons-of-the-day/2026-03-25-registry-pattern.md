# Registry Pattern (PoEAA Base Pattern)

## 📋 Learning Objectives

- [ ] Understand the Registry base pattern and why centralized lookup exists
- [ ] Learn how Registry decouples clients from object/service creation and wiring
- [ ] Distinguish Registry from DI containers, service locators, and global variables
- [ ] Know when Registry is helpful vs when it harms testability and clarity
- [ ] Apply best practices and avoid common pitfalls

---

## 🎯 Definition

The **Registry** (in PoEAA base patterns) is a centralized object that stores and provides access to commonly used objects or services by key/name/type. Instead of passing references everywhere or creating objects repeatedly, code asks the registry for what it needs.

Registry is useful when many parts of the application need access to shared collaborators (e.g., configuration, gateways, factories, app services) and explicit wiring would otherwise be verbose.

**Origin:**
- Martin Fowler, *Patterns of Enterprise Application Architecture* (PoEAA)
- Historically used in enterprise systems for shared resource lookup
- Conceptually related to (but not the same as) Service Locator and IoC/DI containers

**Key Principle:**
> "Keep a well-known object that other objects can use to find common services and shared resources."

**Alternative formulation:**
> "Centralize lookup of shared dependencies so callers depend on a stable retrieval contract, not concrete construction details."

---

## 🏗️ Core Concepts

### Why Registry Exists

Without a registry (or equivalent wiring mechanism):
- many modules manually create the same collaborators
- construction logic gets duplicated
- changing implementation requires touching many files

A Registry centralizes where shared collaborators are stored and retrieved.

### Lookup Model

```
┌─────────────────────────────────────────────────────────────────┐
│  REGISTRY                                                        │
│                                                                  │
│  Keys / Types -> Instances                                       │
│  --------------------------------------------------------------- │
│  "PaymentGateway"       -> PaymentGatewayImpl                    │
│  "InventoryGateway"     -> InventoryGatewayImpl                 │
│  "Config"               -> AppConfig                             │
│  "Clock"                -> SystemClock                           │
│                                                                  │
│  Application code asks: Registry.get("PaymentGateway")           │
│  and receives configured shared dependency                       │
└─────────────────────────────────────────────────────────────────┘
```

### Typical Responsibilities

| Responsibility | Meaning |
|----------------|---------|
| **Register** | Add object/service by key/type during startup/bootstrapping. |
| **Lookup** | Retrieve service by key/type where needed. |
| **Lifecycle/Scope** | Decide singleton/per-request/transient ownership (if supported). |
| **Indirection** | Hide concrete implementation from callers. |

Registry itself should not hold business rules; it is a composition/infrastructure mechanism.

---

## 📦 Relation to Other Patterns

| Pattern | Relationship |
|---------|---------------|
| **Gateway** | Registry commonly stores configured gateway instances for shared reuse. |
| **Repository** | Registries may expose repository implementations, though constructor injection is often clearer. |
| **Dependency Injection (DI)** | DI is usually preferred: dependencies are explicit in constructors. Registry is more implicit lookup-based. Modern DI containers often replace ad hoc registries. |
| **Service Locator** | Very close concept. Registry can be viewed as a simple service locator. Main trade-off: hidden dependencies. |

---

## 📊 When to Use Registry

| Scenario | Use Registry? |
|----------|---------------|
| Legacy codebase with widespread implicit wiring | ✅ Practical transitional step to centralize scattered construction. |
| Infrastructure bootstrap/composition root | ✅ Useful to assemble and expose shared services at startup. |
| Modern code with strong DI practices | ⚠️ Prefer constructor injection for explicit dependencies. |
| Domain model classes | ❌ Avoid registry lookup inside domain logic; it hides dependencies and harms testability. |

---

## ⚠️ Common Pitfalls

1. **Hidden dependencies** - If classes pull dependencies from registry directly, constructor signatures no longer show what they need.
2. **Global mutable state** - Registry can turn into hard-to-control global state, causing test interference and order-dependent bugs.
3. **Over-centralization** - Dumping every object in one giant registry reduces modularity.
4. **Runtime lookup failures** - Missing registration causes late failures instead of compile-time wiring checks.
5. **Registry in domain layer** - Domain should stay explicit and pure; registry usage belongs to infrastructure/composition.

---

## 🎯 Best Practices

1. **Keep Registry at composition boundary** - Use it in bootstrap/infrastructure, not in domain entities/services.
2. **Prefer explicit DI for core logic** - Let constructors declare dependencies clearly.
3. **Use typed keys/contracts** - Reduce string-key errors and improve discoverability.
4. **Treat registrations as immutable after startup** - Avoid runtime mutation where possible.
5. **Test with isolated registries** - Each test should get a clean registry or avoid global singleton registries.

---

## 🔗 Related Patterns & Topics

| Topic | Relationship |
|-------|--------------|
| **Gateway** | Frequently registered and retrieved as shared integration dependencies. |
| **Dependency Injection** | Preferred modern alternative for explicit wiring. |
| **Service Locator** | Closely related lookup-oriented pattern with similar trade-offs. |
| **Repository** | Can be resolved through registry in legacy systems, but explicit injection is often cleaner. |

---

## 📝 Key Takeaways

1. **Registry** centralizes lookup of shared objects/services by key/type.
2. It helps reduce duplicated construction and supports infrastructure composition.
3. Overuse creates hidden dependencies and global-state problems.
4. Prefer **DI/constructor injection** for explicitness in core application/domain code.
5. Use Registry carefully at boundaries and keep it stable, typed, and testable.

---

**Date Created:** 2026-03-25  
**Pattern Type:** Enterprise Application (PoEAA) – Base Pattern  
**Difficulty:** Intermediate  
**Related:** Gateway, Dependency Injection, Service Locator, Repository
