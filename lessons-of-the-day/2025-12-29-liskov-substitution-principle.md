# Liskov Substitution Principle - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Liskov Substitution Principle definition and intent
- [ ] Learn the formal definition and behavioral subtyping concept
- [ ] Recognize violations of LSP and their consequences
- [ ] Master preconditions, postconditions, and invariants
- [ ] Understand LSP in the context of SOLID principles
- [ ] Practice identifying and fixing LSP violations
- [ ] Learn common pitfalls and best practices
- [ ] Explore real-world examples and anti-patterns
- [ ] Understand LSP in different programming paradigms

---

## 🎯 Definition

**Liskov Substitution Principle (LSP)** is a principle in object-oriented programming that states: objects of a superclass should be replaceable with objects of its subclasses without breaking the application. That is, subclasses should be substitutable for their base classes.

**Formal Definition (Barbara Liskov, 1987):**
> "Let φ(x) be a property provable about objects x of type T. Then φ(y) should be true for objects y of type S where S is a subtype of T."

**Simplified Definition:**
> "Subtypes must be substitutable for their base types without altering the correctness of the program."

**Key Principle:**
> "Derived classes must be usable through the base class interface without the need for the user to know the difference." - Subclasses should extend behavior, not restrict it.

---

## 🏗️ Structure and Concepts

### Behavioral Subtyping

LSP is about **behavioral subtyping**, not just structural subtyping. A subtype must:
1. **Honor preconditions** - Cannot strengthen preconditions (make them more restrictive)
2. **Honor postconditions** - Cannot weaken postconditions (must guarantee at least what base class guarantees)
3. **Preserve invariants** - Must maintain all invariants of the base class
4. **Follow history constraint** - Subtype objects must not allow state changes that base class prohibits

### Contract-Based Design

```
Base Class Contract:
├── Preconditions: What must be true before method execution
├── Postconditions: What must be true after method execution
├── Invariants: What must always be true
└── Exception Guarantees: What exceptions can be thrown

Subclass Must:
├── Weaken or maintain preconditions (never strengthen)
├── Strengthen or maintain postconditions (never weaken)
├── Preserve all invariants
└── Not throw new exceptions (or only subtypes of base exceptions)
```

### Key Concepts

**Substitutability:**
- Any code that works with base class should work with subclass
- No special cases or type checking needed
- Polymorphism should work seamlessly

**Design by Contract:**
- Preconditions: Requirements before method call
- Postconditions: Guarantees after method call
- Invariants: Always-true conditions

**Behavioral Compatibility:**
- Subclass must not violate expectations
- Subclass must not break assumptions
- Subclass must maintain semantic meaning

---

## 💡 When to Apply

### Apply LSP When:

✅ **Creating inheritance hierarchies**
- Designing class hierarchies
- Extending existing classes
- Implementing interfaces

✅ **Using polymorphism**
- Writing code that works with base types
- Creating generic algorithms
- Building frameworks

✅ **Designing APIs**
- Public interfaces and contracts
- Library design
- Framework design

✅ **Refactoring code**
- Improving existing inheritance
- Fixing design issues
- Improving maintainability

### LSP Violations Indicate:

❌ **Inheritance is being misused** - Composition might be better
❌ **Design needs refactoring** - Class hierarchy is incorrect
❌ **Abstraction is wrong** - Base class doesn't represent correct abstraction
❌ **Type checking is needed** - `instanceof` checks suggest LSP violation

---

## 🔨 Implementation Examples

### Example 1: Rectangle and Square (Classic Violation)

```typescript
// ❌ LSP Violation: Square cannot substitute Rectangle
class Rectangle {
  protected width: number;
  protected height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  setWidth(width: number): void {
    this.width = width;
  }

  setHeight(height: number): void {
    this.height = height;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getArea(): number {
    return this.width * this.height;
  }
}

class Square extends Rectangle {
  constructor(side: number) {
    super(side, side);
  }

  setWidth(width: number): void {
    this.width = width;
    this.height = width; // Violates LSP: changes behavior unexpectedly
  }

  setHeight(height: number): void {
    this.width = height;
    this.height = height; // Violates LSP: changes behavior unexpectedly
  }
}

// Problem: Code expecting Rectangle breaks with Square
function testRectangle(rect: Rectangle): void {
  rect.setWidth(5);
  rect.setHeight(4);
  // Expects area to be 20, but with Square it's 16!
  console.log(`Expected area: 20, Got: ${rect.getArea()}`);
}

const rectangle = new Rectangle(5, 4);
testRectangle(rectangle); // Works: 20

const square = new Square(5);
testRectangle(square); // Breaks: 16 (LSP violation!)
```

**Solution: Use Composition or Separate Hierarchy**

```typescript
// ✅ Solution 1: Separate hierarchy
interface Shape {
  getArea(): number;
}

class Rectangle implements Shape {
  constructor(
    private width: number,
    private height: number
  ) {}

  getArea(): number {
    return this.width * this.height;
  }

  setWidth(width: number): void {
    this.width = width;
  }

  setHeight(height: number): void {
    this.height = height;
  }
}

class Square implements Shape {
  constructor(private side: number) {}

  getArea(): number {
    return this.side * this.side;
  }

  setSide(side: number): void {
    this.side = side;
  }
}

// ✅ Solution 2: Immutable approach
class ImmutableRectangle {
  constructor(
    public readonly width: number,
    public readonly height: number
  ) {}

  withWidth(width: number): ImmutableRectangle {
    return new ImmutableRectangle(width, this.height);
  }

  withHeight(height: number): ImmutableRectangle {
    return new ImmutableRectangle(this.width, height);
  }

  getArea(): number {
    return this.width * this.height;
  }
}

class ImmutableSquare extends ImmutableRectangle {
  constructor(side: number) {
    super(side, side);
  }

  withSide(side: number): ImmutableSquare {
    return new ImmutableSquare(side);
  }

  // Override to maintain square invariant
  withWidth(width: number): ImmutableSquare {
    return this.withSide(width);
  }

  withHeight(height: number): ImmutableSquare {
    return this.withSide(height);
  }
}
```

### Example 2: Bird and Penguin (Common Violation)

```typescript
// ❌ LSP Violation: Penguin cannot fly
class Bird {
  fly(): void {
    console.log('Flying...');
  }

  eat(): void {
    console.log('Eating...');
  }
}

class Sparrow extends Bird {
  fly(): void {
    console.log('Sparrow flying...');
  }
}

class Penguin extends Bird {
  fly(): void {
    throw new Error('Penguins cannot fly!'); // Violates LSP
  }
}

// Problem: Code expecting Bird breaks with Penguin
function makeBirdFly(bird: Bird): void {
  bird.fly(); // Crashes with Penguin!
}

const sparrow = new Sparrow();
makeBirdFly(sparrow); // Works

const penguin = new Penguin();
makeBirdFly(penguin); // Throws error (LSP violation!)
```

**Solution: Separate Interfaces**

```typescript
// ✅ Solution: Separate concerns
interface Bird {
  eat(): void;
  layEggs(): void;
}

interface Flyable {
  fly(): void;
}

class Sparrow implements Bird, Flyable {
  eat(): void {
    console.log('Sparrow eating...');
  }

  layEggs(): void {
    console.log('Sparrow laying eggs...');
  }

  fly(): void {
    console.log('Sparrow flying...');
  }
}

class Penguin implements Bird {
  eat(): void {
    console.log('Penguin eating...');
  }

  layEggs(): void {
    console.log('Penguin laying eggs...');
  }
}

// Now code can work with appropriate types
function makeBirdFly(flyable: Flyable): void {
  flyable.fly();
}

function feedBird(bird: Bird): void {
  bird.eat();
}

const sparrow = new Sparrow();
makeBirdFly(sparrow); // Works
feedBird(sparrow); // Works

const penguin = new Penguin();
feedBird(penguin); // Works
// makeBirdFly(penguin); // Compile-time error (correct!)
```

### Example 3: File Operations (Precondition Violation)

```typescript
// ❌ LSP Violation: Strengthening preconditions
class FileReader {
  read(filePath: string): string {
    // Base class: accepts any string
    if (!filePath) {
      throw new Error('File path cannot be empty');
    }
    return `Content of ${filePath}`;
  }
}

class SecureFileReader extends FileReader {
  read(filePath: string): string {
    // Violates LSP: Strengthens precondition (requires .txt extension)
    if (!filePath.endsWith('.txt')) {
      throw new Error('Only .txt files are allowed');
    }
    return super.read(filePath);
  }
}

// Problem: Code expecting FileReader breaks with SecureFileReader
function readAnyFile(reader: FileReader, path: string): void {
  reader.read(path); // May throw with SecureFileReader
}

const reader = new FileReader();
readAnyFile(reader, 'data.csv'); // Works

const secureReader = new SecureFileReader();
readAnyFile(secureReader, 'data.csv'); // Throws (LSP violation!)
```

**Solution: Weaken Preconditions or Use Composition**

```typescript
// ✅ Solution 1: Weaken preconditions (accept more)
class FileReader {
  read(filePath: string): string {
    if (!filePath) {
      throw new Error('File path cannot be empty');
    }
    return `Content of ${filePath}`;
  }
}

class SecureFileReader extends FileReader {
  read(filePath: string): string {
    // Accepts all files, but validates internally
    if (!filePath.endsWith('.txt')) {
      console.warn('Non-.txt file detected, returning empty');
      return '';
    }
    return super.read(filePath);
  }
}

// ✅ Solution 2: Use composition with validation
class FileValidator {
  validate(filePath: string): boolean {
    return filePath.endsWith('.txt');
  }
}

class SecureFileReader2 {
  constructor(private validator: FileValidator) {}

  read(filePath: string): string {
    if (!this.validator.validate(filePath)) {
      throw new Error('File validation failed');
    }
    return `Content of ${filePath}`;
  }
}
```

### Example 4: Collection Operations (Postcondition Violation)

```typescript
// ❌ LSP Violation: Weakening postconditions
class Collection<T> {
  add(item: T): void {
    // Base class: always adds item
    this.items.push(item);
  }

  getCount(): number {
    return this.items.length;
  }

  protected items: T[] = [];
}

class BoundedCollection<T> extends Collection<T> {
  private maxSize: number;

  constructor(maxSize: number) {
    super();
    this.maxSize = maxSize;
  }

  add(item: T): void {
    // Violates LSP: Weakens postcondition (may not add item)
    if (this.items.length >= this.maxSize) {
      return; // Silently fails - breaks expectation
    }
    super.add(item);
  }
}

// Problem: Code expecting Collection breaks with BoundedCollection
function addItems<T>(collection: Collection<T>, items: T[]): void {
  items.forEach(item => collection.add(item));
  // Expects all items added, but BoundedCollection may skip some
  console.log(`Added ${items.length} items, collection has ${collection.getCount()}`);
}

const collection = new Collection<number>();
addItems(collection, [1, 2, 3]); // Works: 3 items

const bounded = new BoundedCollection<number>(2);
addItems(bounded, [1, 2, 3]); // Breaks: only 2 items (LSP violation!)
```

**Solution: Maintain Postconditions or Use Different Design**

```typescript
// ✅ Solution 1: Throw exception instead of silent failure
class BoundedCollection<T> extends Collection<T> {
  private maxSize: number;

  constructor(maxSize: number) {
    super();
    this.maxSize = maxSize;
  }

  add(item: T): void {
    if (this.items.length >= this.maxSize) {
      throw new Error('Collection is full');
    }
    super.add(item);
  }

  tryAdd(item: T): boolean {
    if (this.items.length >= this.maxSize) {
      return false;
    }
    this.add(item);
    return true;
  }
}

// ✅ Solution 2: Use composition
class BoundedCollection2<T> {
  private collection: Collection<T>;
  private maxSize: number;

  constructor(maxSize: number) {
    this.collection = new Collection<T>();
    this.maxSize = maxSize;
  }

  add(item: T): boolean {
    if (this.collection.getCount() >= this.maxSize) {
      return false;
    }
    this.collection.add(item);
    return true;
  }

  getCount(): number {
    return this.collection.getCount();
  }
}
```

### Example 5: Database Operations (Exception Violation)

```typescript
// ❌ LSP Violation: Throwing new exceptions
class DatabaseConnection {
  connect(): void {
    // Base class: may throw ConnectionError
    throw new ConnectionError('Connection failed');
  }

  query(sql: string): Result {
    return new Result();
  }
}

class ReadOnlyDatabaseConnection extends DatabaseConnection {
  connect(): void {
    super.connect();
  }

  query(sql: string): Result {
    // Violates LSP: Throws new exception type
    if (sql.trim().toUpperCase().startsWith('INSERT') ||
        sql.trim().toUpperCase().startsWith('UPDATE') ||
        sql.trim().toUpperCase().startsWith('DELETE')) {
      throw new ReadOnlyException('Write operations not allowed'); // New exception!
    }
    return super.query(sql);
  }
}

// Problem: Code handling ConnectionError breaks
function executeQuery(connection: DatabaseConnection, sql: string): void {
  try {
    connection.query(sql);
  } catch (error) {
    if (error instanceof ConnectionError) {
      console.log('Connection error handled');
    } else {
      throw error; // ReadOnlyException not handled!
    }
  }
}
```

**Solution: Use Exception Hierarchy**

```typescript
// ✅ Solution: Use exception hierarchy
class DatabaseException extends Error {}
class ConnectionError extends DatabaseException {}
class ReadOnlyException extends DatabaseException {} // Subtype of DatabaseException

class DatabaseConnection {
  connect(): void {
    throw new ConnectionError('Connection failed');
  }

  query(sql: string): Result {
    return new Result();
  }
}

class ReadOnlyDatabaseConnection extends DatabaseConnection {
  query(sql: string): Result {
    if (sql.trim().toUpperCase().startsWith('INSERT') ||
        sql.trim().toUpperCase().startsWith('UPDATE') ||
        sql.trim().toUpperCase().startsWith('DELETE')) {
      throw new ReadOnlyException('Write operations not allowed');
    }
    return super.query(sql);
  }
}

// Now code can handle both
function executeQuery(connection: DatabaseConnection, sql: string): void {
  try {
    connection.query(sql);
  } catch (error) {
    if (error instanceof DatabaseException) {
      console.log('Database error handled:', error.message);
    } else {
      throw error;
    }
  }
}
```

### Example 6: Payment Processing (Correct LSP Implementation)

```typescript
// ✅ Correct LSP Implementation
interface PaymentMethod {
  processPayment(amount: number): PaymentResult;
  validatePayment(amount: number): boolean;
}

class PaymentResult {
  constructor(
    public success: boolean,
    public transactionId: string,
    public message: string
  ) {}
}

class CreditCardPayment implements PaymentMethod {
  constructor(
    private cardNumber: string,
    private cvv: string
  ) {}

  validatePayment(amount: number): boolean {
    return amount > 0 && this.cardNumber.length === 16;
  }

  processPayment(amount: number): PaymentResult {
    if (!this.validatePayment(amount)) {
      return new PaymentResult(false, '', 'Invalid payment');
    }
    // Process credit card payment
    return new PaymentResult(true, 'CC-12345', 'Credit card payment processed');
  }
}

class PayPalPayment implements PaymentMethod {
  constructor(private email: string) {}

  validatePayment(amount: number): boolean {
    return amount > 0 && this.email.includes('@');
  }

  processPayment(amount: number): PaymentResult {
    if (!this.validatePayment(amount)) {
      return new PaymentResult(false, '', 'Invalid payment');
    }
    // Process PayPal payment
    return new PaymentResult(true, 'PP-67890', 'PayPal payment processed');
  }
}

class CryptocurrencyPayment implements PaymentMethod {
  constructor(private walletAddress: string) {}

  validatePayment(amount: number): boolean {
    return amount > 0 && this.walletAddress.startsWith('0x');
  }

  processPayment(amount: number): PaymentResult {
    if (!this.validatePayment(amount)) {
      return new PaymentResult(false, '', 'Invalid payment');
    }
    // Process cryptocurrency payment
    return new PaymentResult(true, 'CRYPTO-ABC123', 'Cryptocurrency payment processed');
  }
}

// Code works with any PaymentMethod - LSP satisfied
class PaymentProcessor {
  processPayment(method: PaymentMethod, amount: number): PaymentResult {
    return method.processPayment(amount);
  }
}

// Usage - all payment methods are substitutable
const processor = new PaymentProcessor();

const creditCard = new CreditCardPayment('1234567890123456', '123');
const result1 = processor.processPayment(creditCard, 100);

const paypal = new PayPalPayment('user@example.com');
const result2 = processor.processPayment(paypal, 50);

const crypto = new CryptocurrencyPayment('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
const result3 = processor.processPayment(crypto, 200);
```

### Example 7: Stack and RestrictedStack (Invariant Violation)

```typescript
// ❌ LSP Violation: Breaking invariants
class Stack<T> {
  protected items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T {
    if (this.items.length === 0) {
      throw new Error('Stack is empty');
    }
    return this.items.pop()!;
  }

  peek(): T {
    if (this.items.length === 0) {
      throw new Error('Stack is empty');
    }
    return this.items[this.items.length - 1];
  }

  size(): number {
    return this.items.length;
  }

  // Invariant: size() >= 0 always
}

class RestrictedStack<T> extends Stack<T> {
  private maxSize: number;

  constructor(maxSize: number) {
    super();
    this.maxSize = maxSize;
  }

  push(item: T): void {
    // Violates LSP: May break invariant expectation
    if (this.items.length >= this.maxSize) {
      throw new Error('Stack is full');
    }
    super.push(item);
  }
}

// Problem: Code expecting Stack behavior breaks
function fillStack<T>(stack: Stack<T>, items: T[]): void {
  items.forEach(item => {
    try {
      stack.push(item);
    } catch (error) {
      console.log('Failed to push item');
    }
  });
  // Expects all items pushed, but RestrictedStack may fail
}
```

**Solution: Use Composition or Different Abstraction**

```typescript
// ✅ Solution: Use composition
interface IStack<T> {
  push(item: T): void;
  pop(): T;
  peek(): T;
  size(): number;
}

class Stack<T> implements IStack<T> {
  protected items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T {
    if (this.items.length === 0) {
      throw new Error('Stack is empty');
    }
    return this.items.pop()!;
  }

  peek(): T {
    if (this.items.length === 0) {
      throw new Error('Stack is empty');
    }
    return this.items[this.items.length - 1];
  }

  size(): number {
    return this.items.length;
  }
}

class RestrictedStack<T> implements IStack<T> {
  private stack: Stack<T>;
  private maxSize: number;

  constructor(maxSize: number) {
    this.stack = new Stack<T>();
    this.maxSize = maxSize;
  }

  push(item: T): void {
    if (this.stack.size() >= this.maxSize) {
      throw new Error('Stack is full');
    }
    this.stack.push(item);
  }

  pop(): T {
    return this.stack.pop();
  }

  peek(): T {
    return this.stack.peek();
  }

  size(): number {
    return this.stack.size();
  }
}
```

### Example 8: Logger Hierarchy (Correct LSP)

```typescript
// ✅ Correct LSP Implementation
interface Logger {
  log(level: string, message: string): void;
  isEnabled(level: string): boolean;
}

class ConsoleLogger implements Logger {
  log(level: string, message: string): void {
    console.log(`[${level}] ${message}`);
  }

  isEnabled(level: string): boolean {
    return true; // Console always enabled
  }
}

class FileLogger implements Logger {
  constructor(private filePath: string) {}

  log(level: string, message: string): void {
    // Write to file (simplified)
    console.log(`Writing to ${this.filePath}: [${level}] ${message}`);
  }

  isEnabled(level: string): boolean {
    return true; // File always enabled
  }
}

class FilteredLogger implements Logger {
  constructor(
    private delegate: Logger,
    private allowedLevels: string[]
  ) {}

  log(level: string, message: string): void {
    if (this.isEnabled(level)) {
      this.delegate.log(level, message);
    }
    // Still satisfies contract: log was called
  }

  isEnabled(level: string): boolean {
    return this.allowedLevels.includes(level) && this.delegate.isEnabled(level);
  }
}

// All loggers are substitutable
function logMessage(logger: Logger, level: string, message: string): void {
  if (logger.isEnabled(level)) {
    logger.log(level, message);
  }
}

// Usage - all work correctly
const consoleLogger = new ConsoleLogger();
logMessage(consoleLogger, 'INFO', 'Application started');

const fileLogger = new FileLogger('/var/log/app.log');
logMessage(fileLogger, 'ERROR', 'Something went wrong');

const filteredLogger = new FilteredLogger(consoleLogger, ['ERROR', 'WARN']);
logMessage(filteredLogger, 'INFO', 'This is filtered'); // Won't log
logMessage(filteredLogger, 'ERROR', 'This will log'); // Will log
```

---

## 🌍 Real-World Applications

### 1. **Collection Frameworks**
- Java Collections (List, Set, Map)
- C# Collections (IEnumerable, ICollection)
- All implementations must be substitutable
- Immutable vs mutable collections

### 2. **Database Abstraction Layers**
- ORM frameworks (Entity Framework, Hibernate)
- Database connection abstractions
- Repository pattern implementations
- Different database providers must be substitutable

### 3. **Payment Processing Systems**
- Different payment methods (credit card, PayPal, crypto)
- All must follow same contract
- Payment gateways must be interchangeable

### 4. **Logging Frameworks**
- Different log outputs (console, file, database)
- All loggers must be substitutable
- Log levels and filtering

### 5. **UI Component Libraries**
- Base component classes
- Specialized components (buttons, inputs)
- All must work with base component code

### 6. **Stream Processing**
- Input/output streams
- File streams, network streams, memory streams
- All must be substitutable

### 7. **Authentication Systems**
- Different auth providers (JWT, OAuth, Basic)
- All must follow same interface
- Must be interchangeable

### 8. **Caching Systems**
- Different cache implementations (memory, Redis, file)
- All must follow cache interface
- Must be substitutable

---

## 🔄 LSP in Context of SOLID Principles

### Relationship with Other SOLID Principles

**Single Responsibility Principle (SRP):**
- LSP violations often indicate SRP violations
- Classes doing too much may have incompatible subtypes

**Open/Closed Principle (OCP):**
- LSP enables OCP
- Subtypes extend behavior without modifying base class
- Violating LSP breaks OCP

**Interface Segregation Principle (ISP):**
- LSP violations often caused by fat interfaces
- Segregating interfaces helps maintain LSP
- Clients shouldn't depend on methods they don't use

**Dependency Inversion Principle (DIP):**
- LSP enables DIP
- High-level modules depend on abstractions
- Subtypes must be substitutable for abstractions

### SOLID Principles Together

```
SRP → Classes have single responsibility
  ↓
OCP → Open for extension, closed for modification
  ↓
LSP → Subtypes are substitutable (enables OCP)
  ↓
ISP → Interfaces are focused and segregated
  ↓
DIP → Depend on abstractions, not concretions
```

---

## ⚠️ Common Violations and Anti-Patterns

### 1. **Rectangle-Square Problem**
**Problem:** Square extends Rectangle but violates width/height independence
**Solution:** Use composition or separate hierarchy

### 2. **Circle-Ellipse Problem**
**Problem:** Circle extends Ellipse but violates radius independence
**Solution:** Similar to Rectangle-Square

### 3. **Bird-Penguin Problem**
**Problem:** Penguin extends Bird but cannot fly
**Solution:** Separate interfaces (Bird, Flyable)

### 4. **Strengthening Preconditions**
**Problem:** Subclass requires more than base class
**Solution:** Weaken or maintain preconditions

### 5. **Weakening Postconditions**
**Problem:** Subclass guarantees less than base class
**Solution:** Strengthen or maintain postconditions

### 6. **Throwing New Exceptions**
**Problem:** Subclass throws exceptions base class doesn't
**Solution:** Use exception hierarchy

### 7. **Breaking Invariants**
**Problem:** Subclass breaks base class invariants
**Solution:** Preserve all invariants

### 8. **Type Checking (Code Smell)**
**Problem:** Using `instanceof` or type checks
**Solution:** Indicates LSP violation, refactor design

```typescript
// ❌ Code smell: Type checking suggests LSP violation
function processShape(shape: Shape): void {
  if (shape instanceof Rectangle) {
    // Special handling for Rectangle
  } else if (shape instanceof Square) {
    // Special handling for Square
  }
  // This suggests Rectangle and Square aren't substitutable!
}
```

---

## ✅ Best Practices

### 1. **Design Contracts Carefully**
Define clear contracts for base classes:
- Preconditions
- Postconditions
- Invariants
- Exception guarantees

```typescript
/**
 * Contract:
 * - Precondition: amount > 0
 * - Postcondition: balance increased by amount
 * - Invariant: balance >= 0
 * - Exceptions: throws InvalidAmountException if amount <= 0
 */
abstract class Account {
  protected balance: number = 0;

  abstract deposit(amount: number): void;
}
```

### 2. **Use Composition Over Inheritance**
When inheritance causes LSP violations, use composition:

```typescript
// ✅ Composition instead of inheritance
class Square {
  private rectangle: Rectangle;

  constructor(side: number) {
    this.rectangle = new Rectangle(side, side);
  }

  setSide(side: number): void {
    this.rectangle = new Rectangle(side, side);
  }

  getArea(): number {
    return this.rectangle.getArea();
  }
}
```

### 3. **Follow Interface Segregation**
Keep interfaces focused to avoid LSP violations:

```typescript
// ✅ Segregated interfaces
interface Flyable {
  fly(): void;
}

interface Swimmable {
  swim(): void;
}

interface Bird {
  eat(): void;
}
```

### 4. **Use Immutable Objects When Possible**
Immutable objects reduce LSP violation risks:

```typescript
// ✅ Immutable approach
class ImmutablePoint {
  constructor(
    public readonly x: number,
    public readonly y: number
  ) {}

  withX(x: number): ImmutablePoint {
    return new ImmutablePoint(x, this.y);
  }

  withY(y: number): ImmutablePoint {
    return new ImmutablePoint(this.x, y);
  }
}
```

### 5. **Document Contracts**
Document preconditions, postconditions, and invariants:

```typescript
/**
 * Processes a payment.
 * 
 * @param amount - Must be positive (> 0)
 * @returns PaymentResult with success status
 * @throws InvalidAmountException if amount <= 0
 * @throws PaymentException if payment processing fails
 * 
 * Postconditions:
 * - If successful, payment is recorded
 * - If failed, no state changes occur
 */
processPayment(amount: number): PaymentResult;
```

### 6. **Test Substitutability**
Write tests that verify substitutability:

```typescript
describe('PaymentMethod Substitutability', () => {
  const paymentMethods: PaymentMethod[] = [
    new CreditCardPayment('1234567890123456', '123'),
    new PayPalPayment('user@example.com'),
    new CryptocurrencyPayment('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
  ];

  paymentMethods.forEach(method => {
    it(`should process payment with ${method.constructor.name}`, () => {
      const result = method.processPayment(100);
      expect(result.success).toBe(true);
      expect(result.transactionId).toBeTruthy();
    });
  });
});
```

### 7. **Avoid Type Checking**
If you need type checking, it suggests LSP violation:

```typescript
// ❌ Bad: Type checking
if (shape instanceof Square) {
  // Special handling
}

// ✅ Good: Polymorphism works
shape.calculateArea(); // Works for all shapes
```

### 8. **Use Factory Pattern for Creation**
Use factories to create appropriate types:

```typescript
class PaymentMethodFactory {
  create(type: string, config: any): PaymentMethod {
    switch (type) {
      case 'creditcard':
        return new CreditCardPayment(config.cardNumber, config.cvv);
      case 'paypal':
        return new PayPalPayment(config.email);
      case 'crypto':
        return new CryptocurrencyPayment(config.walletAddress);
      default:
        throw new Error('Unknown payment method');
    }
  }
}
```

### 9. **Preserve Behavioral Contracts**
Ensure subclasses maintain behavioral contracts:

```typescript
// Base class contract: method never returns null
abstract class Repository<T> {
  abstract findById(id: string): T | null; // Contract: may return null
}

// Subclass must honor contract
class UserRepository extends Repository<User> {
  findById(id: string): User | null {
    // Must return User | null, not throw exception
    return this.users.get(id) || null;
  }
}
```

### 10. **Use Design by Contract Tools**
Use tools that enforce contracts:

```typescript
// Using contract checking (pseudo-code)
class Account {
  @Precondition(amount => amount > 0)
  @Postcondition((result, amount) => result.balance === old(this.balance) + amount)
  deposit(amount: number): void {
    this.balance += amount;
  }
}
```

---

## 🧪 Testing LSP Compliance

### Testing Substitutability

```typescript
describe('LSP Compliance Tests', () => {
  describe('PaymentMethod Substitutability', () => {
    const createPaymentMethods = (): PaymentMethod[] => [
      new CreditCardPayment('1234567890123456', '123'),
      new PayPalPayment('user@example.com'),
      new CryptocurrencyPayment('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
    ];

    it('should process payment for all payment methods', () => {
      const methods = createPaymentMethods();
      methods.forEach(method => {
        const result = method.processPayment(100);
        expect(result.success).toBe(true);
        expect(result.transactionId).toBeTruthy();
      });
    });

    it('should validate payment for all payment methods', () => {
      const methods = createPaymentMethods();
      methods.forEach(method => {
        expect(method.validatePayment(100)).toBe(true);
        expect(method.validatePayment(-10)).toBe(false);
      });
    });
  });

  describe('Logger Substitutability', () => {
    const createLoggers = (): Logger[] => [
      new ConsoleLogger(),
      new FileLogger('/tmp/test.log'),
      new FilteredLogger(new ConsoleLogger(), ['ERROR'])
    ];

    it('should log messages for all loggers', () => {
      const loggers = createLoggers();
      loggers.forEach(logger => {
        expect(() => logger.log('INFO', 'Test message')).not.toThrow();
      });
    });

    it('should check enabled status for all loggers', () => {
      const loggers = createLoggers();
      loggers.forEach(logger => {
        expect(typeof logger.isEnabled('INFO')).toBe('boolean');
      });
    });
  });
});
```

### Testing Contract Compliance

```typescript
describe('Contract Compliance', () => {
  describe('Precondition Compliance', () => {
    it('should not strengthen preconditions in subclasses', () => {
      const reader = new FileReader();
      const secureReader = new SecureFileReader();

      // Both should accept same inputs (or secureReader should accept more)
      expect(() => reader.read('file.txt')).not.toThrow();
      expect(() => secureReader.read('file.txt')).not.toThrow();
    });
  });

  describe('Postcondition Compliance', () => {
    it('should not weaken postconditions in subclasses', () => {
      const collection = new Collection<number>();
      const bounded = new BoundedCollection<number>(10);

      collection.add(1);
      bounded.add(1);

      // Both should have item added (same postcondition)
      expect(collection.getCount()).toBe(1);
      expect(bounded.getCount()).toBe(1);
    });
  });

  describe('Exception Compliance', () => {
    it('should not throw new exception types', () => {
      const connection = new DatabaseConnection();
      const readOnly = new ReadOnlyDatabaseConnection();

      // Both should throw compatible exceptions
      expect(() => connection.query('SELECT * FROM users')).not.toThrow();
      expect(() => readOnly.query('SELECT * FROM users')).not.toThrow();
    });
  });
});
```

---

## 📊 Advantages and Disadvantages

### Advantages

✅ **Enables Polymorphism**
- Code works with base types
- Runtime behavior selection
- Flexible system design

✅ **Improves Maintainability**
- Changes to subclasses don't break base class code
- Easier to extend functionality
- Reduces coupling

✅ **Enables Open/Closed Principle**
- Open for extension
- Closed for modification
- New subtypes don't break existing code

✅ **Improves Testability**
- Can test with base type
- Mock implementations are easier
- Test substitutability

✅ **Reduces Type Checking**
- No need for `instanceof` checks
- Cleaner code
- Better polymorphism

✅ **Better Abstraction**
- Clear contracts
- Well-defined interfaces
- Predictable behavior

### Disadvantages

❌ **Requires Careful Design**
- Must design contracts carefully
- Need to think about all use cases
- Can be complex

❌ **May Limit Flexibility**
- Some designs may be too restrictive
- May need to use composition instead
- Can require more abstraction

❌ **Requires Discipline**
- Easy to violate accidentally
- Need to understand contracts
- Requires code review

❌ **Can Lead to Over-Abstraction**
- Too many interfaces
- Complex hierarchies
- May be over-engineered

---

## 🔗 Related Concepts

### Design by Contract
- Preconditions, postconditions, invariants
- Formal specification of behavior
- Enables LSP verification

### Behavioral Subtyping
- Subtypes must preserve behavior
- Not just structural compatibility
- Semantic compatibility required

### Polymorphism
- LSP enables polymorphism
- Runtime type selection
- Code reuse

### Composition over Inheritance
- Alternative to inheritance
- Avoids LSP violations
- More flexible design

### Interface Segregation
- Smaller, focused interfaces
- Reduces LSP violation risk
- Better abstraction

---

## 🎓 Summary

The **Liskov Substitution Principle (LSP)** is a fundamental principle of object-oriented design that:

1. **Ensures Substitutability** - Subtypes must be usable wherever base types are used
2. **Preserves Contracts** - Subtypes must honor preconditions, postconditions, and invariants
3. **Enables Polymorphism** - Code works with base types, not specific implementations
4. **Supports Open/Closed Principle** - New subtypes don't break existing code
5. **Improves Maintainability** - Changes to subtypes don't affect base class code

**Key Takeaways:**
- Subtypes must not strengthen preconditions
- Subtypes must not weaken postconditions
- Subtypes must preserve invariants
- Subtypes should not throw new exception types
- Use composition when inheritance violates LSP
- Type checking (`instanceof`) suggests LSP violation

**When to Apply:**
- Designing inheritance hierarchies
- Creating interfaces and abstractions
- Using polymorphism
- Extending existing classes
- Refactoring code

**Common Violations:**
- Rectangle-Square problem
- Bird-Penguin problem
- Strengthening preconditions
- Weakening postconditions
- Throwing new exceptions
- Breaking invariants

**Solutions:**
- Use composition instead of inheritance
- Separate interfaces (Interface Segregation)
- Use immutable objects
- Design clear contracts
- Use exception hierarchies
- Preserve behavioral contracts

---

## 📚 Additional Resources

### Books
- **Agile Software Development: Principles, Patterns, and Practices** (Robert C. Martin) - SOLID principles including LSP
- **Clean Code** (Robert C. Martin) - LSP in context of clean code
- **Design by Contract** (Bertrand Meyer) - Formal contract specification
- **Object-Oriented Software Construction** (Bertrand Meyer) - Behavioral subtyping

### Papers
- **"A Behavioral Notion of Subtyping"** (Barbara Liskov, Jeannette Wing, 1994) - Original LSP paper
- **"Design by Contract"** (Bertrand Meyer) - Contract-based design

### Online Resources
- [Refactoring Guru - Liskov Substitution Principle](https://refactoring.guru/didp/liskov-substitution-principle)
- [SourceMaking - Liskov Substitution Principle](https://sourcemaking.com/design_patterns/liskov_substitution_principle)
- [Wikipedia - Liskov Substitution Principle](https://en.wikipedia.org/wiki/Liskov_substitution_principle)

### Related Topics
- SOLID Principles
- Design by Contract
- Behavioral Subtyping
- Polymorphism
- Inheritance vs Composition
- Interface Segregation Principle
- Open/Closed Principle

---

**Next Steps:**
- Practice identifying LSP violations in code
- Refactor code to fix LSP violations
- Design new hierarchies following LSP
- Study Design by Contract concepts
- Explore behavioral subtyping formally
- Consider learning about other SOLID principles

