# Decorator Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Decorator pattern definition and intent
- [ ] Learn when to use Decorator vs inheritance and other patterns
- [ ] Master dynamic behavior extension at runtime
- [ ] Recognize real-world applications
- [ ] Understand how to compose decorators
- [ ] Practice implementing Decorator in different scenarios
- [ ] Learn common pitfalls and best practices

---

## 🎯 Definition

**Decorator Pattern** is a structural design pattern that lets you attach new behaviors to objects by placing these objects inside special wrapper objects that contain the behaviors.

**Intent (GoF):**
- Attach additional responsibilities to an object dynamically
- Provide a flexible alternative to subclassing for extending functionality
- Also known as: **Wrapper Pattern**

**Key Principle:**
> "Add behavior dynamically" - The decorator pattern allows you to add new functionality to objects at runtime without modifying their structure, providing a flexible alternative to inheritance.

---

## 🏗️ Structure

### UML Diagram Concept

```
Component (Interface)
├── operation(): void

ConcreteComponent implements Component
└── operation(): void

Decorator implements Component
├── component: Component
└── operation(): void
    └── calls component.operation()

ConcreteDecoratorA extends Decorator
├── operation(): void
│   ├── calls super.operation()
│   └── addedBehaviorA()
└── addedState: type

ConcreteDecoratorB extends Decorator
├── operation(): void
│   ├── calls super.operation()
│   └── addedBehaviorB()
└── addedState: type

Client
└── uses Component (can be decorated)
```

### Participants

1. **Component** - Defines the interface for objects that can have responsibilities added to them dynamically
2. **ConcreteComponent** - Defines an object to which additional responsibilities can be attached
3. **Decorator** - Maintains a reference to a Component object and defines an interface that conforms to Component's interface
4. **ConcreteDecorator** - Adds responsibilities to the component

### Key Concepts

**Component:**
- Defines the interface for objects that can be decorated
- Can be an interface or abstract class
- Both concrete components and decorators implement this interface

**Decorator:**
- Maintains a reference to a Component object
- Implements the Component interface
- Forwards requests to the component
- Can perform additional actions before/after forwarding

**Composition:**
- Decorators can wrap other decorators
- Allows stacking multiple behaviors
- Order of decoration can matter

---

## 💡 When to Use

### Use Decorator When:

✅ **You need to add responsibilities to objects dynamically and transparently**
- Example: Adding features like logging, caching, validation to services

✅ **You want to add features without modifying existing code**
- Example: Extending functionality of third-party libraries

✅ **You need to add features that can be combined**
- Example: A text editor with bold, italic, underline that can be combined

✅ **Subclassing would result in an explosion of classes**
- Example: Instead of Button, BoldButton, ItalicButton, BoldItalicButton, etc.

✅ **You want to add/remove responsibilities at runtime**
- Example: Adding middleware to HTTP requests dynamically

### Don't Use When:

❌ **The feature is a core part of the object** - Should be in the base class
❌ **You need to change the object's interface** - Use Adapter instead
❌ **The behavior is not composable** - Decorator works best with stackable features
❌ **Performance is critical** - Decorator adds indirection overhead

---

## 🔨 Implementation Examples

### Example 1: Basic Decorator Pattern (JavaScript/TypeScript)

```typescript
// Component Interface
interface Coffee {
  getDescription(): string;
  getCost(): number;
}

// Concrete Component
class SimpleCoffee implements Coffee {
  getDescription(): string {
    return 'Simple coffee';
  }
  
  getCost(): number {
    return 5;
  }
}

// Base Decorator
abstract class CoffeeDecorator implements Coffee {
  constructor(protected coffee: Coffee) {}
  
  getDescription(): string {
    return this.coffee.getDescription();
  }
  
  getCost(): number {
    return this.coffee.getCost();
  }
}

// Concrete Decorators
class MilkDecorator extends CoffeeDecorator {
  getDescription(): string {
    return this.coffee.getDescription() + ', milk';
  }
  
  getCost(): number {
    return this.coffee.getCost() + 2;
  }
}

class SugarDecorator extends CoffeeDecorator {
  getDescription(): string {
    return this.coffee.getDescription() + ', sugar';
  }
  
  getCost(): number {
    return this.coffee.getCost() + 1;
  }
}

class WhipDecorator extends CoffeeDecorator {
  getDescription(): string {
    return this.coffee.getDescription() + ', whip';
  }
  
  getCost(): number {
    return this.coffee.getCost() + 3;
  }
}

// Usage
let coffee: Coffee = new SimpleCoffee();
console.log(`${coffee.getDescription()} - $${coffee.getCost()}`);
// Simple coffee - $5

coffee = new MilkDecorator(coffee);
console.log(`${coffee.getDescription()} - $${coffee.getCost()}`);
// Simple coffee, milk - $7

coffee = new SugarDecorator(coffee);
console.log(`${coffee.getDescription()} - $${coffee.getCost()}`);
// Simple coffee, milk, sugar - $8

coffee = new WhipDecorator(coffee);
console.log(`${coffee.getDescription()} - $${coffee.getCost()}`);
// Simple coffee, milk, sugar, whip - $11

// Can also stack in one line
const fancyCoffee = new WhipDecorator(
  new SugarDecorator(
    new MilkDecorator(
      new SimpleCoffee()
    )
  )
);
console.log(`${fancyCoffee.getDescription()} - $${fancyCoffee.getCost()}`);
// Simple coffee, milk, sugar, whip - $11
```

### Example 2: Text Formatting Decorator

```typescript
// Component Interface
interface TextFormatter {
  format(text: string): string;
}

// Concrete Component
class PlainTextFormatter implements TextFormatter {
  format(text: string): string {
    return text;
  }
}

// Base Decorator
abstract class TextDecorator implements TextFormatter {
  constructor(protected formatter: TextFormatter) {}
  
  format(text: string): string {
    return this.formatter.format(text);
  }
}

// Concrete Decorators
class BoldDecorator extends TextDecorator {
  format(text: string): string {
    return `<b>${this.formatter.format(text)}</b>`;
  }
}

class ItalicDecorator extends TextDecorator {
  format(text: string): string {
    return `<i>${this.formatter.format(text)}</i>`;
  }
}

class UnderlineDecorator extends TextDecorator {
  format(text: string): string {
    return `<u>${this.formatter.format(text)}</u>`;
  }
}

class ColorDecorator extends TextDecorator {
  constructor(formatter: TextFormatter, private color: string) {
    super(formatter);
  }
  
  format(text: string): string {
    return `<span style="color: ${this.color}">${this.formatter.format(text)}</span>`;
  }
}

// Usage
const formatter = new PlainTextFormatter();
console.log(formatter.format('Hello World'));
// Hello World

const boldFormatter = new BoldDecorator(formatter);
console.log(boldFormatter.format('Hello World'));
// <b>Hello World</b>

const boldItalicFormatter = new ItalicDecorator(
  new BoldDecorator(formatter)
);
console.log(boldItalicFormatter.format('Hello World'));
// <i><b>Hello World</b></i>

const fancyFormatter = new ColorDecorator(
  new UnderlineDecorator(
    new BoldDecorator(formatter)
  ),
  'red'
);
console.log(fancyFormatter.format('Hello World'));
// <span style="color: red"><u><b>Hello World</b></u></span>
```

### Example 3: HTTP Client Decorator

```typescript
// Component Interface
interface HttpClient {
  request(url: string, options?: RequestOptions): Promise<Response>;
}

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

// Concrete Component
class BasicHttpClient implements HttpClient {
  async request(url: string, options?: RequestOptions): Promise<Response> {
    console.log(`Making ${options?.method || 'GET'} request to ${url}`);
    // Simulated response
    return {
      status: 200,
      data: { message: 'Success' },
      headers: {}
    } as Response;
  }
}

// Base Decorator
abstract class HttpClientDecorator implements HttpClient {
  constructor(protected client: HttpClient) {}
  
  async request(url: string, options?: RequestOptions): Promise<Response> {
    return this.client.request(url, options);
  }
}

// Concrete Decorators
class LoggingDecorator extends HttpClientDecorator {
  async request(url: string, options?: RequestOptions): Promise<Response> {
    const startTime = Date.now();
    console.log(`[LOG] Request started: ${options?.method || 'GET'} ${url}`);
    
    try {
      const response = await this.client.request(url, options);
      const duration = Date.now() - startTime;
      console.log(`[LOG] Request completed in ${duration}ms with status ${response.status}`);
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[LOG] Request failed after ${duration}ms:`, error);
      throw error;
    }
  }
}

class RetryDecorator extends HttpClientDecorator {
  constructor(client: HttpClient, private maxRetries: number = 3) {
    super(client);
  }
  
  async request(url: string, options?: RequestOptions): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await this.client.request(url, options);
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries) {
          const delay = Math.pow(2, attempt) * 100; // Exponential backoff
          console.log(`[RETRY] Attempt ${attempt} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`Request failed after ${this.maxRetries} attempts: ${lastError?.message}`);
  }
}

class CachingDecorator extends HttpClientDecorator {
  private cache: Map<string, { response: Response; timestamp: number }> = new Map();
  private ttl: number; // Time to live in milliseconds
  
  constructor(client: HttpClient, ttl: number = 60000) {
    super(client);
    this.ttl = ttl;
  }
  
  async request(url: string, options?: RequestOptions): Promise<Response> {
    // Only cache GET requests
    if (options?.method && options.method !== 'GET') {
      return this.client.request(url, options);
    }
    
    const cacheKey = `${url}:${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      console.log(`[CACHE] Cache hit for ${url}`);
      return cached.response;
    }
    
    console.log(`[CACHE] Cache miss for ${url}`);
    const response = await this.client.request(url, options);
    this.cache.set(cacheKey, {
      response,
      timestamp: Date.now()
    });
    
    return response;
  }
  
  clearCache(): void {
    this.cache.clear();
    console.log('[CACHE] Cache cleared');
  }
}

class AuthenticationDecorator extends HttpClientDecorator {
  constructor(client: HttpClient, private token: string) {
    super(client);
  }
  
  async request(url: string, options?: RequestOptions): Promise<Response> {
    const authOptions = {
      ...options,
      headers: {
        ...options?.headers,
        'Authorization': `Bearer ${this.token}`
      }
    };
    
    return this.client.request(url, authOptions);
  }
}

class ErrorHandlingDecorator extends HttpClientDecorator {
  async request(url: string, options?: RequestOptions): Promise<Response> {
    try {
      const response = await this.client.request(url, options);
      
      if (response.status >= 400) {
        throw new Error(`HTTP Error ${response.status}`);
      }
      
      return response;
    } catch (error) {
      console.error(`[ERROR] Request failed: ${error}`);
      // Could implement retry logic, fallback, etc.
      throw error;
    }
  }
}

// Usage
let client: HttpClient = new BasicHttpClient();

// Add logging
client = new LoggingDecorator(client);

// Add authentication
client = new AuthenticationDecorator(client, 'my-secret-token');

// Add caching
client = new CachingDecorator(client, 30000);

// Add retry logic
client = new RetryDecorator(client, 3);

// Add error handling
client = new ErrorHandlingDecorator(client);

// All decorators work together
try {
  const response = await client.request('https://api.example.com/users');
  console.log('Response:', response);
} catch (error) {
  console.error('Failed:', error);
}

// Can also create different combinations
const loggingClient = new LoggingDecorator(new BasicHttpClient());
const cachedClient = new CachingDecorator(
  new LoggingDecorator(new BasicHttpClient())
);
```

### Example 4: Data Processing Pipeline

```typescript
// Component Interface
interface DataProcessor {
  process(data: any): any;
}

// Concrete Component
class BasicProcessor implements DataProcessor {
  process(data: any): any {
    return data;
  }
}

// Base Decorator
abstract class ProcessorDecorator implements DataProcessor {
  constructor(protected processor: DataProcessor) {}
  
  process(data: any): any {
    return this.processor.process(data);
  }
}

// Concrete Decorators
class ValidationDecorator extends ProcessorDecorator {
  process(data: any): any {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data: must be an object');
    }
    console.log('[VALIDATION] Data validated');
    return this.processor.process(data);
  }
}

class SanitizationDecorator extends ProcessorDecorator {
  process(data: any): any {
    const sanitized = { ...data };
    
    // Remove HTML tags
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitized[key].replace(/<[^>]*>/g, '');
      }
    }
    
    console.log('[SANITIZATION] Data sanitized');
    return this.processor.process(sanitized);
  }
}

class TransformationDecorator extends ProcessorDecorator {
  constructor(processor: DataProcessor, private transformer: (data: any) => any) {
    super(processor);
  }
  
  process(data: any): any {
    const transformed = this.transformer(data);
    console.log('[TRANSFORMATION] Data transformed');
    return this.processor.process(transformed);
  }
}

class EncryptionDecorator extends ProcessorDecorator {
  process(data: any): any {
    // Simulated encryption
    const encrypted = JSON.stringify(data).split('').reverse().join('');
    console.log('[ENCRYPTION] Data encrypted');
    return this.processor.process(encrypted);
  }
}

class CompressionDecorator extends ProcessorDecorator {
  process(data: any): any {
    // Simulated compression
    const compressed = `[COMPRESSED]${JSON.stringify(data)}`;
    console.log('[COMPRESSION] Data compressed');
    return this.processor.process(compressed);
  }
}

// Usage
const processor = new CompressionDecorator(
  new EncryptionDecorator(
    new TransformationDecorator(
      new SanitizationDecorator(
        new ValidationDecorator(
          new BasicProcessor()
        )
      ),
      (data) => ({ ...data, processed: true, timestamp: Date.now() })
    )
  )
);

const inputData = {
  name: '<script>alert("xss")</script>John',
  email: 'john@example.com',
  age: 30
};

try {
  const result = processor.process(inputData);
  console.log('Final result:', result);
} catch (error) {
  console.error('Processing failed:', error);
}
```

### Example 5: UI Component Decorator

```typescript
// Component Interface
interface UIComponent {
  render(): string;
  getWidth(): number;
  getHeight(): number;
}

// Concrete Component
class Button implements UIComponent {
  constructor(
    private label: string,
    private width: number = 100,
    private height: number = 40
  ) {}
  
  render(): string {
    return `<button style="width: ${this.width}px; height: ${this.height}px">${this.label}</button>`;
  }
  
  getWidth(): number {
    return this.width;
  }
  
  getHeight(): number {
    return this.height;
  }
}

// Base Decorator
abstract class ComponentDecorator implements UIComponent {
  constructor(protected component: UIComponent) {}
  
  render(): string {
    return this.component.render();
  }
  
  getWidth(): number {
    return this.component.getWidth();
  }
  
  getHeight(): number {
    return this.component.getHeight();
  }
}

// Concrete Decorators
class BorderDecorator extends ComponentDecorator {
  constructor(component: UIComponent, private borderWidth: number = 1, private borderColor: string = 'black') {
    super(component);
  }
  
  render(): string {
    const borderStyle = `border: ${this.borderWidth}px solid ${this.borderColor}`;
    return `<div style="${borderStyle}">${this.component.render()}</div>`;
  }
}

class ShadowDecorator extends ComponentDecorator {
  constructor(component: UIComponent, private shadowColor: string = 'rgba(0,0,0,0.2)') {
    super(component);
  }
  
  render(): string {
    const shadowStyle = `box-shadow: 0 2px 4px ${this.shadowColor}`;
    return `<div style="${shadowStyle}">${this.component.render()}</div>`;
  }
}

class PaddingDecorator extends ComponentDecorator {
  constructor(component: UIComponent, private padding: number = 10) {
    super(component);
  }
  
  render(): string {
    const paddingStyle = `padding: ${this.padding}px`;
    return `<div style="${paddingStyle}">${this.component.render()}</div>`;
  }
  
  getWidth(): number {
    return this.component.getWidth() + (this.padding * 2);
  }
  
  getHeight(): number {
    return this.component.getHeight() + (this.padding * 2);
  }
}

class HoverDecorator extends ComponentDecorator {
  constructor(component: UIComponent, private hoverColor: string = 'blue') {
    super(component);
  }
  
  render(): string {
    const hoverStyle = `transition: all 0.3s; cursor: pointer;`;
    const hoverScript = `
      <script>
        document.currentScript.previousElementSibling.addEventListener('mouseenter', function() {
          this.style.color = '${this.hoverColor}';
        });
        document.currentScript.previousElementSibling.addEventListener('mouseleave', function() {
          this.style.color = '';
        });
      </script>
    `;
    return `<div style="${hoverStyle}">${this.component.render()}</div>${hoverScript}`;
  }
}

// Usage
const button = new Button('Click Me');

// Add border
const borderedButton = new BorderDecorator(button, 2, 'blue');
console.log(borderedButton.render());

// Add shadow
const shadowedButton = new ShadowDecorator(button);
console.log(shadowedButton.render());

// Combine multiple decorators
const fancyButton = new HoverDecorator(
  new ShadowDecorator(
    new BorderDecorator(
      new PaddingDecorator(button, 15),
      2,
      'green'
    ),
    'rgba(0,255,0,0.3)'
  ),
  'red'
);
console.log(fancyButton.render());
console.log(`Final size: ${fancyButton.getWidth()}x${fancyButton.getHeight()}`);
```

---

## 🔄 Decorator vs Other Patterns

### Decorator vs Inheritance

| Aspect | Decorator | Inheritance |
|--------|-----------|-------------|
| **Flexibility** | Runtime composition | Compile-time composition |
| **Class Explosion** | Avoids explosion | Can cause explosion |
| **Multiple Features** | Can combine dynamically | Fixed combinations |
| **Object Identity** | Wraps object | Creates new type |

**Example:**
```typescript
// ❌ Inheritance - Class explosion
class Button { }
class BoldButton extends Button { }
class ItalicButton extends Button { }
class BoldItalicButton extends Button { }
class UnderlineButton extends Button { }
class BoldItalicUnderlineButton extends Button { }
// ... exponential growth

// ✅ Decorator - Flexible composition
class Button { }
class BoldDecorator extends Decorator { }
class ItalicDecorator extends Decorator { }
class UnderlineDecorator extends Decorator { }
// Can combine any way: Bold + Italic, Bold + Underline, etc.
```

### Decorator vs Adapter

| Aspect | Decorator | Adapter |
|--------|-----------|---------|
| **Purpose** | Add behavior | Convert interface |
| **Interface** | Same as component | Different from adaptee |
| **Composition** | Can stack multiple | Usually one-to-one |
| **Focus** | Adding functionality | Interface conversion |

### Decorator vs Proxy

| Aspect | Decorator | Proxy |
|--------|-----------|-------|
| **Purpose** | Add behavior | Control access |
| **Focus** | Extending functionality | Access management |
| **Composition** | Can stack multiple | Usually one proxy |
| **When** | Need to add features | Need to control access |

### Decorator vs Strategy

| Aspect | Decorator | Strategy |
|--------|-----------|----------|
| **Purpose** | Add behavior | Change algorithm |
| **Composition** | Can stack | One strategy at a time |
| **Flexibility** | Additive | Replaceable |
| **When** | Need multiple behaviors | Need to switch algorithms |

---

## 🎨 Real-World Applications

### 1. JavaScript/TypeScript Frameworks

**Express.js Middleware:**
```javascript
// Express middleware is essentially decorators
app.use(logger());        // Logging decorator
app.use(compression());   // Compression decorator
app.use(helmet());        // Security decorator
app.use(cors());          // CORS decorator
```

**React Higher-Order Components (HOC):**
```javascript
// HOC pattern is similar to decorator
function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    // Add authentication behavior
    if (!isAuthenticated()) {
      return <Login />;
    }
    return <Component {...props} />;
  };
}

function withLogging(Component) {
  return function LoggedComponent(props) {
    // Add logging behavior
    console.log('Component rendered:', Component.name);
    return <Component {...props} />;
  };
}

// Can stack decorators
const EnhancedComponent = withLogging(withAuth(MyComponent));
```

### 2. Java I/O Streams

```java
// Java uses decorator pattern extensively
FileInputStream fileStream = new FileInputStream("file.txt");
BufferedInputStream bufferedStream = new BufferedInputStream(fileStream);
DataInputStream dataStream = new DataInputStream(bufferedStream);
// Each decorator adds functionality: buffering, data reading, etc.
```

### 3. Python Decorators

```python
# Python has built-in decorator syntax
def logging_decorator(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result}")
        return result
    return wrapper

def caching_decorator(func):
    cache = {}
    def wrapper(*args):
        if args in cache:
            return cache[args]
        result = func(*args)
        cache[args] = result
        return result
    return wrapper

@logging_decorator
@caching_decorator
def expensive_function(n):
    return n * n
```

### 4. C# Attributes

```csharp
// C# attributes are similar to decorators
[Serializable]
[Authorize]
[Logging]
public class MyService
{
    // Attributes add behavior without modifying class
}
```

### 5. Node.js Streams

```javascript
// Node.js streams use decorator pattern
const fs = require('fs');
const zlib = require('zlib');

const readStream = fs.createReadStream('file.txt');
const gzipStream = zlib.createGzip();
const writeStream = fs.createWriteStream('file.txt.gz');

// Each stream decorates the previous one
readStream.pipe(gzipStream).pipe(writeStream);
```

---

## ⚠️ Common Pitfalls and Best Practices

### Pitfalls

❌ **Creating Decorators That Change Interface**
- Problem: Decorator should maintain the same interface as component
- Solution: Always implement the full Component interface

```typescript
// ❌ Bad: Adding new methods
class BadDecorator extends Decorator {
  newMethod() { } // Breaks interface contract
}

// ✅ Good: Maintains interface
class GoodDecorator extends Decorator {
  // Only overrides existing methods
  operation() {
    // Add behavior
    return this.component.operation();
  }
}
```

❌ **Decorator Order Dependencies**
- Problem: Some decorators must be applied in specific order
- Solution: Document order requirements or use builder pattern

```typescript
// ❌ Bad: Order matters but not documented
const client = new CachingDecorator(
  new LoggingDecorator(httpClient)
); // Cache might log, or log might cache?

// ✅ Good: Document or use builder
class HttpClientBuilder {
  private decorators: Array<new (client: HttpClient) => HttpClient> = [];
  
  withLogging() {
    this.decorators.push(LoggingDecorator);
    return this;
  }
  
  withCaching() {
    this.decorators.push(CachingDecorator);
    return this;
  }
  
  build(baseClient: HttpClient): HttpClient {
    return this.decorators.reduceRight(
      (client, Decorator) => new Decorator(client),
      baseClient
    );
  }
}
```

❌ **Too Many Decorators**
- Problem: Stacking too many decorators can hurt performance and readability
- Solution: Combine related decorators or use composition

```typescript
// ❌ Bad: Too many decorators
const client = new ErrorHandlingDecorator(
  new RetryDecorator(
    new CachingDecorator(
      new LoggingDecorator(
        new AuthenticationDecorator(
          new RateLimitingDecorator(
            new BasicHttpClient()
          )
        )
      )
    )
  )
);

// ✅ Good: Combine related decorators
class ObservabilityDecorator extends HttpClientDecorator {
  constructor(client: HttpClient) {
    super(client);
    this.logger = new LoggingDecorator(client);
    this.errorHandler = new ErrorHandlingDecorator(this.logger);
  }
  
  async request(url: string, options?: RequestOptions): Promise<Response> {
    return this.errorHandler.request(url, options);
  }
}
```

❌ **Decorators with Side Effects**
- Problem: Decorators that modify shared state can cause issues
- Solution: Keep decorators stateless or clearly document side effects

```typescript
// ❌ Bad: Shared mutable state
class BadCacheDecorator {
  static cache = new Map(); // Shared across instances
  
  request(url: string) {
    if (BadCacheDecorator.cache.has(url)) {
      return BadCacheDecorator.cache.get(url);
    }
    // ...
  }
}

// ✅ Good: Instance-level state
class GoodCacheDecorator {
  private cache = new Map(); // Per-instance
  
  request(url: string) {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    // ...
  }
}
```

### Best Practices

✅ **Single Responsibility**
- Each decorator should add one specific behavior
- Keep decorators focused and simple

✅ **Maintain Interface Contract**
- Decorators must implement the full Component interface
- Don't add new methods that break substitutability

✅ **Document Decorator Order**
- If order matters, document it clearly
- Consider using builder pattern for complex compositions

✅ **Keep Decorators Stateless When Possible**
- Stateless decorators are easier to reason about
- If state is needed, make it instance-level, not shared

✅ **Use Composition Over Deep Nesting**
- Consider combining related decorators
- Use factory methods for common combinations

```typescript
// ✅ Good: Factory for common combinations
class HttpClientFactory {
  static createProductionClient(): HttpClient {
    return new ErrorHandlingDecorator(
      new RetryDecorator(
        new LoggingDecorator(
          new BasicHttpClient()
        )
      )
    );
  }
  
  static createDevelopmentClient(): HttpClient {
    return new LoggingDecorator(
      new BasicHttpClient()
    );
  }
}
```

✅ **Test Decorators Independently**
- Test each decorator in isolation
- Test decorator composition
- Test that decorators maintain interface contract

---

## 🧪 Testing Decorators

### Unit Testing

```typescript
describe('LoggingDecorator', () => {
  let mockClient: jest.Mocked<HttpClient>;
  let decorator: LoggingDecorator;
  
  beforeEach(() => {
    mockClient = {
      request: jest.fn().mockResolvedValue({ status: 200, data: {} })
    };
    decorator = new LoggingDecorator(mockClient);
  });
  
  it('should log request start and completion', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    await decorator.request('https://api.example.com');
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Request started')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Request completed')
    );
    
    consoleSpy.mockRestore();
  });
  
  it('should forward request to wrapped client', async () => {
    await decorator.request('https://api.example.com');
    
    expect(mockClient.request).toHaveBeenCalledWith(
      'https://api.example.com',
      undefined
    );
  });
  
  it('should return response from wrapped client', async () => {
    const response = await decorator.request('https://api.example.com');
    
    expect(response).toEqual({ status: 200, data: {} });
  });
});

describe('CachingDecorator', () => {
  it('should cache GET requests', async () => {
    const mockClient = {
      request: jest.fn().mockResolvedValue({ status: 200, data: { id: 1 } })
    };
    const decorator = new CachingDecorator(mockClient, 60000);
    
    // First call
    const response1 = await decorator.request('https://api.example.com');
    expect(mockClient.request).toHaveBeenCalledTimes(1);
    
    // Second call - should use cache
    const response2 = await decorator.request('https://api.example.com');
    expect(mockClient.request).toHaveBeenCalledTimes(1); // Still 1!
    expect(response2).toEqual(response1);
  });
  
  it('should not cache non-GET requests', async () => {
    const mockClient = {
      request: jest.fn().mockResolvedValue({ status: 200 })
    };
    const decorator = new CachingDecorator(mockClient);
    
    await decorator.request('https://api.example.com', { method: 'POST' });
    await decorator.request('https://api.example.com', { method: 'POST' });
    
    expect(mockClient.request).toHaveBeenCalledTimes(2);
  });
});
```

### Integration Testing

```typescript
describe('Decorator Composition', () => {
  it('should work with multiple decorators', async () => {
    const baseClient = new BasicHttpClient();
    const client = new RetryDecorator(
      new CachingDecorator(
        new LoggingDecorator(baseClient)
      )
    );
    
    const response = await client.request('https://api.example.com');
    
    expect(response).toBeDefined();
    expect(response.status).toBe(200);
  });
  
  it('should handle errors through decorator chain', async () => {
    const failingClient = {
      request: jest.fn().mockRejectedValue(new Error('Network error'))
    };
    
    const client = new RetryDecorator(
      new ErrorHandlingDecorator(failingClient as HttpClient),
      3
    );
    
    await expect(
      client.request('https://api.example.com')
    ).rejects.toThrow();
    
    expect(failingClient.request).toHaveBeenCalledTimes(3);
  });
});
```

---

## 📊 Advantages and Disadvantages

### Advantages

✅ **Flexible Extension**
- Add behavior at runtime
- No need to modify existing code
- Can combine behaviors dynamically

✅ **Avoids Class Explosion**
- Don't need separate classes for every combination
- Reduces inheritance hierarchy complexity

✅ **Single Responsibility**
- Each decorator has one clear purpose
- Easy to understand and maintain

✅ **Open/Closed Principle**
- Open for extension (new decorators)
- Closed for modification (existing code)

✅ **Composition Over Inheritance**
- More flexible than inheritance
- Can add/remove behaviors at runtime

### Disadvantages

❌ **Complexity**
- Can be harder to understand than simple inheritance
- Decorator chain can be difficult to debug

❌ **Performance Overhead**
- Additional indirection for each decorator
- Multiple method calls through the chain

❌ **Order Dependencies**
- Some decorators must be applied in specific order
- Can be confusing if not documented

❌ **Interface Maintenance**
- Must maintain full Component interface
- Changes to interface affect all decorators

❌ **Debugging Difficulty**
- Harder to debug through decorator chain
- Stack traces can be confusing

---

## 🔗 Related Patterns

### Decorator and Composite
- **Decorator** adds behavior to individual objects
- **Composite** composes objects into tree structures
- Can be used together: decorate composite elements

### Decorator and Strategy
- **Decorator** adds behavior to objects
- **Strategy** changes algorithm used
- Decorator can use Strategy internally

### Decorator and Adapter
- **Decorator** maintains same interface, adds behavior
- **Adapter** changes interface
- Can combine: adapt first, then decorate

### Decorator and Proxy
- **Decorator** adds behavior
- **Proxy** controls access
- Similar structure, different purpose

---

## 🎓 Summary

### Key Takeaways

1. **Purpose**: Decorator adds behavior to objects dynamically without modifying their structure
2. **Structure**: Decorator wraps component and implements same interface
3. **Use When**: You need to add responsibilities dynamically, avoid class explosion, or extend functionality flexibly
4. **Benefits**: Flexibility, composition, single responsibility
5. **Watch Out**: Interface maintenance, order dependencies, performance overhead

### When to Choose Decorator

Choose Decorator when:
- ✅ You need to add behavior to objects at runtime
- ✅ You want to avoid class explosion from inheritance
- ✅ You need to combine multiple behaviors flexibly
- ✅ You want to extend functionality without modifying existing code
- ✅ Behaviors are independent and composable

Avoid Decorator when:
- ❌ The behavior is core to the object (should be in base class)
- ❌ You need to change the object's interface (use Adapter)
- ❌ Performance is critical and overhead is unacceptable
- ❌ Behaviors are not composable or have strict dependencies

### Next Steps

- Practice implementing Decorator in your projects
- Identify places where inheritance causes class explosion
- Compare Decorator with inheritance and other patterns
- Explore real-world examples in popular frameworks
- Experiment with decorator composition and ordering

---

## 📚 Additional Resources

### Design Patterns References
- **Gang of Four (GoF)**: "Design Patterns: Elements of Reusable Object-Oriented Software"
- **Head First Design Patterns**: Chapter on Decorator Pattern

### Real-World Examples
- Express.js middleware
- React Higher-Order Components
- Java I/O streams
- Python decorators
- Node.js streams

### Practice Exercises

1. **Create a Text Editor Decorator System**
   - Base: Plain text
   - Decorators: Bold, Italic, Underline, Color, Size
   - Allow stacking multiple decorators

2. **Build an HTTP Client with Decorators**
   - Base: Basic HTTP client
   - Decorators: Logging, Caching, Retry, Authentication, Rate Limiting
   - Test different combinations

3. **Implement a File Processing Pipeline**
   - Base: File reader
   - Decorators: Compression, Encryption, Validation, Transformation
   - Allow different processing orders

---

**Happy Learning! 🚀**
