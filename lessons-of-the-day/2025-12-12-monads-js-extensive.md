# Extensive JavaScript Monad Examples and Antipatterns

## Table of Contents
1. [Maybe Monad - Complete Implementation](#maybe-monad)
2. [Either Monad - Complete Implementation](#either-monad)
3. [IO Monad - Complete Implementation](#io-monad)
4. [Promise as Monad](#promise-as-monad)
5. [Array as Monad](#array-as-monad)
6. [Custom Monad: Task Monad](#task-monad)
7. [Composing Multiple Monads](#composing-monads)
8. [Common Antipatterns](#antipatterns)

---

## Maybe Monad - Complete Implementation {#maybe-monad}

### Full Implementation

```javascript
class Maybe {
  constructor(value) {
    this.value = value;
    this.isNothing = value === null || value === undefined;
  }
  
  // Static factory methods
  static of(value) {
    return new Maybe(value);
  }
  
  static nothing() {
    return new Maybe(null);
  }
  
  static just(value) {
    if (value === null || value === undefined) {
      throw new Error('Just cannot contain null or undefined');
    }
    return new Maybe(value);
  }
  
  // Core monad operations
  bind(fn) {
    return this.isNothing ? Maybe.nothing() : fn(this.value);
  }
  
  map(fn) {
    return this.isNothing ? Maybe.nothing() : Maybe.of(fn(this.value));
  }
  
  // Additional utility methods
  flatMap(fn) {
    return this.bind(fn);
  }
  
  filter(predicate) {
    return this.isNothing || !predicate(this.value) 
      ? Maybe.nothing() 
      : this;
  }
  
  getOrElse(defaultValue) {
    return this.isNothing ? defaultValue : this.value;
  }
  
  orElse(fn) {
    return this.isNothing ? fn() : this;
  }
  
  fold(ifNothing, ifJust) {
    return this.isNothing ? ifNothing() : ifJust(this.value);
  }
  
  toString() {
    return this.isNothing ? 'Nothing' : `Just(${this.value})`;
  }
  
  // Check if value exists
  isJust() {
    return !this.isNothing;
  }
  
  // Extract value (unsafe)
  unsafeGet() {
    if (this.isNothing) {
      throw new Error('Cannot get value from Nothing');
    }
    return this.value;
  }
}

// Helper functions for common operations
const safeDivide = (x, y) => 
  y === 0 ? Maybe.nothing() : Maybe.of(x / y);

const safeParseInt = (str) => {
  const num = parseInt(str, 10);
  return isNaN(num) ? Maybe.nothing() : Maybe.of(num);
};

const safeGet = (obj, path) => {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined) {
      return Maybe.nothing();
    }
    current = current[key];
  }
  return current === null || current === undefined 
    ? Maybe.nothing() 
    : Maybe.of(current);
};

// Extensive Usage Examples

// Example 1: Chaining safe operations
const result1 = Maybe.of(100)
  .bind(x => safeDivide(x, 2))
  .bind(x => safeDivide(x, 5))
  .bind(x => safeDivide(x, 2));
console.log(result1.toString()); // Just(5)

// Example 2: Handling failures gracefully
const result2 = Maybe.of(100)
  .bind(x => safeDivide(x, 0))  // Fails here
  .bind(x => safeDivide(x, 5))  // Never executed
  .getOrElse(0);                // Returns 0
console.log(result2); // 0

// Example 3: Parsing and transforming
const parseAndDouble = (str) => 
  safeParseInt(str)
    .map(x => x * 2)
    .getOrElse(0);

console.log(parseAndDouble("10"));  // 20
console.log(parseAndDouble("abc")); // 0

// Example 4: Deep object access
const user = {
  profile: {
    address: {
      city: "New York"
    }
  }
};

const city1 = safeGet(user, 'profile.address.city');
console.log(city1.getOrElse('Unknown')); // "New York"

const city2 = safeGet(user, 'profile.address.zip');
console.log(city2.getOrElse('Unknown')); // "Unknown"

// Example 5: Filtering
const numbers = [1, 2, 3, 4, 5].map(n => Maybe.of(n));
const evens = numbers
  .map(m => m.filter(n => n % 2 === 0))
  .filter(m => m.isJust())
  .map(m => m.unsafeGet());
console.log(evens); // [2, 4]

// Example 6: Complex computation chain
const calculate = (a, b, c) => 
  Maybe.of(a)
    .bind(x => safeDivide(x, b))
    .bind(x => safeDivide(x, c))
    .map(x => Math.round(x * 100) / 100)
    .filter(x => x > 0)
    .getOrElse(0);

console.log(calculate(100, 2, 5)); // 10
console.log(calculate(100, 0, 5));  // 0 (division by zero)
console.log(calculate(-100, 2, 5)); // 0 (filtered out negative)
```

---

## Either Monad - Complete Implementation {#either-monad}

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
  
  bind(fn) {
    return this.isLeft ? this : fn(this.value);
  }
  
  map(fn) {
    return this.isLeft ? this : Either.right(fn(this.value));
  }
  
  fold(leftFn, rightFn) {
    return this.isLeft ? leftFn(this.value) : rightFn(this.value);
  }
  
  getOrElse(defaultValue) {
    return this.isLeft ? defaultValue : this.value;
  }
  
  orElse(fn) {
    return this.isLeft ? fn(this.value) : this;
  }
  
  swap() {
    return this.isLeft 
      ? Either.right(this.value) 
      : Either.left(this.value);
  }
  
  toString() {
    return this.isLeft 
      ? `Left(${this.value})` 
      : `Right(${this.value})`;
  }
}

// Validation functions
const validateAge = (age) => {
  if (typeof age !== 'number') {
    return Either.left('Age must be a number');
  }
  if (age < 0) {
    return Either.left('Age cannot be negative');
  }
  if (age > 150) {
    return Either.left('Age seems unrealistic');
  }
  return Either.right(age);
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return Either.left('Invalid email format');
  }
  return Either.right(email);
};

const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return Either.left('Name cannot be empty');
  }
  if (name.length < 2) {
    return Either.left('Name must be at least 2 characters');
  }
  return Either.right(name.trim());
};

// Complex validation example
const createUser = (name, email, age) => 
  validateName(name)
    .bind(validName => 
      validateEmail(email)
        .bind(validEmail => 
          validateAge(age)
            .map(validAge => ({
              name: validName,
              email: validEmail,
              age: validAge
            }))
        )
    );

// Usage
const user1 = createUser("John Doe", "john@example.com", 25);
console.log(user1.toString()); // Right({name: "John Doe", ...})

const user2 = createUser("", "invalid-email", -5);
console.log(user2.toString()); // Left("Name cannot be empty")

// Error accumulation (advanced)
class Validation {
  constructor(value, errors) {
    this.value = value;
    this.errors = errors || [];
  }
  
  static success(value) {
    return new Validation(value, []);
  }
  
  static failure(errors) {
    return new Validation(null, Array.isArray(errors) ? errors : [errors]);
  }
  
  bind(fn) {
    if (this.errors.length > 0) {
      return this;
    }
    const result = fn(this.value);
    return result.errors 
      ? new Validation(null, [...this.errors, ...result.errors])
      : result;
  }
  
  map(fn) {
    return this.errors.length > 0 
      ? this 
      : Validation.success(fn(this.value));
  }
  
  combine(other) {
    return new Validation(
      this.errors.length === 0 && other.errors.length === 0 
        ? [this.value, other.value] 
        : null,
      [...this.errors, ...other.errors]
    );
  }
}

// Validation with error accumulation
const validateUser = (name, email, age) => {
  const nameVal = validateName(name).fold(
    err => Validation.failure(err),
    val => Validation.success(val)
  );
  
  const emailVal = validateEmail(email).fold(
    err => Validation.failure(err),
    val => Validation.success(val)
  );
  
  const ageVal = validateAge(age).fold(
    err => Validation.failure(err),
    val => Validation.success(val)
  );
  
  return nameVal
    .combine(emailVal)
    .combine(ageVal)
    .map(([n, e, a]) => ({ name: n, email: e, age: a }));
};

const user3 = validateUser("", "bad-email", -5);
console.log(user3.errors); 
// ["Name cannot be empty", "Invalid email format", "Age cannot be negative"]
```

---

## IO Monad - Complete Implementation {#io-monad}

```javascript
class IO {
  constructor(effect) {
    if (typeof effect !== 'function') {
      throw new Error('IO effect must be a function');
    }
    this.effect = effect;
  }
  
  static of(value) {
    return new IO(() => value);
  }
  
  static from(fn) {
    return new IO(fn);
  }
  
  bind(fn) {
    return new IO(() => {
      const result = this.effect();
      return fn(result).effect();
    });
  }
  
  map(fn) {
    return this.bind(x => IO.of(fn(x)));
  }
  
  run() {
    return this.effect();
  }
  
  // Execute and return IO
  chain(fn) {
    return this.bind(fn);
  }
  
  // Execute multiple IOs in sequence
  static sequence(ios) {
    return new IO(() => {
      const results = [];
      for (const io of ios) {
        results.push(io.run());
      }
      return results;
    });
  }
}

// IO utilities
const getLine = new IO(() => {
  // In browser: return prompt("Enter value:");
  // In Node: return require('readline').createInterface(...)
  return "user input"; // Mock for example
});

const putStrLn = (str) => new IO(() => {
  console.log(str);
  return str;
});

const readFile = (path) => new IO(() => {
  // In real implementation: return fs.readFileSync(path, 'utf8')
  return `Contents of ${path}`;
});

const writeFile = (path, content) => new IO(() => {
  // In real implementation: fs.writeFileSync(path, content)
  console.log(`Writing to ${path}: ${content}`);
  return content;
});

// Complex IO program
const program = putStrLn("What's your name?")
  .bind(() => getLine)
  .bind(name => putStrLn(`Hello, ${name}!`)
    .bind(() => putStrLn("What's your age?"))
    .bind(() => getLine)
    .bind(age => putStrLn(`You are ${age} years old`))
  );

// Execute the program
// program.run();

// File operations example
const fileProgram = readFile("input.txt")
  .map(content => content.toUpperCase())
  .bind(upperContent => writeFile("output.txt", upperContent))
  .map(() => putStrLn("File processed successfully"));

// fileProgram.run();
```

---

## Promise as Monad {#promise-as-monad}

JavaScript Promises are very similar to monads:

```javascript
// Promise already has monad-like behavior
const fetchUser = (id) => 
  fetch(`/api/users/${id}`)
    .then(res => res.json());

const fetchPosts = (userId) => 
  fetch(`/api/users/${userId}/posts`)
    .then(res => res.json());

// Chaining (bind operation)
const getUserAndPosts = (userId) => 
  fetchUser(userId)
    .then(user => fetchPosts(user.id))  // bind operation
    .then(posts => ({ user: userId, posts }));

// Error handling (similar to Either)
const safeFetch = (url) => 
  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    })
    .catch(err => ({ error: err.message }));

// Composing promises
const fetchAllData = (userId) => 
  Promise.all([
    fetchUser(userId),
    fetchPosts(userId)
  ])
    .then(([user, posts]) => ({ user, posts }));

// Using async/await (cleaner syntax)
const getUserAndPostsAsync = async (userId) => {
  try {
    const user = await fetchUser(userId);
    const posts = await fetchPosts(user.id);
    return { user, posts };
  } catch (error) {
    return { error: error.message };
  }
};
```

---

## Array as Monad {#array-as-monad}

Arrays in JavaScript have monadic behavior:

```javascript
// Array already implements monad operations
const numbers = [1, 2, 3, 4, 5];

// map is like fmap (functor)
const doubled = numbers.map(x => x * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// flatMap is like bind
const pairs = [1, 2, 3].flatMap(x => 
  [4, 5, 6].map(y => [x, y])
);
console.log(pairs); 
// [[1,4], [1,5], [1,6], [2,4], [2,5], [2,6], [3,4], [3,5], [3,6]]

// Complex example: generating combinations
const generateCombinations = (arr1, arr2) => 
  arr1.flatMap(x => 
    arr2.flatMap(y => 
      arr2.filter(z => z !== y).map(z => [x, y, z])
    )
  );

const result = generateCombinations([1, 2], ['a', 'b']);
console.log(result);
// [[1, 'a', 'b'], [1, 'b', 'a'], [2, 'a', 'b'], [2, 'b', 'a']]

// Filtering and mapping
const processNumbers = (numbers) => 
  numbers
    .filter(n => n > 0)
    .map(n => n * 2)
    .filter(n => n < 10)
    .flatMap(n => [n, n + 1]);

console.log(processNumbers([1, 2, 3, 4, 5]));
// [2, 3, 4, 5, 6, 7, 8, 9]
```

---

## Custom Monad: Task Monad {#task-monad}

A Task monad for lazy asynchronous computations:

```javascript
class Task {
  constructor(computation) {
    this.computation = computation;
  }
  
  static of(value) {
    return new Task((resolve) => resolve(value));
  }
  
  static rejected(error) {
    return new Task((resolve, reject) => reject(error));
  }
  
  bind(fn) {
    return new Task((resolve, reject) => {
      this.fork(
        value => fn(value).fork(resolve, reject),
        reject
      );
    });
  }
  
  map(fn) {
    return this.bind(x => Task.of(fn(x)));
  }
  
  fork(resolve, reject) {
    return this.computation(resolve, reject);
  }
  
  // Additional utilities
  catch(fn) {
    return new Task((resolve, reject) => {
      this.fork(resolve, error => fn(error).fork(resolve, reject));
    });
  }
  
  static all(tasks) {
    return new Task((resolve, reject) => {
      const results = [];
      let completed = 0;
      let hasError = false;
      
      tasks.forEach((task, index) => {
        task.fork(
          value => {
            if (!hasError) {
              results[index] = value;
              completed++;
              if (completed === tasks.length) {
                resolve(results);
              }
            }
          },
          error => {
            if (!hasError) {
              hasError = true;
              reject(error);
            }
          }
        );
      });
    });
  }
}

// Usage
const fetchUser = (id) => new Task((resolve, reject) => {
  setTimeout(() => {
    if (id > 0) {
      resolve({ id, name: `User ${id}` });
    } else {
      reject(new Error('Invalid user ID'));
    }
  }, 100);
});

const fetchPosts = (userId) => new Task((resolve, reject) => {
  setTimeout(() => {
    resolve([{ id: 1, title: 'Post 1' }, { id: 2, title: 'Post 2' }]);
  }, 100);
});

// Chaining tasks
const getUserAndPosts = (userId) => 
  fetchUser(userId)
    .bind(user => fetchPosts(user.id)
      .map(posts => ({ user, posts }))
    );

// Execute
getUserAndPosts(1).fork(
  result => console.log('Success:', result),
  error => console.error('Error:', error)
);
```

---

## Composing Multiple Monads {#composing-monads}

```javascript
// Monad transformers (simplified)
class MaybeT {
  constructor(monad) {
    this.monad = monad;
  }
  
  static of(value) {
    return new MaybeT(Maybe.of(value));
  }
  
  bind(fn) {
    return new MaybeT(
      this.monad.bind(maybe => 
        maybe.isNothing 
          ? Maybe.nothing() 
          : fn(maybe.value).monad
      )
    );
  }
  
  map(fn) {
    return this.bind(x => MaybeT.of(fn(x)));
  }
  
  unwrap() {
    return this.monad;
  }
}

// Composing Maybe with async operations
const asyncSafeDivide = (x, y) => 
  new Promise(resolve => {
    setTimeout(() => {
      resolve(y === 0 ? Maybe.nothing() : Maybe.of(x / y));
    }, 100);
  });

const asyncComputation = async () => {
  const result1 = await asyncSafeDivide(100, 2);
  if (result1.isNothing) return Maybe.nothing();
  
  const result2 = await asyncSafeDivide(result1.value, 5);
  if (result2.isNothing) return Maybe.nothing();
  
  return Maybe.of(result2.value);
};

// Using Task with Maybe
const taskSafeDivide = (x, y) => 
  new Task((resolve) => {
    setTimeout(() => {
      resolve(y === 0 ? Maybe.nothing() : Maybe.of(x / y));
    }, 100);
  });

const taskComputation = taskSafeDivide(100, 2)
  .bind(maybe => 
    maybe.isNothing 
      ? Task.of(Maybe.nothing())
      : taskSafeDivide(maybe.value, 5)
  );
```

---

## Common Antipatterns {#antipatterns}

### ❌ Antipattern 1: Not Using Monads When You Should

```javascript
// BAD: Nested null checks
function getUserCity(user) {
  if (user) {
    if (user.profile) {
      if (user.profile.address) {
        if (user.profile.address.city) {
          return user.profile.address.city;
        }
      }
    }
  }
  return null;
}

// GOOD: Using Maybe monad
function getUserCity(user) {
  return Maybe.of(user)
    .bind(u => safeGet(u, 'profile.address.city'))
    .getOrElse(null);
}
```

### ❌ Antipattern 2: Mixing Monadic and Non-Monadic Code

```javascript
// BAD: Breaking the monad chain
const result = Maybe.of(10)
  .bind(x => safeDivide(x, 2));
  
if (result.isNothing) {
  return null;
}

const value = result.value; // Extracting value breaks the chain
const final = value * 2;    // Not using monad operations

// GOOD: Staying in the monad
const result = Maybe.of(10)
  .bind(x => safeDivide(x, 2))
  .map(x => x * 2)
  .getOrElse(0);
```

### ❌ Antipattern 3: Not Handling Errors Properly

```javascript
// BAD: Throwing errors in monadic context
class BadMaybe {
  bind(fn) {
    try {
      return fn(this.value);
    } catch (e) {
      throw e; // Breaks monad pattern
    }
  }
}

// GOOD: Converting errors to Nothing
class GoodMaybe {
  bind(fn) {
    if (this.isNothing) return Maybe.nothing();
    try {
      return fn(this.value);
    } catch (e) {
      return Maybe.nothing(); // Handle error gracefully
    }
  }
}
```

### ❌ Antipattern 4: Mutating State in Monads

```javascript
// BAD: Mutating the wrapped value
class BadMonad {
  constructor(value) {
    this.value = value;
  }
  
  map(fn) {
    this.value = fn(this.value); // Mutation!
    return this;
  }
}

// GOOD: Returning new instances
class GoodMonad {
  constructor(value) {
    this.value = value;
  }
  
  map(fn) {
    return new GoodMonad(fn(this.value)); // New instance
  }
}
```

### ❌ Antipattern 5: Not Following Monad Laws

```javascript
// BAD: Violates left identity law
class BadMaybe {
  bind(fn) {
    // This violates: return a >>= f ≡ f a
    if (this.isNothing) return Maybe.nothing();
    const result = fn(this.value);
    // Adding extra logic breaks the law
    if (result.value === 42) {
      return Maybe.nothing(); // Wrong!
    }
    return result;
  }
}

// GOOD: Following monad laws
class GoodMaybe {
  bind(fn) {
    return this.isNothing ? Maybe.nothing() : fn(this.value);
  }
}
```

### ❌ Antipattern 6: Overusing Monads

```javascript
// BAD: Using monads for simple operations
const add = (a, b) => 
  Maybe.of(a)
    .bind(x => Maybe.of(b)
      .map(y => x + y)
    );

// GOOD: Simple operations don't need monads
const add = (a, b) => a + b;

// Use monads when you have:
// - Potential null/undefined values
// - Error handling needs
// - Side effects
// - Complex chaining
```

### ❌ Antipattern 7: Not Composing Monads Properly

```javascript
// BAD: Manually unwrapping and rewrapping
const badCompose = async (userId) => {
  const userMaybe = await fetchUser(userId);
  if (userMaybe.isNothing) {
    return Maybe.nothing();
  }
  const user = userMaybe.value;
  const postsMaybe = await fetchPosts(user.id);
  if (postsMaybe.isNothing) {
    return Maybe.nothing();
  }
  return Maybe.of({ user, posts: postsMaybe.value });
};

// GOOD: Using proper composition
const goodCompose = async (userId) => {
  const user = await fetchUser(userId);
  return user.bind(u => 
    fetchPosts(u.id).map(posts => ({ user: u, posts }))
  );
};
```

### ❌ Antipattern 8: Ignoring the Context

```javascript
// BAD: Treating all monads the same way
function process(data) {
  // Maybe monad
  const maybe = Maybe.of(data);
  
  // Either monad
  const either = Either.right(data);
  
  // Using them interchangeably - WRONG!
  return maybe.bind(x => either.map(y => x + y));
}

// GOOD: Understanding each monad's purpose
function processMaybe(data) {
  return Maybe.of(data)
    .filter(x => x > 0)
    .map(x => x * 2);
}

function processEither(data) {
  return validate(data)
    .bind(valid => Either.right(processValid(valid)));
}
```

### ❌ Antipattern 9: Not Using Helper Functions

```javascript
// BAD: Repeating monad creation logic
function getUserName1(user) {
  if (user && user.name) {
    return Maybe.of(user.name);
  }
  return Maybe.nothing();
}

function getUserEmail1(user) {
  if (user && user.email) {
    return Maybe.of(user.email);
  }
  return Maybe.nothing();
}

// GOOD: Creating reusable helpers
const safeGet = (obj, path) => {
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current == null) return Maybe.nothing();
    current = current[key];
  }
  return current != null ? Maybe.of(current) : Maybe.nothing();
};

const getUserName = (user) => safeGet(user, 'name');
const getUserEmail = (user) => safeGet(user, 'email');
```

### ❌ Antipattern 10: Premature Extraction

```javascript
// BAD: Extracting values too early
const process = (data) => {
  const maybe = Maybe.of(data);
  const value = maybe.getOrElse(0); // Extracted too early!
  
  // Now we've lost the monadic context
  if (value > 10) {
    return value * 2;
  }
  return null; // Manual null handling again
};

// GOOD: Keep values in monadic context
const process = (data) => 
  Maybe.of(data)
    .filter(x => x > 10)
    .map(x => x * 2)
    .getOrElse(null);
```

---

## Best Practices Summary

✅ **DO:**
- Use monads for operations that can fail or return null
- Keep values in monadic context as long as possible
- Compose monads using bind/map operations
- Follow the monad laws
- Create helper functions for common patterns
- Use appropriate monad types for different contexts

❌ **DON'T:**
- Extract values from monads prematurely
- Mix monadic and non-monadic code unnecessarily
- Mutate monad instances
- Use monads for simple operations that don't need them
- Violate monad laws
- Ignore the specific context each monad provides

