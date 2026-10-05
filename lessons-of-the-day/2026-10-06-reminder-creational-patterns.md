# Reminder: Creational Patterns

**Format:** Reminder lesson. One sitting to recall the five creational patterns and tell them apart. Definitions, code, and variations stay in the full lessons linked at the end.

**Question this reminder answers:** Who constructs the object, and what does the caller know?

---

## 📋 Learning Objectives

- [ ] Recall each creational pattern in one line
- [ ] Pick a pattern from the construction problem in front of you
- [ ] Separate Factory Method, Abstract Factory, Builder, Prototype, and Singleton when they blur together

---

## 🎯 What These Patterns Share

All five move construction out of the code that uses the object. The caller stops saying `new ConcreteClass` and asks someone else for a result.

They split on **what is hidden**:

| Hidden from the caller | Pattern |
|------------------------|---------|
| That more than one instance could exist | **Singleton** |
| Which subclass will supply the one product | **Factory Method** |
| Which matching set of products you are in | **Abstract Factory** |
| The order and the optional parts of a complex build | **Builder** |
| The concrete class of an object that already exists | **Prototype** |

If the class is known and the constructor is small, none of these is required. Direct construction is the default.

---

## 📦 One Line Each

| Pattern | In one line |
|---------|-------------|
| **Singleton** | One instance, one well-known access point (`getInstance`), constructor closed to the rest of the code. |
| **Factory Method** | A superclass declares creation; each subclass decides which one product to return. Also called a virtual constructor. |
| **Abstract Factory** | An interface creates a **family** of related products so a client can switch the whole set (a kit) without naming concrete classes. |
| **Builder** | Construction is a sequence of steps, separate from the finished representation. A director may fix the order; the builder may be fluent. |
| **Prototype** | New objects come from cloning an existing instance (shallow or deep), optionally kept in a registry. |

---

## 📊 Which One Fits

| Situation | Use |
|-----------|-----|
| Exactly one shared resource must exist (pool, logger, config, device) and the rest of the program must reach it | **Singleton** |
| A framework or base class works with a product, and each extender supplies its own product type | **Factory Method** |
| Products must match: one theme, one OS, one database vendor, and the client uses only the interfaces | **Abstract Factory** |
| Many optional fields, a required order of steps, or several representations from the same construction process | **Builder** |
| Building from scratch is expensive, or you want a new object that starts as a copy of one you already configured | **Prototype** |
| One known class, a short constructor, no family and no multi-step assembly | **Direct construction** |

---

## ⚠️ Mix-ups

### Factory Method and Abstract Factory

**Factory Method** creates **one** product type. The variation is inheritance: a subclass overrides a single creation method.

**Abstract Factory** creates **several** products that belong together. The variation is composition: the client holds a factory and calls `createButton`, `createCheckbox`, and so on. Adding a new product kind means changing the factory interface. Adding a new family means a new concrete factory.

A `switch` that returns `ProductA` or `ProductB` is a **simple factory**. It is a useful idiom. It is not Factory Method, because nothing is deferred to a subclass.

### Factories and Builder

**Factory Method** and **Abstract Factory** answer **which** object (or which family) and return it from a creation method.

**Builder** answers **how** a complex object is assembled. The caller (or a director) runs steps, then takes the result. Use it when a constructor would be a long list of optional arguments, or when the same steps should produce different representations. Skip it when the object is a handful of required fields.

### Builder and Prototype

**Builder** assembles a new object from parts. No prior instance is required.

**Prototype** starts from an instance you already have and clones it, then you customize the copy. The builder lesson’s own note fits here: build a template once, clone it, tweak the clone.

### Prototype and Factory Method

**Factory Method** constructs from scratch through a subclass. The set of products is fixed by the class hierarchy.

**Prototype** copies. The client can register new prototypes at runtime without a new creator subclass. Cloning has to be honest about nested objects: shallow copy shares inner references; deep copy duplicates them. Circular references make deep copy painful, which is a reason to prefer a factory.

### Singleton and “there is only one”

Singleton is a **requirement**: the class forbids a second instance and publishes the first one. One object that happens to live for the process is not a Singleton.

The singleton lesson’s preferred alternative, when the goal is a shared service, is **dependency injection**: pass the logger, pool, or config in. That keeps the single instance in composition rather than in a global `getInstance`. Reach for Singleton when a true single instance and global access are both required, and sparingly, because the class then owns both its job and its own lifetime, which makes tests harder.

Abstract Factory and Singleton often appear in the same design. A factory can be the single shared kit, or a factory can hand out a singleton product. Those are two jobs composed, not one pattern.

---

## 🔗 How They Combine

- **Factory Method** often lives inside a **Template Method**: the base algorithm calls the factory method when it needs a product.
- An **Abstract Factory** is frequently itself a **Singleton**, so the application has one kit.
- **Builder** plus **Prototype**: construct a canonical object, store it, clone when you need a variant.
- **Prototype** can remove creator subclasses that a Factory Method would otherwise need.

---

## 📝 Key Takeaways

1. Creational patterns hide `new`. The choice is what the caller must not know.
2. **Singleton** is one instance plus global access. Prefer injecting that instance when you only wanted sharing.
3. **Factory Method** is one product, chosen by a subclass. **Abstract Factory** is a matching family, chosen by swapping the factory.
4. **Builder** is step-by-step construction. **Prototype** is copy-and-adjust.
5. A short, known constructor needs none of them. The full lessons hold the implementations.

---

## 📚 Full Lessons

| Pattern | Lesson |
|---------|--------|
| Singleton | [2025-12-13-singleton-pattern.md](2025-12-13-singleton-pattern.md) |
| Factory Method | [2025-12-14-factory-method-pattern.md](2025-12-14-factory-method-pattern.md) |
| Abstract Factory | [2025-12-15-abstract-factory-pattern.md](2025-12-15-abstract-factory-pattern.md) |
| Builder | [2025-12-16-builder-pattern.md](2025-12-16-builder-pattern.md) |
| Prototype | [2025-12-16-prototype-pattern.md](2025-12-16-prototype-pattern.md) |

---

**Date Created:** 2026-10-06  
**Type:** Reminder lesson (creational patterns)  
**Series:** Day 1 of the reminder track  
**Related:** GoF creational patterns, Section 1 of the learning plan
