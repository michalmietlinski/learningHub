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
