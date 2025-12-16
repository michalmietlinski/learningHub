# Prototype Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Prototype pattern definition and intent
- [ ] Learn when to use Prototype vs Factory/Builder
- [ ] Master shallow vs deep copying concepts
- [ ] Implement prototype registry/manager
- [ ] Recognize real-world applications
- [ ] Handle cloning in different languages
- [ ] Practice implementing Prototype in different scenarios
- [ ] Learn common pitfalls and best practices

---

## 🎯 Definition

**Prototype Pattern** is a creational design pattern that lets you copy existing objects without making your code dependent on their classes.

**Intent (GoF):**
- Specify the kinds of objects to create using a prototypical instance
- Create new objects by copying this prototype
- Avoid subclasses of an object creator in the client application

**Key Principle:**
> "Clone instead of create" - Instead of creating objects from scratch, clone existing instances and customize them.

---

## 🏗️ Structure

### UML Diagram Concept

```
Prototype (Interface)
├── clone(): Prototype
│
ConcretePrototypeA implements Prototype
├── clone(): ConcretePrototypeA
└── field: type

ConcretePrototypeB implements Prototype
├── clone(): ConcretePrototypeB
└── field: type

Client
└── uses Prototype.clone()

PrototypeRegistry (Optional)
└── stores and retrieves prototypes
```

### Participants

1. **Prototype** - Declares the cloning interface
2. **ConcretePrototype** - Implements the cloning operation
3. **Client** - Creates new objects by asking prototypes to clone themselves
4. **PrototypeRegistry (optional)** - Stores frequently used prototypes

---

## 💡 When to Use

### Use Prototype When:

✅ **Object creation is expensive**
- Example: Database queries, network calls, complex calculations

✅ **You want to avoid subclassing**
- Example: Instead of creating subclasses, clone and modify prototypes

✅ **Objects have many possible configurations**
- Example: UI components with many style variations

✅ **You need to create objects at runtime**
- Example: Game objects that are created dynamically

✅ **You want to hide concrete classes from clients**
- Example: Framework code that creates objects without knowing their types

### Don't Use When:

❌ **Object creation is simple** - Direct instantiation is better
❌ **You need unique objects** - Prototype creates copies, not unique instances
❌ **Objects have circular references** - Can cause issues with deep copying
❌ **Cloning is complex or error-prone** - May be better to use Factory

---

## 🔨 Implementation Examples

### Example 1: Basic Prototype (JavaScript)

```javascript
// Prototype Interface
class Shape {
  clone() {
    throw new Error('Must implement clone()');
  }
  
  render() {
    throw new Error('Must implement render()');
  }
}

// Concrete Prototypes
class Circle extends Shape {
  constructor(radius, color) {
    super();
    this.radius = radius;
    this.color = color;
  }
  
  clone() {
    return new Circle(this.radius, this.color);
  }
  
  render() {
    return `Circle: radius=${this.radius}, color=${this.color}`;
  }
}

class Rectangle extends Shape {
  constructor(width, height, color) {
    super();
    this.width = width;
    this.height = height;
    this.color = color;
  }
  
  clone() {
    return new Rectangle(this.width, this.height, this.color);
  }
  
  render() {
    return `Rectangle: ${this.width}x${this.height}, color=${this.color}`;
  }
}

// Usage
const originalCircle = new Circle(10, 'red');
const clonedCircle = originalCircle.clone();
clonedCircle.radius = 20; // Modify clone

console.log(originalCircle.render()); // Circle: radius=10, color=red
console.log(clonedCircle.render());   // Circle: radius=20, color=red
```

### Example 2: Prototype with Deep Copy (JavaScript)

```javascript
class Address {
  constructor(street, city, country) {
    this.street = street;
    this.city = city;
    this.country = country;
  }
  
  clone() {
    return new Address(this.street, this.city, this.country);
  }
}

class Person {
  constructor(name, age, address) {
    this.name = name;
    this.age = age;
    this.address = address;
  }
  
  // Shallow copy (references shared)
  shallowClone() {
    return Object.assign({}, this);
  }
  
  // Deep copy (nested objects cloned)
  deepClone() {
    return new Person(
      this.name,
      this.age,
      this.address.clone()
    );
  }
  
  // Using JSON (simple but limited)
  jsonClone() {
    return JSON.parse(JSON.stringify(this));
  }
}

// Usage
const original = new Person(
  'Alice',
  30,
  new Address('123 Main St', 'New York', 'USA')
);

const shallow = original.shallowClone();
shallow.address.city = 'Boston'; // Affects original!

const deep = original.deepClone();
deep.address.city = 'Los Angeles'; // Doesn't affect original

console.log(original.address.city); // 'Boston' (affected by shallow copy)
console.log(deep.address.city);     // 'Los Angeles'
```

### Example 3: Prototype Registry (JavaScript)

```javascript
class PrototypeRegistry {
  constructor() {
    this.prototypes = new Map();
  }
  
  register(name, prototype) {
    this.prototypes.set(name, prototype);
  }
  
  unregister(name) {
    this.prototypes.delete(name);
  }
  
  get(name) {
    const prototype = this.prototypes.get(name);
    if (!prototype) {
      throw new Error(`Prototype '${name}' not found`);
    }
    return prototype.clone();
  }
  
  list() {
    return Array.from(this.prototypes.keys());
  }
}

// Usage
const registry = new PrototypeRegistry();

// Register prototypes
registry.register('small-red-circle', new Circle(5, 'red'));
registry.register('large-blue-circle', new Circle(20, 'blue'));
registry.register('small-rectangle', new Rectangle(10, 10, 'green'));

// Clone from registry
const circle1 = registry.get('small-red-circle');
const circle2 = registry.get('small-red-circle');
circle2.radius = 8; // Modify clone

console.log(circle1.render()); // Circle: radius=5, color=red
console.log(circle2.render()); // Circle: radius=8, color=red
```

### Example 4: Prototype in TypeScript

```typescript
// Prototype Interface
interface Cloneable<T> {
  clone(): T;
}

// Concrete Prototype
class Document implements Cloneable<Document> {
  private title: string;
  private content: string;
  private metadata: Map<string, string>;
  
  constructor(title: string, content: string) {
    this.title = title;
    this.content = content;
    this.metadata = new Map();
  }
  
  addMetadata(key: string, value: string): void {
    this.metadata.set(key, value);
  }
  
  clone(): Document {
    const cloned = new Document(this.title, this.content);
    // Deep copy metadata
    this.metadata.forEach((value, key) => {
      cloned.metadata.set(key, value);
    });
    return cloned;
  }
  
  getTitle(): string {
    return this.title;
  }
  
  setTitle(title: string): void {
    this.title = title;
  }
  
  getContent(): string {
    return this.content;
  }
  
  setContent(content: string): void {
    this.content = content;
  }
}

// Usage
const original = new Document('Report', 'Initial content');
original.addMetadata('author', 'Alice');
original.addMetadata('version', '1.0');

const cloned = original.clone();
cloned.setTitle('Report - Copy');
cloned.setContent('Modified content');

console.log(original.getTitle()); // 'Report'
console.log(cloned.getTitle());   // 'Report - Copy'
```

### Example 5: Prototype in Python

```python
from copy import deepcopy
from abc import ABC, abstractmethod
from typing import Dict, Any

# Prototype Interface
class Prototype(ABC):
    @abstractmethod
    def clone(self):
        pass

# Concrete Prototype
class Configuration(Prototype):
    def __init__(self, settings: Dict[str, Any]):
        self.settings = settings
    
    def clone(self):
        # Deep copy to avoid shared references
        return Configuration(deepcopy(self.settings))
    
    def get(self, key: str):
        return self.settings.get(key)
    
    def set(self, key: str, value: Any):
        self.settings[key] = value
    
    def __str__(self):
        return str(self.settings)

# Prototype Registry
class ConfigRegistry:
    def __init__(self):
        self._configs = {}
    
    def register(self, name: str, config: Configuration):
        self._configs[name] = config
    
    def get(self, name: str) -> Configuration:
        if name not in self._configs:
            raise ValueError(f"Config '{name}' not found")
        return self._configs[name].clone()

# Usage
default_config = Configuration({
    'host': 'localhost',
    'port': 8080,
    'debug': False
})

registry = ConfigRegistry()
registry.register('default', default_config)

# Clone and customize
dev_config = registry.get('default')
dev_config.set('debug', True)
dev_config.set('port', 3000)

print(default_config)  # {'host': 'localhost', 'port': 8080, 'debug': False}
print(dev_config)      # {'host': 'localhost', 'port': 3000, 'debug': True}
```

### Example 6: Prototype in Java

```java
// Prototype Interface
interface Cloneable {
    Cloneable clone();
}

// Concrete Prototype
class User implements Cloneable {
    private String name;
    private String email;
    private Address address;
    
    public User(String name, String email, Address address) {
        this.name = name;
        this.email = email;
        this.address = address;
    }
    
    // Copy constructor for deep cloning
    public User(User other) {
        this.name = other.name;
        this.email = other.email;
        this.address = new Address(other.address); // Deep copy
    }
    
    @Override
    public User clone() {
        return new User(this);
    }
    
    // Getters and setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Address getAddress() { return address; }
    public void setAddress(Address address) { this.address = address; }
}

class Address {
    private String street;
    private String city;
    
    public Address(String street, String city) {
        this.street = street;
        this.city = city;
    }
    
    // Copy constructor
    public Address(Address other) {
        this.street = other.street;
        this.city = other.city;
    }
    
    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
}

// Usage
Address address = new Address("123 Main St", "New York");
User original = new User("Alice", "alice@example.com", address);
User cloned = original.clone();

cloned.setName("Bob");
cloned.getAddress().setCity("Boston");

System.out.println(original.getName()); // Alice
System.out.println(original.getAddress().getCity()); // New York
System.out.println(cloned.getName()); // Bob
System.out.println(cloned.getAddress().getCity()); // Boston
```

### Example 7: Game Object Prototype System

```javascript
class GameObject {
  constructor(type, position, sprite) {
    this.type = type;
    this.position = { ...position };
    this.sprite = sprite;
    this.health = 100;
    this.active = true;
  }
  
  clone() {
    const cloned = new GameObject(
      this.type,
      { ...this.position },
      this.sprite
    );
    cloned.health = this.health;
    cloned.active = this.active;
    return cloned;
  }
  
  update() {
    // Game logic
  }
  
  render() {
    return `${this.type} at (${this.position.x}, ${this.position.y})`;
  }
}

class Enemy extends GameObject {
  constructor(position, sprite, difficulty) {
    super('enemy', position, sprite);
    this.difficulty = difficulty;
    this.speed = difficulty * 10;
  }
  
  clone() {
    const cloned = new Enemy(
      this.position,
      this.sprite,
      this.difficulty
    );
    cloned.health = this.health;
    cloned.active = this.active;
    cloned.speed = this.speed;
    return cloned;
  }
}

class GamePrototypeManager {
  constructor() {
    this.prototypes = new Map();
  }
  
  register(name, prototype) {
    this.prototypes.set(name, prototype);
  }
  
  spawn(name, position) {
    const prototype = this.prototypes.get(name);
    if (!prototype) {
      throw new Error(`Prototype '${name}' not found`);
    }
    const instance = prototype.clone();
    instance.position = { ...position };
    return instance;
  }
}

// Usage
const manager = new GamePrototypeManager();

// Register enemy prototypes
manager.register('basic-enemy', new Enemy(
  { x: 0, y: 0 },
  'enemy.png',
  1
));

manager.register('boss-enemy', new Enemy(
  { x: 0, y: 0 },
  'boss.png',
  5
));

// Spawn enemies at different positions
const enemy1 = manager.spawn('basic-enemy', { x: 100, y: 200 });
const enemy2 = manager.spawn('basic-enemy', { x: 300, y: 400 });
const boss = manager.spawn('boss-enemy', { x: 500, y: 500 });
```

### Example 8: UI Component Prototype System

```javascript
class UIComponent {
  constructor(type, styles, content) {
    this.type = type;
    this.styles = { ...styles };
    this.content = content;
    this.children = [];
  }
  
  clone() {
    const cloned = new UIComponent(
      this.type,
      { ...this.styles },
      this.content
    );
    // Deep clone children
    cloned.children = this.children.map(child => child.clone());
    return cloned;
  }
  
  addChild(child) {
    this.children.push(child);
  }
  
  applyStyles(newStyles) {
    this.styles = { ...this.styles, ...newStyles };
  }
  
  render() {
    return {
      type: this.type,
      styles: this.styles,
      content: this.content,
      children: this.children.map(c => c.render())
    };
  }
}

class ComponentLibrary {
  constructor() {
    this.components = new Map();
  }
  
  register(name, component) {
    this.components.set(name, component);
  }
  
  create(name, customizations = {}) {
    const prototype = this.components.get(name);
    if (!prototype) {
      throw new Error(`Component '${name}' not found`);
    }
    const instance = prototype.clone();
    Object.assign(instance, customizations);
    return instance;
  }
}

// Usage
const library = new ComponentLibrary();

// Register base components
library.register('button', new UIComponent(
  'button',
  { padding: '10px', backgroundColor: '#007bff', color: 'white' },
  'Click me'
));

library.register('card', new UIComponent(
  'div',
  { padding: '20px', border: '1px solid #ccc', borderRadius: '4px' },
  ''
));

// Create customized instances
const primaryButton = library.create('button', {
  styles: { backgroundColor: '#28a745' }
});

const secondaryButton = library.create('button', {
  styles: { backgroundColor: '#6c757d' },
  content: 'Cancel'
});
```

---

## 🔄 Variations

### 1. Shallow Copy vs Deep Copy

**Shallow Copy:**
- Copies object and its immediate properties
- Nested objects are shared (references copied)
- Faster but can cause side effects

```javascript
// Shallow copy
const shallow = Object.assign({}, original);
// or
const shallow = { ...original };
```

**Deep Copy:**
- Copies object and all nested objects recursively
- No shared references
- Slower but safer

```javascript
// Deep copy
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
}
```

### 2. Prototype with Copy Constructor

```javascript
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  // Copy constructor
  static from(other) {
    return new Point(other.x, other.y);
  }
  
  clone() {
    return Point.from(this);
  }
}
```

### 3. Prototype with Serialization

```javascript
class SerializablePrototype {
  clone() {
    // Serialize and deserialize for deep copy
    return JSON.parse(JSON.stringify(this));
  }
}
```

**Limitations:**
- Doesn't preserve functions
- Doesn't preserve undefined values
- Doesn't preserve Date objects correctly
- Doesn't handle circular references

### 4. Prototype with Object.create()

```javascript
class Prototype {
  clone() {
    // Creates new object with same prototype chain
    const cloned = Object.create(Object.getPrototypeOf(this));
    // Copy own properties
    Object.assign(cloned, this);
    return cloned;
  }
}
```

---

## 🌍 Real-World Examples

### 1. JavaScript Object Cloning

```javascript
// Object.assign() - shallow copy
const cloned = Object.assign({}, original);

// Spread operator - shallow copy
const cloned = { ...original };

// JSON methods - deep copy (with limitations)
const cloned = JSON.parse(JSON.stringify(original));

// Structured cloning (modern browsers)
const cloned = structuredClone(original);
```

### 2. React Component Cloning

```javascript
// React.cloneElement creates a clone of an element
const clonedElement = React.cloneElement(
  originalElement,
  { newProp: 'value' },
  children
);
```

### 3. DOM Element Cloning

```javascript
// cloneNode() method
const originalElement = document.getElementById('myElement');
const clonedElement = originalElement.cloneNode(true); // true = deep clone
```

### 4. Game Development

- Sprite/character templates cloned for instances
- Level templates cloned and customized
- Particle systems cloning base particles

### 5. Configuration Management

- Base configurations cloned and customized per environment
- Template configurations for different scenarios

### 6. Database ORMs

- Model instances cloned before modification
- Query result templates cloned

---

## 🔗 Related Patterns

### Prototype vs Factory Method

**Prototype:**
- Creates objects by cloning
- Avoids subclassing
- More flexible at runtime

**Factory Method:**
- Creates objects from scratch
- Uses inheritance
- Defined at compile time

### Prototype vs Abstract Factory

**Prototype:**
- Clones existing instances
- Single object creation
- Runtime flexibility

**Abstract Factory:**
- Creates families of objects
- Multiple related objects
- Compile-time structure

### Prototype vs Builder

**Prototype:**
- Clones and customizes
- Fast object creation
- Requires existing instance

**Builder:**
- Constructs step by step
- More control over construction
- No existing instance needed

### Prototype vs Singleton

**Prototype:**
- Creates multiple instances
- Cloning mechanism

**Singleton:**
- Ensures single instance
- No cloning (would break pattern)

Often used together: Singleton can provide prototype instances.

---

## ✅ Advantages

1. **Performance** - Cloning can be faster than creating from scratch
2. **Flexibility** - Add/remove prototypes at runtime
3. **Reduces subclassing** - No need for many subclasses
4. **Hides complexity** - Clients don't need to know concrete classes
5. **Dynamic configuration** - Prototypes can be configured at runtime
6. **Memory efficiency** - Share common state, clone only differences

---

## ❌ Disadvantages

1. **Cloning complexity** - Deep copying can be complex
2. **Circular references** - Can cause issues with deep copying
3. **Cloning overhead** - May be slower than direct instantiation for simple objects
4. **Type safety** - Cloning may lose type information in some languages
5. **Hidden dependencies** - Prototypes may have hidden state

---

## 🎓 Best Practices

### 1. Choose Shallow vs Deep Copy Carefully

```javascript
// Use shallow copy when nested objects are immutable
const cloned = { ...original };

// Use deep copy when nested objects are mutable
const cloned = deepClone(original);
```

### 2. Implement Proper Clone Methods

```javascript
class MyClass {
  clone() {
    const cloned = Object.create(Object.getPrototypeOf(this));
    // Copy all properties
    Object.assign(cloned, this);
    // Deep clone nested objects
    cloned.nested = this.nested.clone();
    return cloned;
  }
}
```

### 3. Use Prototype Registry for Common Cases

```javascript
class Registry {
  register(name, prototype) {
    this.prototypes.set(name, prototype);
  }
  
  get(name) {
    return this.prototypes.get(name).clone();
  }
}
```

### 4. Handle Circular References

```javascript
function deepClone(obj, visited = new WeakMap()) {
  if (visited.has(obj)) {
    return visited.get(obj);
  }
  
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  const cloned = Array.isArray(obj) ? [] : {};
  visited.set(obj, cloned);
  
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key], visited);
    }
  }
  
  return cloned;
}
```

### 5. Document Clone Behavior

```javascript
/**
 * Creates a deep clone of this object.
 * 
 * @returns {MyClass} A new instance with copied values
 * @note Nested objects are deeply cloned, not shared
 */
clone() {
  // Implementation
}
```

### 6. Consider Immutability

```javascript
// Return immutable clones
clone() {
  return Object.freeze(this.deepClone());
}
```

---

## 🚫 Common Pitfalls

### 1. Shallow Copy When Deep Copy Needed

**Problem:**
```javascript
const original = { nested: { value: 1 } };
const cloned = { ...original };
cloned.nested.value = 2; // Affects original!
```

**Solution:** Use deep copy for nested objects.

### 2. Forgetting to Clone Nested Objects

**Problem:**
```javascript
clone() {
  return {
    ...this,
    nested: this.nested // Shared reference!
  };
}
```

**Solution:** Clone nested objects recursively.

### 3. Circular References

**Problem:**
```javascript
const obj = { name: 'test' };
obj.self = obj; // Circular reference
const cloned = JSON.parse(JSON.stringify(obj)); // Error!
```

**Solution:** Use WeakMap to track visited objects.

### 4. Cloning Functions

**Problem:**
```javascript
const obj = { method: () => {} };
const cloned = JSON.parse(JSON.stringify(obj)); // method is lost!
```

**Solution:** Use proper cloning that handles functions.

### 5. Not Resetting Prototype State

**Problem:**
```javascript
class Prototype {
  constructor() {
    this.created = Date.now(); // Should be reset in clone
  }
  
  clone() {
    return { ...this }; // created timestamp is copied
  }
}
```

**Solution:** Reset or regenerate state-specific fields in clone.

---

## 📚 Practice Exercises

### Exercise 1: Document Template System

Create a document system where:
- Base document templates are stored as prototypes
- Users clone templates and customize them
- Support deep cloning of nested content

### Exercise 2: Game Character System

Create a character system where:
- Base character classes are prototypes
- Spawn characters by cloning prototypes
- Customize cloned characters with different stats

### Exercise 3: Configuration Builder

Create a configuration system where:
- Base configurations are prototypes
- Clone and customize for different environments
- Support nested configuration objects

---

## 🔍 Code Review Checklist

When reviewing Prototype implementations, check:

- [ ] Clone method properly implemented
- [ ] Shallow vs deep copy chosen appropriately
- [ ] Nested objects are properly cloned
- [ ] Circular references are handled
- [ ] Prototype state is reset if needed
- [ ] Clone doesn't share mutable references
- [ ] Registry (if used) properly manages prototypes
- [ ] Error handling for missing prototypes
- [ ] Documentation explains clone behavior
- [ ] Performance considerations addressed

---

## 📖 Further Reading

1. **Design Patterns: Elements of Reusable Object-Oriented Software (GoF)**
   - Chapter 3: Creational Patterns - Prototype

2. **Refactoring Guru**
   - https://refactoring.guru/design-patterns/prototype

3. **SourceMaking**
   - https://sourcemaking.com/design_patterns/prototype

4. **MDN Web Docs - structuredClone()**
   - https://developer.mozilla.org/en-US/docs/Web/API/structuredClone

---

## 📝 Notes Section

_Add your notes, observations, and insights here as you learn..._

### Key Takeaways

- Prototype creates objects by cloning existing instances
- Choose shallow vs deep copy based on needs
- Prototype registry manages common prototypes
- Cloning can be faster than creating from scratch
- Be careful with circular references and nested objects

### Questions to Explore

- When is cloning faster than construction?
- How do different languages handle cloning?
- How to handle cloning with inheritance?
- What are the performance implications of deep copying?
- How to implement prototype pattern with immutability?

### Personal Examples

_Add your own code examples and use cases here..._

---

## 🎯 Summary

The **Prototype Pattern** provides a flexible way to create objects by cloning:

- ✅ Avoids expensive object creation
- ✅ Reduces need for subclassing
- ✅ Enables runtime object configuration
- ✅ Hides concrete classes from clients
- ✅ Supports prototype registry for common cases

Remember: Choose shallow vs deep copy carefully, and handle circular references and nested objects properly!

---

**Date Created:** 2025-12-17  
**Pattern Type:** Creational  
**Difficulty:** Intermediate  
**Related Patterns:** Factory Method, Abstract Factory, Builder, Singleton
