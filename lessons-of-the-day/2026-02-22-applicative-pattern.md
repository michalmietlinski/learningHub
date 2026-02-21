# Applicative Pattern

## 📋 Learning Objectives

- [ ] Understand what an Applicative is and how it extends Functor
- [ ] Master the Applicative laws (Identity, Homomorphism, Interchange, Composition)
- [ ] Recognize the difference between `map` (Functor) and `ap` (Applicative)
- [ ] Understand when to use Applicative vs Functor vs Monad
- [ ] Implement custom Applicatives in multiple languages
- [ ] Apply Applicatives to combine multiple wrapped values
- [ ] Understand the relationship: Functor → Applicative → Monad

---

## 🎯 Definition

An **Applicative** is a type that extends Functor by providing the ability to apply a wrapped function to a wrapped value. While Functors can apply plain functions to wrapped values, Applicatives can apply functions that are themselves wrapped.

**Key Principle:**
> "An Applicative is a Functor that can apply wrapped functions to wrapped values."

**In simple terms:**
- A Functor has `map: (a → b) → F a → F b` (plain function)
- An Applicative adds `ap: F (a → b) → F a → F b` (wrapped function)
- This allows combining multiple wrapped values together

---

## 🏗️ Core Concepts

### The Problem Applicative Solves

**With Functor (map):**
```javascript
// We can apply a plain function to a wrapped value
const maybeNumber = Maybe.of(5);
const doubled = maybeNumber.map(x => x * 2);  // Maybe(10)
```

**But what if we have a wrapped function?**
```javascript
// ❌ This doesn't work with just map!
const maybeFunction = Maybe.of(x => x * 2);
const maybeNumber = Maybe.of(5);

// How do we apply maybeFunction to maybeNumber?
// map expects a plain function, not a wrapped one!
```

**With Applicative (ap):**
```javascript
// ✅ Applicative can apply wrapped functions!
const maybeFunction = Maybe.of(x => x * 2);
const maybeNumber = Maybe.of(5);
const result = maybeFunction.ap(maybeNumber);  // Maybe(10)
```

### Visual Representation

```
┌─────────────────────────────────────────────────────────┐
│              APPLICATIVE STRUCTURE                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  FUNCTOR (map):                                          │
│  ┌──────────┐         map(f)          ┌──────────┐      │
│  │ Functor  │  ────────────────────▶  │ Functor  │      │
│  │   [a]    │    f: a → b             │   [b]    │      │
│  └──────────┘                          └──────────┘      │
│                                                           │
│  APPLICATIVE (ap):                                       │
│  ┌──────────────┐         ap            ┌──────────┐      │
│  │ Applicative  │  ──────────────────▶  │ Applicative│    │
│  │  [a → b]     │                        │   [b]    │      │
│  └──────┬───────┘                        └────┬─────┘      │
│         │                                      │            │
│         │ f: a → b                            │ b          │
│         │                                      │            │
│         └──────────▶ F a ─────────────────────┘            │
│                                                           │
│  Key: Can apply wrapped functions to wrapped values!      │
└─────────────────────────────────────────────────────────┘
```

### Applicative Interface

An Applicative must have:
1. **A type constructor** - A way to wrap values (e.g., `Applicative.of`)
2. **A `map` function** - From Functor (applies plain function)
3. **An `ap` function** - Applies wrapped function to wrapped value
4. **A `pure`/`of` function** - Lifts a value into the Applicative

```typescript
interface Applicative<T> extends Functor<T> {
  // From Functor
  map<U>(f: (value: T) => U): Applicative<U>;
  
  // Applicative-specific
  ap<U>(f: Applicative<(value: T) => U>): Applicative<U>;
  
  // Lift value into Applicative
  static of<U>(value: U): Applicative<U>;
}
```

---

## 📊 Applicative Laws

For a type to be a proper Applicative, it must satisfy **four laws**:

### Law 1: Identity

**"Applying a wrapped identity function does nothing"**

```javascript
// Identity function wrapped
const identity = x => x;
const wrappedId = Maybe.of(identity);

// Law: wrappedId.ap(v) === v
const value = Maybe.of(5);
const result = wrappedId.ap(value);

// result must be equivalent to value
console.log(result.getOrElse(null) === value.getOrElse(null)); // true ✓
```

**Mathematical notation:**
```
pure id <*> v = v
```

### Law 2: Homomorphism

**"Applying a wrapped function to a wrapped value is the same as wrapping the result of applying the function"**

```javascript
const addOne = x => x + 1;
const value = 5;

// Method 1: Wrap function, then apply
const result1 = Maybe.of(addOne).ap(Maybe.of(value));
// Maybe(6)

// Method 2: Apply function, then wrap
const result2 = Maybe.of(addOne(value));
// Maybe(6)

// They must be equivalent!
console.log(result1.getOrElse(null) === result2.getOrElse(null)); // true ✓
```

**Mathematical notation:**
```
pure f <*> pure x = pure (f x)
```

### Law 3: Interchange

**"The order of wrapping doesn't matter when applying"**

```javascript
const addOne = x => x + 1;
const value = 5;

// Method 1: Wrap function, apply to wrapped value
const result1 = Maybe.of(addOne).ap(Maybe.of(value));

// Method 2: Wrap a function that takes the function, apply to unwrapped value
const applyToValue = f => f(value);
const result2 = Maybe.of(applyToValue).ap(Maybe.of(addOne));

// They must be equivalent!
console.log(result1.getOrElse(null) === result2.getOrElse(null)); // true ✓
```

**Mathematical notation:**
```
u <*> pure y = pure ($ y) <*> u
```

### Law 4: Composition

**"Composition of wrapped functions works as expected"**

```javascript
const addOne = x => x + 1;
const double = x => x * 2;
const compose = (f, g) => x => f(g(x));

// Method 1: Compose wrapped functions, then apply
const composed = Maybe.of(compose(double, addOne));
const result1 = composed.ap(Maybe.of(5));
// Maybe(12) - (5 + 1) * 2

// Method 2: Apply functions separately
const wrappedDouble = Maybe.of(double);
const wrappedAddOne = Maybe.of(addOne);
const result2 = wrappedDouble.ap(wrappedAddOne.ap(Maybe.of(5)));
// Maybe(12)

// They must be equivalent!
console.log(result1.getOrElse(null) === result2.getOrElse(null)); // true ✓
```

**Mathematical notation:**
```
pure (.) <*> u <*> v <*> w = u <*> (v <*> w)
```

### Why Laws Matter

The laws ensure that:
- ✅ `ap` behaves predictably
- ✅ You can reason about code mathematically
- ✅ Refactoring is safe
- ✅ The Applicative abstraction is meaningful
- ✅ Composition works as expected

---

## 🔄 Applicative Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│         FUNCTIONAL PROGRAMMING HIERARCHY                 │
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
│  ├─ pure/of: a → F a                                    │
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
- **Applicative** = Can apply wrapped functions (`ap`) + combine multiple wrapped values
- **Monad** = Can chain computations (`bind`)

---

## 🛠️ Implementation Examples

### JavaScript/TypeScript

#### 1. Maybe Applicative

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
  
  // FUNCTOR: map (from Functor)
  map(fn) {
    if (this.value === null || this.value === undefined) {
      return Maybe.nothing();
    }
    return Maybe.of(fn(this.value));
  }
  
  // APPLICATIVE: ap (apply wrapped function)
  ap(other) {
    // If this Maybe contains null/undefined, return Nothing
    if (this.value === null || this.value === undefined) {
      return Maybe.nothing();
    }
    // If this Maybe contains a function, apply it to other's value
    if (typeof this.value === 'function') {
      return other.map(this.value);
    }
    // Otherwise, this is not a function - return Nothing
    return Maybe.nothing();
  }
  
  // Helper methods
  getOrElse(defaultValue) {
    return this.value === null || this.value === undefined
      ? defaultValue
      : this.value;
  }
  
  isNothing() {
    return this.value === null || this.value === undefined;
  }
}

// Usage: Applying wrapped functions
const add = x => y => x + y;
const wrappedAdd = Maybe.of(add(5));  // Maybe(x => 5 + x)
const wrappedValue = Maybe.of(10);
const result = wrappedAdd.ap(wrappedValue);  // Maybe(15)
console.log(result.getOrElse(null)); // 15

// Combining multiple wrapped values
const multiply = x => y => x * y;
const wrappedMultiply = Maybe.of(multiply);
const wrappedX = Maybe.of(5);
const wrappedY = Maybe.of(3);

// Apply multiply to x, then to y
const step1 = wrappedMultiply.ap(wrappedX);  // Maybe(y => 5 * y)
const result = step1.ap(wrappedY);  // Maybe(15)
console.log(result.getOrElse(null)); // 15

// Handling Nothing
const nothing = Maybe.nothing();
const result2 = wrappedAdd.ap(nothing);  // Maybe.nothing()
console.log(result2.isNothing()); // true
```

**Helper function for cleaner syntax:**

```javascript
// Helper to lift a function into Applicative
const liftA2 = (fn) => (fa, fb) => 
  Maybe.of(fn).ap(fa).ap(fb);

// Usage
const add = (x, y) => x + y;
const wrappedX = Maybe.of(5);
const wrappedY = Maybe.of(10);
const result = liftA2(add)(wrappedX, wrappedY);  // Maybe(15)

// Or with curried function
const addCurried = x => y => x + y;
const result2 = Maybe.of(addCurried)
  .ap(Maybe.of(5))
  .ap(Maybe.of(10));  // Maybe(15)
```

#### 2. Either Applicative

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
  
  // FUNCTOR: map
  map(fn) {
    if (this.isLeft) {
      return this;
    }
    return Either.right(fn(this.value));
  }
  
  // APPLICATIVE: ap
  ap(other) {
    // If this is Left (error), propagate error
    if (this.isLeft) {
      return this;
    }
    // If this contains a function, apply it
    if (typeof this.value === 'function') {
      return other.map(this.value);
    }
    // Otherwise, return Left
    return Either.left("Not a function");
  }
  
  getOrElse(defaultValue) {
    return this.isLeft ? defaultValue : this.value;
  }
  
  isRight() {
    return !this.isLeft;
  }
}

// Usage
const add = x => y => x + y;
const wrappedAdd = Either.right(add(5));
const wrappedValue = Either.right(10);
const result = wrappedAdd.ap(wrappedValue);  // Either.right(15)

// Error propagation
const error = Either.left("Something went wrong");
const result2 = wrappedAdd.ap(error);  // Either.left("Something went wrong")
```

#### 3. List Applicative

```javascript
class List {
  constructor(values) {
    this.values = values;
  }
  
  static of(value) {
    return new List([value]);
  }
  
  // FUNCTOR: map
  map(fn) {
    return new List(this.values.map(fn));
  }
  
  // APPLICATIVE: ap
  ap(other) {
    // Apply each function in this list to each value in other list
    const results = [];
    for (const fn of this.values) {
      for (const value of other.values) {
        results.push(fn(value));
      }
    }
    return new List(results);
  }
  
  toArray() {
    return this.values;
  }
}

// Usage: List of functions applied to list of values
const functions = new List([
  x => x * 2,
  x => x + 10,
  x => x * x
]);
const values = new List([1, 2, 3]);

const result = functions.ap(values);
console.log(result.toArray());
// [2, 4, 6, 11, 12, 13, 1, 4, 9]
// Each function applied to each value (cartesian product)
```

#### 4. Promise as Applicative

```javascript
// Promises can act as Applicatives
const promiseFunction = Promise.resolve(x => x * 2);
const promiseValue = Promise.resolve(10);

// Using ap pattern (though Promises don't have ap natively)
const ap = (promiseFn, promiseValue) => {
  return Promise.all([promiseFn, promiseValue])
    .then(([fn, value]) => fn(value));
};

const result = ap(promiseFunction, promiseValue);
result.then(console.log); // 20

// Or with async/await
const apAsync = async (promiseFn, promiseValue) => {
  const [fn, value] = await Promise.all([promiseFn, promiseValue]);
  return fn(value);
};
```

### TypeScript - Generic Applicative Interface

```typescript
// Functor interface (base)
interface Functor<T> {
  map<U>(f: (value: T) => U): Functor<U>;
}

// Applicative interface (extends Functor)
interface Applicative<T> extends Functor<T> {
  ap<U>(f: Applicative<(value: T) => U>): Applicative<U>;
}

// Maybe implementation
class Maybe<T> implements Applicative<T> {
  private constructor(private value: T | null) {}
  
  static of<U>(value: U): Maybe<U> {
    return new Maybe(value);
  }
  
  static nothing<U>(): Maybe<U> {
    return new Maybe<U>(null);
  }
  
  // Functor
  map<U>(f: (value: T) => U): Maybe<U> {
    if (this.value === null || this.value === undefined) {
      return Maybe.nothing<U>();
    }
    return Maybe.of(f(this.value));
  }
  
  // Applicative
  ap<U>(other: Maybe<(value: T) => U>): Maybe<U> {
    if (this.value === null || this.value === undefined) {
      return Maybe.nothing<U>();
    }
    if (typeof this.value === 'function') {
      return other.map(this.value as any);
    }
    return Maybe.nothing<U>();
  }
  
  getOrElse(defaultValue: T): T {
    return this.value ?? defaultValue;
  }
  
  isNothing(): boolean {
    return this.value === null || this.value === undefined;
  }
}

// Helper function
function liftA2<T, U, V>(
  fn: (a: T, b: U) => V
): (fa: Maybe<T>, fb: Maybe<U>) => Maybe<V> {
  return (fa, fb) => 
    Maybe.of(fn).ap(fa).ap(fb);
}

// Usage
const add = (x: number, y: number) => x + y;
const wrappedX = Maybe.of(5);
const wrappedY = Maybe.of(10);
const result = liftA2(add)(wrappedX, wrappedY);  // Maybe(15)
```

### Python Implementation

```python
from typing import TypeVar, Generic, Callable, Optional, Protocol
from abc import ABC, abstractmethod

T = TypeVar('T')
U = TypeVar('U')
V = TypeVar('V')

class Functor(ABC, Generic[T]):
    """Functor interface"""
    
    @abstractmethod
    def map(self, f: Callable[[T], U]) -> 'Functor[U]':
        """Apply function to wrapped value"""
        pass

class Applicative(Functor[T], Generic[T]):
    """Applicative interface (extends Functor)"""
    
    @abstractmethod
    def ap(self, other: 'Applicative[Callable[[T], U]]') -> 'Applicative[U]':
        """Apply wrapped function to wrapped value"""
        pass
    
    @classmethod
    @abstractmethod
    def of(cls, value: U) -> 'Applicative[U]':
        """Lift value into Applicative"""
        pass

class Maybe(Applicative[T], Generic[T]):
    """Maybe/Option Applicative"""
    
    def __init__(self, value: Optional[T] = None):
        self._value = value
    
    @classmethod
    def of(cls, value: U) -> 'Maybe[U]':
        return cls(value)
    
    @classmethod
    def nothing(cls) -> 'Maybe[T]':
        return cls()
    
    # Functor
    def map(self, f: Callable[[T], U]) -> 'Maybe[U]':
        if self._value is None:
            return Maybe.nothing()
        return Maybe.of(f(self._value))
    
    # Applicative
    def ap(self, other: 'Maybe[Callable[[T], U]]') -> 'Maybe[U]':
        if self._value is None:
            return Maybe.nothing()
        if callable(self._value):
            return other.map(self._value)
        return Maybe.nothing()
    
    def get_or_else(self, default: T) -> T:
        return self._value if self._value is not None else default
    
    def is_nothing(self) -> bool:
        return self._value is None

# Helper function
def lift_a2(fn: Callable[[T, U], V]) -> Callable[['Maybe[T]', 'Maybe[U]'], 'Maybe[V]']:
    def lifted(fa: Maybe[T], fb: Maybe[U]) -> Maybe[V]:
        return Maybe.of(fn).ap(fa).ap(fb)
    return lifted

# Usage
def add(x: int, y: int) -> int:
    return x + y

wrapped_x = Maybe.of(5)
wrapped_y = Maybe.of(10)
result = lift_a2(add)(wrapped_x, wrapped_y)
print(result.get_or_else(0))  # 15

# Verifying laws
def identity(x):
    return x

# Law 1: Identity
wrapped_id = Maybe.of(identity)
value = Maybe.of(5)
result1 = wrapped_id.ap(value)
assert result1.get_or_else(None) == value.get_or_else(None)
```

### C# Implementation

```csharp
using System;

// Functor interface
public interface IFunctor<T>
{
    IFunctor<U> Map<U>(Func<T, U> f);
}

// Applicative interface
public interface IApplicative<T> : IFunctor<T>
{
    IApplicative<U> Ap<U>(IApplicative<Func<T, U>> f);
}

// Maybe Applicative
public class Maybe<T> : IApplicative<T>
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
    
    // Functor
    public IFunctor<U> Map<U>(Func<T, U> f)
    {
        if (!_hasValue)
        {
            return Maybe<U>.Nothing();
        }
        return Maybe<U>.Of(f(_value));
    }
    
    // Applicative
    public IApplicative<U> Ap<U>(IApplicative<Func<T, U>> other)
    {
        if (!_hasValue)
        {
            return Maybe<U>.Nothing();
        }
        
        var maybeFunc = other as Maybe<Func<T, U>>;
        if (maybeFunc == null || !maybeFunc._hasValue)
        {
            return Maybe<U>.Nothing();
        }
        
        if (_value is Func<T, U> func)
        {
            return maybeFunc.Map(func);
        }
        
        return Maybe<U>.Nothing();
    }
    
    public T GetOrElse(T defaultValue)
    {
        return _hasValue ? _value : defaultValue;
    }
    
    public bool IsNothing => !_hasValue;
}

// Helper function
public static class ApplicativeHelpers
{
    public static Maybe<C> LiftA2<A, B, C>(
        Func<A, B, C> fn,
        Maybe<A> fa,
        Maybe<B> fb)
    {
        return Maybe<Func<A, Func<B, C>>>
            .Of(a => b => fn(a, b))
            .Ap(fa)
            .Ap(fb) as Maybe<C>;
    }
}

// Usage
var add = new Func<int, int, int>((x, y) => x + y);
var wrappedX = Maybe<int>.Of(5);
var wrappedY = Maybe<int>.Of(10);
var result = ApplicativeHelpers.LiftA2(add, wrappedX, wrappedY);
Console.WriteLine(result.GetOrElse(0)); // 15
```

### Haskell Implementation

```haskell
-- Maybe is a built-in Applicative in Haskell
-- But let's understand how it works

data Maybe a = Nothing | Just a

-- Functor instance
instance Functor Maybe where
  fmap f Nothing  = Nothing
  fmap f (Just x) = Just (f x)

-- Applicative instance
instance Applicative Maybe where
  pure = Just
  Nothing <*> _ = Nothing
  (Just f) <*> m = fmap f m

-- Usage with <*> (ap operator)
add :: Int -> Int -> Int
add x y = x + y

wrappedAdd :: Maybe (Int -> Int -> Int)
wrappedAdd = Just add

wrappedX :: Maybe Int
wrappedX = Just 5

wrappedY :: Maybe Int
wrappedY = Just 10

-- Apply wrapped function
result :: Maybe Int
result = wrappedAdd <*> wrappedX <*> wrappedY
-- Just 15

-- Or using <$> (fmap) and <*> together
result2 :: Maybe Int
result2 = add <$> wrappedX <*> wrappedY
-- Just 15

-- Verifying laws
-- Law 1: pure id <*> v = v
pure id <*> Just 5 == Just 5  -- True

-- Law 2: pure f <*> pure x = pure (f x)
pure (+1) <*> pure 5 == pure ((+1) 5)  -- True (both are Just 6)
```

---

## 🌟 Real-World Applications

### 1. Combining Multiple Optional Values

```javascript
// Problem: Combine multiple Maybe values
const getUser = (id) => Maybe.of({ id, name: "Alice" });
const getAge = (user) => Maybe.of(30);
const getEmail = (user) => Maybe.of("alice@example.com");

// ❌ BAD: Nested maps (gets messy)
const user = getUser(1);
const age = user.map(getAge);  // Maybe<Maybe<number>>
const email = user.map(getEmail);  // Maybe<Maybe<string>>

// ✅ GOOD: Using Applicative to combine
const createProfile = (name, age, email) => ({
  name,
  age,
  email
});

const profile = Maybe.of(createProfile)
  .ap(user.map(u => u.name))
  .ap(user.bind(getAge))
  .ap(user.map(getEmail));

// Or with helper
const liftA3 = (fn) => (fa, fb, fc) =>
  Maybe.of(fn).ap(fa).ap(fb).ap(fc);

const profile2 = liftA3(createProfile)(
  user.map(u => u.name),
  user.bind(getAge),
  user.map(getEmail)
);
```

### 2. Form Validation

```javascript
// Validate form fields independently
const validateName = (name) => 
  name.length >= 3 
    ? Maybe.of(name) 
    : Maybe.nothing();

const validateEmail = (email) =>
  email.includes('@')
    ? Maybe.of(email)
    : Maybe.nothing();

const validateAge = (age) =>
  age >= 18
    ? Maybe.of(age)
    : Maybe.nothing();

// Combine validations
const createUser = (name, email, age) => ({
  name,
  email,
  age
});

const name = validateName("Alice");
const email = validateEmail("alice@example.com");
const age = validateAge(25);

// All validations must pass
const user = Maybe.of(createUser)
  .ap(name)
  .ap(email)
  .ap(age);

if (user.isNothing()) {
  console.log("Validation failed");
} else {
  console.log("User created:", user.getOrElse(null));
}
```

### 3. Parallel API Calls

```javascript
// Fetch data from multiple APIs in parallel
const fetchUser = (id) => 
  Promise.resolve({ id, name: "Alice" });

const fetchPosts = (userId) => 
  Promise.resolve([{ id: 1, title: "Post 1" }]);

const fetchComments = (userId) => 
  Promise.resolve([{ id: 1, text: "Comment 1" }]);

// Combine results
const combineData = (user, posts, comments) => ({
  user,
  posts,
  comments
});

// Using Promise.all (which acts like Applicative)
Promise.all([
  fetchUser(1),
  fetchPosts(1),
  fetchComments(1)
]).then(([user, posts, comments]) => {
  const result = combineData(user, posts, comments);
  console.log(result);
});
```

### 4. Configuration Parsing

```javascript
// Parse configuration from environment variables
const getEnv = (key) => {
  const value = process.env[key];
  return value ? Maybe.of(value) : Maybe.nothing();
};

const parseInt = (str) => {
  const num = Number.parseInt(str, 10);
  return Number.isNaN(num) ? Maybe.nothing() : Maybe.of(num);
};

const parseBool = (str) => {
  return str === "true" ? Maybe.of(true) : 
         str === "false" ? Maybe.of(false) : 
         Maybe.nothing();
};

// Combine configuration
const createConfig = (port, host, debug) => ({
  port,
  host,
  debug
});

const config = Maybe.of(createConfig)
  .ap(getEnv("PORT").bind(parseInt))
  .ap(getEnv("HOST"))
  .ap(getEnv("DEBUG").bind(parseBool));

console.log(config.getOrElse({ 
  port: 3000, 
  host: "localhost", 
  debug: false 
}));
```

---

## 🔄 Applicative vs Functor vs Monad

### Comparison Table

| Aspect | Functor | Applicative | Monad |
|--------|---------|-------------|-------|
| **Operation** | `map: (a → b) → F a → F b` | `ap: F (a → b) → F a → F b` | `bind: (a → M b) → M a → M b` |
| **Function Type** | Plain function | Wrapped function | Function returning wrapped |
| **Power** | Transform values | Combine wrapped values | Chain computations |
| **Use Case** | Simple transformations | Parallel operations | Sequential operations |
| **Dependencies** | None | Can combine multiple | Can depend on previous |

### Visual Comparison

```
FUNCTOR (map):
┌──────────┐         map(f)          ┌──────────┐
│ Functor  │  ────────────────────▶  │ Functor  │
│   [a]    │    f: a → b             │   [b]    │
└──────────┘                          └──────────┘

APPLICATIVE (ap):
┌──────────────┐         ap            ┌──────────┐
│ Applicative  │  ──────────────────▶  │ Applicative│
│  [a → b]     │                        │   [b]    │
└──────┬───────┘                        └────┬─────┘
       │                                      │
       └──────────▶ F a ─────────────────────┘

MONAD (bind):
┌──────────┐         bind(f)         ┌──────────┐
│  Monad   │  ────────────────────▶  │  Monad   │
│   [a]    │    f: a → M b           │   [b]    │
└──────────┘                          └──────────┘
```

### Code Comparison

```javascript
// FUNCTOR: Simple transformation
const maybeNumber = Maybe.of(10);
const doubled = maybeNumber.map(x => x * 2);  // Maybe(20)
// Function: (number) => number

// APPLICATIVE: Combine multiple wrapped values
const add = x => y => x + y;
const wrappedAdd = Maybe.of(add(5));
const wrappedValue = Maybe.of(10);
const result = wrappedAdd.ap(wrappedValue);  // Maybe(15)
// Function: wrapped in Maybe

// MONAD: Chain operations that might fail
const maybeNumber = Maybe.of(10);
const result = maybeNumber.bind(x => {
  if (x > 5) {
    return Maybe.of(x * 2);  // Returns Maybe!
  }
  return Maybe.nothing();
});
// Function: (number) => Maybe<number>
```

### When to Use Which

**Use Functor (`map`) when:**
- ✅ You're just transforming a single value
- ✅ The function returns a plain value
- ✅ No dependencies between operations

**Use Applicative (`ap`) when:**
- ✅ You need to combine multiple wrapped values
- ✅ Operations are independent (can run in parallel)
- ✅ You have a wrapped function to apply
- ✅ You want to validate multiple things at once

**Use Monad (`bind`) when:**
- ✅ Operations depend on previous results
- ✅ The function returns a wrapped value
- ✅ You need sequential, conditional logic
- ✅ You need to chain operations that might fail

---

## ⚠️ Common Pitfalls

### 1. Using map Instead of ap

```javascript
// ❌ BAD: Using map with wrapped function
const wrappedFunction = Maybe.of(x => x * 2);
const wrappedValue = Maybe.of(10);

// This creates Maybe<Maybe<number>> - nested!
const result = wrappedValue.map(wrappedFunction.getOrElse(null));

// ✅ GOOD: Use ap
const result = wrappedFunction.ap(wrappedValue);  // Maybe(20)
```

### 2. Not Currying Functions

```javascript
// ❌ BAD: Non-curried function
const add = (x, y) => x + y;
const wrappedAdd = Maybe.of(add);  // Can't apply partially!

// ✅ GOOD: Curried function
const add = x => y => x + y;
const wrappedAdd = Maybe.of(add(5));  // Maybe(y => 5 + y)
const result = wrappedAdd.ap(Maybe.of(10));  // Maybe(15)
```

### 3. Violating Applicative Laws

```javascript
// ❌ BAD: Violates identity law
class BadApplicative {
  ap(other) {
    // Always adds 1, even with identity!
    return other.map(x => x + 1);
  }
}

// ✅ GOOD: Follows laws
class GoodApplicative {
  ap(other) {
    if (this.value === null) return Applicative.nothing();
    if (typeof this.value === 'function') {
      return other.map(this.value);
    }
    return Applicative.nothing();
  }
}
```

### 4. Confusing ap with bind

```javascript
// ❌ BAD: Using ap when you need bind
const maybeNumber = Maybe.of(10);
const parseNumber = (x) => {
  if (x > 5) return Maybe.of(x * 2);
  return Maybe.nothing();
};

// ap expects wrapped function, not function returning Maybe
const wrappedParse = Maybe.of(parseNumber);
const result = wrappedParse.ap(maybeNumber);  // Wrong!

// ✅ GOOD: Use bind for functions returning Maybe
const result = maybeNumber.bind(parseNumber);  // Correct!
```

---

## 📊 Applicative Decision Matrix

| Scenario | Use Applicative? | Why |
|----------|-----------------|-----|
| Combine multiple Maybe values | ✅ Yes | `ap` combines them |
| Validate multiple form fields | ✅ Yes | Independent validations |
| Parallel API calls | ✅ Yes | Independent operations |
| Transform single value | ❌ No | Use Functor (`map`) |
| Chain operations that depend on each other | ❌ No | Use Monad (`bind`) |
| Apply wrapped function | ✅ Yes | That's what `ap` does! |

---

## 🎯 Best Practices

### 1. Use Helper Functions for Cleaner Syntax

```javascript
// Helper to lift functions
const liftA2 = (fn) => (fa, fb) => 
  Maybe.of(fn).ap(fa).ap(fb);

const liftA3 = (fn) => (fa, fb, fc) =>
  Maybe.of(fn).ap(fa).ap(fb).ap(fc);

// Usage
const add = (x, y) => x + y;
const result = liftA2(add)(Maybe.of(5), Maybe.of(10));
```

### 2. Curry Functions for Partial Application

```javascript
// ✅ GOOD: Curried functions work well with Applicative
const add = x => y => x + y;
const multiply = x => y => x * y;

// Can apply partially
const add5 = Maybe.of(add(5));
const result = add5.ap(Maybe.of(10));  // Maybe(15)
```

### 3. Test Applicative Laws

```javascript
// Test suite for Applicative laws
function testApplicativeLaws(applicative, value) {
  const identity = x => x;
  const addOne = x => x + 1;
  const double = x => x * 2;
  
  // Law 1: Identity
  const wrappedId = applicative.constructor.of(identity);
  const law1 = wrappedId.ap(applicative.constructor.of(value));
  console.assert(
    law1.getOrElse(null) === value,
    "Identity law failed"
  );
  
  // Law 2: Homomorphism
  const law2a = applicative.constructor.of(addOne)
    .ap(applicative.constructor.of(value));
  const law2b = applicative.constructor.of(addOne(value));
  console.assert(
    law2a.getOrElse(null) === law2b.getOrElse(null),
    "Homomorphism law failed"
  );
}
```

### 4. Use Applicative for Independent Operations

```javascript
// ✅ GOOD: Independent validations
const validateName = (name) => name.length >= 3 ? Maybe.of(name) : Maybe.nothing();
const validateEmail = (email) => email.includes('@') ? Maybe.of(email) : Maybe.nothing();

// All validations run independently
const user = Maybe.of(createUser)
  .ap(validateName("Alice"))
  .ap(validateEmail("alice@example.com"));
```

---

## 🔗 Related Patterns

| Pattern | Relationship |
|---------|--------------|
| **Functor** | Applicative extends Functor - every Applicative is a Functor |
| **Monad** | Monad extends Applicative - every Monad is an Applicative |
| **Monoid** | Both combine values, but Applicative combines wrapped values |
| **Builder** | Both combine multiple values, but Applicative is functional |

---

## 📝 Key Takeaways

1. **Applicative = Functor + ap** - Extends Functor with ability to apply wrapped functions
2. **Four laws must hold** - Identity, Homomorphism, Interchange, Composition
3. **Every Monad is an Applicative** - But not every Applicative is a Monad
4. **Use for independent operations** - Perfect for combining multiple wrapped values
5. **ap vs map vs bind** - Use `ap` for wrapped functions, `map` for plain functions, `bind` for chaining
6. **Curry functions** - Curried functions work best with Applicative
7. **Parallel operations** - Applicative allows independent operations to run in parallel

---

## 🎯 Summary

The **Applicative Pattern** provides:

- ✅ A way to apply wrapped functions to wrapped values
- ✅ Ability to combine multiple wrapped values together
- ✅ Foundation for understanding Monads
- ✅ Support for independent, parallel operations
- ✅ Predictable behavior through laws

**Applicative Formula:**
```
Applicative = Functor + ap function
ap: F (a → b) → F a → F b
pure/of: a → F a
```

**Relationship to Functor and Monad:**
```
Functor → Applicative → Monad
  ↓          ↓          ↓
 map        ap        bind
```

**Remember:**
- If you understand Functors, Applicative is the next step
- Applicative is perfect for combining multiple optional/error values
- Every `Promise.all()` is using Applicative-like behavior
- Applicatives bridge the gap between Functors and Monads

---

**Date Created:** 2026-02-22  
**Pattern Type:** Functional Programming / Type Class  
**Difficulty:** Intermediate  
**Related Patterns:** Functor, Monad, Monoid  
**Prerequisites:** Understanding of Functor pattern, functional programming basics

