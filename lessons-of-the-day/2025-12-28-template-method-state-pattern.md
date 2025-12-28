# Template Method and State Patterns - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Template Method pattern definition and intent
- [ ] Understand the State pattern definition and intent
- [ ] Learn when to use Template Method vs State vs other behavioral patterns
- [ ] Master the template method structure and hook methods
- [ ] Master state transitions and context-state relationship
- [ ] Recognize real-world applications (frameworks, state machines, workflows)
- [ ] Understand Template Method vs Strategy pattern differences
- [ ] Understand State vs Strategy pattern differences
- [ ] Practice implementing both patterns in different scenarios
- [ ] Learn common pitfalls and best practices
- [ ] Explore modern variations and functional approaches

---

## 🎯 Template Method Pattern - Definition

**Template Method Pattern** is a behavioral design pattern that defines the skeleton of an algorithm in a base class, allowing subclasses to override specific steps of the algorithm without changing its structure.

**Intent (GoF):**
- Define the skeleton of an algorithm in an operation
- Defer some steps to subclasses
- Template Method lets subclasses redefine certain steps of an algorithm without changing the algorithm's structure
- Also known as: **Template Pattern**

**Key Principle:**
> "Don't call us, we'll call you" (Hollywood Principle) - The template method pattern inverts the control flow: the base class controls the algorithm flow and calls hook methods that subclasses can override, rather than subclasses calling base class methods.

---

## 🎯 State Pattern - Definition

**State Pattern** is a behavioral design pattern that allows an object to alter its behavior when its internal state changes. The object will appear to change its class.

**Intent (GoF):**
- Allow an object to alter its behavior when its internal state changes
- Encapsulate state-specific behavior in separate classes
- Make state transitions explicit
- Also known as: **Objects for States**

**Key Principle:**
> "Encapsulate state-specific behavior" - The state pattern represents each state as a separate class, allowing the context to delegate state-specific behavior to the current state object, making state transitions and behavior changes explicit and maintainable.

---

## 🏗️ Template Method Pattern - Structure

### UML Diagram Concept

```
AbstractClass
├── templateMethod(): void
│   ├── step1()
│   ├── step2()
│   ├── step3()
│   └── step4()
├── step1(): void (concrete)
├── step2(): void (abstract/hook)
├── step3(): void (abstract/hook)
└── step4(): void (concrete)

ConcreteClassA extends AbstractClass
├── step2(): void (override)
└── step3(): void (override)

ConcreteClassB extends AbstractClass
├── step2(): void (override)
└── step3(): void (override)
```

### Participants

1. **AbstractClass** - Defines abstract primitive operations that concrete subclasses implement, and implements a template method that calls these operations
2. **ConcreteClass** - Implements the primitive operations to carry out subclass-specific steps of the algorithm

### Key Concepts

**Algorithm Skeleton:**
- Base class defines the algorithm structure
- Subclasses fill in specific steps
- Algorithm flow is controlled by base class

**Hook Methods:**
- Abstract methods that must be implemented
- Virtual methods with default implementations (optional hooks)
- Subclasses can override to customize behavior

**Inversion of Control:**
- Base class calls subclass methods
- Subclasses don't call base class algorithm
- Follows "Hollywood Principle"

**Code Reuse:**
- Common algorithm structure is reused
- Only varying parts are implemented in subclasses
- Reduces code duplication

**Open/Closed Principle:**
- Open for extension (new concrete classes)
- Closed for modification (template method structure)

---

## 🏗️ State Pattern - Structure

### UML Diagram Concept

```
Context
├── state: State
├── request(): void
│   └── state.handle()
└── changeState(state: State): void

State (Interface)
└── handle(context: Context): void

ConcreteStateA implements State
├── handle(context: Context): void
│   └── context.changeState(new ConcreteStateB())
└── doSomething(): void

ConcreteStateB implements State
├── handle(context: Context): void
│   └── context.changeState(new ConcreteStateC())
└── doSomething(): void

ConcreteStateC implements State
├── handle(context: Context): void
│   └── context.changeState(new ConcreteStateA())
└── doSomething(): void
```

### Participants

1. **Context** - Maintains an instance of a ConcreteState subclass that defines the current state
2. **State** - Defines an interface for encapsulating the behavior associated with a particular state
3. **ConcreteState** - Each subclass implements a behavior associated with a state of the Context

### Key Concepts

**State Encapsulation:**
- Each state is a separate class
- State-specific behavior is encapsulated
- Context delegates to current state

**State Transitions:**
- States can transition to other states
- Transitions are explicit and controlled
- State objects manage transitions

**Behavior Changes:**
- Object appears to change class
- Behavior changes with state
- No conditional logic needed

**State-Specific Data:**
- Each state can have its own data
- State objects can be stateless or stateful
- Context can share data with states

**Open/Closed Principle:**
- Open for extension (new states)
- Closed for modification (context doesn't change)

---

## 💡 Template Method Pattern - When to Use

### Use Template Method When:

✅ **You have an algorithm with invariant steps and variant steps**
- Example: Data processing pipeline with fixed structure but different implementations
- Example: Document generation with fixed format but different content sources

✅ **You want to avoid code duplication in subclasses**
- Example: Multiple classes implementing similar algorithms
- Example: Common workflow with different steps

✅ **You want to control the algorithm flow from a base class**
- Example: Framework that defines workflow, users implement hooks
- Example: Base class controls sequence, subclasses provide details

✅ **You have multiple classes with similar algorithms that differ in specific steps**
- Example: Different report generators with same structure
- Example: Different data exporters with same pipeline

✅ **You want to enforce a specific algorithm structure**
- Example: Ensuring all subclasses follow the same steps
- Example: Framework that requires specific implementation order

### Don't Use When:

❌ **Algorithm steps vary too much** - Consider Strategy pattern instead
❌ **You need runtime algorithm selection** - Strategy pattern is better
❌ **Subclasses need to change algorithm structure** - Breaks template method
❌ **Algorithm is simple and unlikely to change** - YAGNI principle applies
❌ **You need more flexibility than inheritance provides** - Consider composition

---

## 💡 State Pattern - When to Use

### Use State When:

✅ **An object's behavior depends on its state and it must change behavior at runtime**
- Example: Vending machine with different states (idle, selecting, dispensing)
- Example: Media player with states (playing, paused, stopped)

✅ **You have many conditional statements that depend on object state**
- Example: Large if/else chains checking state
- Example: Switch statements based on state

✅ **State-specific behavior is complex and should be encapsulated**
- Example: Complex state machines
- Example: Workflow engines

✅ **State transitions are well-defined**
- Example: Finite state machines
- Example: Game character states

✅ **You want to make state transitions explicit and maintainable**
- Example: Document workflow (draft → review → approved)
- Example: Order processing (pending → processing → shipped)

### Don't Use When:

❌ **State transitions are simple and few** - Simple conditional logic might suffice
❌ **State-specific behavior is minimal** - Overhead not worth it
❌ **States don't have distinct behaviors** - May not need separate classes
❌ **State transitions are unpredictable** - Hard to model with State pattern
❌ **You need to share state across many objects** - Consider other patterns

---

## 🔨 Template Method Pattern - Implementation Examples

### Example 1: Basic Template Method (Data Processing)

```typescript
// Abstract Template Class
abstract class DataProcessor {
  // Template Method - defines the algorithm skeleton
  process(data: string): string {
    const validated = this.validate(data);
    const transformed = this.transform(validated);
    const formatted = this.format(transformed);
    return this.save(formatted);
  }

  // Concrete step - same for all subclasses
  protected validate(data: string): string {
    if (!data || data.trim().length === 0) {
      throw new Error('Data cannot be empty');
    }
    console.log('Validating data...');
    return data.trim();
  }

  // Abstract step - must be implemented by subclasses
  protected abstract transform(data: string): string;

  // Hook method - optional override
  protected format(data: string): string {
    return data; // Default implementation
  }

  // Concrete step - same for all subclasses
  protected save(data: string): string {
    console.log(`Saving: ${data}`);
    return data;
  }
}

// Concrete Implementation 1
class JSONProcessor extends DataProcessor {
  protected transform(data: string): string {
    console.log('Transforming to JSON format...');
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return JSON.stringify({ content: data });
    }
  }

  protected format(data: string): string {
    return `JSON:\n${data}`;
  }
}

// Concrete Implementation 2
class XMLProcessor extends DataProcessor {
  protected transform(data: string): string {
    console.log('Transforming to XML format...');
    return `<data>${data}</data>`;
  }

  protected format(data: string): string {
    return `<?xml version="1.0"?>\n${data}`;
  }
}

// Concrete Implementation 3
class CSVProcessor extends DataProcessor {
  protected transform(data: string): string {
    console.log('Transforming to CSV format...');
    const lines = data.split('\n');
    return lines.map(line => line.split(' ').join(',')).join('\n');
  }
}

// Usage
const jsonProcessor = new JSONProcessor();
const result1 = jsonProcessor.process('{"name": "John", "age": 30}');
console.log(result1);

const xmlProcessor = new XMLProcessor();
const result2 = xmlProcessor.process('Hello World');
console.log(result2);

const csvProcessor = new CSVProcessor();
const result3 = csvProcessor.process('John 30 Engineer\nJane 25 Designer');
console.log(result3);
```

### Example 2: Template Method with Hooks (Beverage Making)

```typescript
abstract class BeverageMaker {
  // Template Method
  makeBeverage(): string {
    const steps: string[] = [];
    
    steps.push(this.boilWater());
    steps.push(this.brew());
    steps.push(this.pourInCup());
    
    if (this.customerWantsCondiments()) {
      steps.push(this.addCondiments());
    }
    
    return steps.join(' → ');
  }

  protected boilWater(): string {
    return 'Boiling water';
  }

  protected abstract brew(): string;
  
  protected pourInCup(): string {
    return 'Pouring into cup';
  }

  protected abstract addCondiments(): string;

  // Hook method - subclasses can override
  protected customerWantsCondiments(): boolean {
    return true; // Default behavior
  }
}

class CoffeeMaker extends BeverageMaker {
  protected brew(): string {
    return 'Dripping coffee through filter';
  }

  protected addCondiments(): string {
    return 'Adding sugar and milk';
  }
}

class TeaMaker extends BeverageMaker {
  protected brew(): string {
    return 'Steeping the tea';
  }

  protected addCondiments(): string {
    return 'Adding lemon';
  }

  // Override hook to customize behavior
  protected customerWantsCondiments(): boolean {
    return false; // Tea without condiments
  }
}

// Usage
const coffee = new CoffeeMaker();
console.log(coffee.makeBeverage());
// Output: Boiling water → Dripping coffee through filter → Pouring into cup → Adding sugar and milk

const tea = new TeaMaker();
console.log(tea.makeBeverage());
// Output: Boiling water → Steeping the tea → Pouring into cup
```

### Example 3: Template Method in Framework (HTTP Request Handler)

```typescript
abstract class RequestHandler {
  // Template Method
  handle(request: Request): Response {
    this.logRequest(request);
    this.authenticate(request);
    this.authorize(request);
    const data = this.process(request);
    const response = this.createResponse(data);
    this.logResponse(response);
    return response;
  }

  protected logRequest(request: Request): void {
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.path}`);
  }

  protected authenticate(request: Request): void {
    if (!request.token) {
      throw new Error('Unauthorized');
    }
    console.log('Authenticating...');
  }

  protected abstract authorize(request: Request): void;
  protected abstract process(request: Request): any;

  protected createResponse(data: any): Response {
    return {
      status: 200,
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  protected logResponse(response: Response): void {
    console.log(`Response: ${response.status}`);
  }
}

class UserRequestHandler extends RequestHandler {
  protected authorize(request: Request): void {
    if (!request.user?.isAdmin) {
      throw new Error('Forbidden');
    }
    console.log('Authorizing admin access...');
  }

  protected process(request: Request): any {
    console.log('Processing user request...');
    return { users: ['John', 'Jane'] };
  }
}

class PublicRequestHandler extends RequestHandler {
  protected authorize(request: Request): void {
    console.log('Public endpoint - no authorization needed');
  }

  protected process(request: Request): any {
    console.log('Processing public request...');
    return { message: 'Hello World' };
  }
}

// Usage
const userHandler = new UserRequestHandler();
const publicHandler = new PublicRequestHandler();

interface Request {
  method: string;
  path: string;
  token?: string;
  user?: { isAdmin: boolean };
}

interface Response {
  status: number;
  body: string;
  headers: Record<string, string>;
}
```

---

## 🔨 State Pattern - Implementation Examples

### Example 1: Basic State Pattern (Media Player)

```typescript
// State Interface
interface PlayerState {
  play(context: MediaPlayer): void;
  pause(context: MediaPlayer): void;
  stop(context: MediaPlayer): void;
}

// Context
class MediaPlayer {
  private state: PlayerState;

  constructor() {
    this.state = new StoppedState();
  }

  setState(state: PlayerState): void {
    console.log(`State changed: ${this.state.constructor.name} → ${state.constructor.name}`);
    this.state = state;
  }

  play(): void {
    this.state.play(this);
  }

  pause(): void {
    this.state.pause(this);
  }

  stop(): void {
    this.state.stop(this);
  }

  getCurrentState(): string {
    return this.state.constructor.name;
  }
}

// Concrete States
class StoppedState implements PlayerState {
  play(context: MediaPlayer): void {
    console.log('Starting playback...');
    context.setState(new PlayingState());
  }

  pause(context: MediaPlayer): void {
    console.log('Cannot pause - player is stopped');
  }

  stop(context: MediaPlayer): void {
    console.log('Player is already stopped');
  }
}

class PlayingState implements PlayerState {
  play(context: MediaPlayer): void {
    console.log('Player is already playing');
  }

  pause(context: MediaPlayer): void {
    console.log('Pausing playback...');
    context.setState(new PausedState());
  }

  stop(context: MediaPlayer): void {
    console.log('Stopping playback...');
    context.setState(new StoppedState());
  }
}

class PausedState implements PlayerState {
  play(context: MediaPlayer): void {
    console.log('Resuming playback...');
    context.setState(new PlayingState());
  }

  pause(context: MediaPlayer): void {
    console.log('Player is already paused');
  }

  stop(context: MediaPlayer): void {
    console.log('Stopping from paused state...');
    context.setState(new StoppedState());
  }
}

// Usage
const player = new MediaPlayer();

player.play();   // Starting playback...
player.pause();  // Pausing playback...
player.play();   // Resuming playback...
player.stop();   // Stopping playback...
player.pause();  // Cannot pause - player is stopped
```

### Example 2: State Pattern with Context Data (Vending Machine)

```typescript
// State Interface
interface VendingMachineState {
  insertCoin(amount: number, machine: VendingMachine): void;
  selectProduct(productId: string, machine: VendingMachine): void;
  dispense(machine: VendingMachine): void;
  refund(machine: VendingMachine): void;
}

// Context
class VendingMachine {
  private state: VendingMachineState;
  private balance: number = 0;
  private selectedProduct: string | null = null;
  private products: Map<string, number> = new Map([
    ['soda', 1.50],
    ['chips', 1.00],
    ['candy', 0.75]
  ]);

  constructor() {
    this.state = new IdleState();
  }

  setState(state: VendingMachineState): void {
    this.state = state;
  }

  insertCoin(amount: number): void {
    this.state.insertCoin(amount, this);
  }

  selectProduct(productId: string): void {
    this.state.selectProduct(productId, this);
  }

  dispense(): void {
    this.state.dispense(this);
  }

  refund(): void {
    this.state.refund(this);
  }

  addBalance(amount: number): void {
    this.balance += amount;
    console.log(`Balance: $${this.balance.toFixed(2)}`);
  }

  getBalance(): number {
    return this.balance;
  }

  setSelectedProduct(productId: string): void {
    this.selectedProduct = productId;
  }

  getSelectedProduct(): string | null {
    return this.selectedProduct;
  }

  getProductPrice(productId: string): number | undefined {
    return this.products.get(productId);
  }

  deductBalance(amount: number): void {
    this.balance -= amount;
  }

  reset(): void {
    this.selectedProduct = null;
  }
}

// Concrete States
class IdleState implements VendingMachineState {
  insertCoin(amount: number, machine: VendingMachine): void {
    machine.addBalance(amount);
    machine.setState(new HasMoneyState());
  }

  selectProduct(productId: string, machine: VendingMachine): void {
    console.log('Please insert coins first');
  }

  dispense(machine: VendingMachine): void {
    console.log('Please insert coins and select a product');
  }

  refund(machine: VendingMachine): void {
    console.log('No money to refund');
  }
}

class HasMoneyState implements VendingMachineState {
  insertCoin(amount: number, machine: VendingMachine): void {
    machine.addBalance(amount);
  }

  selectProduct(productId: string, machine: VendingMachine): void {
    const price = machine.getProductPrice(productId);
    if (!price) {
      console.log('Product not found');
      return;
    }

    if (machine.getBalance() < price) {
      console.log(`Insufficient funds. Need $${price.toFixed(2)}, have $${machine.getBalance().toFixed(2)}`);
      return;
    }

    machine.setSelectedProduct(productId);
    machine.deductBalance(price);
    machine.setState(new DispensingState());
    machine.dispense();
  }

  dispense(machine: VendingMachine): void {
    console.log('Please select a product first');
  }

  refund(machine: VendingMachine): void {
    const refund = machine.getBalance();
    console.log(`Refunding $${refund.toFixed(2)}`);
    machine.deductBalance(refund);
    machine.setState(new IdleState());
  }
}

class DispensingState implements VendingMachineState {
  insertCoin(amount: number, machine: VendingMachine): void {
    console.log('Please wait, product is being dispensed');
  }

  selectProduct(productId: string, machine: VendingMachine): void {
    console.log('Please wait, product is being dispensed');
  }

  dispense(machine: VendingMachine): void {
    const product = machine.getSelectedProduct();
    if (product) {
      console.log(`Dispensing ${product}...`);
      console.log(`Change: $${machine.getBalance().toFixed(2)}`);
      machine.reset();
      machine.setState(new IdleState());
    }
  }

  refund(machine: VendingMachine): void {
    console.log('Cannot refund while dispensing');
  }
}

// Usage
const machine = new VendingMachine();

machine.insertCoin(2.00);        // Balance: $2.00
machine.selectProduct('soda');   // Dispensing soda... Change: $0.50

machine.insertCoin(1.00);        // Balance: $1.00
machine.selectProduct('chips');  // Dispensing chips... Change: $0.00

machine.insertCoin(0.50);        // Balance: $0.50
machine.selectProduct('candy');  // Insufficient funds. Need $0.75, have $0.50
machine.insertCoin(0.25);        // Balance: $0.75
machine.selectProduct('candy');  // Dispensing candy... Change: $0.00
```

### Example 3: State Pattern (Document Workflow)

```typescript
// State Interface
interface DocumentState {
  review(document: Document): void;
  approve(document: Document): void;
  reject(document: Document): void;
  publish(document: Document): void;
}

// Context
class Document {
  private state: DocumentState;
  private content: string;
  private reviewer: string | null = null;

  constructor(content: string) {
    this.content = content;
    this.state = new DraftState();
  }

  setState(state: DocumentState): void {
    this.state = state;
  }

  review(reviewer: string): void {
    this.reviewer = reviewer;
    this.state.review(this);
  }

  approve(): void {
    this.state.approve(this);
  }

  reject(): void {
    this.state.reject(this);
  }

  publish(): void {
    this.state.publish(this);
  }

  getState(): string {
    return this.state.constructor.name;
  }

  getContent(): string {
    return this.content;
  }

  getReviewer(): string | null {
    return this.reviewer;
  }
}

// Concrete States
class DraftState implements DocumentState {
  review(document: Document): void {
    console.log('Moving document to review...');
    document.setState(new ReviewState());
  }

  approve(document: Document): void {
    console.log('Cannot approve - document is in draft');
  }

  reject(document: Document): void {
    console.log('Cannot reject - document is in draft');
  }

  publish(document: Document): void {
    console.log('Cannot publish - document must be approved first');
  }
}

class ReviewState implements DocumentState {
  review(document: Document): void {
    console.log('Document is already in review');
  }

  approve(document: Document): void {
    console.log(`Document approved by ${document.getReviewer()}`);
    document.setState(new ApprovedState());
  }

  reject(document: Document): void {
    console.log(`Document rejected by ${document.getReviewer()}`);
    document.setState(new DraftState());
  }

  publish(document: Document): void {
    console.log('Cannot publish - document must be approved first');
  }
}

class ApprovedState implements DocumentState {
  review(document: Document): void {
    console.log('Document is already approved');
  }

  approve(document: Document): void {
    console.log('Document is already approved');
  }

  reject(document: Document): void {
    console.log('Cannot reject - document is already approved');
  }

  publish(document: Document): void {
    console.log('Publishing document...');
    console.log(`Published: ${document.getContent()}`);
    document.setState(new PublishedState());
  }
}

class PublishedState implements DocumentState {
  review(document: Document): void {
    console.log('Document is already published');
  }

  approve(document: Document): void {
    console.log('Document is already published');
  }

  reject(document: Document): void {
    console.log('Document is already published');
  }

  publish(document: Document): void {
    console.log('Document is already published');
  }
}

// Usage
const doc = new Document('My Document Content');

doc.review('John Doe');  // Moving document to review...
doc.approve();           // Document approved by John Doe
doc.publish();           // Publishing document... Published: My Document Content

const doc2 = new Document('Another Document');
doc2.review('Jane Smith'); // Moving document to review...
doc2.reject();             // Document rejected by Jane Smith
doc2.review('Bob Johnson'); // Moving document to review...
doc2.approve();            // Document approved by Bob Johnson
doc2.publish();            // Publishing document... Published: Another Document
```

---

## 🔄 Template Method vs State Pattern

### Key Differences

| Aspect | Template Method | State Pattern |
|-------|----------------|---------------|
| **Purpose** | Define algorithm skeleton, let subclasses fill steps | Change behavior based on internal state |
| **Structure** | Inheritance-based (abstract class) | Composition-based (state objects) |
| **Variation** | Algorithm steps vary | Behavior varies with state |
| **Control Flow** | Base class controls flow | State objects control behavior |
| **When to Use** | Fixed algorithm structure, varying implementations | Object behavior depends on state |
| **Flexibility** | Compile-time (inheritance) | Runtime (composition) |

### Template Method vs Strategy

**Template Method:**
- Uses inheritance
- Defines algorithm structure
- Subclasses implement specific steps
- Algorithm flow is fixed

**Strategy:**
- Uses composition
- Encapsulates entire algorithms
- Algorithms are interchangeable
- Algorithm selection at runtime

### State vs Strategy

**State:**
- Behavior changes with internal state
- States know about each other (transitions)
- Context delegates to current state
- State objects manage transitions

**Strategy:**
- Behavior selected externally
- Strategies are independent
- Context uses selected strategy
- Client selects strategy

---

## ⚠️ Common Pitfalls and Best Practices

### Template Method Pattern

#### Common Pitfalls

1. **Too Many Abstract Methods**
   - Having too many abstract methods makes the pattern hard to use
   - Prefer hook methods with default implementations

2. **Rigid Algorithm Structure**
   - If algorithm structure needs to change, all subclasses break
   - Ensure algorithm structure is stable

3. **Tight Coupling**
   - Subclasses are tightly coupled to base class
   - Changes to base class affect all subclasses

4. **Violating Liskov Substitution Principle**
   - Subclasses that don't properly implement template method
   - Ensure all subclasses can be used interchangeably

#### Best Practices

1. **Use Hook Methods Wisely**
   ```typescript
   abstract class Processor {
     process(): void {
       this.beforeProcess();
       this.doProcess();
       this.afterProcess();
     }
     
     // Hook with default implementation
     protected beforeProcess(): void {
       // Default: do nothing
     }
     
     protected abstract doProcess(): void;
     
     protected afterProcess(): void {
       // Default: do nothing
     }
   }
   ```

2. **Keep Template Method Simple**
   - Template method should be easy to understand
   - Complex logic should be in concrete methods

3. **Document Hook Methods**
   - Clearly document which methods are hooks
   - Explain when to override them

4. **Use Final for Template Method**
   - Prevent subclasses from overriding template method
   - Ensures algorithm structure is maintained

### State Pattern

#### Common Pitfalls

1. **State Objects Holding Context Reference**
   - Can create circular dependencies
   - Pass context as parameter instead

2. **Too Many State Transitions**
   - Complex state machines can be hard to maintain
   - Consider state machine libraries for complex cases

3. **State-Specific Data in Context**
   - Context can become bloated with state-specific data
   - Consider moving data to state objects

4. **Forgetting to Reset State**
   - Not resetting state can cause bugs
   - Ensure proper state cleanup

#### Best Practices

1. **Make States Stateless When Possible**
   ```typescript
   // Good: Stateless state (can be singleton)
   class IdleState implements State {
     handle(context: Context): void {
       context.setState(new ActiveState());
     }
   }
   
   // Only use stateful states when needed
   class ProcessingState implements State {
     private startTime: Date;
     
     constructor() {
       this.startTime = new Date();
     }
     
     handle(context: Context): void {
       // Use startTime
     }
   }
   ```

2. **Use State Factory for Complex Creation**
   ```typescript
   class StateFactory {
     createState(type: string, context: Context): State {
       switch (type) {
         case 'idle': return new IdleState();
         case 'active': return new ActiveState();
         default: throw new Error('Unknown state');
       }
     }
   }
   ```

3. **Document State Transitions**
   - Clearly document valid state transitions
   - Use state diagrams if helpful

4. **Handle Invalid Transitions**
   ```typescript
   class ApprovedState implements DocumentState {
     reject(document: Document): void {
       throw new Error('Cannot reject approved document');
       // Or: console.log('Invalid transition');
     }
   }
   ```

5. **Consider State Machine Libraries**
   - For complex state machines, consider libraries
   - XState (JavaScript), Stateless (C#), etc.

---

## 🧪 Testing Template Method Pattern

### Testing Abstract Class

```typescript
// Create a test concrete class
class TestProcessor extends DataProcessor {
  protected transform(data: string): string {
    return `transformed: ${data}`;
  }
}

describe('DataProcessor', () => {
  it('should follow template method structure', () => {
    const processor = new TestProcessor();
    const result = processor.process('test data');
    
    expect(result).toContain('transformed: test data');
  });

  it('should validate input', () => {
    const processor = new TestProcessor();
    
    expect(() => processor.process('')).toThrow('Data cannot be empty');
  });
});
```

### Testing Concrete Implementations

```typescript
describe('JSONProcessor', () => {
  it('should transform data to JSON', () => {
    const processor = new JSONProcessor();
    const result = processor.process('{"name": "John"}');
    
    expect(result).toContain('JSON:');
    expect(result).toContain('"name"');
  });
});
```

---

## 🧪 Testing State Pattern

### Testing State Transitions

```typescript
describe('MediaPlayer State Transitions', () => {
  it('should transition from stopped to playing', () => {
    const player = new MediaPlayer();
    
    player.play();
    expect(player.getCurrentState()).toBe('PlayingState');
  });

  it('should transition from playing to paused', () => {
    const player = new MediaPlayer();
    
    player.play();
    player.pause();
    expect(player.getCurrentState()).toBe('PausedState');
  });

  it('should not allow invalid transitions', () => {
    const player = new MediaPlayer();
    
    player.pause(); // Should not change state from stopped
    expect(player.getCurrentState()).toBe('StoppedState');
  });
});
```

### Testing State Behavior

```typescript
describe('VendingMachine States', () => {
  it('should allow coin insertion in idle state', () => {
    const machine = new VendingMachine();
    
    machine.insertCoin(1.00);
    expect(machine.getBalance()).toBe(1.00);
  });

  it('should require coins before product selection', () => {
    const machine = new VendingMachine();
    
    machine.selectProduct('soda');
    // Should not change state or dispense
    expect(machine.getCurrentState()).toBe('IdleState');
  });
});
```

---

## 📊 Advantages and Disadvantages

### Template Method Pattern

#### Advantages

✅ **Code Reuse**
- Common algorithm structure is reused
- Reduces code duplication

✅ **Inversion of Control**
- Base class controls algorithm flow
- Subclasses focus on specific steps

✅ **Enforces Structure**
- Ensures all subclasses follow same algorithm
- Prevents missing steps

✅ **Open/Closed Principle**
- Open for extension (new subclasses)
- Closed for modification (template method)

#### Disadvantages

❌ **Inheritance-Based**
- Tight coupling between base and subclasses
- Less flexible than composition

❌ **Rigid Structure**
- Algorithm structure is fixed
- Hard to change algorithm flow

❌ **Limited Flexibility**
- Can't change algorithm at runtime
- All variations must be known at compile time

### State Pattern

#### Advantages

✅ **Eliminates Conditional Logic**
- Replaces if/else chains with polymorphism
- Makes code more maintainable

✅ **Encapsulates State-Specific Behavior**
- Each state is a separate class
- Clear separation of concerns

✅ **Makes State Transitions Explicit**
- Easy to see valid transitions
- State objects manage transitions

✅ **Follows Open/Closed Principle**
- Open for extension (new states)
- Closed for modification (context)

✅ **Improves Testability**
- Each state can be tested independently
- Context can be tested with mock states

#### Disadvantages

❌ **Increased Number of Classes**
- Each state is a separate class
- Can lead to class explosion

❌ **State Objects Can Be Complex**
- State objects may need context reference
- Can create circular dependencies

❌ **Overhead for Simple Cases**
- May be overkill for simple state machines
- Simple conditionals might suffice

---

## 🔗 Related Patterns

### Template Method + Factory Method
Use Factory Method to create appropriate concrete classes.

```typescript
class ProcessorFactory {
  create(type: string): DataProcessor {
    switch (type) {
      case 'json': return new JSONProcessor();
      case 'xml': return new XMLProcessor();
      default: throw new Error('Unknown processor type');
    }
  }
}
```

### Template Method + Strategy
Template Method defines structure, Strategy provides algorithm variations.

### State + Strategy
State pattern can use Strategy pattern for state-specific algorithms.

### State + Singleton
State objects can be singletons if they're stateless.

```typescript
class IdleState implements State {
  private static instance: IdleState;
  
  static getInstance(): IdleState {
    if (!IdleState.instance) {
      IdleState.instance = new IdleState();
    }
    return IdleState.instance;
  }
}
```

### State + Flyweight
Use Flyweight pattern for stateless state objects to reduce memory.

---

## 🎓 Summary

### Template Method Pattern

The **Template Method Pattern** is a behavioral design pattern that:

1. **Defines algorithm skeleton** - Base class defines the algorithm structure
2. **Delegates steps to subclasses** - Subclasses implement specific steps
3. **Enforces structure** - All subclasses follow the same algorithm
4. **Promotes code reuse** - Common algorithm structure is reused
5. **Uses inversion of control** - Base class calls subclass methods

**Key Takeaways:**
- Use Template Method when you have a fixed algorithm structure with varying steps
- Prefer hook methods with default implementations over abstract methods
- Keep template method simple and easy to understand
- Document which methods are hooks and when to override them

**When to Use:**
- Fixed algorithm structure with varying implementations
- Want to avoid code duplication
- Need to enforce algorithm structure
- Framework development

**When NOT to Use:**
- Algorithm structure varies too much
- Need runtime algorithm selection
- Simple algorithms that won't change

### State Pattern

The **State Pattern** is a behavioral design pattern that:

1. **Encapsulates state-specific behavior** - Each state is a separate class
2. **Makes behavior depend on state** - Object behavior changes with state
3. **Makes transitions explicit** - State objects manage transitions
4. **Eliminates conditional logic** - Replaces if/else with polymorphism
5. **Follows Open/Closed Principle** - Open for extension, closed for modification

**Key Takeaways:**
- Use State when object behavior depends on its state
- Make states stateless when possible (can be singletons)
- Document valid state transitions
- Handle invalid transitions gracefully

**When to Use:**
- Object behavior depends on state
- Many conditional statements based on state
- Complex state machines
- Well-defined state transitions

**When NOT to Use:**
- Simple state transitions
- Minimal state-specific behavior
- Unpredictable state transitions

---

## 📚 Additional Resources

### Books
- **Design Patterns: Elements of Reusable Object-Oriented Software** (Gang of Four) - Original pattern descriptions
- **Head First Design Patterns** - Template Method and State patterns with practical examples
- **Refactoring: Improving the Design of Existing Code** (Martin Fowler) - Patterns in refactoring context

### Online Resources
- [Refactoring Guru - Template Method Pattern](https://refactoring.guru/design-patterns/template-method)
- [Refactoring Guru - State Pattern](https://refactoring.guru/design-patterns/state)
- [SourceMaking - Template Method Pattern](https://sourcemaking.com/design_patterns/template_method)
- [SourceMaking - State Pattern](https://sourcemaking.com/design_patterns/state)
- [Wikipedia - Template Method Pattern](https://en.wikipedia.org/wiki/Template_method_pattern)
- [Wikipedia - State Pattern](https://en.wikipedia.org/wiki/State_pattern)

### Related Topics
- Inversion of Control (IoC)
- Hollywood Principle
- Finite State Machines
- State Machine Libraries (XState, Stateless)
- Open/Closed Principle (SOLID)
- Composition over Inheritance
- Polymorphism

---

**Next Steps:**
- Practice implementing Template Method pattern in frameworks
- Practice implementing State pattern for state machines
- Look for conditional logic that could be replaced with State pattern
- Experiment with hook methods in Template Method
- Consider learning about Command Pattern (next behavioral pattern)

