# Test-Driven Development (TDD)

## 📋 Learning Objectives

- [ ] Understand what TDD is and how it differs from “test after coding”
- [ ] Learn the Red-Green-Refactor cycle and why it works
- [ ] Write small, behavior-focused tests that guide design
- [ ] Recognize common TDD pitfalls and how to avoid them
- [ ] Connect TDD to refactoring, maintainability, and confidence in change

---

## 🎯 Definition

**Test-Driven Development (TDD)** is a development practice where you write a failing automated test **before** implementing production code, then write the minimum code to pass it, then improve the design safely.

Core cycle:
1. **Red** — write a failing test for one small behavior.
2. **Green** — write the minimal code to make the test pass.
3. **Refactor** — clean up test and production code while keeping tests green.

TDD is not “testing for coverage first.” It is a **design and feedback loop** that keeps development incremental.

---

## 🧭 Core Concepts

### 1) Red-Green-Refactor as a micro-feedback loop

- **Red:** confirms test can fail for the expected reason.
- **Green:** drives the simplest implementation (avoid overbuilding).
- **Refactor:** improves naming, structure, and duplication while behavior remains protected by tests.

### 2) Test behavior, not implementation details

Good TDD tests describe outcomes and domain behavior:
- inputs → outputs
- state transitions
- interactions that matter to domain contracts

Avoid coupling tests to private internals (method order, exact private calls) unless behavior contract requires it.

### 3) “Minimal code first” fights speculative design

TDD naturally aligns with YAGNI:
- implement only what current tests require
- avoid adding future abstractions too early
- let repeated pressure from tests reveal better design points

---

## 📊 When TDD Works Best

| Situation | Use TDD? | Why |
|----------|-----------|-----|
| Business rules and transformations | ✅ Yes | Clear behavior boundaries; fast feedback |
| Domain logic with many edge cases | ✅ Yes | Captures rules incrementally and safely |
| Refactoring legacy code with weak tests | ✅ Yes (with characterization tests) | Builds safety net before deep changes |
| UI-heavy code with unstable rendering details | ⚠️ Selectively | Prefer behavior-level tests; avoid brittle snapshots |
| Throwaway prototypes | ⚠️ Sometimes | Can be slower initially if code won’t live long |
| Low-level integration with many external systems | ⚠️ Hybrid | Combine unit TDD with integration tests for confidence |

---

## ⚠️ Common Pitfalls

1. **Writing huge tests first**
   - Large tests blur failure causes and slow feedback.
   - Fix: write the smallest meaningful failing test.

2. **Testing implementation details**
   - Tests break when refactoring internals even though behavior is unchanged.
   - Fix: assert behavior, outputs, and contracts.

3. **Skipping refactor step**
   - “Green” without cleanup creates technical debt quickly.
   - Fix: treat refactor as required, not optional.

4. **Over-mocking everything**
   - Can produce tests that pass but don’t represent reality.
   - Fix: mock true external boundaries; keep core logic with real values.

5. **Using TDD to chase coverage numbers**
   - High coverage is not equal to high confidence.
   - Fix: prioritize meaningful scenarios and edge cases.

---

## 🎯 Best Practices

1. **Keep test cycles short**
   - One behavior per cycle; seconds, not minutes.

2. **Use intention-revealing test names**
   - Example: `returns_error_when_password_too_short`.

3. **Write minimum production code to pass**
   - Avoid adding “future” capabilities.

4. **Refactor continuously**
   - Remove duplication and clarify intent in both tests and production code.

5. **Use test data builders/factories when setup grows**
   - Keep tests focused on the behavior under test.

6. **Pair TDD with integration tests**
   - Unit TDD gives fast confidence; integration tests verify wiring and contracts.

---

## 💻 Mini Example (Red → Green → Refactor)

### Step 1: Red
```ts
import { describe, it, expect } from "vitest";
import { priceWithTax } from "./pricing";

describe("priceWithTax", () => {
  it("applies 20 percent tax for EU region", () => {
    expect(priceWithTax(100, "EU")).toBe(120);
  });
});
```

Test fails (function not implemented).

### Step 2: Green
```ts
export function priceWithTax(amount: number, region: string): number {
  if (region === "EU") return amount * 1.2;
  return amount;
}
```

Test passes.

### Step 3: Refactor
```ts
const TAX_RATE_BY_REGION: Record<string, number> = {
  EU: 0.2,
};

export function priceWithTax(amount: number, region: string): number {
  const rate = TAX_RATE_BY_REGION[region] ?? 0;
  return amount * (1 + rate);
}
```

Behavior stays green; design is now clearer and easier to extend.

---

## 🔗 Related Topics

| Topic | Relationship |
|-------|--------------|
| Test Doubles | Helps isolate boundaries while keeping unit tests fast |
| Unit Testing Patterns (AAA, Given-When-Then) | Strong structure for readable TDD tests |
| Refactoring | Core third phase of TDD cycle |
| SOLID / GRASP | TDD pressure often pushes toward cleaner responsibilities |
| CI/CD | Fast test runs in CI prevent regressions and keep loops healthy |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks
1. Implement a `passwordStrength(password)` function entirely via TDD (at least 5 tests).
2. Refactor one existing utility using Red-Green-Refactor without changing behavior.
3. Write one characterization test around a legacy function before modifying it.

### Interview questions
1. What is the real purpose of TDD besides “more tests”?
2. Why is the refactor step essential?
3. How do you decide what to mock in TDD?
4. When can TDD be slower, and how do you keep it practical?
5. How does TDD influence software design quality?

---

## 📝 Key Takeaways

1. TDD is a design loop: Red → Green → Refactor.
2. Write behavior-focused failing tests first, then minimal implementation.
3. Refactoring is mandatory to keep code quality improving.
4. TDD increases confidence for change and supports cleaner architecture.
5. Use TDD with integration tests for balanced, real-world confidence.

---

**Date Created:** 2026-04-01  
**Topic Type:** Testing Patterns  
**Difficulty:** Intermediate  
**Related:** Test Doubles, Unit Testing Patterns, Refactoring, CI/CD

