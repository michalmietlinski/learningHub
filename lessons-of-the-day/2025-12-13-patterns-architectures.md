# Programming Patterns and Architectures

## 📋 TODO List

### Learning Objectives
- [ ] Understand fundamental design patterns
- [ ] Explore architectural patterns
- [ ] Learn when to apply different patterns
- [ ] Study pattern relationships and hierarchies
- [ ] Practice implementing patterns in code
- [ ] Analyze real-world pattern usage
- [ ] Compare pattern trade-offs

### Practical Tasks
- [ ] Implement at least 3 creational patterns
- [ ] Implement at least 3 structural patterns
- [ ] Implement at least 3 behavioral patterns
- [ ] Create examples of architectural patterns
- [ ] Build a small project using multiple patterns
- [ ] Refactor existing code using patterns
- [ ] Document pattern choices and rationale

### Research Tasks
- [ ] Study pattern catalogs (GoF, etc.)
- [ ] Research modern pattern variations
- [ ] Explore language-specific patterns
- [ ] Review anti-patterns to avoid
- [ ] Study pattern evolution over time

---

## 🌳 Information Tree Structure

```
Programming Patterns & Architectures
│
├── Design Patterns
│   │
│   ├── Creational Patterns
│   │   ├── Singleton
│   │   │   ├── Definition
│   │   │   ├── Use Cases
│   │   │   ├── Implementation
│   │   │   ├── Variations
│   │   │   └── Anti-patterns
│   │   │
│   │   ├── Factory Method
│   │   │   ├── Definition
│   │   │   ├── Use Cases
│   │   │   ├── Implementation
│   │   │   ├── Variations
│   │   │   └── Related Patterns
│   │   │
│   │   ├── Abstract Factory
│   │   │   ├── Definition
│   │   │   ├── Use Cases
│   │   │   ├── Implementation
│   │   │   └── vs Factory Method
│   │   │
│   │   ├── Builder
│   │   │   ├── Definition
│   │   │   ├── Use Cases
│   │   │   ├── Implementation
│   │   │   └── Fluent Interface
│   │   │
│   │   ├── Prototype
│   │   │   ├── Definition
│   │   │   ├── Use Cases
│   │   │   ├── Implementation
│   │   │   └── Deep vs Shallow Copy
│   │   │
│   │   └── Dependency Injection
│   │       ├── Definition
│   │       ├── Use Cases
│   │       ├── Implementation
│   │       └── IoC Containers
│   │
│   ├── Structural Patterns
│   │   ├── Adapter
│   │   │   ├── Definition
│   │   │   ├── Use Cases
│   │   │   ├── Implementation
│   │   │   └── Object vs Class Adapter
│   │   │
│   │   ├── Decorator
│   │   │   ├── Definition
│   │   │   ├── Use Cases
│   │   │   ├── Implementation
│   │   │   └── vs Inheritance
│   │   │
│   │   ├── Facade
│   │   │   ├── Definition
│   │   │   ├── Use Cases
│   │   │   ├── Implementation
│   │   │   └── Simplification Layer
│   │   │
│   │   ├── Proxy
│   │   │   ├── Definition
│   │   │   ├── Use Cases
│   │   │   ├── Implementation
│   │   │   └── Types (Virtual, Remote, Protection)
│   │   │
│   │   ├── Bridge
│   │   │   ├── Definition
│   │   │   ├── Use Cases
│   │   │   ├── Implementation
│   │   │   └── Decoupling Abstraction
│   │   │
│   │   ├── Composite
│   │   │   ├── Definition
│   │   │   ├── Use Cases
│   │   │   ├── Implementation
│   │   │   └── Tree Structures
│   │   │
│   │   └── Flyweight
│   │       ├── Definition
│   │       ├── Use Cases
│   │       ├── Implementation
│   │       └── Memory Optimization
│   │
│   └── Behavioral Patterns
│       ├── Observer
│       │   ├── Definition
│       │   ├── Use Cases
│       │   ├── Implementation
│       │   └── Pub/Sub Pattern
│       │
│       ├── Strategy
│       │   ├── Definition
│       │   ├── Use Cases
│       │   ├── Implementation
│       │   └── vs If/Else
│       │
│       ├── Command
│       │   ├── Definition
│       │   ├── Use Cases
│       │   ├── Implementation
│       │   └── Undo/Redo
│       │
│       ├── State
│       │   ├── Definition
│       │   ├── Use Cases
│       │   ├── Implementation
│       │   └── State Machines
│       │
│       ├── Chain of Responsibility
│       │   ├── Definition
│       │   ├── Use Cases
│       │   ├── Implementation
│       │   └── Middleware Pattern
│       │
│       ├── Iterator
│       │   ├── Definition
│       │   ├── Use Cases
│       │   ├── Implementation
│       │   └── Generators
│       │
│       ├── Mediator
│       │   ├── Definition
│       │   ├── Use Cases
│       │   ├── Implementation
│       │   └── vs Observer
│       │
│       ├── Memento
│       │   ├── Definition
│       │   ├── Use Cases
│       │   ├── Implementation
│       │   └── Snapshot Pattern
│       │
│       ├── Template Method
│       │   ├── Definition
│       │   ├── Use Cases
│       │   ├── Implementation
│       │   └── Hook Methods
│       │
│       ├── Visitor
│       │   ├── Definition
│       │   ├── Use Cases
│       │   ├── Implementation
│       │   └── Double Dispatch
│       │
│       └── Interpreter
│           ├── Definition
│           ├── Use Cases
│           ├── Implementation
│           └── DSL Creation
│
├── Architectural Patterns
│   │
│   ├── Layered Architecture
│   │   ├── Definition
│   │   ├── Layers (Presentation, Business, Data)
│   │   ├── Use Cases
│   │   ├── Implementation
│   │   └── Trade-offs
│   │
│   ├── MVC (Model-View-Controller)
│   │   ├── Definition
│   │   ├── Components
│   │   ├── Use Cases
│   │   ├── Implementation
│   │   └── Variations (MVP, MVVM)
│   │
│   ├── Microservices
│   │   ├── Definition
│   │   ├── Principles
│   │   ├── Use Cases
│   │   ├── Implementation
│   │   └── vs Monolith
│   │
│   ├── Event-Driven Architecture
│   │   ├── Definition
│   │   ├── Components
│   │   ├── Use Cases
│   │   ├── Implementation
│   │   └── Event Sourcing
│   │
│   ├── Hexagonal Architecture (Ports & Adapters)
│   │   ├── Definition
│   │   ├── Components
│   │   ├── Use Cases
│   │   ├── Implementation
│   │   └── Dependency Inversion
│   │
│   ├── Clean Architecture
│   │   ├── Definition
│   │   ├── Layers
│   │   ├── Use Cases
│   │   ├── Implementation
│   │   └── Dependency Rule
│   │
│   ├── CQRS (Command Query Responsibility Segregation)
│   │   ├── Definition
│   │   ├── Commands vs Queries
│   │   ├── Use Cases
│   │   ├── Implementation
│   │   └── Event Sourcing Integration
│   │
│   ├── Domain-Driven Design (DDD)
│   │   ├── Definition
│   │   ├── Bounded Contexts
│   │   ├── Entities & Value Objects
│   │   ├── Aggregates
│   │   ├── Repositories
│   │   └── Domain Services
│   │
│   └── Service-Oriented Architecture (SOA)
│       ├── Definition
│       ├── Principles
│       ├── Use Cases
│       ├── Implementation
│       └── vs Microservices
│
├── Functional Patterns
│   ├── Monad (covered in previous lesson)
│   ├── Functor
│   ├── Applicative
│   ├── Monoid
│   ├── Higher-Order Functions
│   ├── Currying & Partial Application
│   ├── Composition
│   └── Immutability Patterns
│
├── Concurrency Patterns
│   ├── Producer-Consumer
│   ├── Reader-Writer Lock
│   ├── Actor Model
│   ├── Promise/Future
│   ├── Async/Await
│   └── Reactive Streams
│
├── Integration Patterns
│   ├── API Gateway
│   ├── Service Mesh
│   ├── Message Queue
│   ├── Circuit Breaker
│   ├── Retry Pattern
│   └── Bulkhead Pattern
│
└── Anti-Patterns
    ├── God Object
    ├── Spaghetti Code
    ├── Golden Hammer
    ├── Copy-Paste Programming
    ├── Premature Optimization
    ├── Cargo Cult Programming
    └── Magic Numbers/Strings
```

---

## 📚 Detailed Pattern Catalog

### Creational Patterns

#### 1. Singleton Pattern

**Definition:** Ensures a class has only one instance and provides global access to it.

**Use Cases:**
- Database connections
- Logger instances
- Configuration managers
- Cache managers

**Implementation Example:**
```javascript
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    Singleton.instance = this;
    return this;
  }
  
  static getInstance() {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton();
    }
    return Singleton.instance;
  }
}
```

**Variations:**
- Lazy initialization
- Thread-safe singleton
- Enum singleton (Java)

**Anti-patterns:**
- Overuse (not everything needs to be singleton)
- Global state issues
- Testing difficulties

---

#### 2. Factory Method Pattern

**Definition:** Provides an interface for creating objects, but lets subclasses decide which class to instantiate.

**Use Cases:**
- When exact type of object is unknown at compile time
- When you want to localize object creation logic
- When creating objects is complex

**Implementation Example:**
```javascript
// Product interface
class Product {
  use() {
    throw new Error('Must implement use()');
  }
}

// Concrete products
class ConcreteProductA extends Product {
  use() {
    return 'Using Product A';
  }
}

class ConcreteProductB extends Product {
  use() {
    return 'Using Product B';
  }
}

// Creator
class Creator {
  factoryMethod() {
    throw new Error('Must implement factoryMethod()');
  }
  
  someOperation() {
    const product = this.factoryMethod();
    return product.use();
  }
}

// Concrete creators
class ConcreteCreatorA extends Creator {
  factoryMethod() {
    return new ConcreteProductA();
  }
}

class ConcreteCreatorB extends Creator {
  factoryMethod() {
    return new ConcreteProductB();
  }
}
```

---

#### 3. Abstract Factory Pattern

**Definition:** Provides an interface for creating families of related objects without specifying their concrete classes.

**Use Cases:**
- UI component libraries
- Cross-platform applications
- Theming systems

**Implementation Example:**
```javascript
// Abstract factory
class UIFactory {
  createButton() {
    throw new Error('Must implement createButton()');
  }
  
  createDialog() {
    throw new Error('Must implement createDialog()');
  }
}

// Concrete factories
class WindowsUIFactory extends UIFactory {
  createButton() {
    return new WindowsButton();
  }
  
  createDialog() {
    return new WindowsDialog();
  }
}

class MacUIFactory extends UIFactory {
  createButton() {
    return new MacButton();
  }
  
  createDialog() {
    return new MacDialog();
  }
}
```

---

#### 4. Builder Pattern

**Definition:** Constructs complex objects step by step, allowing different representations.

**Use Cases:**
- Complex object construction
- Immutable object creation
- Fluent APIs

**Implementation Example:**
```javascript
class Pizza {
  constructor(builder) {
    this.size = builder.size;
    this.cheese = builder.cheese;
    this.pepperoni = builder.pepperoni;
    this.bacon = builder.bacon;
  }
}

class PizzaBuilder {
  constructor(size) {
    this.size = size;
    this.cheese = false;
    this.pepperoni = false;
    this.bacon = false;
  }
  
  addCheese() {
    this.cheese = true;
    return this;
  }
  
  addPepperoni() {
    this.pepperoni = true;
    return this;
  }
  
  addBacon() {
    this.bacon = true;
    return this;
  }
  
  build() {
    return new Pizza(this);
  }
}

// Usage
const pizza = new PizzaBuilder('large')
  .addCheese()
  .addPepperoni()
  .addBacon()
  .build();
```

---

#### 5. Prototype Pattern

**Definition:** Creates new objects by copying an existing object (prototype).

**Use Cases:**
- When object creation is expensive
- When you need similar objects with slight variations
- Configuration objects

**Implementation Example:**
```javascript
class Prototype {
  clone() {
    throw new Error('Must implement clone()');
  }
}

class ConcretePrototype extends Prototype {
  constructor(field) {
    super();
    this.field = field;
  }
  
  clone() {
    return Object.create(this);
    // Or deep clone: return JSON.parse(JSON.stringify(this));
  }
}
```

---

### Structural Patterns

#### 1. Adapter Pattern

**Definition:** Allows incompatible interfaces to work together by wrapping an object.

**Use Cases:**
- Integrating third-party libraries
- Legacy code integration
- API compatibility

**Implementation Example:**
```javascript
// Target interface
class Target {
  request() {
    return 'Target: default behavior';
  }
}

// Adaptee (incompatible interface)
class Adaptee {
  specificRequest() {
    return 'Adaptee: specific behavior';
  }
}

// Adapter
class Adapter extends Target {
  constructor(adaptee) {
    super();
    this.adaptee = adaptee;
  }
  
  request() {
    return `Adapter: ${this.adaptee.specificRequest()}`;
  }
}
```

---

#### 2. Decorator Pattern

**Definition:** Dynamically adds behavior to objects without altering their structure.

**Use Cases:**
- Adding features to objects at runtime
- Extending functionality without subclassing
- Middleware in web frameworks

**Implementation Example:**
```javascript
class Component {
  operation() {
    return 'Component';
  }
}

class Decorator extends Component {
  constructor(component) {
    super();
    this.component = component;
  }
  
  operation() {
    return this.component.operation();
  }
}

class ConcreteDecoratorA extends Decorator {
  operation() {
    return `ConcreteDecoratorA(${super.operation()})`;
  }
}

class ConcreteDecoratorB extends Decorator {
  operation() {
    return `ConcreteDecoratorB(${super.operation()})`;
  }
}
```

---

#### 3. Facade Pattern

**Definition:** Provides a simplified interface to a complex subsystem.

**Use Cases:**
- Simplifying complex APIs
- Hiding implementation details
- Creating convenience methods

**Implementation Example:**
```javascript
// Complex subsystem
class SubsystemA {
  operationA() {
    return 'SubsystemA: operation';
  }
}

class SubsystemB {
  operationB() {
    return 'SubsystemB: operation';
  }
}

// Facade
class Facade {
  constructor() {
    this.subsystemA = new SubsystemA();
    this.subsystemB = new SubsystemB();
  }
  
  simpleOperation() {
    return `${this.subsystemA.operationA()} and ${this.subsystemB.operationB()}`;
  }
}
```

---

#### 4. Proxy Pattern

**Definition:** Provides a surrogate or placeholder for another object to control access.

**Use Cases:**
- Lazy loading
- Access control
- Caching
- Remote proxies

**Implementation Example:**
```javascript
class Subject {
  request() {
    return 'Subject: handling request';
  }
}

class Proxy {
  constructor(subject) {
    this.subject = subject;
  }
  
  request() {
    if (this.checkAccess()) {
      const result = this.subject.request();
      this.logAccess();
      return result;
    }
    return 'Proxy: access denied';
  }
  
  checkAccess() {
    return true; // Access control logic
  }
  
  logAccess() {
    console.log('Proxy: logging access');
  }
}
```

---

### Behavioral Patterns

#### 1. Observer Pattern

**Definition:** Defines a one-to-many dependency between objects so that when one changes, all dependents are notified.

**Use Cases:**
- Event handling systems
- Model-View updates
- Pub/Sub systems

**Implementation Example:**
```javascript
class Subject {
  constructor() {
    this.observers = [];
  }
  
  attach(observer) {
    this.observers.push(observer);
  }
  
  detach(observer) {
    this.observers = this.observers.filter(o => o !== observer);
  }
  
  notify() {
    this.observers.forEach(observer => observer.update(this));
  }
}

class Observer {
  update(subject) {
    throw new Error('Must implement update()');
  }
}

class ConcreteObserver extends Observer {
  update(subject) {
    console.log('Observer notified:', subject);
  }
}
```

---

#### 2. Strategy Pattern

**Definition:** Defines a family of algorithms, encapsulates each one, and makes them interchangeable.

**Use Cases:**
- Sorting algorithms
- Payment methods
- Validation strategies

**Implementation Example:**
```javascript
class Strategy {
  execute(data) {
    throw new Error('Must implement execute()');
  }
}

class ConcreteStrategyA extends Strategy {
  execute(data) {
    return `Strategy A: ${data}`;
  }
}

class ConcreteStrategyB extends Strategy {
  execute(data) {
    return `Strategy B: ${data}`;
  }
}

class Context {
  constructor(strategy) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  
  executeStrategy(data) {
    return this.strategy.execute(data);
  }
}
```

---

#### 3. Command Pattern

**Definition:** Encapsulates a request as an object, allowing parameterization and queuing of requests.

**Use Cases:**
- Undo/redo functionality
- Macro recording
- Queue operations
- Remote procedure calls

**Implementation Example:**
```javascript
class Command {
  execute() {
    throw new Error('Must implement execute()');
  }
  
  undo() {
    throw new Error('Must implement undo()');
  }
}

class ConcreteCommand extends Command {
  constructor(receiver, value) {
    super();
    this.receiver = receiver;
    this.value = value;
    this.previousValue = null;
  }
  
  execute() {
    this.previousValue = this.receiver.getValue();
    this.receiver.setValue(this.value);
  }
  
  undo() {
    this.receiver.setValue(this.previousValue);
  }
}

class Invoker {
  constructor() {
    this.history = [];
  }
  
  executeCommand(command) {
    command.execute();
    this.history.push(command);
  }
  
  undo() {
    const command = this.history.pop();
    if (command) {
      command.undo();
    }
  }
}
```

---

## 🏗️ Architectural Patterns

### 1. Layered Architecture

**Definition:** Organizes code into horizontal layers, each with a specific responsibility.

**Layers:**
- **Presentation Layer:** UI, controllers, views
- **Business Layer:** Domain logic, services
- **Data Access Layer:** Database, repositories
- **Infrastructure Layer:** Cross-cutting concerns

**Use Cases:**
- Traditional web applications
- Enterprise applications
- CRUD applications

**Trade-offs:**
- ✅ Clear separation of concerns
- ✅ Easy to understand
- ❌ Can lead to anemic domain models
- ❌ Tight coupling between layers

---

### 2. MVC (Model-View-Controller)

**Definition:** Separates application into three interconnected components.

**Components:**
- **Model:** Data and business logic
- **View:** User interface
- **Controller:** Handles user input and coordinates

**Use Cases:**
- Web frameworks (Rails, Django)
- Desktop applications
- Mobile applications

**Variations:**
- **MVP (Model-View-Presenter):** View is passive
- **MVVM (Model-View-ViewModel):** Data binding focus

---

### 3. Microservices Architecture

**Definition:** Structures an application as a collection of loosely coupled services.

**Principles:**
- Single responsibility per service
- Independent deployment
- Technology diversity
- Fault isolation

**Use Cases:**
- Large-scale applications
- Cloud-native applications
- High scalability requirements

**Trade-offs:**
- ✅ Scalability
- ✅ Technology flexibility
- ❌ Increased complexity
- ❌ Network latency

---

### 4. Event-Driven Architecture

**Definition:** Uses events to trigger and communicate between services.

**Components:**
- Event producers
- Event consumers
- Event brokers
- Event stores

**Use Cases:**
- Real-time systems
- IoT applications
- Financial systems

**Patterns:**
- Event Sourcing
- CQRS integration
- Pub/Sub messaging

---

### 5. Hexagonal Architecture (Ports & Adapters)

**Definition:** Isolates the core business logic from external dependencies.

**Components:**
- **Core (Domain):** Business logic
- **Ports:** Interfaces
- **Adapters:** Implementations

**Use Cases:**
- Domain-driven design
- Testability requirements
- Multiple interfaces (web, CLI, API)

**Benefits:**
- Testability
- Independence from frameworks
- Flexibility

---

### 6. Clean Architecture

**Definition:** Organizes code in concentric circles with dependencies pointing inward.

**Layers (from outer to inner):**
1. Frameworks & Drivers
2. Interface Adapters
3. Use Cases
4. Entities

**Principles:**
- Dependency Rule: Dependencies point inward
- Independence: Business logic independent of frameworks
- Testability: Business logic testable without UI/DB

**Use Cases:**
- Long-term maintainability
- Complex business logic
- Multiple delivery mechanisms

---

## 🔗 Pattern Relationships

### Pattern Categories
- **Creational:** Object creation mechanisms
- **Structural:** Object composition
- **Behavioral:** Object interaction and responsibility

### Common Combinations
- **Factory + Strategy:** Creating strategy objects
- **Observer + Command:** Undo/redo with notifications
- **Decorator + Composite:** Building complex structures
- **Adapter + Facade:** Integrating legacy systems

### Pattern Evolution
- Patterns adapt to new languages and paradigms
- Functional patterns complement OOP patterns
- Modern frameworks incorporate patterns
- Patterns emerge from real-world problems

---

## 📖 Learning Resources

### Books
- Design Patterns: Elements of Reusable Object-Oriented Software (GoF)
- Patterns of Enterprise Application Architecture (Fowler)
- Clean Architecture (Martin)
- Domain-Driven Design (Evans)

### Online Resources
- Refactoring Guru
- SourceMaking
- Pattern catalogs
- Language-specific pattern guides

---

## 🎯 Next Steps

1. **Choose 3-5 patterns** to implement in detail
2. **Create code examples** for each chosen pattern
3. **Identify real-world usage** in popular frameworks
4. **Compare patterns** and their trade-offs
5. **Practice refactoring** existing code using patterns
6. **Build a small project** demonstrating multiple patterns

---

## 📝 Notes Section

_Add your notes, observations, and insights here as you learn..._

