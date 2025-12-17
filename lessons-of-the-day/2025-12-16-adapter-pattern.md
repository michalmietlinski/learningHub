# Adapter Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Adapter pattern definition and intent
- [ ] Learn when to use Adapter vs other structural patterns
- [ ] Master Object Adapter vs Class Adapter implementations
- [ ] Recognize real-world applications
- [ ] Understand how to integrate incompatible interfaces
- [ ] Practice implementing Adapter in different scenarios
- [ ] Learn common pitfalls and best practices

---

## 🎯 Definition

**Adapter Pattern** is a structural design pattern that allows objects with incompatible interfaces to collaborate.

**Intent (GoF):**
- Convert the interface of a class into another interface clients expect
- Adapter lets classes work together that couldn't otherwise because of incompatible interfaces
- Also known as: **Wrapper Pattern**

**Key Principle:**
> "Make incompatible interfaces work together" - The adapter acts as a bridge between two incompatible interfaces, translating requests from one to another.

---

## 🏗️ Structure

### UML Diagram Concept

```
Client
└── uses Target interface

Target (Interface)
├── request(): void
│
Adapter implements Target
├── adaptee: Adaptee
└── request(): void
    └── calls adaptee.specificRequest()

Adaptee (Incompatible Class)
└── specificRequest(): void
```

### Participants

1. **Target** - Defines the domain-specific interface that Client uses
2. **Client** - Collaborates with objects conforming to the Target interface
3. **Adaptee** - Defines an existing interface that needs adapting
4. **Adapter** - Adapts the interface of Adaptee to the Target interface

### Two Types of Adapters

**Object Adapter (Composition):**
- Adapter contains an instance of Adaptee
- Uses composition (has-a relationship)
- More flexible, can adapt multiple adaptees
- Preferred in most languages

**Class Adapter (Inheritance):**
- Adapter extends both Target and Adaptee
- Uses inheritance (is-a relationship)
- Requires multiple inheritance (not available in all languages)
- Less flexible but more direct

---

## 💡 When to Use

### Use Adapter When:

✅ **You want to use an existing class, but its interface doesn't match what you need**
- Example: Integrating a third-party library with different method names

✅ **You need to integrate legacy code with new code**
- Example: Wrapping old API calls to work with new system

✅ **You want to create a reusable class that cooperates with unrelated classes**
- Example: Creating a unified interface for multiple payment gateways

✅ **You need to work with multiple incompatible interfaces**
- Example: Supporting different data formats (JSON, XML, CSV) through a common interface

✅ **You want to decouple client code from specific implementations**
- Example: Abstracting database drivers behind a common interface

### Don't Use When:

❌ **The interfaces are already compatible** - No need for an adapter
❌ **You can modify the source code** - It's better to change the interface directly
❌ **You're trying to add new functionality** - Use Decorator or Strategy instead
❌ **The incompatibility is too complex** - Consider refactoring instead

---

## 🔨 Implementation Examples

### Example 1: Basic Object Adapter (JavaScript/TypeScript)

```javascript
// Target interface - what the client expects
class PaymentProcessor {
  processPayment(amount) {
    throw new Error('Must implement processPayment()');
  }
}

// Adaptee - existing class with incompatible interface
class LegacyPaymentSystem {
  makePayment(dollars) {
    console.log(`Processing legacy payment: $${dollars}`);
    return { success: true, amount: dollars };
  }
  
  getPaymentStatus(transactionId) {
    return `Status for transaction ${transactionId}`;
  }
}

// Adapter - adapts LegacyPaymentSystem to PaymentProcessor
class LegacyPaymentAdapter extends PaymentProcessor {
  constructor(legacySystem) {
    super();
    this.legacySystem = legacySystem;
  }
  
  processPayment(amount) {
    // Adapt the interface: processPayment -> makePayment
    return this.legacySystem.makePayment(amount);
  }
}

// Client code
function processOrder(processor, amount) {
  return processor.processPayment(amount);
}

// Usage
const legacySystem = new LegacyPaymentSystem();
const adapter = new LegacyPaymentAdapter(legacySystem);
const result = processOrder(adapter, 100);
// Processing legacy payment: $100
```

### Example 2: Adapter with TypeScript

```typescript
// Target interface
interface MediaPlayer {
  play(audioType: string, fileName: string): void;
}

// Advanced media player interface
interface AdvancedMediaPlayer {
  playVlc(fileName: string): void;
  playMp4(fileName: string): void;
}

// Concrete Advanced Media Players
class VlcPlayer implements AdvancedMediaPlayer {
  playVlc(fileName: string): void {
    console.log(`Playing vlc file: ${fileName}`);
  }
  
  playMp4(fileName: string): void {
    // VLC doesn't support MP4
  }
}

class Mp4Player implements AdvancedMediaPlayer {
  playVlc(fileName: string): void {
    // MP4 player doesn't support VLC
  }
  
  playMp4(fileName: string): void {
    console.log(`Playing mp4 file: ${fileName}`);
  }
}

// Adapter
class MediaAdapter implements MediaPlayer {
  private advancedPlayer: AdvancedMediaPlayer;
  
  constructor(audioType: string) {
    if (audioType === 'vlc') {
      this.advancedPlayer = new VlcPlayer();
    } else if (audioType === 'mp4') {
      this.advancedPlayer = new Mp4Player();
    }
  }
  
  play(audioType: string, fileName: string): void {
    if (audioType === 'vlc') {
      this.advancedPlayer.playVlc(fileName);
    } else if (audioType === 'mp4') {
      this.advancedPlayer.playMp4(fileName);
    }
  }
}

// Concrete Media Player (uses adapter)
class AudioPlayer implements MediaPlayer {
  private mediaAdapter: MediaAdapter | null = null;
  
  play(audioType: string, fileName: string): void {
    // Built-in support for mp3
    if (audioType === 'mp3') {
      console.log(`Playing mp3 file: ${fileName}`);
    }
    // Use adapter for other formats
    else if (audioType === 'vlc' || audioType === 'mp4') {
      this.mediaAdapter = new MediaAdapter(audioType);
      this.mediaAdapter.play(audioType, fileName);
    } else {
      console.log(`Invalid media type: ${audioType}`);
    }
  }
}

// Usage
const player = new AudioPlayer();
player.play('mp3', 'song.mp3');
player.play('mp4', 'video.mp4');
player.play('vlc', 'movie.vlc');
```

### Example 3: Adapter in Python

```python
from abc import ABC, abstractmethod

# Target interface
class PaymentGateway(ABC):
    @abstractmethod
    def pay(self, amount: float) -> dict:
        pass
    
    @abstractmethod
    def refund(self, transaction_id: str) -> dict:
        pass

# Adaptee - Third-party payment service
class StripeAPI:
    def charge(self, amount_in_cents: int, currency: str = 'usd') -> dict:
        return {
            'id': f'ch_{amount_in_cents}',
            'amount': amount_in_cents,
            'currency': currency,
            'status': 'succeeded'
        }
    
    def reverse_charge(self, charge_id: str) -> dict:
        return {
            'id': charge_id,
            'status': 'refunded'
        }

# Adapter
class StripeAdapter(PaymentGateway):
    def __init__(self, stripe_api: StripeAPI):
        self.stripe = stripe_api
    
    def pay(self, amount: float) -> dict:
        # Convert dollars to cents (Stripe uses cents)
        amount_in_cents = int(amount * 100)
        result = self.stripe.charge(amount_in_cents)
        
        # Adapt the response format
        return {
            'transaction_id': result['id'],
            'amount': result['amount'] / 100,  # Convert back to dollars
            'currency': result['currency'],
            'success': result['status'] == 'succeeded'
        }
    
    def refund(self, transaction_id: str) -> dict:
        result = self.stripe.reverse_charge(transaction_id)
        return {
            'transaction_id': result['id'],
            'success': result['status'] == 'refunded'
        }

# Client
class PaymentService:
    def __init__(self, gateway: PaymentGateway):
        self.gateway = gateway
    
    def process_payment(self, amount: float) -> dict:
        return self.gateway.pay(amount)
    
    def process_refund(self, transaction_id: str) -> dict:
        return self.gateway.refund(transaction_id)

# Usage
if __name__ == '__main__':
    stripe_api = StripeAPI()
    adapter = StripeAdapter(stripe_api)
    service = PaymentService(adapter)
    
    result = service.process_payment(99.99)
    print(result)
    # {'transaction_id': 'ch_9999', 'amount': 99.99, 'currency': 'usd', 'success': True}
```

### Example 4: Adapter in Java

```java
// Target interface
interface MediaPlayer {
    void play(String audioType, String fileName);
}

// Adaptee interface
interface AdvancedMediaPlayer {
    void playVlc(String fileName);
    void playMp4(String fileName);
}

// Concrete Adaptee implementations
class VlcPlayer implements AdvancedMediaPlayer {
    @Override
    public void playVlc(String fileName) {
        System.out.println("Playing vlc file: " + fileName);
    }
    
    @Override
    public void playMp4(String fileName) {
        // Do nothing
    }
}

class Mp4Player implements AdvancedMediaPlayer {
    @Override
    public void playVlc(String fileName) {
        // Do nothing
    }
    
    @Override
    public void playMp4(String fileName) {
        System.out.println("Playing mp4 file: " + fileName);
    }
}

// Adapter
class MediaAdapter implements MediaPlayer {
    private AdvancedMediaPlayer advancedPlayer;
    
    public MediaAdapter(String audioType) {
        if (audioType.equalsIgnoreCase("vlc")) {
            advancedPlayer = new VlcPlayer();
        } else if (audioType.equalsIgnoreCase("mp4")) {
            advancedPlayer = new Mp4Player();
        }
    }
    
    @Override
    public void play(String audioType, String fileName) {
        if (audioType.equalsIgnoreCase("vlc")) {
            advancedPlayer.playVlc(fileName);
        } else if (audioType.equalsIgnoreCase("mp4")) {
            advancedPlayer.playMp4(fileName);
        }
    }
}

// Client
class AudioPlayer implements MediaPlayer {
    private MediaAdapter mediaAdapter;
    
    @Override
    public void play(String audioType, String fileName) {
        // Built-in support for mp3
        if (audioType.equalsIgnoreCase("mp3")) {
            System.out.println("Playing mp3 file: " + fileName);
        }
        // Use adapter for other formats
        else if (audioType.equalsIgnoreCase("vlc") || 
                 audioType.equalsIgnoreCase("mp4")) {
            mediaAdapter = new MediaAdapter(audioType);
            mediaAdapter.play(audioType, fileName);
        } else {
            System.out.println("Invalid media type: " + audioType);
        }
    }
}

// Usage
public class AdapterPatternDemo {
    public static void main(String[] args) {
        AudioPlayer player = new AudioPlayer();
        player.play("mp3", "song.mp3");
        player.play("mp4", "video.mp4");
        player.play("vlc", "movie.vlc");
        player.play("avi", "movie.avi");
    }
}
```

### Example 5: Real-World Example - Database Adapter

```javascript
// Target interface - what our application expects
class Database {
  connect(config) {
    throw new Error('Must implement connect()');
  }
  
  query(sql) {
    throw new Error('Must implement query()');
  }
  
  close() {
    throw new Error('Must implement close()');
  }
}

// Adaptee - MongoDB driver with different interface
class MongoClient {
  constructor(connectionString) {
    this.connectionString = connectionString;
    this.client = null;
  }
  
  async connectToServer() {
    console.log(`Connecting to MongoDB: ${this.connectionString}`);
    this.client = { connected: true };
    return this.client;
  }
  
  async executeQuery(collection, filter) {
    if (!this.client) {
      throw new Error('Not connected');
    }
    console.log(`MongoDB query: collection=${collection}, filter=${filter}`);
    return { data: [], count: 0 };
  }
  
  async disconnect() {
    console.log('Disconnecting from MongoDB');
    this.client = null;
  }
}

// Adaptee - MySQL driver with different interface
class MySQLConnection {
  constructor(host, port, database, user, password) {
    this.config = { host, port, database, user, password };
    this.connection = null;
  }
  
  async open() {
    console.log(`Opening MySQL connection to ${this.config.host}:${this.config.port}`);
    this.connection = { connected: true };
    return this.connection;
  }
  
  async execute(sql) {
    if (!this.connection) {
      throw new Error('Not connected');
    }
    console.log(`MySQL query: ${sql}`);
    return { rows: [], rowCount: 0 };
  }
  
  async closeConnection() {
    console.log('Closing MySQL connection');
    this.connection = null;
  }
}

// MongoDB Adapter
class MongoAdapter extends Database {
  constructor(connectionString) {
    super();
    this.mongoClient = new MongoClient(connectionString);
    this.connected = false;
  }
  
  async connect(config) {
    await this.mongoClient.connectToServer();
    this.connected = true;
    return this;
  }
  
  async query(sql) {
    // Parse SQL-like query to MongoDB format
    // Simple example: "SELECT * FROM users WHERE age > 25"
    const match = sql.match(/FROM\s+(\w+)\s+WHERE\s+(.+)/i);
    if (match) {
      const collection = match[1];
      const filter = match[2];
      return await this.mongoClient.executeQuery(collection, filter);
    }
    throw new Error('Invalid query format');
  }
  
  async close() {
    await this.mongoClient.disconnect();
    this.connected = false;
  }
}

// MySQL Adapter
class MySQLAdapter extends Database {
  constructor(host, port, database, user, password) {
    super();
    this.mysqlConnection = new MySQLConnection(host, port, database, user, password);
    this.connected = false;
  }
  
  async connect(config) {
    await this.mysqlConnection.open();
    this.connected = true;
    return this;
  }
  
  async query(sql) {
    const result = await this.mysqlConnection.execute(sql);
    // Adapt MySQL result to common format
    return {
      data: result.rows,
      count: result.rowCount
    };
  }
  
  async close() {
    await this.mysqlConnection.closeConnection();
    this.connected = false;
  }
}

// Client code - works with any database through common interface
class DatabaseService {
  constructor(database) {
    this.db = database;
  }
  
  async initialize() {
    await this.db.connect();
  }
  
  async fetchUsers() {
    return await this.db.query('SELECT * FROM users WHERE age > 25');
  }
  
  async cleanup() {
    await this.db.close();
  }
}

// Usage
async function main() {
  // Use MongoDB through adapter
  const mongoAdapter = new MongoAdapter('mongodb://localhost:27017/mydb');
  const mongoService = new DatabaseService(mongoAdapter);
  await mongoService.initialize();
  await mongoService.fetchUsers();
  await mongoService.cleanup();
  
  // Use MySQL through adapter
  const mysqlAdapter = new MySQLAdapter('localhost', 3306, 'mydb', 'user', 'pass');
  const mysqlService = new DatabaseService(mysqlAdapter);
  await mysqlService.initialize();
  await mysqlService.fetchUsers();
  await mysqlService.cleanup();
}

main();
```

### Example 6: API Response Adapter

```javascript
// Target interface - what our frontend expects
class UserService {
  getUsers() {
    throw new Error('Must implement getUsers()');
  }
  
  getUserById(id) {
    throw new Error('Must implement getUserById()');
  }
}

// Adaptee - Old API with different response format
class LegacyUserAPI {
  async fetchAllUsers() {
    // Returns: { users: [...], total: 10, page: 1 }
    return {
      users: [
        { user_id: 1, user_name: 'John', user_email: 'john@example.com' },
        { user_id: 2, user_name: 'Jane', user_email: 'jane@example.com' }
      ],
      total: 2,
      page: 1
    };
  }
  
  async fetchUser(userId) {
    return {
      user_id: userId,
      user_name: 'John',
      user_email: 'john@example.com',
      user_created: '2023-01-01'
    };
  }
}

// Adaptee - New API with different response format
class ModernUserAPI {
  async list() {
    // Returns: { data: [...], meta: { count: 10, page: 1 } }
    return {
      data: [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' }
      ],
      meta: {
        count: 2,
        page: 1
      }
    };
  }
  
  async find(id) {
    return {
      id: id,
      name: 'John',
      email: 'john@example.com',
      createdAt: '2023-01-01'
    };
  }
}

// Legacy API Adapter
class LegacyUserAdapter extends UserService {
  constructor(legacyAPI) {
    super();
    this.api = legacyAPI;
  }
  
  async getUsers() {
    const response = await this.api.fetchAllUsers();
    // Transform legacy format to expected format
    return {
      users: response.users.map(user => ({
        id: user.user_id,
        name: user.user_name,
        email: user.user_email
      })),
      total: response.total,
      page: response.page
    };
  }
  
  async getUserById(id) {
    const response = await this.api.fetchUser(id);
    return {
      id: response.user_id,
      name: response.user_name,
      email: response.user_email,
      createdAt: response.user_created
    };
  }
}

// Modern API Adapter
class ModernUserAdapter extends UserService {
  constructor(modernAPI) {
    super();
    this.api = modernAPI;
  }
  
  async getUsers() {
    const response = await this.api.list();
    return {
      users: response.data,
      total: response.meta.count,
      page: response.meta.page
    };
  }
  
  async getUserById(id) {
    return await this.api.find(id);
  }
}

// Client - works with any adapter
class UserController {
  constructor(userService) {
    this.service = userService;
  }
  
  async displayUsers() {
    const result = await this.service.getUsers();
    console.log(`Found ${result.total} users:`);
    result.users.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });
  }
  
  async displayUser(id) {
    const user = await this.service.getUserById(id);
    console.log(`User: ${user.name} - ${user.email}`);
  }
}

// Usage
const legacyAPI = new LegacyUserAPI();
const legacyAdapter = new LegacyUserAdapter(legacyAPI);
const legacyController = new UserController(legacyAdapter);
await legacyController.displayUsers();

const modernAPI = new ModernUserAPI();
const modernAdapter = new ModernUserAdapter(modernAPI);
const modernController = new UserController(modernAdapter);
await modernController.displayUsers();
```

---

## 🔄 Variations

### 1. Two-Way Adapter

```javascript
// Adapter that works in both directions
class TwoWayAdapter {
  constructor(adaptee) {
    this.adaptee = adaptee;
  }
  
  // Adapt Adaptee to Target
  targetMethod() {
    return this.adaptee.adapteeMethod();
  }
  
  // Adapt Target to Adaptee
  adapteeMethod() {
    return this.adaptee.targetMethod();
  }
}
```

### 2. Pluggable Adapter

```javascript
// Adapter that can be configured at runtime
class PluggableAdapter {
  constructor(adaptee, mappings) {
    this.adaptee = adaptee;
    this.mappings = mappings; // Map target methods to adaptee methods
  }
  
  call(methodName, ...args) {
    const adapteeMethod = this.mappings[methodName];
    if (!adapteeMethod) {
      throw new Error(`Method ${methodName} not mapped`);
    }
    return this.adaptee[adapteeMethod](...args);
  }
}

// Usage
const adapter = new PluggableAdapter(legacySystem, {
  'processPayment': 'makePayment',
  'getStatus': 'getPaymentStatus'
});
```

### 3. Default Adapter (Null Object Pattern)

```javascript
// Adapter that provides default implementations
class DefaultAdapter {
  request() {
    // Default behavior - do nothing or return default value
    return 'Default response';
  }
}
```

### 4. Adapter with Caching

```javascript
class CachingAdapter {
  constructor(adaptee) {
    this.adaptee = adaptee;
    this.cache = new Map();
  }
  
  request(key) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    const result = this.adaptee.specificRequest(key);
    this.cache.set(key, result);
    return result;
  }
}
```

---

## 🌍 Real-World Examples

### 1. JavaScript Array Methods

JavaScript's array methods adapt array-like objects:

```javascript
// Array-like object (adaptee)
const arrayLike = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3
};

// Array methods adapt array-like objects
Array.prototype.slice.call(arrayLike); // ['a', 'b', 'c']
Array.from(arrayLike); // ['a', 'b', 'c']
```

### 2. jQuery

jQuery adapts different browser APIs to a unified interface:

```javascript
// Adapts different browser event APIs
$(element).on('click', handler); // Works across all browsers
```

### 3. Axios/Fetch Adapters

HTTP libraries adapt different request interfaces:

```javascript
// Axios adapts XMLHttpRequest and fetch to a common interface
axios.get('/api/users'); // Works the same regardless of underlying implementation
```

### 4. ORM Libraries

ORM libraries adapt different database drivers:

```javascript
// Sequelize adapts MySQL, PostgreSQL, SQLite to a common interface
const User = sequelize.define('User', {
  name: DataTypes.STRING
});

// Same code works with different databases
await User.findAll(); // Works with MySQL, PostgreSQL, etc.
```

### 5. React Native

React Native adapts platform-specific components:

```javascript
// Adapts iOS and Android native components to React components
import { Platform, View } from 'react-native';

// Platform-specific adapters handle the differences
<View> {/* Works on both iOS and Android */}
```

### 6. Payment Gateway Adapters

E-commerce platforms use adapters for different payment providers:

```javascript
// Stripe, PayPal, Square all have different APIs
// Adapters provide a unified interface
class PaymentAdapter {
  processPayment(amount) {
    // Adapts to specific provider's API
  }
}
```

---

## 🔗 Related Patterns

### Adapter vs Decorator

**Adapter:**
- Changes interface to make incompatible classes work together
- Focuses on interface conversion
- Usually wraps one object

**Decorator:**
- Adds new behavior without changing interface
- Focuses on adding functionality
- Can wrap multiple decorators

### Adapter vs Facade

**Adapter:**
- Makes one interface compatible with another
- Usually one-to-one relationship
- Works with incompatible interfaces

**Facade:**
- Provides a simplified interface to a complex subsystem
- Usually one-to-many relationship
- Works with multiple related classes

### Adapter vs Bridge

**Adapter:**
- Makes existing classes work together
- Applied after classes are designed
- Focuses on making incompatible interfaces compatible

**Bridge:**
- Separates abstraction from implementation
- Applied during design
- Focuses on decoupling abstraction and implementation

### Adapter vs Proxy

**Adapter:**
- Changes interface
- Focuses on compatibility
- Client knows about adapter

**Proxy:**
- Maintains same interface
- Focuses on access control or lazy loading
- Client may not know about proxy

---

## ✅ Advantages

1. **Reusability** - Allows reuse of existing classes with incompatible interfaces
2. **Flexibility** - Can adapt multiple adaptees to the same target
3. **Separation of Concerns** - Keeps adaptation logic separate from business logic
4. **Open/Closed Principle** - Can add new adapters without modifying existing code
5. **Single Responsibility** - Adapter has one job: make interfaces compatible
6. **Testability** - Easy to mock adapters for testing

---

## ❌ Disadvantages

1. **Complexity** - Adds extra layer of indirection
2. **Performance** - Slight overhead from additional method calls
3. **Can be overused** - Sometimes it's better to refactor interfaces directly
4. **Maintenance** - Need to maintain adapter when adaptee changes
5. **Multiple Adapters** - Can lead to many adapter classes if not managed well

---

## 🎓 Best Practices

### 1. Prefer Object Adapter Over Class Adapter

```javascript
// Good - Object Adapter (Composition)
class Adapter {
  constructor(adaptee) {
    this.adaptee = adaptee; // Composition
  }
}

// Avoid - Class Adapter (Inheritance) - requires multiple inheritance
// Not available in JavaScript/TypeScript
```

### 2. Keep Adapters Simple

```javascript
// Good - Simple, focused adapter
class PaymentAdapter {
  constructor(legacyPayment) {
    this.legacy = legacyPayment;
  }
  
  pay(amount) {
    return this.legacy.makePayment(amount);
  }
}

// Bad - Adapter doing too much
class ComplexAdapter {
  constructor(adaptee) {
    this.adaptee = adaptee;
    this.cache = new Map();
    this.logger = new Logger();
    this.validator = new Validator();
    // Too many responsibilities
  }
}
```

### 3. Use Meaningful Names

```javascript
// Good
class StripePaymentAdapter {
  // Clear what it adapts
}

// Bad
class Adapter1 {
  // Unclear purpose
}
```

### 4. Document Interface Mappings

```javascript
/**
 * Adapter for LegacyPaymentSystem
 * 
 * Interface Mappings:
 * - processPayment() -> makePayment()
 * - getStatus() -> getPaymentStatus()
 * - cancel() -> voidTransaction()
 */
class LegacyPaymentAdapter {
  // ...
}
```

### 5. Handle Errors Appropriately

```javascript
class PaymentAdapter {
  constructor(legacyPayment) {
    this.legacy = legacyPayment;
  }
  
  pay(amount) {
    try {
      return this.legacy.makePayment(amount);
    } catch (error) {
      // Adapt error to expected format
      throw new PaymentError(error.message);
    }
  }
}
```

### 6. Consider Adapter Lifecycle

```javascript
class DatabaseAdapter {
  constructor(database) {
    this.db = database;
    this.connected = false;
  }
  
  async connect() {
    if (!this.connected) {
      await this.db.openConnection();
      this.connected = true;
    }
  }
  
  async disconnect() {
    if (this.connected) {
      await this.db.closeConnection();
      this.connected = false;
    }
  }
}
```

---

## 🚫 Common Pitfalls

### 1. Over-Adapting

**Problem:**
```javascript
// Creating adapter for something that doesn't need it
class SimpleAdapter {
  constructor(obj) {
    this.obj = obj;
  }
  
  getValue() {
    return this.obj.value; // Unnecessary indirection
  }
}
```

**Solution:** Only use adapter when interfaces are truly incompatible.

### 2. Adapter Doing Too Much

**Problem:**
```javascript
class GodAdapter {
  constructor(adaptee) {
    this.adaptee = adaptee;
    // Adapter doing business logic, validation, caching, etc.
  }
}
```

**Solution:** Keep adapters focused on interface conversion only.

### 3. Not Handling Type Conversions

**Problem:**
```javascript
class Adapter {
  constructor(adaptee) {
    this.adaptee = adaptee;
  }
  
  process(amount) {
    // Forgetting to convert types
    return this.adaptee.process(amount); // amount might be in different format
  }
}
```

**Solution:** Properly convert types and formats in adapter.

### 4. Creating Adapters for Everything

**Problem:**
```javascript
// Creating adapters when refactoring would be better
class EverythingAdapter {
  // Adapting everything instead of fixing the root cause
}
```

**Solution:** Consider if refactoring the interface would be better.

### 5. Ignoring Error Adaptation

**Problem:**
```javascript
class Adapter {
  request() {
    // Not adapting errors - client gets unexpected error types
    return this.adaptee.specificRequest();
  }
}
```

**Solution:** Adapt errors to match expected error types.

---

## 📚 Practice Exercises

### Exercise 1: Temperature Converter Adapter

Create adapters for different temperature APIs:
- Celsius API: `getTemperature()` returns Celsius
- Fahrenheit API: `getTemp()` returns Fahrenheit
- Kelvin API: `readTemp()` returns Kelvin

Create adapters so all return a unified format.

### Exercise 2: Logging Adapter

Create adapters for different logging libraries:
- Console logger: `log(message)`
- File logger: `writeLog(entry)`
- Remote logger: `sendLog(data)`

Create adapters so all use a common interface: `log(level, message, metadata)`.

### Exercise 3: Storage Adapter

Create adapters for different storage backends:
- LocalStorage: `setItem(key, value)`, `getItem(key)`
- IndexedDB: `put(key, value)`, `get(key)`
- Remote API: `save(key, data)`, `load(key)`

Create adapters so all use: `store(key, value)`, `retrieve(key)`.

---

## 🔍 Code Review Checklist

When reviewing Adapter implementations, check:

- [ ] Adapter correctly converts interface from adaptee to target
- [ ] Adapter handles type conversions properly
- [ ] Adapter handles errors appropriately
- [ ] Adapter is simple and focused (not doing business logic)
- [ ] Adapter uses composition (object adapter) when possible
- [ ] Adapter has meaningful name indicating what it adapts
- [ ] Interface mappings are documented
- [ ] Adapter is tested with different adaptee implementations
- [ ] Client code doesn't depend on adaptee directly
- [ ] Adapter lifecycle is managed properly (if needed)

---

## 📖 Further Reading

1. **Design Patterns: Elements of Reusable Object-Oriented Software (GoF)**
   - Chapter 4: Structural Patterns - Adapter

2. **Refactoring Guru**
   - https://refactoring.guru/design-patterns/adapter

3. **SourceMaking**
   - https://sourcemaking.com/design_patterns/adapter

4. **Adapter Pattern in Modern JavaScript**
   - ES6+ implementations and variations

---

## 📝 Notes Section

_Add your notes, observations, and insights here as you learn..._

### Key Takeaways

- Adapter makes incompatible interfaces work together
- Object adapter (composition) is preferred over class adapter (inheritance)
- Adapters should be simple and focused on interface conversion
- Use when integrating third-party libraries or legacy code
- Don't use when you can modify the source code directly

### Questions to Explore

- When should I use Adapter vs refactoring the interface?
- How do I handle multiple adaptees with one adapter?
- What's the difference between Adapter and Facade?
- How do I test adapters effectively?
- When is it better to create a new interface instead of adapting?

### Personal Examples

_Add your own code examples and use cases here..._

---

## 🎯 Summary

The **Adapter Pattern** is a powerful structural pattern that:

- ✅ Makes incompatible interfaces work together
- ✅ Enables reuse of existing classes
- ✅ Keeps adaptation logic separate from business logic
- ✅ Is essential for integrating third-party libraries
- ✅ Provides flexibility in working with different implementations

Remember: Use it when you need to make incompatible interfaces compatible, but don't overuse it when refactoring would be better!

---

**Date Created:** 2025-12-16  
**Pattern Type:** Structural  
**Difficulty:** Intermediate  
**Related Patterns:** Decorator, Facade, Bridge, Proxy

