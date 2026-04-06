# Integration Testing Patterns

## 📋 Learning Objectives

- [ ] Understand what integration tests are and how they differ from unit tests
- [ ] Learn common integration patterns (slices, contracts, test containers, API tests)
- [ ] Choose what to integrate and how much to stub
- [ ] Design stable, maintainable integration test suites
- [ ] Connect integration tests to CI/CD and deployment confidence

---

## 🎯 Definition

**Integration tests** verify that **multiple real components work together** as intended—typically across boundaries such as HTTP APIs, databases, message queues, or the filesystem.

Unlike unit tests (isolated with doubles), integration tests **exercise real wiring**, schemas, serialization, and configuration mistakes that mocks hide.

They are slower and more brittle than unit tests, so you use them **selectively** for **high-value seams**.

---

## 🧭 Core Concepts

### 1) The integration seam

An **integration seam** is where two subsystems meet:

- application ↔ database
- service ↔ message broker
- client ↔ HTTP API
- module ↔ external SDK

Integration tests target seams where **contract and behavior across the boundary** matter.

### 2) Test pyramid balance

- **Many** fast unit tests (logic, rules)
- **Some** integration tests (real boundaries)
- **Few** end-to-end tests (full user journeys)

Too many integration tests → slow CI, flaky feedback.  
Too few → “green unit tests, broken production.”

### 3) Determinism and isolation

Good integration tests:

- use **known fixtures** and **clean state** between runs
- avoid depending on **production** or shared manual environments
- control **time, IDs, and ordering** when needed

---

## 📊 Common Integration Testing Patterns

| Pattern | What it tests | Typical tools / notes |
|---------|----------------|------------------------|
| **API / contract tests** | HTTP layer + handlers + serialization | Supertest, REST Client, Postman collections in CI |
| **Database integration** | Repositories, migrations, SQL, transactions | Real DB (often Docker), test schema, transactions rolled back or truncated |
| **Slice tests** | Vertical slice: use case + DB + domain, no full UI | Faster than E2E, more realistic than pure unit |
| **Test containers** | Real Postgres, Kafka, Redis in disposable containers | Testcontainers, Docker Compose in CI |
| **Consumer-driven contracts** | Service A’s expectations vs Service B’s API | Pact or similar |
| **Message integration** | Publish/consume, ordering, idempotency | Embedded broker or containerized broker |

---

## 📊 When to Use Integration Tests

| Situation | Use integration tests? | Why |
|-----------|---------------------------|-----|
| ORM / SQL correctness, migrations | ✅ Yes | Mocks cannot catch real query/schema issues |
| HTTP API contracts and status codes | ✅ Yes | Serialization and routing matter |
| Cross-service messaging | ✅ Yes | Real protocol and framing behavior |
| Pure domain calculation with no I/O | ❌ Prefer unit | Faster feedback; doubles enough |
| Full browser + all services | ⚠️ E2E / separate suite | Slower; run fewer, on main paths |

---

## ⚠️ Common Pitfalls

1. **Flaky tests (timing, ordering, shared state)**
   - Fix: isolate data per test; avoid fixed sleeps; use polling with timeout where needed.

2. **Testing everything through HTTP only**
   - Slow and broad; misses some layers.
   - Fix: add targeted DB or message tests where bugs actually appear.

3. **Using production or shared dev databases**
   - Nondeterministic; breaks CI.
   - Fix: dedicated test DB or containers; migrations applied in pipeline.

4. **No cleanup between tests**
   - Order-dependent failures.
   - Fix: truncate tables, rollback transactions, or recreate schema per suite.

5. **Integration tests without clear ownership**
   - Suite rots when nobody runs it locally.
   - Fix: same standards as unit tests; run in CI on every PR.

---

## 🎯 Best Practices

1. **Name tests by scenario and outcome**
   - Example: `returns_404_when_order_not_found`.

2. **Keep each test one main scenario**
   - Easier failures to diagnose.

3. **Use factories/fixtures for data**
   - Avoid huge copy-paste setup.

4. **Prefer idempotent setup**
   - Same test run twice should behave the same.

5. **Tag or split slow suites**
   - Fast tests on every commit; heavy integration on merge/nightly if needed.

6. **Log enough on failure**
   - Request/response body, SQL error, last events—without secrets in logs.

---

## 💻 Mini Example (API + DB slice sketch)

```ts
// Pseudocode: one integration test hitting real test DB

beforeEach(async () => {
  await resetDatabase(); // or transaction rollback wrapper
  await seedMinimalUsers();
});

it("creates order and persists line items", async () => {
  const res = await request(app)
    .post("/orders")
    .send({ userId: "u1", items: [{ sku: "A", qty: 2 }] })
    .expect(201);

  const row = await db.query(
    "SELECT count(*) AS c FROM order_lines WHERE order_id = $1",
    [res.body.orderId]
  );
  expect(Number(row.rows[0].c)).toBe(1);
});
```

What this validates: routing, handler, persistence, and schema—things unit tests with mocks often miss.

---

## 🔗 Related Topics

| Topic | Relationship |
|-------|--------------|
| Unit Testing (AAA / GWT) | Structure tests; integration tests often reuse Arrange/Given style |
| Test Doubles | Use fewer doubles here; real boundaries are the point |
| TDD | Unit TDD for logic; integration tests for seams |
| CI/CD | Integration tests belong in pipeline; may need services/containers |
| Health Checks / Resilience | Operational behavior complements integration coverage |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks

1. Add one integration test that hits your real DB (or Testcontainers) for a single repository method.
2. Add one API test that asserts status code + body shape + one persisted field.
3. List three flaky risks in your integration suite and how you would mitigate them.

### Interview questions

1. What is the difference between unit and integration tests?
2. Why can integration tests catch bugs that unit tests miss?
3. How do you avoid flaky integration tests?
4. What is a “test pyramid” and why does it matter?
5. When would you use contract testing between services?

---

## 📝 Key Takeaways

1. Integration tests verify **real collaboration** across boundaries.
2. Use them for **high-value seams**: DB, HTTP, messaging, external SDKs.
3. Balance **speed vs confidence** with the test pyramid.
4. **Determinism** (data, time, cleanup) is the main quality battle.
5. Pair **fast unit tests** with **focused integration tests** for maintainable confidence.

---

**Date Created:** 2026-04-04  
**Topic Type:** Testing Patterns  
**Difficulty:** Intermediate  
**Related:** Unit Testing Patterns, Test Doubles, TDD, CI/CD, Testcontainers
