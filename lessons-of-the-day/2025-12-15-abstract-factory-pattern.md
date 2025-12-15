# Abstract Factory Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Abstract Factory pattern definition and intent
- [ ] Learn when to use Abstract Factory vs Factory Method
- [ ] Master multiple implementation approaches
- [ ] Recognize real-world applications
- [ ] Understand how to create families of related objects
- [ ] Practice implementing Abstract Factory in different scenarios
- [ ] Learn common pitfalls and best practices

---

## 🎯 Definition

**Abstract Factory Pattern** is a creational design pattern that provides an interface for creating families of related or dependent objects without specifying their concrete classes.

**Intent (GoF):**
- Provide an interface for creating families of related or dependent objects without specifying their concrete classes
- Abstract Factory lets a client use an abstract interface to create a set of related products
- Also known as: **Kit Pattern**

**Key Principle:**
> "Create families of related objects together" - The factory creates multiple related products that work together.

---

## 🏗️ Structure

### UML Diagram Concept

```
AbstractFactory (Interface)
├── createProductA(): AbstractProductA
├── createProductB(): AbstractProductB
│
ConcreteFactory1 implements AbstractFactory
├── createProductA(): ConcreteProductA1
└── createProductB(): ConcreteProductB1

ConcreteFactory2 implements AbstractFactory
├── createProductA(): ConcreteProductA2
└── createProductB(): ConcreteProductB2

AbstractProductA (Interface)
│
ConcreteProductA1 implements AbstractProductA
ConcreteProductA2 implements AbstractProductA

AbstractProductB (Interface)
│
ConcreteProductB1 implements AbstractProductB
ConcreteProductB2 implements AbstractProductB

Client
└── uses AbstractFactory and AbstractProducts
```

### Participants

1. **AbstractFactory** - Declares a set of methods for creating abstract products
2. **ConcreteFactory** - Implements the operations to create concrete product objects
3. **AbstractProduct** - Declares an interface for a type of product object
4. **ConcreteProduct** - Defines a product object to be created by the corresponding concrete factory
5. **Client** - Uses only interfaces declared by AbstractFactory and AbstractProduct classes

---

## 💡 When to Use

### Use Abstract Factory When:

✅ **You need to create families of related or dependent products**
- Example: UI components (buttons, checkboxes, dialogs) for different operating systems

✅ **You want to provide a library of products and reveal only their interfaces, not implementations**
- Example: Cross-platform UI frameworks

✅ **You need to ensure products from one family are used together**
- Example: All UI components must be from the same theme (Windows, Mac, Linux)

✅ **You want to configure an application with one of multiple families of products**
- Example: Switching between different database providers (MySQL, PostgreSQL, MongoDB)

✅ **You want to hide implementation details of product families**
- Example: Client code doesn't need to know about concrete product classes

### Don't Use When:

❌ **You only need to create one type of product** - Use Factory Method instead
❌ **Products are not related** - If products don't form families, Abstract Factory is overkill
❌ **Simple object creation** - Direct instantiation is better for simple cases
❌ **You need runtime flexibility to add new product types** - Abstract Factory requires modifying the interface

---

## 🔨 Implementation Examples

### Example 1: Basic Abstract Factory (JavaScript/TypeScript)

```javascript
// Abstract Products
class Button {
  render() {
    throw new Error('Must implement render()');
  }
  
  onClick() {
    throw new Error('Must implement onClick()');
  }
}

class Checkbox {
  render() {
    throw new Error('Must implement render()');
  }
  
  toggle() {
    throw new Error('Must implement toggle()');
  }
}

// Concrete Products - Windows Family
class WindowsButton extends Button {
  render() {
    return 'Rendering Windows-style button';
  }
  
  onClick() {
    return 'Windows button clicked';
  }
}

class WindowsCheckbox extends Checkbox {
  render() {
    return 'Rendering Windows-style checkbox';
  }
  
  toggle() {
    return 'Windows checkbox toggled';
  }
}

// Concrete Products - Mac Family
class MacButton extends Button {
  render() {
    return 'Rendering Mac-style button';
  }
  
  onClick() {
    return 'Mac button clicked';
  }
}

class MacCheckbox extends Checkbox {
  render() {
    return 'Rendering Mac-style checkbox';
  }
  
  toggle() {
    return 'Mac checkbox toggled';
  }
}

// Abstract Factory
class GUIFactory {
  createButton() {
    throw new Error('Must implement createButton()');
  }
  
  createCheckbox() {
    throw new Error('Must implement createCheckbox()');
  }
}

// Concrete Factories
class WindowsFactory extends GUIFactory {
  createButton() {
    return new WindowsButton();
  }
  
  createCheckbox() {
    return new WindowsCheckbox();
  }
}

class MacFactory extends GUIFactory {
  createButton() {
    return new MacButton();
  }
  
  createCheckbox() {
    return new MacCheckbox();
  }
}

// Client Code
function createUI(factory) {
  const button = factory.createButton();
  const checkbox = factory.createCheckbox();
  
  console.log(button.render());
  console.log(checkbox.render());
  
  return { button, checkbox };
}

// Usage
const windowsUI = createUI(new WindowsFactory());
// Rendering Windows-style button
// Rendering Windows-style checkbox

const macUI = createUI(new MacFactory());
// Rendering Mac-style button
// Rendering Mac-style checkbox
```

### Example 2: Abstract Factory with TypeScript

```typescript
// Abstract Products
interface Button {
  render(): string;
  onClick(): string;
}

interface Checkbox {
  render(): string;
  toggle(): string;
}

interface Dialog {
  render(): string;
  show(): string;
}

// Windows Products
class WindowsButton implements Button {
  render() { return 'Windows Button'; }
  onClick() { return 'Windows button clicked'; }
}

class WindowsCheckbox implements Checkbox {
  render() { return 'Windows Checkbox'; }
  toggle() { return 'Windows checkbox toggled'; }
}

class WindowsDialog implements Dialog {
  render() { return 'Windows Dialog'; }
  show() { return 'Windows dialog shown'; }
}

// Mac Products
class MacButton implements Button {
  render() { return 'Mac Button'; }
  onClick() { return 'Mac button clicked'; }
}

class MacCheckbox implements Checkbox {
  render() { return 'Mac Checkbox'; }
  toggle() { return 'Mac checkbox toggled'; }
}

class MacDialog implements Dialog {
  render() { return 'Mac Dialog'; }
  show() { return 'Mac dialog shown'; }
}

// Abstract Factory
interface UIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
  createDialog(): Dialog;
}

// Concrete Factories
class WindowsUIFactory implements UIFactory {
  createButton(): Button {
    return new WindowsButton();
  }
  
  createCheckbox(): Checkbox {
    return new WindowsCheckbox();
  }
  
  createDialog(): Dialog {
    return new WindowsDialog();
  }
}

class MacUIFactory implements UIFactory {
  createButton(): Button {
    return new MacButton();
  }
  
  createCheckbox(): Checkbox {
    return new MacCheckbox();
  }
  
  createDialog(): Dialog {
    return new MacDialog();
  }
}

// Client
class Application {
  private factory: UIFactory;
  private button: Button;
  private checkbox: Checkbox;
  private dialog: Dialog;
  
  constructor(factory: UIFactory) {
    this.factory = factory;
    this.button = factory.createButton();
    this.checkbox = factory.createCheckbox();
    this.dialog = factory.createDialog();
  }
  
  render() {
    return [
      this.button.render(),
      this.checkbox.render(),
      this.dialog.render()
    ].join('\n');
  }
}

// Usage
const app1 = new Application(new WindowsUIFactory());
console.log(app1.render());

const app2 = new Application(new MacUIFactory());
console.log(app2.render());
```

### Example 3: Abstract Factory in Python

```python
from abc import ABC, abstractmethod

# Abstract Products
class Button(ABC):
    @abstractmethod
    def render(self) -> str:
        pass
    
    @abstractmethod
    def onClick(self) -> str:
        pass

class Checkbox(ABC):
    @abstractmethod
    def render(self) -> str:
        pass
    
    @abstractmethod
    def toggle(self) -> str:
        pass

# Windows Products
class WindowsButton(Button):
    def render(self) -> str:
        return "Rendering Windows button"
    
    def onClick(self) -> str:
        return "Windows button clicked"

class WindowsCheckbox(Checkbox):
    def render(self) -> str:
        return "Rendering Windows checkbox"
    
    def toggle(self) -> str:
        return "Windows checkbox toggled"

# Mac Products
class MacButton(Button):
    def render(self) -> str:
        return "Rendering Mac button"
    
    def onClick(self) -> str:
        return "Mac button clicked"

class MacCheckbox(Checkbox):
    def render(self) -> str:
        return "Rendering Mac checkbox"
    
    def toggle(self) -> str:
        return "Mac checkbox toggled"

# Abstract Factory
class GUIFactory(ABC):
    @abstractmethod
    def createButton(self) -> Button:
        pass
    
    @abstractmethod
    def createCheckbox(self) -> Checkbox:
        pass

# Concrete Factories
class WindowsFactory(GUIFactory):
    def createButton(self) -> Button:
        return WindowsButton()
    
    def createCheckbox(self) -> Checkbox:
        return WindowsCheckbox()

class MacFactory(GUIFactory):
    def createButton(self) -> Button:
        return MacButton()
    
    def createCheckbox(self) -> Checkbox:
        return MacCheckbox()

# Client
def client_code(factory: GUIFactory):
    button = factory.createButton()
    checkbox = factory.createCheckbox()
    
    print(button.render())
    print(checkbox.render())
    print(button.onClick())
    print(checkbox.toggle())

# Usage
if __name__ == "__main__":
    print("Windows UI:")
    client_code(WindowsFactory())
    
    print("\nMac UI:")
    client_code(MacFactory())
```

### Example 4: Abstract Factory in Java

```java
// Abstract Products
interface Button {
    void render();
    void onClick();
}

interface Checkbox {
    void render();
    void toggle();
}

// Windows Products
class WindowsButton implements Button {
    @Override
    public void render() {
        System.out.println("Rendering Windows button");
    }
    
    @Override
    public void onClick() {
        System.out.println("Windows button clicked");
    }
}

class WindowsCheckbox implements Checkbox {
    @Override
    public void render() {
        System.out.println("Rendering Windows checkbox");
    }
    
    @Override
    public void toggle() {
        System.out.println("Windows checkbox toggled");
    }
}

// Mac Products
class MacButton implements Button {
    @Override
    public void render() {
        System.out.println("Rendering Mac button");
    }
    
    @Override
    public void onClick() {
        System.out.println("Mac button clicked");
    }
}

class MacCheckbox implements Checkbox {
    @Override
    public void render() {
        System.out.println("Rendering Mac checkbox");
    }
    
    @Override
    public void toggle() {
        System.out.println("Mac checkbox toggled");
    }
}

// Abstract Factory
interface GUIFactory {
    Button createButton();
    Checkbox createCheckbox();
}

// Concrete Factories
class WindowsFactory implements GUIFactory {
    @Override
    public Button createButton() {
        return new WindowsButton();
    }
    
    @Override
    public Checkbox createCheckbox() {
        return new WindowsCheckbox();
    }
}

class MacFactory implements GUIFactory {
    @Override
    public Button createButton() {
        return new MacButton();
    }
    
    @Override
    public Checkbox createCheckbox() {
        return new MacCheckbox();
    }
}

// Client
public class Application {
    private Button button;
    private Checkbox checkbox;
    
    public Application(GUIFactory factory) {
        this.button = factory.createButton();
        this.checkbox = factory.createCheckbox();
    }
    
    public void render() {
        button.render();
        checkbox.render();
    }
    
    public void interact() {
        button.onClick();
        checkbox.toggle();
    }
}

// Usage
public class Main {
    public static void main(String[] args) {
        GUIFactory factory;
        
        // Determine factory based on OS
        String os = System.getProperty("os.name").toLowerCase();
        if (os.contains("win")) {
            factory = new WindowsFactory();
        } else if (os.contains("mac")) {
            factory = new MacFactory();
        } else {
            throw new RuntimeException("Unknown OS");
        }
        
        Application app = new Application(factory);
        app.render();
        app.interact();
    }
}
```

### Example 5: Real-World Example - Database Provider Factory

```javascript
// Abstract Products
class Connection {
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

class QueryBuilder {
  select(table) {
    throw new Error('Must implement select()');
  }
  
  where(condition) {
    throw new Error('Must implement where()');
  }
  
  build() {
    throw new Error('Must implement build()');
  }
}

class Transaction {
  begin() {
    throw new Error('Must implement begin()');
  }
  
  commit() {
    throw new Error('Must implement commit()');
  }
  
  rollback() {
    throw new Error('Must implement rollback()');
  }
}

// MySQL Products
class MySQLConnection extends Connection {
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

class MySQLQueryBuilder extends QueryBuilder {
  constructor() {
    super();
    this.parts = [];
  }
  
  select(table) {
    this.parts.push(`SELECT * FROM ${table}`);
    return this;
  }
  
  where(condition) {
    this.parts.push(`WHERE ${condition}`);
    return this;
  }
  
  build() {
    return this.parts.join(' ');
  }
}

class MySQLTransaction extends Transaction {
  begin() {
    return 'BEGIN TRANSACTION (MySQL)';
  }
  
  commit() {
    return 'COMMIT (MySQL)';
  }
  
  rollback() {
    return 'ROLLBACK (MySQL)';
  }
}

// PostgreSQL Products
class PostgreSQLConnection extends Connection {
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

class PostgreSQLQueryBuilder extends QueryBuilder {
  constructor() {
    super();
    this.parts = [];
  }
  
  select(table) {
    this.parts.push(`SELECT * FROM "${table}"`);
    return this;
  }
  
  where(condition) {
    this.parts.push(`WHERE ${condition}`);
    return this;
  }
  
  build() {
    return this.parts.join(' ');
  }
}

class PostgreSQLTransaction extends Transaction {
  begin() {
    return 'BEGIN TRANSACTION (PostgreSQL)';
  }
  
  commit() {
    return 'COMMIT (PostgreSQL)';
  }
  
  rollback() {
    return 'ROLLBACK (PostgreSQL)';
  }
}

// Abstract Factory
class DatabaseFactory {
  createConnection(config) {
    throw new Error('Must implement createConnection()');
  }
  
  createQueryBuilder() {
    throw new Error('Must implement createQueryBuilder()');
  }
  
  createTransaction() {
    throw new Error('Must implement createTransaction()');
  }
}

// Concrete Factories
class MySQLFactory extends DatabaseFactory {
  createConnection(config) {
    return new MySQLConnection(config);
  }
  
  createQueryBuilder() {
    return new MySQLQueryBuilder();
  }
  
  createTransaction() {
    return new MySQLTransaction();
  }
}

class PostgreSQLFactory extends DatabaseFactory {
  createConnection(config) {
    return new PostgreSQLConnection(config);
  }
  
  createQueryBuilder() {
    return new PostgreSQLQueryBuilder();
  }
  
  createTransaction() {
    return new PostgreSQLTransaction();
  }
}

// Client
class DatabaseClient {
  constructor(factory, config) {
    this.factory = factory;
    this.config = config;
    this.connection = null;
  }
  
  connect() {
    this.connection = this.factory.createConnection(this.config);
    console.log(this.connection.connect());
  }
  
  executeQuery(table, condition) {
    const queryBuilder = this.factory.createQueryBuilder();
    const sql = queryBuilder.select(table).where(condition).build();
    return this.connection.query(sql);
  }
  
  executeTransaction(operations) {
    const transaction = this.factory.createTransaction();
    console.log(transaction.begin());
    try {
      operations.forEach(op => {
        console.log(this.connection.query(op));
      });
      console.log(transaction.commit());
    } catch (error) {
      console.log(transaction.rollback());
      throw error;
    }
  }
  
  close() {
    if (this.connection) {
      console.log(this.connection.close());
    }
  }
}

// Usage
const mysqlConfig = { host: 'localhost', port: 3306 };
const mysqlClient = new DatabaseClient(new MySQLFactory(), mysqlConfig);
mysqlClient.connect();
console.log(mysqlClient.executeQuery('users', 'id > 10'));

const postgresConfig = { host: 'localhost', port: 5432 };
const postgresClient = new DatabaseClient(new PostgreSQLFactory(), postgresConfig);
postgresClient.connect();
console.log(postgresClient.executeQuery('users', 'id > 10'));
```

### Example 6: Theme Factory (Dark/Light Mode)

```javascript
// Abstract Products
class Button {
  render() {
    throw new Error('Must implement render()');
  }
}

class Input {
  render() {
    throw new Error('Must implement render()');
  }
}

class Panel {
  render() {
    throw new Error('Must implement render()');
  }
}

// Light Theme Products
class LightButton extends Button {
  render() {
    return {
      backgroundColor: '#ffffff',
      color: '#000000',
      border: '1px solid #ccc',
      text: 'Light Button'
    };
  }
}

class LightInput extends Input {
  render() {
    return {
      backgroundColor: '#ffffff',
      color: '#000000',
      border: '1px solid #ccc',
      placeholder: 'Enter text...'
    };
  }
}

class LightPanel extends Panel {
  render() {
    return {
      backgroundColor: '#f5f5f5',
      color: '#000000',
      border: '1px solid #ddd'
    };
  }
}

// Dark Theme Products
class DarkButton extends Button {
  render() {
    return {
      backgroundColor: '#2d2d2d',
      color: '#ffffff',
      border: '1px solid #555',
      text: 'Dark Button'
    };
  }
}

class DarkInput extends Input {
  render() {
    return {
      backgroundColor: '#2d2d2d',
      color: '#ffffff',
      border: '1px solid #555',
      placeholder: 'Enter text...'
    };
  }
}

class DarkPanel extends Panel {
  render() {
    return {
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      border: '1px solid #333'
    };
  }
}

// Abstract Factory
class ThemeFactory {
  createButton() {
    throw new Error('Must implement createButton()');
  }
  
  createInput() {
    throw new Error('Must implement createInput()');
  }
  
  createPanel() {
    throw new Error('Must implement createPanel()');
  }
}

// Concrete Factories
class LightThemeFactory extends ThemeFactory {
  createButton() {
    return new LightButton();
  }
  
  createInput() {
    return new LightInput();
  }
  
  createPanel() {
    return new LightPanel();
  }
}

class DarkThemeFactory extends ThemeFactory {
  createButton() {
    return new DarkButton();
  }
  
  createInput() {
    return new DarkInput();
  }
  
  createPanel() {
    return new DarkPanel();
  }
}

// Client
class UIApplication {
  constructor(themeFactory) {
    this.factory = themeFactory;
    this.components = {
      button: null,
      input: null,
      panel: null
    };
  }
  
  initialize() {
    this.components.button = this.factory.createButton();
    this.components.input = this.factory.createInput();
    this.components.panel = this.factory.createPanel();
  }
  
  render() {
    return {
      button: this.components.button.render(),
      input: this.components.input.render(),
      panel: this.components.panel.render()
    };
  }
}

// Usage
const lightApp = new UIApplication(new LightThemeFactory());
lightApp.initialize();
console.log('Light Theme:', lightApp.render());

const darkApp = new UIApplication(new DarkThemeFactory());
darkApp.initialize();
console.log('Dark Theme:', darkApp.render());
```

---

## 🔄 Variations

### 1. Factory with Registry Pattern

```javascript
class AbstractFactory {
  static factories = new Map();
  
  static registerFactory(name, FactoryClass) {
    AbstractFactory.factories.set(name, FactoryClass);
  }
  
  static getFactory(name) {
    const FactoryClass = AbstractFactory.factories.get(name);
    if (!FactoryClass) {
      throw new Error(`Factory '${name}' not registered`);
    }
    return new FactoryClass();
  }
}

// Register factories
AbstractFactory.registerFactory('windows', WindowsFactory);
AbstractFactory.registerFactory('mac', MacFactory);

// Usage
const factory = AbstractFactory.getFactory('windows');
```

### 2. Factory with Configuration

```javascript
class FactoryProvider {
  static getFactory(config) {
    if (config.platform === 'windows') {
      return new WindowsFactory();
    } else if (config.platform === 'mac') {
      return new MacFactory();
    } else if (config.platform === 'linux') {
      return new LinuxFactory();
    }
    throw new Error('Unknown platform');
  }
}

// Usage
const config = { platform: 'mac' };
const factory = FactoryProvider.getFactory(config);
```

### 3. Factory with Singleton

```javascript
class FactoryManager {
  static #instance = null;
  #factories = new Map();
  
  static getInstance() {
    if (!FactoryManager.#instance) {
      FactoryManager.#instance = new FactoryManager();
    }
    return FactoryManager.#instance;
  }
  
  registerFactory(name, factory) {
    this.#factories.set(name, factory);
  }
  
  getFactory(name) {
    return this.#factories.get(name);
  }
}

// Usage
const manager = FactoryManager.getInstance();
manager.registerFactory('windows', new WindowsFactory());
const factory = manager.getFactory('windows');
```

---

## 🌍 Real-World Examples

### 1. Cross-Platform UI Frameworks

Frameworks like React Native, Flutter, and Xamarin use Abstract Factory to create platform-specific UI components:

```javascript
// React Native example concept
class PlatformFactory {
  createView() { }
  createButton() { }
  createTextInput() { }
}

class IOSFactory extends PlatformFactory {
  createView() { return new IOSView(); }
  createButton() { return new IOSButton(); }
  createTextInput() { return new IOSTextInput(); }
}

class AndroidFactory extends PlatformFactory {
  createView() { return new AndroidView(); }
  createButton() { return new AndroidButton(); }
  createTextInput() { return new AndroidTextInput(); }
}
```

### 2. Database Abstraction Layers

ORM libraries like Hibernate, Sequelize, and TypeORM use Abstract Factory to support multiple databases:

```javascript
// Sequelize concept
const sequelize = new Sequelize('database', 'user', 'password', {
  dialect: 'mysql' // or 'postgres', 'sqlite', 'mssql'
});

// Internally uses factory pattern to create:
// - Connection (MySQLConnection, PostgreSQLConnection, etc.)
// - QueryBuilder (MySQLQueryBuilder, PostgreSQLQueryBuilder, etc.)
// - Transaction (MySQLTransaction, PostgreSQLTransaction, etc.)
```

### 3. Theme Systems

Modern web frameworks use Abstract Factory for theme management:

```javascript
// Material-UI, Ant Design concept
const theme = createTheme({
  palette: {
    mode: 'dark' // or 'light'
  }
});

// Factory creates:
// - DarkButton, DarkInput, DarkCard (dark theme)
// - LightButton, LightInput, LightCard (light theme)
```

### 4. Game Development

Game engines use Abstract Factory for different rendering backends:

```javascript
// Game engine concept
class RendererFactory {
  createShader() { }
  createTexture() { }
  createMesh() { }
}

class OpenGLFactory extends RendererFactory {
  createShader() { return new OpenGLShader(); }
  createTexture() { return new OpenGLTexture(); }
  createMesh() { return new OpenGLMesh(); }
}

class DirectXFactory extends RendererFactory {
  createShader() { return new DirectXShader(); }
  createTexture() { return new DirectXTexture(); }
  createMesh() { return new DirectXMesh(); }
}
```

---

## 🔗 Related Patterns

### Abstract Factory vs Factory Method

**Factory Method:**
- Creates one type of product
- Uses inheritance
- Single factory method
- Subclasses decide which product to create

**Abstract Factory:**
- Creates families of related products
- Uses composition
- Multiple factory methods
- Factory decides which family to create

### Abstract Factory vs Builder

**Abstract Factory:**
- Creates families of related objects
- Returns products immediately
- Focuses on which family to create

**Builder:**
- Constructs complex objects step by step
- Returns object after multiple steps
- Focuses on how to construct

### Abstract Factory vs Prototype

**Abstract Factory:**
- Creates new instances from scratch
- Uses factory classes

**Prototype:**
- Creates new instances by cloning
- Uses prototype objects

### Abstract Factory vs Singleton

**Abstract Factory:**
- Can create multiple instances
- Manages product creation

**Singleton:**
- Ensures single instance
- Manages instance lifecycle

Often used together: Factory can be a Singleton, or factories can create Singleton products.

---

## ✅ Advantages

1. **Consistency** - Ensures products from one family are used together
2. **Loose Coupling** - Client code depends on abstractions, not concrete classes
3. **Single Responsibility** - Product creation logic is isolated
4. **Open/Closed Principle** - Easy to add new product families without modifying existing code
5. **Separation of Concerns** - Product creation separated from product usage
6. **Testability** - Easy to mock factories and products for testing

---

## ❌ Disadvantages

1. **Complexity** - Requires many interfaces and classes
2. **Rigidity** - Adding new product types requires modifying the abstract factory interface
3. **Can be overkill** - For simple scenarios, direct instantiation is better
4. **Indirection** - Can make code harder to follow
5. **Runtime flexibility** - Harder to change product families at runtime

---

## 🎓 Best Practices

### 1. Keep Product Families Cohesive

```javascript
// Good - Products are related
class UIFactory {
  createButton() { }
  createCheckbox() { }
  createDialog() { }
}

// Bad - Products are unrelated
class MixedFactory {
  createButton() { }
  createDatabase() { }  // Not related to UI
  createLogger() { }     // Not related to UI
}
```

### 2. Use Meaningful Names

```javascript
// Good
class WindowsUIFactory {
  createButton() { }
  createCheckbox() { }
}

// Bad
class Factory1 {
  createA() { }
  createB() { }
}
```

### 3. Document Product Families

```javascript
/**
 * Abstract Factory for creating UI components.
 * 
 * Product Family:
 * - Button: Interactive button component
 * - Checkbox: Toggle checkbox component
 * - Dialog: Modal dialog component
 * 
 * All products in a family are designed to work together
 * and share the same visual style.
 */
class UIFactory {
  createButton() { }
  createCheckbox() { }
  createDialog() { }
}
```

### 4. Validate Product Compatibility

```javascript
class Application {
  constructor(factory) {
    // Ensure all products are from the same family
    this.button = factory.createButton();
    this.checkbox = factory.createCheckbox();
    
    // Validate compatibility
    if (this.button.getTheme() !== this.checkbox.getTheme()) {
      throw new Error('Products must be from the same family');
    }
  }
}
```

### 5. Consider Factory Lifecycle

```javascript
class FactoryManager {
  constructor() {
    this.currentFactory = null;
  }
  
  setFactory(factory) {
    // Clean up old factory if needed
    if (this.currentFactory && this.currentFactory.cleanup) {
      this.currentFactory.cleanup();
    }
    this.currentFactory = factory;
  }
  
  getFactory() {
    return this.currentFactory;
  }
}
```

---

## 🚫 Common Pitfalls

### 1. Mixing Products from Different Families

**Problem:**
```javascript
const windowsFactory = new WindowsFactory();
const macFactory = new MacFactory();

// Bad - mixing products from different families
const button = windowsFactory.createButton();
const checkbox = macFactory.createCheckbox(); // Incompatible!
```

**Solution:** Always use products from the same factory instance.

### 2. Adding New Product Types Incorrectly

**Problem:**
```javascript
// Adding new product type requires modifying all factories
class UIFactory {
  createButton() { }
  createCheckbox() { }
  createNewWidget() { } // Breaks existing factories
}
```

**Solution:** Plan product families carefully, or use a more flexible approach.

### 3. Over-Engineering Simple Scenarios

**Problem:**
```javascript
// Unnecessary Abstract Factory for simple case
class SimpleFactory {
  createA() { return new A(); }
  createB() { return new B(); } // A and B are unrelated
}
```

**Solution:** Use Abstract Factory only when products form a cohesive family.

### 4. Not Handling Factory Selection

**Problem:**
```javascript
// Hard-coded factory selection
const factory = new WindowsFactory(); // Always Windows
```

**Solution:** Use configuration or detection to select the appropriate factory.

```javascript
function createFactory() {
  const platform = detectPlatform();
  switch (platform) {
    case 'windows': return new WindowsFactory();
    case 'mac': return new MacFactory();
    case 'linux': return new LinuxFactory();
    default: throw new Error('Unsupported platform');
  }
}
```

### 5. Ignoring Product Lifecycle

**Problem:**
```javascript
// Creating products without managing lifecycle
function createUI(factory) {
  const button = factory.createButton();
  const checkbox = factory.createCheckbox();
  // Products created but not properly initialized or managed
  return { button, checkbox };
}
```

**Solution:** Properly initialize and manage product lifecycle.

---

## 📚 Practice Exercises

### Exercise 1: Cross-Platform Notification System

Create a notification system that supports:
- Different platforms (iOS, Android, Web)
- Each platform has: Notification, Badge, Sound
- Use Abstract Factory to ensure platform consistency

### Exercise 2: Payment Gateway Factory

Create a payment system with:
- Different providers (Stripe, PayPal, Square)
- Each provider has: PaymentProcessor, RefundHandler, WebhookValidator
- Use Abstract Factory to ensure provider consistency

### Exercise 3: Document Format Factory

Create a document system with:
- Different formats (PDF, Word, HTML)
- Each format has: Document, Page, Style
- Use Abstract Factory to ensure format consistency

---

## 🔍 Code Review Checklist

When reviewing Abstract Factory implementations, check:

- [ ] Abstract factory interface is well-defined
- [ ] Each concrete factory creates a complete product family
- [ ] Products in a family are designed to work together
- [ ] Client code uses only abstract interfaces
- [ ] Factory selection logic is clear and maintainable
- [ ] Product families are cohesive and meaningful
- [ ] Error handling is appropriate
- [ ] Code follows naming conventions
- [ ] Documentation explains product families
- [ ] No mixing of products from different families

---

## 📖 Further Reading

1. **Design Patterns: Elements of Reusable Object-Oriented Software (GoF)**
   - Chapter 3: Creational Patterns - Abstract Factory

2. **Refactoring Guru**
   - https://refactoring.guru/design-patterns/abstract-factory

3. **SourceMaking**
   - https://sourcemaking.com/design_patterns/abstract_factory

4. **Pattern Languages of Program Design**
   - Abstract Factory variations and applications

---

## 📝 Notes Section

_Add your notes, observations, and insights here as you learn..._

### Key Takeaways

- Abstract Factory creates families of related products
- Products from one family are designed to work together
- Client code depends on abstractions, not concrete classes
- Use when you need to ensure product consistency
- Don't use when products don't form cohesive families

### Questions to Explore

- How does Abstract Factory differ from Factory Method?
- When should I use Abstract Factory vs Builder?
- How can I make Abstract Factory more flexible?
- What are the trade-offs of using Abstract Factory?
- How do modern frameworks use Abstract Factory?

### Personal Examples

_Add your own code examples and use cases here..._

---

## 🎯 Summary

The **Abstract Factory Pattern** is a powerful creational pattern that:

- ✅ Creates families of related or dependent objects
- ✅ Ensures products from one family are used together
- ✅ Promotes loose coupling and separation of concerns
- ✅ Makes it easy to switch between product families
- ✅ Is essential for cross-platform and theme systems

Remember: Use it when you need to create families of related products, but don't overcomplicate simple scenarios!

---

**Date Created:** 2025-12-15  
**Pattern Type:** Creational  
**Difficulty:** Advanced  
**Related Patterns:** Factory Method, Builder, Prototype, Singleton
