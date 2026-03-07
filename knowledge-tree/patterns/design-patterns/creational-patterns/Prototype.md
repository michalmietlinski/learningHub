# Prototype Pattern

## Overview

The Prototype Pattern is a creational design pattern that **creates new objects by copying an existing object (the prototype)** instead of creating them from scratch via constructors.

**Also known as:** Clone pattern.

## Core Problem Solved

- Avoids **expensive or complex construction** when a copy of an existing object is sufficient
- Hides **concrete product classes** from the client; client works with a prototype interface
- Simplifies **adding and removing products at runtime** by registering/cloning prototypes
- Useful when **object creation is costlier than copying** (e.g. DB load, heavy computation)

## Structure

```
Prototype (Interface)
├── clone(): Prototype
│
ConcretePrototypeA          ConcretePrototypeB
├── clone(): Prototype      ├── clone(): Prototype
└── (state to copy)         └── (state to copy)

Client
└── holds/registers prototypes, calls clone() to create copies
```

### Participants

| Participant         | Role |
|---------------------|------|
| **Prototype**       | Declares a `clone()` (or `copy()`) method |
| **ConcretePrototype** | Implements `clone()`, copies its own state |
| **Client**          | Creates new objects by asking a prototype to clone itself |

## Common Use Cases

| Use Case | Example |
|----------|---------|
| Avoiding costly construction | Copying an object loaded from DB or built via heavy computation |
| Dynamic product creation | Registry of prototypes; add new types at runtime by registering new prototypes |
| Undo/redo, versioning | Store snapshots as clones of state |
| Default configurations | Clone a default config and customize the copy |
| Game entities / document objects | Duplicate sprites, nodes, or document nodes by cloning |

## Variations

| Variation | Description |
|-----------|-------------|
| **Shallow copy** | Copies object and its direct fields; nested objects are shared (same references) |
| **Deep copy** | Recursively copies all nested objects so the clone is fully independent |
| **Registry of prototypes** | Client looks up prototype by key, then clones (factory-like but clone-based) |
| **Copy constructor** | Language idiom (e.g. C++) where clone is done via a constructor taking another instance |

## Deep vs Shallow Copy

| Aspect | Shallow | Deep |
|--------|---------|------|
| **Nested objects** | Same references as original | New copies; fully independent |
| **Performance** | Faster, less allocation | Slower, more allocation |
| **When to use** | No nested mutable state, or nested shared intentionally | Nested mutable state; need full independence |
| **Risk** | Mutating a nested object affects original and clone | No shared mutable state |

## Prototype vs Other Creational Patterns

| Pattern         | Difference |
|-----------------|------------|
| **Factory Method** | Creates by **calling a constructor/factory**; Prototype creates by **cloning** |
| **Abstract Factory** | Creates **families** of products; Prototype creates **copies of one** |
| **Builder**     | **Step-by-step construction**; Prototype **one-shot copy** of existing object |
| **Singleton**   | Ensures **one instance**; Prototype is about **many copies** from a prototype |

## Trade-offs

### ✅ Advantages

- **Avoids complex construction** – clone when building from scratch is expensive
- **Runtime flexibility** – add/remove product types by registering new prototypes
- **Hides concrete classes** – client depends on Prototype interface only
- **Simplifies creating many similar objects** – clone and tweak

### ❌ Disadvantages

- **Clone implementation** – deep clone can be tricky (circular refs, special types)
- **Shallow vs deep** – wrong choice leads to shared mutable state bugs
- **Not all objects are cloneable** – dependencies, resources, or identity may make cloning inappropriate

## When to Use vs When to Avoid

**Use when:**
- **Construction is more expensive than copying** (e.g. object came from DB or heavy setup)
- You want to **add/remove product types at runtime** without changing client code
- Client should **not depend on concrete product classes**
- You need **copies with small variations** (clone then modify)

**Avoid when:**
- Objects are **simple and cheap to construct**
- **Identity matters** (e.g. entities with a single canonical instance)
- **Deep clone is impractical** (circular refs, non-cloneable resources)

## Best Practices

1. **Document clone semantics** – shallow vs deep; what is and isn’t copied.
2. **Prefer deep copy** when the object has nested mutable state unless you explicitly want sharing.
3. **Handle circular references** in deep clone (e.g. identity map / visited set).
4. **Consider Copy Constructor or `clone()`** per language idioms (e.g. `ICloneable`, `Cloneable`, `copy()` in Kotlin).

## Related Patterns

- **Factory Method** – creates by construction; Prototype creates by cloning; can be combined (factory returns a prototype to clone).
- **Abstract Factory** – may store or return prototypes for each product in a family.
- **Builder** – builder may start from a cloned prototype and then customize.
- **Composite** – composite nodes are often duplicated via Prototype (clone a subtree).

---

## 📚 References

### Lessons of the Day
- **[2025-12-16 - Prototype Pattern](../../../../lessons-of-the-day/2025-12-16-prototype-pattern.md)** – Full deep-dive with implementation examples, deep vs shallow copy, and registry of prototypes

### Related Lessons
- [2025-12-14 - Factory Method Pattern](../../../../lessons-of-the-day/2025-12-14-factory-method-pattern.md)
- [2025-12-15 - Abstract Factory Pattern](../../../../lessons-of-the-day/2025-12-15-abstract-factory-pattern.md)
- [2025-12-16 - Builder Pattern](../../../../lessons-of-the-day/2025-12-16-builder-pattern.md)
