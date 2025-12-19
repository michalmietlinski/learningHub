# Dependency Inversion Principle - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Dependency Inversion Principle (DIP) definition and intent
- [ ] Learn the difference between dependency inversion and dependency injection
- [ ] Master high-level modules depending on abstractions, not concretions
- [ ] Recognize violations of DIP in code
- [ ] Understand how DIP relates to other SOLID principles
- [ ] Practice refactoring code to follow DIP
- [ ] Learn best practices and common pitfalls

---

## 🎯 Definition

**Dependency Inversion Principle (DIP)** is the "D" in SOLID principles. It states that:

1. **High-level modules should not depend on low-level modules. Both should depend on abstractions.**
2. **Abstractions should not depend on details. Details should depend on abstractions.**

**Origin:**
- Coined by Robert C. Martin (Uncle Bob) in the early 2000s
- Part of the SOLID principles of object-oriented design
- First mentioned in his paper "Design Principles and Design Patterns"

**Key Principle:**
> "Depend on abstractions, not concretions" - High-level business logic should not depend on low-level implementation details. Instead, both should depend on stable abstractions (interfaces/abstract classes).

---

## 🏗️ Core Concepts

### High-Level vs Low-Level Modules

**High-Level Modules:**
- Contain business logic and application policies
- Define what the application does
- Should be stable and reusable
- Examples: `OrderService`, `UserManager`, `PaymentProcessor`

**Low-Level Modules:**
- Contain implementation details
- Define how things are done
- Can change frequently
- Examples: `MySQLDatabase`, `FileLogger`, `EmailSender`

### The Problem Without DIP

```
High-Level Module (Business Logic)
        ↓ depends on
Low-Level Module (Implementation)
```

**Issues:**
- High-level modules break when low-level modules change
- Hard to test (can't mock dependencies)
- Tight coupling
- Difficult to swap implementations

### The Solution With DIP

```
High-Level Module (Business Logic)
        ↓ depends on
    Abstraction (Interface)
        ↑ implements
Low-Level Module (Implementation)
```

**Benefits:**
- High-level modules are stable
- Easy to test (can inject mocks)
- Loose coupling
- Easy to swap implementations

---

## 💡 Why Dependency Inversion?

### Benefits

✅ **Stability** - High-level modules don't break when low-level modules change
✅ **Testability** - Can inject mocks/stubs for testing
✅ **Flexibility** - Easy to swap implementations
✅ **Maintainability** - Changes are isolated
✅ **Reusability** - High-level modules can be reused with different implementations
✅ **Decoupling** - Modules are loosely coupled

### Problems Without DIP

❌ **Tight Coupling** - High-level depends directly on low-level
❌ **Fragility** - Changes cascade through the system
❌ **Hard to Test** - Can't easily mock dependencies
❌ **Rigidity** - Hard to change implementations
❌ **Violation of Open/Closed** - Must modify high-level to change low-level

---

## 🔨 Implementation Examples

### Example 1: Violation of DIP

```javascript
// ❌ VIOLATION: High-level depends on low-level

// Low-level module (implementation detail)
class MySQLDatabase {
  connect() {
    console.log('Connecting to MySQL...');
  }
  
  query(sql) {
    console.log(`MySQL executing: ${sql}`);
    return { rows: [] };
  }
  
  disconnect() {
    console.log('Disconnecting from MySQL...');
  }
}

// High-level module (business logic) - DEPENDS ON CONCRETE CLASS
class UserRepository {
  constructor() {
    // Direct dependency on concrete implementation
    this.database = new MySQLDatabase();
  }
  
  findUser(id) {
    this.database.connect();
    const result = this.database.query(`SELECT * FROM users WHERE id = ${id}`);
    this.database.disconnect();
    return result.rows[0];
  }
  
  saveUser(user) {
    this.database.connect();
    this.database.query(`INSERT INTO users (name) VALUES ('${user.name}')`);
    this.database.disconnect();
  }
}

// Problem: If we want to use PostgreSQL, we must modify UserRepository
// Problem: Can't test UserRepository without a real MySQL database
// Problem: Tight coupling
```

### Example 1: Following DIP

```javascript
// ✅ FOLLOWING DIP: Both depend on abstraction

// Abstraction (interface)
class Database {
  connect() {
    throw new Error('Must implement connect()');
  }
  
  query(sql) {
    throw new Error('Must implement query()');
  }
  
  disconnect() {
    throw new Error('Must implement disconnect()');
  }
}

// Low-level module (implementation) - DEPENDS ON ABSTRACTION
class MySQLDatabase extends Database {
  connect() {
    console.log('Connecting to MySQL...');
  }
  
  query(sql) {
    console.log(`MySQL executing: ${sql}`);
    return { rows: [] };
  }
  
  disconnect() {
    console.log('Disconnecting from MySQL...');
  }
}

class PostgreSQLDatabase extends Database {
  connect() {
    console.log('Connecting to PostgreSQL...');
  }
  
  query(sql) {
    console.log(`PostgreSQL executing: ${sql}`);
    return { rows: [] };
  }
  
  disconnect() {
    console.log('Disconnecting from PostgreSQL...');
  }
}

// High-level module (business logic) - DEPENDS ON ABSTRACTION
class UserRepository {
  constructor(database) {
    // Depends on abstraction, not concrete class
    this.database = database;
  }
  
  findUser(id) {
    this.database.connect();
    const result = this.database.query(`SELECT * FROM users WHERE id = ${id}`);
    this.database.disconnect();
    return result.rows[0];
  }
  
  saveUser(user) {
    this.database.connect();
    this.database.query(`INSERT INTO users (name) VALUES ('${user.name}')`);
    this.database.disconnect();
  }
}

// Usage - Easy to swap implementations
const mysqlDB = new MySQLDatabase();
const postgresDB = new PostgreSQLDatabase();

const userRepo1 = new UserRepository(mysqlDB);
const userRepo2 = new UserRepository(postgresDB);

// Easy to test with mock
class MockDatabase extends Database {
  connect() {}
  query(sql) { return { rows: [{ id: 1, name: 'Test' }] }; }
  disconnect() {}
}

const mockDB = new MockDatabase();
const testRepo = new UserRepository(mockDB);
```

### Example 2: Notification System

```javascript
// ❌ VIOLATION: High-level depends on low-level

class EmailService {
  send(to, subject, body) {
    console.log(`Sending email to ${to}: ${subject}`);
  }
}

class SMSService {
  send(to, message) {
    console.log(`Sending SMS to ${to}: ${message}`);
  }
}

// High-level module depends on concrete classes
class NotificationService {
  constructor() {
    this.emailService = new EmailService();
    this.smsService = new SMSService();
  }
  
  notifyUser(user, message) {
    // Hard-coded to use email
    this.emailService.send(user.email, 'Notification', message);
  }
  
  notifyUrgent(user, message) {
    // Hard-coded to use SMS
    this.smsService.send(user.phone, message);
  }
}
```

```javascript
// ✅ FOLLOWING DIP: Both depend on abstraction

// Abstraction
class MessageSender {
  send(recipient, message) {
    throw new Error('Must implement send()');
  }
}

// Low-level implementations
class EmailService extends MessageSender {
  send(recipient, message) {
    console.log(`Sending email to ${recipient}: ${message}`);
  }
}

class SMSService extends MessageSender {
  send(recipient, message) {
    console.log(`Sending SMS to ${recipient}: ${message}`);
  }
}

class PushNotificationService extends MessageSender {
  send(recipient, message) {
    console.log(`Sending push to ${recipient}: ${message}`);
  }
}

// High-level module depends on abstraction
class NotificationService {
  constructor(sender) {
    // Depends on abstraction
    this.sender = sender;
  }
  
  notify(recipient, message) {
    this.sender.send(recipient, message);
  }
}

// Usage - Easy to swap
const emailSender = new EmailService();
const smsSender = new SMSService();
const pushSender = new PushNotificationService();

const emailNotification = new NotificationService(emailSender);
emailNotification.notify('user@example.com', 'Hello!');

const smsNotification = new NotificationService(smsSender);
smsNotification.notify('+1234567890', 'Urgent!');
```

### Example 3: Payment Processing

```javascript
// ❌ VIOLATION

class StripePaymentGateway {
  charge(amount, cardToken) {
    console.log(`Stripe charging ${amount}`);
    return { success: true, transactionId: 'stripe_123' };
  }
}

class PayPalPaymentGateway {
  processPayment(amount, email) {
    console.log(`PayPal processing ${amount} for ${email}`);
    return { success: true, transactionId: 'paypal_456' };
  }
}

// High-level depends on concrete classes
class OrderService {
  constructor() {
    this.stripe = new StripePaymentGateway();
    this.paypal = new PayPalPaymentGateway();
  }
  
  processOrder(order) {
    if (order.paymentMethod === 'stripe') {
      return this.stripe.charge(order.amount, order.cardToken);
    } else if (order.paymentMethod === 'paypal') {
      return this.paypal.processPayment(order.amount, order.email);
    }
  }
}
```

```javascript
// ✅ FOLLOWING DIP

// Abstraction
class PaymentGateway {
  processPayment(amount, paymentData) {
    throw new Error('Must implement processPayment()');
  }
}

// Low-level implementations
class StripePaymentGateway extends PaymentGateway {
  processPayment(amount, paymentData) {
    console.log(`Stripe charging ${amount}`);
    return { 
      success: true, 
      transactionId: `stripe_${Date.now()}`,
      amount 
    };
  }
}

class PayPalPaymentGateway extends PaymentGateway {
  processPayment(amount, paymentData) {
    console.log(`PayPal processing ${amount} for ${paymentData.email}`);
    return { 
      success: true, 
      transactionId: `paypal_${Date.now()}`,
      amount 
    };
  }
}

class CryptocurrencyGateway extends PaymentGateway {
  processPayment(amount, paymentData) {
    console.log(`Processing ${amount} in ${paymentData.currency}`);
    return { 
      success: true, 
      transactionId: `crypto_${Date.now()}`,
      amount 
    };
  }
}

// High-level depends on abstraction
class OrderService {
  constructor(paymentGateway) {
    // Depends on abstraction
    this.paymentGateway = paymentGateway;
  }
  
  processOrder(order) {
    const result = this.paymentGateway.processPayment(
      order.amount, 
      order.paymentData
    );
    
    if (result.success) {
      this.updateOrderStatus(order.id, 'paid');
    }
    
    return result;
  }
  
  updateOrderStatus(orderId, status) {
    console.log(`Order ${orderId} status: ${status}`);
  }
}

// Usage
const stripeGateway = new StripePaymentGateway();
const paypalGateway = new PayPalPaymentGateway();
const cryptoGateway = new CryptocurrencyGateway();

const orderService1 = new OrderService(stripeGateway);
orderService1.processOrder({
  id: 1,
  amount: 100,
  paymentData: { cardToken: 'token_123' }
});

const orderService2 = new OrderService(paypalGateway);
orderService2.processOrder({
  id: 2,
  amount: 200,
  paymentData: { email: 'user@example.com' }
});
```

### Example 4: Logging System

```javascript
// ❌ VIOLATION

class FileLogger {
  log(message) {
    // Write to file
    console.log(`[FILE] ${message}`);
  }
}

class ConsoleLogger {
  log(message) {
    console.log(`[CONSOLE] ${message}`);
  }
}

// High-level depends on concrete classes
class UserService {
  constructor() {
    this.logger = new FileLogger();
  }
  
  createUser(userData) {
    this.logger.log(`Creating user: ${userData.name}`);
    // Create user logic
    this.logger.log(`User created: ${userData.name}`);
  }
}
```

```javascript
// ✅ FOLLOWING DIP

// Abstraction
class Logger {
  log(message) {
    throw new Error('Must implement log()');
  }
  
  error(message) {
    throw new Error('Must implement error()');
  }
  
  warn(message) {
    throw new Error('Must implement warn()');
  }
}

// Low-level implementations
class FileLogger extends Logger {
  log(message) {
    console.log(`[FILE] ${new Date().toISOString()} - ${message}`);
  }
  
  error(message) {
    console.error(`[FILE ERROR] ${new Date().toISOString()} - ${message}`);
  }
  
  warn(message) {
    console.warn(`[FILE WARN] ${new Date().toISOString()} - ${message}`);
  }
}

class ConsoleLogger extends Logger {
  log(message) {
    console.log(`[CONSOLE] ${message}`);
  }
  
  error(message) {
    console.error(`[CONSOLE ERROR] ${message}`);
  }
  
  warn(message) {
    console.warn(`[CONSOLE WARN] ${message}`);
  }
}

class RemoteLogger extends Logger {
  constructor(apiEndpoint) {
    super();
    this.endpoint = apiEndpoint;
  }
  
  log(message) {
    // Send to remote logging service
    console.log(`[REMOTE] Sending to ${this.endpoint}: ${message}`);
  }
  
  error(message) {
    console.error(`[REMOTE ERROR] Sending to ${this.endpoint}: ${message}`);
  }
  
  warn(message) {
    console.warn(`[REMOTE WARN] Sending to ${this.endpoint}: ${message}`);
  }
}

// High-level depends on abstraction
class UserService {
  constructor(logger) {
    // Depends on abstraction
    this.logger = logger;
  }
  
  createUser(userData) {
    try {
      this.logger.log(`Creating user: ${userData.name}`);
      // Create user logic
      this.logger.log(`User created: ${userData.name}`);
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`);
      throw error;
    }
  }
}

// Usage
const fileLogger = new FileLogger();
const consoleLogger = new ConsoleLogger();
const remoteLogger = new RemoteLogger('https://logs.example.com');

const userService1 = new UserService(fileLogger);
userService1.createUser({ name: 'John' });

const userService2 = new UserService(consoleLogger);
userService2.createUser({ name: 'Jane' });

// Easy to test with mock
class MockLogger extends Logger {
  constructor() {
    super();
    this.logs = [];
  }
  
  log(message) {
    this.logs.push({ level: 'log', message });
  }
  
  error(message) {
    this.logs.push({ level: 'error', message });
  }
  
  warn(message) {
    this.logs.push({ level: 'warn', message });
  }
}

const mockLogger = new MockLogger();
const testService = new UserService(mockLogger);
testService.createUser({ name: 'Test' });
console.log(mockLogger.logs); // Can verify logs
```

### Example 5: Data Storage

```javascript
// ❌ VIOLATION

class LocalFileStorage {
  save(key, value) {
    console.log(`Saving ${key} to local file`);
  }
  
  load(key) {
    console.log(`Loading ${key} from local file`);
    return null;
  }
}

class CloudStorage {
  upload(key, value) {
    console.log(`Uploading ${key} to cloud`);
  }
  
  download(key) {
    console.log(`Downloading ${key} from cloud`);
    return null;
  }
}

// High-level depends on concrete classes with different interfaces
class CacheService {
  constructor() {
    this.localStorage = new LocalFileStorage();
    this.cloudStorage = new CloudStorage();
  }
  
  set(key, value) {
    // Must know about different interfaces
    this.localStorage.save(key, value);
  }
  
  get(key) {
    // Must know about different interfaces
    return this.localStorage.load(key);
  }
}
```

```javascript
// ✅ FOLLOWING DIP

// Abstraction
class Storage {
  save(key, value) {
    throw new Error('Must implement save()');
  }
  
  load(key) {
    throw new Error('Must implement load()');
  }
  
  delete(key) {
    throw new Error('Must implement delete()');
  }
}

// Low-level implementations
class LocalFileStorage extends Storage {
  save(key, value) {
    console.log(`Saving ${key} to local file`);
  }
  
  load(key) {
    console.log(`Loading ${key} from local file`);
    return null;
  }
  
  delete(key) {
    console.log(`Deleting ${key} from local file`);
  }
}

class CloudStorage extends Storage {
  save(key, value) {
    console.log(`Uploading ${key} to cloud`);
  }
  
  load(key) {
    console.log(`Downloading ${key} from cloud`);
    return null;
  }
  
  delete(key) {
    console.log(`Deleting ${key} from cloud`);
  }
}

class InMemoryStorage extends Storage {
  constructor() {
    super();
    this.data = new Map();
  }
  
  save(key, value) {
    this.data.set(key, value);
    console.log(`Stored ${key} in memory`);
  }
  
  load(key) {
    const value = this.data.get(key);
    console.log(`Loaded ${key} from memory`);
    return value || null;
  }
  
  delete(key) {
    this.data.delete(key);
    console.log(`Deleted ${key} from memory`);
  }
}

// High-level depends on abstraction
class CacheService {
  constructor(storage) {
    // Depends on abstraction
    this.storage = storage;
  }
  
  set(key, value) {
    this.storage.save(key, value);
  }
  
  get(key) {
    return this.storage.load(key);
  }
  
  remove(key) {
    this.storage.delete(key);
  }
}

// Usage
const localStorage = new LocalFileStorage();
const cloudStorage = new CloudStorage();
const memoryStorage = new InMemoryStorage();

const cache1 = new CacheService(localStorage);
cache1.set('user:1', { name: 'John' });

const cache2 = new CacheService(cloudStorage);
cache2.set('user:2', { name: 'Jane' });

const cache3 = new CacheService(memoryStorage);
cache3.set('user:3', { name: 'Bob' });
```

---

## 🔍 Dependency Inversion vs Dependency Injection

### Dependency Injection (DI)

**Dependency Injection** is a technique/mechanism for implementing Dependency Inversion.

**Types of Dependency Injection:**

1. **Constructor Injection** (Most Common)
```javascript
class UserService {
  constructor(logger) {
    this.logger = logger; // Injected via constructor
  }
}
```

2. **Setter Injection**
```javascript
class UserService {
  setLogger(logger) {
    this.logger = logger; // Injected via setter
  }
}
```

3. **Interface Injection**
```javascript
class UserService {
  inject(dependencies) {
    this.logger = dependencies.logger; // Injected via interface
  }
}
```

### Relationship

- **Dependency Inversion** = Principle (WHAT - the goal)
- **Dependency Injection** = Technique (HOW - the implementation)

**DIP says:** "Depend on abstractions"
**DI says:** "Inject dependencies from outside"

You can follow DIP without DI (using factories), but DI is the most common way to implement DIP.

---

## 🎓 Best Practices

### 1. Use Constructor Injection

```javascript
// Good - Constructor injection
class UserService {
  constructor(logger, database) {
    this.logger = logger;
    this.database = database;
  }
}

// Avoid - Creating dependencies inside
class UserService {
  constructor() {
    this.logger = new FileLogger(); // Bad
  }
}
```

### 2. Define Clear Abstractions

```javascript
// Good - Clear interface
class Logger {
  log(message) {
    throw new Error('Must implement log()');
  }
  
  error(message) {
    throw new Error('Must implement error()');
  }
}

// Bad - Vague or missing interface
class Logger {
  // No clear contract
}
```

### 3. Keep Abstractions Stable

```javascript
// Good - Stable abstraction
class Database {
  query(sql) {
    throw new Error('Must implement query()');
  }
}

// Bad - Changing abstraction breaks implementations
class Database {
  query(sql, options) { // Adding parameters breaks existing code
    throw new Error('Must implement query()');
  }
}
```

### 4. Use Dependency Injection Container (Optional)

```javascript
// Simple DI container
class Container {
  constructor() {
    this.services = new Map();
  }
  
  register(name, factory) {
    this.services.set(name, factory);
  }
  
  resolve(name) {
    const factory = this.services.get(name);
    if (!factory) {
      throw new Error(`Service ${name} not found`);
    }
    return factory(this);
  }
}

// Usage
const container = new Container();

container.register('logger', () => new FileLogger());
container.register('database', () => new MySQLDatabase());
container.register('userService', (c) => {
  return new UserService(
    c.resolve('logger'),
    c.resolve('database')
  );
});

const userService = container.resolve('userService');
```

### 5. Document Dependencies

```javascript
/**
 * UserService handles user-related business logic.
 * 
 * Dependencies (injected via constructor):
 * - logger: Logger - For logging operations
 * - database: Database - For data persistence
 * 
 * Follows Dependency Inversion Principle:
 * - Depends on Logger abstraction, not concrete FileLogger
 * - Depends on Database abstraction, not concrete MySQLDatabase
 */
class UserService {
  constructor(logger, database) {
    this.logger = logger;
    this.database = database;
  }
}
```

---

## 🚫 Common Pitfalls

### 1. Creating Dependencies Inside Classes

**Problem:**
```javascript
class UserService {
  constructor() {
    // Violates DIP - creating concrete dependency
    this.logger = new FileLogger();
  }
}
```

**Solution:** Inject dependencies from outside.

### 2. Depending on Concrete Classes

**Problem:**
```javascript
class UserService {
  constructor(logger) {
    // Still depends on concrete class
    if (!(logger instanceof FileLogger)) {
      throw new Error('Must use FileLogger');
    }
    this.logger = logger;
  }
}
```

**Solution:** Depend on abstraction, not concrete type.

### 3. Leaky Abstractions

**Problem:**
```javascript
class Database {
  query(sql) {
    throw new Error('Must implement query()');
  }
  
  // Leaking MySQL-specific details
  queryMySQL(sql) {
    throw new Error('Must implement queryMySQL()');
  }
}
```

**Solution:** Keep abstractions platform-agnostic.

### 4. Too Many Dependencies

**Problem:**
```javascript
class UserService {
  constructor(logger, database, emailService, smsService, cache, validator, ...) {
    // Too many dependencies - violates Single Responsibility
  }
}
```

**Solution:** Reconsider class responsibilities. Maybe split into smaller services.

### 5. Abstractions That Are Too Specific

**Problem:**
```javascript
// Too specific - only works for one use case
class MySQLUserQuery {
  findUserById(id) {
    throw new Error('Must implement findUserById()');
  }
}
```

**Solution:** Create more general abstractions.

### 6. Not Using Abstractions

**Problem:**
```javascript
class UserService {
  constructor(logger) {
    this.logger = logger; // Good - injected
  }
  
  createUser(user) {
    // But then using concrete class directly
    const db = new MySQLDatabase(); // Bad
    db.query('INSERT...');
  }
}
```

**Solution:** Inject all dependencies, including those used in methods.

---

## 🔄 DIP and Other SOLID Principles

### DIP and Single Responsibility Principle (SRP)

- **SRP:** A class should have one reason to change
- **DIP:** Depend on abstractions
- **Together:** High-level modules focus on business logic (SRP), while depending on abstractions (DIP)

### DIP and Open/Closed Principle (OCP)

- **OCP:** Open for extension, closed for modification
- **DIP:** Enables OCP by allowing new implementations without changing high-level modules

### DIP and Liskov Substitution Principle (LSP)

- **LSP:** Subtypes must be substitutable for their base types
- **DIP:** Requires LSP - implementations must be substitutable through the abstraction

### DIP and Interface Segregation Principle (ISP)

- **ISP:** Clients shouldn't depend on interfaces they don't use
- **DIP:** Abstractions should be focused (ISP) to avoid forcing implementations to provide unused methods

---

## 📚 Practice Exercises

### Exercise 1: Refactor to Follow DIP

Refactor this code to follow Dependency Inversion Principle:

```javascript
class EmailService {
  send(to, subject, body) {
    console.log(`Email sent to ${to}`);
  }
}

class UserService {
  constructor() {
    this.emailService = new EmailService();
  }
  
  registerUser(userData) {
    // Create user
    this.emailService.send(userData.email, 'Welcome', 'Welcome!');
  }
}
```

### Exercise 2: Create Abstraction

Create an abstraction for data storage and refactor:

```javascript
class FileSystemStorage {
  writeFile(path, data) {
    // Write to file
  }
  
  readFile(path) {
    // Read from file
  }
}

class DocumentService {
  constructor() {
    this.storage = new FileSystemStorage();
  }
  
  saveDocument(doc) {
    this.storage.writeFile(doc.path, doc.content);
  }
}
```

### Exercise 3: Multiple Implementations

Create a notification system with:
- Abstraction: `NotificationSender`
- Implementations: `EmailSender`, `SMSSender`, `PushSender`
- High-level: `NotificationService` that depends on abstraction

### Exercise 4: Testing with Mocks

Create a service that depends on a database abstraction, then:
1. Create a mock database for testing
2. Write unit tests that use the mock
3. Verify the service works with both real and mock databases

---

## 🔍 Code Review Checklist

When reviewing code for DIP compliance, check:

- [ ] High-level modules depend on abstractions, not concrete classes
- [ ] Low-level modules implement abstractions
- [ ] Dependencies are injected (not created inside classes)
- [ ] Abstractions are stable and well-defined
- [ ] No type checking of concrete classes (e.g., `instanceof`)
- [ ] Abstractions don't leak implementation details
- [ ] Easy to swap implementations
- [ ] Easy to test with mocks/stubs
- [ ] No direct instantiation of dependencies in business logic
- [ ] Abstractions are at the right level of generality

---

## 📖 Further Reading

1. **Clean Architecture by Robert C. Martin**
   - Chapter on Dependency Inversion Principle
   - Dependency Rule and architecture boundaries

2. **Agile Software Development: Principles, Patterns, and Practices by Robert C. Martin**
   - SOLID principles
   - Dependency Inversion Principle

3. **Design Principles and Design Patterns by Robert C. Martin**
   - Original paper introducing DIP
   - Relationship to other principles

4. **Refactoring Guru**
   - https://refactoring.guru/dependency-inversion-principle

5. **SourceMaking**
   - https://sourcemaking.com/design_patterns/dependency_injection

---

## 📝 Notes Section

_Add your notes, observations, and insights here as you learn..._

### Key Takeaways

- High-level modules should not depend on low-level modules
- Both should depend on abstractions
- Dependency Injection is a technique to implement DIP
- DIP enables testability, flexibility, and maintainability
- Abstractions should be stable and well-defined

### Questions to Explore

- How do I identify when DIP is violated?
- What's the difference between DIP and DI?
- How do I create good abstractions?
- When is DIP over-engineering?
- How does DIP relate to other SOLID principles?
- Should I use a DI container or manual injection?

### Personal Examples

_Add your own code examples and use cases here..._

---

## 🎯 Summary

The **Dependency Inversion Principle** is a fundamental SOLID principle that:

- ✅ States high-level modules should not depend on low-level modules
- ✅ Requires both to depend on abstractions
- ✅ Enables testability, flexibility, and maintainability
- ✅ Is implemented through Dependency Injection
- ✅ Works together with other SOLID principles

Remember: **Depend on abstractions, not concretions!** This makes your code more flexible, testable, and maintainable.

---

**Date Created:** 2025-12-18  
**Topic Type:** SOLID Principle  
**Difficulty:** Intermediate  
**Related Topics:** Dependency Injection, SOLID Principles, Inversion of Control, Design Patterns
