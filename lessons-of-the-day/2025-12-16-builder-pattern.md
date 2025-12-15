# Builder Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Builder pattern definition and intent
- [ ] Learn when to use Builder vs Factory/Abstract Factory
- [ ] Master multiple implementation approaches (fluent, step-wise, director)
- [ ] Recognize real-world applications
- [ ] Handle immutable and mutable builds safely
- [ ] Practice implementing Builder in different scenarios
- [ ] Learn common pitfalls and best practices

---

## 🎯 Definition

**Builder Pattern** is a creational design pattern that separates the construction of a complex object from its representation, allowing the same construction process to create different representations.

**Intent (GoF):**
- Separate construction of complex objects from their representation
- Build objects step by step
- Use the same construction process to create different representations

**Key Principle:**
> "Separate how you build from what you build" - The builder encapsulates the step-by-step construction logic; the client (or director) controls the sequence.

---

## 🏗️ Structure

### UML Diagram Concept

```
Director
└── construct(builder): Product

Builder (Interface/Abstract)
├── reset(): void
├── setPartA(...): this
├── setPartB(...): this
├── getResult(): Product
│
ConcreteBuilderA implements Builder
└── builds ProductA

ConcreteBuilderB implements Builder
└── builds ProductB

Product
└── complex object with many parts
```

### Participants

1. **Builder** - Declares product construction steps
2. **ConcreteBuilder** - Implements steps to build and assemble parts
3. **Product** - The complex object being built
4. **Director (optional)** - Defines the order of building steps
5. **Client** - Configures builders/directors and obtains the product

---

## 💡 When to Use

### Use Builder When:

✅ **You need to create complex objects step by step**
- Example: Building an HTTP request with headers, query params, body, auth

✅ **You want different representations from the same construction process**
- Example: Build HTML, Markdown, or PDF from the same document structure

✅ **Object construction involves many optional parameters or combinations**
- Example: Creating configuration objects with many optional settings

✅ **You want to enforce construction order or validation**
- Example: Database queries where FROM must precede WHERE, which precedes ORDER BY

✅ **You want immutability after build**
- Example: Value objects created via builder, then frozen

### Don't Use When:

❌ **Object is simple** - Direct constructor or factory is enough
❌ **You only need one mandatory parameter** - Builder adds unnecessary complexity
❌ **You don't need step-wise construction** - Use Factory/Abstract Factory instead
❌ **You need to add new product families** - Consider Abstract Factory instead

---

## 🔨 Implementation Examples

### Example 1: Fluent Builder (JavaScript/TypeScript)

```javascript
class HttpRequest {
  constructor({ method, url, headers, query, body }) {
    this.method = method;
    this.url = url;
    this.headers = headers;
    this.query = query;
    this.body = body;
  }
}

class HttpRequestBuilder {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.method = 'GET';
    this.url = '';
    this.headers = {};
    this.query = {};
    this.body = null;
    return this;
  }
  
  setMethod(method) {
    this.method = method;
    return this;
  }
  
  setUrl(url) {
    this.url = url;
    return this;
  }
  
  addHeader(key, value) {
    this.headers[key] = value;
    return this;
  }
  
  addQuery(key, value) {
    this.query[key] = value;
    return this;
  }
  
  setBody(body) {
    this.body = body;
    return this;
  }
  
  build() {
    const request = new HttpRequest({
      method: this.method,
      url: this.url,
      headers: { ...this.headers },
      query: { ...this.query },
      body: this.body
    });
    return request;
  }
}

// Usage
const request = new HttpRequestBuilder()
  .setMethod('POST')
  .setUrl('/api/users')
  .addHeader('Content-Type', 'application/json')
  .addQuery('active', true)
  .setBody({ name: 'Alice' })
  .build();
```

### Example 2: Director with Multiple Builders (TypeScript)

```typescript
// Product
class House {
  floors = 0;
  rooms = 0;
  hasGarage = false;
  hasGarden = false;
  roofType = 'flat';
}

// Builder Interface
interface HouseBuilder {
  reset(): this;
  addFloors(count: number): this;
  addRooms(count: number): this;
  withGarage(): this;
  withGarden(): this;
  setRoof(type: string): this;
  getResult(): House;
}

// Concrete Builder
class SimpleHouseBuilder implements HouseBuilder {
  private house: House;
  constructor() { this.reset(); }
  reset() { this.house = new House(); return this; }
  addFloors(count: number) { this.house.floors += count; return this; }
  addRooms(count: number) { this.house.rooms += count; return this; }
  withGarage() { this.house.hasGarage = true; return this; }
  withGarden() { this.house.hasGarden = true; return this; }
  setRoof(type: string) { this.house.roofType = type; return this; }
  getResult() { return this.house; }
}

// Director
class HouseDirector {
  constructor(private builder: HouseBuilder) {}
  
  buildSimpleHouse() {
    return this.builder.reset()
      .addFloors(1)
      .addRooms(3)
      .setRoof('gable')
      .getResult();
  }
  
  buildLuxuryHouse() {
    return this.builder.reset()
      .addFloors(2)
      .addRooms(6)
      .withGarage()
      .withGarden()
      .setRoof('hip')
      .getResult();
  }
}

// Usage
const director = new HouseDirector(new SimpleHouseBuilder());
const simple = director.buildSimpleHouse();
const luxury = director.buildLuxuryHouse();
```

### Example 3: Builder in Python (Immutable Build)

```python
from dataclasses import dataclass, field
from typing import Dict, Any

@dataclass(frozen=True)
class UserProfile:
    username: str
    email: str
    settings: Dict[str, Any] = field(default_factory=dict)

class UserProfileBuilder:
    def __init__(self):
        self.reset()
    
    def reset(self):
        self._username = ''
        self._email = ''
        self._settings = {}
        return self
    
    def with_username(self, username: str):
        self._username = username
        return self
    
    def with_email(self, email: str):
        self._email = email
        return self
    
    def with_setting(self, key: str, value: Any):
        self._settings[key] = value
        return self
    
    def build(self) -> UserProfile:
        if not self._username or not self._email:
            raise ValueError("username and email are required")
        return UserProfile(
            username=self._username,
            email=self._email,
            settings=dict(self._settings)
        )

# Usage
profile = (UserProfileBuilder()
    .with_username('alice')
    .with_email('alice@example.com')
    .with_setting('theme', 'dark')
    .build())
```

### Example 4: Builder in Java (Nested Static Builder)

```java
public class Report {
    private final String title;
    private final String content;
    private final String author;
    private final boolean includeFooter;
    private final boolean includeTableOfContents;

    private Report(Builder builder) {
        this.title = builder.title;
        this.content = builder.content;
        this.author = builder.author;
        this.includeFooter = builder.includeFooter;
        this.includeTableOfContents = builder.includeTableOfContents;
    }

    public static class Builder {
        private String title;
        private String content;
        private String author;
        private boolean includeFooter;
        private boolean includeTableOfContents;

        public Builder title(String title) { this.title = title; return this; }
        public Builder content(String content) { this.content = content; return this; }
        public Builder author(String author) { this.author = author; return this; }
        public Builder includeFooter(boolean value) { this.includeFooter = value; return this; }
        public Builder includeTableOfContents(boolean value) { this.includeTableOfContents = value; return this; }

        public Report build() {
            if (title == null || content == null) {
                throw new IllegalStateException("title and content are required");
            }
            return new Report(this);
        }
    }
}

// Usage
Report report = new Report.Builder()
    .title("Q4 Summary")
    .content("...")
    .author("Alice")
    .includeFooter(true)
    .includeTableOfContents(true)
    .build();
```

### Example 5: Query Builder (JavaScript)

```javascript
class QueryBuilder {
  constructor() {
    this.reset();
  }
  reset() {
    this.table = null;
    this.fields = ['*'];
    this.conditions = [];
    this.order = null;
    this.limitCount = null;
    return this;
  }
  select(fields) {
    this.fields = Array.isArray(fields) ? fields : [fields];
    return this;
  }
  from(table) {
    this.table = table;
    return this;
  }
  where(condition) {
    this.conditions.push(condition);
    return this;
  }
  orderBy(field, direction = 'ASC') {
    this.order = { field, direction };
    return this;
  }
  limit(count) {
    this.limitCount = count;
    return this;
  }
  build() {
    if (!this.table) throw new Error('Table is required');
    const query = [];
    query.push(`SELECT ${this.fields.join(', ')}`);
    query.push(`FROM ${this.table}`);
    if (this.conditions.length) {
      query.push(`WHERE ${this.conditions.join(' AND ')}`);
    }
    if (this.order) {
      query.push(`ORDER BY ${this.order.field} ${this.order.direction}`);
    }
    if (this.limitCount !== null) {
      query.push(`LIMIT ${this.limitCount}`);
    }
    return query.join(' ');
  }
}

// Usage
const sql = new QueryBuilder()
  .select(['id', 'name'])
  .from('users')
  .where('active = true')
  .where('role = "admin"')
  .orderBy('created_at', 'DESC')
  .limit(10)
  .build();
```

### Example 6: Directorless Builder (Chaining Only)

```javascript
class Pizza {
  constructor({ size, toppings, crust, cheese }) {
    this.size = size;
    this.toppings = toppings;
    this.crust = crust;
    this.cheese = cheese;
  }
}

class PizzaBuilder {
  constructor() { this.reset(); }
  reset() {
    this.size = 'medium';
    this.toppings = [];
    this.crust = 'regular';
    this.cheese = 'mozzarella';
    return this;
  }
  setSize(size) { this.size = size; return this; }
  addTopping(t) { this.toppings.push(t); return this; }
  setCrust(c) { this.crust = c; return this; }
  setCheese(c) { this.cheese = c; return this; }
  build() { return new Pizza({ size: this.size, toppings: [...this.toppings], crust: this.crust, cheese: this.cheese }); }
}

// Usage
const pizza = new PizzaBuilder()
  .setSize('large')
  .addTopping('pepperoni')
  .addTopping('mushrooms')
  .setCrust('thin')
  .build();
```

---

## 🔄 Variations

### 1. Fluent Builder (method chaining)
- Methods return `this` for chainable steps.

### 2. Step Builder (enforced order)
- Each step returns a narrower interface so callers must follow sequence.

### 3. Director-based Builder
- Director orchestrates sequence; builder focuses on steps.

### 4. Immutable Builder
- Builder collects data; `build()` returns an immutable object.

### 5. Composite Builder
- Nested builders for subcomponents (e.g., car -> engine builder + interior builder).

### 6. Functional Builder
- Uses functions to accumulate changes; `build()` folds over functions.

---

## 🌍 Real-World Examples

### 1. UI Libraries
- Form builders (React Hook Form config objects)
- UI component builders (Material UI theme builders)

### 2. HTTP Clients
- Axios/Fetch request configs built via options objects
- Postman/Newman collections generated programmatically

### 3. ORMs / Query Builders
- Sequelize/TypeORM/Prisma query builders
- MongoDB aggregation builders

### 4. Logging and Monitoring
- Log entries built with metadata, context, tags

### 5. DevOps / IaC
- Terraform CDK/ Pulumi builders for resources
- Kubernetes manifests built via builders (client libraries)

### 6. Game Development
- Level builders composing terrain, NPCs, items

---

## 🔗 Related Patterns

### Builder vs Abstract Factory
- Builder: step-by-step construction; focuses on how.
- Abstract Factory: create families immediately; focuses on which family.

### Builder vs Factory Method
- Builder: many steps, optional params; returns final product after configuration.
- Factory Method: one method deciding which product to instantiate.

### Builder vs Prototype
- Builder: assemble new object via steps.
- Prototype: clone existing object then adjust.

### Builder vs Decorator
- Builder configures before creation; Decorator adds behavior after creation.

---

## ✅ Advantages

1. **Clarity** - Step-wise construction improves readability for complex objects
2. **Flexibility** - Different representations from the same process
3. **Immutability support** - Collect settings, then produce immutable result
4. **Validation** - Validate before build; enforce required fields
5. **Separation of concerns** - Building logic isolated from product usage
6. **Reusability** - Builders can be reused with different directors or configs

---

## ❌ Disadvantages

1. **Boilerplate** - Extra classes/interfaces increase code size
2. **Overkill for simple objects** - Adds complexity where not needed
3. **Coupling to sequence** - Incorrect step order can cause invalid builds (unless enforced)
4. **Stateful builders** - Need reset/clone to avoid leaking previous state
5. **Testing overhead** - More components to test (builder + director)

---

## 🎓 Best Practices

### 1. Validate Required Fields
```javascript
build() {
  if (!this.url) throw new Error('url is required');
  return new Request(...);
}
```

### 2. Provide Reset or Fresh Instances
```javascript
const builder = new UserBuilder();
const user1 = builder.withName('A').build();
builder.reset();
const user2 = builder.withName('B').build();
```

### 3. Keep Steps Cohesive
```javascript
// Good: steps relate to the product
setEngine(); setWheels(); setColor();

// Bad: unrelated steps
setEngine(); connectToDatabase(); // unrelated to car
```

### 4. Support Immutability When Useful
```javascript
const product = Object.freeze(builder.build());
```

### 5. Avoid Leaking Partially Built Objects
```javascript
// Don't expose internal state before build()
```

### 6. Consider Step Interfaces to Enforce Order
```typescript
interface Step1 { setUrl(url: string): Step2; }
interface Step2 { setMethod(m: string): Step3; }
interface Step3 { build(): Request; }
```

---

## 🚫 Common Pitfalls

### 1. Reusing Builder Without Reset
**Problem:** leftover state pollutes next build.
**Solution:** provide `reset()` or create new builder per build.

### 2. Skipping Validation
**Problem:** invalid objects created silently.
**Solution:** validate required fields in `build()`.

### 3. Mixing Concerns
**Problem:** builder writes to disk or calls network.
**Solution:** keep builder focused on object construction.

### 4. Overusing Builder for Simple Objects
**Problem:** unnecessary complexity.
**Solution:** use simple constructors/factories when possible.

### 5. Not Handling Optional vs Required Correctly
**Problem:** optional parameters treated as required or vice versa.
**Solution:** distinguish required fields; provide defaults.

---

## 📚 Practice Exercises

### Exercise 1: Email Builder
- Build emails with subject, recipients, cc/bcc, attachments, body (text/HTML).

### Exercise 2: Dashboard Widget Builder
- Build dashboard with multiple widgets, data sources, refresh intervals.

### Exercise 3: Cloud Resource Builder
- Build VM instances with CPU/RAM/storage/network/security groups.

---

## 🔍 Code Review Checklist

- [ ] Required fields validated in `build()`
- [ ] Builder state resets or is not reused incorrectly
- [ ] Steps are cohesive and focused on construction
- [ ] Optional parameters handled with sensible defaults
- [ ] No partial objects leaked before `build()`
- [ ] Director (if used) encapsulates ordering logic cleanly
- [ ] Immutability considered where appropriate
- [ ] Naming is descriptive (no `setA`, `setB`)
- [ ] Error handling is clear and consistent

---

## 📖 Further Reading

1. **Design Patterns: Elements of Reusable Object-Oriented Software (GoF)**
   - Chapter 3: Creational Patterns - Builder
2. **Refactoring Guru**
   - https://refactoring.guru/design-patterns/builder
3. **SourceMaking**
   - https://sourcemaking.com/design_patterns/builder
4. **Effective Java (Joshua Bloch)**
   - Item: Consider builders when faced with many constructor parameters

---

## 📝 Notes Section

_Add your notes, observations, and insights here as you learn..._

### Key Takeaways

- Builder separates construction from representation
- Great for complex objects with many optional parts
- Fluent chaining improves readability
- Validate required fields before building
- Reset builders to avoid state leaks

### Questions to Explore

- When should I prefer Builder over telescoping constructors?
- How can step builders enforce order without too much boilerplate?
- How to combine Builder with Prototype (clone then tweak)?
- How to integrate validation libraries into builders?

### Personal Examples

_Add your own code examples and use cases here..._

---

## 🎯 Summary

The **Builder Pattern** provides a flexible way to construct complex objects step by step:

- ✅ Separates construction from representation
- ✅ Handles many optional or ordered parameters cleanly
- ✅ Supports multiple representations from one process
- ✅ Enables validation before object creation
- ✅ Works well with fluent APIs and immutability

Use it when objects are complex or require staged construction; skip it for simple cases to avoid unnecessary complexity.

---

**Date Created:** 2025-12-16  
**Pattern Type:** Creational  
**Difficulty:** Intermediate  
**Related Patterns:** Abstract Factory, Factory Method, Prototype, Decorator
