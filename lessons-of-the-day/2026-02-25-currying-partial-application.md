# Currying & Partial Application

## 📋 Learning Objectives

- [ ] Understand what currying is and why it matters
- [ ] Master the difference between currying and partial application
- [ ] Recognize when to use currying vs partial application
- [ ] Implement currying and partial application in multiple languages
- [ ] Apply currying to create reusable function factories
- [ ] Understand the relationship between currying and composition
- [ ] Use currying with functional patterns (Functor, Applicative, Monad)

---

## 🎯 Definition

**Currying** is the process of transforming a function that takes multiple arguments into a sequence of functions, each taking a single argument.

**Partial Application** is the process of fixing some arguments of a function, producing a new function with fewer parameters.

**Key Principle:**
> "Currying enables function specialization and reuse by breaking down multi-argument functions into single-argument functions."

**In simple terms:**
- **Currying**: `f(a, b, c)` → `f(a)(b)(c)` - Always returns a function until all args provided
- **Partial Application**: `f(a, b, c)` → `f(a, b)` - Fixes some arguments, returns function with remaining args
- Both enable function reuse and specialization
- Currying is a special case of partial application

---

## 🏗️ Core Concepts

### The Problem Currying Solves

**Without Currying:**
```javascript
// ❌ BAD: Function with multiple arguments, hard to reuse
const add = (x, y, z) => x + y + z;

// To add 5 to any two numbers, we need a wrapper
const add5ToTwo = (y, z) => add(5, y, z);
const result = add5ToTwo(10, 20); // 35
```

**With Currying:**
```javascript
// ✅ GOOD: Curried function, easy to specialize
const add = x => y => z => x + y + z;

// Can create specialized functions easily
const add5 = add(5);           // y => z => 5 + y + z
const add5And10 = add5(10);    // z => 15 + z
const result = add5And10(20);  // 35

// Or use directly
const result2 = add(5)(10)(20); // 35
```

### Visual Representation

```
CURRYING:
┌─────────────────────────────────────────────────────────┐
│                    CURRYING PROCESS                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Original: f(a, b, c) → result                          │
│                                                           │
│  Curried:  f(a) → (b) → (c) → result                    │
│                                                           │
│  Step 1: f(a)     → function(b, c)                       │
│  Step 2: f(a)(b)  → function(c)                           │
│  Step 3: f(a)(b)(c) → result                            │
│                                                           │
│  Example:                                                │
│  add(5)    → (y) => (z) => 5 + y + z                     │
│  add(5)(10) → (z) => 15 + z                              │
│  add(5)(10)(20) → 35                                     │
└─────────────────────────────────────────────────────────┘

PARTIAL APPLICATION:
┌─────────────────────────────────────────────────────────┐
│                PARTIAL APPLICATION PROCESS                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Original: f(a, b, c) → result                          │
│                                                           │
│  Partial:  f(a, b) → (c) → result                       │
│                                                           │
│  Step 1: Fix first two arguments                         │
│  Step 2: Return function expecting remaining args        │
│                                                           │
│  Example:                                                │
│  add(5, 10) → (z) => 15 + z                              │
│  add(5, 10)(20) → 35                                     │
└─────────────────────────────────────────────────────────┘
```

### Key Differences

| Aspect | Currying | Partial Application |
|--------|----------|---------------------|
| **Transformation** | Always one argument at a time | Can fix multiple arguments |
| **Function Type** | `(a, b, c) → a → b → c` | `(a, b, c) → (a, b) → c` |
| **Flexibility** | More flexible | Less flexible |
| **Use Case** | Function factories | Specialized functions |

---

## 📊 Currying Examples

### Basic Currying

```javascript
// Non-curried function
const add = (x, y) => x + y;
console.log(add(5, 10)); // 15

// Curried version
const addCurried = x => y => x + y;
console.log(addCurried(5)(10)); // 15

// Can create specialized functions
const add5 = addCurried(5);
console.log(add5(10)); // 15
console.log(add5(20)); // 25
```

### Multi-Argument Currying

```javascript
// Three-argument function
const add3 = (x, y, z) => x + y + z;

// Curried version
const add3Curried = x => y => z => x + y + z;

// Usage
console.log(add3Curried(1)(2)(3)); // 6

// Create specialized functions
const add1 = add3Curried(1);
const add1And2 = add1(2);
console.log(add1And2(3)); // 6

// Or in one go
const add1And2Direct = add3Curried(1)(2);
console.log(add1And2Direct(3)); // 6
```

### Generic Currying Function

```javascript
// Generic curry function
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

// Usage
const add = (x, y, z) => x + y + z;
const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3));     // 6
console.log(curriedAdd(1, 2)(3));     // 6
console.log(curriedAdd(1)(2, 3));     // 6
console.log(curriedAdd(1, 2, 3));    // 6

// Create specialized functions
const add1 = curriedAdd(1);
const add1And2 = add1(2);
console.log(add1And2(3)); // 6
```

---

## 🛠️ Implementation Examples

### JavaScript/TypeScript

#### 1. Manual Currying

```javascript
// Manual currying
const multiply = x => y => z => x * y * z;

// Usage
const result = multiply(2)(3)(4); // 24

// Create specialized functions
const multiplyBy2 = multiply(2);
const multiplyBy2And3 = multiplyBy2(3);
console.log(multiplyBy2And3(4)); // 24
```

#### 2. Generic Curry Function

```javascript
// Generic curry function
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return function(...nextArgs) {
      return curried(...args, ...nextArgs);
    };
  };
}

// Usage
const add = (x, y, z) => x + y + z;
const curriedAdd = curry(add);

// All these work:
curriedAdd(1)(2)(3);      // 6
curriedAdd(1, 2)(3);      // 6
curriedAdd(1)(2, 3);      // 6
curriedAdd(1, 2, 3);      // 6
```

#### 3. TypeScript Currying

```typescript
// Type-safe curry function
function curry<A, B, C>(
  fn: (a: A, b: B) => C
): (a: A) => (b: B) => C {
  return (a: A) => (b: B) => fn(a, b);
}

// Variadic curry (handles any number of arguments)
type Curried<T> = T extends (...args: infer A) => infer R
  ? A extends [infer First, ...infer Rest]
    ? (arg: First) => Curried<(...args: Rest) => R>
    : R
  : never;

function curryV<T extends (...args: any[]) => any>(
  fn: T
): Curried<T> {
  return function curried(...args: any[]): any {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return (...nextArgs: any[]) => curried(...args, ...nextArgs);
  } as Curried<T>;
}

// Usage
const add = (x: number, y: number, z: number) => x + y + z;
const curriedAdd = curryV(add);

const add1 = curriedAdd(1);
const add1And2 = add1(2);
const result: number = add1And2(3); // 6
```

#### 4. Partial Application

```javascript
// Partial application function
function partial(fn, ...fixedArgs) {
  return function(...remainingArgs) {
    return fn(...fixedArgs, ...remainingArgs);
  };
}

// Usage
const add = (x, y, z) => x + y + z;
const add5 = partial(add, 5);
const add5And10 = partial(add, 5, 10);

console.log(add5(10, 20));      // 35 (5 + 10 + 20)
console.log(add5And10(20));     // 35 (5 + 10 + 20)
```

#### 5. Placeholder Support

```javascript
// Curry with placeholder support
const _ = Symbol('placeholder');

function curryWithPlaceholder(fn) {
  return function curried(...args) {
    const hasPlaceholder = args.some(arg => arg === _);
    
    if (!hasPlaceholder && args.length >= fn.length) {
      return fn(...args);
    }
    
    return function(...nextArgs) {
      const newArgs = args.map(arg => 
        arg === _ && nextArgs.length > 0 ? nextArgs.shift() : arg
      );
      return curried(...newArgs, ...nextArgs);
    };
  };
}

// Usage
const subtract = (x, y, z) => x - y - z;
const curriedSubtract = curryWithPlaceholder(subtract);

// Can skip arguments with placeholder
const subtractFrom10 = curriedSubtract(10, _, _);
console.log(subtractFrom10(3)(2)); // 5 (10 - 3 - 2)

const subtract3From = curriedSubtract(_, 3, _);
console.log(subtract3From(10)(2)); // 5 (10 - 3 - 2)
```

### Python Implementation

```python
from functools import partial
from typing import Callable, TypeVar

T = TypeVar('T')

# Manual currying
def add_curried(x):
    def inner(y):
        def inner2(z):
            return x + y + z
        return inner2
    return inner

# Usage
result = add_curried(1)(2)(3)  # 6
add1 = add_curried(1)
add1_and_2 = add1(2)
print(add1_and_2(3))  # 6

# Generic curry function
def curry(func):
    def curried(*args, **kwargs):
        if len(args) + len(kwargs) >= func.__code__.co_argcount:
            return func(*args, **kwargs)
        return lambda *next_args, **next_kwargs: curried(
            *args, *next_args, **{**kwargs, **next_kwargs}
        )
    return curried

# Usage
def add(x, y, z):
    return x + y + z

curried_add = curry(add)
print(curried_add(1)(2)(3))      # 6
print(curried_add(1, 2)(3))     # 6
print(curried_add(1)(2, 3))     # 6

# Partial application (built-in)
from functools import partial

def add(x, y, z):
    return x + y + z

add5 = partial(add, 5)
add5_and_10 = partial(add, 5, 10)

print(add5(10, 20))      # 35
print(add5_and_10(20))  # 35
```

### C# Implementation

```csharp
using System;

// Manual currying
public static class Currying
{
    // Two-argument curry
    public static Func<B, C> Curry<A, B, C>(Func<A, B, C> func, A arg1)
    {
        return (B arg2) => func(arg1, arg2);
    }
    
    // Three-argument curry
    public static Func<B, Func<C, D>> Curry<A, B, C, D>(Func<A, B, C, D> func, A arg1)
    {
        return (B arg2) => (C arg3) => func(arg1, arg2, arg3);
    }
    
    // Generic curry (using extension methods)
    public static Func<T2, TResult> Curry<T1, T2, TResult>(
        this Func<T1, T2, TResult> func, 
        T1 arg1
    )
    {
        return (T2 arg2) => func(arg1, arg2);
    }
}

// Usage
class Program
{
    static int Add(int x, int y, int z)
    {
        return x + y + z;
    }
    
    static void Main()
    {
        // Manual currying
        Func<int, Func<int, Func<int, int>>> addCurried = 
            x => y => z => Add(x, y, z);
        
        var result = addCurried(1)(2)(3);
        Console.WriteLine(result); // 6
        
        // Create specialized function
        var add1 = addCurried(1);
        var add1And2 = add1(2);
        Console.WriteLine(add1And2(3)); // 6
        
        // Using extension method
        Func<int, int, int> add2 = (x, y) => x + y;
        var add5 = add2.Curry(5);
        Console.WriteLine(add5(10)); // 15
    }
}
```

### Haskell Implementation

```haskell
-- Currying is built-in to Haskell!
-- All functions are automatically curried

-- This function signature:
add :: Int -> Int -> Int -> Int
add x y z = x + y + z

-- Is equivalent to:
add :: Int -> (Int -> (Int -> Int))

-- Usage
result = add 1 2 3  -- 6

-- Can create specialized functions
add1 = add 1        -- Int -> Int -> Int
add1And2 = add1 2   -- Int -> Int
result2 = add1And2 3  -- 6

-- Partial application is natural
add5 = add 5
add5And10 = add5 10
result3 = add5And10 20  -- 35

-- Can skip arguments with sections
subtractFrom10 = (10 -)
result4 = subtractFrom10 3  -- 7

-- Infix operators can be curried
multiplyBy2 = (* 2)
result5 = multiplyBy2 5  -- 10
```

---

## 🌟 Real-World Applications

### 1. Function Factories

```javascript
// Create specialized functions from generic ones
const createValidator = (min, max) => (value) => {
  if (value.length < min || value.length > max) {
    throw new Error(`Length must be between ${min} and ${max}`);
  }
  return value;
};

// Create specific validators
const validateUsername = createValidator(3, 20);
const validatePassword = createValidator(8, 50);
const validateEmail = createValidator(5, 100);

// Usage
try {
  validateUsername("ab"); // Error: too short
  validatePassword("short"); // Error: too short
  validateEmail("valid@email.com"); // OK
} catch (error) {
  console.error(error.message);
}
```

### 2. Event Handlers

```javascript
// Create event handlers with fixed parameters
const createEventHandler = (eventType, handler) => (event) => {
  if (event.type === eventType) {
    handler(event);
  }
};

const handleClick = createEventHandler('click', (event) => {
  console.log('Clicked!', event.target);
});

const handleKeyPress = createEventHandler('keypress', (event) => {
  console.log('Key pressed!', event.key);
});

// Usage in DOM
document.addEventListener('click', handleClick);
document.addEventListener('keypress', handleKeyPress);
```

### 3. API Request Builders

```javascript
// Build API requests with currying
const createApiRequest = (baseUrl) => (endpoint) => (method) => (data) => {
  return fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
};

// Create specialized API functions
const apiRequest = createApiRequest('https://api.example.com');
const userEndpoint = apiRequest('/users');
const getUser = userEndpoint('GET');
const createUser = userEndpoint('POST');
const updateUser = userEndpoint('PUT');

// Usage
const user = await getUser({});
const newUser = await createUser({ name: 'John' });
```

### 4. Configuration Functions

```javascript
// Create configuration functions
const createLogger = (level) => (message) => (context) => {
  console.log(`[${level}] ${message}`, context);
};

// Create specific loggers
const logError = createLogger('ERROR');
const logInfo = createLogger('INFO');
const logDebug = createLogger('DEBUG');

// Usage
logError('Database connection failed')({ db: 'users' });
logInfo('User logged in')({ userId: 123 });
logDebug('Processing request')({ requestId: 'abc' });
```

### 5. Data Transformation Pipelines

```javascript
// Create transformation functions
const createMapper = (field) => (transform) => (data) => ({
  ...data,
  [field]: transform(data[field])
});

// Create specific mappers
const mapName = createMapper('name')(name => name.toUpperCase());
const mapEmail = createMapper('email')(email => email.toLowerCase());
const mapAge = createMapper('age')(age => age + 1);

// Compose transformations
const transformUser = pipe(
  mapName,
  mapEmail,
  mapAge
);

const user = { name: 'john', email: 'JOHN@EXAMPLE.COM', age: 25 };
const transformed = transformUser(user);
// { name: 'JOHN', email: 'john@example.com', age: 26 }
```

### 6. Working with Functors/Applicatives

```javascript
// Currying works perfectly with Applicatives
const add = x => y => x + y;
const multiply = x => y => x * y;

// With Maybe Applicative
const maybeAdd = Maybe.of(add(5));
const maybeValue = Maybe.of(10);
const result = maybeAdd.ap(maybeValue); // Maybe(15)

// With Either Applicative
const eitherAdd = Either.right(add(5));
const eitherValue = Either.right(10);
const result2 = eitherAdd.ap(eitherValue); // Either.right(15)
```

### 7. Middleware Composition

```javascript
// Create middleware with currying
const createMiddleware = (condition) => (handler) => (req, res, next) => {
  if (condition(req)) {
    handler(req, res, next);
  } else {
    next();
  }
};

// Create specific middleware
const requireAuth = createMiddleware(req => req.user);
const requireAdmin = createMiddleware(req => req.user?.role === 'admin');

// Usage
app.use(requireAuth((req, res, next) => {
  // Handle authenticated request
  next();
}));

app.use(requireAdmin((req, res, next) => {
  // Handle admin request
  next();
}));
```

---

## 🔄 Currying vs Partial Application

### Comparison Table

| Aspect | Currying | Partial Application |
|--------|----------|---------------------|
| **Transformation** | One arg at a time | Multiple args at once |
| **Flexibility** | More flexible | Less flexible |
| **Function Type** | `(a, b, c) → a → b → c` | `(a, b, c) → (a, b) → c` |
| **Use Case** | Function factories | Specialized functions |
| **Composition** | Works great | Works well |

### When to Use Which

**Use Currying when:**
- ✅ You want maximum flexibility
- ✅ You're building function factories
- ✅ You need to apply arguments one at a time
- ✅ You're working with functional patterns (Applicative, Monad)

**Use Partial Application when:**
- ✅ You know which arguments to fix
- ✅ You want simpler syntax
- ✅ You're creating specialized functions
- ✅ You have multiple arguments to fix at once

### Code Comparison

```javascript
// CURRYING: One argument at a time
const add = x => y => z => x + y + z;
const add5 = add(5);
const add5And10 = add5(10);
const result = add5And10(20); // 35

// PARTIAL APPLICATION: Fix multiple arguments
const add = (x, y, z) => x + y + z;
const add5And10 = partial(add, 5, 10);
const result = add5And10(20); // 35
```

---

## ⚠️ Common Pitfalls

### 1. Confusing Currying with Partial Application

```javascript
// ❌ BAD: Not understanding the difference
const add = (x, y) => x + y;
const add5 = add(5); // This won't work! add expects 2 args

// ✅ GOOD: Use currying or partial application
// Option 1: Currying
const add = x => y => x + y;
const add5 = add(5); // Works!

// Option 2: Partial application
const add = (x, y) => x + y;
const add5 = partial(add, 5); // Works!
```

### 2. Forgetting to Return Functions

```javascript
// ❌ BAD: Not returning a function
const add = x => {
  y => x + y;  // Missing return!
};

const add5 = add(5);
console.log(add5(10)); // Error: add5 is not a function

// ✅ GOOD: Return the function
const add = x => {
  return y => x + y;  // Explicit return
};

// Or use arrow function shorthand
const add = x => y => x + y;  // Implicit return
```

### 3. Not Handling Variable Arguments

```javascript
// ❌ BAD: Fixed arity currying
function curry(fn) {
  return function curried(a) {
    return function(b) {
      return function(c) {
        return fn(a, b, c);  // Only works for 3 args!
      };
    };
  };
}

// ✅ GOOD: Generic currying
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return function(...nextArgs) {
      return curried(...args, ...nextArgs);
    };
  };
}
```

### 4. Performance Considerations

```javascript
// ⚠️ WARNING: Deep currying can create many function calls
const deeplyCurried = a => b => c => d => e => f => 
  a + b + c + d + e + f;

// Each call creates a new function
const step1 = deeplyCurried(1);      // Creates function
const step2 = step1(2);              // Creates function
const step3 = step2(3);              // Creates function
// ... etc

// For performance-critical code, consider:
// 1. Using partial application instead
// 2. Limiting curry depth
// 3. Using a library with optimized currying
```

---

## 📊 Currying Decision Matrix

| Scenario | Use Currying? | Why |
|----------|--------------|-----|
| Function factories | ✅ Yes | Perfect for creating specialized functions |
| Working with Applicatives | ✅ Yes | Curried functions work best |
| Fixed arguments known | ⚠️ Maybe | Partial application might be simpler |
| Performance critical | ⚠️ Maybe | Consider partial application |
| Building reusable utilities | ✅ Yes | Great for code reuse |
| Single-use functions | ❌ No | Overkill |

---

## 🎯 Best Practices

### 1. Use Currying for Function Factories

```javascript
// ✅ GOOD: Create reusable validators
const createValidator = (min, max) => (value) => {
  return value.length >= min && value.length <= max;
};

const validateUsername = createValidator(3, 20);
const validatePassword = createValidator(8, 50);
```

### 2. Combine with Composition

```javascript
// ✅ GOOD: Currying + composition
const add = x => y => x + y;
const multiply = x => y => x * y;
const square = x => x * x;

const transform = pipe(
  add(5),
  multiply(2),
  square
);

console.log(transform(10)); // 900 ((10 + 5) * 2)²
```

### 3. Use TypeScript for Type Safety

```typescript
// ✅ GOOD: Type-safe currying
function curry<A, B, C>(
  fn: (a: A, b: B) => C
): (a: A) => (b: B) => C {
  return (a: A) => (b: B) => fn(a, b);
}

// TypeScript will catch type mismatches!
```

### 4. Document Curried Functions

```javascript
// ✅ GOOD: Clear documentation
/**
 * Creates a validator function
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {function(string): boolean} Validator function
 */
const createValidator = (min, max) => (value) => {
  return value.length >= min && value.length <= max;
};
```

---

## 🔗 Related Patterns

| Pattern | Relationship |
|---------|--------------|
| **Composition** | Currying enables better composition |
| **Applicative** | Curried functions work perfectly with Applicatives |
| **Functor** | Can curry functions for use with Functors |
| **Higher-Order Functions** | Currying creates higher-order functions |
| **Closure** | Currying uses closures to capture arguments |

---

## 📝 Key Takeaways

1. **Currying = One arg at a time** - Transforms multi-arg functions into single-arg chains
2. **Partial Application = Fix some args** - Creates specialized functions by fixing arguments
3. **Both enable reuse** - Create specialized functions from generic ones
4. **Currying is more flexible** - Can apply arguments one at a time
5. **Works great with Applicatives** - Curried functions are perfect for `ap`
6. **Enables composition** - Curried functions compose beautifully
7. **Performance trade-off** - More function calls, but better code reuse

---

## 🎯 Summary

**Currying & Partial Application** provide:

- ✅ A way to create specialized functions from generic ones
- ✅ Improved code reuse and modularity
- ✅ Better composition capabilities
- ✅ Foundation for functional programming patterns
- ✅ Function factories and utilities

**Currying Formula:**
```
f(a, b, c) → f(a)(b)(c)
```

**Partial Application Formula:**
```
f(a, b, c) → f(a, b) → c
```

**When to Use:**
- Building function factories
- Creating reusable utilities
- Working with functional patterns (Applicative, Monad)
- Enabling better composition
- Specializing generic functions

**Remember:**
- Currying applies one argument at a time
- Partial application fixes multiple arguments
- Both enable function reuse and specialization
- Currying works perfectly with Applicatives
- Use TypeScript for type safety

---

**Date Created:** 2026-02-25  
**Pattern Type:** Functional Programming / Transformation  
**Difficulty:** Intermediate  
**Related Patterns:** Composition, Applicative, Higher-Order Functions, Closure  
**Prerequisites:** Understanding of functions, closures, functional programming basics

