# Higher-Order Functions

## 📋 Learning Objectives

- [ ] Understand what higher-order functions are and why they matter
- [ ] Recognize functions that take functions as arguments
- [ ] Recognize functions that return functions
- [ ] Master common higher-order functions (map, filter, reduce)
- [ ] Implement custom higher-order functions
- [ ] Apply higher-order functions to solve real-world problems
- [ ] Understand the relationship between HOFs and functional patterns

---

## 🎯 Definition

A **Higher-Order Function (HOF)** is a function that either:
1. **Takes one or more functions as arguments**, or
2. **Returns a function as its result**

**Key Principle:**
> "Higher-order functions treat functions as first-class citizens, enabling powerful abstractions and code reuse."

**In simple terms:**
- **Functions as arguments**: `map`, `filter`, `reduce` take functions
- **Functions as return values**: Currying, closures, function factories return functions
- Both patterns enable abstraction and code reuse
- Foundation of functional programming

---

## 🏗️ Core Concepts

### Functions as First-Class Citizens

In languages that support higher-order functions, functions are **first-class citizens**, meaning:
- ✅ Functions can be assigned to variables
- ✅ Functions can be passed as arguments
- ✅ Functions can be returned from other functions
- ✅ Functions can be stored in data structures

### Two Types of Higher-Order Functions

**Type 1: Functions that take functions as arguments**
```javascript
// map takes a function as argument
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(x => x * 2); // [2, 4, 6, 8, 10]
```

**Type 2: Functions that return functions**
```javascript
// createMultiplier returns a function
const createMultiplier = (factor) => (x) => x * factor;
const double = createMultiplier(2);
console.log(double(5)); // 10
```

### Visual Representation

```
HIGHER-ORDER FUNCTIONS:
┌─────────────────────────────────────────────────────────┐
│              TWO TYPES OF HOFs                           │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  TYPE 1: Takes Function as Argument                      │
│  ┌──────────┐         function          ┌──────────┐    │
│  │   HOF    │  ──────────────────────▶  │  Result  │    │
│  │(data, fn)│                            │          │    │
│  └──────────┘                            └──────────┘    │
│                                                           │
│  Examples: map, filter, reduce, forEach                  │
│                                                           │
│  TYPE 2: Returns Function                                │
│  ┌──────────┐                            ┌──────────┐    │
│  │   HOF    │  ──────────────────────▶  │ Function │    │
│  │  (args)  │                            │          │    │
│  └──────────┘                            └──────────┘    │
│                                                           │
│  Examples: currying, closures, function factories        │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Common Higher-Order Functions

### 1. Map - Transform Elements

**Purpose**: Transform each element of a collection

```javascript
// map: (a → b) → [a] → [b]
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(x => x * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// Transform objects
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 }
];
const names = users.map(user => user.name);
console.log(names); // ['Alice', 'Bob']
```

**Custom Implementation:**
```javascript
function map(array, fn) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(fn(array[i], i, array));
  }
  return result;
}

// Usage
const numbers = [1, 2, 3];
const doubled = map(numbers, x => x * 2);
console.log(doubled); // [2, 4, 6]
```

### 2. Filter - Select Elements

**Purpose**: Select elements that meet a condition

```javascript
// filter: (a → bool) → [a] → [a]
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const evens = numbers.filter(x => x % 2 === 0);
console.log(evens); // [2, 4, 6, 8, 10]

// Filter objects
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 17 },
  { name: 'Charlie', age: 30 }
];
const adults = users.filter(user => user.age >= 18);
console.log(adults); // [{ name: 'Alice', age: 25 }, { name: 'Charlie', age: 30 }]
```

**Custom Implementation:**
```javascript
function filter(array, predicate) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i, array)) {
      result.push(array[i]);
    }
  }
  return result;
}

// Usage
const numbers = [1, 2, 3, 4, 5];
const evens = filter(numbers, x => x % 2 === 0);
console.log(evens); // [2, 4]
```

### 3. Reduce - Accumulate Values

**Purpose**: Reduce a collection to a single value

```javascript
// reduce: ((acc, a) → acc) → acc → [a] → acc
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((acc, x) => acc + x, 0);
console.log(sum); // 15

// Find maximum
const max = numbers.reduce((acc, x) => x > acc ? x : acc, numbers[0]);
console.log(max); // 5

// Build object from array
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
];
const userMap = users.reduce((acc, user) => {
  acc[user.id] = user;
  return acc;
}, {});
console.log(userMap);
// { 1: { id: 1, name: 'Alice' }, 2: { id: 2, name: 'Bob' } }
```

**Custom Implementation:**
```javascript
function reduce(array, reducer, initialValue) {
  let accumulator = initialValue;
  let startIndex = 0;
  
  if (initialValue === undefined) {
    accumulator = array[0];
    startIndex = 1;
  }
  
  for (let i = startIndex; i < array.length; i++) {
    accumulator = reducer(accumulator, array[i], i, array);
  }
  
  return accumulator;
}

// Usage
const numbers = [1, 2, 3, 4, 5];
const sum = reduce(numbers, (acc, x) => acc + x, 0);
console.log(sum); // 15
```

### 4. ForEach - Execute Side Effects

**Purpose**: Execute a function for each element (side effects)

```javascript
// forEach: (a → void) → [a] → void
const numbers = [1, 2, 3, 4, 5];
numbers.forEach(x => console.log(x));
// 1
// 2
// 3
// 4
// 5

// Modify external state
let sum = 0;
numbers.forEach(x => {
  sum += x;
});
console.log(sum); // 15
```

**Custom Implementation:**
```javascript
function forEach(array, fn) {
  for (let i = 0; i < array.length; i++) {
    fn(array[i], i, array);
  }
}

// Usage
const numbers = [1, 2, 3];
forEach(numbers, x => console.log(x));
```

### 5. Find - Find First Match

**Purpose**: Find the first element that matches a condition

```javascript
// find: (a → bool) → [a] → a | undefined
const numbers = [1, 2, 3, 4, 5];
const firstEven = numbers.find(x => x % 2 === 0);
console.log(firstEven); // 2

const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 }
];
const user = users.find(u => u.age > 25);
console.log(user); // { name: 'Bob', age: 30 }
```

### 6. Some - Check Any Match

**Purpose**: Check if any element matches a condition

```javascript
// some: (a → bool) → [a] → bool
const numbers = [1, 2, 3, 4, 5];
const hasEven = numbers.some(x => x % 2 === 0);
console.log(hasEven); // true

const hasNegative = numbers.some(x => x < 0);
console.log(hasNegative); // false
```

### 7. Every - Check All Match

**Purpose**: Check if all elements match a condition

```javascript
// every: (a → bool) → [a] → bool
const numbers = [2, 4, 6, 8, 10];
const allEven = numbers.every(x => x % 2 === 0);
console.log(allEven); // true

const allPositive = numbers.every(x => x > 0);
console.log(allPositive); // true
```

---

## 🛠️ Implementation Examples

### JavaScript/TypeScript

#### 1. Functions That Take Functions

```javascript
// Higher-order function that takes a function
function applyOperation(x, y, operation) {
  return operation(x, y);
}

// Usage
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;

console.log(applyOperation(5, 10, add));      // 15
console.log(applyOperation(5, 10, multiply)); // 50

// With arrays
function transformArray(array, transformer) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(transformer(array[i]));
  }
  return result;
}

const numbers = [1, 2, 3, 4, 5];
const doubled = transformArray(numbers, x => x * 2);
console.log(doubled); // [2, 4, 6, 8, 10]
```

#### 2. Functions That Return Functions

```javascript
// Higher-order function that returns a function
function createMultiplier(factor) {
  return function(x) {
    return x * factor;
  };
}

// Usage
const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5));  // 10
console.log(triple(5));  // 15

// With arrow functions
const createMultiplier = (factor) => (x) => x * factor;
const double = createMultiplier(2);
console.log(double(5)); // 10
```

#### 3. Combining Both Types

```javascript
// HOF that takes a function and returns a function
function createValidator(validatorFn) {
  return function(value) {
    return validatorFn(value);
  };
}

// Usage
const isPositive = createValidator(x => x > 0);
const isEven = createValidator(x => x % 2 === 0);

console.log(isPositive(5));  // true
console.log(isPositive(-5)); // false
console.log(isEven(4));      // true
console.log(isEven(5));      // false

// More complex: create validator with custom message
function createValidatorWithMessage(validatorFn, message) {
  return function(value) {
    const isValid = validatorFn(value);
    return {
      isValid,
      message: isValid ? 'Valid' : message
    };
  };
}

const validateAge = createValidatorWithMessage(
  age => age >= 18,
  'Must be 18 or older'
);

console.log(validateAge(20)); // { isValid: true, message: 'Valid' }
console.log(validateAge(15)); // { isValid: false, message: 'Must be 18 or older' }
```

#### 4. TypeScript Implementation

```typescript
// Type-safe higher-order functions
function map<T, U>(array: T[], fn: (item: T, index: number) => U): U[] {
  const result: U[] = [];
  for (let i = 0; i < array.length; i++) {
    result.push(fn(array[i], i));
  }
  return result;
}

function filter<T>(array: T[], predicate: (item: T) => boolean): T[] {
  const result: T[] = [];
  for (const item of array) {
    if (predicate(item)) {
      result.push(item);
    }
  }
  return result;
}

function reduce<T, U>(
  array: T[],
  reducer: (acc: U, item: T, index: number) => U,
  initialValue: U
): U {
  let accumulator = initialValue;
  for (let i = 0; i < array.length; i++) {
    accumulator = reducer(accumulator, array[i], i);
  }
  return accumulator;
}

// Usage
const numbers = [1, 2, 3, 4, 5];
const doubled = map(numbers, x => x * 2);
const evens = filter(numbers, x => x % 2 === 0);
const sum = reduce(numbers, (acc, x) => acc + x, 0);
```

### Python Implementation

```python
from typing import Callable, TypeVar, List

T = TypeVar('T')
U = TypeVar('U')

# Functions that take functions
def map_array(array: List[T], fn: Callable[[T], U]) -> List[U]:
    """Map function over array"""
    return [fn(item) for item in array]

def filter_array(array: List[T], predicate: Callable[[T], bool]) -> List[T]:
    """Filter array with predicate"""
    return [item for item in array if predicate(item)]

def reduce_array(
    array: List[T],
    reducer: Callable[[U, T], U],
    initial: U
) -> U:
    """Reduce array to single value"""
    accumulator = initial
    for item in array:
        accumulator = reducer(accumulator, item)
    return accumulator

# Usage
numbers = [1, 2, 3, 4, 5]
doubled = map_array(numbers, lambda x: x * 2)
evens = filter_array(numbers, lambda x: x % 2 == 0)
sum_total = reduce_array(numbers, lambda acc, x: acc + x, 0)

print(doubled)    # [2, 4, 6, 8, 10]
print(evens)      # [2, 4]
print(sum_total)  # 15

# Functions that return functions
def create_multiplier(factor: int) -> Callable[[int], int]:
    """Create multiplier function"""
    return lambda x: x * factor

double = create_multiplier(2)
triple = create_multiplier(3)

print(double(5))  # 10
print(triple(5))  # 15
```

### C# Implementation

```csharp
using System;
using System.Collections.Generic;
using System.Linq;

// Functions that take functions
public static class HigherOrderFunctions
{
    // Map
    public static List<U> Map<T, U>(List<T> list, Func<T, U> fn)
    {
        var result = new List<U>();
        foreach (var item in list)
        {
            result.Add(fn(item));
        }
        return result;
    }
    
    // Filter
    public static List<T> Filter<T>(List<T> list, Func<T, bool> predicate)
    {
        var result = new List<T>();
        foreach (var item in list)
        {
            if (predicate(item))
            {
                result.Add(item);
            }
        }
        return result;
    }
    
    // Reduce
    public static U Reduce<T, U>(List<T> list, Func<U, T, U> reducer, U initial)
    {
        var accumulator = initial;
        foreach (var item in list)
        {
            accumulator = reducer(accumulator, item);
        }
        return accumulator;
    }
}

// Functions that return functions
public static class FunctionFactories
{
    public static Func<int, int> CreateMultiplier(int factor)
    {
        return x => x * factor;
    }
}

// Usage
class Program
{
    static void Main()
    {
        var numbers = new List<int> { 1, 2, 3, 4, 5 };
        
        // Using HOFs
        var doubled = HigherOrderFunctions.Map(numbers, x => x * 2);
        var evens = HigherOrderFunctions.Filter(numbers, x => x % 2 == 0);
        var sum = HigherOrderFunctions.Reduce(numbers, (acc, x) => acc + x, 0);
        
        Console.WriteLine(string.Join(", ", doubled)); // 2, 4, 6, 8, 10
        Console.WriteLine(string.Join(", ", evens));   // 2, 4
        Console.WriteLine(sum);                        // 15
        
        // Using function factories
        var double = FunctionFactories.CreateMultiplier(2);
        var triple = FunctionFactories.CreateMultiplier(3);
        
        Console.WriteLine(double(5)); // 10
        Console.WriteLine(triple(5));  // 15
    }
}
```

### Haskell Implementation

```haskell
-- Higher-order functions are natural in Haskell

-- Functions that take functions
map' :: (a -> b) -> [a] -> [b]
map' f [] = []
map' f (x:xs) = f x : map' f xs

filter' :: (a -> Bool) -> [a] -> [a]
filter' _ [] = []
filter' p (x:xs)
  | p x       = x : filter' p xs
  | otherwise = filter' p xs

foldl' :: (b -> a -> b) -> b -> [a] -> b
foldl' _ acc [] = acc
foldl' f acc (x:xs) = foldl' f (f acc x) xs

-- Usage
numbers = [1, 2, 3, 4, 5]
doubled = map' (* 2) numbers  -- [2, 4, 6, 8, 10]
evens = filter' even numbers  -- [2, 4]
sum = foldl' (+) 0 numbers     -- 15

-- Functions that return functions
createMultiplier :: Int -> (Int -> Int)
createMultiplier factor = (* factor)

double = createMultiplier 2
triple = createMultiplier 3

result1 = double 5  -- 10
result2 = triple 5  -- 15
```

---

## 🌟 Real-World Applications

### 1. Data Processing Pipelines

```javascript
// Process user data through multiple transformations
const users = [
  { name: 'john doe', age: 25, email: 'JOHN@EXAMPLE.COM', active: true },
  { name: 'jane smith', age: 17, email: 'JANE@EXAMPLE.COM', active: true },
  { name: 'bob brown', age: 30, email: 'BOB@EXAMPLE.COM', active: false }
];

// Chain HOFs to process data
const processedUsers = users
  .filter(user => user.active)                    // Filter active users
  .filter(user => user.age >= 18)                 // Filter adults
  .map(user => ({                                 // Transform
    ...user,
    name: user.name
      .split(' ')
      .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
      .join(' '),
    email: user.email.toLowerCase()
  }))
  .reduce((acc, user) => {                        // Group by first letter
    const firstLetter = user.name[0].toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(user);
    return acc;
  }, {});

console.log(processedUsers);
// {
//   J: [{ name: 'John Doe', age: 25, email: 'john@example.com', active: true }],
//   B: [{ name: 'Bob Brown', age: 30, email: 'bob@example.com', active: false }]
// }
```

### 2. Event Handling

```javascript
// Create event handlers with HOFs
function createEventHandler(eventType, handler) {
  return function(event) {
    if (event.type === eventType) {
      handler(event);
    }
  };
}

// Create specific handlers
const handleClick = createEventHandler('click', (event) => {
  console.log('Clicked!', event.target);
});

const handleKeyPress = createEventHandler('keypress', (event) => {
  console.log('Key pressed!', event.key);
});

// Usage
document.addEventListener('click', handleClick);
document.addEventListener('keypress', handleKeyPress);
```

### 3. Validation System

```javascript
// Create validators with HOFs
function createValidator(validatorFn, errorMessage) {
  return function(value) {
    const isValid = validatorFn(value);
    return {
      isValid,
      error: isValid ? null : errorMessage,
      value
    };
  };
}

// Create specific validators
const validateEmail = createValidator(
  email => email.includes('@'),
  'Invalid email format'
);

const validateLength = (min, max) => createValidator(
  str => str.length >= min && str.length <= max,
  `Length must be between ${min} and ${max}`
);

const validateAge = createValidator(
  age => age >= 18,
  'Must be 18 or older'
);

// Combine validators
function validateAll(validators) {
  return function(value) {
    const results = validators.map(validator => validator(value));
    const errors = results
      .filter(result => !result.isValid)
      .map(result => result.error);
    
    return {
      isValid: errors.length === 0,
      errors,
      value
    };
  };
}

// Usage
const validateUser = validateAll([
  validateEmail,
  validateLength(3, 50),
  validateAge
]);

const result = validateUser('john@example.com');
console.log(result);
```

### 4. Middleware Pattern

```javascript
// Create middleware with HOFs
function createMiddleware(condition, handler) {
  return function(req, res, next) {
    if (condition(req)) {
      handler(req, res, next);
    } else {
      next();
    }
  };
}

// Create specific middleware
const requireAuth = createMiddleware(
  req => req.user !== undefined,
  (req, res, next) => {
    console.log('User authenticated:', req.user);
    next();
  }
);

const requireAdmin = createMiddleware(
  req => req.user?.role === 'admin',
  (req, res, next) => {
    console.log('Admin access granted');
    next();
  }
);

// Compose middleware
function composeMiddleware(...middlewares) {
  return function(req, res, next) {
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
const middleware = composeMiddleware(requireAuth, requireAdmin);
```

### 5. Retry Logic

```javascript
// Create retry function with HOF
function createRetry(maxAttempts, delay) {
  return async function(fn) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  };
}

// Create specific retry functions
const retry3Times = createRetry(3, 1000);
const retry5Times = createRetry(5, 500);

// Usage
async function fetchData() {
  const response = await fetch('/api/data');
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
}

try {
  const data = await retry3Times(fetchData);
  console.log(data);
} catch (error) {
  console.error('Failed after retries:', error);
}
```

### 6. Memoization

```javascript
// Create memoization function with HOF
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// Usage
const expensiveFunction = (n) => {
  console.log('Computing...', n);
  return n * n;
};

const memoized = memoize(expensiveFunction);

console.log(memoized(5));  // Computing... 5, 25
console.log(memoized(5));  // 25 (from cache)
console.log(memoized(5));  // 25 (from cache)
```

### 7. Debouncing and Throttling

```javascript
// Create debounce function with HOF
function debounce(fn, delay) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Create throttle function with HOF
function throttle(fn, delay) {
  let lastCall = 0;
  
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

// Usage
const handleSearch = debounce((query) => {
  console.log('Searching for:', query);
}, 300);

const handleScroll = throttle(() => {
  console.log('Scrolled!');
}, 1000);

// In event handlers
input.addEventListener('input', (e) => handleSearch(e.target.value));
window.addEventListener('scroll', handleScroll);
```

---

## 🔄 Higher-Order Functions vs Regular Functions

### Comparison Table

| Aspect | Regular Function | Higher-Order Function |
|--------|-----------------|----------------------|
| **Arguments** | Primitive values, objects | Functions, or returns functions |
| **Flexibility** | Fixed behavior | Configurable behavior |
| **Reusability** | Limited | High |
| **Abstraction** | Low | High |
| **Use Case** | Specific operations | Generic operations |

### When to Use HOFs

**Use HOFs when:**
- ✅ You need to abstract over behavior
- ✅ You want to create reusable utilities
- ✅ You're working with collections (map, filter, reduce)
- ✅ You need function factories
- ✅ You're building frameworks or libraries

**Don't use HOFs when:**
- ❌ The abstraction doesn't add value
- ❌ Performance is critical (HOFs add overhead)
- ❌ The code becomes harder to understand
- ❌ You're over-engineering simple problems

---

## ⚠️ Common Pitfalls

### 1. Overusing HOFs

```javascript
// ❌ BAD: Over-abstracting simple operations
const add = (x, y) => x + y;
const curriedAdd = x => y => x + y;
const add5 = curriedAdd(5);
const result = add5(10);

// ✅ GOOD: Use HOFs when they add value
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(x => x * 2); // HOF adds value here
```

### 2. Not Understanding Execution Context

```javascript
// ❌ BAD: Losing 'this' context
const obj = {
  name: 'John',
  greet: function() {
    return `Hello, ${this.name}`;
  }
};

const greetFn = obj.greet;
console.log(greetFn()); // "Hello, undefined" (lost context)

// ✅ GOOD: Bind context
const boundGreet = obj.greet.bind(obj);
console.log(boundGreet()); // "Hello, John"

// Or use arrow functions
const obj2 = {
  name: 'John',
  greet: () => `Hello, ${obj2.name}`
};
```

### 3. Side Effects in HOFs

```javascript
// ❌ BAD: Side effects in map
const numbers = [1, 2, 3];
const doubled = numbers.map(x => {
  console.log(x); // Side effect!
  return x * 2;
});

// ✅ GOOD: Separate side effects
const numbers = [1, 2, 3];
const doubled = numbers.map(x => x * 2);
numbers.forEach(x => console.log(x)); // Side effects in forEach
```

### 4. Not Handling Errors

```javascript
// ❌ BAD: No error handling
function map(array, fn) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(fn(array[i])); // Might throw!
  }
  return result;
}

// ✅ GOOD: Handle errors
function mapSafe(array, fn) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    try {
      result.push(fn(array[i]));
    } catch (error) {
      console.error(`Error at index ${i}:`, error);
      // Decide: skip, use default, or throw
    }
  }
  return result;
}
```

---

## 📊 HOF Decision Matrix

| Scenario | Use HOF? | Why |
|----------|---------|-----|
| Transform collection | ✅ Yes | `map` is perfect |
| Filter collection | ✅ Yes | `filter` is perfect |
| Accumulate values | ✅ Yes | `reduce` is perfect |
| Create function factories | ✅ Yes | HOFs excel here |
| Simple arithmetic | ❌ No | Overkill |
| One-time operation | ❌ No | Regular function is fine |
| Building libraries | ✅ Yes | HOFs enable abstraction |

---

## 🎯 Best Practices

### 1. Use Descriptive Names

```javascript
// ✅ GOOD: Clear names
function createValidator(validatorFn) { ... }
function applyTransformation(data, transformFn) { ... }

// ❌ BAD: Unclear names
function create(fn) { ... }
function apply(data, fn) { ... }
```

### 2. Keep Functions Pure

```javascript
// ✅ GOOD: Pure function
function map(array, fn) {
  return array.map(fn); // No side effects
}

// ❌ BAD: Impure function
function map(array, fn) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(fn(array[i]));
    console.log(i); // Side effect!
  }
  return result;
}
```

### 3. Document Function Signatures

```javascript
/**
 * Maps a function over an array
 * @param {Array<T>} array - Input array
 * @param {function(T, number): U} fn - Transformation function
 * @returns {Array<U>} Transformed array
 */
function map(array, fn) {
  return array.map(fn);
}
```

### 4. Use TypeScript for Type Safety

```typescript
// ✅ GOOD: Type-safe HOF
function map<T, U>(array: T[], fn: (item: T, index: number) => U): U[] {
  return array.map(fn);
}

// TypeScript catches type errors at compile time!
```

---

## 🔗 Related Patterns

| Pattern | Relationship |
|---------|--------------|
| **Composition** | HOFs enable composition |
| **Currying** | Currying creates HOFs (returns functions) |
| **Closure** | HOFs often use closures |
| **Functor** | Functors use HOFs (map) |
| **Monad** | Monads use HOFs (bind) |

---

## 📝 Key Takeaways

1. **HOFs treat functions as first-class** - Functions can be arguments or return values
2. **Two types** - Functions that take functions, and functions that return functions
3. **Common HOFs** - map, filter, reduce, forEach, find, some, every
4. **Enable abstraction** - HOFs create reusable, generic utilities
5. **Foundation of FP** - HOFs are essential for functional programming
6. **Use wisely** - Don't over-abstract, but use when they add value
7. **Type safety helps** - Use TypeScript to catch errors early

---

## 🎯 Summary

**Higher-Order Functions** provide:

- ✅ A way to abstract over behavior
- ✅ Reusable, generic utilities
- ✅ Foundation for functional programming
- ✅ Powerful collection operations
- ✅ Function factories and specialization

**HOF Formula:**
```
HOF = Function that takes functions OR returns functions
```

**Common HOFs:**
- `map`: Transform each element
- `filter`: Select matching elements
- `reduce`: Accumulate to single value
- `forEach`: Execute for each element
- `find`: Find first match
- `some`: Check if any match
- `every`: Check if all match

**Remember:**
- HOFs treat functions as first-class citizens
- They enable powerful abstractions
- Use them when they add value, not just because you can
- They're the foundation of functional programming
- Type safety helps catch errors early

---

**Date Created:** 2026-02-26  
**Pattern Type:** Functional Programming / Core Concept  
**Difficulty:** Intermediate  
**Related Patterns:** Composition, Currying, Closure, Functor, Monad  
**Prerequisites:** Understanding of functions, arrays, functional programming basics

