# Proxy Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Proxy pattern definition and intent
- [ ] Learn different types of proxies (Virtual, Remote, Protection, etc.)
- [ ] Master controlling access to objects
- [ ] Recognize real-world applications
- [ ] Understand when to use Proxy vs other patterns
- [ ] Practice implementing Proxy in different scenarios
- [ ] Learn common pitfalls and best practices

---

## 🎯 Definition

**Proxy Pattern** is a structural design pattern that provides a surrogate or placeholder for another object to control access to it.

**Intent (GoF):**
- Provide a surrogate or placeholder for another object to control access to it
- Use an extra level of indirection to support distributed, controlled, or intelligent access
- Add a wrapper and delegation to protect the real component from undue complexity

**Key Principle:**
> "Control access" - The proxy pattern provides a representative object that controls access to another object, allowing you to perform something either before or after the request gets through to the original object.

---

## 🏗️ Structure

### UML Diagram Concept

```
Subject (Interface)
├── request(): void

RealSubject implements Subject
└── request(): void
    └── performs actual operation

Proxy implements Subject
├── realSubject: RealSubject
└── request(): void
    ├── pre-processing (if needed)
    ├── calls realSubject.request()
    └── post-processing (if needed)

Client
└── uses Subject (may be Proxy or RealSubject)
```

### Participants

1. **Subject** - Defines the common interface for RealSubject and Proxy so that a Proxy can be used anywhere a RealSubject is expected
2. **RealSubject** - Defines the real object that the proxy represents
3. **Proxy** - Maintains a reference to the RealSubject, controls access to it, and may be responsible for creating and deleting it
4. **Client** - Interacts with the Subject interface

### Key Concepts

**Proxy:**
- Implements the same interface as RealSubject
- Maintains a reference to RealSubject
- Controls access to RealSubject
- Can perform operations before/after forwarding requests

**Types of Proxies:**
- **Virtual Proxy**: Creates expensive objects on demand
- **Remote Proxy**: Represents an object in a different address space
- **Protection Proxy**: Controls access to the original object
- **Smart Reference**: Adds additional actions when object is accessed
- **Cache Proxy**: Provides temporary storage of results

---

## 💡 When to Use

### Use Proxy When:

✅ **You need to control access to an object**
- Example: Lazy loading, access control, logging

✅ **You want to add functionality when accessing an object**
- Example: Caching, reference counting, synchronization

✅ **The object is expensive to create or access**
- Example: Large images, database connections, network resources

✅ **You need to represent an object in a different location**
- Example: Remote procedure calls, distributed systems

✅ **You want to add a layer of indirection for security or performance**
- Example: API gateways, firewalls, load balancers

### Don't Use When:

❌ **The overhead of indirection is not justified** - Direct access is simpler
❌ **You need to add behavior that changes the interface** - Use Decorator instead
❌ **The object is simple and doesn't need control** - Direct access is better
❌ **You need to add multiple independent behaviors** - Use Decorator instead

---

## 🔨 Implementation Examples

### Example 1: Basic Proxy Pattern (JavaScript/TypeScript)

```typescript
// Subject Interface
interface Image {
  display(): void;
}

// RealSubject
class RealImage implements Image {
  private filename: string;
  
  constructor(filename: string) {
    this.filename = filename;
    this.loadFromDisk(); // Expensive operation
  }
  
  private loadFromDisk(): void {
    console.log(`Loading ${this.filename} from disk...`);
    // Simulated expensive operation
    for (let i = 0; i < 1000000; i++) {
      // Loading image data
    }
    console.log(`${this.filename} loaded`);
  }
  
  display(): void {
    console.log(`Displaying ${this.filename}`);
  }
}

// Proxy - Virtual Proxy (Lazy Loading)
class ProxyImage implements Image {
  private realImage: RealImage | null = null;
  private filename: string;
  
  constructor(filename: string) {
    this.filename = filename;
    // Note: RealImage is NOT created here
  }
  
  display(): void {
    // Lazy initialization - create RealImage only when needed
    if (this.realImage === null) {
      this.realImage = new RealImage(this.filename);
    }
    this.realImage.display();
  }
}

// Usage
console.log('=== Without Proxy (eager loading) ===');
const image1 = new RealImage('photo1.jpg');
// Output: Loading photo1.jpg from disk...
//         photo1.jpg loaded
image1.display();
// Output: Displaying photo1.jpg

console.log('\n=== With Proxy (lazy loading) ===');
const image2 = new ProxyImage('photo2.jpg');
// No loading happens yet!
console.log('Proxy created, but image not loaded');

image2.display();
// Output: Loading photo2.jpg from disk...
//         photo2.jpg loaded
//         Displaying photo2.jpg

// Second call - image already loaded
image2.display();
// Output: Displaying photo2.jpg (no loading)
```

### Example 2: Protection Proxy (Access Control)

```typescript
// Subject Interface
interface BankAccount {
  deposit(amount: number): void;
  withdraw(amount: number): void;
  getBalance(): number;
}

// RealSubject
class RealBankAccount implements BankAccount {
  private balance: number = 0;
  
  deposit(amount: number): void {
    this.balance += amount;
    console.log(`Deposited $${amount}. New balance: $${this.balance}`);
  }
  
  withdraw(amount: number): void {
    if (this.balance >= amount) {
      this.balance -= amount;
      console.log(`Withdrew $${amount}. New balance: $${this.balance}`);
    } else {
      console.log('Insufficient funds');
    }
  }
  
  getBalance(): number {
    return this.balance;
  }
}

// User Roles
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

// Protection Proxy
class ProtectedBankAccount implements BankAccount {
  private realAccount: RealBankAccount;
  private userRole: UserRole;
  
  constructor(realAccount: RealBankAccount, userRole: UserRole) {
    this.realAccount = realAccount;
    this.userRole = userRole;
  }
  
  deposit(amount: number): void {
    if (this.userRole === UserRole.GUEST) {
      throw new Error('Guests cannot deposit money');
    }
    this.realAccount.deposit(amount);
  }
  
  withdraw(amount: number): void {
    if (this.userRole === UserRole.GUEST) {
      throw new Error('Guests cannot withdraw money');
    }
    if (this.userRole === UserRole.USER && amount > 1000) {
      throw new Error('Users cannot withdraw more than $1000');
    }
    this.realAccount.withdraw(amount);
  }
  
  getBalance(): number {
    if (this.userRole === UserRole.GUEST) {
      throw new Error('Guests cannot view balance');
    }
    return this.realAccount.getBalance();
  }
}

// Usage
const account = new RealBankAccount();
account.deposit(5000);

// Admin has full access
const adminProxy = new ProtectedBankAccount(account, UserRole.ADMIN);
adminProxy.withdraw(2000); // OK
console.log(`Admin balance: $${adminProxy.getBalance()}`); // OK

// User has limited access
const userProxy = new ProtectedBankAccount(account, UserRole.USER);
userProxy.withdraw(500); // OK
try {
  userProxy.withdraw(1500); // Error: limit exceeded
} catch (error) {
  console.error(error.message);
}

// Guest has no access
const guestProxy = new ProtectedBankAccount(account, UserRole.GUEST);
try {
  guestProxy.getBalance(); // Error: no access
} catch (error) {
  console.error(error.message);
}
```

### Example 3: Virtual Proxy (Lazy Loading with Caching)

```typescript
// Subject Interface
interface ExpensiveObject {
  process(): string;
}

// RealSubject - Expensive to create
class ExpensiveDatabaseConnection implements ExpensiveObject {
  private connectionId: string;
  
  constructor() {
    console.log('Creating expensive database connection...');
    // Simulated expensive operation
    this.connectionId = `conn-${Date.now()}`;
    // Simulate connection time
    for (let i = 0; i < 5000000; i++) {
      // Connecting...
    }
    console.log(`Database connection ${this.connectionId} established`);
  }
  
  process(): string {
    return `Processing with connection ${this.connectionId}`;
  }
  
  close(): void {
    console.log(`Closing connection ${this.connectionId}`);
  }
}

// Virtual Proxy - Creates object only when needed
class VirtualProxy implements ExpensiveObject {
  private realObject: ExpensiveDatabaseConnection | null = null;
  
  process(): string {
    // Lazy initialization
    if (this.realObject === null) {
      this.realObject = new ExpensiveDatabaseConnection();
    }
    return this.realObject.process();
  }
  
  // Additional method to manage lifecycle
  close(): void {
    if (this.realObject !== null) {
      this.realObject.close();
      this.realObject = null;
    }
  }
}

// Usage
console.log('=== Virtual Proxy Example ===');
const proxy = new VirtualProxy();
console.log('Proxy created, but expensive object not created yet');

// First call - creates expensive object
const result1 = proxy.process();
console.log(result1);

// Second call - uses existing object
const result2 = proxy.process();
console.log(result2);

// Clean up
proxy.close();
```

### Example 4: Cache Proxy

```typescript
// Subject Interface
interface DataService {
  fetchData(key: string): Promise<any>;
}

// RealSubject
class RealDataService implements DataService {
  async fetchData(key: string): Promise<any> {
    console.log(`[REAL] Fetching data for key: ${key}`);
    // Simulate network/database call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      key,
      data: `Data for ${key}`,
      timestamp: Date.now()
    };
  }
}

// Cache Proxy
class CacheProxy implements DataService {
  private realService: DataService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number; // Time to live in milliseconds
  
  constructor(realService: DataService, ttl: number = 60000) {
    this.realService = realService;
    this.ttl = ttl;
  }
  
  async fetchData(key: string): Promise<any> {
    const cached = this.cache.get(key);
    
    // Check if cached data is still valid
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      console.log(`[CACHE] Cache hit for key: ${key}`);
      return cached.data;
    }
    
    // Cache miss or expired - fetch from real service
    console.log(`[CACHE] Cache miss for key: ${key}`);
    const data = await this.realService.fetchData(key);
    
    // Store in cache
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  }
  
  clearCache(): void {
    this.cache.clear();
    console.log('[CACHE] Cache cleared');
  }
  
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Usage
const realService = new RealDataService();
const cacheProxy = new CacheProxy(realService, 5000); // 5 second TTL

(async () => {
  console.log('=== First Request (Cache Miss) ===');
  const data1 = await cacheProxy.fetchData('user-123');
  console.log('Data:', data1);
  
  console.log('\n=== Second Request (Cache Hit) ===');
  const data2 = await cacheProxy.fetchData('user-123');
  console.log('Data:', data2);
  
  console.log('\n=== Cache Stats ===');
  console.log(cacheProxy.getCacheStats());
  
  console.log('\n=== After TTL Expires ===');
  await new Promise(resolve => setTimeout(resolve, 6000));
  const data3 = await cacheProxy.fetchData('user-123');
  console.log('Data:', data3);
})();
```

### Example 5: Remote Proxy (API Gateway)

```typescript
// Subject Interface
interface PaymentService {
  processPayment(amount: number, cardNumber: string): Promise<PaymentResult>;
}

// RealSubject - Remote Service (simulated)
class RemotePaymentService implements PaymentService {
  private apiUrl: string;
  
  constructor(apiUrl: string) {
    this.apiUrl = apiUrl;
  }
  
  async processPayment(amount: number, cardNumber: string): Promise<PaymentResult> {
    console.log(`[REMOTE] Calling payment API at ${this.apiUrl}`);
    
    // Simulate network call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulated response
    return {
      success: true,
      transactionId: `TXN-${Date.now()}`,
      amount,
      timestamp: new Date().toISOString()
    };
  }
}

// Remote Proxy - Adds local functionality
class PaymentServiceProxy implements PaymentService {
  private remoteService: RemotePaymentService;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private rateLimit: number = 10; // requests per second
  
  constructor(remoteService: RemotePaymentService) {
    this.remoteService = remoteService;
  }
  
  async processPayment(amount: number, cardNumber: string): Promise<PaymentResult> {
    // Rate limiting
    const now = Date.now();
    if (now - this.lastRequestTime < 1000) {
      this.requestCount++;
      if (this.requestCount > this.rateLimit) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
    } else {
      this.requestCount = 1;
      this.lastRequestTime = now;
    }
    
    // Validation
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    
    if (!/^\d{16}$/.test(cardNumber)) {
      throw new Error('Invalid card number');
    }
    
    // Logging
    console.log(`[PROXY] Processing payment: $${amount}`);
    
    try {
      // Forward to remote service
      const result = await this.remoteService.processPayment(amount, cardNumber);
      
      console.log(`[PROXY] Payment successful: ${result.transactionId}`);
      return result;
    } catch (error) {
      console.error(`[PROXY] Payment failed:`, error);
      throw error;
    }
  }
  
  getRequestStats(): { count: number; lastRequest: number } {
    return {
      count: this.requestCount,
      lastRequest: this.lastRequestTime
    };
  }
}

// Usage
const remoteService = new RemotePaymentService('https://api.payment.com');
const proxy = new PaymentServiceProxy(remoteService);

(async () => {
  try {
    const result = await proxy.processPayment(100, '1234567890123456');
    console.log('Result:', result);
    console.log('Stats:', proxy.getRequestStats());
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
```

### Example 6: Smart Reference Proxy

```typescript
// Subject Interface
interface File {
  read(): string;
  write(content: string): void;
  getSize(): number;
}

// RealSubject
class RealFile implements File {
  private content: string;
  private filename: string;
  
  constructor(filename: string, initialContent: string = '') {
    this.filename = filename;
    this.content = initialContent;
    console.log(`[FILE] Opened ${filename}`);
  }
  
  read(): string {
    console.log(`[FILE] Reading from ${this.filename}`);
    return this.content;
  }
  
  write(content: string): void {
    console.log(`[FILE] Writing to ${this.filename}`);
    this.content = content;
  }
  
  getSize(): number {
    return this.content.length;
  }
  
  close(): void {
    console.log(`[FILE] Closed ${this.filename}`);
  }
}

// Smart Reference Proxy - Adds reference counting and auto-cleanup
class SmartFileProxy implements File {
  private realFile: RealFile | null = null;
  private filename: string;
  private referenceCount: number = 0;
  private static openFiles: Map<string, { file: RealFile; refCount: number }> = new Map();
  
  constructor(filename: string) {
    this.filename = filename;
  }
  
  private getFile(): RealFile {
    let fileEntry = SmartFileProxy.openFiles.get(this.filename);
    
    if (!fileEntry) {
      // Create new file
      const file = new RealFile(this.filename);
      fileEntry = { file, refCount: 0 };
      SmartFileProxy.openFiles.set(this.filename, fileEntry);
    }
    
    // Increment reference count
    fileEntry.refCount++;
    this.referenceCount++;
    
    return fileEntry.file;
  }
  
  read(): string {
    if (this.realFile === null) {
      this.realFile = this.getFile();
    }
    return this.realFile.read();
  }
  
  write(content: string): void {
    if (this.realFile === null) {
      this.realFile = this.getFile();
    }
    this.realFile.write(content);
  }
  
  getSize(): number {
    if (this.realFile === null) {
      this.realFile = this.getFile();
    }
    return this.realFile.getSize();
  }
  
  // Cleanup when proxy is no longer needed
  release(): void {
    if (this.realFile !== null) {
      const fileEntry = SmartFileProxy.openFiles.get(this.filename);
      if (fileEntry) {
        fileEntry.refCount--;
        this.referenceCount--;
        
        // Close file if no more references
        if (fileEntry.refCount === 0) {
          fileEntry.file.close();
          SmartFileProxy.openFiles.delete(this.filename);
        }
      }
      this.realFile = null;
    }
  }
  
  static getOpenFilesCount(): number {
    return SmartFileProxy.openFiles.size;
  }
}

// Usage
console.log('=== Smart Reference Proxy ===');

const proxy1 = new SmartFileProxy('document.txt');
proxy1.write('Hello World');
console.log(`Size: ${proxy1.getSize()}`);

const proxy2 = new SmartFileProxy('document.txt'); // Same file
proxy2.write('Updated content');
console.log(`Size: ${proxy2.getSize()}`);

console.log(`Open files: ${SmartFileProxy.getOpenFilesCount()}`);

proxy1.release();
console.log(`Open files after release 1: ${SmartFileProxy.getOpenFilesCount()}`);

proxy2.release();
console.log(`Open files after release 2: ${SmartFileProxy.getOpenFilesCount()}`);
```

### Example 7: Logging Proxy

```typescript
// Subject Interface
interface Calculator {
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
  multiply(a: number, b: number): number;
  divide(a: number, b: number): number;
}

// RealSubject
class RealCalculator implements Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
  
  subtract(a: number, b: number): number {
    return a - b;
  }
  
  multiply(a: number, b: number): number {
    return a * b;
  }
  
  divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error('Division by zero');
    }
    return a / b;
  }
}

// Logging Proxy
class LoggingProxy implements Calculator {
  private calculator: Calculator;
  private logs: Array<{ method: string; args: any[]; result: any; timestamp: number }> = [];
  
  constructor(calculator: Calculator) {
    this.calculator = calculator;
  }
  
  private log(method: string, args: any[], result: any): void {
    this.logs.push({
      method,
      args,
      result,
      timestamp: Date.now()
    });
    console.log(`[LOG] ${method}(${args.join(', ')}) = ${result}`);
  }
  
  add(a: number, b: number): number {
    const result = this.calculator.add(a, b);
    this.log('add', [a, b], result);
    return result;
  }
  
  subtract(a: number, b: number): number {
    const result = this.calculator.subtract(a, b);
    this.log('subtract', [a, b], result);
    return result;
  }
  
  multiply(a: number, b: number): number {
    const result = this.calculator.multiply(a, b);
    this.log('multiply', [a, b], result);
    return result;
  }
  
  divide(a: number, b: number): number {
    try {
      const result = this.calculator.divide(a, b);
      this.log('divide', [a, b], result);
      return result;
    } catch (error) {
      console.error(`[LOG] divide(${a}, ${b}) failed: ${error.message}`);
      throw error;
    }
  }
  
  getLogs(): Array<{ method: string; args: any[]; result: any; timestamp: number }> {
    return [...this.logs];
  }
  
  clearLogs(): void {
    this.logs = [];
    console.log('[LOG] Logs cleared');
  }
}

// Usage
const calculator = new RealCalculator();
const loggingProxy = new LoggingProxy(calculator);

loggingProxy.add(5, 3);
loggingProxy.subtract(10, 4);
loggingProxy.multiply(6, 7);
loggingProxy.divide(20, 4);

console.log('\n=== All Logs ===');
console.log(loggingProxy.getLogs());
```

---

## 🔄 Proxy vs Other Patterns

### Proxy vs Decorator

| Aspect | Proxy | Decorator |
|--------|-------|-----------|
| **Purpose** | Control access | Add behavior |
| **Focus** | Access management | Functionality extension |
| **Composition** | Usually one proxy | Can stack multiple decorators |
| **When** | Need to control access | Need to add features |
| **Relationship** | Represents same object | Wraps to enhance |

**Example:**
- **Proxy**: Controls when/how to access an expensive image
- **Decorator**: Adds border, shadow, effects to an image

### Proxy vs Adapter

| Aspect | Proxy | Adapter |
|--------|-------|---------|
| **Purpose** | Control access | Convert interface |
| **Interface** | Same as subject | Different from adaptee |
| **Focus** | Access management | Interface conversion |
| **When** | Need access control | Need interface compatibility |

### Proxy vs Facade

| Aspect | Proxy | Facade |
|--------|-------|--------|
| **Purpose** | Control access to one object | Simplify interface to subsystem |
| **Objects** | One object | Multiple objects |
| **Focus** | Access control | Interface simplification |
| **When** | Need to control access | Need to simplify subsystem |

---

## 🎨 Real-World Applications

### 1. JavaScript/TypeScript

**ES6 Proxy:**
```javascript
// JavaScript has built-in Proxy
const target = {
  message: 'Hello'
};

const handler = {
  get: function(target, prop) {
    console.log(`Accessing property: ${prop}`);
    return target[prop];
  },
  set: function(target, prop, value) {
    console.log(`Setting property: ${prop} to ${value}`);
    target[prop] = value;
    return true;
  }
};

const proxy = new Proxy(target, handler);
console.log(proxy.message); // Logs access, returns "Hello"
proxy.message = 'World'; // Logs set operation
```

**React Context Proxy:**
```javascript
// React Context can act as a proxy
const AuthContext = React.createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  // Proxy controls access to user data
  const value = {
    user,
    login: (userData) => {
      // Validation, logging, etc.
      setUser(userData);
    },
    logout: () => {
      // Cleanup, logging, etc.
      setUser(null);
    }
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
```

### 2. API Gateways

```typescript
// API Gateway acts as a proxy
class APIGateway {
  private services: Map<string, Service>;
  
  route(request: Request): Response {
    // Rate limiting
    if (!this.checkRateLimit(request)) {
      return { status: 429, message: 'Rate limit exceeded' };
    }
    
    // Authentication
    if (!this.authenticate(request)) {
      return { status: 401, message: 'Unauthorized' };
    }
    
    // Routing to appropriate service
    const service = this.services.get(request.path);
    return service.handle(request);
  }
}
```

### 3. ORM Proxies

```typescript
// ORMs use proxies for lazy loading
class User {
  id: number;
  name: string;
  // Posts are loaded lazily via proxy
  posts: Post[]; // Proxy that loads on access
}

const user = await User.findById(1);
// user.posts is a proxy, not loaded yet

console.log(user.posts.length); // Proxy loads posts here
```

### 4. Network Proxies

```typescript
// HTTP proxy
class HTTPProxy {
  async request(url: string, options: RequestOptions): Promise<Response> {
    // Caching
    const cached = this.cache.get(url);
    if (cached) return cached;
    
    // Forward to real service
    const response = await fetch(url, options);
    
    // Cache response
    this.cache.set(url, response);
    return response;
  }
}
```

### 5. Database Connection Pooling

```typescript
// Connection pool uses proxy pattern
class ConnectionPool {
  private connections: Connection[] = [];
  private maxConnections: number = 10;
  
  getConnection(): ConnectionProxy {
    // Returns proxy that manages connection lifecycle
    return new ConnectionProxy(this);
  }
}

class ConnectionProxy {
  private realConnection: Connection | null = null;
  
  query(sql: string): Result {
    if (!this.realConnection) {
      this.realConnection = this.pool.acquire();
    }
    return this.realConnection.query(sql);
  }
  
  release(): void {
    if (this.realConnection) {
      this.pool.release(this.realConnection);
      this.realConnection = null;
    }
  }
}
```

---

## ⚠️ Common Pitfalls and Best Practices

### Pitfalls

❌ **Proxy Becomes Too Complex**
- Problem: Proxy accumulates too much logic
- Solution: Keep proxy focused on access control, delegate business logic

```typescript
// ❌ Bad: Proxy doing too much
class BadProxy {
  request() {
    // Validation
    // Business logic
    // Caching
    // Logging
    // Error handling
    // ... too much!
  }
}

// ✅ Good: Focused proxy
class GoodProxy {
  request() {
    // Only access control
    if (!this.hasAccess()) {
      throw new Error('Access denied');
    }
    return this.realSubject.request();
  }
}
```

❌ **Not Maintaining Interface Contract**
- Problem: Proxy doesn't implement full Subject interface
- Solution: Ensure proxy implements all methods of Subject

```typescript
// ❌ Bad: Missing methods
class BadProxy implements Subject {
  method1() { }
  // Missing method2()!
}

// ✅ Good: Full interface
class GoodProxy implements Subject {
  method1() { }
  method2() { }
  method3() { }
}
```

❌ **Circular References**
- Problem: Proxy and RealSubject reference each other
- Solution: Use one-way references, proxy → realSubject

```typescript
// ❌ Bad: Circular reference
class BadProxy {
  constructor(private realSubject: RealSubject) {
    this.realSubject.setProxy(this); // Circular!
  }
}

// ✅ Good: One-way reference
class GoodProxy {
  constructor(private realSubject: RealSubject) {
    // Only proxy references realSubject
  }
}
```

❌ **Performance Overhead Without Benefit**
- Problem: Using proxy when direct access is sufficient
- Solution: Only use proxy when you need its benefits

```typescript
// ❌ Bad: Unnecessary proxy
const simpleObject = { value: 42 };
const proxy = new Proxy(simpleObject, handler); // Why?

// ✅ Good: Direct access when sufficient
const simpleObject = { value: 42 };
// Use directly
```

### Best Practices

✅ **Single Responsibility**
- Proxy should focus on access control
- Delegate actual work to RealSubject

✅ **Maintain Interface Contract**
- Proxy must implement full Subject interface
- Should be substitutable for RealSubject

✅ **Lazy Initialization When Appropriate**
- Use virtual proxy for expensive objects
- Create RealSubject only when needed

✅ **Clear Separation of Concerns**
- Proxy handles access control
- RealSubject handles business logic
- Don't mix concerns

✅ **Document Proxy Behavior**
- Clearly document what the proxy does
- Explain access control rules
- Document performance implications

✅ **Handle Errors Appropriately**
- Proxy should handle access-related errors
- Forward business errors from RealSubject

```typescript
// ✅ Good: Clear error handling
class GoodProxy {
  request() {
    // Access control errors
    if (!this.hasAccess()) {
      throw new AccessDeniedError();
    }
    
    try {
      // Business errors from real subject
      return this.realSubject.request();
    } catch (error) {
      // Log but forward business errors
      this.logger.log(error);
      throw error;
    }
  }
}
```

---

## 🧪 Testing Proxies

### Unit Testing

```typescript
describe('CacheProxy', () => {
  let mockService: jest.Mocked<DataService>;
  let proxy: CacheProxy;
  
  beforeEach(() => {
    mockService = {
      fetchData: jest.fn().mockResolvedValue({ data: 'test' })
    };
    proxy = new CacheProxy(mockService, 60000);
  });
  
  it('should cache responses', async () => {
    const result1 = await proxy.fetchData('key1');
    const result2 = await proxy.fetchData('key1');
    
    expect(mockService.fetchData).toHaveBeenCalledTimes(1);
    expect(result1).toEqual(result2);
  });
  
  it('should expire cache after TTL', async () => {
    const proxy = new CacheProxy(mockService, 100);
    
    await proxy.fetchData('key1');
    await new Promise(resolve => setTimeout(resolve, 150));
    await proxy.fetchData('key1');
    
    expect(mockService.fetchData).toHaveBeenCalledTimes(2);
  });
});

describe('ProtectionProxy', () => {
  it('should allow access for authorized users', () => {
    const account = new RealBankAccount();
    const proxy = new ProtectedBankAccount(account, UserRole.ADMIN);
    
    expect(() => proxy.withdraw(1000)).not.toThrow();
  });
  
  it('should deny access for unauthorized users', () => {
    const account = new RealBankAccount();
    const proxy = new ProtectedBankAccount(account, UserRole.GUEST);
    
    expect(() => proxy.withdraw(100)).toThrow('Guests cannot withdraw');
  });
});
```

---

## 📊 Advantages and Disadvantages

### Advantages

✅ **Access Control**
- Control when and how objects are accessed
- Add security, validation, logging

✅ **Lazy Loading**
- Defer expensive object creation
- Improve initial load time

✅ **Caching**
- Cache expensive operations
- Reduce redundant computations

✅ **Remote Access**
- Represent remote objects locally
- Hide network complexity

✅ **Additional Functionality**
- Add logging, monitoring, statistics
- Without modifying original object

### Disadvantages

❌ **Performance Overhead**
- Additional indirection layer
- May impact performance

❌ **Complexity**
- More classes to maintain
- Can be harder to understand

❌ **Interface Maintenance**
- Must maintain full Subject interface
- Changes affect both Proxy and RealSubject

❌ **Debugging Difficulty**
- Harder to debug through proxy
- Stack traces can be confusing

---

## 🔗 Related Patterns

### Proxy and Decorator
- **Proxy** controls access
- **Decorator** adds behavior
- Similar structure, different purpose

### Proxy and Adapter
- **Proxy** maintains same interface, controls access
- **Adapter** changes interface
- Can combine: adapt first, then proxy

### Proxy and Facade
- **Proxy** represents one object
- **Facade** represents subsystem
- Both add indirection layer

### Proxy and Singleton
- **Proxy** can control access to singleton
- **Singleton** ensures one instance
- Can be used together

---

## 🎓 Summary

### Key Takeaways

1. **Purpose**: Proxy provides a surrogate to control access to another object
2. **Structure**: Proxy implements same interface as RealSubject and controls access
3. **Use When**: You need access control, lazy loading, caching, or remote access
4. **Benefits**: Access control, performance optimization, additional functionality
5. **Watch Out**: Performance overhead, complexity, interface maintenance

### Types of Proxies

- **Virtual Proxy**: Lazy loading of expensive objects
- **Remote Proxy**: Represent remote objects locally
- **Protection Proxy**: Access control and security
- **Cache Proxy**: Caching of expensive operations
- **Smart Reference**: Additional actions on access

### When to Choose Proxy

Choose Proxy when:
- ✅ You need to control access to an object
- ✅ You want lazy loading of expensive objects
- ✅ You need caching for performance
- ✅ You want to represent remote objects
- ✅ You need to add access-related functionality

Avoid Proxy when:
- ❌ Direct access is sufficient
- ❌ Overhead is not justified
- ❌ You need to add multiple independent behaviors (use Decorator)
- ❌ You need to change the interface (use Adapter)

### Next Steps

- Practice implementing different types of proxies
- Explore JavaScript Proxy API
- Identify real-world proxy usage in frameworks
- Compare Proxy with Decorator and Adapter
- Experiment with lazy loading and caching proxies

---

## 📚 Additional Resources

### Design Patterns References
- **Gang of Four (GoF)**: "Design Patterns: Elements of Reusable Object-Oriented Software"
- **Head First Design Patterns**: Chapter on Proxy Pattern

### Real-World Examples
- JavaScript ES6 Proxy
- React Context
- API Gateways
- ORM lazy loading
- Database connection pooling
- HTTP proxies

### Practice Exercises

1. **Create a Virtual Proxy for Image Loading**
   - Lazy load large images
   - Show placeholder while loading
   - Cache loaded images

2. **Build a Protection Proxy for File Access**
   - Control file read/write permissions
   - Log all file operations
   - Implement role-based access

3. **Implement a Cache Proxy for API Calls**
   - Cache API responses
   - Implement TTL
   - Handle cache invalidation

---

**Happy Learning! 🚀**
