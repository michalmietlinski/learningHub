# Facade vs Decorator & Static vs Dynamic Expansion

## 📋 Learning Objectives

- [ ] Understand the relationship between Facade and Decorator patterns
- [ ] Learn why Facade can be seen as "opposite" to Decorator in terms of complexity
- [ ] Master the difference between static and dynamic feature expansion
- [ ] Understand when to use inheritance vs Decorator pattern
- [ ] Recognize the class explosion problem and how Decorator solves it
- [ ] Practice identifying which approach fits different scenarios

---

## 🎯 Core Questions

### Question 1: Is Facade the "Opposite" of Decorator?

**Short Answer:** Yes, in a way! They have opposite effects on complexity from the client's perspective.

---

## 🔄 Facade vs Decorator: The Complexity Perspective

### The "Opposite" Relationship

**Facade Pattern: Simplifies by Hiding**
- **Reduces** complexity from client's perspective
- Provides **one simple interface** to a complex subsystem
- **Hides** multiple objects/classes behind unified interface
- Makes things **easier** to use

**Decorator Pattern: Adds Layers of Behavior**
- **Increases** complexity by wrapping objects
- **Stacks** multiple decorators to add responsibilities
- **Increases** what client interacts with
- Adds functionality **dynamically**

### Visual Comparison

```
Facade Pattern:
Client → [Simple Facade Interface] → [Complex Subsystem: A, B, C, D, E]
         (one simple interface)      (many complex classes hidden)

Decorator Pattern:
Client → [Decorator3] → [Decorator2] → [Decorator1] → [Base Component]
         (adds feature)  (adds feature)  (adds feature)  (original)
         (layers stack up)
```

### Key Differences

| Aspect | Facade | Decorator |
|--------|--------|-----------|
| **Complexity Direction** | Reduces (hides) | Increases (adds layers) |
| **Interface** | One simple interface | Same interface, but wrapped |
| **Purpose** | Simplify subsystem access | Add behavior dynamically |
| **Client View** | Simpler | More complex (more layers) |
| **Focus** | Hiding complexity | Adding functionality |

### Code Example: Facade Simplifies

```typescript
// Complex Subsystem
class CPU {
  freeze() { console.log('CPU: Freezing...'); }
  jump(position: number) { console.log(`CPU: Jumping to ${position}`); }
  execute() { console.log('CPU: Executing...'); }
}

class Memory {
  load(position: number, data: string) {
    console.log(`Memory: Loading at ${position}`);
    return data;
  }
}

class HardDrive {
  read(lba: number, size: number) {
    console.log(`HardDrive: Reading ${size} bytes from LBA ${lba}`);
    return 'boot data';
  }
}

// ❌ Without Facade - Client sees complexity
class ClientWithoutFacade {
  startComputer() {
    const cpu = new CPU();
    const memory = new Memory();
    const hardDrive = new HardDrive();
    
    cpu.freeze();
    const bootData = hardDrive.read(0, 1024);
    memory.load(0, bootData);
    cpu.jump(0);
    cpu.execute();
    // Client needs to know about 3 classes and their interactions!
  }
}

// ✅ With Facade - Client sees simplicity
class ComputerFacade {
  private cpu = new CPU();
  private memory = new Memory();
  private hardDrive = new HardDrive();
  
  start() {
    this.cpu.freeze();
    const bootData = this.hardDrive.read(0, 1024);
    this.memory.load(0, bootData);
    this.cpu.jump(0);
    this.cpu.execute();
  }
}

class ClientWithFacade {
  startComputer() {
    const computer = new ComputerFacade();
    computer.start(); // Simple! One method call!
  }
}
```

### Code Example: Decorator Adds Complexity

```typescript
// Base Component
interface Coffee {
  getDescription(): string;
  getCost(): number;
}

class SimpleCoffee implements Coffee {
  getDescription(): string { return 'Simple coffee'; }
  getCost(): number { return 5; }
}

// Decorators add layers
class MilkDecorator implements Coffee {
  constructor(private coffee: Coffee) {}
  getDescription(): string { return this.coffee.getDescription() + ', milk'; }
  getCost(): number { return this.coffee.getCost() + 2; }
}

class SugarDecorator implements Coffee {
  constructor(private coffee: Coffee) {}
  getDescription(): string { return this.coffee.getDescription() + ', sugar'; }
  getCost(): number { return this.coffee.getCost() + 1; }
}

class WhipDecorator implements Coffee {
  constructor(private coffee: Coffee) {}
  getDescription(): string { return this.coffee.getDescription() + ', whip'; }
  getCost(): number { return this.coffee.getCost() + 3; }
}

// ❌ Without Decorator - Simple but limited
const simpleCoffee = new SimpleCoffee();
console.log(simpleCoffee.getCost()); // 5

// ✅ With Decorator - More complex but flexible
const fancyCoffee = new WhipDecorator(
  new SugarDecorator(
    new MilkDecorator(
      new SimpleCoffee()
    )
  )
);
console.log(fancyCoffee.getCost()); // 11
// Client sees: WhipDecorator → SugarDecorator → MilkDecorator → SimpleCoffee
// More complex structure, but flexible!
```

### The "Opposite" Insight

**Facade:** "Make this complex thing simple to use"
- Client perspective: **Simpler** (one interface instead of many)

**Decorator:** "Add features to this object dynamically"
- Client perspective: **More complex** (layers of wrappers)

They're not strict opposites (they solve different problems), but they have **opposite effects on perceived complexity**:
- **Facade reduces** complexity (hides it)
- **Decorator increases** complexity (adds layers)

---

## 🔨 Static vs Dynamic Feature Expansion

### Question 2: If Adding Features Not Dynamically, Would We Just Expand the Class?

**Short Answer:** Yes! You'd use inheritance or modify the class directly, but this leads to the **class explosion problem** that Decorator solves.

---

## 📊 Static Expansion (Inheritance) vs Dynamic Expansion (Decorator)

### The Problem with Static Expansion

When you add features **statically** (at compile-time), you typically:

1. **Modify the class directly** (violates Open/Closed Principle)
2. **Use inheritance** (leads to class explosion)

### Example: Coffee Shop - Static Approach

```typescript
// ❌ Static Expansion - Class Explosion Problem

// Base class
class Coffee {
  getCost(): number { return 5; }
  getDescription(): string { return 'Coffee'; }
}

// Need a new class for EACH feature combination
class CoffeeWithMilk extends Coffee {
  getCost(): number { return super.getCost() + 2; }
  getDescription(): string { return super.getDescription() + ', milk'; }
}

class CoffeeWithSugar extends Coffee {
  getCost(): number { return super.getCost() + 1; }
  getDescription(): string { return super.getDescription() + ', sugar'; }
}

class CoffeeWithWhip extends Coffee {
  getCost(): number { return super.getCost() + 3; }
  getDescription(): string { return super.getDescription() + ', whip'; }
}

// Now we need classes for combinations!
class CoffeeWithMilkAndSugar extends Coffee {
  getCost(): number { return super.getCost() + 2 + 1; }
  getDescription(): string { return super.getDescription() + ', milk, sugar'; }
}

class CoffeeWithMilkAndWhip extends Coffee {
  getCost(): number { return super.getCost() + 2 + 3; }
  getDescription(): string { return super.getDescription() + ', milk, whip'; }
}

class CoffeeWithSugarAndWhip extends Coffee {
  getCost(): number { return super.getCost() + 1 + 3; }
  getDescription(): string { return super.getDescription() + ', sugar, whip'; }
}

class CoffeeWithMilkAndSugarAndWhip extends Coffee {
  getCost(): number { return super.getCost() + 2 + 1 + 3; }
  getDescription(): string { return super.getDescription() + ', milk, sugar, whip'; }
}

// With 3 features: 2³ = 8 classes needed!
// With 5 features: 2⁵ = 32 classes needed!
// With 10 features: 2¹⁰ = 1,024 classes needed!
// This is EXPONENTIAL growth! 😱
```

### The Solution: Dynamic Expansion with Decorator

```typescript
// ✅ Dynamic Expansion - Flexible Composition

// Base component
interface Coffee {
  getCost(): number;
  getDescription(): string;
}

class SimpleCoffee implements Coffee {
  getCost(): number { return 5; }
  getDescription(): string { return 'Coffee'; }
}

// Decorators - one class per feature
class MilkDecorator implements Coffee {
  constructor(private coffee: Coffee) {}
  getCost(): number { return this.coffee.getCost() + 2; }
  getDescription(): string { return this.coffee.getDescription() + ', milk'; }
}

class SugarDecorator implements Coffee {
  constructor(private coffee: Coffee) {}
  getCost(): number { return this.coffee.getCost() + 1; }
  getDescription(): string { return this.coffee.getDescription() + ', sugar'; }
}

class WhipDecorator implements Coffee {
  constructor(private coffee: Coffee) {}
  getCost(): number { return this.coffee.getCost() + 3; }
  getDescription(): string { return this.coffee.getDescription() + ', whip'; }
}

// With 3 decorators, you can create ANY combination at runtime!
const coffee1 = new MilkDecorator(new SimpleCoffee());
const coffee2 = new SugarDecorator(new SimpleCoffee());
const coffee3 = new WhipDecorator(new SimpleCoffee());
const coffee4 = new SugarDecorator(new MilkDecorator(new SimpleCoffee()));
const coffee5 = new WhipDecorator(
  new SugarDecorator(
    new MilkDecorator(new SimpleCoffee())
  )
);
// No need for 8 separate classes!
// Just 3 decorators = infinite combinations!
```

### Comparison Table

| Aspect | Static Expansion (Inheritance) | Dynamic Expansion (Decorator) |
|--------|-------------------------------|-------------------------------|
| **When features added** | Compile-time | Runtime |
| **Flexibility** | Fixed combinations | Any combination |
| **Class count** | Exponential (2^n) | Linear (n decorators) |
| **Modification** | Need new class for each combo | Compose at runtime |
| **Example: 3 features** | 8 classes needed | 3 decorators needed |
| **Example: 5 features** | 32 classes needed | 5 decorators needed |
| **Example: 10 features** | 1,024 classes needed | 10 decorators needed |

### Real-World Example: Text Formatting

```typescript
// ❌ Static Expansion - 8 classes for 3 features

class Text {
  format(text: string): string { return text; }
}

class BoldText extends Text {
  format(text: string): string { return `<b>${text}</b>`; }
}

class ItalicText extends Text {
  format(text: string): string { return `<i>${text}</i>`; }
}

class UnderlineText extends Text {
  format(text: string): string { return `<u>${text}</u>`; }
}

class BoldItalicText extends Text {
  format(text: string): string { return `<i><b>${text}</b></i>`; }
}

class BoldUnderlineText extends Text {
  format(text: string): string { return `<u><b>${text}</b></u>`; }
}

class ItalicUnderlineText extends Text {
  format(text: string): string { return `<u><i>${text}</i></u>`; }
}

class BoldItalicUnderlineText extends Text {
  format(text: string): string { return `<u><i><b>${text}</b></i></u>`; }
}

// Need 8 classes just for 3 features!
```

```typescript
// ✅ Dynamic Expansion - 3 decorators, infinite combinations

interface TextFormatter {
  format(text: string): string;
}

class PlainText implements TextFormatter {
  format(text: string): string { return text; }
}

class BoldDecorator implements TextFormatter {
  constructor(private formatter: TextFormatter) {}
  format(text: string): string {
    return `<b>${this.formatter.format(text)}</b>`;
  }
}

class ItalicDecorator implements TextFormatter {
  constructor(private formatter: TextFormatter) {}
  format(text: string): string {
    return `<i>${this.formatter.format(text)}</i>`;
  }
}

class UnderlineDecorator implements TextFormatter {
  constructor(private formatter: TextFormatter) {}
  format(text: string): string {
    return `<u>${this.formatter.format(text)}</u>`;
  }
}

// Runtime composition - any combination!
const text1 = new BoldDecorator(new PlainText());
const text2 = new ItalicDecorator(new BoldDecorator(new PlainText()));
const text3 = new UnderlineDecorator(
  new ItalicDecorator(
    new BoldDecorator(new PlainText())
  )
);

// Only 3 decorators needed, not 8 classes!
```

### HTTP Client Example

```typescript
// ❌ Static Expansion - Class explosion

class HttpClient {
  async request(url: string): Promise<Response> { /* ... */ }
}

class LoggingHttpClient extends HttpClient {
  async request(url: string): Promise<Response> {
    console.log('Logging...');
    return super.request(url);
  }
}

class CachingHttpClient extends HttpClient {
  async request(url: string): Promise<Response> { /* ... */ }
}

class RetryHttpClient extends HttpClient {
  async request(url: string): Promise<Response> { /* ... */ }
}

// Need classes for combinations:
class LoggingCachingHttpClient extends HttpClient { /* ... */ }
class LoggingRetryHttpClient extends HttpClient { /* ... */ }
class CachingRetryHttpClient extends HttpClient { /* ... */ }
class LoggingCachingRetryHttpClient extends HttpClient { /* ... */ }
// 2³ = 8 classes for 3 features!
```

```typescript
// ✅ Dynamic Expansion - Flexible composition

interface HttpClient {
  request(url: string): Promise<Response>;
}

class BasicHttpClient implements HttpClient {
  async request(url: string): Promise<Response> { /* ... */ }
}

class LoggingDecorator implements HttpClient {
  constructor(private client: HttpClient) {}
  async request(url: string): Promise<Response> {
    console.log('Logging...');
    return this.client.request(url);
  }
}

class CachingDecorator implements HttpClient {
  constructor(private client: HttpClient) {}
  async request(url: string): Promise<Response> { /* ... */ }
}

class RetryDecorator implements HttpClient {
  constructor(private client: HttpClient) {}
  async request(url: string): Promise<Response> { /* ... */ }
}

// Compose at runtime - any combination!
const client1 = new LoggingDecorator(new BasicHttpClient());
const client2 = new CachingDecorator(
  new LoggingDecorator(new BasicHttpClient())
);
const client3 = new RetryDecorator(
  new CachingDecorator(
    new LoggingDecorator(new BasicHttpClient())
  )
);
// Only 3 decorators, not 8 classes!
```

---

## 🎯 When to Use Each Approach

### Use Static Expansion (Inheritance) When:

✅ **Features are core to the object** (not optional)
- Example: `Dog extends Animal` - being an animal is core, not optional

✅ **Combinations are fixed and known at compile-time**
- Example: `AdminUser extends User` - admin is a fixed role

✅ **You have very few features** (2-3 max)
- Example: `BasicButton`, `PrimaryButton`, `SecondaryButton`

✅ **Features are mutually exclusive**
- Example: `Circle`, `Square`, `Triangle` - can't be both

### Use Dynamic Expansion (Decorator) When:

✅ **Features are optional and combinable**
- Example: Text formatting (bold, italic, underline can combine)

✅ **You want to add/remove features at runtime**
- Example: HTTP client middleware (add logging, caching, retry as needed)

✅ **You have many features** (would cause class explosion)
- Example: UI component styling (border, shadow, padding, hover, etc.)

✅ **Features are independent and stackable**
- Example: Coffee add-ons (milk, sugar, whip are independent)

---

## 📊 Decision Tree

```
Do you need to add features to objects?
│
├─ Features are core/required?
│  └─ YES → Use INHERITANCE (static)
│
└─ Features are optional/combinable?
   │
   ├─ Few features (2-3)?
   │  └─ Can use INHERITANCE (manageable)
   │
   └─ Many features (4+)?
      └─ Use DECORATOR (dynamic) - avoids class explosion
```

---

## 🔍 Key Takeaways

### Facade vs Decorator

1. **Facade reduces complexity** - hides subsystem behind simple interface
2. **Decorator increases complexity** - adds layers of behavior
3. They're not strict opposites, but have **opposite effects on perceived complexity**
4. They solve different problems:
   - **Facade:** Simplify subsystem access
   - **Decorator:** Add behavior dynamically

### Static vs Dynamic Expansion

1. **Static expansion (inheritance)** leads to **class explosion** (exponential growth)
2. **Dynamic expansion (Decorator)** uses **linear growth** (n decorators)
3. **Decorator solves the class explosion problem** by allowing runtime composition
4. **Choose based on:**
   - Number of features
   - Whether features are optional/combinable
   - Whether you need runtime flexibility

### The Math

- **3 features with inheritance:** 2³ = **8 classes**
- **3 features with Decorator:** **3 decorators**
- **5 features with inheritance:** 2⁵ = **32 classes**
- **5 features with Decorator:** **5 decorators**
- **10 features with inheritance:** 2¹⁰ = **1,024 classes**
- **10 features with Decorator:** **10 decorators**

---

## 🧪 Practice Exercises

### Exercise 1: Identify the Pattern

For each scenario, identify whether to use Facade, Decorator, or Inheritance:

1. **Scenario:** You have a complex payment system with validation, fraud checking, gateway communication, and logging. You want to provide a simple `processPayment()` method.
   - **Answer:** Facade (simplifying complex subsystem)

2. **Scenario:** You want to add logging, caching, and retry logic to your HTTP client, and you might want different combinations in different parts of your app.
   - **Answer:** Decorator (adding optional, combinable features)

3. **Scenario:** You have a `Vehicle` class and need `Car` and `Truck` classes that are fundamentally different types.
   - **Answer:** Inheritance (core types, not optional features)

4. **Scenario:** You have a text editor and want to add bold, italic, underline, color, and size formatting that can be combined.
   - **Answer:** Decorator (optional, combinable features)

### Exercise 2: Refactor Static to Dynamic

Refactor this static inheritance approach to use Decorator:

```typescript
// Current (static) - refactor to Decorator
class Button { }
class BorderButton extends Button { }
class ShadowButton extends Button { }
class BorderShadowButton extends Button { }
class HoverButton extends Button { }
class BorderHoverButton extends Button { }
class ShadowHoverButton extends Button { }
class BorderShadowHoverButton extends Button { }
```

**Solution:**
```typescript
// Refactored (dynamic) - using Decorator
interface UIComponent {
  render(): string;
}

class Button implements UIComponent {
  render(): string { return '<button>Click</button>'; }
}

class BorderDecorator implements UIComponent {
  constructor(private component: UIComponent) {}
  render(): string {
    return `<div style="border: 1px solid">${this.component.render()}</div>`;
  }
}

class ShadowDecorator implements UIComponent {
  constructor(private component: UIComponent) {}
  render(): string {
    return `<div style="box-shadow: 0 2px 4px">${this.component.render()}</div>`;
  }
}

class HoverDecorator implements UIComponent {
  constructor(private component: UIComponent) {}
  render(): string {
    return `<div class="hover">${this.component.render()}</div>`;
  }
}

// Now compose at runtime - no need for 8 classes!
const button = new HoverDecorator(
  new ShadowDecorator(
    new BorderDecorator(new Button())
  )
);
```

---

## 📚 Related Patterns

### Facade and Decorator Together

You can use both patterns together:

```typescript
// Decorator adds features
class LoggingDecorator implements HttpClient {
  constructor(private client: HttpClient) {}
  async request(url: string) {
    console.log('Logging...');
    return this.client.request(url);
  }
}

// Facade simplifies complex subsystem
class PaymentFacade {
  private validator = new PaymentValidator();
  private gateway = new PaymentGateway();
  private logger = new Logger();
  
  // Simple interface to complex payment system
  async processPayment(amount: number) {
    this.validator.validate(amount);
    const result = await this.gateway.charge(amount);
    this.logger.log(result);
    return result;
  }
}

// Use Decorator to add features to Facade
const enhancedPayment = new LoggingDecorator(
  new PaymentFacade() as any // (would need proper typing)
);
```

---

## 🎓 Summary

### Facade vs Decorator

- **Facade:** Simplifies by hiding complexity (reduces client's view)
- **Decorator:** Adds layers of behavior (increases client's view)
- **Relationship:** Opposite effects on complexity, but solve different problems

### Static vs Dynamic Expansion

- **Static (Inheritance):** Compile-time, fixed combinations, exponential class growth
- **Dynamic (Decorator):** Runtime, flexible combinations, linear growth
- **Key Insight:** Decorator solves the class explosion problem

### Remember

1. **Facade** = "Make it simple" (hide complexity)
2. **Decorator** = "Add features dynamically" (add layers)
3. **Inheritance** = Good for core types, bad for optional features
4. **Decorator** = Good for optional features, avoids class explosion

---

**Date Created:** 2025-12-24  
**Pattern Type:** Structural Patterns Comparison & Design Principles  
**Difficulty:** Intermediate  
**Related Patterns:** Facade, Decorator, Inheritance, Composition

---

**Happy Learning! 🚀**










