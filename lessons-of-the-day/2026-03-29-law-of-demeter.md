# Law of Demeter (LoD)

## 📋 Learning Objectives

- [ ] Understand what the Law of Demeter is and why it reduces coupling
- [ ] Learn the “only talk to your immediate friends” rule
- [ ] Identify common LoD violations in real code (especially chained calls)
- [ ] Apply LoD to improve maintainability and testability
- [ ] Connect LoD to encapsulation, SOLID, and refactoring strategies

---

## 🎯 Definition

The **Law of Demeter** (also called the **principle of least knowledge**) suggests that an object should **only communicate with its immediate collaborators**.

In its common shorthand:
> “Talk to friends, not strangers.”

More concretely, a method should avoid reaching deep into a collaborator’s internal structure (e.g., `a.b().c().d()`), because that creates tight coupling between many types.

---

## 🧭 Core Concepts

### 1) Immediate collaborators (friends)

When implementing a method, prefer calling:
- methods on `this`
- methods on directly held fields/parameters
- methods on objects you received directly as arguments

Avoid navigating through multiple layers of returned objects just to perform a task.

### 2) Encapsulation and knowledge boundaries

LoD is a design constraint that protects encapsulation:
- If the internal structure of `b` changes, code that “walks through” `b` breaks.
- If you ask `b` to do the work (or expose a narrow capability), `b` can change internally without breaking callers.

### 3) “Tell, Don’t Ask” synergy

LoD is strongly aligned with “Tell, Don’t Ask”:
- Instead of asking an object for its internals and then operating on them elsewhere,
- ask the object to perform a task, or return a stable abstraction.

---

## 📊 When to Apply LoD

| Design situation | Prefer LoD? | Why |
|------------------|--------------|-----|
| Code has long chains like `user.profile.address.city` | ✅ Yes | Avoids brittle coupling to deep structures |
| Classes have “getter-based” designs that expose internals | ✅ Yes | Forces behavior and capabilities to move closer to the owner |
| You refactor one component and many call sites break | ✅ Yes | LoD reduces surface area of change |
| The domain needs explicit navigation for correctness | ⚠️ Sometimes | A domain may expose navigation when the model explicitly requires it |
| You are in framework/DTO mapping code | ⚠️ Selectively | DTOs often need mapping from deep structures, but still avoid unnecessary coupling |

---

## ⚠️ Common Pitfalls

1. **Over-applying LoD until everything becomes a “facade”**
   - If you push every operation behind a method on the owner, you may create massive classes.
   - Fix: keep collaborator responsibilities cohesive; extract helpers when needed.

2. **Confusing LoD with “no getters ever”**
   - LoD doesn’t forbid access; it discourages deep reach-through and knowledge leakage.
   - Fix: return stable value objects or narrower abstractions instead of exposing internal graphs.

3. **Replacing chained calls with a giant “doEverything()”**
   - A better goal is “capability near the data owner,” not “one method to rule them all.”
   - Fix: define small domain operations that match use cases.

4. **Ignoring testability**
   - Sometimes the best change is to restructure ownership/abstractions so tests can isolate behavior.
   - Fix: prefer interfaces and small collaborators for mocking/stubbing.

---

## 🎯 Best Practices

1. **Ask the owner to do the work**
   - Move logic closer to the object that has the needed state.

2. **Avoid deep navigation from callers**
   - Reduce chains across multiple object boundaries.

3. **Expose stable, intention-revealing operations**
   - Provide methods like `order.totalAmount()` or `user.canAccess(resource)` instead of exposing internals.

4. **Return value objects or DTOs when you need data**
   - If data must be read, return a value object with a stable shape rather than raw internal models.

5. **Refactor in small steps**
   - Extract a capability method first, then update callers gradually.

---

## 💻 Mini Examples

### Example 1: LoD violation (deep reach-through)
```ts
class BillingService {
  constructor(private readonly userRepo: { getById(id: string): User }) {}

  getInvoiceTax(userId: string): number {
    const user = this.userRepo.getById(userId);
    // LoD violation: BillingService reaches deep into user internals.
    const country = user.profile.address.country;
    return country === "DE" ? 0.19 : 0.0;
  }
}
```

Problems:
- `BillingService` now depends on `User -> profile -> address -> country`.
- Refactoring any of those internals breaks callers.

### Example 2: LoD-friendly (capability near the owner)
```ts
class User {
  // stable capability instead of leaking internal structure
  taxRate(): number {
    const country = this.profile.address.country;
    return country === "DE" ? 0.19 : 0.0;
  }
}

class BillingService {
  constructor(private readonly userRepo: { getById(id: string): User }) {}

  getInvoiceTax(userId: string): number {
    const user = this.userRepo.getById(userId);
    return user.taxRate();
  }
}
```

Benefits:
- fewer dependencies in `BillingService`
- `User` can reorganize its internals without breaking the caller

### Example 3: “Friends only” using direct dependencies
```ts
class PaymentService {
  constructor(
    private readonly paymentGateway: { charge(amount: number): Promise<void> },
    private readonly auditLogger: { logCharged(amount: number): void }
  ) {}

  async charge(amount: number) {
    await this.paymentGateway.charge(amount);
    this.auditLogger.logCharged(amount);
  }
}
```

Here dependencies are explicit collaborators (friends), not strangers reached through chains.

---

## 🔗 Related Principles

| Principle | Relationship |
|----------|--------------|
| Encapsulation | LoD protects internal structure by limiting reach-through |
| Tell, Don’t Ask | LoD pushes toward capabilities instead of internals |
| SOLID (SRP/OCP) | Improves cohesion and reduces ripple effects when code changes |
| Composition over Inheritance | Helps distribute responsibilities to collaborators |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks
1. Search for deep chains `a.b().c().d()` in one service; rewrite one call site to use a capability method.
2. Pick one class that exposes internals via getters; try replacing one getter usage with an intention-revealing method.
3. For one refactor you’d like to do, identify which objects become “friends” after you apply LoD.

### Interview questions
1. What is the Law of Demeter trying to prevent?
2. Give a real example where LoD violations cause refactoring pain.
3. How does LoD relate to encapsulation?
4. Does LoD forbid getters? Explain.
5. What’s the difference between a healthy capability method and a “doEverything()” anti-pattern?

---

## 📝 Key Takeaways

1. LoD (least knowledge) reduces coupling by restricting how objects communicate.
2. Avoid deep reach-through into collaborators’ internals.
3. Prefer capability methods near the object that owns the data/knowledge.
4. LoD pairs well with Tell, Don’t Ask and encapsulation.
5. Refactor gradually to keep behavior stable while improving design.

---

**Date Created:** 2026-03-29  
**Topic Type:** Foundational Principles  
**Difficulty:** Intermediate  
**Related:** Encapsulation, Tell, Don’t Ask, SOLID, Composition

