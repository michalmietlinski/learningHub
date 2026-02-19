# Functor Pattern

## 📋 Learning Objectives

- [ ] Understand what a Functor is and why it matters
- [ ] Master the Functor laws (Identity and Composition)
- [ ] Recognize Functors in everyday code (Array.map, Promise.then)
- [ ] Implement custom Functors in multiple languages
- [ ] Understand the relationship: Functor → Applicative → Monad
- [ ] Apply Functors to transform wrapped values safely
- [ ] Distinguish Functors from Monads

---

## 🎯 Definition

A **Functor** is a type that can be "mapped over" - it wraps a value and provides a way to apply a function to that value without unwrapping it. The result stays wrapped in the same type.

**Key Principle:**
> "A Functor is a container that knows how to apply functions to its contents."

**In simple terms:**
- A Functor is a type that has a `map` function
- `map` applies a function to the wrapped value
- The result is still wrapped in the same Functor type

---

## 🏗️ Core Concepts

### The Simplest Functor: Array

```javascript
// Array is a Functor!
const numbers = [1, 2, 3, 4, 5];

// map applies a function to each element
const doubled = numbers.map(x => x * 2);
// Result: [2, 4, 6, 8, 10]

// The result is still an Array (same type)
console.log(Array.isArray(doubled)); // true
```

### Visual Representation

```
┌─────────────────────────────────────────────────────────┐
│                    FUNCTOR STRUCTURE                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────┐         map(f)          ┌──────────┐      │
│  │ Functor  │  ────────────────────▶  │ Functor  │      │
│  │   [a]    │                          │   [b]    │      │
│  └────┬─────┘                          └────┬─────┘      │
│       │                                    │              │
│       │ a                                  │ b            │
│       │                                    │              │
│       └──────────▶ f(a) ──────────────────┘              │
│                                                           │
│  Key: The container type stays the same!                 │
│       Only the wrapped value changes                      │
└─────────────────────────────────────────────────────────┘
```

### Functor Interface

A Functor must have:
1. **A type constructor** - A way to wrap values (e.g., `Array.of`, `Maybe.of`)
2. **A `map` function** - Applies a function to the wrapped value

```typescript
interface Functor<T> {
  map<U>(f: (value: T) => U): Functor<U>;
}
```

---

## 📊 Functor Laws

For a type to be a proper Functor, it must satisfy **two laws**:

### Law 1: Identity

**"Mapping the identity function does nothing"**

```javascript
// Identity function: x => x
const identity = x => x;

// Law: functor.map(identity) === functor
const numbers = [1, 2, 3];
const result = numbers.map(identity);

// result must be equivalent to numbers
console.log(result); // [1, 2, 3] ✓
```

**Mathematical notation:**
```
fmap id = id
```

### Law 2: Composition

**"Mapping a composition is the same as composing maps"**

```javascript
const addOne = x => x + 1;
const double = x => x * 2;

// Composition: (f ∘ g)(x) = f(g(x))
const compose = (f, g) => x => f(g(x));
const addOneThenDouble = compose(double, addOne);

const numbers = [1, 2, 3];

// Method 1: Map composition
const result1 = numbers.map(addOneThenDouble);
// [4, 6, 8]

// Method 2: Compose maps
const result2 = numbers.map(addOne).map(double);
// [4, 6, 8]

// They must be equivalent!
console.log(result1); // [4, 6, 8] ✓
console.log(result2); // [4, 6, 8] ✓
```

**Mathematical notation:**
```
fmap (f ∘ g) = fmap f ∘ fmap g
```

### Why Laws Matter

The laws ensure that:
- ✅ `map` behaves predictably
- ✅ You can reason about code mathematically
- ✅ Refactoring is safe (e.g., combining maps)
- ✅ The Functor abstraction is meaningful

---

## 🔄 Functor Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│              FUNCTIONAL PROGRAMMING HIERARCHY             │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Functor                                                  │
│  ├─ map: (a → b) → F a → F b                            │
│  └─ "Can transform wrapped values"                       │
│                                                           │
│      ↓                                                    │
│                                                           │
│  Applicative                                             │
│  ├─ Functor + ap: F (a → b) → F a → F b                │
│  └─ "Can apply wrapped functions"                       │
│                                                           │
│      ↓                                                    │
│                                                           │
│  Monad                                                    │
│  ├─ Applicative + bind: (a → M b) → M a → M b          │
│  └─ "Can chain computations"                            │
│                                                           │
│  Every Monad is an Applicative                           │
│  Every Applicative is a Functor                          │
└─────────────────────────────────────────────────────────┘
```

**Key Insight:**
- **Functor** = Can transform values (`map`)
- **Applicative** = Can apply wrapped functions (`ap`)
- **Monad** = Can chain computations (`bind`)

---

## 🛠️ Implementation Examples

### JavaScript/TypeScript

#### 1. Maybe Functor (Option)

```javascript
class Maybe {
  constructor(value) {
    this.value = value;
  }
  
  static of(value) {
    return new Maybe(value);
  }
  
  static nothing() {
    return new Maybe(null);
  }
  
  // THE FUNCTOR MAP
  map(fn) {
    // If value is null/undefined, return Nothing
    if (this.value === null || this.value === undefined) {
      return Maybe.nothing();
    }
    // Otherwise, apply function and wrap result
    return Maybe.of(fn(this.value));
  }
  
  // Helper to extract value
  getOrElse(defaultValue) {
    return this.value === null || this.value === undefined
      ? defaultValue
      : this.value;
  }
}

// Usage
const maybeNumber = Maybe.of(5);
const doubled = maybeNumber.map(x => x * 2);
console.log(doubled.getOrElse(0)); // 10

const nothing = Maybe.nothing();
const result = nothing.map(x => x * 2);
console.log(result.getOrElse(0)); // 0 (default)

// Chaining maps
const result = Maybe.of(10)
  .map(x => x + 5)      // 15
  .map(x => x * 2)      // 30
  .map(x => x.toString()); // "30"
console.log(result.getOrElse("")); // "30"
```

**Verifying Functor Laws:**

```javascript
// Law 1: Identity
const identity = x => x;
const maybe = Maybe.of(5);
const mapped = maybe.map(identity);
console.log(mapped.getOrElse(null) === maybe.getOrElse(null)); // true ✓

// Law 2: Composition
const addOne = x => x + 1;
const double = x => x * 2;
const compose = (f, g) => x => f(g(x));
const addOneThenDouble = compose(double, addOne);

const maybe = Maybe.of(5);
const result1 = maybe.map(addOneThenDouble);
const result2 = maybe.map(addOne).map(double);
console.log(result1.getOrElse(null) === result2.getOrElse(null)); // true ✓
```

#### 2. Either Functor (Result)

```javascript
class Either {
  constructor(value, isLeft) {
    this.value = value;
    this.isLeft = isLeft;
  }
  
  static left(value) {
    return new Either(value, true);
  }
  
  static right(value) {
    return new Either(value, false);
  }
  
  // THE FUNCTOR MAP
  map(fn) {
    // If it's a Left (error), don't transform
    if (this.isLeft) {
      return this;
    }
    // If it's a Right (success), apply function
    return Either.right(fn(this.value));
  }
  
  // Helper methods
  getOrElse(defaultValue) {
    return this.isLeft ? defaultValue : this.value;
  }
  
  isRight() {
    return !this.isLeft;
  }
}

// Usage
const success = Either.right(10);
const doubled = success.map(x => x * 2);
console.log(doubled.getOrElse(0)); // 20

const error = Either.left("Something went wrong");
const result = error.map(x => x * 2);
console.log(result.getOrElse(0)); // 0 (error preserved)
```

#### 3. List Functor

```javascript
class List {
  constructor(values) {
    this.values = values;
  }
  
  static of(value) {
    return new List([value]);
  }
  
  // THE FUNCTOR MAP
  map(fn) {
    return new List(this.values.map(fn));
  }
  
  // Helper to get values
  toArray() {
    return this.values;
  }
}

// Usage
const numbers = new List([1, 2, 3, 4, 5]);
const doubled = numbers.map(x => x * 2);
console.log(doubled.toArray()); // [2, 4, 6, 8, 10]

// Chaining
const result = new List([1, 2, 3])
  .map(x => x + 1)        // [2, 3, 4]
  .map(x => x * 2)        // [4, 6, 8]
  .map(x => x.toString()); // ["4", "6", "8"]
```

#### 4. Promise as Functor

```javascript
// Promises are Functors! (They have .then which is like map)
const promise = Promise.resolve(5);

// map-like behavior (using .then for transformation)
const doubled = promise.then(x => x * 2);
doubled.then(console.log); // 10

// However, Promises are also Monads (they can chain)
// But for Functor purposes, .then with a non-Promise-returning function acts like map
```

**Note:** Promises are actually Monads, but they exhibit Functor behavior when you use `.then` with functions that don't return Promises.

### TypeScript - Generic Functor Interface

```typescript
// Functor interface
interface Functor<T> {
  map<U>(f: (value: T) => U): Functor<U>;
}

// Maybe implementation
class Maybe<T> implements Functor<T> {
  private constructor(private value: T | null) {}
  
  static of<T>(value: T): Maybe<T> {
    return new Maybe(value);
  }
  
  static nothing<T>(): Maybe<T> {
    return new Maybe<T>(null);
  }
  
  map<U>(f: (value: T) => U): Maybe<U> {
    if (this.value === null || this.value === undefined) {
      return Maybe.nothing<U>();
    }
    return Maybe.of(f(this.value));
  }
  
  getOrElse(defaultValue: T): T {
    return this.value ?? defaultValue;
  }
  
  isNothing(): boolean {
    return this.value === null || this.value === undefined;
  }
}

// Usage with type safety
const maybeNumber: Maybe<number> = Maybe.of(10);
const doubled: Maybe<number> = maybeNumber.map(x => x * 2);
const asString: Maybe<string> = doubled.map(x => x.toString());

console.log(asString.getOrElse("")); // "20"
```

### Python Implementation

```python
from typing import TypeVar, Generic, Callable, Optional
from abc import ABC, abstractmethod

T = TypeVar('T')
U = TypeVar('U')

class Functor(ABC, Generic[T]):
    """Abstract base class for Functors"""
    
    @abstractmethod
    def map(self, f: Callable[[T], U]) -> 'Functor[U]':
        """Apply function to wrapped value"""
        pass

class Maybe(Functor[T], Generic[T]):
    """Maybe/Option Functor"""
    
    def __init__(self, value: Optional[T] = None):
        self._value = value
    
    @classmethod
    def of(cls, value: T) -> 'Maybe[T]':
        return cls(value)
    
    @classmethod
    def nothing(cls) -> 'Maybe[T]':
        return cls()
    
    def map(self, f: Callable[[T], U]) -> 'Maybe[U]':
        if self._value is None:
            return Maybe.nothing()
        return Maybe.of(f(self._value))
    
    def get_or_else(self, default: T) -> T:
        return self._value if self._value is not None else default
    
    def is_nothing(self) -> bool:
        return self._value is None

# Usage
maybe_number = Maybe.of(10)
doubled = maybe_number.map(lambda x: x * 2)
result = doubled.map(lambda x: str(x))

print(result.get_or_else(""))  # "20"

# Verifying laws
def identity(x):
    return x

def add_one(x):
    return x + 1

def double(x):
    return x * 2

# Law 1: Identity
maybe = Maybe.of(5)
mapped = maybe.map(identity)
assert mapped.get_or_else(None) == maybe.get_or_else(None)

# Law 2: Composition
compose = lambda f, g: lambda x: f(g(x))
add_one_then_double = compose(double, add_one)

maybe = Maybe.of(5)
result1 = maybe.map(add_one_then_double)
result2 = maybe.map(add_one).map(double)
assert result1.get_or_else(None) == result2.get_or_else(None)
```

### C# Implementation

```csharp
using System;

// Functor interface
public interface IFunctor<T>
{
    IFunctor<U> Map<U>(Func<T, U> f);
}

// Maybe Functor
public class Maybe<T> : IFunctor<T>
{
    private readonly T _value;
    private readonly bool _hasValue;
    
    private Maybe(T value, bool hasValue)
    {
        _value = value;
        _hasValue = hasValue;
    }
    
    public static Maybe<T> Of(T value)
    {
        return new Maybe<T>(value, true);
    }
    
    public static Maybe<T> Nothing()
    {
        return new Maybe<T>(default(T), false);
    }
    
    // THE FUNCTOR MAP
    public IFunctor<U> Map<U>(Func<T, U> f)
    {
        if (!_hasValue)
        {
            return Maybe<U>.Nothing();
        }
        return Maybe<U>.Of(f(_value));
    }
    
    public T GetOrElse(T defaultValue)
    {
        return _hasValue ? _value : defaultValue;
    }
    
    public bool IsNothing => !_hasValue;
}

// Usage
var maybeNumber = Maybe<int>.Of(10);
var doubled = maybeNumber.Map(x => x * 2);
var asString = doubled.Map(x => x.ToString());

Console.WriteLine(asString.GetOrElse("")); // "20"

// Chaining
var result = Maybe<int>.Of(5)
    .Map(x => x + 1)      // 6
    .Map(x => x * 2)      // 12
    .Map(x => x.ToString()); // "12"
```

### Haskell Implementation

```haskell
-- Maybe is a built-in Functor in Haskell
-- But let's define our own to understand it

data Maybe a = Nothing | Just a

-- Functor instance for Maybe
instance Functor Maybe where
  fmap f Nothing  = Nothing
  fmap f (Just x) = Just (f x)

-- Usage
maybeNumber = Just 10
doubled = fmap (* 2) maybeNumber  -- Just 20
asString = fmap show doubled      -- Just "20"

-- Chaining with <$> (infix fmap)
result = show <$> (* 2) <$> Just 10  -- Just "20"

-- Verifying laws
-- Law 1: fmap id = id
fmap id (Just 5) == Just 5  -- True

-- Law 2: fmap (f . g) = fmap f . fmap g
fmap ((* 2) . (+ 1)) (Just 5) == fmap (* 2) (fmap (+ 1) (Just 5))  -- True
```

---

## 🌟 Real-World Functors

### 1. Array.map() - The Most Common Functor

```javascript
// Arrays are Functors!
const users = [
  { id: 1, name: "Alice", age: 30 },
  { id: 2, name: "Bob", age: 25 },
  { id: 3, name: "Charlie", age: 35 }
];

// Extract names
const names = users.map(user => user.name);
// ["Alice", "Bob", "Charlie"]

// Calculate ages in 10 years
const futureAges = users.map(user => user.age + 10);
// [40, 35, 45]

// Chaining maps
const result = users
  .map(user => user.name.toUpperCase())
  .map(name => name.length)
  .map(length => length * 2);
// [10, 6, 14]
```

### 2. Optional/Maybe in Different Languages

```swift
// Swift Optional is a Functor
let maybeNumber: Int? = 10
let doubled = maybeNumber.map { $0 * 2 }  // Optional(20)
let asString = doubled.map { String($0) }  // Optional("20")
```

```kotlin
// Kotlin nullable types act like Functors
val maybeNumber: Int? = 10
val doubled = maybeNumber?.let { it * 2 }  // 20
val asString = doubled?.toString()         // "20"
```

```rust
// Rust Option is a Functor
let maybe_number: Option<i32> = Some(10);
let doubled = maybe_number.map(|x| x * 2);  // Some(20)
let as_string = doubled.map(|x| x.to_string()); // Some("20")
```

### 3. Observable/RxJS

```typescript
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Observable is a Functor (and Monad)
const numbers$ = new Observable<number>(observer => {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
});

// map transforms each emitted value
const doubled$ = numbers$.pipe(
  map(x => x * 2)
);

doubled$.subscribe(console.log); // 2, 4, 6
```

### 4. Tree Functor

```javascript
// Binary Tree as Functor
class Tree {
  constructor(value, left = null, right = null) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
  
  // THE FUNCTOR MAP
  map(fn) {
    return new Tree(
      fn(this.value),
      this.left?.map(fn) || null,
      this.right?.map(fn) || null
    );
  }
  
  // Helper to visualize
  toString(indent = 0) {
    const spaces = ' '.repeat(indent);
    let result = `${spaces}${this.value}\n`;
    if (this.left) result += this.left.toString(indent + 2);
    if (this.right) result += this.right.toString(indent + 2);
    return result;
  }
}

// Usage
const tree = new Tree(
  1,
  new Tree(2, new Tree(4), new Tree(5)),
  new Tree(3, new Tree(6), new Tree(7))
);

// Map doubles all values
const doubled = tree.map(x => x * 2);
console.log(doubled.toString());
// 2
//   4
//     8
//     10
//   6
//     12
//     14
```

---

## 🔄 Functor vs Monad

### Key Differences

| Aspect | Functor | Monad |
|--------|---------|-------|
| **Operation** | `map: (a → b) → F a → F b` | `bind: (a → M b) → M a → M b` |
| **Function Type** | Returns plain value | Returns wrapped value |
| **Power** | Transform values | Chain computations |
| **Use Case** | Simple transformations | Complex sequential operations |

### Visual Comparison

```
FUNCTOR (map):
┌──────────┐         map(f)          ┌──────────┐
│ Functor  │  ────────────────────▶  │ Functor  │
│   [a]    │    f: a → b             │   [b]    │
└──────────┘                          └──────────┘

MONAD (bind):
┌──────────┐         bind(f)         ┌──────────┐
│  Monad   │  ────────────────────▶  │  Monad   │
│   [a]    │    f: a → M b           │   [b]    │
└──────────┘                          └──────────┘
```

### Code Comparison

```javascript
// FUNCTOR: Function returns plain value
const maybeNumber = Maybe.of(10);

// map: function returns plain value
const doubled = maybeNumber.map(x => x * 2);  // Maybe<number>
// Function signature: (number) => number

// MONAD: Function returns wrapped value
const maybeNumber = Maybe.of(10);

// bind: function returns Maybe
const result = maybeNumber.bind(x => {
  if (x > 5) {
    return Maybe.of(x * 2);  // Returns Maybe!
  }
  return Maybe.nothing();
});
// Function signature: (number) => Maybe<number>
```

### When to Use Which

**Use Functor (`map`) when:**
- ✅ You're just transforming the value
- ✅ The function returns a plain value
- ✅ You don't need to make decisions based on the value

**Use Monad (`bind`) when:**
- ✅ You need to chain operations that might fail
- ✅ The function returns a wrapped value
- ✅ You need to make decisions based on the value

---

## ⚠️ Common Pitfalls

### 1. Not Preserving Structure

```javascript
// ❌ BAD: Not a proper Functor
class BadFunctor {
  constructor(value) {
    this.value = value;
  }
  
  map(fn) {
    // Returns plain value, not wrapped!
    return fn(this.value);  // Should return BadFunctor!
  }
}

// ✅ GOOD: Preserves structure
class GoodFunctor {
  constructor(value) {
    this.value = value;
  }
  
  map(fn) {
    return new GoodFunctor(fn(this.value));  // Returns wrapped value
  }
}
```

### 2. Violating Functor Laws

```javascript
// ❌ BAD: Violates identity law
class BadMaybe {
  map(fn) {
    // Always adds 1, even with identity!
    return new BadMaybe(fn(this.value) + 1);
  }
}

// ✅ GOOD: Follows laws
class GoodMaybe {
  map(fn) {
    if (this.value === null) return Maybe.nothing();
    return new GoodMaybe(fn(this.value));  // Just applies function
  }
}
```

### 3. Confusing map with bind

```javascript
// ❌ BAD: Using map when you need bind
const maybeNumber = Maybe.of(10);

// This won't work if parseNumber returns Maybe
const result = maybeNumber.map(parseNumber);
// result is Maybe<Maybe<number>> - nested!

// ✅ GOOD: Use bind for functions that return Maybe
const result = maybeNumber.bind(parseNumber);
// result is Maybe<number> - flat!
```

---

## 📊 Functor Decision Matrix

| Scenario | Use Functor? | Why |
|----------|-------------|-----|
| Transform array elements | ✅ Yes | `array.map(fn)` |
| Transform optional value | ✅ Yes | `maybe.map(fn)` |
| Transform promise value | ✅ Yes | `promise.then(fn)` |
| Chain operations that might fail | ❌ No | Use Monad (`bind`) |
| Apply wrapped function | ❌ No | Use Applicative (`ap`) |
| Simple value transformation | ✅ Yes | Functor is perfect |

---

## 🎯 Best Practices

### 1. Always Return the Same Functor Type

```javascript
// ✅ GOOD: Returns Maybe
class Maybe {
  map(fn) {
    if (this.value === null) return Maybe.nothing();
    return Maybe.of(fn(this.value));  // Same type!
  }
}

// ❌ BAD: Returns different type
class BadMaybe {
  map(fn) {
    if (this.value === null) return null;  // Not Maybe!
    return fn(this.value);  // Not Maybe!
  }
}
```

### 2. Make map Pure

```javascript
// ❌ BAD: Side effects in map
class BadFunctor {
  map(fn) {
    console.log("Mapping!");  // Side effect!
    return new BadFunctor(fn(this.value));
  }
}

// ✅ GOOD: Pure transformation
class GoodFunctor {
  map(fn) {
    return new GoodFunctor(fn(this.value));  // Pure!
  }
}
```

### 3. Test Functor Laws

```javascript
// Test suite for Functor laws
function testFunctorLaws(functor, value) {
  const identity = x => x;
  const addOne = x => x + 1;
  const double = x => x * 2;
  const compose = (f, g) => x => f(g(x));
  
  // Law 1: Identity
  const law1 = functor.map(identity);
  console.assert(
    law1.getOrElse(null) === functor.getOrElse(null),
    "Identity law failed"
  );
  
  // Law 2: Composition
  const addOneThenDouble = compose(double, addOne);
  const result1 = functor.map(addOneThenDouble);
  const result2 = functor.map(addOne).map(double);
  console.assert(
    result1.getOrElse(null) === result2.getOrElse(null),
    "Composition law failed"
  );
}

// Test
testFunctorLaws(Maybe.of(5), 5);
```

---

## 🔗 Related Patterns

| Pattern | Relationship |
|---------|--------------|
| **Monad** | Functor is the foundation - every Monad is a Functor |
| **Applicative** | Functor + ability to apply wrapped functions |
| **Iterator** | Iterators can be Functors (map over elements) |
| **Decorator** | Both wrap values, but Functor is about transformation |

---

## 📝 Key Takeaways

1. **Functor = Container + map** - A type that can transform wrapped values
2. **Two laws must hold** - Identity and Composition
3. **Every Monad is a Functor** - But not every Functor is a Monad
4. **Common in everyday code** - Arrays, Promises, Optionals all use Functor pattern
5. **map vs bind** - Use `map` for simple transformations, `bind` for chaining
6. **Preserve structure** - `map` should return the same Functor type
7. **Pure transformations** - `map` should not have side effects

---

## 🎯 Summary

The **Functor Pattern** provides:

- ✅ A way to transform wrapped values safely
- ✅ A foundation for more powerful abstractions (Applicative, Monad)
- ✅ Predictable behavior through laws
- ✅ Composition of transformations

**Functor Formula:**
```
Functor = Type + map function
map: (a → b) → F a → F b
```

**Relationship to Monads:**
```
Functor → Applicative → Monad
  ↓          ↓          ↓
 map        ap        bind
```

**Remember:**
- If you understand Functors, you're halfway to understanding Monads!
- Every `array.map()`, `promise.then()`, and `optional.map()` is using the Functor pattern
- Functors are everywhere in functional programming

---

**Date Created:** 2026-02-21  
**Pattern Type:** Functional Programming / Type Class  
**Difficulty:** Intermediate  
**Related Patterns:** Monad, Applicative, Iterator  
**Prerequisites:** Understanding of functional programming basics

