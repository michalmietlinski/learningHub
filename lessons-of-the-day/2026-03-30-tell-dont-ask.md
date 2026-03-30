# Tell, Don’t Ask

## 📋 Learning Objectives

- [ ] Understand the “Tell, Don’t Ask” principle and what it changes in code
- [ ] Learn how it reduces coupling and protects encapsulation
- [ ] Recognize common violations (anemic objects, getter chains, data hoarding)
- [ ] Apply the principle to move behavior into the right collaborators
- [ ] Connect it to LoD, GRASP, and SOLID (especially SRP/OCP)

---

## 🎯 Definition

**Tell, Don’t Ask** is a design principle that encourages sending **commands** to an object so it performs the work, instead of **asking** for internal data and then doing decisions or computations elsewhere.

In spirit:
> “Ask less, do more.”

Instead of:
- getting internal state (or internals) and branching on it elsewhere,

prefer:
- giving the object the intent (“do X”) and letting it decide how.

---

## 🧭 Core Concepts

### 1) Encapsulation through behavior

If callers can only *tell* an object what to do, the object controls:
- what data matters
- which invariants must hold
- how the work is performed

That keeps internal representation private and changeable.

### 2) Invert control from caller to callee

Tell, Don’t Ask shifts responsibility:
- caller provides intent
- callee performs the logic

This often results in more cohesive classes.

### 3) Reduce conditional logic in the caller

Many violations look like:
- caller retrieves fields
- caller checks conditions
- caller calls different methods based on those fields

Instead, encapsulate those conditions inside the object as methods.

---

## 📊 When to Apply Tell, Don’t Ask

| Design situation | Prefer “Tell”? | Why |
|------------------|-----------------|-----|
| Caller reads several getters and then branches | ✅ Yes | Removes knowledge of internals from caller |
| Domain rules are duplicated across services/controllers | ✅ Yes | Moves rules into the domain object(s) that own them |
| You see deep property chains like `a.b().c()` | ✅ Yes | Reduces reach-through and fragile coupling |
| You only need read-only data and reporting | ⚠️ Sometimes | Reads are fine; just avoid using getters to make business decisions externally |
| Simple orchestration across services | ⚠️ Selectively | Controllers may still ask for data, but domain decisions should move inward |

---

## ⚠️ Common Pitfalls

1. **“Tell, Don’t Ask” becomes “doEverything()”**
   - If you shove all logic into a single method, you lose cohesion.
   - Fix: create intention-revealing methods that match use cases, and keep methods small.

2. **Replacing getters with meaningless commands**
   - A `doSomething()` method that hides what it actually does is unhelpful.
   - Fix: name methods by intent: `approveRefund()`, `payInvoice()`, `markAsPaid()`.

3. **Ignoring object boundaries**
   - Don’t move behavior across aggregates/domains just because it “reduces asking.”
   - Fix: use GRASP + DDD boundaries; ask which object truly owns the rule.

---

## 🎯 Best Practices

1. **Give objects tasks, not data**
   - Prefer method calls that carry intent: `user.canAccess(resource)` vs `user.role` + branching.

2. **Move invariants closer to the owner**
   - If an object has invariants, validate/maintain them inside the object’s methods.

3. **Return value objects for reads**
   - It’s okay for callers to read *data* (DTOs, projections). The key is: don’t use raw internals to drive domain decisions externally.

4. **Use GRASP to choose the owner**
   - “Information Expert” and “Controller” help place logic correctly.

---

## 💻 Mini Examples

### Example 1: Caller makes domain decisions (bad)
```ts
class User {
  constructor(public readonly role: string) {}
}

class AuthService {
  canAccess(user: User, resource: string): boolean {
    // Asking for internals and branching outside the domain.
    if (user.role === "admin") return true;
    if (resource === "profile") return user.role === "user";
    return false;
  }
}
```

Problems:
- `AuthService` now “knows” user internals and policy details
- changes to role model ripple outward

### Example 2: Tell the object to evaluate policy (better)
```ts
class User {
  constructor(private readonly role: string) {}

  canAccess(resource: string): boolean {
    if (this.role === "admin") return true;
    if (resource === "profile") return this.role === "user";
    return false;
  }
}

class AuthService {
  canAccess(user: User, resource: string): boolean {
    // Caller tells; domain decides.
    return user.canAccess(resource);
  }
}
```

Benefits:
- `AuthService` stops depending on internals
- policies can evolve inside `User`

### Example 3: Keep read-only DTOs for queries
```ts
// Read model / projection
type InvoiceSummary = { total: number; status: string };

// For reads, it's fine to ask for data.
function renderInvoice(summary: InvoiceSummary) {
  return `Invoice: ${summary.status} (${summary.total})`;
}
```

Tell, Don’t Ask mainly targets *behavior decisions*, not display-only reads.

---

## 🔗 Related Principles

| Principle | Relationship |
|----------|--------------|
| Law of Demeter | Reduces reach-through by limiting how callers learn about internals |
| GRASP | Helps place behavior (Information Expert) and orchestration (Controller) |
| Encapsulation | Protects representation by moving decisions into the owner |
| SOLID (SRP/OCP) | Better responsibility boundaries make change safer |
| Separation of Concerns | Helps keep policy in domain and orchestration elsewhere |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks
1. Find a service method that uses multiple getters and branch logic; move that logic into the most relevant domain object.
2. Replace at least one `if (obj.prop === ...)` block with an intention-revealing method call.
3. Ensure the moved logic preserves invariants and error cases.

### Interview questions
1. What does “tell” mean in object-oriented design?
2. When is “asking” acceptable (for example, DTO reads)?
3. How does this principle improve testability?
4. How does it relate to LoD (principle of least knowledge)?
5. What are signs that you moved too much into one object?

---

## 📝 Key Takeaways

1. Tell, Don’t Ask moves decisions into the object that owns the relevant behavior/invariants.
2. It reduces coupling by preventing callers from depending on internal state and representations.
3. It turns branching logic into intention-revealing method calls.
4. It works best with cohesion-focused refactors, not by blindly adding methods.
5. Reads for presentation are fine; the principle is mainly about domain behavior decisions.

---

**Date Created:** 2026-03-30  
**Topic Type:** Foundational Principles  
**Difficulty:** Intermediate  
**Related:** Encapsulation, Law of Demeter, GRASP, SOLID

