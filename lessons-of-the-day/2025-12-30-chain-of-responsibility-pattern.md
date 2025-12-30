# Chain of Responsibility Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Chain of Responsibility pattern definition and intent
- [ ] Learn when to use Chain of Responsibility vs other behavioral patterns
- [ ] Master the handler chain structure and request propagation
- [ ] Recognize real-world applications (middleware, event handling, validation, logging)
- [ ] Understand Chain of Responsibility vs Decorator and Command pattern differences
- [ ] Practice implementing Chain of Responsibility in different scenarios
- [ ] Learn common pitfalls and best practices
- [ ] Explore modern variations (functional chains, async handlers, middleware patterns)
- [ ] Understand breaking the chain and conditional processing

---

## 🎯 Definition

**Chain of Responsibility Pattern** is a behavioral design pattern that passes requests along a chain of handlers. Upon receiving a request, each handler decides either to process the request or to pass it to the next handler in the chain.

**Intent (GoF):**
- Avoid coupling the sender of a request to its receiver
- Give more than one object a chance to handle the request
- Chain the receiving objects and pass the request along the chain until an object handles it
- Also known as: **Chain of Command Pattern**

**Key Principle:**
> "Pass the request along the chain" - The chain of responsibility pattern decouples request senders from receivers by allowing multiple objects to handle a request. Each handler in the chain can either handle the request or pass it to the next handler, creating a flexible and extensible processing pipeline.

---

## 🏗️ Structure

### UML Diagram Concept

```
Client
└── sends Request to first Handler

Handler (Abstract)
├── nextHandler: Handler | null
├── setNext(handler: Handler): Handler
└── handle(request: Request): void
    ├── if (canHandle(request))
    │   └── process(request)
    │   └── return
    └── if (nextHandler)
        └── nextHandler.handle(request)

ConcreteHandlerA extends Handler
└── handle(request: Request): void
    └── if (canHandle(request))
        └── process(request)
    └── else
        └── super.handle(request)

ConcreteHandlerB extends Handler
└── handle(request: Request): void
    └── if (canHandle(request))
        └── process(request)
    └── else
        └── super.handle(request)

ConcreteHandlerC extends Handler
└── handle(request: Request): void
    └── if (canHandle(request))
        └── process(request)
    └── else
        └── super.handle(request)
```

### Participants

1. **Handler** - Defines an interface for handling requests, optionally implements the successor link
2. **ConcreteHandler** - Handles requests it is responsible for, can access its successor, forwards requests it cannot handle
3. **Client** - Initiates the request to a ConcreteHandler object on the chain
4. **Request** - The object being passed along the chain (can be simple data or complex object)

### Key Concepts

**Request Propagation:**
- Request travels along the chain
- Each handler decides to process or forward
- Chain continues until request is handled or chain ends
- Multiple handlers can process the same request (optional)

**Decoupling:**
- Sender doesn't know which handler will process
- Handlers don't know about other handlers (except next)
- Chain can be configured dynamically
- Handlers can be added/removed at runtime

**Flexible Processing:**
- Different handlers for different request types
- Conditional processing based on request properties
- Can break chain early or continue processing
- Can modify request before passing along

**Dynamic Chain Construction:**
- Chain can be built at runtime
- Order matters in chain
- Can have multiple chains for different request types
- Can have branching chains

**Single Responsibility:**
- Each handler has one responsibility
- Handlers are focused and testable
- Easy to add new handlers
- Easy to modify existing handlers

---

## 💡 When to Use

### Use Chain of Responsibility When:

✅ **More than one object may handle a request, and the handler isn't known a priority**
- Example: Event handling systems where multiple listeners can handle events
- Example: Middleware in web frameworks (Express.js, Koa)
- Example: Logging systems with multiple log handlers

✅ **You want to issue a request to one of several objects without specifying the receiver explicitly**
- Example: Help system where request goes through multiple help handlers
- Example: Purchase approval system with multiple approval levels
- Example: Error handling with multiple error handlers

✅ **The set of objects that can handle a request should be specified dynamically**
- Example: Plugin systems where handlers can be registered dynamically
- Example: Validation chains that can be configured at runtime
- Example: Processing pipelines with configurable steps

✅ **You want to decouple request senders from receivers**
- Example: UI event handling where events bubble through components
- Example: Request processing in web servers
- Example: Message routing in distributed systems

✅ **You need to process requests in a specific order with multiple processors**
- Example: Authentication → Authorization → Validation → Processing
- Example: Request logging → Rate limiting → Caching → Processing
- Example: Data transformation pipeline

### Don't Use When:

❌ **Only one handler can process the request** - Direct handler call is simpler
❌ **The handler is known at compile time** - Simple method call is more efficient
❌ **Request must be handled by a specific handler** - Direct dependency is clearer
❌ **Handlers need to know about all other handlers** - Consider Mediator pattern
❌ **Request processing order doesn't matter** - Consider Strategy or Command pattern
❌ **Performance is critical** - Chain traversal adds overhead

---

## 🔨 Implementation Examples

### Example 1: Basic Chain of Responsibility (Purchase Approval)

```typescript
// Request Object
interface PurchaseRequest {
  amount: number;
  item: string;
  requester: string;
}

// Handler Interface
abstract class PurchaseHandler {
  protected nextHandler: PurchaseHandler | null = null;

  setNext(handler: PurchaseHandler): PurchaseHandler {
    this.nextHandler = handler;
    return handler;
  }

  handle(request: PurchaseRequest): void {
    if (this.canHandle(request)) {
      this.process(request);
    } else if (this.nextHandler) {
      this.nextHandler.handle(request);
    } else {
      console.log(`Request for $${request.amount} could not be approved`);
    }
  }

  protected abstract canHandle(request: PurchaseRequest): boolean;
  protected abstract process(request: PurchaseRequest): void;
}

// Concrete Handlers
class ManagerHandler extends PurchaseHandler {
  private maxAmount: number = 1000;

  protected canHandle(request: PurchaseRequest): boolean {
    return request.amount <= this.maxAmount;
  }

  protected process(request: PurchaseRequest): void {
    console.log(
      `Manager approved purchase of ${request.item} for $${request.amount} by ${request.requester}`
    );
  }
}

class DirectorHandler extends PurchaseHandler {
  private maxAmount: number = 5000;

  protected canHandle(request: PurchaseRequest): boolean {
    return request.amount <= this.maxAmount;
  }

  protected process(request: PurchaseRequest): void {
    console.log(
      `Director approved purchase of ${request.item} for $${request.amount} by ${request.requester}`
    );
  }
}

class VPHandler extends PurchaseHandler {
  private maxAmount: number = 20000;

  protected canHandle(request: PurchaseRequest): boolean {
    return request.amount <= this.maxAmount;
  }

  protected process(request: PurchaseRequest): void {
    console.log(
      `VP approved purchase of ${request.item} for $${request.amount} by ${request.requester}`
    );
  }
}

class CEOHandler extends PurchaseHandler {
  protected canHandle(request: PurchaseRequest): boolean {
    return true; // CEO can handle any amount
  }

  protected process(request: PurchaseRequest): void {
    console.log(
      `CEO approved purchase of ${request.item} for $${request.amount} by ${request.requester}`
    );
  }
}

// Usage
const manager = new ManagerHandler();
const director = new DirectorHandler();
const vp = new VPHandler();
const ceo = new CEOHandler();

// Build the chain
manager.setNext(director).setNext(vp).setNext(ceo);

// Process requests
const requests: PurchaseRequest[] = [
  { amount: 500, item: 'Office Supplies', requester: 'John' },
  { amount: 2500, item: 'Software License', requester: 'Jane' },
  { amount: 10000, item: 'Server Equipment', requester: 'Bob' },
  { amount: 50000, item: 'Company Car', requester: 'Alice' },
];

requests.forEach(request => {
  console.log(`\nProcessing request: ${request.item} - $${request.amount}`);
  manager.handle(request);
});

// Output:
// Processing request: Office Supplies - $500
// Manager approved purchase of Office Supplies for $500 by John
//
// Processing request: Software License - $2500
// Director approved purchase of Software License for $2500 by Jane
//
// Processing request: Server Equipment - $10000
// VP approved purchase of Server Equipment for $10000 by Bob
//
// Processing request: Company Car - $50000
// CEO approved purchase of Company Car for $50000 by Alice
```

### Example 2: Middleware Pattern (Express.js Style)

```typescript
// Request and Response Types
interface Request {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
  query?: Record<string, string>;
}

interface Response {
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  send(data: any): void;
  json(data: any): void;
  status(code: number): Response;
}

type NextFunction = () => void;
type Middleware = (req: Request, res: Response, next: NextFunction) => void;

// Middleware Chain Handler
class MiddlewareChain {
  private middlewares: Middleware[] = [];
  private index: number = 0;

  use(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  execute(req: Request, res: Response): void {
    this.index = 0;
    this.run(req, res);
  }

  private run(req: Request, res: Response): void {
    if (this.index >= this.middlewares.length) {
      return; // Chain complete
    }

    const middleware = this.middlewares[this.index++];
    const next = () => this.run(req, res);

    try {
      middleware(req, res, next);
    } catch (error) {
      console.error('Middleware error:', error);
      if (!res.statusCode) {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
}

// Concrete Middleware Handlers
const loggerMiddleware: Middleware = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

const authMiddleware: Middleware = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token || token !== 'Bearer valid-token') {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};

const bodyParserMiddleware: Middleware = (req, res, next) => {
  // Simulate body parsing
  if (req.method === 'POST' || req.method === 'PUT') {
    req.body = { parsed: true, data: 'request body' };
  }
  next();
};

const rateLimitMiddleware: Middleware = (req, res, next) => {
  // Simulate rate limiting
  const clientId = req.headers['x-client-id'] || 'unknown';
  console.log(`Rate limiting check for client: ${clientId}`);
  // In real implementation, check against rate limit store
  next();
};

const requestHandler: Middleware = (req, res, next) => {
  if (req.url === '/api/users' && req.method === 'GET') {
    res.status(200).json({ users: ['Alice', 'Bob', 'Charlie'] });
  } else if (req.url === '/api/data' && req.method === 'POST') {
    res.status(201).json({ message: 'Data created', data: req.body });
  } else {
    res.status(404).json({ error: 'Not Found' });
  }
};

// Usage
const app = new MiddlewareChain();

// Register middlewares in order
app.use(loggerMiddleware);
app.use(rateLimitMiddleware);
app.use(bodyParserMiddleware);
app.use(authMiddleware);
app.use(requestHandler);

// Simulate requests
const req1: Request = {
  method: 'GET',
  url: '/api/users',
  headers: {
    'authorization': 'Bearer valid-token',
    'x-client-id': 'client-123'
  }
};

const req2: Request = {
  method: 'POST',
  url: '/api/data',
  headers: {
    'authorization': 'Bearer invalid-token',
    'x-client-id': 'client-456'
  }
};

const res1: Response = {
  statusCode: 0,
  headers: {},
  body: null,
  send(data: any) {
    this.body = data;
    console.log(`Response: ${JSON.stringify(data)}`);
  },
  json(data: any) {
    this.body = data;
    console.log(`Response: ${JSON.stringify(data)}`);
  },
  status(code: number) {
    this.statusCode = code;
    return this;
  }
};

const res2: Response = {
  statusCode: 0,
  headers: {},
  body: null,
  send(data: any) {
    this.body = data;
    console.log(`Response: ${JSON.stringify(data)}`);
  },
  json(data: any) {
    this.body = data;
    console.log(`Response: ${JSON.stringify(data)}`);
  },
  status(code: number) {
    this.statusCode = code;
    return this;
  }
};

console.log('=== Request 1: Valid Request ===');
app.execute(req1, res1);

console.log('\n=== Request 2: Invalid Token ===');
app.execute(req2, res2);
```

### Example 3: Validation Chain

```typescript
// Validation Request
interface ValidationRequest {
  data: any;
  field: string;
  value: any;
  errors: string[];
}

// Handler Interface
abstract class Validator {
  protected nextValidator: Validator | null = null;

  setNext(validator: Validator): Validator {
    this.nextValidator = validator;
    return validator;
  }

  validate(request: ValidationRequest): ValidationRequest {
    const result = this.doValidate(request);
    if (!result.isValid) {
      request.errors.push(result.error);
    }

    if (this.nextValidator && result.isValid) {
      return this.nextValidator.validate(request);
    }

    return request;
  }

  protected abstract doValidate(request: ValidationRequest): {
    isValid: boolean;
    error?: string;
  };
}

// Concrete Validators
class RequiredValidator extends Validator {
  protected doValidate(request: ValidationRequest): {
    isValid: boolean;
    error?: string;
  } {
    if (request.value === null || request.value === undefined || request.value === '') {
      return {
        isValid: false,
        error: `${request.field} is required`
      };
    }
    return { isValid: true };
  }
}

class EmailValidator extends Validator {
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  protected doValidate(request: ValidationRequest): {
    isValid: boolean;
    error?: string;
  } {
    if (request.field === 'email' && !this.emailRegex.test(request.value)) {
      return {
        isValid: false,
        error: `${request.field} must be a valid email address`
      };
    }
    return { isValid: true };
  }
}

class MinLengthValidator extends Validator {
  constructor(private minLength: number) {
    super();
  }

  protected doValidate(request: ValidationRequest): {
    isValid: boolean;
    error?: string;
  } {
    if (typeof request.value === 'string' && request.value.length < this.minLength) {
      return {
        isValid: false,
        error: `${request.field} must be at least ${this.minLength} characters`
      };
    }
    return { isValid: true };
  }
}

class MaxLengthValidator extends Validator {
  constructor(private maxLength: number) {
    super();
  }

  protected doValidate(request: ValidationRequest): {
    isValid: boolean;
    error?: string;
  } {
    if (typeof request.value === 'string' && request.value.length > this.maxLength) {
      return {
        isValid: false,
        error: `${request.field} must be at most ${this.maxLength} characters`
      };
    }
    return { isValid: true };
  }
}

class NumberRangeValidator extends Validator {
  constructor(private min: number, private max: number) {
    super();
  }

  protected doValidate(request: ValidationRequest): {
    isValid: boolean;
    error?: string;
  } {
    const num = Number(request.value);
    if (!isNaN(num) && (num < this.min || num > this.max)) {
      return {
        isValid: false,
        error: `${request.field} must be between ${this.min} and ${this.max}`
      };
    }
    return { isValid: true };
  }
}

// Validation Builder
class ValidationBuilder {
  private validators: Validator[] = [];

  required(): ValidationBuilder {
    this.validators.push(new RequiredValidator());
    return this;
  }

  email(): ValidationBuilder {
    this.validators.push(new EmailValidator());
    return this;
  }

  minLength(length: number): ValidationBuilder {
    this.validators.push(new MinLengthValidator(length));
    return this;
  }

  maxLength(length: number): ValidationBuilder {
    this.validators.push(new MaxLengthValidator(length));
    return this;
  }

  numberRange(min: number, max: number): ValidationBuilder {
    this.validators.push(new NumberRangeValidator(min, max));
    return this;
  }

  build(): Validator | null {
    if (this.validators.length === 0) {
      return null;
    }

    // Build chain
    for (let i = 0; i < this.validators.length - 1; i++) {
      this.validators[i].setNext(this.validators[i + 1]);
    }

    return this.validators[0];
  }
}

// Usage
function validateField(field: string, value: any, validator: Validator): string[] {
  const request: ValidationRequest = {
    data: {},
    field,
    value,
    errors: []
  };

  validator.validate(request);
  return request.errors;
}

// Build validation chains
const emailValidator = new ValidationBuilder()
  .required()
  .email()
  .build()!;

const passwordValidator = new ValidationBuilder()
  .required()
  .minLength(8)
  .maxLength(100)
  .build()!;

const ageValidator = new ValidationBuilder()
  .required()
  .numberRange(18, 120)
  .build()!;

// Test validations
console.log('=== Email Validation ===');
console.log('Valid email:', validateField('email', 'user@example.com', emailValidator));
console.log('Invalid email:', validateField('email', 'invalid-email', emailValidator));
console.log('Empty email:', validateField('email', '', emailValidator));

console.log('\n=== Password Validation ===');
console.log('Valid password:', validateField('password', 'SecurePass123', passwordValidator));
console.log('Too short:', validateField('password', 'short', passwordValidator));
console.log('Empty password:', validateField('password', '', passwordValidator));

console.log('\n=== Age Validation ===');
console.log('Valid age:', validateField('age', '25', ageValidator));
console.log('Too young:', validateField('age', '15', ageValidator));
console.log('Too old:', validateField('age', '150', ageValidator));
```

### Example 4: Logging Chain (Multiple Handlers Process Request)

```typescript
// Log Request
interface LogRequest {
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Handler Interface
abstract class LogHandler {
  protected nextHandler: LogHandler | null = null;

  setNext(handler: LogHandler): LogHandler {
    this.nextHandler = handler;
    return handler;
  }

  handle(request: LogRequest): void {
    // Process the request
    this.process(request);

    // Always pass to next handler (multiple handlers can process)
    if (this.nextHandler) {
      this.nextHandler.handle(request);
    }
  }

  protected abstract process(request: LogRequest): void;
}

// Concrete Handlers
class ConsoleLogHandler extends LogHandler {
  protected process(request: LogRequest): void {
    const logEntry = `[${request.timestamp.toISOString()}] [${request.level}] ${request.message}`;
    console.log(logEntry);
    if (request.metadata) {
      console.log('Metadata:', request.metadata);
    }
  }
}

class FileLogHandler extends LogHandler {
  private logs: string[] = [];

  protected process(request: LogRequest): void {
    // Simulate file logging
    const logEntry = JSON.stringify({
      timestamp: request.timestamp.toISOString(),
      level: request.level,
      message: request.message,
      metadata: request.metadata
    });
    this.logs.push(logEntry);
  }

  getLogs(): string[] {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
  }
}

class ErrorAlertHandler extends LogHandler {
  protected process(request: LogRequest): void {
    if (request.level === 'ERROR') {
      // Simulate sending alert
      console.log(`🚨 ALERT: Critical error detected - ${request.message}`);
      // In real implementation, send email, SMS, or notification
    }
  }
}

class MetricsHandler extends LogHandler {
  private metrics: Map<string, number> = new Map();

  protected process(request: LogRequest): void {
    const key = `log.${request.level.toLowerCase()}`;
    this.metrics.set(key, (this.metrics.get(key) || 0) + 1);
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}

// Logger Client
class Logger {
  private handler: LogHandler;

  constructor(handler: LogHandler) {
    this.handler = handler;
  }

  debug(message: string, metadata?: Record<string, any>): void {
    this.handler.handle({
      level: 'DEBUG',
      message,
      timestamp: new Date(),
      metadata
    });
  }

  info(message: string, metadata?: Record<string, any>): void {
    this.handler.handle({
      level: 'INFO',
      message,
      timestamp: new Date(),
      metadata
    });
  }

  warn(message: string, metadata?: Record<string, any>): void {
    this.handler.handle({
      level: 'WARN',
      message,
      timestamp: new Date(),
      metadata
    });
  }

  error(message: string, metadata?: Record<string, any>): void {
    this.handler.handle({
      level: 'ERROR',
      message,
      timestamp: new Date(),
      metadata
    });
  }
}

// Usage
const consoleHandler = new ConsoleLogHandler();
const fileHandler = new FileLogHandler();
const alertHandler = new ErrorAlertHandler();
const metricsHandler = new MetricsHandler();

// Build chain (all handlers process the request)
consoleHandler
  .setNext(fileHandler)
  .setNext(alertHandler)
  .setNext(metricsHandler);

const logger = new Logger(consoleHandler);

console.log('=== Logging Examples ===\n');

logger.info('Application started', { version: '1.0.0' });
logger.debug('Processing user request', { userId: 123 });
logger.warn('Rate limit approaching', { current: 90, limit: 100 });
logger.error('Database connection failed', { host: 'db.example.com', port: 5432 });

console.log('\n=== File Logs ===');
console.log(fileHandler.getLogs());

console.log('\n=== Metrics ===');
console.log(metricsHandler.getMetrics());
```

### Example 5: Event Bubbling (UI Event Handling)

```typescript
// Event Types
interface UIEvent {
  type: string;
  target: UIComponent;
  currentTarget: UIComponent;
  bubbles: boolean;
  stopPropagation: boolean;
}

// Component Base Class
abstract class UIComponent {
  protected parent: UIComponent | null = null;
  protected children: UIComponent[] = [];
  protected eventHandlers: Map<string, ((event: UIEvent) => void)[]> = new Map();

  constructor(public name: string) {}

  addChild(child: UIComponent): void {
    child.parent = this;
    this.children.push(child);
  }

  addEventListener(eventType: string, handler: (event: UIEvent) => void): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }

  dispatchEvent(event: UIEvent): void {
    // Create event with current target
    const currentEvent: UIEvent = {
      ...event,
      currentTarget: this
    };

    // Handle event at this component
    const handlers = this.eventHandlers.get(event.type) || [];
    for (const handler of handlers) {
      if (currentEvent.stopPropagation) {
        break;
      }
      handler(currentEvent);
    }

    // Bubble up to parent if event bubbles and propagation not stopped
    if (event.bubbles && !currentEvent.stopPropagation && this.parent) {
      this.parent.dispatchEvent(currentEvent);
    }
  }

  abstract render(): string;
}

// Concrete Components
class Button extends UIComponent {
  constructor(name: string) {
    super(name);
  }

  click(): void {
    const event: UIEvent = {
      type: 'click',
      target: this,
      currentTarget: this,
      bubbles: true,
      stopPropagation: false
    };
    this.dispatchEvent(event);
  }

  render(): string {
    return `<button>${this.name}</button>`;
  }
}

class Form extends UIComponent {
  constructor(name: string) {
    super(name);
  }

  submit(): void {
    const event: UIEvent = {
      type: 'submit',
      target: this,
      currentTarget: this,
      bubbles: true,
      stopPropagation: false
    };
    this.dispatchEvent(event);
  }

  render(): string {
    const childrenHtml = this.children.map(child => child.render()).join('\n');
    return `<form name="${this.name}">\n${childrenHtml}\n</form>`;
  }
}

class Container extends UIComponent {
  constructor(name: string) {
    super(name);
  }

  render(): string {
    const childrenHtml = this.children.map(child => child.render()).join('\n');
    return `<div class="${this.name}">\n${childrenHtml}\n</div>`;
  }
}

// Usage
const container = new Container('app-container');
const form = new Form('login-form');
const submitButton = new Button('Submit');
const cancelButton = new Button('Cancel');

form.addChild(submitButton);
form.addChild(cancelButton);
container.addChild(form);

// Add event handlers at different levels
container.addEventListener('click', (event) => {
  console.log(`Container received click event from ${event.target.name}`);
});

form.addEventListener('click', (event) => {
  console.log(`Form received click event from ${event.target.name}`);
  if (event.target.name === 'Submit') {
    console.log('Form will submit...');
  }
});

submitButton.addEventListener('click', (event) => {
  console.log(`Button ${event.target.name} was clicked`);
  // Stop propagation to prevent form and container handlers
  event.stopPropagation = true;
});

cancelButton.addEventListener('click', (event) => {
  console.log(`Button ${event.target.name} was clicked`);
  // Allow event to bubble
});

console.log('=== Event Bubbling Example ===\n');

console.log('1. Clicking Submit button (stops propagation):');
submitButton.click();

console.log('\n2. Clicking Cancel button (bubbles up):');
cancelButton.click();

console.log('\n3. Submitting form:');
form.submit();
```

---

## 🔄 Pattern Variations

### Variation 1: Functional Chain of Responsibility

```typescript
// Functional approach using higher-order functions
type Handler<T> = (request: T, next: () => T) => T;

class FunctionalChain<T> {
  private handlers: Handler<T>[] = [];

  use(handler: Handler<T>): FunctionalChain<T> {
    this.handlers.push(handler);
    return this;
  }

  execute(request: T): T {
    let index = 0;

    const next = (): T => {
      if (index >= this.handlers.length) {
        return request;
      }
      const handler = this.handlers[index++];
      return handler(request, next);
    };

    return next();
  }
}

// Usage
interface Request {
  value: number;
  result: number;
}

const chain = new FunctionalChain<Request>();

chain
  .use((req, next) => {
    console.log('Handler 1: Doubling value');
    req.result = req.value * 2;
    return next();
  })
  .use((req, next) => {
    console.log('Handler 2: Adding 10');
    req.result += 10;
    return next();
  })
  .use((req, next) => {
    console.log('Handler 3: Multiplying by 3');
    req.result *= 3;
    return next();
  });

const request: Request = { value: 5, result: 0 };
const result = chain.execute(request);
console.log(`Final result: ${result.result}`); // (5 * 2 + 10) * 3 = 60
```

### Variation 2: Async Chain of Responsibility

```typescript
// Async handler interface
type AsyncHandler<T> = (request: T) => Promise<T | null>;

class AsyncChain<T> {
  private handlers: AsyncHandler<T>[] = [];

  use(handler: AsyncHandler<T>): AsyncChain<T> {
    this.handlers.push(handler);
    return this;
  }

  async execute(request: T): Promise<T | null> {
    for (const handler of this.handlers) {
      const result = await handler(request);
      if (result === null) {
        // Handler decided to stop the chain
        return null;
      }
      request = result;
    }
    return request;
  }
}

// Usage
interface DataRequest {
  data: string;
  processed: boolean;
}

const asyncChain = new AsyncChain<DataRequest>();

asyncChain
  .use(async (req) => {
    console.log('Processing step 1...');
    await new Promise(resolve => setTimeout(resolve, 100));
    req.data = req.data.toUpperCase();
    return req;
  })
  .use(async (req) => {
    console.log('Processing step 2...');
    await new Promise(resolve => setTimeout(resolve, 100));
    req.data = req.data.split('').reverse().join('');
    return req;
  })
  .use(async (req) => {
    console.log('Processing step 3...');
    await new Promise(resolve => setTimeout(resolve, 100));
    req.processed = true;
    return req;
  });

(async () => {
  const request: DataRequest = { data: 'hello', processed: false };
  const result = await asyncChain.execute(request);
  console.log('Result:', result);
})();
```

### Variation 3: Conditional Chain (Early Termination)

```typescript
// Handler that can stop the chain
abstract class ConditionalHandler {
  protected nextHandler: ConditionalHandler | null = null;

  setNext(handler: ConditionalHandler): ConditionalHandler {
    this.nextHandler = handler;
    return handler;
  }

  handle(request: any): boolean {
    if (this.shouldStop(request)) {
      return false; // Stop chain
    }

    this.process(request);

    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }

    return true; // Chain completed
  }

  protected abstract shouldStop(request: any): boolean;
  protected abstract process(request: any): void;
}

// Example: Request processing with early termination
class AuthenticationHandler extends ConditionalHandler {
  protected shouldStop(request: any): boolean {
    return !request.authenticated;
  }

  protected process(request: any): void {
    console.log('User authenticated');
  }
}

class AuthorizationHandler extends ConditionalHandler {
  protected shouldStop(request: any): boolean {
    return !request.authorized;
  }

  protected process(request: any): void {
    console.log('User authorized');
  }
}

class ProcessingHandler extends ConditionalHandler {
  protected shouldStop(request: any): boolean {
    return false;
  }

  protected process(request: any): void {
    console.log('Processing request');
  }
}

// Usage
const auth = new AuthenticationHandler();
const authz = new AuthorizationHandler();
const processing = new ProcessingHandler();

auth.setNext(authz).setNext(processing);

const request1 = { authenticated: true, authorized: true };
console.log('Request 1 (full chain):');
auth.handle(request1);

const request2 = { authenticated: false, authorized: false };
console.log('\nRequest 2 (stops at auth):');
auth.handle(request2);
```

---

## 🔀 Pattern Comparisons

### Chain of Responsibility vs Decorator

**Similarities:**
- Both use composition and delegation
- Both can chain objects together
- Both allow dynamic behavior modification

**Differences:**

| Aspect | Chain of Responsibility | Decorator |
|--------|------------------------|-----------|
| **Purpose** | Pass request through chain until handled | Add behavior to object |
| **Processing** | One handler processes request | All decorators process |
| **Stopping** | Can stop after first handler | Always processes all decorators |
| **Object** | Multiple different handlers | Same object with layers |
| **Use Case** | Request routing, validation | Feature enhancement |

**When to use Chain of Responsibility:**
- You need to find the right handler for a request
- Only one handler should process the request
- Handlers are independent and don't need to know about each other

**When to use Decorator:**
- You need to add multiple behaviors to the same object
- All behaviors should be applied
- You want to compose features dynamically

### Chain of Responsibility vs Command

**Similarities:**
- Both encapsulate requests
- Both can queue operations
- Both support dynamic behavior

**Differences:**

| Aspect | Chain of Responsibility | Command |
|--------|------------------------|---------|
| **Structure** | Chain of handlers | Single command object |
| **Execution** | Passes through chain | Direct execution |
| **Undo** | Not typically supported | Often supports undo/redo |
| **Queue** | Natural chain processing | Explicit queue management |
| **Use Case** | Request routing | Action encapsulation |

**When to use Chain of Responsibility:**
- You need to find the right processor for a request
- Multiple objects might handle the request
- You want to decouple sender from receiver

**When to use Command:**
- You need undo/redo functionality
- You want to queue operations
- You need to log or audit operations

### Chain of Responsibility vs Strategy

**Similarities:**
- Both provide alternative behaviors
- Both use polymorphism
- Both allow runtime selection

**Differences:**

| Aspect | Chain of Responsibility | Strategy |
|--------|------------------------|----------|
| **Selection** | Automatic (chain decides) | Explicit (client chooses) |
| **Multiple** | Can try multiple strategies | One strategy at a time |
| **Context** | Request passes through chain | Context uses one strategy |
| **Use Case** | Request routing | Algorithm selection |

**When to use Chain of Responsibility:**
- You don't know which handler to use
- Multiple handlers might be tried
- You want automatic handler selection

**When to use Strategy:**
- You know which algorithm to use
- Client explicitly chooses strategy
- One algorithm per context

---

## 🎯 Real-World Applications

### 1. Express.js Middleware

Express.js uses Chain of Responsibility for middleware:

```typescript
// Express middleware chain
app.use(logger);
app.use(authentication);
app.use(authorization);
app.use(bodyParser);
app.use(router);
```

Each middleware can:
- Process the request
- Modify request/response
- Call `next()` to continue chain
- Send response to stop chain

### 2. Event Bubbling in DOM

Browser event system uses Chain of Responsibility:

```javascript
// Event bubbles from child to parent
button.addEventListener('click', handler1);
form.addEventListener('click', handler2);
document.addEventListener('click', handler3);
```

### 3. Exception Handling

Many languages use Chain of Responsibility for exception handling:

```typescript
try {
  // code
} catch (SpecificError e) {
  // handle
} catch (GeneralError e) {
  // handle
} catch (Error e) {
  // handle
}
```

### 4. Validation Frameworks

Validation libraries use chains:

```typescript
validator
  .required()
  .email()
  .minLength(8)
  .maxLength(100);
```

### 5. Logging Frameworks

Logging systems use chains for multiple handlers:

```typescript
logger
  .addHandler(consoleHandler)
  .addHandler(fileHandler)
  .addHandler(emailHandler);
```

---

## ⚠️ Common Pitfalls and Best Practices

### Common Pitfalls

❌ **Infinite Loops in Chain**
```typescript
// BAD: Handler points to itself
handler1.setNext(handler1); // Infinite loop!

// GOOD: Proper chain construction
handler1.setNext(handler2).setNext(handler3);
```

❌ **Not Handling End of Chain**
```typescript
// BAD: No handling when chain ends
handle(request: Request): void {
  if (this.canHandle(request)) {
    this.process(request);
  } else if (this.nextHandler) {
    this.nextHandler.handle(request);
  }
  // What if no handler can process?
}

// GOOD: Handle end of chain
handle(request: Request): void {
  if (this.canHandle(request)) {
    this.process(request);
  } else if (this.nextHandler) {
    this.nextHandler.handle(request);
  } else {
    this.handleUnprocessed(request); // Handle unprocessed request
  }
}
```

❌ **Modifying Request in Multiple Handlers**
```typescript
// BAD: Unpredictable behavior
handler1.handle(request); // Modifies request
handler2.handle(request); // Uses modified request (unexpected)

// GOOD: Pass immutable or copy request
handle(request: Request): void {
  const newRequest = { ...request }; // Copy
  // Process newRequest
}
```

❌ **Circular References**
```typescript
// BAD: Circular chain
handler1.setNext(handler2);
handler2.setNext(handler3);
handler3.setNext(handler1); // Circular!

// GOOD: Linear or tree structure
handler1.setNext(handler2).setNext(handler3);
```

### Best Practices

✅ **Use Builder Pattern for Chain Construction**
```typescript
class ChainBuilder {
  private handlers: Handler[] = [];

  add(handler: Handler): ChainBuilder {
    this.handlers.push(handler);
    return this;
  }

  build(): Handler | null {
    if (this.handlers.length === 0) return null;
    
    for (let i = 0; i < this.handlers.length - 1; i++) {
      this.handlers[i].setNext(this.handlers[i + 1]);
    }
    
    return this.handlers[0];
  }
}
```

✅ **Make Handlers Immutable After Chain Construction**
```typescript
class Handler {
  private _next: Handler | null = null;
  private chainBuilt: boolean = false;

  setNext(handler: Handler): Handler {
    if (this.chainBuilt) {
      throw new Error('Chain already built');
    }
    this._next = handler;
    return handler;
  }

  build(): void {
    this.chainBuilt = true;
  }
}
```

✅ **Provide Default Handler for Unprocessed Requests**
```typescript
class DefaultHandler extends Handler {
  handle(request: Request): void {
    console.warn(`Unhandled request: ${JSON.stringify(request)}`);
    // Log, throw error, or provide default behavior
  }
}
```

✅ **Use Type Safety for Requests**
```typescript
interface Request {
  type: string;
  data: any;
}

abstract class Handler {
  abstract canHandle(request: Request): boolean;
  abstract process(request: Request): void;
}
```

✅ **Support Request Modification Tracking**
```typescript
interface Request {
  original: any;
  current: any;
  modifications: string[];
}

class Handler {
  handle(request: Request): void {
    if (this.canHandle(request)) {
      const before = JSON.stringify(request.current);
      this.process(request);
      const after = JSON.stringify(request.current);
      if (before !== after) {
        request.modifications.push(this.constructor.name);
      }
    }
    // Continue chain...
  }
}
```

✅ **Implement Chain Validation**
```typescript
class ChainValidator {
  static validate(handler: Handler): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    const visited = new Set<Handler>();
    let current: Handler | null = handler;

    while (current) {
      if (visited.has(current)) {
        issues.push('Circular reference detected');
        break;
      }
      visited.add(current);
      current = (current as any).nextHandler;
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}
```

---

## 🚀 Modern Variations and Extensions

### 1. Pipeline Pattern (All Handlers Process)

```typescript
class Pipeline<T> {
  private processors: ((data: T) => T)[] = [];

  pipe(processor: (data: T) => T): Pipeline<T> {
    this.processors.push(processor);
    return this;
  }

  execute(data: T): T {
    return this.processors.reduce((acc, processor) => processor(acc), data);
  }
}

// Usage
const pipeline = new Pipeline<number>()
  .pipe(x => x * 2)
  .pipe(x => x + 10)
  .pipe(x => x * 3);

console.log(pipeline.execute(5)); // (5 * 2 + 10) * 3 = 60
```

### 2. Interceptor Pattern

```typescript
interface Interceptor<T> {
  before?(request: T): T | void;
  after?(request: T, response: any): any;
  error?(request: T, error: Error): any;
}

class InterceptorChain<T> {
  private interceptors: Interceptor<T>[] = [];

  use(interceptor: Interceptor<T>): InterceptorChain<T> {
    this.interceptors.push(interceptor);
    return this;
  }

  async execute(request: T, handler: (req: T) => Promise<any>): Promise<any> {
    // Before interceptors
    for (const interceptor of this.interceptors) {
      if (interceptor.before) {
        const result = interceptor.before(request);
        if (result !== undefined) {
          request = result;
        }
      }
    }

    try {
      // Execute handler
      let response = await handler(request);

      // After interceptors
      for (const interceptor of this.interceptors.reverse()) {
        if (interceptor.after) {
          response = interceptor.after(request, response);
        }
      }

      return response;
    } catch (error) {
      // Error interceptors
      for (const interceptor of this.interceptors.reverse()) {
        if (interceptor.error) {
          return interceptor.error(request, error as Error);
        }
      }
      throw error;
    }
  }
}
```

### 3. Filter Chain

```typescript
type Filter<T> = (item: T) => boolean;

class FilterChain<T> {
  private filters: Filter<T>[] = [];

  addFilter(filter: Filter<T>): FilterChain<T> {
    this.filters.push(filter);
    return this;
  }

  apply(items: T[]): T[] {
    return items.filter(item => 
      this.filters.every(filter => filter(item))
    );
  }
}

// Usage
const chain = new FilterChain<number>()
  .addFilter(x => x > 0)
  .addFilter(x => x < 100)
  .addFilter(x => x % 2 === 0);

console.log(chain.apply([-5, 10, 50, 150, 75, 24])); // [10, 50, 24]
```

---

## 📚 Summary

### Key Takeaways

1. **Chain of Responsibility** decouples request senders from receivers by allowing multiple handlers to process requests
2. **Request Propagation** - Requests travel along the chain until handled or chain ends
3. **Dynamic Chain Construction** - Chains can be built and modified at runtime
4. **Single Responsibility** - Each handler has one clear responsibility
5. **Flexible Processing** - Can stop early, continue processing, or have multiple handlers process

### When to Use

✅ Use when:
- Multiple objects might handle a request
- Handler isn't known at compile time
- You want to decouple sender from receiver
- You need dynamic handler configuration
- You're building middleware or validation systems

❌ Don't use when:
- Only one handler can process
- Handler is known at compile time
- Performance is critical
- Request must be handled by specific handler

### Pattern Relationships

- **Similar to Decorator**: Both chain objects, but Chain stops after first handler, Decorator processes all
- **Similar to Command**: Both encapsulate requests, but Chain routes requests, Command executes actions
- **Similar to Strategy**: Both provide alternatives, but Chain selects automatically, Strategy is explicit

### Next Steps

After mastering Chain of Responsibility, consider:
- **Iterator Pattern** - For traversing collections
- **Mediator Pattern** - For centralized communication
- **Middleware Patterns** - Advanced chain implementations
- **Pipeline Patterns** - Processing data through multiple stages

---

## 🔗 Related Patterns

- **Decorator**: Adds behavior to objects, all decorators process
- **Command**: Encapsulates requests as objects
- **Strategy**: Defines family of algorithms
- **Mediator**: Centralizes communication between objects
- **Observer**: One-to-many dependency between objects

---

## 📖 References

- **Gang of Four**: "Design Patterns: Elements of Reusable Object-Oriented Software"
- **Refactoring Guru**: Chain of Responsibility Pattern
- **Source Making**: Chain of Responsibility Design Pattern


