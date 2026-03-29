# Composition Over Inheritance

## 📋 Learning Objectives

- [ ] Understand the difference between composition and inheritance in OOP design
- [ ] Learn why composition usually leads to more flexible and maintainable code
- [ ] Recognize when inheritance is appropriate (and when it hurts)
- [ ] Apply the principle to real responsibility and behavior design
- [ ] Avoid common pitfalls like “composition as a pile of delegates”

---

## 🎯 Definition

**Composition over inheritance** is a design principle that recommends building behavior by composing smaller components (objects with focused responsibilities) rather than extending classes via inheritance for code reuse.

In practice:
- **Inheritance** = “is-a” relationship; a subclass inherits both structure and behavior.
- **Composition** = “has-a” relationship; an object delegates work to contained collaborators.

The main goal is to reduce tight coupling and fragile class hierarchies, so behavior changes stay localized and safer.

---

## 🧭 Core Concepts

### 1) Fragile base class vs flexible collaboration

Inheritance can become risky when the base class:
- changes over time
- has side effects in overridden methods
- assumes subclass invariants that subclasses cannot guarantee

Composition tends to isolate change because you can:
- swap collaborators
- add behavior by wiring new components
- avoid inheritance-induced coupling

### 2) Reuse via delegation (not subtype extension)

Common “good composition” pattern:
- define an interface/contract for behavior
- implement it in small classes
- inject/assign implementations to the owning object

### 3) Prefer “behavior as a dependency”

When behavior varies, treat it as a dependency:
- `PaymentStrategy`
- `ValidationRule`
- `Serializer`
- `Storage`

This keeps the owning object focused on orchestration and state, while the collaborator encapsulates change-prone behavior.

---

## 📊 When to Use Composition Over Inheritance

| Design situation | Prefer composition? | Why |
|------------------|----------------------|-----|
| Behavior needs to vary at runtime | ✅ Yes | Swap collaborators without changing class hierarchies |
| You want to minimize coupling between layers | ✅ Yes | Dependencies become explicit and localized |
| The hierarchy is complex or frequently changing | ✅ Yes | Avoid “fragile base class” effects |
| You only need code reuse and no behavioral variation | ⚠️ Sometimes | Inheritance can be acceptable if base is stable |
| You have a stable framework base you must extend | ❌ Not always | Some inheritance is required by frameworks |

---

## ⚠️ Common Pitfalls

1. **“Delegation soup”**
   - Composition can degrade into many tiny delegates that are hard to follow.
   - Fix: keep collaborators few and cohesive; name them by responsibility.

2. **Hidden complexity in composition**
   - Too many layers can make debugging slow.
   - Fix: ensure each collaborator has a single reason to change; add clear boundaries.

3. **Misusing inheritance for reuse**
   - Using inheritance to reuse code (“copy semantics”) without true subtype semantics breaks encapsulation.
   - Fix: refactor reused behavior into helper/component classes and compose them.

4. **Over-engineering polymorphism**
   - Creating interfaces/strategies for every minor variation.
   - Fix: start simple; introduce polymorphism when variation appears.

---

## 🎯 Best Practices

1. **Use inheritance for true “is-a” relationships**
   - Subclasses should represent a semantic specialization, not a shortcut for reuse.

2. **Extract behavior into small collaborators**
   - Create components that encapsulate change-prone behavior.

3. **Program to interfaces/contracts**
   - Keep the owning object dependent on stable abstractions, not concrete implementations.

4. **Keep the owning class focused**
   - The owner should orchestrate; collaborators should implement the details.

5. **Prefer dependency injection (or explicit wiring)**
   - Make behavior choices explicit in construction, not scattered across conditionals.

---

## 💻 Mini Examples

### Example 1: Inheritance that couples behavior

Bad:
```ts
class ReportGenerator {
  render(): string {
    // base rendering logic
    return "";
  }
}

class PdfReportGenerator extends ReportGenerator {
  render(): string {
    // overrides behavior, relies on base assumptions
    return "pdf";
  }
}
```

Problems:
- base class changes can break subclasses
- reuse can blur responsibilities

### Example 2: Composition with a strategy collaborator

Better:
```ts
interface Renderer {
  render(data: unknown): string;
}

class PdfRenderer implements Renderer {
  render(data: unknown): string {
    return "pdf";
  }
}

class ReportService {
  constructor(private readonly renderer: Renderer) {}

  generate(data: unknown): string {
    return this.renderer.render(data);
  }
}
```

Benefits:
- swap `renderer` without altering `ReportService`
- behavior changes remain localized to collaborator implementations

### Example 3: Hybrid approach (when inheritance is appropriate)

Inheritance can be fine when the hierarchy is stable and semantic:
```ts
abstract class DomainEvent {
  constructor(public readonly occurredAt: Date) {}
  abstract eventType(): string;
}

class UserRegistered extends DomainEvent {
  eventType() {
    return "UserRegistered";
  }
}
```

Here inheritance provides a meaningful shared contract; composition handles variable behavior elsewhere when needed.

---

## 🔗 Related Principles

| Principle | Relationship |
|----------|--------------|
| SOLID (SRP/OCP) | Composition supports Single Responsibility and Open/Closed by moving change to collaborators |
| GRASP | Creator/Information Expert guide which component should own behavior |
| Low Coupling / High Cohesion | Composition helps keep dependencies explicit and responsibilities focused |
| Polymorphism | Composition often enables polymorphism by swapping implementations |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks
1. Pick one class with multiple responsibilities and extract one responsibility into a collaborator, then compose it.
2. Find one place you used inheritance for “reuse” and replace it with a composed helper/strategy.
3. Identify one inheritance chain deeper than 2 levels; simplify by extracting a collaborator.

### Interview questions
1. What is the difference between “is-a” and “has-a” in this principle?
2. Why can inheritance lead to fragile designs?
3. How does composition improve testability?
4. Give an example where inheritance is still the right tool.
5. How do you avoid turning composition into “delegation soup”?

---

## 📝 Key Takeaways

1. Composition favors flexibility by delegating behavior to focused collaborators.
2. Inheritance is appropriate for stable, semantic “is-a” relationships—not as a reuse shortcut.
3. Composition makes dependencies explicit and reduces coupling to base-class internals.
4. Avoid both extremes: fragile deep hierarchies and uncontrolled delegate sprawl.
5. Apply intentionally: extract change-prone behavior into components and wire them together.

---

**Date Created:** 2026-03-28  
**Topic Type:** Foundational Principles  
**Difficulty:** Intermediate  
**Related:** Composition, Inheritance, SOLID, GRASP, Low Coupling, High Cohesion

