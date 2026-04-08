# Property-Based Testing

## 📋 Learning Objectives

- [ ] Understand what property-based testing is and how it differs from example-based tests
- [ ] Learn the ideas of properties, generators, and shrinking
- [ ] Know when property tests add value and when they are overkill
- [ ] Recognize good properties vs weak ones
- [ ] Connect property-based testing to TDD and traditional unit tests

---

## 🎯 Definition

**Property-based testing** is a style of automated testing where you describe **general rules (properties)** that should hold for **many inputs**, and a **test framework generates random inputs** (with optional constraints) to try to **falsify** those rules.

Instead of only:

```text
assert f(2) === 4
assert f(0) === 0
```

you might write:

```text
For all integers n in a range, f(n) satisfies some relationship with f(n+1) or with known invariants.
```

If a failure is found, the framework often **shrinks** the input to a **minimal counterexample** that still breaks the property—making debugging easier.

---

## 🧭 Core Concepts

### 1) Properties (invariants)

A **property** is a condition that should **always** be true for valid inputs, for example:

- `reverse(reverse(s)) === s` for strings
- `sort` output is non-decreasing and is a permutation of the input
- encoding then decoding recovers the original value
- deserialization never throws for valid JSON strings in a defined subset

Properties express **what must always hold**, not a single example.

### 2) Generators

The framework **generates** inputs (numbers, strings, arrays, custom objects) according to **generators** you define or compose.

You can:

- constrain ranges (e.g. positive integers)
- build custom generators for domain types
- combine generators (e.g. list of users)

### 3) Shrinking

On failure, many runtimes **search smaller** failing cases (fewer list elements, smaller numbers) to produce a **minimal** failing example.

### 4) Falsification mindset

You are not “proving” correctness (that is formal methods). You are **trying to break** the property with many random runs—similar to fuzzing at the API level.

---

## 📊 When Property-Based Testing Helps

| Situation | Good fit? | Why |
|-----------|-----------|-----|
| Pure functions (parse, transform, sort, validate) | ✅ Strong | Easy to state invariants; fast to run |
| Round-trips (encode/decode, serialize/deserialize) | ✅ Strong | Classic property |
| Data structures (invariants after insert/delete) | ✅ Strong | Many edge cases |
| Stateful systems with complex sequences | ⚠️ Possible | Need more setup; model-based testing |
| UI layout, pixel-perfect visuals | ❌ Weak | Hard to define stable properties |
| One-off glue code | ⚠️ Often | Example tests may suffice |

---

## ⚠️ Common Pitfalls

1. **Weak or tautological properties**
   - Example: `expect(x).toBe(x)` — useless.
   - Fix: tie property to real domain rules.

2. **Properties that mirror implementation**
   - `output === buggyImplementation(input)` — test passes even when behavior is wrong.
   - Fix: compare to a **trusted oracle**, simpler reference implementation, or structural laws.

3. **Flaky or unbounded generators**
   - Random huge inputs cause timeouts or OOM.
   - Fix: cap size, use “small” first, tune generator distribution.

4. **Slow tests**
   - Thousands of cases on heavy I/O.
   - Fix: keep core properties on pure logic; mock time/network boundaries.

5. **Ignoring minimal counterexamples**
   - Always read the shrunk case; it is the main debugging aid.

---

## 🎯 Best Practices

1. **Start with one strong property** before dozens of examples.

2. **Prefer pure functions** for the first properties in a codebase.

3. **Document the property in plain language** next to the test.

4. **Combine with example tests** — one or two hand-picked cases for readability, properties for breadth.

5. **Tune run count in CI** — e.g. fewer iterations on every commit, more on nightly if needed.

6. **Use generators that match real domain constraints** — invalid inputs belong in separate “should reject” tests.

---

## 💻 Mini Example (Conceptual)

Libraries vary by language:

- **JavaScript/TypeScript:** fast-check, jsverify
- **Java:** jqwik
- **Python:** Hypothesis
- **.NET:** FsCheck, Hedgehog

Illustrative pattern (TypeScript + fast-check style):

```ts
import fc from "fast-check";
import { describe, it, expect } from "vitest";
import { reverse } from "./strings";

describe("reverse", () => {
  it("double reverse equals original", () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        expect(reverse(reverse(s))).toBe(s);
      })
    );
  });
});
```

Another classic property: sorted output length equals input length (for permutations of sort).

---

## 🔗 Related Topics

| Topic | Relationship |
|-------|--------------|
| TDD | Properties can drive design; often used after core API exists |
| Unit Testing | Example tests + property tests complement each other |
| Fuzzing | Similar “random input to break assumptions”; fuzzing often targets binaries/protocols |
| Formal verification | Stronger guarantees; property tests are lighter-weight sampling |
| Refactoring | Good properties catch regressions when implementation changes |

---

## 🧪 Practice and Interview Prep

### Quick practice tasks

1. Pick one pure function you own and write one property (round-trip or idempotent law).
2. Write a second property that would fail if sort returned wrong length.
3. Run until you get a failure on purpose; observe shrunk input if the tool supports it.

### Interview questions

1. What is the difference between example-based and property-based tests?
2. What is shrinking and why is it useful?
3. What makes a “good” property?
4. Why should properties not duplicate the implementation line-for-line?
5. Where do property tests fit in the test pyramid?

---

## 📝 Key Takeaways

1. Property-based testing checks **invariants across many generated inputs**.
2. Generators define **what** is tried; properties define **what must always hold**.
3. Shrinking helps find **minimal failing examples**.
4. Best suited to **pure logic**, **round-trips**, and **invariants**—not every layer of the stack.
5. Combine with **clear example tests** and **integration tests** for balanced confidence.

---

**Date Created:** 2026-04-06  
**Topic Type:** Testing Patterns  
**Difficulty:** Intermediate  
**Related:** TDD, Unit Testing, Fuzzing, Refactoring
