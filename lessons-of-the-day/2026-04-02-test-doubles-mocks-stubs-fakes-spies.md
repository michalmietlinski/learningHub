# Test Doubles: Mocks, Stubs, Fakes, Spies

## 📋 Learning Objectives

- [ ] Understand what test doubles are and why they are used
- [ ] Distinguish mocks, stubs, fakes, and spies clearly
- [ ] Choose the right test double for a given test goal
- [ ] Avoid over-mocking and brittle tests
- [ ] Combine doubles with integration tests for realistic confidence

---

## 🎯 Definition

A **test double** is a controlled replacement for a real dependency used in tests.  
You use it when the real dependency is:

- slow (database, network, filesystem),
- non-deterministic (time, randomness, external APIs),
- hard to set up, or
- outside the unit you want to test.

Test doubles help keep unit tests **fast, focused, and deterministic**.

---

## 🧭 Core Types (What each one does)

### 1) Stub
Provides predefined responses; typically no assertions on how it was called.

Use when:
- your code needs input from a dependency,
- and you only care about returned data.

### 2) Mock
Pre-programmed with expectations and verifies interactions (calls/arguments/order).

Use when:
- behavior is defined by interaction contracts,
- and verifying collaboration is the test’s purpose.

### 3) Fake
A working but simplified implementation (often in-memory), suitable for tests.

Use when:
- you want realistic behavior without production complexity/infrastructure.

### 4) Spy
Records calls made to it so assertions can be done after execution.

Use when:
- you want to observe interactions but keep setup simpler than strict mocks.

---

## 📊 Quick Decision Table

| Testing need | Best double | Why |
|-------------|-------------|-----|
| “Return this value so logic can continue” | Stub | Minimal setup for input control |
| “Ensure dependency was called with X” | Mock or Spy | Verifies interaction contract |
| “Need realistic repository behavior in unit tests” | Fake | Preserves behavior without DB/network |
| “Track calls but avoid strict expectation setup” | Spy | Flexible post-hoc assertions |
| “Need end-to-end confidence in wiring” | No double (integration test) | Real dependencies validate true integration |

---

## ⚠️ Common Pitfalls

1. **Over-mocking**
   - Every dependency mocked leads to tests that only prove mocks were called.
   - Fix: mock only external boundaries; keep domain logic with real values.

2. **Testing implementation instead of behavior**
   - Strict interaction assertions break on harmless refactors.
   - Fix: prefer output/state assertions unless interaction is the actual contract.

3. **Using fakes that drift from real behavior**
   - In-memory fake may not match DB constraints or transaction semantics.
   - Fix: keep fake simple and add integration tests for contract verification.

4. **Asserting too much interaction detail**
   - Checking call order/count unnecessarily creates brittleness.
   - Fix: assert only interactions that encode business requirements.

5. **No integration tests**
   - Unit tests pass with doubles, production fails due to real wiring differences.
   - Fix: add targeted integration tests for critical boundaries.

---

## 🎯 Best Practices

1. **Use the lightest double possible**
   - Prefer stub/fake before mock when interaction verification is not essential.

2. **Mock boundaries, not core domain objects**
   - Keep business logic close to real objects and values.

3. **Name doubles by role**
   - `paymentGatewayStub`, `emailSpy`, `userRepoFake` improves readability.

4. **Keep fake behavior intentionally small**
   - Implement only behavior needed by tests; document limitations.

5. **Add contract/integration tests**
   - Validate that doubles still represent real dependency behavior where it matters.

---

## 💻 Mini Examples

### Stub example
```ts
const exchangeRateStub = {
  getRate: async () => 4.0, // fixed value
};
```

### Mock example (interaction expectation)
```ts
const notificationMock = {
  send: vi.fn(), // later assert called with expected message
};
```

### Fake example (in-memory repository)
```ts
class InMemoryUserRepoFake {
  private items = new Map<string, { id: string; email: string }>();

  async save(user: { id: string; email: string }) {
    this.items.set(user.id, user);
  }

  async findById(id: string) {
    return this.items.get(id) ?? null;
  }
}
```

### Spy example
```ts
const auditSpy = { record: vi.fn() };
// run use case...
expect(auditSpy.record).toHaveBeenCalledWith("USER_CREATED");
```

---

## 🧪 Practical Scenario (Putting it together)

Use case: `CreateUser`

- **Fake** user repository: stores users in memory.
- **Stub** clock: returns fixed timestamp.
- **Spy** audit logger: verifies event recorded.
- Optional **Mock** email sender when exact call contract matters.

This keeps tests fast and deterministic while still verifying important behavior.

---

## 🔗 Related Topics

| Topic | Relationship |
|-------|--------------|
| TDD | Test doubles help isolate units in Red-Green-Refactor loops |
| Unit Testing Patterns (AAA/GWT) | Structures tests that use doubles clearly |
| Integration Testing | Validates real dependency wiring and contracts |
| Dependency Inversion (DIP) | Interfaces make replacing dependencies in tests straightforward |
| Refactoring | Better design usually reduces painful, brittle mock-heavy tests |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks
1. Replace one real external API call in tests with a stub and assert outcome behavior.
2. Create an in-memory fake repository for one existing use case.
3. Convert one brittle interaction-heavy test to assert behavior/result instead.

### Interview questions
1. What is the difference between a stub and a mock?
2. When is a fake better than a mock?
3. Why can over-mocking make tests fragile?
4. What does a spy add over a stub?
5. Why are integration tests still needed when unit tests use doubles?

---

## 📝 Key Takeaways

1. Test doubles isolate code under test from slow or unstable dependencies.
2. Stub = fixed responses; Mock = expected interactions; Fake = lightweight real behavior; Spy = recorded interactions.
3. Use the simplest double that meets the test’s goal.
4. Avoid verifying internal implementation details unless interaction is the contract.
5. Pair unit tests with integration tests for real-world confidence.

---

**Date Created:** 2026-04-02  
**Topic Type:** Testing Patterns  
**Difficulty:** Intermediate  
**Related:** TDD, Unit Testing Patterns, Integration Testing, Dependency Inversion

