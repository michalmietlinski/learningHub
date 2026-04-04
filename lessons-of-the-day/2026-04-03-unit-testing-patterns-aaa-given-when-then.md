# Unit Testing Patterns: AAA and Given-When-Then

## 📋 Learning Objectives

- [ ] Understand why test structure patterns improve readability and maintenance
- [ ] Learn the AAA (Arrange-Act-Assert) pattern for unit tests
- [ ] Learn Given-When-Then as behavior-focused test narration
- [ ] Choose when to use AAA vs Given-When-Then
- [ ] Avoid common anti-patterns in test structure

---

## 🎯 Definition

**Unit testing patterns** are conventions for organizing tests so intent is obvious and failures are easier to diagnose.

Two widely used structures:

- **AAA (Arrange-Act-Assert)**  
  A mechanical structure focused on setup, execution, and verification.
- **Given-When-Then (GWT)**  
  A behavior narrative style often used in BDD-ish tests, but also useful in unit tests.

Both aim for the same outcome: **clear tests that communicate behavior, not implementation noise**.

---

## 🧭 Core Concepts

### 1) AAA = clear execution flow

**Arrange**
- Build test data and dependencies.
- Configure doubles (stubs/spies/mocks) if needed.

**Act**
- Perform exactly one main action under test.

**Assert**
- Verify outcomes (returned value, state change, interaction contract if relevant).

Rule of thumb: one clear **Act** per test.

### 2) Given-When-Then = behavior language

**Given**
- initial context and assumptions

**When**
- an event/action occurs

**Then**
- expected outcome

This style is great when tests represent business rules and user/domain scenarios.

### 3) They are complementary, not competing

You can write AAA code while naming test sections in GWT language.
Example:
- Arrange == Given
- Act == When
- Assert == Then

---

## 📊 AAA vs Given-When-Then

| Dimension | AAA | Given-When-Then |
|----------|-----|-----------------|
| Main strength | Mechanical clarity | Behavioral readability |
| Best for | Low-level/unit logic | Domain rules and scenarios |
| Typical style | Short, technical | Narrative, intent-rich |
| Risk if misused | Boilerplate-heavy tests | Overly verbose prose |
| Can combine? | ✅ Yes | ✅ Yes |

---

## ⚠️ Common Pitfalls

1. **Multiple Acts in one test**
   - Hard to know what actually failed.
   - Fix: split into focused tests, one behavior each.

2. **Arrange section too large**
   - Setup dominates and hides intent.
   - Fix: use builders/factories/helpers for test data.

3. **Asserting too many unrelated things**
   - One failure masks others; tests become brittle.
   - Fix: assert the key behavior for that test scenario.

4. **Mixing Act and Assert**
   - Inline assertions during setup/action reduce readability.
   - Fix: keep phases explicit.

5. **Testing internals instead of outcomes**
   - Refactors break tests without behavior changes.
   - Fix: prioritize output/state/contract assertions.

---

## 🎯 Best Practices

1. **Use explicit section comments (or spacing)**
   - `// Arrange`, `// Act`, `// Assert` helps scanning.

2. **Name tests by behavior**
   - `returns_discount_for_premium_customer`.

3. **Keep one reason to fail per test**
   - Improves diagnostics and maintenance.

4. **Abstract noisy setup**
   - Builders and helper factories keep tests focused.

5. **Prefer deterministic inputs**
   - Stub time/randomness/external APIs.

6. **Use table-driven tests for repetitive cases**
   - Reduces duplication while preserving clarity.

---

## 💻 Mini Examples

### AAA example
```ts
import { describe, it, expect } from "vitest";
import { calculateShipping } from "./shipping";

describe("calculateShipping", () => {
  it("returns free shipping for orders above threshold", () => {
    // Arrange
    const orderTotal = 150;

    // Act
    const result = calculateShipping(orderTotal);

    // Assert
    expect(result).toBe(0);
  });
});
```

### Given-When-Then example
```ts
it("applies 20% tax for EU region", () => {
  // Given
  const amount = 100;
  const region = "EU";

  // When
  const total = priceWithTax(amount, region);

  // Then
  expect(total).toBe(120);
});
```

### Combined style (recommended in many teams)
```ts
it("marks invoice as overdue after due date", () => {
  // Given / Arrange
  const invoice = createInvoice({ dueDate: "2026-04-01", paid: false });
  const now = new Date("2026-04-05");

  // When / Act
  const status = invoiceStatus(invoice, now);

  // Then / Assert
  expect(status).toBe("OVERDUE");
});
```

---

## 🔗 Related Topics

| Topic | Relationship |
|-------|--------------|
| TDD | AAA/GWT provide structure inside Red-Green-Refactor cycles |
| Test Doubles | Often configured in Arrange/Given section |
| BDD | Given-When-Then is a core BDD expression style |
| Refactoring | Clear test structure makes safe refactoring easier |
| CI/CD | Readable tests improve failure triage speed in pipelines |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks
1. Rewrite one existing test file using strict AAA structure.
2. Convert three unit tests to Given-When-Then naming and comments.
3. Find and split one test that has multiple Acts/assertion concerns.

### Interview questions
1. What problem does AAA solve in day-to-day testing?
2. How is Given-When-Then different from AAA?
3. When would you prefer one over the other?
4. Why should a unit test usually have one Act?
5. How do these patterns help with long-term maintainability?

---

## 📝 Key Takeaways

1. AAA and Given-When-Then are test-structure patterns that improve clarity.
2. AAA is execution-focused; GWT is behavior-narrative focused.
3. You can (and often should) combine them.
4. Keep tests focused: one Act, one behavior, clear assertions.
5. Good structure makes failures faster to diagnose and tests easier to evolve.

---

**Date Created:** 2026-04-03  
**Topic Type:** Testing Patterns  
**Difficulty:** Intermediate  
**Related:** TDD, Test Doubles, BDD, Refactoring

