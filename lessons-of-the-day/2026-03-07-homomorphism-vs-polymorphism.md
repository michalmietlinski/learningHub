# Homomorphism vs Polymorphism

## 📋 Learning Objectives

- [ ] Understand polymorphism and homomorphism in simple terms
- [ ] Tell them apart: "many forms" vs "structure-preserving map"
- [ ] See polymorphism in OOP and type systems
- [ ] See homomorphism in algebra and in code (functors, monoids)
- [ ] Know when each concept applies and how they combine

---

## 🎯 Simple Form First

### Polymorphism in One Sentence

**Polymorphism** = *One name (or interface), many forms (or implementations).*

The *same* call or interface can refer to *different* behaviors depending on the type or value.

**Everyday analogy:** One remote control (interface) that works with many devices (TV, stereo, AC). You press "power" — the *form* of what happens depends on *which* device is behind the interface.

### Homomorphism in One Sentence

**Homomorphism** = *A transformation that preserves structure.*

If you have some "operation" or "structure" (e.g. adding numbers, combining lists), a homomorphism is a map **f** such that: *doing the operation then applying f* gives the *same* result as *applying f to each part then doing the operation*.

**Everyday analogy:** Converting currency. If you add two amounts in euros then convert to dollars, you get the same result as converting each to dollars and then adding. So "convert to dollars" is a homomorphism with respect to addition.

### Side-by-Side (Simple)

| | Polymorphism | Homomorphism |
|---|--------------|--------------|
| **Idea** | Many forms under one interface | Structure-preserving map |
| **Question** | "Who is behind this interface?" | "Does this map preserve the operation?" |
| **Focus** | Types / implementations | Operations / structure |
| **Example** | `animal.speak()` → Dog barks, Cat meows | `double(x + y) = double(x) + double(y)` |

### Simple Code Intuition

**Polymorphism:** Same method name, different behavior per type.

```javascript
// One interface ("speak"), many forms (dog, cat)
animal.speak();  // Dog: "Woof", Cat: "Meow"
```

**Homomorphism:** A function that "commutes" with an operation.

```javascript
// "Double" preserves addition: double(a + b) === double(a) + double(b)
const double = x => x * 2;
double(3 + 5) === double(3) + double(5);  // 16 === 16 ✓
```

So: **polymorphism** is about *which* implementation is used; **homomorphism** is about *preserving* a structure (e.g. addition) across a transformation.

---

## 📐 Simple Examples of Homomorphism

### 1. Doubling numbers (preserves addition)

- Operation: addition `+`
- Map: `f(x) = 2 * x`
- Preservation: `f(a + b) = f(a) + f(b)` → `2(a+b) = 2a + 2b` ✓

### 2. Length of a list (preserves concatenation)

- Operation: list concatenation `++`
- Map: `length(list)`
- Preservation: `length(a ++ b) = length(a) + length(b)` ✓

### 3. Taking the first element (does NOT preserve concatenation)

- Operation: concatenation
- Map: `first(list)`
- Preservation: `first(a ++ b)` is not in general `first(a) ++ first(b)` (e.g. when `a` is non-empty, `first(a ++ b) = first(a)`). So **first** is not a homomorphism for concatenation.

### 4. Negation (preserves addition in a different way)

- Operation: addition
- Map: `negate(x) = -x`
- Preservation: `negate(a + b) = negate(a) + negate(b)` → `-(a+b) = -a + (-b)` ✓

So homomorphism always depends on *which* structure (which operation) you care about.

---

## 🔀 Polymorphism: Deeper (Recap and Expand)

You already have a full lesson on [Polymorphism](../lessons-of-the-day/2025-12-31-polymorphism.md). Here we only recap so we can contrast with homomorphism.

### What polymorphism gives you

- **One interface, many implementations** – e.g. `Animal#speak()`, `Shape#area()`.
- **Subtype polymorphism** – different types used through a common supertype or interface.
- **Parametric polymorphism** – same code for many types (generics): `function id<T>(x: T): T`.
- **Ad-hoc polymorphism** – same name, different implementations per type (overloading, type classes).

### In one line

Polymorphism answers: *"What concrete type (or implementation) is behind this interface?"* It is about **variation of form** under a **single name or type**.

---

## 📐 Homomorphism: Deeper (Algebra and Code)

### In algebra

A **homomorphism** is a map between two structures of the same kind that preserves the operations.

**Example: Groups**

- Structure: a set with an operation (e.g. integers with `+`, or positive reals with `*`).
- A map `f` from group (G, ∗) to group (H, ·) is a **group homomorphism** if:
  - `f(a ∗ b) = f(a) · f(b)` for all a, b in G.

So "doing the operation in G then applying f" equals "applying f to each part then doing the operation in H".

**Example: Monoids (e.g. lists with concatenation)**

- Structure: a set with an associative operation and an identity (e.g. lists with `++` and `[]`).
- A **monoid homomorphism** `f` from (M, ⊕, e) to (N, ⊗, u) satisfies:
  - `f(e) = u`
  - `f(a ⊕ b) = f(a) ⊗ f(b)`

So the identity maps to the identity, and the operation is preserved.

### In programming: list map

For lists, "structure" can mean "the list shape and how we build it" (constructors and concatenation). In that setting, **map** behaves like a homomorphism:

- `map f (xs ++ ys) === (map f xs) ++ (map f ys)`
- `map f [] === []`

So "map f" preserves the monoid structure of lists (concat + empty). That is why we can reason about `map` and refactor (e.g. split a list, map in parallel, then concatenate).

### In programming: functors

A **functor** is a type constructor `F` with `map` that satisfies:

- `map id = id`
- `map (f . g) = map f . map g`

So `map` preserves identity and composition. In that sense, `map` is a "structure-preserving" map (homomorphism) for the structure of "functions and composition" inside the type `F`. So homomorphism shows up in the **functor laws**.

### When homomorphism helps

- **Equational reasoning** – replace "do operation then map" with "map then operation" when the map is a homomorphism.
- **Parallelization** – e.g. `map f (xs ++ ys) = (map f xs) ++ (map f ys)` lets you split work.
- **Optimization** – compilers and libraries use such laws to transform code (e.g. fusion).

---

## 📊 How They Relate

- **Polymorphism** is about **types and interfaces**: one interface, many types or implementations.
- **Homomorphism** is about **structure and operations**: one map that preserves an operation (or more).

They are **different dimensions**:

- A function can be **polymorphic** (works for many types) and **not** a homomorphism (e.g. `id` is polymorphic; "first element" is not a homomorphism for concatenation).
- A function can be a **homomorphism** (e.g. "double" for integers) and **not** polymorphic in the OOP sense (it’s just one implementation for numbers).
- A function can be **both**: e.g. a polymorphic `map` that is structure-preserving (homomorphic) for list concatenation and for functor composition.

So:

- Use **polymorphism** when you care about *abstraction over many types or implementations*.
- Use **homomorphism** when you care about *preserving an operation* (for reasoning, parallelism, or optimization).

---

## 📝 Summary (Simple → Complex)

**Simple:**

- **Polymorphism** = one interface, many forms (same name, different behavior by type).
- **Homomorphism** = a map that preserves structure (e.g. `f(a + b) = f(a) + f(b)`).

**Expanded:**

- **Polymorphism** – subtype, parametric, ad-hoc; enables flexible, generic APIs and substitution.
- **Homomorphism** – in algebra: preserves operations (e.g. group, monoid); in code: `map` over lists/functors preserves concat and composition; enables equational reasoning and parallelization.

**Relationship:** They are independent notions. Polymorphism is about *which* type or implementation; homomorphism is about *preserving* structure. The same or different functions can be one, the other, or both.

---

**Date Created:** 2026-03-07  
**Topic:** Concepts / Type theory & algebra  
**Difficulty:** Intermediate  
**Related:** [Polymorphism](2025-12-31-polymorphism.md), [Functor Pattern](2026-02-21-functor-pattern.md), [Monoid Pattern](2026-02-23-monoid-pattern.md)
