# Bridge Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Bridge pattern definition and intent
- [ ] Learn when to use Bridge vs other structural patterns
- [ ] Master the separation of abstraction from implementation
- [ ] Recognize real-world applications
- [ ] Understand how to decouple abstraction and implementation
- [ ] Practice implementing Bridge in different scenarios
- [ ] Learn common pitfalls and best practices

---

## 🎯 Definition

**Bridge Pattern** is a structural design pattern that separates abstraction from its implementation so that both can vary independently.

**Intent (GoF):**
- Decouple an abstraction from its implementation so that the two can vary independently
- Bridge lets you split a large class or a set of closely related classes into two separate hierarchies—abstraction and implementation—which can be developed independently of each other
- Also known as: **Handle/Body Pattern**

**Key Principle:**
> "Separate what varies from what stays the same" - The bridge pattern separates the abstraction (what the client sees) from the implementation (how it works), allowing both to evolve independently.

---

## 🏗️ Structure

### UML Diagram Concept

```
Abstraction
├── implementor: Implementor (reference)
├── operation(): void
│   └── calls implementor.operationImpl()
│
RefinedAbstraction extends Abstraction
└── operation(): void (extended behavior)

Implementor (Interface)
├── operationImpl(): void
│
ConcreteImplementorA implements Implementor
└── operationImpl(): void

ConcreteImplementorB implements Implementor
└── operationImpl(): void
```

### Participants

1. **Abstraction** - Defines the abstraction's interface and maintains a reference to an Implementor object
2. **RefinedAbstraction** - Extends the abstraction interface to provide additional functionality
3. **Implementor** - Defines the interface for implementation classes
4. **ConcreteImplementor** - Implements the Implementor interface and defines concrete implementation

### Key Concepts

**Abstraction:**
- The high-level control layer
- Defines the interface that clients use
- Delegates work to the implementation

**Implementation:**
- The low-level platform-specific code
- Can be changed without affecting the abstraction
- Can have multiple implementations

---

## 💡 When to Use

### Use Bridge When:

✅ **You want to avoid a permanent binding between abstraction and implementation**
- Example: Runtime selection of implementation (e.g., different rendering engines)

✅ **Both abstraction and implementation should be extensible by subclassing**
- Example: Adding new shapes and new drawing APIs independently

✅ **Changes in implementation should not impact clients**
- Example: Switching database drivers without changing business logic

✅ **You want to hide implementation details from clients**
- Example: Platform-specific code hidden behind a common interface

✅ **You have a proliferation of classes from a combination of abstraction and implementation**
- Example: Instead of Shape×Color combinations (RedCircle, BlueCircle, RedSquare, etc.), use Bridge

### Don't Use When:

❌ **The abstraction and implementation are tightly coupled** - Bridge adds unnecessary complexity
❌ **You have a simple, stable abstraction** - Over-engineering for no benefit
❌ **You can modify the source code** - Direct refactoring might be better
❌ **Performance is critical** - Bridge adds indirection overhead

---

## 🔨 Implementation Examples

### Example 1: Basic Bridge Pattern (JavaScript/TypeScript)

```javascript
// Implementor - defines the interface for implementation classes
class Renderer {
  renderCircle(radius) {
    throw new Error('Must implement renderCircle()');
  }
  
  renderSquare(side) {
    throw new Error('Must implement renderSquare()');
  }
}

// Concrete Implementor A
class VectorRenderer extends Renderer {
  renderCircle(radius) {
    console.log(`Drawing a circle of radius ${radius} using vector graphics`);
  }
  
  renderSquare(side) {
    console.log(`Drawing a square of side ${side} using vector graphics`);
  }
}

// Concrete Implementor B
class RasterRenderer extends Renderer {
  renderCircle(radius) {
    console.log(`Drawing pixels for a circle of radius ${radius}`);
  }
  
  renderSquare(side) {
    console.log(`Drawing pixels for a square of side ${side}`);
  }
}

// Abstraction
class Shape {
  constructor(renderer) {
    this.renderer = renderer; // Bridge to implementation
  }
  
  draw() {
    throw new Error('Must implement draw()');
  }
}

// Refined Abstraction
class Circle extends Shape {
  constructor(renderer, radius) {
    super(renderer);
    this.radius = radius;
  }
  
  draw() {
    this.renderer.renderCircle(this.radius);
  }
  
  resize(factor) {
    this.radius *= factor;
  }
}

class Square extends Shape {
  constructor(renderer, side) {
    super(renderer);
    this.side = side;
  }
  
  draw() {
    this.renderer.renderSquare(this.side);
  }
  
  resize(factor) {
    this.side *= factor;
  }
}

// Usage
const vectorRenderer = new VectorRenderer();
const rasterRenderer = new RasterRenderer();

const vectorCircle = new Circle(vectorRenderer, 5);
vectorCircle.draw(); // Drawing a circle of radius 5 using vector graphics

const rasterCircle = new Circle(rasterRenderer, 5);
rasterCircle.draw(); // Drawing pixels for a circle of radius 5

const vectorSquare = new Square(vectorRenderer, 10);
vectorSquare.draw(); // Drawing a square of side 10 using vector graphics
```

### Example 2: Bridge Pattern with TypeScript

```typescript
// Implementor interface
interface Device {
  isEnabled(): boolean;
  enable(): void;
  disable(): void;
  getVolume(): number;
  setVolume(percent: number): void;
  getChannel(): number;
  setChannel(channel: number): void;
}

// Concrete Implementor A
class TV implements Device {
  private enabled: boolean = false;
  private volume: number = 50;
  private channel: number = 1;
  
  isEnabled(): boolean {
    return this.enabled;
  }
  
  enable(): void {
    this.enabled = true;
    console.log('TV is now enabled');
  }
  
  disable(): void {
    this.enabled = false;
    console.log('TV is now disabled');
  }
  
  getVolume(): number {
    return this.volume;
  }
  
  setVolume(percent: number): void {
    this.volume = percent;
    console.log(`TV volume set to ${percent}%`);
  }
  
  getChannel(): number {
    return this.channel;
  }
  
  setChannel(channel: number): void {
    this.channel = channel;
    console.log(`TV channel set to ${channel}`);
  }
}

// Concrete Implementor B
class Radio implements Device {
  private enabled: boolean = false;
  private volume: number = 30;
  private channel: number = 88.5;
  
  isEnabled(): boolean {
    return this.enabled;
  }
  
  enable(): void {
    this.enabled = true;
    console.log('Radio is now enabled');
  }
  
  disable(): void {
    this.enabled = false;
    console.log('Radio is now disabled');
  }
  
  getVolume(): number {
    return this.volume;
  }
  
  setVolume(percent: number): void {
    this.volume = percent;
    console.log(`Radio volume set to ${percent}%`);
  }
  
  getChannel(): number {
    return this.channel;
  }
  
  setChannel(channel: number): void {
    this.channel = channel;
    console.log(`Radio frequency set to ${channel} MHz`);
  }
}

// Abstraction
abstract class RemoteControl {
  protected device: Device;
  
  constructor(device: Device) {
    this.device = device; // Bridge to implementation
  }
  
  togglePower(): void {
    if (this.device.isEnabled()) {
      this.device.disable();
    } else {
      this.device.enable();
    }
  }
  
  volumeDown(): void {
    this.device.setVolume(this.device.getVolume() - 10);
  }
  
  volumeUp(): void {
    this.device.setVolume(this.device.getVolume() + 10);
  }
  
  channelDown(): void {
    this.device.setChannel(this.device.getChannel() - 1);
  }
  
  channelUp(): void {
    this.device.setChannel(this.device.getChannel() + 1);
  }
}

// Refined Abstraction
class AdvancedRemoteControl extends RemoteControl {
  mute(): void {
    this.device.setVolume(0);
    console.log('Device muted');
  }
  
  setChannel(channel: number): void {
    this.device.setChannel(channel);
  }
}

// Usage
const tv = new TV();
const radio = new Radio();

const basicTVRemote = new RemoteControl(tv);
basicTVRemote.togglePower(); // TV is now enabled
basicTVRemote.volumeUp(); // TV volume set to 60%

const advancedRadioRemote = new AdvancedRemoteControl(radio);
advancedRadioRemote.togglePower(); // Radio is now enabled
advancedRadioRemote.mute(); // Radio volume set to 0%, Device muted
advancedRadioRemote.setChannel(101.5); // Radio frequency set to 101.5 MHz
```

### Example 3: Database Bridge Pattern

```javascript
// Implementor - Database connection interface
class DatabaseConnection {
  connect() {
    throw new Error('Must implement connect()');
  }
  
  query(sql) {
    throw new Error('Must implement query()');
  }
  
  disconnect() {
    throw new Error('Must implement disconnect()');
  }
}

// Concrete Implementor A
class MySQLConnection extends DatabaseConnection {
  constructor(host, port, database, user, password) {
    super();
    this.config = { host, port, database, user, password };
    this.connected = false;
  }
  
  connect() {
    console.log(`Connecting to MySQL at ${this.config.host}:${this.config.port}`);
    this.connected = true;
    return this;
  }
  
  query(sql) {
    if (!this.connected) {
      throw new Error('Not connected to MySQL');
    }
    console.log(`MySQL executing: ${sql}`);
    return { rows: [], rowCount: 0 };
  }
  
  disconnect() {
    console.log('Disconnecting from MySQL');
    this.connected = false;
  }
}

// Concrete Implementor B
class PostgreSQLConnection extends DatabaseConnection {
  constructor(host, port, database, user, password) {
    super();
    this.config = { host, port, database, user, password };
    this.connected = false;
  }
  
  connect() {
    console.log(`Connecting to PostgreSQL at ${this.config.host}:${this.config.port}`);
    this.connected = true;
    return this;
  }
  
  query(sql) {
    if (!this.connected) {
      throw new Error('Not connected to PostgreSQL');
    }
    console.log(`PostgreSQL executing: ${sql}`);
    return { rows: [], rowCount: 0 };
  }
  
  disconnect() {
    console.log('Disconnecting from PostgreSQL');
    this.connected = false;
  }
}

// Abstraction
class Database {
  constructor(connection) {
    this.connection = connection; // Bridge to implementation
  }
  
  execute(sql) {
    return this.connection.query(sql);
  }
  
  close() {
    this.connection.disconnect();
  }
}

// Refined Abstraction
class TransactionalDatabase extends Database {
  constructor(connection) {
    super(connection);
    this.inTransaction = false;
  }
  
  beginTransaction() {
    this.execute('BEGIN TRANSACTION');
    this.inTransaction = true;
  }
  
  commit() {
    if (this.inTransaction) {
      this.execute('COMMIT');
      this.inTransaction = false;
    }
  }
  
  rollback() {
    if (this.inTransaction) {
      this.execute('ROLLBACK');
      this.inTransaction = false;
    }
  }
  
  execute(sql) {
    if (this.inTransaction) {
      console.log(`[Transaction] ${sql}`);
    }
    return super.execute(sql);
  }
}

// Usage
const mysqlConnection = new MySQLConnection('localhost', 3306, 'mydb', 'user', 'pass');
const postgresConnection = new PostgreSQLConnection('localhost', 5432, 'mydb', 'user', 'pass');

mysqlConnection.connect();
const mysqlDB = new Database(mysqlConnection);
mysqlDB.execute('SELECT * FROM users');
mysqlDB.close();

postgresConnection.connect();
const postgresDB = new TransactionalDatabase(postgresConnection);
postgresDB.beginTransaction();
postgresDB.execute('INSERT INTO users (name) VALUES (\'John\')');
postgresDB.commit();
postgresDB.close();
```

### Example 4: Notification Bridge Pattern

```javascript
// Implementor - Message sender interface
class MessageSender {
  send(message, recipient) {
    throw new Error('Must implement send()');
  }
}

// Concrete Implementor A
class EmailSender extends MessageSender {
  send(message, recipient) {
    console.log(`Sending email to ${recipient}: ${message}`);
    return { success: true, method: 'email', recipient };
  }
}

// Concrete Implementor B
class SMSSender extends MessageSender {
  send(message, recipient) {
    console.log(`Sending SMS to ${recipient}: ${message}`);
    return { success: true, method: 'sms', recipient };
  }
}

// Concrete Implementor C
class PushNotificationSender extends MessageSender {
  send(message, recipient) {
    console.log(`Sending push notification to ${recipient}: ${message}`);
    return { success: true, method: 'push', recipient };
  }
}

// Abstraction
class Notification {
  constructor(sender) {
    this.sender = sender; // Bridge to implementation
  }
  
  send(message, recipient) {
    return this.sender.send(message, recipient);
  }
}

// Refined Abstraction
class UrgentNotification extends Notification {
  send(message, recipient) {
    const urgentMessage = `[URGENT] ${message}`;
    return super.send(urgentMessage, recipient);
  }
}

class ScheduledNotification extends Notification {
  constructor(sender, delay) {
    super(sender);
    this.delay = delay;
  }
  
  send(message, recipient) {
    console.log(`Scheduling notification in ${this.delay}ms`);
    setTimeout(() => {
      super.send(message, recipient);
    }, this.delay);
    return { scheduled: true, delay: this.delay };
  }
}

// Usage
const emailSender = new EmailSender();
const smsSender = new SMSSender();
const pushSender = new PushNotificationSender();

const emailNotification = new Notification(emailSender);
emailNotification.send('Hello!', 'user@example.com');

const urgentSMS = new UrgentNotification(smsSender);
urgentSMS.send('Meeting in 5 minutes', '+1234567890');

const scheduledPush = new ScheduledNotification(pushSender, 5000);
scheduledPush.send('Reminder: Check your email', 'user123');
```

### Example 5: File Storage Bridge Pattern

```javascript
// Implementor - Storage interface
class Storage {
  save(fileName, data) {
    throw new Error('Must implement save()');
  }
  
  load(fileName) {
    throw new Error('Must implement load()');
  }
  
  delete(fileName) {
    throw new Error('Must implement delete()');
  }
}

// Concrete Implementor A
class LocalFileStorage extends Storage {
  save(fileName, data) {
    console.log(`Saving ${fileName} to local filesystem`);
    // Simulate file save
    return { success: true, path: `./files/${fileName}` };
  }
  
  load(fileName) {
    console.log(`Loading ${fileName} from local filesystem`);
    return { data: 'file content', path: `./files/${fileName}` };
  }
  
  delete(fileName) {
    console.log(`Deleting ${fileName} from local filesystem`);
    return { success: true };
  }
}

// Concrete Implementor B
class CloudStorage extends Storage {
  constructor(bucketName) {
    super();
    this.bucketName = bucketName;
  }
  
  save(fileName, data) {
    console.log(`Uploading ${fileName} to cloud bucket: ${this.bucketName}`);
    return { success: true, url: `https://${this.bucketName}.s3.amazonaws.com/${fileName}` };
  }
  
  load(fileName) {
    console.log(`Downloading ${fileName} from cloud bucket: ${this.bucketName}`);
    return { data: 'file content', url: `https://${this.bucketName}.s3.amazonaws.com/${fileName}` };
  }
  
  delete(fileName) {
    console.log(`Deleting ${fileName} from cloud bucket: ${this.bucketName}`);
    return { success: true };
  }
}

// Concrete Implementor C
class DatabaseStorage extends Storage {
  constructor(connection) {
    super();
    this.connection = connection;
  }
  
  save(fileName, data) {
    console.log(`Storing ${fileName} in database`);
    return { success: true, id: `db_${Date.now()}` };
  }
  
  load(fileName) {
    console.log(`Loading ${fileName} from database`);
    return { data: 'file content', id: `db_${Date.now()}` };
  }
  
  delete(fileName) {
    console.log(`Deleting ${fileName} from database`);
    return { success: true };
  }
}

// Abstraction
class FileManager {
  constructor(storage) {
    this.storage = storage; // Bridge to implementation
  }
  
  saveFile(fileName, data) {
    return this.storage.save(fileName, data);
  }
  
  loadFile(fileName) {
    return this.storage.load(fileName);
  }
  
  deleteFile(fileName) {
    return this.storage.delete(fileName);
  }
}

// Refined Abstraction
class EncryptedFileManager extends FileManager {
  constructor(storage, encryptionKey) {
    super(storage);
    this.encryptionKey = encryptionKey;
  }
  
  encrypt(data) {
    // Simple encryption simulation
    return `[ENCRYPTED]${data}`;
  }
  
  decrypt(encryptedData) {
    // Simple decryption simulation
    return encryptedData.replace('[ENCRYPTED]', '');
  }
  
  saveFile(fileName, data) {
    const encryptedData = this.encrypt(data);
    return super.saveFile(fileName, encryptedData);
  }
  
  loadFile(fileName) {
    const result = super.loadFile(fileName);
    result.data = this.decrypt(result.data);
    return result;
  }
}

class CachedFileManager extends FileManager {
  constructor(storage) {
    super(storage);
    this.cache = new Map();
  }
  
  loadFile(fileName) {
    if (this.cache.has(fileName)) {
      console.log(`Loading ${fileName} from cache`);
      return this.cache.get(fileName);
    }
    
    const result = super.loadFile(fileName);
    this.cache.set(fileName, result);
    return result;
  }
  
  deleteFile(fileName) {
    this.cache.delete(fileName);
    return super.deleteFile(fileName);
  }
}

// Usage
const localStorage = new LocalFileStorage();
const cloudStorage = new CloudStorage('my-bucket');
const dbStorage = new DatabaseStorage({});

const localManager = new FileManager(localStorage);
localManager.saveFile('document.txt', 'Hello World');

const encryptedCloudManager = new EncryptedFileManager(cloudStorage, 'secret-key');
encryptedCloudManager.saveFile('secret.txt', 'Sensitive Data');

const cachedLocalManager = new CachedFileManager(localStorage);
cachedLocalManager.loadFile('document.txt'); // From storage
cachedLocalManager.loadFile('document.txt'); // From cache
```

---

## 🔄 Variations

### 1. Multiple Implementations

```javascript
// Bridge can have multiple implementations
class Shape {
  constructor(renderer, color) {
    this.renderer = renderer;
    this.color = color;
  }
  
  draw() {
    this.renderer.render(this, this.color);
  }
}
```

### 2. Dynamic Bridge Switching

```javascript
class Shape {
  constructor(renderer) {
    this.renderer = renderer;
  }
  
  setRenderer(renderer) {
    this.renderer = renderer; // Switch implementation at runtime
  }
  
  draw() {
    this.renderer.render(this);
  }
}
```

### 3. Bridge with Factory

```javascript
class RendererFactory {
  static create(type) {
    switch(type) {
      case 'vector': return new VectorRenderer();
      case 'raster': return new RasterRenderer();
      default: throw new Error('Unknown renderer type');
    }
  }
}

const shape = new Circle(RendererFactory.create('vector'), 5);
```

---

## 🌍 Real-World Examples

### 1. GUI Frameworks

```javascript
// Different platforms (Windows, Mac, Linux) with different rendering
class Window {
  constructor(platform) {
    this.platform = platform; // Bridge
  }
  
  draw() {
    this.platform.drawWindow();
  }
}
```

### 2. Database Drivers

```javascript
// Same SQL interface, different database implementations
class QueryBuilder {
  constructor(driver) {
    this.driver = driver; // Bridge to MySQL, PostgreSQL, etc.
  }
}
```

### 3. Payment Processing

```javascript
// Same payment interface, different payment gateways
class PaymentProcessor {
  constructor(gateway) {
    this.gateway = gateway; // Bridge to Stripe, PayPal, etc.
  }
}
```

### 4. Logging Frameworks

```javascript
// Same logging interface, different outputs (file, console, remote)
class Logger {
  constructor(appender) {
    this.appender = appender; // Bridge
  }
}
```

### 5. Media Players

```javascript
// Same player interface, different codecs
class MediaPlayer {
  constructor(codec) {
    this.codec = codec; // Bridge to MP3, AAC, OGG, etc.
  }
}
```

---

## 🔗 Related Patterns

### Bridge vs Adapter

**Bridge:**
- Applied during design phase
- Separates abstraction from implementation
- Both sides can vary independently
- Intentional design decision

**Adapter:**
- Applied after classes are designed
- Makes incompatible interfaces work together
- Usually adapts existing code
- Reactive solution

### Bridge vs Strategy

**Bridge:**
- Structural pattern
- Separates abstraction from implementation
- Both can have hierarchies
- Long-term relationship

**Strategy:**
- Behavioral pattern
- Encapsulates algorithms
- Client chooses strategy
- Can be changed at runtime

### Bridge vs State

**Bridge:**
- Structural relationship
- Implementation is chosen once
- Both sides are independent

**State:**
- Behavioral relationship
- State changes during object lifecycle
- State affects object behavior

### Bridge vs Decorator

**Bridge:**
- Structural pattern
- Separates abstraction from implementation
- Both hierarchies are independent and can vary separately
- One abstraction uses one implementation (1:1 relationship)
- Implementation is chosen at construction time
- Focus: Decoupling two dimensions of variation
- Example: Shape (abstraction) + Renderer (implementation)

**Decorator:**
- Structural pattern
- Adds behavior/responsibilities dynamically
- Wraps objects to add functionality
- Multiple decorators can be stacked (1:many relationship)
- Decorators are added at runtime
- Focus: Adding features without modifying base class
- Example: FileReader → CompressedFileReader → EncryptedFileReader

**Key Differences:**

| Aspect | Bridge | Decorator |
|--------|--------|-----------|
| **Purpose** | Separate abstraction from implementation | Add responsibilities dynamically |
| **Relationship** | 1:1 (one abstraction, one implementation) | 1:many (can stack multiple decorators) |
| **Timing** | Chosen at construction | Added at runtime |
| **Structure** | Two independent hierarchies | Wrapper chain |
| **Change** | Switch implementation | Add/remove features |
| **Use Case** | Avoid class explosion (Shape×Renderer) | Extend functionality without inheritance |

**When to Use Which:**

- **Use Bridge** when you need to separate two independent dimensions (e.g., shapes and renderers, devices and remotes)
- **Use Decorator** when you need to add features dynamically and stack them (e.g., adding compression, encryption, caching to a file reader)

**Example Comparison:**

```javascript
// Bridge Pattern - One abstraction, one implementation
class Circle extends Shape {
  constructor(renderer) {
    super(renderer); // One renderer per shape
  }
}

// Decorator Pattern - Stack multiple decorators
let file = new FileReader('data.txt');
file = new CompressedFileReader(file);      // Add compression
file = new EncryptedFileReader(file);       // Add encryption
file = new CachedFileReader(file);          // Add caching
```

---

## ✅ Advantages

1. **Separation of Concerns** - Abstraction and implementation are decoupled
2. **Extensibility** - Can extend both sides independently
3. **Implementation Hiding** - Clients don't see implementation details
4. **Platform Independence** - Abstraction works with any implementation
5. **Reduced Complexity** - Avoids explosion of classes (e.g., RedCircle, BlueCircle, etc.)
6. **Runtime Binding** - Can switch implementations at runtime

---

## ❌ Disadvantages

1. **Complexity** - Adds indirection and abstraction layers
2. **Performance** - Additional method calls add overhead
3. **Over-engineering** - Can be overkill for simple cases
4. **Learning Curve** - Harder to understand than direct implementation
5. **Debugging** - More layers make debugging harder

---

## 🎓 Best Practices

### 1. Use Composition Over Inheritance

```javascript
// Good - Bridge uses composition
class Shape {
  constructor(renderer) {
    this.renderer = renderer; // Composition
  }
}

// Avoid - Multiple inheritance (not available in JS/TS)
```

### 2. Keep Abstraction Simple

```javascript
// Good - Simple abstraction
class Shape {
  constructor(renderer) {
    this.renderer = renderer;
  }
  
  draw() {
    this.renderer.render(this);
  }
}

// Bad - Abstraction doing too much
class ComplexShape {
  constructor(renderer) {
    this.renderer = renderer;
    this.cache = new Map();
    this.logger = new Logger();
    this.validator = new Validator();
    // Too many responsibilities
  }
}
```

### 3. Document the Bridge Relationship

```javascript
/**
 * Shape abstraction that uses a Renderer implementation.
 * 
 * Bridge Pattern:
 * - Abstraction: Shape and its subclasses
 * - Implementation: Renderer and its subclasses
 * - Both can vary independently
 */
class Shape {
  constructor(renderer) {
    this.renderer = renderer;
  }
}
```

### 4. Use Interfaces for Implementors

```javascript
// Good - Clear interface
class Renderer {
  render(shape) {
    throw new Error('Must implement render()');
  }
}

// Bad - No clear contract
class Renderer {
  // Unclear what methods are required
}
```

### 5. Consider Factory for Bridge Creation

```javascript
class ShapeFactory {
  static createCircle(rendererType, radius) {
    const renderer = RendererFactory.create(rendererType);
    return new Circle(renderer, radius);
  }
}
```

---

## 🚫 Common Pitfalls

### 1. Confusing Bridge with Adapter

**Problem:**
```javascript
// Using Bridge when Adapter is needed
class LegacyAdapter extends NewInterface {
  // This is Adapter, not Bridge
}
```

**Solution:** Use Bridge when designing new systems, Adapter for integrating existing incompatible code.

### 2. Over-using Bridge

**Problem:**
```javascript
// Using Bridge for simple cases
class SimpleClass {
  constructor(implementation) {
    this.impl = implementation; // Unnecessary bridge
  }
}
```

**Solution:** Only use Bridge when both abstraction and implementation need to vary independently.

### 3. Tight Coupling Despite Bridge

**Problem:**
```javascript
class Shape {
  constructor(renderer) {
    this.renderer = renderer;
    // But then directly accessing renderer internals
    if (this.renderer.type === 'vector') {
      // Tight coupling
    }
  }
}
```

**Solution:** Abstraction should only use the Implementor interface, not concrete implementations.

### 4. Not Using the Bridge

**Problem:**
```javascript
class Shape {
  constructor(renderer) {
    this.renderer = renderer; // Bridge created but not used
  }
  
  draw() {
    // Direct implementation instead of using bridge
    console.log('Drawing shape');
  }
}
```

**Solution:** Always delegate to the implementation through the bridge.

---

## 📚 Practice Exercises

### Exercise 1: Drawing Application

Create a drawing application with:
- Shapes: Circle, Square, Triangle
- Renderers: Vector, Raster, 3D

Use Bridge pattern to allow any shape with any renderer.

### Exercise 2: Notification System

Create a notification system with:
- Notification types: Email, SMS, Push
- Urgency levels: Normal, Urgent, Critical

Use Bridge to separate notification type from urgency handling.

### Exercise 3: Data Export System

Create a data export system with:
- Data sources: Database, API, File
- Export formats: JSON, XML, CSV

Use Bridge to allow any source with any format.

---

## 🔍 Code Review Checklist

When reviewing Bridge implementations, check:

- [ ] Abstraction and implementation are properly separated
- [ ] Abstraction delegates to implementation through bridge
- [ ] Both sides can vary independently
- [ ] No tight coupling between abstraction and concrete implementations
- [ ] Bridge relationship is documented
- [ ] Implementation interface is clear and well-defined
- [ ] Abstraction doesn't access implementation internals
- [ ] Both hierarchies can be extended independently
- [ ] Bridge is used appropriately (not over-engineered)
- [ ] Runtime switching of implementation is possible (if needed)

---

## 📖 Further Reading

1. **Design Patterns: Elements of Reusable Object-Oriented Software (GoF)**
   - Chapter 4: Structural Patterns - Bridge

2. **Refactoring Guru**
   - https://refactoring.guru/design-patterns/bridge

3. **SourceMaking**
   - https://sourcemaking.com/design_patterns/bridge

4. **Bridge Pattern in Modern JavaScript**
   - ES6+ implementations and variations

---

## 📝 Notes Section

_Add your notes, observations, and insights here as you learn..._

### Key Takeaways

- Bridge separates abstraction from implementation
- Both sides can vary independently
- Use when you need to avoid permanent binding
- Prefer composition over inheritance
- Don't confuse Bridge with Adapter

### Questions to Explore

- When should I use Bridge vs Adapter?
- How do I decide if Bridge is worth the complexity?
- Can I switch implementations at runtime?
- How do I test Bridge pattern implementations?
- What's the difference between Bridge and Strategy?

### Personal Examples

_Add your own code examples and use cases here..._

---

## 🎯 Summary

The **Bridge Pattern** is a powerful structural pattern that:

- ✅ Separates abstraction from implementation
- ✅ Allows both to vary independently
- ✅ Prevents class explosion
- ✅ Provides platform independence
- ✅ Enables runtime implementation switching

Remember: Use it when you need to decouple abstraction from implementation, but don't over-engineer simple cases!

---

**Date Created:** 2025-12-17  
**Pattern Type:** Structural  
**Difficulty:** Advanced  
**Related Patterns:** Adapter, Strategy, State, Abstract Factory
