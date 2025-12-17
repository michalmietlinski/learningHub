# Decorator vs Adapter: Deep Dive Comparison

## 📋 Learning Objectives

- [ ] Understand the fundamental differences between Decorator and Adapter patterns
- [ ] Learn when to use Decorator vs Adapter in real scenarios
- [ ] Master identifying which pattern fits a given problem
- [ ] Recognize common misconceptions and pitfalls
- [ ] Practice implementing both patterns side-by-side
- [ ] Understand how they can be combined
- [ ] Learn to refactor between patterns when needed

---

## 🎯 Quick Summary

| Aspect | Decorator | Adapter |
|--------|-----------|---------|
| **Purpose** | Add behavior dynamically | Make incompatible interfaces compatible |
| **Interface** | Same interface as component | Different interface (adapts to target) |
| **Focus** | Adding functionality | Converting interface |
| **Relationship** | Wraps same type | Wraps different type |
| **Composition** | Can stack multiple decorators | Usually one adapter per adaptee |
| **When** | Need to add features at runtime | Need to integrate incompatible code |

---

## 🔍 Core Differences

### 1. Intent & Purpose

**Decorator Pattern:**
- **Intent:** Attach additional responsibilities to an object dynamically
- **Purpose:** Add new behavior or features without modifying the original class
- **Focus:** Extending functionality while maintaining the same interface

**Adapter Pattern:**
- **Intent:** Convert the interface of a class into another interface clients expect
- **Purpose:** Make incompatible interfaces work together
- **Focus:** Translating between different interfaces

### 2. Interface Relationship

**Decorator:**
```javascript
// Decorator maintains the SAME interface
interface Component {
  operation(): string;
}

class ConcreteComponent implements Component {
  operation() { return 'Component'; }
}

class Decorator implements Component {  // Same interface!
  constructor(protected component: Component) {}
  operation() { return this.component.operation(); }
}
```

**Adapter:**
```javascript
// Adapter provides a DIFFERENT interface
interface Target {
  request(): string;  // Target interface
}

class Adaptee {
  specificRequest() { return 'Adaptee'; }  // Different interface
}

class Adapter implements Target {  // Implements target, wraps adaptee
  constructor(private adaptee: Adaptee) {}
  request() { return this.adaptee.specificRequest(); }  // Converts interface
}
```

### 3. When to Use Each

**Use Decorator When:**
- ✅ You need to add behavior to objects at runtime
- ✅ You want to add features without modifying existing code
- ✅ You need to stack multiple behaviors
- ✅ You want to extend functionality flexibly
- ✅ The base interface is already compatible

**Use Adapter When:**
- ✅ You have incompatible interfaces that need to work together
- ✅ You're integrating third-party libraries
- ✅ You're working with legacy code
- ✅ You need to convert between different interfaces
- ✅ The interfaces are fundamentally different

---

## 📊 Side-by-Side Comparison

### Example 1: File Operations

#### Scenario: Reading Files

**Problem:** We need to read files, but want to add features (compression, encryption) and also support different file formats.

**Decorator Approach:**
```javascript
// Base interface - same for all
interface FileReader {
  read(): string;
}

// Concrete component
class BasicFileReader implements FileReader {
  constructor(private filename: string) {}
  
  read(): string {
    return `Reading file: ${this.filename}`;
  }
}

// Decorator - adds compression
class CompressedFileReader implements FileReader {
  constructor(private reader: FileReader) {}
  
  read(): string {
    const content = this.reader.read();
    return `[Decompressed] ${content}`;
  }
}

// Decorator - adds encryption
class EncryptedFileReader implements FileReader {
  constructor(private reader: FileReader) {}
  
  read(): string {
    const content = this.reader.read();
    return `[Decrypted] ${content}`;
  }
}

// Usage - can stack decorators
const reader = new EncryptedFileReader(
  new CompressedFileReader(
    new BasicFileReader('data.txt')
  )
);
console.log(reader.read());
// [Decrypted] [Decompressed] Reading file: data.txt
```

**Adapter Approach:**
```javascript
// Target interface - what client expects
interface FileReader {
  read(): string;
}

// Adaptee - different interface (legacy system)
class LegacyFileSystem {
  loadFile(path: string): Buffer {
    return Buffer.from(`Legacy file: ${path}`);
  }
  
  getFileContent(buffer: Buffer): string {
    return buffer.toString();
  }
}

// Another adaptee - different interface (cloud storage)
class CloudStorage {
  download(key: string): Promise<string> {
    return Promise.resolve(`Cloud file: ${key}`);
  }
}

// Adapter for LegacyFileSystem
class LegacyFileAdapter implements FileReader {
  constructor(private legacy: LegacyFileSystem, private path: string) {}
  
  read(): string {
    const buffer = this.legacy.loadFile(this.path);
    return this.legacy.getFileContent(buffer);
  }
}

// Adapter for CloudStorage
class CloudStorageAdapter implements FileReader {
  constructor(private cloud: CloudStorage, private key: string) {}
  
  async read(): Promise<string> {
    return await this.cloud.download(this.key);
  }
}

// Usage - adapts different interfaces to same target
const legacyAdapter = new LegacyFileAdapter(new LegacyFileSystem(), 'file.txt');
console.log(legacyAdapter.read()); // Legacy file: file.txt

const cloudAdapter = new CloudStorageAdapter(new CloudStorage(), 'file-key');
cloudAdapter.read().then(console.log); // Cloud file: file-key
```

**Key Difference:**
- **Decorator:** Adds features (compression, encryption) to the same interface
- **Adapter:** Converts different interfaces (legacy, cloud) to a common interface

---

### Example 2: HTTP Requests

#### Scenario: Making HTTP Requests

**Decorator Approach:**
```javascript
// Base interface
interface HttpClient {
  request(url: string, options?: any): Promise<Response>;
}

// Concrete component
class BasicHttpClient implements HttpClient {
  async request(url: string, options?: any): Promise<Response> {
    console.log(`Making request to ${url}`);
    return new Response('Success');
  }
}

// Decorator - adds retry logic
class RetryHttpClient implements HttpClient {
  constructor(private client: HttpClient, private maxRetries: number = 3) {}
  
  async request(url: string, options?: any): Promise<Response> {
    for (let i = 0; i < this.maxRetries; i++) {
      try {
        return await this.client.request(url, options);
      } catch (error) {
        if (i === this.maxRetries - 1) throw error;
        console.log(`Retry ${i + 1}/${this.maxRetries}`);
      }
    }
    throw new Error('Max retries exceeded');
  }
}

// Decorator - adds caching
class CachingHttpClient implements HttpClient {
  private cache = new Map();
  
  constructor(private client: HttpClient) {}
  
  async request(url: string, options?: any): Promise<Response> {
    const key = `${url}:${JSON.stringify(options)}`;
    if (this.cache.has(key)) {
      console.log('Cache hit!');
      return this.cache.get(key);
    }
    
    const response = await this.client.request(url, options);
    this.cache.set(key, response);
    return response;
  }
}

// Decorator - adds logging
class LoggingHttpClient implements HttpClient {
  constructor(private client: HttpClient) {}
  
  async request(url: string, options?: any): Promise<Response> {
    console.log(`[LOG] Request: ${url}`, options);
    const start = Date.now();
    const response = await this.client.request(url, options);
    console.log(`[LOG] Response time: ${Date.now() - start}ms`);
    return response;
  }
}

// Usage - stack decorators
const client = new LoggingHttpClient(
  new CachingHttpClient(
    new RetryHttpClient(
      new BasicHttpClient()
    )
  )
);

await client.request('https://api.example.com/data');
// [LOG] Request: https://api.example.com/data
// Making request to https://api.example.com/data
// [LOG] Response time: 50ms
```

**Adapter Approach:**
```javascript
// Target interface - what our application expects
interface HttpClient {
  request(url: string, options?: any): Promise<Response>;
}

// Adaptee - XMLHttpRequest (old browser API)
class XHRClient {
  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }
  
  send() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ status: 200, data: 'XHR Response' });
      }, 100);
    });
  }
}

// Adaptee - Fetch API (modern browser API)
class FetchClient {
  async fetch(url: string, init?: RequestInit): Promise<Response> {
    return new Response('Fetch Response', { status: 200 });
  }
}

// Adaptee - Node.js http module
class NodeHttpClient {
  request(options: any, callback: Function) {
    setTimeout(() => {
      callback({ statusCode: 200, body: 'Node Response' });
    }, 100);
  }
}

// Adapter for XHR
class XHRAdapter implements HttpClient {
  constructor(private xhr: XHRClient) {}
  
  async request(url: string, options?: any): Promise<Response> {
    this.xhr.open(options?.method || 'GET', url);
    const result = await this.xhr.send();
    return new Response(result.data, { status: result.status });
  }
}

// Adapter for Fetch
class FetchAdapter implements HttpClient {
  constructor(private fetch: FetchClient) {}
  
  async request(url: string, options?: any): Promise<Response> {
    return await this.fetch.fetch(url, options);
  }
}

// Adapter for Node.js http
class NodeHttpAdapter implements HttpClient {
  constructor(private http: NodeHttpClient) {}
  
  async request(url: string, options?: any): Promise<Response> {
    return new Promise((resolve) => {
      this.http.request({ url, ...options }, (result: any) => {
        resolve(new Response(result.body, { status: result.statusCode }));
      });
    });
  }
}

// Usage - all adapt to same interface
const xhrAdapter = new XHRAdapter(new XHRClient());
const fetchAdapter = new FetchAdapter(new FetchClient());
const nodeAdapter = new NodeHttpAdapter(new NodeHttpClient());

// All work with same interface
await xhrAdapter.request('https://api.example.com');
await fetchAdapter.request('https://api.example.com');
await nodeAdapter.request('https://api.example.com');
```

**Key Difference:**
- **Decorator:** Adds cross-cutting concerns (retry, cache, logging) to same interface
- **Adapter:** Converts different HTTP client APIs (XHR, Fetch, Node) to common interface

---

### Example 3: Data Processing

#### Scenario: Processing Data Streams

**Decorator Approach:**
```javascript
// Base interface
interface DataProcessor {
  process(data: string): string;
}

// Concrete component
class BasicProcessor implements DataProcessor {
  process(data: string): string {
    return data;
  }
}

// Decorator - adds validation
class ValidationProcessor implements DataProcessor {
  constructor(private processor: DataProcessor) {}
  
  process(data: string): string {
    if (!data || data.trim().length === 0) {
      throw new Error('Invalid data');
    }
    return this.processor.process(data);
  }
}

// Decorator - adds transformation
class UppercaseProcessor implements DataProcessor {
  constructor(private processor: DataProcessor) {}
  
  process(data: string): string {
    const processed = this.processor.process(data);
    return processed.toUpperCase();
  }
}

// Decorator - adds sanitization
class SanitizeProcessor implements DataProcessor {
  constructor(private processor: DataProcessor) {}
  
  process(data: string): string {
    const processed = this.processor.process(data);
    return processed.replace(/[<>]/g, '');
  }
}

// Usage - stack decorators
const processor = new UppercaseProcessor(
  new SanitizeProcessor(
    new ValidationProcessor(
      new BasicProcessor()
    )
  )
);

console.log(processor.process('hello world'));
// HELLO WORLD
```

**Adapter Approach:**
```javascript
// Target interface
interface DataProcessor {
  process(data: string): string;
}

// Adaptee - CSV parser with different interface
class CSVParser {
  parseCSV(csvString: string): string[][] {
    return csvString.split('\n').map(row => row.split(','));
  }
  
  toJSON(rows: string[][]): string {
    return JSON.stringify(rows);
  }
}

// Adaptee - XML parser with different interface
class XMLParser {
  parseXML(xmlString: string): Document {
    // Returns XML Document
    return { root: 'data', children: [] };
  }
  
  documentToString(doc: Document): string {
    return JSON.stringify(doc);
  }
}

// Adaptee - JSON parser with different interface
class JSONParser {
  parse(jsonString: string): object {
    return JSON.parse(jsonString);
  }
  
  stringify(obj: object): string {
    return JSON.stringify(obj);
  }
}

// Adapter for CSV
class CSVAdapter implements DataProcessor {
  constructor(private parser: CSVParser) {}
  
  process(data: string): string {
    const rows = this.parser.parseCSV(data);
    return this.parser.toJSON(rows);
  }
}

// Adapter for XML
class XMLAdapter implements DataProcessor {
  constructor(private parser: XMLParser) {}
  
  process(data: string): string {
    const doc = this.parser.parseXML(data);
    return this.parser.documentToString(doc);
  }
}

// Adapter for JSON
class JSONAdapter implements DataProcessor {
  constructor(private parser: JSONParser) {}
  
  process(data: string): string {
    const obj = this.parser.parse(data);
    return this.parser.stringify(obj);
  }
}

// Usage - adapts different parsers to same interface
const csvAdapter = new CSVAdapter(new CSVParser());
const xmlAdapter = new XMLAdapter(new XMLParser());
const jsonAdapter = new JSONAdapter(new JSONParser());

csvAdapter.process('name,age\nJohn,30');
xmlAdapter.process('<root><name>John</name></root>');
jsonAdapter.process('{"name":"John"}');
```

**Key Difference:**
- **Decorator:** Adds processing steps (validation, sanitization, transformation) to same data
- **Adapter:** Converts different data format parsers (CSV, XML, JSON) to common interface

---

## 🎭 Real-World Scenarios

### Scenario 1: Payment Processing

**Decorator Use Case:**
```javascript
// Adding features to payment processing
interface PaymentProcessor {
  process(amount: number): Promise<PaymentResult>;
}

class BasicPaymentProcessor implements PaymentProcessor {
  async process(amount: number) {
    return { success: true, amount };
  }
}

// Decorator - adds fraud detection
class FraudDetectionDecorator implements PaymentProcessor {
  constructor(private processor: PaymentProcessor) {}
  
  async process(amount: number) {
    if (amount > 10000) {
      throw new Error('Fraud detected: Amount too high');
    }
    return this.processor.process(amount);
  }
}

// Decorator - adds logging
class LoggingDecorator implements PaymentProcessor {
  constructor(private processor: PaymentProcessor) {}
  
  async process(amount: number) {
    console.log(`Processing payment: $${amount}`);
    const result = await this.processor.process(amount);
    console.log(`Payment result: ${result.success}`);
    return result;
  }
}

// Usage
const processor = new LoggingDecorator(
  new FraudDetectionDecorator(
    new BasicPaymentProcessor()
  )
);
```

**Adapter Use Case:**
```javascript
// Adapting different payment gateways
interface PaymentProcessor {
  process(amount: number): Promise<PaymentResult>;
}

// Stripe API (different interface)
class StripeAPI {
  async charge(amountInCents: number) {
    return { id: 'ch_123', amount: amountInCents };
  }
}

// PayPal API (different interface)
class PayPalAPI {
  async createPayment(amount: number, currency: string) {
    return { paymentId: 'pay_456', amount, currency };
  }
}

// Stripe Adapter
class StripeAdapter implements PaymentProcessor {
  constructor(private stripe: StripeAPI) {}
  
  async process(amount: number) {
    const result = await this.stripe.charge(amount * 100); // Convert to cents
    return { success: true, transactionId: result.id, amount };
  }
}

// PayPal Adapter
class PayPalAdapter implements PaymentProcessor {
  constructor(private paypal: PayPalAPI) {}
  
  async process(amount: number) {
    const result = await this.paypal.createPayment(amount, 'USD');
    return { success: true, transactionId: result.paymentId, amount };
  }
}
```

**Analysis:**
- **Decorator:** Adds cross-cutting concerns (fraud detection, logging) to payment processing
- **Adapter:** Converts different payment gateway APIs (Stripe, PayPal) to common interface

---

### Scenario 2: UI Components

**Decorator Use Case:**
```javascript
// Adding visual features to UI components
interface UIComponent {
  render(): string;
}

class Button implements UIComponent {
  render() {
    return '<button>Click me</button>';
  }
}

// Decorator - adds border
class BorderDecorator implements UIComponent {
  constructor(private component: UIComponent) {}
  
  render() {
    return `<div style="border: 1px solid black">${this.component.render()}</div>`;
  }
}

// Decorator - adds shadow
class ShadowDecorator implements UIComponent {
  constructor(private component: UIComponent) {}
  
  render() {
    return `<div style="box-shadow: 0 2px 4px rgba(0,0,0,0.2)">${this.component.render()}</div>`;
  }
}

// Usage - stack decorators
const button = new ShadowDecorator(
  new BorderDecorator(
    new Button()
  )
);
```

**Adapter Use Case:**
```javascript
// Adapting different UI libraries
interface UIComponent {
  render(): string;
}

// React component (different interface)
class ReactButton {
  render() {
    return React.createElement('button', null, 'Click me');
  }
}

// Vue component (different interface)
class VueButton {
  $createElement(tag: string, props: any, children: any) {
    return { tag, props, children };
  }
  
  render() {
    return this.$createElement('button', {}, 'Click me');
  }
}

// React Adapter
class ReactAdapter implements UIComponent {
  constructor(private component: ReactButton) {}
  
  render(): string {
    const element = this.component.render();
    return `<${element.type}>${element.props.children}</${element.type}>`;
  }
}

// Vue Adapter
class VueAdapter implements UIComponent {
  constructor(private component: VueButton) {}
  
  render(): string {
    const element = this.component.render();
    return `<${element.tag}>${element.children}</${element.tag}>`;
  }
}
```

**Analysis:**
- **Decorator:** Adds visual enhancements (border, shadow) to same component
- **Adapter:** Converts different UI framework components (React, Vue) to common interface

---

## 🔄 Combining Patterns

### Decorator + Adapter

You can combine both patterns:

```javascript
// First, adapt incompatible interfaces
interface PaymentProcessor {
  process(amount: number): Promise<PaymentResult>;
}

class StripeAPI {
  async charge(amountInCents: number) {
    return { id: 'ch_123', amount: amountInCents };
  }
}

// Adapter - converts Stripe to common interface
class StripeAdapter implements PaymentProcessor {
  constructor(private stripe: StripeAPI) {}
  
  async process(amount: number) {
    const result = await this.stripe.charge(amount * 100);
    return { success: true, transactionId: result.id, amount };
  }
}

// Then, add decorators to add features
class LoggingDecorator implements PaymentProcessor {
  constructor(private processor: PaymentProcessor) {}
  
  async process(amount: number) {
    console.log(`Processing: $${amount}`);
    return this.processor.process(amount);
  }
}

class RetryDecorator implements PaymentProcessor {
  constructor(private processor: PaymentProcessor) {}
  
  async process(amount: number) {
    for (let i = 0; i < 3; i++) {
      try {
        return await this.processor.process(amount);
      } catch (error) {
        if (i === 2) throw error;
      }
    }
  }
}

// Usage - adapter first, then decorators
const adapter = new StripeAdapter(new StripeAPI());
const processor = new RetryDecorator(
  new LoggingDecorator(adapter)
);

await processor.process(100);
```

---

## 🚨 Common Misconceptions

### Misconception 1: "They're the same because both wrap objects"

**Reality:**
- **Decorator:** Wraps to add behavior, maintains same interface
- **Adapter:** Wraps to convert interface, changes interface

### Misconception 2: "Use Decorator when you need to change behavior"

**Reality:**
- **Decorator:** Adds behavior, doesn't change existing behavior
- **Adapter:** Changes interface, not behavior

### Misconception 3: "Adapter is just a Decorator with interface conversion"

**Reality:**
- **Adapter:** Primary purpose is interface conversion
- **Decorator:** Primary purpose is adding functionality
- They solve different problems

### Misconception 4: "You can always use Decorator instead of Adapter"

**Reality:**
- If interfaces are incompatible, you need Adapter
- If you need to add features, use Decorator
- They're not interchangeable

---

## 🎯 Decision Tree

```
Do you need to make incompatible interfaces work together?
│
├─ YES → Use ADAPTER
│   └─ Convert interface from Adaptee to Target
│
└─ NO → Do you need to add behavior/features dynamically?
    │
    ├─ YES → Use DECORATOR
    │   └─ Add features while maintaining same interface
    │
    └─ NO → Consider other patterns
        └─ Maybe you don't need a pattern at all
```

---

## 📋 Comparison Table

| Feature | Decorator | Adapter |
|---------|-----------|---------|
| **Primary Goal** | Add functionality | Convert interface |
| **Interface** | Same as component | Different from adaptee |
| **Composition** | Can stack multiple | Usually one-to-one |
| **When Applied** | Runtime (dynamic) | Design time or runtime |
| **Modifies** | Behavior/features | Interface only |
| **Relationship** | Is-a (same type) | Has-a (different type) |
| **Flexibility** | High (can combine) | Medium (one adaptee) |
| **Complexity** | Medium | Low to Medium |
| **Use Case** | Cross-cutting concerns | Integration |
| **Example** | Logging, caching, validation | Third-party libraries, legacy code |

---

## ✅ Best Practices

### When Using Decorator:

1. **Keep decorators focused** - Each decorator should add one concern
2. **Maintain interface consistency** - All decorators must implement the same interface
3. **Allow stacking** - Decorators should be composable
4. **Document decorator order** - Some orders may matter

### When Using Adapter:

1. **Keep adapters simple** - Focus on interface conversion only
2. **Don't add business logic** - Adapter should only translate
3. **Handle errors appropriately** - Convert adaptee errors to target format
4. **Document interface mappings** - Clearly show what maps to what

---

## 🚫 Anti-Patterns

### Anti-Pattern 1: Using Decorator for Interface Conversion

```javascript
// BAD - Using Decorator to change interface
class BadDecorator {
  constructor(adaptee) {
    this.adaptee = adaptee;
  }
  
  // Changing interface - this should be an Adapter!
  newMethod() {
    return this.adaptee.oldMethod();
  }
}
```

**Fix:** Use Adapter instead

### Anti-Pattern 2: Using Adapter to Add Features

```javascript
// BAD - Using Adapter to add functionality
class BadAdapter {
  constructor(component) {
    this.component = component;
  }
  
  // Adding features - this should be a Decorator!
  request() {
    console.log('Logging...'); // Adding logging
    return this.component.request();
  }
}
```

**Fix:** Use Decorator instead

### Anti-Pattern 3: Mixing Concerns

```javascript
// BAD - Adapter doing too much
class BadAdapter {
  constructor(adaptee) {
    this.adaptee = adaptee;
    this.cache = new Map(); // Adding caching - should be decorator
  }
  
  request(key) {
    // Interface conversion AND feature addition
    if (this.cache.has(key)) return this.cache.get(key);
    const result = this.adaptee.specificRequest(key);
    this.cache.set(key, result);
    return result;
  }
}
```

**Fix:** Separate into Adapter + Decorator

---

## 📚 Practice Exercises

### Exercise 1: Identify the Pattern

For each scenario, identify whether to use Decorator or Adapter:

1. **Scenario:** You have a logging library that uses `log(message)`, but your code expects `write(level, message)`
   - **Answer:** Adapter (interface conversion)

2. **Scenario:** You want to add caching to your HTTP client without modifying it
   - **Answer:** Decorator (adding functionality)

3. **Scenario:** You need to support both MySQL and PostgreSQL with the same code
   - **Answer:** Adapter (different interfaces)

4. **Scenario:** You want to add encryption, compression, and validation to data processing
   - **Answer:** Decorator (adding multiple features)

5. **Scenario:** You're integrating a third-party payment library with a different API
   - **Answer:** Adapter (incompatible interface)

### Exercise 2: Implement Both

Create a scenario where you need both patterns:
- Use Adapter to integrate a legacy logging system
- Use Decorator to add timestamp and formatting to logs

### Exercise 3: Refactoring

Refactor this code to use the correct pattern:

```javascript
// Current (incorrect) implementation
class PaymentWrapper {
  constructor(payment) {
    this.payment = payment;
  }
  
  // This is interface conversion - should be Adapter
  process(amount) {
    return this.payment.charge(amount * 100);
  }
  
  // This is adding features - should be Decorator
  processWithLogging(amount) {
    console.log('Processing payment');
    return this.process(amount);
  }
}
```

---

## 🔍 Code Review Checklist

When reviewing code using these patterns:

**For Decorator:**
- [ ] Decorator implements same interface as component
- [ ] Decorator adds behavior, doesn't change interface
- [ ] Decorators can be stacked
- [ ] Each decorator has single responsibility
- [ ] No business logic in decorators

**For Adapter:**
- [ ] Adapter converts interface only
- [ ] Adapter doesn't add new features
- [ ] Interface mapping is clear
- [ ] Error handling is appropriate
- [ ] Adapter is simple and focused

**For Both:**
- [ ] Correct pattern chosen for the problem
- [ ] Pattern is not overused
- [ ] Code is testable
- [ ] Documentation explains pattern choice

---

## 🎓 Key Takeaways

1. **Decorator = Add Features** (same interface)
2. **Adapter = Convert Interface** (different interfaces)
3. **Decorator is composable** - can stack multiple
4. **Adapter is focused** - one adaptee per adapter
5. **They can be combined** - adapt first, then decorate
6. **Choose based on problem** - not personal preference
7. **Keep them simple** - don't mix concerns

---

## 📖 Further Reading

1. **Design Patterns: Elements of Reusable Object-Oriented Software (GoF)**
   - Chapter 4: Structural Patterns
   - Decorator Pattern (p. 175)
   - Adapter Pattern (p. 139)

2. **Refactoring Guru**
   - Decorator: https://refactoring.guru/design-patterns/decorator
   - Adapter: https://refactoring.guru/design-patterns/adapter

3. **SourceMaking**
   - Decorator: https://sourcemaking.com/design_patterns/decorator
   - Adapter: https://sourcemaking.com/design_patterns/adapter

---

## 📝 Notes Section

_Add your notes, observations, and insights here as you learn..._

### Key Differences I've Learned

- Decorator maintains the same interface; Adapter changes it
- Decorator adds behavior; Adapter converts interface
- Decorator can be stacked; Adapter is usually one-to-one

### Questions to Explore

- When should I combine Decorator and Adapter?
- How do I know if I need both patterns?
- What are the performance implications of each?
- Can Decorator be used for interface conversion? (No!)
- Can Adapter be used to add features? (No!)

### Personal Examples

_Add your own code examples and use cases here..._

---

## 🎯 Summary

**Decorator and Adapter are fundamentally different:**

- **Decorator** = "Add features to existing objects" (same interface)
- **Adapter** = "Make incompatible interfaces work together" (different interfaces)

**Remember:**
- Use **Decorator** when you need to add behavior dynamically
- Use **Adapter** when you need to integrate incompatible code
- They solve different problems and are not interchangeable
- You can combine them: adapt first, then decorate

Choose the right pattern based on your problem, not convenience!

---

**Date Created:** 2025-12-16  
**Pattern Type:** Structural Patterns Comparison  
**Difficulty:** Advanced  
**Related Patterns:** Decorator, Adapter, Facade, Proxy

