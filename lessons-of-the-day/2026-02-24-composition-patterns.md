# Composition Patterns (Compose & Pipe)

## 📋 Learning Objectives

- [ ] Understand function composition and why it matters
- [ ] Master the `compose` pattern (right-to-left execution)
- [ ] Master the `pipe` pattern (left-to-right execution)
- [ ] Recognize when to use compose vs pipe
- [ ] Implement compose and pipe in multiple languages
- [ ] Apply composition to build complex transformations
- [ ] Understand the relationship between composition and other functional patterns

---

## 🎯 Definition

**Function Composition** is the process of combining multiple functions to create a new function. The output of one function becomes the input of the next.

**Key Principle:**
> "Composition is the art of building complex functions from simple ones."

**In simple terms:**
- **Compose** (`∘`): Combines functions right-to-left: `compose(f, g)(x) = f(g(x))`
- **Pipe** (`|>`): Combines functions left-to-right: `pipe(f, g)(x) = g(f(x))`
- Both create new functions from existing ones
- Both enable building complex transformations from simple building blocks

---

## 🏗️ Core Concepts

### The Problem Composition Solves

**Without Composition:**
```javascript
// ❌ BAD: Nested function calls
const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const result = square(double(addOne(5)));
// Hard to read: which function runs first?
// Execution: addOne(5) → double(6) → square(12) = 144
```

**With Composition:**
```javascript
// ✅ GOOD: Clear, readable composition
const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

// Using compose (right-to-left)
const transform = compose(square, double, addOne);
const result = transform(5);
// Execution: addOne(5) → double(6) → square(12) = 144

// Using pipe (left-to-right)
const transform2 = pipe(addOne, double, square);
const result2 = transform2(5);
// Execution: addOne(5) → double(6) → square(12) = 144
```

### Visual Representation

```
COMPOSE (right-to-left):
┌─────────────────────────────────────────────────────────┐
│                    COMPOSE FLOW                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Input: 5                                                 │
│    │                                                       │
│    ▼                                                       │
│  addOne(5) → 6                                            │
│    │                                                       │
│    ▼                                                       │
│  double(6) → 12                                           │
│    │                                                       │
│    ▼                                                       │
│  square(12) → 144                                         │
│    │                                                       │
│    ▼                                                       │
│  Output: 144                                              │
│                                                           │
│  compose(square, double, addOne)                         │
│  Reads: "square of double of addOne"                      │
└─────────────────────────────────────────────────────────┘

PIPE (left-to-right):
┌─────────────────────────────────────────────────────────┐
│                      PIPE FLOW                            │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Input: 5                                                 │
│    │                                                       │
│    ▼                                                       │
│  addOne(5) → 6                                            │
│    │                                                       │
│    ▼                                                       │
│  double(6) → 12                                           │
│    │                                                       │
│    ▼                                                       │
│  square(12) → 144                                         │
│    │                                                       │
│    ▼                                                       │
│  Output: 144                                              │
│                                                           │
│  pipe(addOne, double, square)                            │
│  Reads: "addOne then double then square"                  │
└─────────────────────────────────────────────────────────┘
```

### Mathematical Notation

**Compose:**
```
(f ∘ g)(x) = f(g(x))
```

**Pipe:**
```
(f |> g)(x) = g(f(x))
```

**Key Difference:**
- **Compose**: Mathematical notation (right-to-left)
- **Pipe**: Unix-style (left-to-right, more intuitive)

---

## 📊 Composition Laws

### Law 1: Identity

**"Composing with identity doesn't change the function"**

```javascript
const identity = x => x;
const addOne = x => x + 1;

// compose(identity, addOne) === addOne
const composed = compose(identity, addOne);
console.log(composed(5) === addOne(5)); // true ✓

// compose(addOne, identity) === addOne
const composed2 = compose(addOne, identity);
console.log(composed2(5) === addOne(5)); // true ✓
```

### Law 2: Associativity

**"The order of grouping doesn't matter"**

```javascript
const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

// compose(compose(square, double), addOne) === compose(square, compose(double, addOne))
const left = compose(compose(square, double), addOne);
const right = compose(square, compose(double, addOne));

console.log(left(5) === right(5)); // true ✓
```

### Why Laws Matter

The laws ensure that:
- ✅ Composition behaves predictably
- ✅ You can refactor safely
- ✅ You can reason about code mathematically
- ✅ Composition is a true mathematical operation

---

## 🛠️ Implementation Examples

### JavaScript/TypeScript

#### 1. Basic Compose Implementation

```javascript
// Compose: right-to-left (mathematical)
function compose(...fns) {
  return function(value) {
    return fns.reduceRight((acc, fn) => fn(acc), value);
  };
}

// Usage
const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const transform = compose(square, double, addOne);
console.log(transform(5)); // 144
// Execution: addOne(5) → double(6) → square(12) = 144
```

**Step-by-step execution:**
```javascript
// compose(square, double, addOne)(5)
// 1. reduceRight starts with value = 5
// 2. First iteration: fn = addOne, acc = 5 → addOne(5) = 6
// 3. Second iteration: fn = double, acc = 6 → double(6) = 12
// 4. Third iteration: fn = square, acc = 12 → square(12) = 144
// Result: 144
```

#### 2. Basic Pipe Implementation

```javascript
// Pipe: left-to-right (intuitive)
function pipe(...fns) {
  return function(value) {
    return fns.reduce((acc, fn) => fn(acc), value);
  };
}

// Usage
const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

const transform = pipe(addOne, double, square);
console.log(transform(5)); // 144
// Execution: addOne(5) → double(6) → square(12) = 144
```

**Step-by-step execution:**
```javascript
// pipe(addOne, double, square)(5)
// 1. reduce starts with value = 5
// 2. First iteration: fn = addOne, acc = 5 → addOne(5) = 6
// 3. Second iteration: fn = double, acc = 6 → double(6) = 12
// 4. Third iteration: fn = square, acc = 12 → square(12) = 144
// Result: 144
```

#### 3. Advanced Compose with Type Safety

```typescript
// Type-safe compose
function compose<A, B, C>(
  f: (b: B) => C,
  g: (a: A) => B
): (a: A) => C {
  return (a: A) => f(g(a));
}

// Variadic compose (handles any number of functions)
function composeV<T>(...fns: Array<(x: T) => T>): (x: T) => T {
  return (x: T) => fns.reduceRight((acc, fn) => fn(acc), x);
}

// Usage
const addOne = (x: number) => x + 1;
const double = (x: number) => x * 2;
const square = (x: number) => x * x;

const transform = composeV(addOne, double, square);
console.log(transform(5)); // 144
```

#### 4. Pipe with Type Safety

```typescript
// Type-safe pipe
function pipe<A, B, C>(
  f: (a: A) => B,
  g: (b: B) => C
): (a: A) => C {
  return (a: A) => g(f(a));
}

// Variadic pipe
function pipeV<T>(...fns: Array<(x: T) => T>): (x: T) => T {
  return (x: T) => fns.reduce((acc, fn) => fn(acc), x);
}

// Usage
const addOne = (x: number) => x + 1;
const double = (x: number) => x * 2;
const square = (x: number) => x * x;

const transform = pipeV(addOne, double, square);
console.log(transform(5)); // 144
```

#### 5. Compose with Error Handling

```javascript
// Compose with error handling
function composeSafe(...fns) {
  return function(value) {
    try {
      return fns.reduceRight((acc, fn) => {
        if (acc === null || acc === undefined) {
          return null;
        }
        return fn(acc);
      }, value);
    } catch (error) {
      console.error('Composition error:', error);
      return null;
    }
  };
}

// Usage
const addOne = x => x + 1;
const double = x => x * 2;
const divideByZero = x => x / 0; // Will throw

const transform = composeSafe(divideByZero, double, addOne);
console.log(transform(5)); // null (error caught)
```

#### 6. Compose with Async Functions

```javascript
// Compose for async functions
async function composeAsync(...fns) {
  return async function(value) {
    let result = value;
    for (let i = fns.length - 1; i >= 0; i--) {
      result = await fns[i](result);
    }
    return result;
  };
}

// Usage
const fetchUser = async (id) => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};

const extractName = (user) => user.name;
const toUpperCase = (str) => str.toUpperCase();

const getUserName = composeAsync(
  toUpperCase,
  extractName,
  fetchUser
);

const name = await getUserName(1); // "JOHN"
```

#### 7. Pipe with Async Functions

```javascript
// Pipe for async functions
async function pipeAsync(...fns) {
  return async function(value) {
    let result = value;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };
}

// Usage
const fetchUser = async (id) => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};

const extractName = (user) => user.name;
const toUpperCase = (str) => str.toUpperCase();

const getUserName = pipeAsync(
  fetchUser,
  extractName,
  toUpperCase
);

const name = await getUserName(1); // "JOHN"
```

### Python Implementation

```python
from functools import reduce
from typing import Callable, TypeVar

T = TypeVar('T')

def compose(*fns: Callable[[T], T]) -> Callable[[T], T]:
    """Compose functions right-to-left"""
    def composed(value: T) -> T:
        return reduce(lambda acc, fn: fn(acc), reversed(fns), value)
    return composed

def pipe(*fns: Callable[[T], T]) -> Callable[[T], T]:
    """Pipe functions left-to-right"""
    def piped(value: T) -> T:
        return reduce(lambda acc, fn: fn(acc), fns, value)
    return piped

# Usage
def add_one(x: int) -> int:
    return x + 1

def double(x: int) -> int:
    return x * 2

def square(x: int) -> int:
    return x * x

# Compose
transform = compose(square, double, add_one)
print(transform(5))  # 144

# Pipe
transform2 = pipe(add_one, double, square)
print(transform2(5))  # 144

# With async
import asyncio

async def fetch_user(id: int) -> dict:
    # Simulate API call
    await asyncio.sleep(0.1)
    return {"id": id, "name": "John"}

def extract_name(user: dict) -> str:
    return user["name"]

def to_upper(name: str) -> str:
    return name.upper()

async def get_user_name(id: int) -> str:
    user = await fetch_user(id)
    return pipe(extract_name, to_upper)(user)

# Usage
result = asyncio.run(get_user_name(1))
print(result)  # "JOHN"
```

### C# Implementation

```csharp
using System;
using System.Linq;

// Compose function
public static class Composition
{
    // Compose: right-to-left
    public static Func<T, T> Compose<T>(params Func<T, T>[] functions)
    {
        return value => functions
            .Reverse()
            .Aggregate(value, (acc, fn) => fn(acc));
    }
    
    // Pipe: left-to-right
    public static Func<T, T> Pipe<T>(params Func<T, T>[] functions)
    {
        return value => functions
            .Aggregate(value, (acc, fn) => fn(acc));
    }
}

// Usage
class Program
{
    static int AddOne(int x) => x + 1;
    static int Double(int x) => x * 2;
    static int Square(int x) => x * x;
    
    static void Main()
    {
        // Compose
        var transform = Composition.Compose(Square, Double, AddOne);
        Console.WriteLine(transform(5)); // 144
        
        // Pipe
        var transform2 = Composition.Pipe(AddOne, Double, Square);
        Console.WriteLine(transform2(5)); // 144
    }
}
```

### Haskell Implementation

```haskell
-- Compose is built-in in Haskell (.)
-- (.) :: (b -> c) -> (a -> b) -> (a -> c)
-- f . g = \x -> f (g x)

addOne :: Int -> Int
addOne x = x + 1

double :: Int -> Int
double x = x * 2

square :: Int -> Int
square x = x * x

-- Compose (right-to-left)
transform :: Int -> Int
transform = square . double . addOne

-- Usage
result = transform 5  -- 144

-- Pipe operator (left-to-right) - not built-in, but easy to define
infixl 9 |>
(|>) :: a -> (a -> b) -> b
x |> f = f x

-- Usage with pipe
result2 = 5 |> addOne |> double |> square  -- 144

-- Or define pipe function
pipe :: [a -> a] -> a -> a
pipe [] x = x
pipe (f:fs) x = pipe fs (f x)

-- Usage
transform2 = pipe [addOne, double, square]
result3 = transform2 5  -- 144
```

---

## 🌟 Real-World Applications

### 1. Data Transformation Pipeline

```javascript
// Transform user data through multiple steps
const users = [
  { id: 1, name: "john doe", age: 25, email: "JOHN@EXAMPLE.COM" },
  { id: 2, name: "jane smith", age: 30, email: "JANE@EXAMPLE.COM" }
];

// Individual transformation functions
const normalizeName = (user) => ({
  ...user,
  name: user.name
    .split(' ')
    .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
});

const normalizeEmail = (user) => ({
  ...user,
  email: user.email.toLowerCase()
});

const addFullName = (user) => ({
  ...user,
  fullName: user.name
});

const filterAdults = (user) => user.age >= 18 ? user : null;

// Compose transformations
const processUser = pipe(
  normalizeName,
  normalizeEmail,
  addFullName,
  filterAdults
);

const processedUsers = users
  .map(processUser)
  .filter(user => user !== null);

console.log(processedUsers);
// [
//   { id: 1, name: "John Doe", age: 25, email: "john@example.com", fullName: "John Doe" },
//   { id: 2, name: "Jane Smith", age: 30, email: "jane@example.com", fullName: "Jane Smith" }
// ]
```

### 2. Validation Pipeline

```javascript
// Validate and sanitize input
const trim = (str) => str.trim();
const toLowerCase = (str) => str.toLowerCase();
const removeSpaces = (str) => str.replace(/\s+/g, '');
const validateLength = (min, max) => (str) => {
  if (str.length < min || str.length > max) {
    throw new Error(`Length must be between ${min} and ${max}`);
  }
  return str;
};
const validateEmail = (str) => {
  if (!str.includes('@')) {
    throw new Error('Invalid email');
  }
  return str;
};

// Compose validation pipeline
const validateEmailInput = pipe(
  trim,
  toLowerCase,
  removeSpaces,
  validateLength(5, 50),
  validateEmail
);

try {
  const email = validateEmailInput("  JOHN@EXAMPLE.COM  ");
  console.log(email); // "john@example.com"
} catch (error) {
  console.error(error.message);
}
```

### 3. API Request Pipeline

```javascript
// Build API request with multiple transformations
const addAuth = (request) => ({
  ...request,
  headers: {
    ...request.headers,
    Authorization: `Bearer ${getToken()}`
  }
});

const addTimestamp = (request) => ({
  ...request,
  headers: {
    ...request.headers,
    'X-Timestamp': Date.now()
  }
});

const stringifyBody = (request) => ({
  ...request,
  body: JSON.stringify(request.body)
});

const addContentType = (request) => ({
  ...request,
  headers: {
    ...request.headers,
    'Content-Type': 'application/json'
  }
});

// Compose request pipeline
const prepareRequest = pipe(
  addAuth,
  addTimestamp,
  stringifyBody,
  addContentType
);

const request = prepareRequest({
  url: '/api/users',
  method: 'POST',
  body: { name: 'John' },
  headers: {}
});

console.log(request);
// {
//   url: '/api/users',
//   method: 'POST',
//   body: '{"name":"John"}',
//   headers: {
//     Authorization: 'Bearer token123',
//     'X-Timestamp': 1234567890,
//     'Content-Type': 'application/json'
//   }
// }
```

### 4. Logging Pipeline

```javascript
// Add logging to function execution
const withLogging = (fn, name) => (value) => {
  console.log(`[${name}] Input:`, value);
  const result = fn(value);
  console.log(`[${name}] Output:`, result);
  return result;
};

const addOne = (x) => x + 1;
const double = (x) => x * 2;
const square = (x) => x * x;

// Compose with logging
const transform = pipe(
  withLogging(addOne, 'addOne'),
  withLogging(double, 'double'),
  withLogging(square, 'square')
);

transform(5);
// [addOne] Input: 5
// [addOne] Output: 6
// [double] Input: 6
// [double] Output: 12
// [square] Input: 12
// [square] Output: 144
```

### 5. Functional Array Operations

```javascript
// Compose array transformations
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const filterEven = (arr) => arr.filter(x => x % 2 === 0);
const mapSquare = (arr) => arr.map(x => x * x);
const mapDouble = (arr) => arr.map(x => x * 2);
const sum = (arr) => arr.reduce((acc, x) => acc + x, 0);

// Compose transformations
const processNumbers = pipe(
  filterEven,
  mapSquare,
  mapDouble,
  sum
);

const result = processNumbers(numbers);
console.log(result); // 440
// Even numbers: [2, 4, 6, 8, 10]
// Squared: [4, 16, 36, 64, 100]
// Doubled: [8, 32, 72, 128, 200]
// Sum: 440
```

### 6. Middleware Pattern (Express.js style)

```javascript
// Compose middleware functions
function composeMiddleware(...middlewares) {
  return (req, res, next) => {
    let index = 0;
    
    function runMiddleware() {
      if (index >= middlewares.length) {
        return next();
      }
      
      const middleware = middlewares[index++];
      middleware(req, res, (err) => {
        if (err) return next(err);
        runMiddleware();
      });
    }
    
    runMiddleware();
  };
}

// Usage
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

const auth = (req, res, next) => {
  if (req.headers.authorization) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};

const parseBody = (req, res, next) => {
  req.body = JSON.parse(req.body);
  next();
};

const middleware = composeMiddleware(logger, auth, parseBody);
```

---

## 🔄 Compose vs Pipe

### Comparison Table

| Aspect | Compose | Pipe |
|-------|---------|------|
| **Direction** | Right-to-left | Left-to-right |
| **Readability** | Mathematical | Intuitive |
| **Notation** | `f ∘ g` | `f |> g` |
| **Execution** | `f(g(x))` | `g(f(x))` |
| **Common Use** | Mathematical/Functional | Unix/Practical |

### When to Use Which

**Use Compose when:**
- ✅ You're thinking mathematically
- ✅ You want to match mathematical notation
- ✅ You're working with pure functional code
- ✅ You prefer right-to-left reading

**Use Pipe when:**
- ✅ You want intuitive left-to-right flow
- ✅ You're building data pipelines
- ✅ You want code that reads like a sentence
- ✅ You're coming from Unix/bash background

### Code Comparison

```javascript
const addOne = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

// COMPOSE: Right-to-left
const transform1 = compose(square, double, addOne);
// Reads: "square of double of addOne"
// Execution: addOne → double → square

// PIPE: Left-to-right
const transform2 = pipe(addOne, double, square);
// Reads: "addOne then double then square"
// Execution: addOne → double → square

// Both produce the same result!
console.log(transform1(5)); // 144
console.log(transform2(5)); // 144
```

---

## ⚠️ Common Pitfalls

### 1. Confusing Compose and Pipe Direction

```javascript
// ❌ BAD: Wrong direction understanding
const addOne = x => x + 1;
const double = x => x * 2;

// This might seem wrong if you don't understand direction
const transform = compose(double, addOne);
// This executes: addOne first, then double
// NOT: double first, then addOne!

// ✅ GOOD: Understand the direction
// Compose: right-to-left (last function runs first)
const transform1 = compose(double, addOne);
// Execution: addOne(5) → double(6) = 12

// Pipe: left-to-right (first function runs first)
const transform2 = pipe(addOne, double);
// Execution: addOne(5) → double(6) = 12
```

### 2. Type Mismatches

```javascript
// ❌ BAD: Type mismatch
const addOne = x => x + 1;  // number → number
const toUpperCase = str => str.toUpperCase();  // string → string

// This will fail at runtime!
const transform = compose(toUpperCase, addOne);
transform(5); // Error: toUpperCase is not a function

// ✅ GOOD: Ensure type compatibility
const addOne = x => x + 1;
const double = x => x * 2;  // Both: number → number
const transform = compose(double, addOne);  // Works!
```

### 3. Forgetting to Return Values

```javascript
// ❌ BAD: Function doesn't return value
const addOne = x => {
  x + 1;  // Missing return!
};

const double = x => x * 2;
const transform = compose(double, addOne);
transform(5); // NaN (undefined * 2)

// ✅ GOOD: Always return values
const addOne = x => {
  return x + 1;  // Explicit return
};

// Or use arrow function shorthand
const addOne = x => x + 1;  // Implicit return
```

### 4. Not Handling Errors

```javascript
// ❌ BAD: No error handling
const divide = (x, y) => x / y;
const addOne = x => x + 1;
const transform = compose(addOne, x => divide(x, 0));  // Will throw!

transform(5); // Error: Division by zero

// ✅ GOOD: Add error handling
const safeDivide = (x, y) => {
  if (y === 0) throw new Error('Division by zero');
  return x / y;
};

const safeCompose = (...fns) => {
  return function(value) {
    try {
      return fns.reduceRight((acc, fn) => fn(acc), value);
    } catch (error) {
      console.error('Composition error:', error);
      return null;
    }
  };
};
```

---

## 📊 Composition Decision Matrix

| Scenario | Use Composition? | Why |
|----------|-----------------|-----|
| Transform data through multiple steps | ✅ Yes | Perfect for pipelines |
| Build reusable transformation chains | ✅ Yes | Composable functions |
| Single function call | ❌ No | Overkill |
| Functions with different types | ⚠️ Maybe | Need type compatibility |
| Async operations | ✅ Yes | With async compose/pipe |
| Error-prone operations | ⚠️ Maybe | Need error handling |

---

## 🎯 Best Practices

### 1. Keep Functions Small and Focused

```javascript
// ✅ GOOD: Small, focused functions
const trim = str => str.trim();
const toLowerCase = str => str.toLowerCase();
const removeSpaces = str => str.replace(/\s+/g, '');

const normalize = pipe(trim, toLowerCase, removeSpaces);

// ❌ BAD: Large, complex function
const normalize = str => {
  let result = str.trim();
  result = result.toLowerCase();
  result = result.replace(/\s+/g, '');
  return result;
};
```

### 2. Use Descriptive Function Names

```javascript
// ✅ GOOD: Descriptive names
const validateEmail = email => email.includes('@');
const sanitizeInput = input => input.trim().toLowerCase();
const formatOutput = output => output.toUpperCase();

const process = pipe(sanitizeInput, validateEmail, formatOutput);

// ❌ BAD: Unclear names
const f1 = x => x.trim().toLowerCase();
const f2 = x => x.includes('@');
const f3 = x => x.toUpperCase();
```

### 3. Compose from Right, Read from Left

```javascript
// ✅ GOOD: Clear composition
const processUser = pipe(
  normalizeName,
  validateEmail,
  addTimestamp,
  logOperation
);
// Reads naturally: "normalize then validate then add timestamp then log"

// ❌ BAD: Confusing composition
const processUser = compose(
  logOperation,
  addTimestamp,
  validateEmail,
  normalizeName
);
// Harder to read (right-to-left)
```

### 4. Use TypeScript for Type Safety

```typescript
// ✅ GOOD: Type-safe composition
function compose<A, B, C>(
  f: (b: B) => C,
  g: (a: A) => B
): (a: A) => C {
  return (a: A) => f(g(a));
}

// TypeScript will catch type mismatches at compile time!
```

---

## 🔗 Related Patterns

| Pattern | Relationship |
|---------|--------------|
| **Functor** | Functor's composition law uses function composition |
| **Monad** | Monads use composition for chaining operations |
| **Pipeline** | Composition is the foundation of pipeline patterns |
| **Middleware** | Middleware patterns use composition |
| **Decorator** | Both add behavior, but composition is functional |

---

## 📝 Key Takeaways

1. **Composition = Building complex from simple** - Combine small functions into powerful transformations
2. **Compose = Right-to-left** - Mathematical notation, `f(g(x))`
3. **Pipe = Left-to-right** - Intuitive flow, reads like a sentence
4. **Both are equivalent** - Same result, different reading direction
5. **Type compatibility matters** - Functions must have compatible input/output types
6. **Keep functions pure** - Composition works best with pure functions
7. **Enables reusability** - Small functions can be combined in different ways

---

## 🎯 Summary

**Composition Patterns** provide:

- ✅ A way to build complex functions from simple ones
- ✅ Improved readability and maintainability
- ✅ Reusable function building blocks
- ✅ Mathematical foundation for functional programming
- ✅ Pipeline-style data transformation

**Composition Formula:**
```
Compose: (f ∘ g)(x) = f(g(x))  (right-to-left)
Pipe: (f |> g)(x) = g(f(x))    (left-to-right)
```

**When to Use:**
- Building data transformation pipelines
- Creating reusable function chains
- Simplifying complex nested function calls
- Building middleware systems
- Functional programming workflows

**Remember:**
- Compose reads right-to-left (mathematical)
- Pipe reads left-to-right (intuitive)
- Both produce the same results
- Composition is the foundation of functional programming
- Small, pure functions compose best

---

**Date Created:** 2026-02-24  
**Pattern Type:** Functional Programming / Composition  
**Difficulty:** Intermediate  
**Related Patterns:** Functor, Monad, Pipeline, Middleware  
**Prerequisites:** Understanding of functions, functional programming basics

