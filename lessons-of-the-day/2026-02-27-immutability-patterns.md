# Immutability Patterns

## 📋 Learning Objectives

- [ ] Understand what immutability is and why it matters
- [ ] Recognize the difference between mutable and immutable data
- [ ] Master patterns for creating immutable data structures
- [ ] Learn techniques for updating immutable data
- [ ] Understand structural sharing and performance considerations
- [ ] Apply immutability patterns in real-world scenarios
- [ ] Use immutability with functional programming patterns

---

## 🎯 Definition

**Immutability** is the principle that data cannot be changed after it's created. Once an immutable value is created, it remains unchanged throughout its lifetime.

**Key Principle:**
> "Don't change what exists, create new versions instead."

**In simple terms:**
- **Mutable**: Data can be changed in place
- **Immutable**: Data cannot be changed; create new data instead
- **Benefits**: Predictability, thread-safety, easier reasoning, better debugging
- **Trade-off**: Memory usage (though structural sharing helps)

---

## 🏗️ Core Concepts

### Mutable vs Immutable

**Mutable (Can Change):**
```javascript
// ❌ MUTABLE: Original data is modified
const user = { name: 'Alice', age: 25 };
user.age = 26;  // Original object changed!
console.log(user); // { name: 'Alice', age: 26 }
```

**Immutable (Cannot Change):**
```javascript
// ✅ IMMUTABLE: New data is created
const user = { name: 'Alice', age: 25 };
const updatedUser = { ...user, age: 26 };  // New object created
console.log(user);        // { name: 'Alice', age: 25 } (unchanged)
console.log(updatedUser); // { name: 'Alice', age: 26 } (new object)
```

### Visual Representation

```
MUTABLE UPDATE:
┌─────────────────────────────────────────────────────────┐
│              MUTABLE DATA UPDATE                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Before: { name: 'Alice', age: 25 }                     │
│    │                                                       │
│    ▼ (modify in place)                                    │
│  After:  { name: 'Alice', age: 26 }                      │
│                                                           │
│  Original data is destroyed!                              │
└─────────────────────────────────────────────────────────┘

IMMUTABLE UPDATE:
┌─────────────────────────────────────────────────────────┐
│            IMMUTABLE DATA UPDATE                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Original: { name: 'Alice', age: 25 }                    │
│    │                                                       │
│    ├─▶ (create new)                                       │
│    │                                                       │
│    ▼                                                       │
│  Updated:  { name: 'Alice', age: 26 }                     │
│                                                           │
│  Original data is preserved!                              │
└─────────────────────────────────────────────────────────┘
```

### Why Immutability Matters

**Benefits:**
1. **Predictability** - Data doesn't change unexpectedly
2. **Thread Safety** - No race conditions with immutable data
3. **Easier Debugging** - Values don't change, easier to trace
4. **Time Travel** - Can keep history of all states
5. **Referential Equality** - Same value = same reference
6. **Functional Programming** - Works perfectly with pure functions

**Trade-offs:**
1. **Memory Usage** - Creating new objects uses more memory
2. **Performance** - Copying can be slower (though structural sharing helps)
3. **Learning Curve** - Different way of thinking about updates

---

## 📊 Immutability Patterns

### 1. Object Spread Pattern

**Pattern**: Use spread operator to create new objects

```javascript
// Update object immutably
const user = { name: 'Alice', age: 25, city: 'NYC' };

// Update single property
const updatedUser = { ...user, age: 26 };
// { name: 'Alice', age: 26, city: 'NYC' }

// Update multiple properties
const updatedUser2 = { ...user, age: 26, city: 'LA' };
// { name: 'Alice', age: 26, city: 'LA' }

// Add new property
const userWithEmail = { ...user, email: 'alice@example.com' };
// { name: 'Alice', age: 25, city: 'NYC', email: 'alice@example.com' }

// Remove property (using destructuring)
const { age, ...userWithoutAge } = user;
// { name: 'Alice', city: 'NYC' }
```

### 2. Array Spread Pattern

**Pattern**: Use spread operator to create new arrays

```javascript
// Update array immutably
const numbers = [1, 2, 3, 4, 5];

// Add element
const withSix = [...numbers, 6];
// [1, 2, 3, 4, 5, 6]

// Add element at beginning
const withZero = [0, ...numbers];
// [0, 1, 2, 3, 4, 5]

// Update element at index
const updated = numbers.map((n, i) => i === 2 ? 99 : n);
// [1, 2, 99, 4, 5]

// Remove element
const withoutThree = numbers.filter(n => n !== 3);
// [1, 2, 4, 5]

// Insert element at index
const insertAt = (arr, index, item) => [
  ...arr.slice(0, index),
  item,
  ...arr.slice(index)
];
const withInsert = insertAt(numbers, 2, 99);
// [1, 2, 99, 3, 4, 5]
```

### 3. Nested Update Pattern

**Pattern**: Update nested structures immutably

```javascript
// Update nested object
const state = {
  user: {
    name: 'Alice',
    profile: {
      age: 25,
      email: 'alice@example.com'
    }
  }
};

// Update nested property
const updatedState = {
  ...state,
  user: {
    ...state.user,
    profile: {
      ...state.user.profile,
      age: 26
    }
  }
};

// Helper function for deep updates
function updateNested(obj, path, value) {
  if (path.length === 1) {
    return { ...obj, [path[0]]: value };
  }
  const [first, ...rest] = path;
  return {
    ...obj,
    [first]: updateNested(obj[first], rest, value)
  };
}

// Usage
const updated = updateNested(state, ['user', 'profile', 'age'], 26);
```

### 4. Structural Sharing Pattern

**Pattern**: Share unchanged parts between old and new structures

```javascript
// Structural sharing example
const original = {
  user: { name: 'Alice', age: 25 },
  settings: { theme: 'dark', lang: 'en' }
};

// Only user changes, settings is shared
const updated = {
  ...original,
  user: { ...original.user, age: 26 }
};

// original.settings === updated.settings (same reference!)
console.log(original.settings === updated.settings); // true
```

### 5. Immutable Collections Pattern

**Pattern**: Use immutable collection libraries

```javascript
// Using Immutable.js
import { Map, List } from 'immutable';

// Create immutable map
const user = Map({ name: 'Alice', age: 25 });

// Update immutably
const updatedUser = user.set('age', 26);
console.log(user.get('age'));      // 25 (unchanged)
console.log(updatedUser.get('age')); // 26 (new map)

// Create immutable list
const numbers = List([1, 2, 3, 4, 5]);
const updatedNumbers = numbers.push(6);
console.log(numbers.size);        // 5 (unchanged)
console.log(updatedNumbers.size); // 6 (new list)
```

### 6. Freeze Pattern

**Pattern**: Use Object.freeze to prevent mutations

```javascript
// Shallow freeze
const user = Object.freeze({ name: 'Alice', age: 25 });
user.age = 26;  // Silent failure in strict mode, error in strict mode
console.log(user.age); // 25 (unchanged)

// Deep freeze helper
function deepFreeze(obj) {
  Object.getOwnPropertyNames(obj).forEach(name => {
    const value = obj[name];
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  });
  return Object.freeze(obj);
}

// Usage
const user = deepFreeze({
  name: 'Alice',
  profile: { age: 25 }
});
user.profile.age = 26; // Error in strict mode
```

---

## 🛠️ Implementation Examples

### JavaScript/TypeScript

#### 1. Immutable Object Updates

```javascript
// Helper functions for immutable updates
const updateObject = (obj, updates) => ({ ...obj, ...updates });

const removeProperty = (obj, key) => {
  const { [key]: removed, ...rest } = obj;
  return rest;
};

const setNested = (obj, path, value) => {
  if (path.length === 1) {
    return { ...obj, [path[0]]: value };
  }
  const [first, ...rest] = path;
  return {
    ...obj,
    [first]: setNested(obj[first] || {}, rest, value)
  };
};

// Usage
const user = { name: 'Alice', age: 25, city: 'NYC' };
const updated = updateObject(user, { age: 26 });
const withoutAge = removeProperty(user, 'age');
const nestedUpdated = setNested(
  { user: { profile: { age: 25 } } },
  ['user', 'profile', 'age'],
  26
);
```

#### 2. Immutable Array Updates

```javascript
// Helper functions for immutable array updates
const addItem = (array, item) => [...array, item];
const addItemAt = (array, index, item) => [
  ...array.slice(0, index),
  item,
  ...array.slice(index)
];
const updateItem = (array, index, updater) =>
  array.map((item, i) => i === index ? updater(item) : item);
const removeItem = (array, index) => [
  ...array.slice(0, index),
  ...array.slice(index + 1)
];

// Usage
const numbers = [1, 2, 3, 4, 5];
const withSix = addItem(numbers, 6);
const withZero = addItemAt(numbers, 0, 0);
const doubled = updateItem(numbers, 2, n => n * 2);
const withoutThree = removeItem(numbers, 2);
```

#### 3. Immutable State Management

```javascript
// Redux-style immutable state updates
function reducer(state = { users: [], count: 0 }, action) {
  switch (action.type) {
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload],
        count: state.count + 1
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id
            ? { ...user, ...action.payload }
            : user
        )
      };
    
    case 'REMOVE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
        count: state.count - 1
      };
    
    default:
      return state;
  }
}

// Usage
const initialState = { users: [], count: 0 };
const state1 = reducer(initialState, {
  type: 'ADD_USER',
  payload: { id: 1, name: 'Alice' }
});
const state2 = reducer(state1, {
  type: 'UPDATE_USER',
  payload: { id: 1, name: 'Alice Updated' }
});
```

#### 4. TypeScript Immutable Classes

```typescript
// Immutable class with readonly properties
class ImmutableUser {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly age: number
  ) {}
  
  // Methods return new instances
  withAge(age: number): ImmutableUser {
    return new ImmutableUser(this.id, this.name, age);
  }
  
  withName(name: string): ImmutableUser {
    return new ImmutableUser(this.id, name, this.age);
  }
  
  // Update multiple properties
  update(updates: Partial<Pick<ImmutableUser, 'name' | 'age'>>): ImmutableUser {
    return new ImmutableUser(
      this.id,
      updates.name ?? this.name,
      updates.age ?? this.age
    );
  }
}

// Usage
const user = new ImmutableUser('1', 'Alice', 25);
const updated = user.withAge(26);
console.log(user.age);   // 25 (unchanged)
console.log(updated.age); // 26 (new instance)
```

### Python Implementation

```python
from dataclasses import dataclass
from typing import List
from copy import deepcopy

# Immutable dataclass
@dataclass(frozen=True)
class ImmutableUser:
    id: str
    name: str
    age: int
    
    def with_age(self, age: int) -> 'ImmutableUser':
        return ImmutableUser(self.id, self.name, age)
    
    def with_name(self, name: str) -> 'ImmutableUser':
        return ImmutableUser(self.id, name, self.age)

# Usage
user = ImmutableUser('1', 'Alice', 25)
updated = user.with_age(26)
print(user.age)    # 25 (unchanged)
print(updated.age) # 26 (new instance)

# Immutable list operations
def add_item(lst: List, item) -> List:
    return lst + [item]

def update_item(lst: List, index: int, item) -> List:
    return lst[:index] + [item] + lst[index + 1:]

def remove_item(lst: List, index: int) -> List:
    return lst[:index] + lst[index + 1:]

# Usage
numbers = [1, 2, 3, 4, 5]
with_six = add_item(numbers, 6)
updated = update_item(numbers, 2, 99)
without_three = remove_item(numbers, 2)
```

### C# Implementation

```csharp
using System;
using System.Collections.Immutable;

// Immutable record (C# 9+)
public record ImmutableUser(string Id, string Name, int Age)
{
    public ImmutableUser WithAge(int age) => this with { Age = age };
    public ImmutableUser WithName(string name) => this with { Name = name };
}

// Usage
var user = new ImmutableUser("1", "Alice", 25);
var updated = user.WithAge(26);
Console.WriteLine(user.Age);   // 25 (unchanged)
Console.WriteLine(updated.Age); // 26 (new instance)

// Immutable collections
var numbers = ImmutableList<int>.Empty.Add(1).Add(2).Add(3);
var updatedNumbers = numbers.SetItem(1, 99);
var withoutFirst = numbers.RemoveAt(0);

Console.WriteLine(string.Join(", ", numbers));        // 1, 2, 3
Console.WriteLine(string.Join(", ", updatedNumbers));  // 1, 99, 3
Console.WriteLine(string.Join(", ", withoutFirst));    // 2, 3
```

---

## 🌟 Real-World Applications

### 1. State Management (Redux Pattern)

```javascript
// Immutable state updates in Redux
const initialState = {
  users: [],
  loading: false,
  error: null
};

function userReducer(state = initialState, action) {
  switch (action.type) {
    case 'FETCH_USERS_START':
      return { ...state, loading: true, error: null };
    
    case 'FETCH_USERS_SUCCESS':
      return {
        ...state,
        users: action.payload,
        loading: false,
        error: null
      };
    
    case 'FETCH_USERS_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload]
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id
            ? { ...user, ...action.payload }
            : user
        )
      };
    
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };
    
    default:
      return state;
  }
}
```

### 2. React Component State

```javascript
// Immutable state updates in React
import { useState } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  
  // Add user immutably
  const addUser = (user) => {
    setUsers([...users, user]);
  };
  
  // Update user immutably
  const updateUser = (id, updates) => {
    setUsers(users.map(user =>
      user.id === id ? { ...user, ...updates } : user
    ));
  };
  
  // Delete user immutably
  const deleteUser = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### 3. Configuration Management

```javascript
// Immutable configuration updates
class ConfigManager {
  constructor(initialConfig) {
    this.config = Object.freeze(deepCopy(initialConfig));
  }
  
  update(path, value) {
    const newConfig = setNested(this.config, path, value);
    return new ConfigManager(newConfig);
  }
  
  merge(updates) {
    const newConfig = { ...this.config, ...updates };
    return new ConfigManager(newConfig);
  }
  
  get(path) {
    return getNested(this.config, path);
  }
}

// Usage
const config = new ConfigManager({
  api: { baseUrl: 'https://api.example.com', timeout: 5000 },
  features: { darkMode: false, notifications: true }
});

const updatedConfig = config.update(['api', 'timeout'], 10000);
const mergedConfig = config.merge({ features: { darkMode: true } });
```

### 4. Undo/Redo Functionality

```javascript
// Immutable state enables time travel
class HistoryManager {
  constructor(initialState) {
    this.history = [initialState];
    this.currentIndex = 0;
  }
  
  getCurrentState() {
    return this.history[this.currentIndex];
  }
  
  pushState(newState) {
    // Remove any states after current index (for redo)
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(newState);
    this.currentIndex = this.history.length - 1;
  }
  
  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }
  
  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }
}

// Usage
const history = new HistoryManager({ count: 0 });
history.pushState({ count: 1 });
history.pushState({ count: 2 });
history.pushState({ count: 3 });

console.log(history.getCurrentState()); // { count: 3 }
console.log(history.undo());            // { count: 2 }
console.log(history.undo());            // { count: 1 }
console.log(history.redo());            // { count: 2 }
```

### 5. Functional Updates

```javascript
// Immutable updates with functional patterns
const updateUser = (user, updater) => {
  const updated = updater(user);
  return { ...user, ...updated };
};

// Usage with currying
const withAge = (age) => (user) => ({ ...user, age });
const withName = (name) => (user) => ({ ...user, name });

const user = { id: 1, name: 'Alice', age: 25 };
const updated = pipe(
  withAge(26),
  withName('Alice Updated')
)(user);

// Or with composition
const updateAgeAndName = compose(
  withName('Alice Updated'),
  withAge(26)
);
const updated2 = updateAgeAndName(user);
```

### 6. Concurrent Programming

```javascript
// Immutable data is thread-safe
class ImmutableCounter {
  constructor(value = 0) {
    this.value = value;
    Object.freeze(this);
  }
  
  increment() {
    return new ImmutableCounter(this.value + 1);
  }
  
  decrement() {
    return new ImmutableCounter(this.value - 1);
  }
  
  add(amount) {
    return new ImmutableCounter(this.value + amount);
  }
}

// Multiple threads can safely read/write
const counter = new ImmutableCounter(0);
const counter1 = counter.increment(); // Thread 1
const counter2 = counter.increment(); // Thread 2
// Both operations are safe, no race conditions!
```

---

## ⚠️ Common Pitfalls

### 1. Shallow Copies

```javascript
// ❌ BAD: Shallow copy, nested objects are still mutable
const state = {
  user: { name: 'Alice', age: 25 }
};
const updated = { ...state };
updated.user.age = 26;  // Also changes state.user.age!

// ✅ GOOD: Deep copy for nested structures
const updated = {
  ...state,
  user: { ...state.user, age: 26 }
};
```

### 2. Mutating Arrays

```javascript
// ❌ BAD: Mutating methods
const numbers = [1, 2, 3];
numbers.push(4);        // Mutates!
numbers.pop();          // Mutates!
numbers.sort();         // Mutates!

// ✅ GOOD: Immutable methods
const numbers = [1, 2, 3];
const withFour = [...numbers, 4];
const withoutLast = numbers.slice(0, -1);
const sorted = [...numbers].sort();
```

### 3. Object.freeze Limitations

```javascript
// ❌ BAD: Object.freeze is shallow
const user = Object.freeze({
  name: 'Alice',
  profile: { age: 25 }
});
user.profile.age = 26;  // Still works! (nested not frozen)

// ✅ GOOD: Deep freeze
function deepFreeze(obj) {
  Object.getOwnPropertyNames(obj).forEach(name => {
    const value = obj[name];
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  });
  return Object.freeze(obj);
}
```

### 4. Performance Concerns

```javascript
// ⚠️ WARNING: Deep copying can be expensive
function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj)); // Slow for large objects
}

// ✅ GOOD: Use structural sharing when possible
const state = {
  user: { name: 'Alice', age: 25 },
  settings: { theme: 'dark' }
};

// Only copy what changes
const updated = {
  ...state,  // settings is shared (same reference)
  user: { ...state.user, age: 26 }
};
```

---

## 📊 Immutability Decision Matrix

| Scenario | Use Immutability? | Why |
|----------|------------------|-----|
| State management | ✅ Yes | Predictable state updates |
| Concurrent programming | ✅ Yes | Thread-safe |
| Functional programming | ✅ Yes | Works with pure functions |
| Performance critical | ⚠️ Maybe | Consider structural sharing |
| Simple local variables | ❌ No | Overkill |
| Large nested structures | ⚠️ Maybe | Use libraries (Immutable.js) |

---

## 🎯 Best Practices

### 1. Use Spread Operator for Shallow Updates

```javascript
// ✅ GOOD: Spread operator
const updated = { ...user, age: 26 };

// ❌ BAD: Object.assign (mutates first argument)
const updated = Object.assign(user, { age: 26 }); // Mutates user!
```

### 2. Use Libraries for Complex Structures

```javascript
// ✅ GOOD: Use Immutable.js for complex structures
import { Map, List } from 'immutable';
const state = Map({ users: List([...]) });

// ❌ BAD: Manual deep copying everywhere
const state = JSON.parse(JSON.stringify(original)); // Slow!
```

### 3. Document Immutability

```javascript
/**
 * Returns a new user with updated age.
 * Original user is not modified.
 * @param {User} user - Original user (immutable)
 * @param {number} age - New age
 * @returns {User} New user instance
 */
function updateUserAge(user, age) {
  return { ...user, age };
}
```

### 4. Use TypeScript for Type Safety

```typescript
// ✅ GOOD: Type-safe immutable updates
interface User {
  readonly id: string;
  readonly name: string;
  readonly age: number;
}

function updateAge(user: User, age: number): User {
  return { ...user, age };
}
```

---

## 🔗 Related Patterns

| Pattern | Relationship |
|---------|--------------|
| **Functional Programming** | Immutability is core to FP |
| **Pure Functions** | Immutability enables pure functions |
| **State Management** | Redux, MobX use immutability |
| **Value Objects** | Value objects are immutable |
| **Copy-on-Write** | Related optimization technique |

---

## 📝 Key Takeaways

1. **Immutability = No Changes** - Data cannot be modified after creation
2. **Create New, Don't Modify** - Always create new versions instead of modifying
3. **Structural Sharing** - Share unchanged parts to save memory
4. **Predictable Code** - Immutable data is easier to reason about
5. **Thread-Safe** - Immutable data is safe for concurrent access
6. **Use Libraries** - For complex structures, use Immutable.js or similar
7. **Performance Trade-off** - More memory, but better predictability

---

## 🎯 Summary

**Immutability Patterns** provide:

- ✅ Predictable data that doesn't change unexpectedly
- ✅ Thread-safe operations for concurrent programming
- ✅ Easier debugging and reasoning about code
- ✅ Foundation for functional programming
- ✅ Time-travel debugging capabilities

**Immutability Principles:**
```
Don't change what exists
Create new versions instead
Share unchanged parts
```

**Common Patterns:**
- Spread operator (`...`) for shallow copies
- Map/filter/reduce for array updates
- Structural sharing for performance
- Libraries (Immutable.js) for complex structures
- Freeze for runtime protection

**Remember:**
- Immutability is about creating new data, not modifying existing
- Structural sharing helps with performance
- Use libraries for complex nested structures
- Immutability enables functional programming patterns
- Trade memory for predictability and safety

---

**Date Created:** 2026-02-27  
**Pattern Type:** Functional Programming / Data Structure  
**Difficulty:** Intermediate  
**Related Patterns:** Functional Programming, Pure Functions, State Management, Value Objects  
**Prerequisites:** Understanding of objects, arrays, functional programming basics

