# KISS / DRY / YAGNI Principles

## 📋 Learning Objectives

- [ ] Understand KISS, DRY, and YAGNI as complementary design heuristics
- [ ] Learn how to apply them without turning them into dogma
- [ ] Recognize common failure modes (over-abstraction, duplication for clarity, premature optimization)
- [ ] Improve code readability, maintainability, and change safety
- [ ] Connect these principles to SOLID, Clean Architecture, and refactoring

---

## 🎯 Definition

These three principles are often taught together because they all target the same outcome: **code that stays understandable as the system grows**.

- **KISS (Keep It Simple, Stupid):** prefer the simplest design that solves the problem today
- **DRY (Don't Repeat Yourself):** avoid duplication of knowledge and logic
- **YAGNI (You Aren't Gonna Need It):** don't build what you don't yet need

In practice, they work best as a *trade-off triad*:
- KISS pushes toward fewer concepts and less indirection
- DRY pushes toward one authoritative place for a rule
- YAGNI pushes toward building only verified needs

---

## 🧭 Core Concepts (How they work together)

### KISS: Optimize for understandability first
KISS means you choose the design that is easiest to read and reason about given current requirements.

- Favor straightforward control flow
- Prefer conventional naming and structure
- Reduce “magic” and hidden complexity (implicit behavior, clever metaprogramming, deep inheritance chains)

### DRY: Eliminate repeated *knowledge*, not just repeated code
DRY is about avoiding multiple places where the same rule lives.

- If two places must change together, duplication of knowledge is leaking
- Extract a single source of truth (function, module, configuration, policy object)

DRY is not “no duplication ever.” Sometimes repeating small, obvious code is cheaper than abstraction overhead.

### YAGNI: Build for what you know, not what you speculate
YAGNI prevents you from adding features “just in case.”

- Avoid speculative generalization (framework-level complexity for a one-off requirement)
- Delay optional architecture (extra layers, abstractions, and migration scaffolding) until it becomes an actual need

---

## 📊 When to Apply Which?

| Design situation | Likely best principle | Why |
|------------------|------------------------|-----|
| The code is hard to read | KISS | Reduce mental load and hidden complexity |
| The same rule is implemented in multiple places | DRY | One authoritative implementation prevents drift |
| A new abstraction exists only because of a future guess | YAGNI | Avoid building “the next requirement” prematurely |
| Duplication exists but each copy is small and stays stable | KISS | Simplicity can beat premature refactoring |
| DRY extraction creates hard-to-follow layers | KISS + YAGNI | Abstraction can introduce complexity more than it removes |

---

## ⚠️ Common Pitfalls

1. **DRY absolutism (“no duplicates ever”)**
   - Extracting everything can create indirection, unclear naming, and harder debugging.
2. **KISS vs “oversimplify”**
   - Simplicity is good, but deleting necessary abstractions (or types) can make the system brittle.
3. **YAGNI vs “never plan”**
   - YAGNI does not mean “ignore architecture.” It means build the minimum and keep extension points available when they are justified.
4. **Ignoring change patterns**
   - You should not DRY what doesn’t need to change together; but you should DRY when you already observe coupled changes.

---

## 💻 Mini Examples (Practical patterns)

### Example 1: DRY with a clear extraction point
Bad (knowledge duplicated):
```ts
function calculateTax(order) {
  if (order.region === "EU") return order.total * 0.2;
  return order.total * 0.0;
}

function validateTax(order) {
  const expected = order.region === "EU" ? order.total * 0.2 : 0;
  // ...
}
```

Better (one rule, used by both):
```ts
function taxRateForRegion(region: string): number {
  if (region === "EU") return 0.2;
  return 0.0;
}

function calculateTax(order) {
  return order.total * taxRateForRegion(order.region);
}
```

### Example 2: KISS over abstraction
If you only need one formatting strategy, a dedicated abstraction might be worse than a plain function.
```ts
// Prefer this early:
function formatMoney(amount: number, currency: string) {
  return `${amount.toFixed(2)} ${currency}`;
}
```

Later, if multiple formats emerge, you can refactor into strategy/polymorphism when there is real variation.

### Example 3: YAGNI by delaying “future flexibility”
Bad:
- adding plugin system + interfaces + DI config for a single use case

Better:
- implement the single expected path
- keep it structured so you can extend when a real second case appears

---

## 🔗 Related Principles

| Principle | Relationship |
|----------|--------------|
| SOLID | SOLID refines *structure* once you know responsibilities; KISS/DRY/YAGNI guide *how much structure* to add. |
| Separation of Concerns | Helps define boundaries so DRY and KISS don't fight each other. |
| Refactoring | The mechanism for “DRY later” and “YAGNI now” without leaving debt forever. |
| DDD (when you reach it) | Helps decide what belongs in the domain vs application vs infrastructure, reducing accidental duplication. |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks
1. Take a file with duplicated logic: delete one copy by extracting a single source of truth.
2. Identify one abstraction that looks “future-proof” but is not used yet; simplify it.
3. Find one area where you can improve readability by removing clever code paths (KISS).

### Interview questions
1. What does “DRY” really mean (knowledge vs code)?
2. When is duplication acceptable?
3. How do KISS and DRY sometimes conflict, and how do you resolve it?
4. Give an example where YAGNI prevented wasted architecture.
5. How do these principles influence refactoring decisions?

---

## 📝 Key Takeaways

1. KISS optimizes for readability and low complexity.
2. DRY optimizes for one authoritative place for rules (not zero duplicated lines).
3. YAGNI prevents building speculative architecture.
4. They should be applied as trade-offs depending on observed change and variation.
5. Use refactoring to keep “later changes” safe without premature over-design.

---

**Date Created:** 2026-03-27  
**Topic Type:** Foundational Principles  
**Difficulty:** Intermediate  
**Related:** KISS, DRY, YAGNI, SOLID, Separation of Concerns, Refactoring

