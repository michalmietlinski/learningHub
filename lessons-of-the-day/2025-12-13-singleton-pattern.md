# Singleton Pattern

## What is the Singleton Pattern?

The Singleton Pattern is a creational design pattern that ensures a class has only one instance and provides a global point of access to that instance. It restricts the instantiation of a class to a single object, which is useful when exactly one object is needed to coordinate actions across the system.

## Core Concept

The Singleton pattern solves two problems:
1. **Ensure only one instance exists** - Prevents multiple instances of a class from being created
2. **Provide global access** - Offers a single, well-known access point to that instance

## Why Use Singleton?

### Common Use Cases:
- **Database connections** - Managing a single connection pool
- **Logger instances** - Centralized logging throughout an application
- **Configuration managers** - Single source of truth for application settings
- **Cache managers** - Shared cache across the application
- **Thread pools** - Managing a limited set of worker threads
- **Device drivers** - Representing hardware that exists only once
- **Service locators** - Providing access to services

### Benefits:
- ✅ **Controlled access** - Only one instance can exist
- ✅ **Lazy initialization** - Instance created only when needed
- ✅ **Global state management** - Shared state across the application
- ✅ **Resource efficiency** - Avoids creating multiple expensive objects

### Drawbacks:
- ❌ **Global state** - Can make code harder to test and reason about
- ❌ **Hidden dependencies** - Makes dependencies less explicit
- ❌ **Thread safety concerns** - Requires careful implementation in multi-threaded environments
- ❌ **Violates Single Responsibility Principle** - Class manages both its purpose and instance creation
- ❌ **Difficult to test** - Hard to mock or replace in unit tests
- ❌ **Tight coupling** - Code becomes dependent on the singleton instance

## Implementation Approaches

### 1. Eager Initialization (Simple but not lazy)

The instance is created when the class is loaded, before it's actually needed.

```javascript
class Singleton {
  // Private static instance created immediately
  private static instance = new Singleton();
  
  // Private constructor prevents external instantiation
  private constructor() {
    console.log('Singleton instance created');
  }
  
  // Public method to get the instance
  public static getInstance(): Singleton {
    return Singleton.instance;
  }
  
  // Example method
  public doSomething(): void {
    console.log('Doing something...');
  }
}

// Usage
const instance1 = Singleton.getInstance();
const instance2 = Singleton.getInstance();
console.log(instance1 === instance2); // true - same instance
```

**Pros:**
- Simple and thread-safe (in languages with class loading guarantees)
- No synchronization needed

**Cons:**
- Instance created even if never used
- No lazy initialization

### 2. Lazy Initialization (Thread-unsafe)

The instance is created only when first requested.

```javascript
class Singleton {
  private static instance: Singleton | null = null;
  
  private constructor() {
    console.log('Singleton instance created');
  }
  
  public static getInstance(): Singleton {
    // Create instance only if it doesn't exist
    if (Singleton.instance === null) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }
  
  public doSomething(): void {
    console.log('Doing something...');
  }
}

// Usage
const instance1 = Singleton.getInstance(); // Creates instance
const instance2 = Singleton.getInstance(); // Returns existing instance
console.log(instance1 === instance2); // true
```

**Pros:**
- Lazy initialization - created only when needed
- Simple implementation

**Cons:**
- **Not thread-safe** - Multiple threads could create multiple instances
- Race condition in multi-threaded environments

### 3. Thread-Safe Lazy Initialization (Synchronized)

Uses synchronization to ensure thread safety.

```java
public class Singleton {
    private static Singleton instance;
    
    private Singleton() {
        System.out.println("Singleton instance created");
    }
    
    // Synchronized method - thread-safe but slow
    public static synchronized Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
    
    public void doSomething() {
        System.out.println("Doing something...");
    }
}
```

**Pros:**
- Thread-safe
- Lazy initialization

**Cons:**
- Performance overhead - synchronization on every access
- Can become a bottleneck in high-concurrency scenarios

### 4. Double-Checked Locking (Optimized Thread-Safe)

Reduces synchronization overhead by checking twice.

```java
public class Singleton {
    private static volatile Singleton instance;
    
    private Singleton() {
        System.out.println("Singleton instance created");
    }
    
    public static Singleton getInstance() {
        // First check (no synchronization)
        if (instance == null) {
            // Synchronize only when instance is null
            synchronized (Singleton.class) {
                // Second check (inside synchronized block)
                if (instance == null) {
                    instance = new Singleton();
                }
            }
        }
        return instance;
    }
    
    public void doSomething() {
        System.out.println("Doing something...");
    }
}
```

**Pros:**
- Thread-safe
- Better performance - synchronization only on first access
- Lazy initialization

**Cons:**
- More complex implementation
- Requires `volatile` keyword (in Java) to prevent instruction reordering issues
- Can be tricky to get right

### 5. Initialization-on-Demand Holder (Bill Pugh Solution)

Uses a nested static class to hold the instance. This is considered one of the best approaches.

```java
public class Singleton {
    private Singleton() {
        System.out.println("Singleton instance created");
    }
    
    // Nested class holds the instance
    private static class SingletonHolder {
        private static final Singleton INSTANCE = new Singleton();
    }
    
    public static Singleton getInstance() {
        return SingletonHolder.INSTANCE;
    }
    
    public void doSomething() {
        System.out.println("Doing something...");
    }
}
```

**Pros:**
- Thread-safe (guaranteed by Java class loading)
- Lazy initialization (instance created when `getInstance()` is first called)
- No synchronization overhead
- Simple and elegant

**Cons:**
- Language-specific (works well in Java, may not apply to all languages)

### 6. Enum Singleton (Java-specific, Recommended)

Using an enum is the simplest and safest way to implement a singleton in Java.

```java
public enum Singleton {
    INSTANCE;
    
    public void doSomething() {
        System.out.println("Doing something...");
    }
}

// Usage
Singleton.INSTANCE.doSomething();
```

**Pros:**
- Thread-safe by default
- Serialization-safe
- Reflection-safe
- Simple and concise
- Recommended by Joshua Bloch in "Effective Java"

**Cons:**
- Java-specific
- Less flexible (can't extend classes)

### 7. Module Pattern (JavaScript/TypeScript)

In JavaScript, modules are naturally singletons.

```javascript
// logger.js - Module pattern
class Logger {
  constructor() {
    this.logs = [];
  }
  
  log(message) {
    const timestamp = new Date().toISOString();
    this.logs.push({ message, timestamp });
    console.log(`[${timestamp}] ${message}`);
  }
  
  getLogs() {
    return this.logs;
  }
}

// Export a single instance
export default new Logger();

// Usage in another file
import logger from './logger.js';
logger.log('Application started');
```

**Pros:**
- Natural singleton behavior in ES6 modules
- Simple and clean
- No need for getInstance() method

**Cons:**
- Module system specific
- Less control over initialization

### 8. Modern JavaScript/TypeScript with Private Fields

Using modern JavaScript features for a clean implementation.

```javascript
class Singleton {
  // Private static field
  static #instance = null;
  
  // Private constructor
  constructor() {
    if (Singleton.#instance) {
      return Singleton.#instance;
    }
    Singleton.#instance = this;
    console.log('Singleton instance created');
  }
  
  // Public static method
  static getInstance() {
    if (!Singleton.#instance) {
      Singleton.#instance = new Singleton();
    }
    return Singleton.#instance;
  }
  
  doSomething() {
    console.log('Doing something...');
  }
}

// Usage
const instance1 = Singleton.getInstance();
const instance2 = Singleton.getInstance();
console.log(instance1 === instance2); // true
```

## Real-World Examples

### Example 1: Database Connection Manager

```javascript
class DatabaseConnection {
  static #instance = null;
  #connection = null;
  
  private constructor() {
    // Simulate database connection
    this.#connection = {
      host: 'localhost',
      port: 5432,
      database: 'myapp',
      connected: true
    };
    console.log('Database connection established');
  }
  
  static getInstance() {
    if (!DatabaseConnection.#instance) {
      DatabaseConnection.#instance = new DatabaseConnection();
    }
    return DatabaseConnection.#instance;
  }
  
  query(sql) {
    if (!this.#connection.connected) {
      throw new Error('Database not connected');
    }
    console.log(`Executing: ${sql}`);
    return { rows: [] };
  }
  
  close() {
    this.#connection.connected = false;
    console.log('Database connection closed');
  }
}

// Usage
const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();
console.log(db1 === db2); // true - same instance

db1.query('SELECT * FROM users');
```

### Example 2: Logger

```javascript
class Logger {
  static #instance = null;
  #logs = [];
  
  private constructor() {
    this.#logs = [];
  }
  
  static getInstance() {
    if (!Logger.#instance) {
      Logger.#instance = new Logger();
    }
    return Logger.#instance;
  }
  
  log(level, message) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message
    };
    this.#logs.push(entry);
    console.log(`[${entry.timestamp}] [${level}] ${message}`);
  }
  
  info(message) {
    this.log('INFO', message);
  }
  
  error(message) {
    this.log('ERROR', message);
  }
  
  warn(message) {
    this.log('WARN', message);
  }
  
  getLogs() {
    return [...this.#logs]; // Return copy
  }
  
  clear() {
    this.#logs = [];
  }
}

// Usage
const logger = Logger.getInstance();
logger.info('Application started');
logger.error('Something went wrong');
logger.warn('This is a warning');
```

### Example 3: Configuration Manager

```javascript
class ConfigManager {
  static #instance = null;
  #config = {};
  
  private constructor() {
    // Load configuration from environment or defaults
    this.#config = {
      apiUrl: process.env.API_URL || 'https://api.example.com',
      port: parseInt(process.env.PORT) || 3000,
      debug: process.env.DEBUG === 'true',
      maxConnections: parseInt(process.env.MAX_CONNECTIONS) || 100
    };
  }
  
  static getInstance() {
    if (!ConfigManager.#instance) {
      ConfigManager.#instance = new ConfigManager();
    }
    return ConfigManager.#instance;
  }
  
  get(key) {
    return this.#config[key];
  }
  
  set(key, value) {
    this.#config[key] = value;
  }
  
  getAll() {
    return { ...this.#config }; // Return copy
  }
}

// Usage
const config = ConfigManager.getInstance();
console.log(config.get('apiUrl'));
console.log(config.get('port'));
```

## Singleton vs Alternatives

### When to Use Singleton:
- ✅ You need exactly one instance of a class
- ✅ The instance needs global access
- ✅ Lazy initialization is acceptable
- ✅ The object manages shared resources (database, cache, etc.)

### When NOT to Use Singleton:
- ❌ You need multiple instances
- ❌ You want to test with mocks easily
- ❌ You're building a library (users might need multiple instances)
- ❌ You want to follow dependency injection principles
- ❌ The "singleton" behavior is just a coincidence, not a requirement

### Alternatives to Consider:

1. **Dependency Injection** - Pass the instance as a parameter instead of accessing it globally
2. **Factory Pattern** - Control instance creation through a factory
3. **Service Locator** - More flexible than singleton, but still has global state issues
4. **Static Class** - If you don't need instance state, use static methods instead

## Testing Singleton

Testing singletons can be challenging. Here are some strategies:

### Strategy 1: Reset Method (for testing only)

```javascript
class Singleton {
  static #instance = null;
  
  private constructor() {}
  
  static getInstance() {
    if (!Singleton.#instance) {
      Singleton.#instance = new Singleton();
    }
    return Singleton.#instance;
  }
  
  // Only for testing - reset the instance
  static reset() {
    Singleton.#instance = null;
  }
}

// In tests
beforeEach(() => {
  Singleton.reset(); // Reset before each test
});
```

### Strategy 2: Dependency Injection (Better approach)

Instead of using singleton directly, inject the instance:

```javascript
class UserService {
  constructor(logger) {
    this.logger = logger; // Injected dependency
  }
  
  createUser(name) {
    this.logger.info(`Creating user: ${name}`);
    // ... create user logic
  }
}

// In production
const logger = Logger.getInstance();
const userService = new UserService(logger);

// In tests
const mockLogger = { info: jest.fn() };
const userService = new UserService(mockLogger);
```

## Anti-Patterns and Common Mistakes

### 1. Overusing Singleton
Don't make everything a singleton. Only use it when you truly need a single instance.

### 2. Not Making Constructor Private
If the constructor is public, anyone can create new instances, breaking the pattern.

### 3. Thread Safety Issues
In multi-threaded environments, ensure proper synchronization.

### 4. Serialization Issues
In languages like Java, serialization can create multiple instances. Use `readResolve()` method.

### 5. Reflection Attacks
In some languages, reflection can bypass private constructors. Use enum singleton or throw exception in constructor if instance exists.

## Key Takeaways

1. **Purpose**: Ensure only one instance exists and provide global access
2. **Implementation**: Private constructor + static getInstance() method
3. **Thread Safety**: Critical in multi-threaded environments
4. **Trade-offs**: Convenience vs testability and flexibility
5. **Alternatives**: Consider dependency injection or factory pattern
6. **Use Sparingly**: Overuse can lead to tight coupling and testing difficulties


