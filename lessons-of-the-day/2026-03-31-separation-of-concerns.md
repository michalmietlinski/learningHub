# Separation of Concerns (SoC)

## 📋 Learning Objectives

- [ ] Understand what Separation of Concerns means in software design
- [ ] Learn how to identify responsibilities and separate them cleanly
- [ ] Recognize common SoC violations (mixing orchestration, business logic, I/O, policy)
- [ ] Apply SoC to improve readability, testability, and change safety
- [ ] Connect SoC to Clean Architecture, SOLID, and refactoring strategies

---

## 🎯 Definition

**Separation of Concerns (SoC)** is a design principle that aims to split a system into distinct parts, where each part addresses a specific concern (responsibility).

A “concern” can be any reason-to-change, such as:
- business rules/policies
- persistence (database/ORM)
- communication (HTTP, messaging, sockets)
- orchestration (use-case workflows)
- presentation formatting (DTO/view rendering)

When SoC is applied well, changes in one concern have minimal impact on others.

---

## 🧭 Core Concepts

### 1) Responsibility boundaries = fewer ripple effects

If you can change a persistence detail (e.g., SQL vs API vs cache) without touching business rules, SoC is working.

### 2) One module should have one reason to change

High-level heuristic:
- If two responsibilities change for unrelated reasons, they probably belong in different modules.

### 3) SoC vs “layering”

Layering is a *structural* technique; SoC is a *goal*.
- You can have layers that still violate SoC (e.g., business rules living in controllers).
- You can also achieve SoC without strict “MVC layers” if responsibilities are still separated.

---

## 📊 When to Apply SoC

| Design situation | Prefer SoC? | Why |
|------------------|--------------|-----|
| Controllers/services contain SQL/SDK calls | ✅ Yes | I/O and business logic become coupled; tests get harder |
| Business rules are mixed into request/response code | ✅ Yes | Policies become hard to reuse and change |
| A class has many unrelated methods | ✅ Yes | Signals unclear responsibilities and multiple reasons to change |
| You can’t unit test without hitting network/DB | ✅ Yes | SoC isolation typically enables fakes/mocks |
| You need fast prototyping with minimal structure | ⚠️ Selectively | Use boundaries lightly; keep evolution path clear |

---

## ⚠️ Common Pitfalls

1. **SoC as “over-layering”**
   - Adding more layers/modules without clear boundaries can increase complexity.
   - Fix: separate by reason-to-change, not by ideology.

2. **Accidental coupling through shared state**
   - If modules share mutable state, they are still coupled even if “separated.”
   - Fix: keep interfaces narrow and use immutable data where possible.

3. **Duplicating responsibilities**
   - When you split modules incorrectly, the same rule can appear in multiple places.
   - Fix: decide a single owner for each concern and avoid drift.

4. **Putting business logic in the wrong place**
   - “Service” classes sometimes become both policy and orchestration and persistence.
   - Fix: use clear naming and follow invariants with Tell/LoD/GRASP.

---

## 🎯 Best Practices

1. **Name modules by responsibilities**
   - Good: `InvoicePolicy`, `OrderRepository`, `PlaceOrderUseCase`, `PaymentProvider`.
   - Avoid generic names like `Utils`, `Manager`, `Helper` unless the responsibility is clear.

2. **Keep orchestration separate from policy**
   - Use-case workflow (orchestration) can call policy methods (business rules).

3. **Isolate I/O behind interfaces**
   - HTTP handlers, DB access, message brokers should be adapters behind stable contracts.

4. **Prefer “clean” data boundaries**
   - Use DTOs/value objects to avoid exposing internal domain representations across concerns.

5. **Refactor in small steps**
   - First extract methods, then extract modules, then tighten interfaces.

---

## 💻 Mini Example

### Bad: mixed policy + I/O
```ts
async function createInvoice(req: Request) {
  // I/O + orchestration + business rules mixed together
  const user = await db.users.find(req.body.userId);
  const amount = computeAmount(req.body.items); // business logic
  await db.invoices.insert({ userId: user.id, amount });
  return { ok: true };
}
```

### Better: separate concerns
```ts
class InvoicePolicy {
  computeAmount(items: Array<{ price: number; qty: number }>): number {
    return items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }
}

class PlaceInvoiceUseCase {
  constructor(
    private readonly users: { getById(id: string): Promise<{ id: string }> },
    private readonly invoices: { create(userId: string, amount: number): Promise<void> },
    private readonly policy: InvoicePolicy
  ) {}

  async execute(userId: string, items: Array<{ price: number; qty: number }>) {
    const user = await this.users.getById(userId);
    const amount = this.policy.computeAmount(items);
    await this.invoices.create(user.id, amount);
  }
}
```

Now controllers/handlers do request/response, the use case orchestrates, and the policy owns the rules.

---

## 🔗 Related Patterns & Topics

| Topic | Relationship |
|----------|--------------|
| Clean Architecture | SoC goal achieved through dependency direction + boundaries |
| SOLID | Especially SRP and OCP support SoC at class level |
| Separation by responsibility (GRASP) | Helps place responsibilities correctly |
| Tell, Don’t Ask | Encourages moving behavior into the correct concern/owner |
| Repository / UoW / Data Mapper | SoC in persistence: adapters isolate database logic |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks
1. Choose a “too big” file and split it by reason-to-change (policy vs I/O vs orchestration).
2. Identify one place where you call the database directly from business code; introduce an interface and move DB calls behind it.
3. Ensure the remaining business code can run with fakes (no DB/network).

### Interview questions
1. What counts as a “concern” in a real system?
2. Why is layering not the same thing as separation of concerns?
3. Give an example of SoC improving testability.
4. How can you tell when SoC is failing (symptoms)?
5. How do you refactor toward SoC without breaking behavior?

---

## 📝 Key Takeaways

1. SoC separates responsibilities by their reason-to-change.
2. Good SoC reduces coupling and makes changes safer.
3. Layering helps structure, but SoC is the goal.
4. Isolate I/O behind interfaces; keep business policy in policy/domain code.
5. Refactor gradually: extract methods first, then tighten module boundaries.

---

**Date Created:** 2026-03-31  
**Topic Type:** Foundational Principles  
**Difficulty:** Intermediate  
**Related:** SOLID (SRP/OCP), Clean Architecture, GRASP, Tell, Don’t Ask

