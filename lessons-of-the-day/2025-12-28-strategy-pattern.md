# Strategy Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Strategy pattern definition and intent
- [ ] Learn when to use Strategy vs other behavioral patterns
- [ ] Master the context-strategy relationship and algorithm encapsulation
- [ ] Recognize real-world applications (payment processing, validation, sorting)
- [ ] Understand Strategy vs if/else chains and polymorphism
- [ ] Practice implementing Strategy in different scenarios
- [ ] Learn common pitfalls and best practices
- [ ] Explore modern variations (functional strategies, strategy maps)

---

## 🎯 Definition

**Strategy Pattern** is a behavioral design pattern that defines a family of algorithms, encapsulates each one, and makes them interchangeable. Strategy lets the algorithm vary independently from clients that use it.

**Intent (GoF):**
- Define a family of algorithms
- Encapsulate each algorithm
- Make them interchangeable
- Let the algorithm vary independently from clients
- Also known as: **Policy Pattern**

**Key Principle:**
> "Encapsulate what varies" - The strategy pattern identifies the parts of your code that vary and separates them from what stays the same, allowing you to swap algorithms at runtime without changing the client code.

---

## 🏗️ Structure

### UML Diagram Concept

```
Context
├── strategy: Strategy
├── setStrategy(strategy: Strategy): void
└── executeStrategy(): void
    └── strategy.execute()

Strategy (Interface)
└── execute(data: DataType): ResultType

ConcreteStrategyA implements Strategy
└── execute(data: DataType): ResultType

ConcreteStrategyB implements Strategy
└── execute(data: DataType): ResultType

ConcreteStrategyC implements Strategy
└── execute(data: DataType): ResultType
```

### Participants

1. **Strategy** - Declares an interface common to all supported algorithms
2. **ConcreteStrategy** - Implements the algorithm using the Strategy interface
3. **Context** - Maintains a reference to a Strategy object and delegates algorithm execution to it
4. **Client** - Creates and configures a ConcreteStrategy object and passes it to the Context

### Key Concepts

**Algorithm Encapsulation:**
- Each strategy encapsulates a specific algorithm
- Strategies are interchangeable
- Algorithms can be selected at runtime

**Composition over Inheritance:**
- Uses composition to delegate behavior
- More flexible than inheritance-based approaches
- Allows runtime strategy switching

**Open/Closed Principle:**
- Open for extension (new strategies)
- Closed for modification (context doesn't change)
- New algorithms = new strategy classes

**Separation of Concerns:**
- Context focuses on coordination
- Strategies focus on algorithm implementation
- Clear separation of responsibilities

**Eliminates Conditional Logic:**
- Replaces if/else chains with polymorphism
- Makes code more maintainable
- Easier to test individual strategies

---

## 💡 When to Use

### Use Strategy When:

✅ **You have multiple ways to perform a task and want to choose at runtime**
- Example: Different payment methods (credit card, PayPal, crypto)
- Example: Different sorting algorithms (quick sort, merge sort, bubble sort)

✅ **You want to avoid conditional statements for algorithm selection**
- Example: Replacing large if/else chains with strategy objects
- Example: Eliminating switch statements for algorithm selection

✅ **You have many related classes that differ only in their behavior**
- Example: Different validation strategies for different data types
- Example: Different compression algorithms for different file types

✅ **You want to isolate algorithm implementation details from client code**
- Example: Hiding complex algorithm logic from business logic
- Example: Making algorithms easily testable in isolation

✅ **You need to add new algorithms without modifying existing code**
- Example: Adding new payment methods without changing payment processor
- Example: Adding new export formats without changing export logic

### Don't Use When:

❌ **You have only one algorithm** - Overhead not worth it, direct implementation is simpler
❌ **Algorithms are simple and unlikely to change** - YAGNI principle applies
❌ **Client needs to know strategy implementation details** - Breaks encapsulation
❌ **Strategies need to share significant state** - Consider Template Method or State pattern
❌ **Algorithm selection is compile-time only** - Simple polymorphism might suffice

---

## 🔨 Implementation Examples

### Example 1: Basic Strategy Pattern (Payment Processing)

```typescript
// Strategy Interface
interface PaymentStrategy {
  pay(amount: number): void;
}

// Concrete Strategies
class CreditCardStrategy implements PaymentStrategy {
  constructor(
    private cardNumber: string,
    private cvv: string,
    private expiryDate: string
  ) {}

  pay(amount: number): void {
    console.log(`Paid $${amount} using Credit Card ending in ${this.cardNumber.slice(-4)}`);
    // Credit card processing logic
  }
}

class PayPalStrategy implements PaymentStrategy {
  constructor(private email: string) {}

  pay(amount: number): void {
    console.log(`Paid $${amount} using PayPal account: ${this.email}`);
    // PayPal processing logic
  }
}

class CryptocurrencyStrategy implements PaymentStrategy {
  constructor(private walletAddress: string) {}

  pay(amount: number): void {
    console.log(`Paid $${amount} using Cryptocurrency wallet: ${this.walletAddress}`);
    // Cryptocurrency processing logic
  }
}

// Context
class PaymentProcessor {
  private strategy: PaymentStrategy | null = null;

  setStrategy(strategy: PaymentStrategy): void {
    this.strategy = strategy;
  }

  processPayment(amount: number): void {
    if (!this.strategy) {
      throw new Error('Payment strategy not set');
    }
    this.strategy.pay(amount);
  }
}

// Usage
const processor = new PaymentProcessor();

// Credit card payment
processor.setStrategy(new CreditCardStrategy('1234567890123456', '123', '12/25'));
processor.processPayment(100);

// PayPal payment
processor.setStrategy(new PayPalStrategy('user@example.com'));
processor.processPayment(50);

// Cryptocurrency payment
processor.setStrategy(new CryptocurrencyStrategy('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'));
processor.processPayment(200);
```

### Example 2: Strategy Pattern with Validation

```typescript
// Strategy Interface
interface ValidationStrategy {
  validate(value: string): { isValid: boolean; error?: string };
}

// Concrete Validation Strategies
class EmailValidationStrategy implements ValidationStrategy {
  validate(value: string): { isValid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { isValid: false, error: 'Invalid email format' };
    }
    return { isValid: true };
  }
}

class PhoneValidationStrategy implements ValidationStrategy {
  validate(value: string): { isValid: boolean; error?: string } {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
      return { isValid: false, error: 'Invalid phone number format' };
    }
    return { isValid: true };
  }
}

class URLValidationStrategy implements ValidationStrategy {
  validate(value: string): { isValid: boolean; error?: string } {
    try {
      new URL(value);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }
}

class PasswordValidationStrategy implements ValidationStrategy {
  validate(value: string): { isValid: boolean; error?: string } {
    if (value.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(value)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(value)) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter' };
    }
    if (!/\d/.test(value)) {
      return { isValid: false, error: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*]/.test(value)) {
      return { isValid: false, error: 'Password must contain at least one special character' };
    }
    return { isValid: true };
  }
}

// Context
class FormField {
  constructor(
    private name: string,
    private validationStrategy: ValidationStrategy
  ) {}

  setValidationStrategy(strategy: ValidationStrategy): void {
    this.validationStrategy = strategy;
  }

  validate(value: string): { isValid: boolean; error?: string } {
    return this.validationStrategy.validate(value);
  }

  getName(): string {
    return this.name;
  }
}

// Usage
const emailField = new FormField('email', new EmailValidationStrategy());
const phoneField = new FormField('phone', new PhoneValidationStrategy());
const urlField = new FormField('website', new URLValidationStrategy());
const passwordField = new FormField('password', new PasswordValidationStrategy());

// Validate inputs
console.log(emailField.validate('user@example.com')); // { isValid: true }
console.log(emailField.validate('invalid-email')); // { isValid: false, error: 'Invalid email format' }

console.log(phoneField.validate('+1-555-123-4567')); // { isValid: true }
console.log(phoneField.validate('123')); // { isValid: false, error: 'Invalid phone number format' }

console.log(urlField.validate('https://example.com')); // { isValid: true }
console.log(urlField.validate('not-a-url')); // { isValid: false, error: 'Invalid URL format' }

console.log(passwordField.validate('StrongP@ss123')); // { isValid: true }
console.log(passwordField.validate('weak')); // { isValid: false, error: 'Password must be at least 8 characters' }
```

### Example 3: Strategy Pattern for Sorting Algorithms

```typescript
// Strategy Interface
interface SortStrategy<T> {
  sort(items: T[]): T[];
}

// Concrete Sort Strategies
class QuickSortStrategy<T> implements SortStrategy<T> {
  sort(items: T[]): T[] {
    console.log('Using Quick Sort');
    if (items.length <= 1) return items;
    
    const pivot = items[Math.floor(items.length / 2)];
    const less: T[] = [];
    const equal: T[] = [];
    const greater: T[] = [];
    
    for (const item of items) {
      if (item < pivot) less.push(item);
      else if (item > pivot) greater.push(item);
      else equal.push(item);
    }
    
    return [...this.sort(less), ...equal, ...this.sort(greater)];
  }
}

class MergeSortStrategy<T> implements SortStrategy<T> {
  sort(items: T[]): T[] {
    console.log('Using Merge Sort');
    if (items.length <= 1) return items;
    
    const mid = Math.floor(items.length / 2);
    const left = this.sort(items.slice(0, mid));
    const right = this.sort(items.slice(mid));
    
    return this.merge(left, right);
  }
  
  private merge(left: T[], right: T[]): T[] {
    const result: T[] = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        result.push(left[i++]);
      } else {
        result.push(right[j++]);
      }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
  }
}

class BubbleSortStrategy<T> implements SortStrategy<T> {
  sort(items: T[]): T[] {
    console.log('Using Bubble Sort');
    const sorted = [...items];
    const n = sorted.length;
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (sorted[j] > sorted[j + 1]) {
          [sorted[j], sorted[j + 1]] = [sorted[j + 1], sorted[j]];
        }
      }
    }
    
    return sorted;
  }
}

// Context
class Sorter<T> {
  private strategy: SortStrategy<T>;

  constructor(strategy: SortStrategy<T>) {
    this.strategy = strategy;
  }

  setStrategy(strategy: SortStrategy<T>): void {
    this.strategy = strategy;
  }

  sort(items: T[]): T[] {
    return this.strategy.sort(items);
  }
}

// Usage
const numbers = [64, 34, 25, 12, 22, 11, 90, 5];
const sorter = new Sorter(new QuickSortStrategy<number>());

console.log('Original:', numbers);
console.log('Sorted:', sorter.sort([...numbers]));

// Switch to merge sort
sorter.setStrategy(new MergeSortStrategy<number>());
console.log('Sorted:', sorter.sort([...numbers]));

// Switch to bubble sort
sorter.setStrategy(new BubbleSortStrategy<number>());
console.log('Sorted:', sorter.sort([...numbers]));
```

### Example 4: Strategy Pattern for Compression

```typescript
// Strategy Interface
interface CompressionStrategy {
  compress(data: string): string;
  decompress(compressed: string): string;
}

// Concrete Compression Strategies
class ZipCompressionStrategy implements CompressionStrategy {
  compress(data: string): string {
    console.log('Compressing using ZIP algorithm');
    // Simplified ZIP compression simulation
    return `[ZIP:${data.length} bytes compressed]`;
  }

  decompress(compressed: string): string {
    console.log('Decompressing ZIP data');
    // Simplified ZIP decompression simulation
    return compressed.replace(/^\[ZIP:\d+ bytes compressed\]$/, 'original data');
  }
}

class RarCompressionStrategy implements CompressionStrategy {
  compress(data: string): string {
    console.log('Compressing using RAR algorithm');
    // Simplified RAR compression simulation
    return `[RAR:${data.length} bytes compressed]`;
  }

  decompress(compressed: string): string {
    console.log('Decompressing RAR data');
    // Simplified RAR decompression simulation
    return compressed.replace(/^\[RAR:\d+ bytes compressed\]$/, 'original data');
  }
}

class GzipCompressionStrategy implements CompressionStrategy {
  compress(data: string): string {
    console.log('Compressing using GZIP algorithm');
    // Simplified GZIP compression simulation
    return `[GZIP:${data.length} bytes compressed]`;
  }

  decompress(compressed: string): string {
    console.log('Decompressing GZIP data');
    // Simplified GZIP decompression simulation
    return compressed.replace(/^\[GZIP:\d+ bytes compressed\]$/, 'original data');
  }
}

// Context
class FileCompressor {
  private strategy: CompressionStrategy;

  constructor(strategy: CompressionStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: CompressionStrategy): void {
    this.strategy = strategy;
  }

  compressFile(data: string): string {
    return this.strategy.compress(data);
  }

  decompressFile(compressed: string): string {
    return this.strategy.decompress(compressed);
  }
}

// Usage
const data = 'This is some data that needs to be compressed';
const compressor = new FileCompressor(new ZipCompressionStrategy());

const compressed = compressor.compressFile(data);
console.log('Compressed:', compressed);

const decompressed = compressor.decompressFile(compressed);
console.log('Decompressed:', decompressed);

// Switch compression algorithm
compressor.setStrategy(new GzipCompressionStrategy());
const gzipCompressed = compressor.compressFile(data);
console.log('GZIP Compressed:', gzipCompressed);
```

### Example 5: Strategy Pattern for Discount Calculation

```typescript
// Strategy Interface
interface DiscountStrategy {
  calculateDiscount(price: number): number;
  getDescription(): string;
}

// Concrete Discount Strategies
class NoDiscountStrategy implements DiscountStrategy {
  calculateDiscount(price: number): number {
    return 0;
  }

  getDescription(): string {
    return 'No discount';
  }
}

class PercentageDiscountStrategy implements DiscountStrategy {
  constructor(private percentage: number) {
    if (percentage < 0 || percentage > 100) {
      throw new Error('Percentage must be between 0 and 100');
    }
  }

  calculateDiscount(price: number): number {
    return price * (this.percentage / 100);
  }

  getDescription(): string {
    return `${this.percentage}% off`;
  }
}

class FixedAmountDiscountStrategy implements DiscountStrategy {
  constructor(private amount: number) {
    if (amount < 0) {
      throw new Error('Discount amount cannot be negative');
    }
  }

  calculateDiscount(price: number): number {
    return Math.min(this.amount, price);
  }

  getDescription(): string {
    return `$${this.amount} off`;
  }
}

class BuyOneGetOneFreeStrategy implements DiscountStrategy {
  calculateDiscount(price: number): number {
    // BOGO: customer pays for one, gets one free
    return price / 2;
  }

  getDescription(): string {
    return 'Buy One Get One Free';
  }
}

class TieredDiscountStrategy implements DiscountStrategy {
  constructor(
    private tiers: { min: number; percentage: number }[]
  ) {
    // Sort tiers by min amount descending
    this.tiers.sort((a, b) => b.min - a.min);
  }

  calculateDiscount(price: number): number {
    for (const tier of this.tiers) {
      if (price >= tier.min) {
        return price * (tier.percentage / 100);
      }
    }
    return 0;
  }

  getDescription(): string {
    const tierDescriptions = this.tiers.map(t => `$${t.min}+: ${t.percentage}%`).join(', ');
    return `Tiered discount (${tierDescriptions})`;
  }
}

// Context
class Product {
  constructor(
    private name: string,
    private price: number,
    private discountStrategy: DiscountStrategy = new NoDiscountStrategy()
  ) {}

  setDiscountStrategy(strategy: DiscountStrategy): void {
    this.discountStrategy = strategy;
  }

  getPrice(): number {
    return this.price;
  }

  getDiscount(): number {
    return this.discountStrategy.calculateDiscount(this.price);
  }

  getFinalPrice(): number {
    return this.price - this.getDiscount();
  }

  getDiscountDescription(): string {
    return this.discountStrategy.getDescription();
  }

  getDetails(): string {
    return `${this.name}: $${this.price} - ${this.getDiscountDescription()} = $${this.getFinalPrice()}`;
  }
}

// Usage
const product1 = new Product('Laptop', 1000);
console.log(product1.getDetails()); // Laptop: $1000 - No discount = $1000

// Apply percentage discount
product1.setDiscountStrategy(new PercentageDiscountStrategy(15));
console.log(product1.getDetails()); // Laptop: $1000 - 15% off = $850

// Apply fixed amount discount
product1.setDiscountStrategy(new FixedAmountDiscountStrategy(200));
console.log(product1.getDetails()); // Laptop: $1000 - $200 off = $800

// Apply BOGO
const product2 = new Product('T-Shirt', 30, new BuyOneGetOneFreeStrategy());
console.log(product2.getDetails()); // T-Shirt: $30 - Buy One Get One Free = $15

// Apply tiered discount
const tieredStrategy = new TieredDiscountStrategy([
  { min: 500, percentage: 20 },
  { min: 200, percentage: 10 },
  { min: 100, percentage: 5 }
]);

const product3 = new Product('Tablet', 600, tieredStrategy);
console.log(product3.getDetails()); // Tablet: $600 - Tiered discount ($500+: 20%, $200+: 10%, $100+: 5%) = $480

const product4 = new Product('Mouse', 150, tieredStrategy);
console.log(product4.getDetails()); // Mouse: $150 - Tiered discount ($500+: 20%, $200+: 10%, $100+: 5%) = $135
```

### Example 6: Strategy Pattern with Strategy Registry

```typescript
// Strategy Interface
interface ExportStrategy {
  export(data: any): string;
  getFileExtension(): string;
}

// Concrete Export Strategies
class JSONExportStrategy implements ExportStrategy {
  export(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  getFileExtension(): string {
    return 'json';
  }
}

class CSVExportStrategy implements ExportStrategy {
  export(data: any[]): string {
    if (!Array.isArray(data) || data.length === 0) {
      return '';
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  getFileExtension(): string {
    return 'csv';
  }
}

class XMLExportStrategy implements ExportStrategy {
  export(data: any): string {
    const toXML = (obj: any, rootName: string = 'root'): string => {
      if (Array.isArray(obj)) {
        return obj.map(item => toXML(item, 'item')).join('\n');
      }

      if (typeof obj === 'object' && obj !== null) {
        const entries = Object.entries(obj)
          .map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              return `<${key}>${toXML(value, key)}</${key}>`;
            }
            return `<${key}>${value}</${key}>`;
          })
          .join('\n');
        return entries;
      }

      return String(obj);
    };

    return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n${toXML(data, 'root')}\n</${rootName}>`;
  }

  getFileExtension(): string {
    return 'xml';
  }
}

// Strategy Registry
class ExportStrategyRegistry {
  private strategies: Map<string, ExportStrategy> = new Map();

  register(name: string, strategy: ExportStrategy): void {
    this.strategies.set(name.toLowerCase(), strategy);
  }

  get(name: string): ExportStrategy | undefined {
    return this.strategies.get(name.toLowerCase());
  }

  getAvailableFormats(): string[] {
    return Array.from(this.strategies.keys());
  }
}

// Context
class DataExporter {
  constructor(private registry: ExportStrategyRegistry) {}

  export(data: any, format: string): { content: string; filename: string } {
    const strategy = this.registry.get(format);
    if (!strategy) {
      const available = this.registry.getAvailableFormats().join(', ');
      throw new Error(`Export format '${format}' not found. Available: ${available}`);
    }

    const content = strategy.export(data);
    const filename = `export.${strategy.getFileExtension()}`;
    return { content, filename };
  }
}

// Usage
const registry = new ExportStrategyRegistry();
registry.register('json', new JSONExportStrategy());
registry.register('csv', new CSVExportStrategy());
registry.register('xml', new XMLExportStrategy());

const exporter = new DataExporter(registry);

const data = [
  { id: 1, name: 'Alice', age: 30, city: 'New York' },
  { id: 2, name: 'Bob', age: 25, city: 'London' },
  { id: 3, name: 'Charlie', age: 35, city: 'Tokyo' }
];

// Export as JSON
const jsonExport = exporter.export(data, 'json');
console.log('JSON Export:');
console.log(jsonExport.content);
console.log(`Filename: ${jsonExport.filename}\n`);

// Export as CSV
const csvExport = exporter.export(data, 'csv');
console.log('CSV Export:');
console.log(csvExport.content);
console.log(`Filename: ${csvExport.filename}\n`);

// Export as XML
const xmlExport = exporter.export(data, 'xml');
console.log('XML Export:');
console.log(xmlExport.content);
console.log(`Filename: ${xmlExport.filename}\n`);
```

### Example 7: Functional Strategy Pattern (JavaScript/TypeScript Style)

```typescript
// Functional approach using functions as strategies
type CalculationStrategy = (a: number, b: number) => number;

// Strategy functions
const addStrategy: CalculationStrategy = (a, b) => a + b;
const subtractStrategy: CalculationStrategy = (a, b) => a - b;
const multiplyStrategy: CalculationStrategy = (a, b) => a * b;
const divideStrategy: CalculationStrategy = (a, b) => {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
};
const powerStrategy: CalculationStrategy = (a, b) => Math.pow(a, b);

// Strategy map
const strategies: Record<string, CalculationStrategy> = {
  add: addStrategy,
  subtract: subtractStrategy,
  multiply: multiplyStrategy,
  divide: divideStrategy,
  power: powerStrategy
};

// Context using functional strategies
class Calculator {
  private strategy: CalculationStrategy;

  constructor(strategy: CalculationStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: CalculationStrategy): void {
    this.strategy = strategy;
  }

  calculate(a: number, b: number): number {
    return this.strategy(a, b);
  }
}

// Usage
const calc = new Calculator(addStrategy);
console.log('10 + 5 =', calc.calculate(10, 5)); // 15

calc.setStrategy(multiplyStrategy);
console.log('10 * 5 =', calc.calculate(10, 5)); // 50

calc.setStrategy(powerStrategy);
console.log('10 ^ 5 =', calc.calculate(10, 5)); // 100000

// Using strategy map
const operation = 'divide';
if (strategies[operation]) {
  calc.setStrategy(strategies[operation]);
  console.log(`10 ${operation} 5 =`, calc.calculate(10, 5)); // 2
}
```

### Example 8: Strategy Pattern for Routing (Web Framework Style)

```typescript
// Strategy Interface
interface RouteHandler {
  handle(request: Request): Response;
  canHandle(path: string): boolean;
}

// Request and Response types (simplified)
interface Request {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: any;
}

interface Response {
  status: number;
  headers: Record<string, string>;
  body: any;
}

// Concrete Route Handlers
class StaticFileHandler implements RouteHandler {
  constructor(private basePath: string) {}

  canHandle(path: string): boolean {
    return path.startsWith('/static/') || path.match(/\.(css|js|png|jpg|gif)$/);
  }

  handle(request: Request): Response {
    console.log(`Serving static file: ${request.path}`);
    return {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: `Content of ${request.path}`
    };
  }
}

class APIRouteHandler implements RouteHandler {
  constructor(private apiBase: string = '/api') {}

  canHandle(path: string): boolean {
    return path.startsWith(this.apiBase);
  }

  handle(request: Request): Response {
    console.log(`Handling API request: ${request.method} ${request.path}`);
    
    if (request.method === 'GET' && request.path === '/api/users') {
      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: { users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] }
      };
    }

    if (request.method === 'POST' && request.path === '/api/users') {
      return {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
        body: { message: 'User created', user: request.body }
      };
    }

    return {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
      body: { error: 'Not found' }
    };
  }
}

class PageRouteHandler implements RouteHandler {
  canHandle(path: string): boolean {
    return !path.startsWith('/api') && !path.startsWith('/static');
  }

  handle(request: Request): Response {
    console.log(`Rendering page: ${request.path}`);
    
    const pages: Record<string, string> = {
      '/': '<h1>Home Page</h1>',
      '/about': '<h1>About Us</h1>',
      '/contact': '<h1>Contact Us</h1>'
    };

    const content = pages[request.path] || '<h1>404 - Page Not Found</h1>';
    
    return {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
      body: content
    };
  }
}

// Context - Router
class Router {
  private handlers: RouteHandler[] = [];

  addHandler(handler: RouteHandler): void {
    this.handlers.push(handler);
  }

  route(request: Request): Response {
    for (const handler of this.handlers) {
      if (handler.canHandle(request.path)) {
        return handler.handle(request);
      }
    }

    // Default 404 handler
    return {
      status: 404,
      headers: { 'Content-Type': 'text/plain' },
      body: '404 Not Found'
    };
  }
}

// Usage
const router = new Router();
router.addHandler(new StaticFileHandler('/static'));
router.addHandler(new APIRouteHandler('/api'));
router.addHandler(new PageRouteHandler());

// Simulate requests
const requests: Request[] = [
  { method: 'GET', path: '/', headers: {} },
  { method: 'GET', path: '/about', headers: {} },
  { method: 'GET', path: '/api/users', headers: {} },
  { method: 'POST', path: '/api/users', headers: {}, body: { name: 'Charlie' } },
  { method: 'GET', path: '/static/style.css', headers: {} },
  { method: 'GET', path: '/unknown', headers: {} }
];

for (const request of requests) {
  const response = router.route(request);
  console.log(`\n${request.method} ${request.path} -> ${response.status}`);
  console.log('Response:', JSON.stringify(response.body, null, 2));
}
```

---

## 🌍 Real-World Applications

### 1. **Payment Processing Systems**
- Different payment methods (credit card, PayPal, Stripe, Apple Pay)
- Each payment method is a strategy
- Easy to add new payment providers without changing core logic

### 2. **Validation Frameworks**
- Different validation rules for different data types
- Email, phone, URL, password validators as strategies
- Form libraries use strategy pattern for field validation

### 3. **Sorting and Searching Algorithms**
- Different sorting algorithms (quick sort, merge sort, heap sort)
- Algorithm selection based on data size or characteristics
- Database query optimizers use strategy pattern

### 4. **Compression Libraries**
- Different compression algorithms (ZIP, RAR, GZIP, BZIP2)
- File archivers allow users to choose compression method
- Network protocols use different compression strategies

### 5. **Export/Import Functionality**
- Export data in different formats (JSON, CSV, XML, Excel)
- Import data from various sources
- Report generators use strategy pattern

### 6. **Discount and Pricing Systems**
- Different discount calculation methods
- Percentage, fixed amount, tiered, BOGO discounts
- E-commerce platforms use strategy pattern for promotions

### 7. **Routing in Web Frameworks**
- Different route handlers for different URL patterns
- Static files, API routes, page routes
- Express.js, Fastify use strategy-like patterns

### 8. **Image Processing**
- Different image filters and transformations
- Resize, crop, rotate, apply filters
- Graphics libraries use strategy pattern

### 9. **Authentication Systems**
- Different authentication methods (JWT, OAuth, Basic Auth)
- Multiple auth strategies in single application
- Passport.js uses strategy pattern extensively

### 10. **Logging Frameworks**
- Different log outputs (console, file, database, remote)
- Different log formats (JSON, plain text, structured)
- Winston, Pino use strategy pattern

---

## 🔄 Strategy vs Other Patterns

### Strategy vs State Pattern

**Similarities:**
- Both use composition to delegate behavior
- Both have similar structure (context + strategy/state)
- Both allow runtime behavior changes

**Differences:**
- **Strategy**: Algorithms are independent, client chooses which to use
- **State**: States are part of state machine, transitions are automatic
- **Strategy**: Focus on algorithm selection
- **State**: Focus on state transitions and behavior changes

**When to use which:**
- Use **Strategy** when you have multiple ways to perform a task
- Use **State** when object behavior depends on internal state

### Strategy vs Template Method Pattern

**Similarities:**
- Both define families of algorithms
- Both follow Open/Closed Principle

**Differences:**
- **Strategy**: Uses composition, algorithms are separate classes
- **Template Method**: Uses inheritance, algorithms are methods in base class
- **Strategy**: More flexible, can change entire algorithm
- **Template Method**: Less flexible, can only change steps

**When to use which:**
- Use **Strategy** when algorithms are completely different
- Use **Template Method** when algorithms share common structure

### Strategy vs Command Pattern

**Similarities:**
- Both encapsulate behavior
- Both can be stored and passed around

**Differences:**
- **Strategy**: Focus on algorithm selection
- **Command**: Focus on action encapsulation and undo/redo
- **Strategy**: Algorithms are interchangeable
- **Command**: Commands can be queued, logged, undone

**When to use which:**
- Use **Strategy** for algorithm selection
- Use **Command** for action encapsulation and history

### Strategy vs Factory Method Pattern

**Similarities:**
- Both use polymorphism
- Both follow Open/Closed Principle

**Differences:**
- **Strategy**: Focus on behavior/algorithm selection
- **Factory Method**: Focus on object creation
- **Strategy**: Algorithms are used by context
- **Factory Method**: Objects are created by factory

**When to use which:**
- Use **Strategy** when selecting algorithms
- Use **Factory Method** when creating objects

### Strategy vs If/Else Chains

**Strategy Pattern Advantages:**
- ✅ Eliminates conditional logic
- ✅ Follows Open/Closed Principle
- ✅ Easier to test individual strategies
- ✅ More maintainable and extensible
- ✅ Better separation of concerns

**If/Else Advantages:**
- ✅ Simpler for small, unlikely-to-change logic
- ✅ No object creation overhead
- ✅ Direct and straightforward

**When to use which:**
- Use **Strategy** when you have multiple algorithms that may change or grow
- Use **If/Else** for simple, stable conditional logic

---

## ⚠️ Common Pitfalls

### 1. **Over-Engineering Simple Cases**
**Problem:** Using Strategy pattern for simple if/else that will never change
```typescript
// ❌ Over-engineered
class SimpleCalculator {
  private strategy: CalculationStrategy;
  // ... complex setup for simple addition/subtraction
}

// ✅ Better for simple cases
function calculate(a: number, b: number, operation: string): number {
  return operation === 'add' ? a + b : a - b;
}
```

**Solution:** Only use Strategy when you have multiple algorithms that may change or need to be extended.

### 2. **Strategy Classes Knowing Too Much About Context**
**Problem:** Strategies accessing context internals, creating tight coupling
```typescript
// ❌ Tight coupling
class DiscountStrategy {
  calculate(context: ShoppingCart): number {
    // Accessing too many context details
    return context.getItems().length * context.getUser().getTier();
  }
}
```

**Solution:** Pass only necessary data to strategies, not entire context.

### 3. **Not Handling Strategy Selection Logic**
**Problem:** Client code becomes complex with strategy selection
```typescript
// ❌ Complex selection logic in client
if (user.isPremium() && order.getTotal() > 100) {
  strategy = new PremiumDiscountStrategy();
} else if (user.isMember()) {
  strategy = new MemberDiscountStrategy();
} // ... many more conditions
```

**Solution:** Create a Strategy Factory or use a Strategy Selector to encapsulate selection logic.

### 4. **Strategies Sharing Too Much State**
**Problem:** Strategies need to share significant state, breaking encapsulation
```typescript
// ❌ Strategies need shared state
class StrategyA {
  constructor(private sharedState: ComplexState) {}
}

class StrategyB {
  constructor(private sharedState: ComplexState) {}
}
```

**Solution:** Consider Template Method pattern or pass shared state through context methods.

### 5. **Forgetting to Validate Strategy Input**
**Problem:** Strategies don't validate their inputs
```typescript
// ❌ No validation
class PercentageDiscountStrategy {
  constructor(private percentage: number) {} // Could be -50 or 150
}
```

**Solution:** Always validate strategy parameters in constructors.

### 6. **Not Making Strategies Immutable**
**Problem:** Strategies change state, causing unexpected behavior
```typescript
// ❌ Mutable strategy
class CounterStrategy {
  private count = 0;
  execute(): void {
    this.count++; // State changes
  }
}
```

**Solution:** Make strategies stateless or immutable when possible.

### 7. **Strategy Interface Too Broad**
**Problem:** Strategy interface has too many methods, forcing empty implementations
```typescript
// ❌ Too broad interface
interface ExportStrategy {
  export(data: any): string;
  validate(data: any): boolean;
  transform(data: any): any;
  compress(data: string): string;
  // Not all strategies need all methods
}
```

**Solution:** Use smaller, focused interfaces or make methods optional.

### 8. **Not Considering Performance**
**Problem:** Creating new strategy objects frequently causes overhead
```typescript
// ❌ Creating strategies repeatedly
for (const item of items) {
  const strategy = new DiscountStrategy(); // New object each time
  strategy.apply(item);
}
```

**Solution:** Reuse strategy instances when possible, or use functional strategies.

---

## ✅ Best Practices

### 1. **Keep Strategies Stateless**
Make strategies stateless when possible to allow reuse and avoid side effects.

```typescript
// ✅ Stateless strategy
class PercentageDiscountStrategy {
  constructor(private readonly percentage: number) {}
  
  calculate(price: number): number {
    return price * (this.percentage / 100);
  }
}

// Reusable instance
const tenPercentDiscount = new PercentageDiscountStrategy(10);
```

### 2. **Use Strategy Factory for Complex Selection**
Encapsulate strategy selection logic in a factory.

```typescript
class DiscountStrategyFactory {
  create(user: User, order: Order): DiscountStrategy {
    if (user.isPremium() && order.getTotal() > 100) {
      return new PremiumDiscountStrategy();
    }
    if (user.isMember()) {
      return new MemberDiscountStrategy();
    }
    return new NoDiscountStrategy();
  }
}
```

### 3. **Make Strategy Interface Focused**
Keep strategy interfaces small and focused on single responsibility.

```typescript
// ✅ Focused interface
interface ValidationStrategy {
  validate(value: string): boolean;
}

// ❌ Too broad
interface ValidationStrategy {
  validate(value: string): boolean;
  sanitize(value: string): string;
  format(value: string): string;
  // Too many responsibilities
}
```

### 4. **Use Strategy Registry for Dynamic Strategies**
Use a registry pattern when strategies need to be registered dynamically.

```typescript
class StrategyRegistry<T> {
  private strategies = new Map<string, T>();
  
  register(name: string, strategy: T): void {
    this.strategies.set(name, strategy);
  }
  
  get(name: string): T | undefined {
    return this.strategies.get(name);
  }
}
```

### 5. **Consider Functional Strategies**
In JavaScript/TypeScript, functions can be strategies, reducing boilerplate.

```typescript
// ✅ Functional strategy
type SortStrategy = <T>(items: T[]) => T[];

const quickSort: SortStrategy = (items) => { /* ... */ };
const mergeSort: SortStrategy = (items) => { /* ... */ };

class Sorter {
  constructor(private strategy: SortStrategy) {}
  sort<T>(items: T[]): T[] {
    return this.strategy(items);
  }
}
```

### 6. **Document Strategy Selection Criteria**
Document when and why to use each strategy.

```typescript
/**
 * Discount Strategy Factory
 * 
 * Selection criteria:
 * - Premium users with orders > $100: PremiumDiscountStrategy (20% off)
 * - Regular members: MemberDiscountStrategy (10% off)
 * - First-time customers: FirstTimeDiscountStrategy (5% off)
 * - Default: NoDiscountStrategy
 */
class DiscountStrategyFactory {
  // ...
}
```

### 7. **Test Strategies Independently**
Test each strategy in isolation to ensure they work correctly.

```typescript
describe('PercentageDiscountStrategy', () => {
  it('should calculate 10% discount correctly', () => {
    const strategy = new PercentageDiscountStrategy(10);
    expect(strategy.calculate(100)).toBe(10);
  });
  
  it('should throw error for invalid percentage', () => {
    expect(() => new PercentageDiscountStrategy(150)).toThrow();
  });
});
```

### 8. **Use Type Safety**
Leverage TypeScript's type system to ensure strategy compatibility.

```typescript
interface Strategy<TInput, TOutput> {
  execute(input: TInput): TOutput;
}

class Context<TInput, TOutput> {
  constructor(private strategy: Strategy<TInput, TOutput>) {}
  
  execute(input: TInput): TOutput {
    return this.strategy.execute(input);
  }
}
```

### 9. **Handle Strategy Errors Gracefully**
Strategies should handle errors appropriately and provide meaningful messages.

```typescript
class PaymentStrategy {
  pay(amount: number): void {
    try {
      this.processPayment(amount);
    } catch (error) {
      throw new PaymentError(`Payment failed: ${error.message}`);
    }
  }
  
  protected abstract processPayment(amount: number): void;
}
```

### 10. **Consider Strategy Composition**
Strategies can be composed to create more complex behaviors.

```typescript
class CompositeDiscountStrategy implements DiscountStrategy {
  constructor(private strategies: DiscountStrategy[]) {}
  
  calculate(price: number): number {
    return this.strategies.reduce(
      (discounted, strategy) => discounted - strategy.calculate(discounted),
      price
    );
  }
}
```

---

## 🧪 Testing Strategy Pattern

### Testing Individual Strategies

```typescript
describe('Discount Strategies', () => {
  describe('PercentageDiscountStrategy', () => {
    it('should calculate percentage discount correctly', () => {
      const strategy = new PercentageDiscountStrategy(20);
      expect(strategy.calculateDiscount(100)).toBe(20);
      expect(strategy.calculateDiscount(50)).toBe(10);
    });

    it('should reject invalid percentages', () => {
      expect(() => new PercentageDiscountStrategy(-10)).toThrow();
      expect(() => new PercentageDiscountStrategy(150)).toThrow();
    });
  });

  describe('FixedAmountDiscountStrategy', () => {
    it('should apply fixed discount', () => {
      const strategy = new FixedAmountDiscountStrategy(15);
      expect(strategy.calculateDiscount(100)).toBe(15);
      expect(strategy.calculateDiscount(10)).toBe(10); // Can't discount more than price
    });
  });
});
```

### Testing Context with Strategies

```typescript
describe('Product with Discount Strategies', () => {
  it('should apply different discount strategies', () => {
    const product = new Product('Test Product', 100);
    
    product.setDiscountStrategy(new PercentageDiscountStrategy(10));
    expect(product.getFinalPrice()).toBe(90);
    
    product.setDiscountStrategy(new FixedAmountDiscountStrategy(20));
    expect(product.getFinalPrice()).toBe(80);
  });

  it('should handle strategy switching', () => {
    const product = new Product('Test Product', 100);
    const strategy1 = new PercentageDiscountStrategy(10);
    const strategy2 = new FixedAmountDiscountStrategy(15);
    
    product.setDiscountStrategy(strategy1);
    expect(product.getFinalPrice()).toBe(90);
    
    product.setDiscountStrategy(strategy2);
    expect(product.getFinalPrice()).toBe(85);
  });
});
```

### Testing Strategy Factory

```typescript
describe('DiscountStrategyFactory', () => {
  it('should create correct strategy for premium users', () => {
    const factory = new DiscountStrategyFactory();
    const user = { isPremium: () => true, isMember: () => false };
    const order = { getTotal: () => 150 };
    
    const strategy = factory.create(user, order);
    expect(strategy).toBeInstanceOf(PremiumDiscountStrategy);
  });

  it('should create member strategy for regular members', () => {
    const factory = new DiscountStrategyFactory();
    const user = { isPremium: () => false, isMember: () => true };
    const order = { getTotal: () => 50 };
    
    const strategy = factory.create(user, order);
    expect(strategy).toBeInstanceOf(MemberDiscountStrategy);
  });
});
```

---

## 📊 Advantages and Disadvantages

### Advantages

✅ **Eliminates Conditional Logic**
- Replaces if/else chains with polymorphism
- Makes code more maintainable and readable

✅ **Follows Open/Closed Principle**
- Open for extension (new strategies)
- Closed for modification (context doesn't change)

✅ **Improves Testability**
- Each strategy can be tested independently
- Context can be tested with mock strategies

✅ **Runtime Algorithm Selection**
- Can switch strategies at runtime
- More flexible than compile-time selection

✅ **Separation of Concerns**
- Context focuses on coordination
- Strategies focus on algorithm implementation

✅ **Code Reusability**
- Strategies can be reused across different contexts
- Reduces code duplication

### Disadvantages

❌ **Increased Number of Classes**
- Each strategy is a separate class
- Can lead to class explosion

❌ **Client Must Know About Strategies**
- Client needs to understand available strategies
- Strategy selection logic can be complex

❌ **Overhead for Simple Cases**
- May be overkill for simple conditional logic
- Additional abstraction layer

❌ **Strategy Interface Changes**
- Adding methods to interface affects all strategies
- Breaking changes require updating all implementations

❌ **Communication Between Strategies**
- Strategies can't easily communicate with each other
- May need mediator or shared context

---

## 🔗 Related Patterns

### Strategy + Factory Method
Use Factory Method to create appropriate strategies based on conditions.

```typescript
class StrategyFactory {
  create(type: string): Strategy {
    switch (type) {
      case 'A': return new StrategyA();
      case 'B': return new StrategyB();
      default: throw new Error('Unknown strategy type');
    }
  }
}
```

### Strategy + Template Method
Use Template Method for strategies that share common structure but differ in steps.

### Strategy + Decorator
Use Decorator to add additional behavior to strategies without modifying them.

### Strategy + Chain of Responsibility
Use Chain of Responsibility when strategies need to be tried in sequence.

### Strategy + Command
Use Command pattern to encapsulate strategy execution with undo/redo capability.

---

## 🎓 Summary

The **Strategy Pattern** is a powerful behavioral design pattern that:

1. **Encapsulates algorithms** - Each algorithm is in its own class
2. **Makes algorithms interchangeable** - Can swap strategies at runtime
3. **Eliminates conditional logic** - Replaces if/else with polymorphism
4. **Follows Open/Closed Principle** - Open for extension, closed for modification
5. **Improves testability** - Strategies can be tested independently

**Key Takeaways:**
- Use Strategy when you have multiple ways to perform a task
- Strategies should be stateless when possible
- Consider using Strategy Factory for complex selection logic
- Don't over-engineer simple conditional logic
- Functional strategies can reduce boilerplate in JavaScript/TypeScript

**When to Use:**
- Multiple algorithms for the same task
- Need to switch algorithms at runtime
- Want to eliminate conditional logic
- Algorithms may change or be extended

**When NOT to Use:**
- Only one algorithm that won't change
- Simple conditional logic that's unlikely to grow
- Algorithms need to share significant state
- Performance is critical and overhead matters

---

## 📚 Additional Resources

### Books
- **Design Patterns: Elements of Reusable Object-Oriented Software** (Gang of Four) - Original Strategy pattern description
- **Head First Design Patterns** - Strategy pattern with practical examples
- **Refactoring: Improving the Design of Existing Code** (Martin Fowler) - Strategy pattern in refactoring context

### Online Resources
- [Refactoring Guru - Strategy Pattern](https://refactoring.guru/design-patterns/strategy)
- [SourceMaking - Strategy Pattern](https://sourcemaking.com/design_patterns/strategy)
- [Wikipedia - Strategy Pattern](https://en.wikipedia.org/wiki/Strategy_pattern)

### Related Topics
- Open/Closed Principle (SOLID)
- Composition over Inheritance
- Polymorphism
- Functional Programming (functions as strategies)
- Strategy Factory Pattern
- Policy-Based Design (C++)

---

**Next Steps:**
- Practice implementing Strategy pattern in your projects
- Look for if/else chains that could be replaced with Strategy
- Experiment with functional strategies in JavaScript/TypeScript
- Consider learning about State Pattern (similar structure, different purpose)

