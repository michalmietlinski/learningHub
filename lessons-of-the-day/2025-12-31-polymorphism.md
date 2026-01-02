# Polymorphism - Deep Dive

## 📋 Learning Objectives

- [ ] Understand polymorphism definition and types
- [ ] Learn compile-time vs runtime polymorphism
- [ ] Master polymorphism in object-oriented programming
- [ ] Recognize polymorphism in different programming paradigms
- [ ] Understand polymorphism in JavaScript/TypeScript
- [ ] Practice implementing polymorphic behavior
- [ ] Learn common pitfalls and best practices
- [ ] Explore real-world applications

---

## 🎯 Definition

**Polymorphism** is the ability of objects of different types to be accessed through the same interface. It allows a single interface to represent different underlying forms (data types).

**Etymology:**
- **Poly** = Many
- **Morph** = Forms
- **Polymorphism** = Many Forms

**Key Principle:**
> "One interface, multiple implementations" - Polymorphism allows you to write code that works with objects of different types through a common interface, enabling flexibility, extensibility, and code reuse.

---

## 🏗️ Types of Polymorphism

### 1. Compile-Time Polymorphism (Static Polymorphism)

**Method Overloading:**
- Multiple methods with same name but different parameters
- Resolved at compile time
- Based on method signature

**Operator Overloading:**
- Same operator behaves differently with different types
- Not available in JavaScript/TypeScript
- Available in C++, Python, etc.

### 2. Runtime Polymorphism (Dynamic Polymorphism)

**Method Overriding:**
- Subclass provides specific implementation of parent method
- Resolved at runtime
- Based on actual object type

**Interface Polymorphism:**
- Objects implement same interface differently
- Resolved at runtime
- Enables substitution

---

## 💡 Polymorphism in Object-Oriented Programming

### Example 1: Basic Polymorphism (Method Overriding)

```typescript
// Base Class
abstract class Animal {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  // Abstract method - must be overridden
  abstract makeSound(): string;

  // Concrete method - can be overridden
  move(): string {
    return `${this.name} is moving`;
  }
}

// Derived Classes
class Dog extends Animal {
  makeSound(): string {
    return `${this.name} says: Woof!`;
  }

  move(): string {
    return `${this.name} is running`;
  }
}

class Cat extends Animal {
  makeSound(): string {
    return `${this.name} says: Meow!`;
  }

  move(): string {
    return `${this.name} is sneaking`;
  }
}

class Bird extends Animal {
  makeSound(): string {
    return `${this.name} says: Tweet!`;
  }

  move(): string {
    return `${this.name} is flying`;
  }
}

// Polymorphic Usage
function demonstratePolymorphism(animals: Animal[]): void {
  animals.forEach(animal => {
    console.log(animal.makeSound()); // Different implementation for each type
    console.log(animal.move());      // May use base or overridden method
  });
}

// Usage
const animals: Animal[] = [
  new Dog('Buddy'),
  new Cat('Whiskers'),
  new Bird('Tweety')
];

demonstratePolymorphism(animals);

// Output:
// Buddy says: Woof!
// Buddy is running
// Whiskers says: Meow!
// Whiskers is sneaking
// Tweety says: Tweet!
// Tweety is flying
```

### Example 2: Interface Polymorphism

```typescript
// Interface
interface Shape {
  area(): number;
  perimeter(): number;
  draw(): void;
}

// Implementations
class Circle implements Shape {
  constructor(private radius: number) {}

  area(): number {
    return Math.PI * this.radius * this.radius;
  }

  perimeter(): number {
    return 2 * Math.PI * this.radius;
  }

  draw(): void {
    console.log(`Drawing a circle with radius ${this.radius}`);
  }
}

class Rectangle implements Shape {
  constructor(
    private width: number,
    private height: number
  ) {}

  area(): number {
    return this.width * this.height;
  }

  perimeter(): number {
    return 2 * (this.width + this.height);
  }

  draw(): void {
    console.log(`Drawing a rectangle ${this.width}x${this.height}`);
  }
}

class Triangle implements Shape {
  constructor(
    private base: number,
    private height: number,
    private side1: number,
    private side2: number
  ) {}

  area(): number {
    return 0.5 * this.base * this.height;
  }

  perimeter(): number {
    return this.base + this.side1 + this.side2;
  }

  draw(): void {
    console.log(`Drawing a triangle with base ${this.base}`);
  }
}

// Polymorphic Function
function processShapes(shapes: Shape[]): void {
  let totalArea = 0;
  let totalPerimeter = 0;

  shapes.forEach(shape => {
    shape.draw(); // Polymorphic call
    totalArea += shape.area();
    totalPerimeter += shape.perimeter();
  });

  console.log(`Total Area: ${totalArea.toFixed(2)}`);
  console.log(`Total Perimeter: ${totalPerimeter.toFixed(2)}`);
}

// Usage
const shapes: Shape[] = [
  new Circle(5),
  new Rectangle(4, 6),
  new Triangle(3, 4, 5, 4)
];

processShapes(shapes);
```

### Example 3: Strategy Pattern with Polymorphism

```typescript
// Strategy Interface
interface PaymentStrategy {
  pay(amount: number): void;
}

// Concrete Strategies
class CreditCardPayment implements PaymentStrategy {
  constructor(
    private cardNumber: string,
    private name: string
  ) {}

  pay(amount: number): void {
    console.log(`Paid $${amount} using Credit Card ending in ${this.cardNumber.slice(-4)}`);
  }
}

class PayPalPayment implements PaymentStrategy {
  constructor(private email: string) {}

  pay(amount: number): void {
    console.log(`Paid $${amount} using PayPal account ${this.email}`);
  }
}

class CryptocurrencyPayment implements PaymentStrategy {
  constructor(private walletAddress: string) {}

  pay(amount: number): void {
    console.log(`Paid $${amount} using Crypto wallet ${this.walletAddress.slice(0, 8)}...`);
  }
}

// Context
class PaymentProcessor {
  processPayment(strategy: PaymentStrategy, amount: number): void {
    strategy.pay(amount); // Polymorphic call
  }
}

// Usage
const processor = new PaymentProcessor();

processor.processPayment(new CreditCardPayment('1234567890123456', 'John Doe'), 100);
processor.processPayment(new PayPalPayment('john@example.com'), 50);
processor.processPayment(new CryptocurrencyPayment('0x1234567890abcdef'), 200);
```

---

## 🔄 Polymorphism in JavaScript/TypeScript

### Example 4: Duck Typing (Structural Polymorphism)

```typescript
// Duck Typing - "If it walks like a duck and quacks like a duck, it's a duck"
interface Quackable {
  quack(): void;
}

class Duck implements Quackable {
  quack(): void {
    console.log('Quack!');
  }
}

class Person implements Quackable {
  quack(): void {
    console.log('I can quack like a duck!');
  }
}

class ToyDuck {
  quack(): void {
    console.log('Squeak!');
  }
}

// Function accepts any object with quack method
function makeItQuack(quackable: Quackable): void {
  quackable.quack(); // Polymorphic call
}

// Usage
makeItQuack(new Duck());
makeItQuack(new Person());
makeItQuack(new ToyDuck()); // Works because it has quack method
```

### Example 5: Polymorphism with Generics

```typescript
// Generic Interface
interface Container<T> {
  add(item: T): void;
  get(index: number): T | undefined;
  size(): number;
}

// Implementations
class ArrayContainer<T> implements Container<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  get(index: number): T | undefined {
    return this.items[index];
  }

  size(): number {
    return this.items.length;
  }
}

class StackContainer<T> implements Container<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  get(index: number): T | undefined {
    return this.items[this.items.length - 1 - index];
  }

  size(): number {
    return this.items.length;
  }
}

// Polymorphic Function
function processContainer<T>(container: Container<T>, items: T[]): void {
  items.forEach(item => container.add(item));
  console.log(`Container size: ${container.size()}`);
  console.log(`First item: ${container.get(0)}`);
}

// Usage
const arrayContainer = new ArrayContainer<number>();
processContainer(arrayContainer, [1, 2, 3, 4, 5]);

const stackContainer = new StackContainer<string>();
processContainer(stackContainer, ['a', 'b', 'c']);
```

### Example 6: Function Polymorphism

```typescript
// Function Overloading (TypeScript)
function process(value: string): string;
function process(value: number): number;
function process(value: boolean): boolean;
function process(value: string | number | boolean): string | number | boolean {
  if (typeof value === 'string') {
    return value.toUpperCase();
  } else if (typeof value === 'number') {
    return value * 2;
  } else {
    return !value;
  }
}

// Usage
console.log(process('hello'));    // "HELLO"
console.log(process(5));          // 10
console.log(process(true));       // false

// Runtime Polymorphism with Functions
type Formatter = (value: any) => string;

const numberFormatter: Formatter = (value) => `$${value.toFixed(2)}`;
const dateFormatter: Formatter = (value) => value.toISOString();
const stringFormatter: Formatter = (value) => `"${value}"`;

function formatValue(formatter: Formatter, value: any): string {
  return formatter(value); // Polymorphic call
}

// Usage
console.log(formatValue(numberFormatter, 123.456)); // "$123.46"
console.log(formatValue(dateFormatter, new Date())); // "2025-12-31T..."
console.log(formatValue(stringFormatter, 'test')); // "\"test\""
```

---

## 🎯 Real-World Applications

### 1. UI Frameworks

```typescript
// React components - polymorphic rendering
interface Component {
  render(): JSX.Element;
}

class Button implements Component {
  render() {
    return <button>Click me</button>;
  }
}

class Input implements Component {
  render() {
    return <input type="text" />;
  }
}

// Render any component
function renderComponent(component: Component) {
  return component.render(); // Polymorphic
}
```

### 2. Collections and Iterators

```typescript
// Array, Set, Map all implement Iterable
const collections: Iterable<any>[] = [
  [1, 2, 3],
  new Set([4, 5, 6]),
  new Map([['a', 1], ['b', 2]])
];

collections.forEach(collection => {
  for (const item of collection) {
    // Polymorphic iteration
    console.log(item);
  }
});
```

### 3. Database Abstraction

```typescript
interface Database {
  connect(): void;
  query(sql: string): any[];
  disconnect(): void;
}

class MySQLDatabase implements Database { /* ... */ }
class PostgreSQLDatabase implements Database { /* ... */ }
class MongoDBDatabase implements Database { /* ... */ }

// Same interface, different implementations
function useDatabase(db: Database) {
  db.connect();
  const results = db.query('SELECT * FROM users');
  db.disconnect();
}
```

### 4. Plugin Systems

```typescript
interface Plugin {
  execute(): void;
}

class PluginA implements Plugin {
  execute() { console.log('Plugin A'); }
}

class PluginB implements Plugin {
  execute() { console.log('Plugin B'); }
}

// Load and execute any plugin
function loadPlugin(plugin: Plugin) {
  plugin.execute(); // Polymorphic
}
```

---

## ⚠️ Common Pitfalls and Best Practices

### Common Pitfalls

❌ **Violating Liskov Substitution Principle**
```typescript
// BAD: Subclass changes expected behavior
class Rectangle {
  setWidth(w: number) { this.width = w; }
  setHeight(h: number) { this.height = h; }
}

class Square extends Rectangle {
  setWidth(w: number) {
    this.width = w;
    this.height = w; // Unexpected behavior!
  }
}

// GOOD: Maintain substitutability
class Shape {
  abstract area(): number;
}
```

❌ **Tight Coupling to Concrete Classes**
```typescript
// BAD: Depends on concrete class
function process(dog: Dog) {
  dog.bark();
}

// GOOD: Depends on abstraction
function process(animal: Animal) {
  animal.makeSound(); // Polymorphic
}
```

❌ **Not Using Polymorphism When Appropriate**
```typescript
// BAD: Type checking instead of polymorphism
if (animal instanceof Dog) {
  animal.bark();
} else if (animal instanceof Cat) {
  animal.meow();
}

// GOOD: Use polymorphism
animal.makeSound(); // Each class implements differently
```

### Best Practices

✅ **Program to Interfaces, Not Implementations**
```typescript
// Depend on abstractions
function process(shape: Shape) { }
function process(animal: Animal) { }
```

✅ **Use Abstract Classes or Interfaces**
```typescript
// Define contracts
interface Drawable {
  draw(): void;
}
```

✅ **Favor Composition with Polymorphism**
```typescript
// Strategy pattern
class Context {
  constructor(private strategy: Strategy) {}
  execute() {
    this.strategy.execute(); // Polymorphic
  }
}
```

✅ **Follow Liskov Substitution Principle**
```typescript
// Subtypes must be substitutable
class Base { }
class Derived extends Base {
  // Must honor base contract
}
```

✅ **Use Type Guards When Necessary**
```typescript
// Type narrowing for specific cases
function process(animal: Animal) {
  if (animal instanceof Dog) {
    // Dog-specific operations
  }
  animal.makeSound(); // Still polymorphic
}
```

---

## 🔀 Polymorphism vs Other Concepts

### Polymorphism vs Inheritance

**Inheritance:**
- "Is-a" relationship
- Code reuse mechanism
- Enables polymorphism

**Polymorphism:**
- "Behaves-like" relationship
- Interface-based
- Can work without inheritance (composition)

### Polymorphism vs Abstraction

**Abstraction:**
- Hides implementation details
- Defines what, not how
- Foundation for polymorphism

**Polymorphism:**
- Uses abstraction
- Multiple implementations
- Runtime behavior selection

### Polymorphism vs Encapsulation

**Encapsulation:**
- Data hiding
- Access control
- Protects internal state

**Polymorphism:**
- Behavior variation
- Interface-based
- Works with encapsulation

---

## 🚀 Advanced Topics

### 1. Ad-Hoc Polymorphism (Function Overloading)

```typescript
// TypeScript function overloading
function add(a: number, b: number): number;
function add(a: string, b: string): string;
function add(a: any, b: any): any {
  return a + b;
}
```

### 2. Parametric Polymorphism (Generics)

```typescript
// Generic function
function identity<T>(value: T): T {
  return value;
}

// Works with any type
identity(5);        // number
identity('hello');  // string
identity(true);     // boolean
```

### 3. Subtype Polymorphism (Inheritance)

```typescript
// Base type
class Animal {
  makeSound(): void { }
}

// Subtypes
class Dog extends Animal {
  makeSound(): void { console.log('Woof'); }
}

class Cat extends Animal {
  makeSound(): void { console.log('Meow'); }
}

// Polymorphic usage
const animals: Animal[] = [new Dog(), new Cat()];
animals.forEach(a => a.makeSound()); // Different behavior
```

---

## 📚 Summary

### Key Takeaways

1. **Polymorphism** = "Many Forms" - Same interface, different implementations
2. **Types**: Compile-time (overloading) and Runtime (overriding)
3. **Benefits**: Flexibility, extensibility, code reuse, maintainability
4. **Foundation**: Abstraction and inheritance enable polymorphism
5. **Principle**: Program to interfaces, not implementations

### When to Use

✅ Use when:
- You have multiple types with common interface
- You want to write generic code
- You need runtime behavior selection
- You want to extend functionality easily
- You need to reduce coupling

❌ Don't use when:
- Types are completely unrelated
- Performance is critical (polymorphism has slight overhead)
- Simple cases where direct calls are clearer
- Over-engineering simple problems

### Benefits

- **Flexibility**: Easy to add new types
- **Extensibility**: Open/Closed Principle
- **Maintainability**: Changes isolated to implementations
- **Testability**: Easy to mock and test
- **Code Reuse**: Generic algorithms work with multiple types

### Related Concepts

- **Inheritance**: Enables polymorphism through "is-a" relationships
- **Abstraction**: Foundation for polymorphic interfaces
- **Encapsulation**: Works together with polymorphism
- **Liskov Substitution**: Principle for correct polymorphism

---

## 🔗 Related Patterns

- **Strategy Pattern**: Uses polymorphism for algorithm selection
- **Template Method**: Polymorphic hook methods
- **Factory Pattern**: Returns polymorphic objects
- **Observer Pattern**: Polymorphic notification handlers

---

## 📖 References

- **Object-Oriented Programming**: Core OOP concept
- **Design Patterns**: Many patterns use polymorphism
- **SOLID Principles**: Liskov Substitution Principle
- **Type Systems**: Static vs dynamic typing


