# Behavior-Driven Development (BDD)

## 📋 Learning Objectives

- [ ] Understand what BDD is and how it relates to TDD and collaboration
- [ ] Learn the Given-When-Then (GWT) scenario style for examples
- [ ] Know the roles of features, scenarios, and step definitions (in tools like Cucumber)
- [ ] Recognize when BDD helps vs when it adds overhead
- [ ] Avoid common BDD pitfalls (UI-only specs, vague language, implementation coupling)

---

## 🎯 Definition

**Behavior-Driven Development (BDD)** is a practice that uses **examples of behavior**—often written in **plain language**—to drive development and shared understanding between **developers, testers, and product stakeholders**.

It is **not** a different “kind of testing” from the inside: underneath, you still automate checks (often similar to integration or acceptance tests). What changes is **who reads the specs** and **how requirements are expressed**.

Common ingredients:

- **Feature / user story** — what we are building and why
- **Scenario** — one concrete example of behavior
- **Given-When-Then** — structure for preconditions, action, and expected outcome
- **Executable specs** (optional) — tools like Cucumber, SpecFlow, Behave map plain-text steps to code

---

## 🧭 Core Concepts

### 1) Examples over abstract requirements

BDD pushes teams to replace vague requirements (“must be secure”) with **checkable examples** (“given a locked account, when login is attempted, then show this message”).

### 2) Ubiquitous language

Terms in scenarios should match **domain language** (same words the business uses). That reduces mismatches between code and intent.

### 3) BDD vs TDD

| Aspect | TDD | BDD |
|--------|-----|-----|
| Primary focus | Design loop via tests (Red-Green-Refactor) | Shared understanding + behavior examples |
| Audience | Often developer-centric | Stakeholders can read scenarios |
| Typical format | Unit tests in code | GWT scenarios, sometimes in `.feature` files |

They **overlap**: you can write TDD-style tests using **Given-When-Then** naming (see your unit testing lesson).

### 4) Where automation lives

- **Near the domain:** good for rules and use cases.
- **Through the UI:** possible but often **slower and flakier**; many teams prefer a thin subset of UI scenarios plus more API/domain-level specs.

---

## 📊 When BDD Helps

| Situation | Use BDD-style scenarios? |
|-----------|---------------------------|
| Misalignment between product and engineering | ✅ Yes — shared examples reduce ambiguity |
| Complex business rules with many edge cases | ✅ Yes — scenarios document cases explicitly |
| Regulated or audit-heavy domains | ✅ Yes — examples support traceability |
| Solo dev, tiny throwaway script | ⚠️ Optional — plain TDD may be enough |
| Team unwilling to maintain living docs | ❌ Risk — stale `.feature` files hurt trust |

---

## ⚠️ Common Pitfalls

1. **BDD = only Cucumber**
   - Collaboration and examples matter more than the tool.
   - Fix: start with GWT in code comments or markdown if tooling is heavy.

2. **Scenarios that read like scripts of clicks**
   - Brittle, slow, hard to read.
   - Fix: express **business behavior**; hide UI details in step implementations.

3. **Vague steps (“user does something”)**
   - Not executable or reviewable.
   - Fix: concrete data and outcomes.

4. **No ownership of living documentation**
   - Green CI but scenarios nobody updates when behavior changes.
   - Fix: treat failing/changed scenarios as part of the definition of done.

5. **Duplicate coverage**
   - Same behavior tested in 20 scenarios with tiny variations.
   - Fix: scenario outlines / tables; unit tests for combinatorics.

---

## 🎯 Best Practices

1. **Write scenarios before or during refinement**, not months after shipping.

2. **One primary behavior per scenario** — clear failure diagnosis.

3. **Stable language** — rename steps when domain terms change, keep glossary consistent.

4. **Automate at the lowest reliable level** — domain/API where possible; UI for critical journeys.

5. **Keep scenarios short** — long scenarios signal missing decomposition.

6. **Review scenarios with non-developers** — if they cannot follow them, rewrite.

---

## 💻 Mini Example (GWT in plain text)

```gherkin
Feature: Account lockout

  Scenario: Locked user cannot log in
    Given a user "alice" exists with password "correct-horse"
    And the account for "alice" is locked
    When "alice" attempts to log in with password "correct-horse"
    Then login is rejected
    And the response explains the account is locked
```

Steps would be implemented in test code (exact tool depends on stack).

### Same idea in a test name + structure (no Cucumber)

```ts
it("rejects login when account is locked", () => {
  // Given
  const user = createUser({ username: "alice", locked: true });

  // When
  const result = login(user.username, "correct-horse");

  // Then
  expect(result.ok).toBe(false);
  expect(result.message).toContain("locked");
});
```

---

## 🔗 Related Topics

| Topic | Relationship |
|-------|--------------|
| Unit Testing Patterns (AAA / GWT) | Same structure; BDD often standardizes it across the team |
| TDD | Can drive implementation; BDD adds collaboration and wording |
| Integration Testing | Many BDD scenarios run at API or full-stack level |
| Domain-Driven Design | Shared ubiquitous language aligns with BDD scenarios |
| User stories / acceptance criteria | BDD scenarios often refine those into executable examples |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks

1. Rewrite one vague requirement from a past project as three GWT scenarios with concrete data.
2. Take one existing unit test and rename it + add Given-When-Then comments for readability.
3. List which scenarios you would automate at API level vs UI level for your stack.

### Interview questions

1. How is BDD different from TDD?
2. Who is the primary audience for BDD scenarios?
3. Why can UI-only BDD suites become painful?
4. What is Given-When-Then?
5. How does BDD support collaboration between roles?

---

## 📝 Key Takeaways

1. BDD centers on **examples and shared language**, not on a specific framework.
2. Given-When-Then structures **one behavior per scenario** clearly.
3. BDD complements TDD: collaboration + clarity at scenario level, TDD at unit level.
4. Automate at the **right layer** to balance speed and confidence.
5. Living scenarios require **maintenance discipline**—otherwise they become noise.

---

**Date Created:** 2026-04-05  
**Topic Type:** Testing Patterns  
**Difficulty:** Intermediate  
**Related:** TDD, Unit Testing Patterns, Integration Testing, DDD
