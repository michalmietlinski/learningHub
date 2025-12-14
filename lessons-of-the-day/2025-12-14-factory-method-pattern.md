# Factory Method Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Factory Method pattern definition and intent
- [ ] Learn when to use Factory Method vs other creational patterns
- [ ] Master multiple implementation approaches
- [ ] Recognize real-world applications
- [ ] Understand variations and related patterns
- [ ] Practice implementing Factory Method in different scenarios
- [ ] Learn common pitfalls and best practices

---

## 🎯 Definition

**Factory Method Pattern** is a creational design pattern that provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created.

**Intent (GoF):**
- Define an interface for creating an object, but let subclasses decide which class to instantiate
- Factory Method lets a class defer instantiation to subclasses
- Also known as: **Virtual Constructor**

**Key Principle:**
> "Don't call us, we'll call you" - The framework calls your factory method when it needs an object.

---

## 🏗️ Structure

### UML Diagram Concept

```
Creator (Abstract)
├── factoryMethod(): Product (abstract)
├── someOperation(): void
│
ConcreteCreatorA
└── factoryMethod(): ConcreteProductA

ConcreteCreatorB
└── factoryMethod(): ConcreteProductB

Product (Interface)
│
ConcreteProductA implements Product
ConcreteProductB implements Product
```

### Participants

1. **Product** - Defines the interface of objects the factory method creates
2. **ConcreteProduct** - Implements the Product interface
3. **Creator** - Declares the factory method, which returns a Product object
4. **ConcreteCreator** - Overrides the factory method to return an instance of ConcreteProduct

---

## 💡 When to Use

### Use Factory Method When:

✅ **You don't know beforehand the exact types and dependencies of objects your code should work with**
- Example: A framework that needs to create objects, but the specific classes are defined by users

✅ **You want to provide users of your library/framework with a way to extend its internal components**
- Example: React's component creation, UI framework widgets

✅ **You want to save system resources by reusing existing objects instead of rebuilding them each time**
- Example: Connection pooling, object caching

✅ **You want to localize object creation logic**
- Example: Instead of having creation code scattered throughout the application

### Don't Use When:

❌ **Simple object creation** - If you always know the exact type, use direct instantiation
❌ **You need to create families of related objects** - Use Abstract Factory instead
❌ **Object creation is straightforward** - Don't add unnecessary complexity

---

## 🔨 Implementation Examples

### Example 1: Basic Factory Method (JavaScript/TypeScript)

```javascript
// Product Interface
class Transport {
  deliver() {
    throw new Error('Must implement deliver()');
  }
}

// Concrete Products
class Truck extends Transport {
  deliver() {
    return 'Delivering by land in a box';
  }
}

class Ship extends Transport {
  deliver() {
    return 'Delivering by sea in a container';
  }
}

class Airplane extends Transport {
  deliver() {
    return 'Delivering by air in a cargo hold';
  }
}

// Creator (Abstract)
class Logistics {
  // Factory Method
  createTransport() {
    throw new Error('Must implement createTransport()');
  }
  
  // Template method that uses the factory method
  planDelivery() {
    const transport = this.createTransport();
    return `Planning delivery: ${transport.deliver()}`;
  }
}

// Concrete Creators
class RoadLogistics extends Logistics {
  createTransport() {
    return new Truck();
  }
}

class SeaLogistics extends Logistics {
  createTransport() {
    return new Ship();
  }
}

class AirLogistics extends Logistics {
  createTransport() {
    return new Airplane();
  }
}

// Usage
function clientCode(logistics) {
  console.log(logistics.planDelivery());
}

// Client doesn't need to know about concrete classes
clientCode(new RoadLogistics());  // Planning delivery: Delivering by land in a box
clientCode(new SeaLogistics());   // Planning delivery: Delivering by sea in a container
clientCode(new AirLogistics());  // Planning delivery: Delivering by air in a cargo hold
```

### Example 2: Factory Method with Parameters (TypeScript)

```typescript
// Product Interface
interface Document {
  open(): string;
  save(): string;
  close(): string;
}

// Concrete Products
class PDFDocument implements Document {
  open() { return 'Opening PDF document'; }
  save() { return 'Saving PDF document'; }
  close() { return 'Closing PDF document'; }
}

class WordDocument implements Document {
  open() { return 'Opening Word document'; }
  save() { return 'Saving Word document'; }
  close() { return 'Closing Word document'; }
}

class SpreadsheetDocument implements Document {
  open() { return 'Opening Spreadsheet document'; }
  save() { return 'Saving Spreadsheet document'; }
  close() { return 'Closing Spreadsheet document'; }
}

// Creator
abstract class Application {
  // Factory Method
  abstract createDocument(type: string): Document;
  
  // Template method
  newDocument(type: string): Document {
    const doc = this.createDocument(type);
    doc.open();
    return doc;
  }
}

// Concrete Creator
class OfficeApplication extends Application {
  createDocument(type: string): Document {
    switch (type.toLowerCase()) {
      case 'pdf':
        return new PDFDocument();
      case 'word':
        return new WordDocument();
      case 'spreadsheet':
        return new SpreadsheetDocument();
      default:
        throw new Error(`Unknown document type: ${type}`);
    }
  }
}

// Usage
const app = new OfficeApplication();
const pdf = app.newDocument('pdf');
console.log(pdf.save()); // Saving PDF document
```

### Example 3: Factory Method in Python

```python
from abc import ABC, abstractmethod

# Product Interface
class Button(ABC):
    @abstractmethod
    def render(self) -> str:
        pass
    
    @abstractmethod
    def onClick(self) -> str:
        pass

# Concrete Products
class WindowsButton(Button):
    def render(self) -> str:
        return "Rendering Windows-style button"
    
    def onClick(self) -> str:
        return "Windows button clicked"

class MacButton(Button):
    def render(self) -> str:
        return "Rendering Mac-style button"
    
    def onClick(self) -> str:
        return "Mac button clicked"

class LinuxButton(Button):
    def render(self) -> str:
        return "Rendering Linux-style button"
    
    def onClick(self) -> str:
        return "Linux button clicked"

# Creator
class Dialog(ABC):
    @abstractmethod
    def createButton(self) -> Button:
        """Factory Method"""
        pass
    
    def render(self) -> str:
        """Template method using factory method"""
        button = self.createButton()
        return f"Dialog: {button.render()}"

# Concrete Creators
class WindowsDialog(Dialog):
    def createButton(self) -> Button:
        return WindowsButton()

class MacDialog(Dialog):
    def createButton(self) -> Button:
        return MacButton()

class LinuxDialog(Dialog):
    def createButton(self) -> Button:
        return LinuxButton()

# Usage
def client_code(dialog: Dialog):
    print(dialog.render())

# Client code works with any dialog subclass
client_code(WindowsDialog())  # Dialog: Rendering Windows-style button
client_code(MacDialog())      # Dialog: Rendering Mac-style button
client_code(LinuxDialog())    # Dialog: Rendering Linux-style button
```

### Example 4: Factory Method in Java

```java
// Product Interface
interface Notification {
    void send(String message);
}

// Concrete Products
class EmailNotification implements Notification {
    @Override
    public void send(String message) {
        System.out.println("Sending email: " + message);
    }
}

class SMSNotification implements Notification {
    @Override
    public void send(String message) {
        System.out.println("Sending SMS: " + message);
    }
}

class PushNotification implements Notification {
    @Override
    public void send(String message) {
        System.out.println("Sending push notification: " + message);
    }
}

// Creator (Abstract Class)
abstract class NotificationService {
    // Factory Method
    abstract Notification createNotification();
    
    // Template method
    public void notifyUser(String message) {
        Notification notification = createNotification();
        notification.send(message);
    }
}

// Concrete Creators
class EmailService extends NotificationService {
    @Override
    Notification createNotification() {
        return new EmailNotification();
    }
}

class SMSService extends NotificationService {
    @Override
    Notification createNotification() {
        return new SMSNotification();
    }
}

class PushService extends NotificationService {
    @Override
    Notification createNotification() {
        return new PushNotification();
    }
}

// Usage
public class Client {
    public static void main(String[] args) {
        NotificationService emailService = new EmailService();
        emailService.notifyUser("Hello via email!");
        
        NotificationService smsService = new SMSService();
        smsService.notifyUser("Hello via SMS!");
    }
}
```

### Example 5: Real-World Example - Database Connection Factory

```javascript
// Product Interface
class DatabaseConnection {
  connect() {
    throw new Error('Must implement connect()');
  }
  
  query(sql) {
    throw new Error('Must implement query()');
  }
  
  close() {
    throw new Error('Must implement close()');
  }
}

// Concrete Products
class MySQLConnection extends DatabaseConnection {
  constructor(config) {
    super();
    this.config = config;
  }
  
  connect() {
    return `Connecting to MySQL at ${this.config.host}:${this.config.port}`;
  }
  
  query(sql) {
    return `Executing MySQL query: ${sql}`;
  }
  
  close() {
    return 'Closing MySQL connection';
  }
}

class PostgreSQLConnection extends DatabaseConnection {
  constructor(config) {
    super();
    this.config = config;
  }
  
  connect() {
    return `Connecting to PostgreSQL at ${this.config.host}:${this.config.port}`;
  }
  
  query(sql) {
    return `Executing PostgreSQL query: ${sql}`;
  }
  
  close() {
    return 'Closing PostgreSQL connection';
  }
}

class MongoDBConnection extends DatabaseConnection {
  constructor(config) {
    super();
    this.config = config;
  }
  
  connect() {
    return `Connecting to MongoDB at ${this.config.host}:${this.config.port}`;
  }
  
  query(sql) {
    return `Executing MongoDB query: ${sql}`;
  }
  
  close() {
    return 'Closing MongoDB connection';
  }
}

// Creator
class DatabaseFactory {
  // Factory Method
  createConnection(config) {
    throw new Error('Must implement createConnection()');
  }
  
  // Template method
  executeQuery(config, sql) {
    const connection = this.createConnection(config);
    console.log(connection.connect());
    const result = connection.query(sql);
    console.log(connection.close());
    return result;
  }
}

// Concrete Creators
class MySQLFactory extends DatabaseFactory {
  createConnection(config) {
    return new MySQLConnection(config);
  }
}

class PostgreSQLFactory extends DatabaseFactory {
  createConnection(config) {
    return new PostgreSQLConnection(config);
  }
}

class MongoDBFactory extends DatabaseFactory {
  createConnection(config) {
    return new MongoDBConnection(config);
  }
}

// Usage
const mysqlFactory = new MySQLFactory();
mysqlFactory.executeQuery(
  { host: 'localhost', port: 3306 },
  'SELECT * FROM users'
);

const postgresFactory = new PostgreSQLFactory();
postgresFactory.executeQuery(
  { host: 'localhost', port: 5432 },
  'SELECT * FROM users'
);
```

### Example 6: Factory Method with Registry Pattern

```javascript
// Product Interface
class PaymentMethod {
  processPayment(amount) {
    throw new Error('Must implement processPayment()');
  }
}

// Concrete Products
class CreditCardPayment extends PaymentMethod {
  processPayment(amount) {
    return `Processing $${amount} via Credit Card`;
  }
}

class PayPalPayment extends PaymentMethod {
  processPayment(amount) {
    return `Processing $${amount} via PayPal`;
  }
}

class BankTransferPayment extends PaymentMethod {
  processPayment(amount) {
    return `Processing $${amount} via Bank Transfer`;
  }
}

class CryptocurrencyPayment extends PaymentMethod {
  processPayment(amount) {
    return `Processing $${amount} via Cryptocurrency`;
  }
}

// Creator with Registry
class PaymentFactory {
  constructor() {
    this.paymentTypes = new Map();
  }
  
  // Register payment types
  registerPaymentType(type, PaymentClass) {
    this.paymentTypes.set(type, PaymentClass);
  }
  
  // Factory Method
  createPayment(type) {
    const PaymentClass = this.paymentTypes.get(type);
    if (!PaymentClass) {
      throw new Error(`Unknown payment type: ${type}`);
    }
    return new PaymentClass();
  }
  
  // Template method
  processOrder(type, amount) {
    const payment = this.createPayment(type);
    return payment.processPayment(amount);
  }
}

// Usage
const factory = new PaymentFactory();

// Register payment methods
factory.registerPaymentType('credit_card', CreditCardPayment);
factory.registerPaymentType('paypal', PayPalPayment);
factory.registerPaymentType('bank_transfer', BankTransferPayment);
factory.registerPaymentType('crypto', CryptocurrencyPayment);

// Use factory
console.log(factory.processOrder('credit_card', 100));
console.log(factory.processOrder('paypal', 50));
console.log(factory.processOrder('crypto', 200));
```

---

## 🔄 Variations

### 1. Parameterized Factory Method

Factory method accepts parameters to determine which product to create:

```javascript
class Creator {
  createProduct(type) {
    switch (type) {
      case 'A': return new ProductA();
      case 'B': return new ProductB();
      default: throw new Error('Unknown product type');
    }
  }
}
```

### 2. Lazy Initialization

Products are created only when needed:

```javascript
class Creator {
  constructor() {
    this._product = null;
  }
  
  createProduct() {
    if (!this._product) {
      this._product = new ConcreteProduct();
    }
    return this._product;
  }
}
```

### 3. Factory Method with Default Implementation

Creator provides a default implementation that can be overridden:

```javascript
class Creator {
  // Default factory method
  createProduct() {
    return new DefaultProduct();
  }
}

class ConcreteCreator extends Creator {
  // Override for custom product
  createProduct() {
    return new CustomProduct();
  }
}
```

### 4. Static Factory Method

Factory method is static (class method):

```javascript
class Creator {
  static createProduct(type) {
    switch (type) {
      case 'A': return new ProductA();
      case 'B': return new ProductB();
      default: throw new Error('Unknown type');
    }
  }
}

// Usage
const product = Creator.createProduct('A');
```

---

## 🌍 Real-World Examples

### 1. React - Component Creation

React uses Factory Method pattern internally for creating components:

```javascript
// React internally uses factory methods to create elements
function createElement(type, props, ...children) {
  // Factory method that creates different types of React elements
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === 'object' ? child : createTextElement(child)
      )
    }
  };
}
```

### 2. jQuery - DOM Element Creation

```javascript
// jQuery uses factory method pattern
$('<div>')  // Creates a div element
$('<span>') // Creates a span element
```

### 3. Node.js - Stream Creation

```javascript
const fs = require('fs');

// Different stream factories
const readStream = fs.createReadStream('file.txt');
const writeStream = fs.createWriteStream('output.txt');
```

### 4. Express.js - Middleware Creation

```javascript
// Express uses factory methods for creating middleware
app.use(express.json());      // Creates JSON parser middleware
app.use(express.urlencoded()); // Creates URL-encoded parser middleware
```

### 5. Framework Pattern

Many frameworks use Factory Method to allow users to extend functionality:

```javascript
// Framework code
class Framework {
  createComponent() {
    throw new Error('Must implement createComponent()');
  }
  
  render() {
    const component = this.createComponent();
    return component.render();
  }
}

// User code extends framework
class MyApp extends Framework {
  createComponent() {
    return new MyCustomComponent();
  }
}
```

---

## 🔗 Related Patterns

### Factory Method vs Simple Factory

**Simple Factory:**
- Single factory class with a method that creates objects based on parameters
- Not a design pattern, just a programming idiom
- No inheritance hierarchy

```javascript
// Simple Factory (not Factory Method pattern)
class SimpleFactory {
  static createProduct(type) {
    switch (type) {
      case 'A': return new ProductA();
      case 'B': return new ProductB();
      default: throw new Error('Unknown type');
    }
  }
}
```

**Factory Method:**
- Uses inheritance
- Each creator subclass has its own factory method
- More flexible and extensible

### Factory Method vs Abstract Factory

**Factory Method:**
- Creates one type of product
- Uses inheritance
- Single factory method

**Abstract Factory:**
- Creates families of related products
- Uses composition
- Multiple factory methods

### Factory Method vs Builder

**Factory Method:**
- Focuses on which object to create
- Simple object creation
- Returns fully constructed object

**Builder:**
- Focuses on how to construct a complex object
- Step-by-step construction
- Returns object after multiple steps

### Factory Method vs Prototype

**Factory Method:**
- Creates new instances from scratch
- Uses inheritance

**Prototype:**
- Creates new instances by cloning
- Uses composition

---

## ✅ Advantages

1. **Single Responsibility Principle** - Product creation code is isolated
2. **Open/Closed Principle** - Easy to add new product types without modifying existing code
3. **Eliminates tight coupling** - Client code works with abstractions, not concrete classes
4. **Code reusability** - Common creation logic in base creator class
5. **Flexibility** - Easy to change which products are created
6. **Testability** - Easy to mock products for testing

---

## ❌ Disadvantages

1. **Code complexity** - Requires many new subclasses
2. **Can be overkill** - For simple object creation, direct instantiation is better
3. **Inheritance-based** - If you prefer composition, consider Abstract Factory
4. **Indirection** - Can make code harder to follow

---

## 🎓 Best Practices

### 1. Use Meaningful Names

```javascript
// Good
class Logistics {
  createTransport() { }
}

// Bad
class Logistics {
  create() { }  // Too generic
}
```

### 2. Keep Factory Methods Simple

```javascript
// Good - Simple factory method
createProduct() {
  return new ConcreteProduct();
}

// Bad - Complex logic in factory method
createProduct() {
  // Too much logic here
  if (condition1) {
    if (condition2) {
      // ... complex nested logic
    }
  }
}
```

### 3. Document Factory Methods

```javascript
/**
 * Factory method that creates a transport instance.
 * Subclasses must override this to return their specific transport type.
 * 
 * @returns {Transport} A transport instance
 */
abstract createTransport() {
  throw new Error('Must implement createTransport()');
}
```

### 4. Consider Using Abstract Classes or Interfaces

```typescript
// TypeScript - Using abstract class
abstract class Creator {
  abstract factoryMethod(): Product;
  
  someOperation(): string {
    const product = this.factoryMethod();
    return product.operation();
  }
}
```

### 5. Handle Errors Gracefully

```javascript
createProduct(type) {
  const ProductClass = this.productRegistry.get(type);
  if (!ProductClass) {
    throw new Error(`Product type '${type}' not registered`);
  }
  try {
    return new ProductClass();
  } catch (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }
}
```

---

## 🚫 Common Pitfalls

### 1. Overusing Factory Method

**Problem:**
```javascript
// Unnecessary factory for simple creation
class SimpleFactory {
  createString() {
    return new String('hello');
  }
}
```

**Solution:** Use direct instantiation for simple cases.

### 2. Factory Method Doing Too Much

**Problem:**
```javascript
createProduct() {
  const product = new ConcreteProduct();
  product.initialize();
  product.validate();
  product.setup();
  product.connect();
  return product;
}
```

**Solution:** Keep factory methods focused on creation only.

### 3. Not Using Template Methods

**Problem:**
```javascript
// Client code has to know about factory method
class Client {
  useCreator(creator) {
    const product = creator.createProduct(); // Client knows about factory method
    product.doSomething();
  }
}
```

**Solution:** Use template methods to hide factory method from clients.

### 4. Mixing Factory Method with Other Patterns Incorrectly

**Problem:**
```javascript
// Confusing Factory Method with Abstract Factory
class Creator {
  createProductA() { }
  createProductB() { }  // This is Abstract Factory, not Factory Method
}
```

**Solution:** Factory Method should create one type of product.

---

## 📚 Practice Exercises

### Exercise 1: Logger Factory

Create a logging system where:
- Different loggers (FileLogger, ConsoleLogger, DatabaseLogger) can be created
- Each logger has different implementations
- Use Factory Method pattern

### Exercise 2: Shape Factory

Create a shape drawing system:
- Products: Circle, Rectangle, Triangle
- Each shape has `draw()` and `calculateArea()` methods
- Use Factory Method to create shapes

### Exercise 3: Notification System

Create a notification system:
- Support Email, SMS, Push notifications
- Each notification type has different configuration
- Use Factory Method with parameters

---

## 🔍 Code Review Checklist

When reviewing Factory Method implementations, check:

- [ ] Factory method is abstract/virtual in base creator
- [ ] Each concrete creator implements factory method
- [ ] Products share a common interface
- [ ] Client code works with abstractions
- [ ] Template methods use factory methods
- [ ] Error handling is appropriate
- [ ] Code follows naming conventions
- [ ] Documentation is clear

---

## 📖 Further Reading

1. **Design Patterns: Elements of Reusable Object-Oriented Software (GoF)**
   - Chapter 3: Creational Patterns - Factory Method

2. **Refactoring Guru**
   - https://refactoring.guru/design-patterns/factory-method

3. **SourceMaking**
   - https://sourcemaking.com/design_patterns/factory_method

4. **Pattern Languages of Program Design**
   - Factory Method variations and applications

---

## 📝 Notes Section

_Add your notes, observations, and insights here as you learn..._

### Key Takeaways

- Factory Method is about letting subclasses decide which class to instantiate
- It's perfect for frameworks that need to be extended by users
- Template methods often work hand-in-hand with factory methods
- Don't overuse it - simple object creation doesn't need a factory

### Questions to Explore

- How does Factory Method differ from dependency injection?
- When should I use Factory Method vs Abstract Factory?
- Can Factory Method be combined with other patterns?
- How do modern frameworks use Factory Method?

### Personal Examples

_Add your own code examples and use cases here..._

---

## 🎯 Summary

The **Factory Method Pattern** is a powerful creational pattern that:

- ✅ Decouples object creation from usage
- ✅ Allows subclasses to decide which objects to create
- ✅ Promotes the Open/Closed Principle
- ✅ Is essential for framework design
- ✅ Works well with Template Method pattern

Remember: Use it when you need flexibility in object creation, but don't overcomplicate simple scenarios!

---

**Date Created:** 2025-12-13  
**Pattern Type:** Creational  
**Difficulty:** Intermediate  
**Related Patterns:** Abstract Factory, Template Method, Builder
