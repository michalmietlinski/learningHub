# Observer Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Observer pattern definition and intent
- [ ] Learn when to use Observer vs other behavioral patterns
- [ ] Master the subject-observer relationship and notification mechanism
- [ ] Recognize real-world applications (event systems, reactive programming)
- [ ] Understand push vs pull models and event-driven architecture
- [ ] Practice implementing Observer in different scenarios
- [ ] Learn common pitfalls and best practices
- [ ] Explore modern variations (pub/sub, reactive streams)

---

## 🎯 Definition

**Observer Pattern** is a behavioral design pattern that defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.

**Intent (GoF):**
- Define a one-to-many dependency between objects
- When one object changes state, all dependents are notified automatically
- Decouple subjects from observers
- Also known as: **Publish-Subscribe Pattern**, **Event-Subscriber Pattern**, **Dependents Pattern**

**Key Principle:**
> "Notify dependents automatically" - The observer pattern establishes a loose coupling between a subject and its observers, allowing multiple observers to be notified of state changes without the subject needing to know their specific types.

---

## 🏗️ Structure

### UML Diagram Concept

```
Subject (Interface)
├── observers: Observer[]
├── attach(observer: Observer): void
├── detach(observer: Observer): void
└── notify(): void

ConcreteSubject implements Subject
├── state: StateType
├── getState(): StateType
├── setState(state: StateType): void
│   └── calls notify()
└── observers: Observer[]

Observer (Interface)
└── update(subject: Subject): void

ConcreteObserverA implements Observer
├── subject: Subject
├── observerState: StateType
└── update(subject: Subject): void
    └── observerState = subject.getState()

ConcreteObserverB implements Observer
├── subject: Subject
├── observerState: StateType
└── update(subject: Subject): void
    └── observerState = subject.getState()
```

### Participants

1. **Subject** - Knows its observers and provides interface for attaching/detaching observers
2. **ConcreteSubject** - Stores state of interest to observers and notifies observers when state changes
3. **Observer** - Defines an updating interface for objects that should be notified of changes
4. **ConcreteObserver** - Maintains reference to subject, stores state that should stay consistent with subject's state, implements Observer update interface

### Key Concepts

**Loose Coupling:**
- Subject doesn't know concrete observer types
- Observers can be added/removed at runtime
- Subject and observers can vary independently

**Notification Mechanism:**
- Subject notifies all registered observers
- Observers pull or push data from subject
- Can specify what changed (push model) or let observers query (pull model)

**One-to-Many Relationship:**
- One subject can have many observers
- Each observer can observe multiple subjects
- Dynamic subscription/unsubscription

**Event-Driven Architecture:**
- Foundation for event-driven systems
- Enables reactive programming
- Supports pub/sub messaging patterns

---

## 💡 When to Use

### Use Observer When:

✅ **A change to one object requires changing others, and you don't know how many objects need to be changed**
- Example: Model-View architecture, where model changes update multiple views

✅ **An object should notify other objects without making assumptions about who those objects are**
- Example: Event system where publishers don't know subscribers

✅ **You need to decouple subjects from observers**
- Example: UI components that react to data model changes

✅ **You want to support broadcast communication**
- Example: Logging system where multiple loggers listen to events

✅ **You need dynamic subscription/unsubscription**
- Example: Real-time dashboards where widgets can be added/removed

### Don't Use When:

❌ **The number of observers is very large** - Consider event bus or message queue instead
❌ **Observers need to know about each other** - Consider Mediator pattern
❌ **The update chain could cause circular dependencies** - Need careful design
❌ **Performance is critical and updates are frequent** - Consider batching or debouncing
❌ **The relationship is one-to-one** - Direct reference might be simpler

---

## 🔨 Implementation Examples

### Example 1: Basic Observer Pattern (Weather Station)

```typescript
// Observer Interface
interface Observer {
  update(temperature: number, humidity: number, pressure: number): void;
}

// Subject Interface
interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(): void;
}

// Concrete Subject
class WeatherStation implements Subject {
  private observers: Observer[] = [];
  private temperature: number = 0;
  private humidity: number = 0;
  private pressure: number = 0;

  attach(observer: Observer): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  detach(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(): void {
    for (const observer of this.observers) {
      observer.update(this.temperature, this.humidity, this.pressure);
    }
  }

  setMeasurements(temperature: number, humidity: number, pressure: number): void {
    this.temperature = temperature;
    this.humidity = humidity;
    this.pressure = pressure;
    this.notify();
  }

  getTemperature(): number {
    return this.temperature;
  }

  getHumidity(): number {
    return this.humidity;
  }

  getPressure(): number {
    return this.pressure;
  }
}

// Concrete Observers
class CurrentConditionsDisplay implements Observer {
  private temperature: number = 0;
  private humidity: number = 0;

  constructor(private weatherStation: WeatherStation) {
    this.weatherStation.attach(this);
  }

  update(temperature: number, humidity: number, pressure: number): void {
    this.temperature = temperature;
    this.humidity = humidity;
    this.display();
  }

  display(): void {
    console.log(
      `Current conditions: ${this.temperature}°F ` +
      `and ${this.humidity}% humidity`
    );
  }
}

class StatisticsDisplay implements Observer {
  private temperatures: number[] = [];
  private humidities: number[] = [];
  private pressures: number[] = [];

  constructor(private weatherStation: WeatherStation) {
    this.weatherStation.attach(this);
  }

  update(temperature: number, humidity: number, pressure: number): void {
    this.temperatures.push(temperature);
    this.humidities.push(humidity);
    this.pressures.push(pressure);
    this.display();
  }

  display(): void {
    const avgTemp = this.temperatures.reduce((a, b) => a + b, 0) / this.temperatures.length;
    const maxTemp = Math.max(...this.temperatures);
    const minTemp = Math.min(...this.temperatures);
    
    console.log(
      `Avg/Max/Min temperature: ${avgTemp.toFixed(1)}/${maxTemp}/${minTemp}°F`
    );
  }
}

class ForecastDisplay implements Observer {
  private lastPressure: number = 0;
  private currentPressure: number = 0;

  constructor(private weatherStation: WeatherStation) {
    this.weatherStation.attach(this);
    this.currentPressure = weatherStation.getPressure();
  }

  update(temperature: number, humidity: number, pressure: number): void {
    this.lastPressure = this.currentPressure;
    this.currentPressure = pressure;
    this.display();
  }

  display(): void {
    if (this.currentPressure > this.lastPressure) {
      console.log("Forecast: Improving weather on the way!");
    } else if (this.currentPressure === this.lastPressure) {
      console.log("Forecast: More of the same");
    } else {
      console.log("Forecast: Watch out for cooler, rainy weather");
    }
  }
}

// Usage
const weatherStation = new WeatherStation();

const currentDisplay = new CurrentConditionsDisplay(weatherStation);
const statisticsDisplay = new StatisticsDisplay(weatherStation);
const forecastDisplay = new ForecastDisplay(weatherStation);

// Simulate weather changes
weatherStation.setMeasurements(80, 65, 30.4);
weatherStation.setMeasurements(82, 70, 29.2);
weatherStation.setMeasurements(78, 90, 29.2);
```

### Example 2: Generic Observable with TypeScript Generics

```typescript
// Generic Observer Interface
interface Observer<T> {
  update(data: T): void;
}

// Generic Subject/Observable
class Observable<T> {
  private observers: Observer<T>[] = [];

  attach(observer: Observer<T>): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  detach(observer: Observer<T>): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(data: T): void {
    for (const observer of this.observers) {
      try {
        observer.update(data);
      } catch (error) {
        console.error('Error notifying observer:', error);
      }
    }
  }

  getObserverCount(): number {
    return this.observers.length;
  }
}

// Usage with different data types
class NewsPublisher extends Observable<string> {
  publishNews(headline: string): void {
    console.log(`Publishing: ${headline}`);
    this.notify(headline);
  }
}

class StockPriceTracker extends Observable<{ symbol: string; price: number }> {
  updatePrice(symbol: string, price: number): void {
    console.log(`Stock ${symbol}: $${price}`);
    this.notify({ symbol, price });
  }
}

// Observers
class NewsSubscriber implements Observer<string> {
  constructor(private name: string) {}

  update(headline: string): void {
    console.log(`${this.name} received: ${headline}`);
  }
}

class StockAlert implements Observer<{ symbol: string; price: number }> {
  constructor(
    private symbol: string,
    private threshold: number
  ) {}

  update(data: { symbol: string; price: number }): void {
    if (data.symbol === this.symbol && data.price > this.threshold) {
      console.log(`ALERT: ${data.symbol} is now $${data.price} (above $${this.threshold})`);
    }
  }
}

// Usage
const newsPublisher = new NewsPublisher();
newsPublisher.attach(new NewsSubscriber("Alice"));
newsPublisher.attach(new NewsSubscriber("Bob"));
newsPublisher.publishNews("Breaking: New design pattern discovered!");

const stockTracker = new StockPriceTracker();
stockTracker.attach(new StockAlert("AAPL", 150));
stockTracker.updatePrice("AAPL", 145);
stockTracker.updatePrice("AAPL", 155);
```

### Example 3: Event Emitter Pattern (Node.js Style)

```typescript
type EventCallback = (...args: any[]) => void;

class EventEmitter {
  private events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  once(event: string, callback: EventCallback): void {
    const onceWrapper = (...args: any[]) => {
      callback(...args);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }

  emit(event: string, ...args: any[]): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      // Create a copy to avoid issues if callbacks modify the array
      const callbacksCopy = [...callbacks];
      for (const callback of callbacksCopy) {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      }
    }
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  listenerCount(event: string): number {
    return this.events.get(event)?.length || 0;
  }
}

// Usage
class UserService extends EventEmitter {
  private users: Map<string, { id: string; name: string; email: string }> = new Map();

  createUser(name: string, email: string): string {
    const id = `user_${Date.now()}`;
    const user = { id, name, email };
    this.users.set(id, user);
    
    // Emit events
    this.emit('user:created', user);
    this.emit('user:changed', { type: 'created', user });
    
    return id;
  }

  updateUser(id: string, updates: Partial<{ name: string; email: string }>): void {
    const user = this.users.get(id);
    if (user) {
      Object.assign(user, updates);
      this.emit('user:updated', user);
      this.emit('user:changed', { type: 'updated', user });
    }
  }

  deleteUser(id: string): void {
    const user = this.users.get(id);
    if (user) {
      this.users.delete(id);
      this.emit('user:deleted', id);
      this.emit('user:changed', { type: 'deleted', userId: id });
    }
  }
}

// Observers/Listeners
const userService = new UserService();

// Log all user changes
userService.on('user:changed', (data) => {
  console.log(`[Logger] User ${data.type}:`, data.user || data.userId);
});

// Send welcome email on creation
userService.on('user:created', (user) => {
  console.log(`[Email Service] Sending welcome email to ${user.email}`);
});

// Update cache on any change
userService.on('user:changed', (data) => {
  console.log(`[Cache] Invalidating cache for user change: ${data.type}`);
});

// One-time listener for first user
userService.once('user:created', (user) => {
  console.log(`[First User] Welcome our first user: ${user.name}!`);
});

// Usage
userService.createUser("Alice", "alice@example.com");
userService.createUser("Bob", "bob@example.com");
userService.updateUser("user_1", { name: "Alice Smith" });
```

### Example 4: Pull Model Observer (Observers Query State)

```typescript
// Subject with pull model
interface PullSubject {
  attach(observer: PullObserver): void;
  detach(observer: PullObserver): void;
  notify(): void;
  getState(): any;
}

interface PullObserver {
  update(subject: PullSubject): void;
}

class DataStore implements PullSubject {
  private observers: PullObserver[] = [];
  private data: Record<string, any> = {};

  attach(observer: PullObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  detach(observer: PullObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(): void {
    for (const observer of this.observers) {
      observer.update(this);
    }
  }

  getState(): Record<string, any> {
    return { ...this.data }; // Return copy to prevent external mutation
  }

  getValue(key: string): any {
    return this.data[key];
  }

  setValue(key: string, value: any): void {
    this.data[key] = value;
    this.notify();
  }

  setValues(values: Record<string, any>): void {
    Object.assign(this.data, values);
    this.notify();
  }
}

// Observers pull only what they need
class UserInterface implements PullObserver {
  update(subject: PullSubject): void {
    const state = subject.getState();
    // Pull only what UI needs
    if (state.username !== undefined) {
      this.updateUsernameDisplay(state.username);
    }
    if (state.theme !== undefined) {
      this.updateTheme(state.theme);
    }
  }

  private updateUsernameDisplay(username: string): void {
    console.log(`[UI] Username updated to: ${username}`);
  }

  private updateTheme(theme: string): void {
    console.log(`[UI] Theme changed to: ${theme}`);
  }
}

class AnalyticsTracker implements PullObserver {
  update(subject: PullSubject): void {
    const state = subject.getState();
    // Pull only analytics-relevant data
    if (state.userId !== undefined) {
      this.trackUserActivity(state.userId, state);
    }
  }

  private trackUserActivity(userId: string, data: any): void {
    console.log(`[Analytics] Tracking activity for user ${userId}`);
  }
}

// Usage
const dataStore = new DataStore();
const ui = new UserInterface();
const analytics = new AnalyticsTracker();

dataStore.attach(ui);
dataStore.attach(analytics);

dataStore.setValue('username', 'alice');
dataStore.setValue('theme', 'dark');
dataStore.setValues({ userId: '123', username: 'bob', theme: 'light' });
```

### Example 5: Observer with Priority and Filtering

```typescript
interface PriorityObserver {
  update(data: any): void;
  getPriority(): number;
  shouldReceive(event: string): boolean;
}

class PriorityObservable {
  private observers: PriorityObserver[] = [];

  attach(observer: PriorityObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
      // Sort by priority (higher priority first)
      this.observers.sort((a, b) => b.getPriority() - a.getPriority());
    }
  }

  detach(observer: PriorityObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(event: string, data: any): void {
    for (const observer of this.observers) {
      if (observer.shouldReceive(event)) {
        try {
          observer.update(data);
        } catch (error) {
          console.error('Error in priority observer:', error);
        }
      }
    }
  }
}

// Observers with priorities
class SecurityObserver implements PriorityObserver {
  getPriority(): number {
    return 100; // Highest priority
  }

  shouldReceive(event: string): boolean {
    return event.startsWith('security:') || event === 'user:login';
  }

  update(data: any): void {
    console.log(`[Security] High priority: ${JSON.stringify(data)}`);
  }
}

class LoggingObserver implements PriorityObserver {
  getPriority(): number {
    return 50; // Medium priority
  }

  shouldReceive(event: string): boolean {
    return true; // Log everything
  }

  update(data: any): void {
    console.log(`[Log] ${JSON.stringify(data)}`);
  }
}

class AnalyticsObserver implements PriorityObserver {
  getPriority(): number {
    return 10; // Lower priority
  }

  shouldReceive(event: string): boolean {
    return event.startsWith('analytics:') || event === 'user:action';
  }

  update(data: any): void {
    console.log(`[Analytics] ${JSON.stringify(data)}`);
  }
}

// Usage
const observable = new PriorityObservable();

observable.attach(new LoggingObserver());
observable.attach(new SecurityObserver());
observable.attach(new AnalyticsObserver());

observable.notify('security:breach', { type: 'unauthorized_access' });
observable.notify('user:action', { action: 'click', button: 'submit' });
observable.notify('user:login', { userId: '123', timestamp: Date.now() });
```

### Example 6: Observer with Async Notifications

```typescript
interface AsyncObserver {
  update(data: any): Promise<void>;
}

class AsyncObservable {
  private observers: AsyncObserver[] = [];

  attach(observer: AsyncObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  detach(observer: AsyncObserver): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  async notify(data: any): Promise<void> {
    // Notify all observers in parallel
    const promises = this.observers.map(observer => 
      observer.update(data).catch(error => {
        console.error('Error in async observer:', error);
        return Promise.resolve();
      })
    );
    
    await Promise.all(promises);
  }

  async notifySequential(data: any): Promise<void> {
    // Notify observers sequentially
    for (const observer of this.observers) {
      try {
        await observer.update(data);
      } catch (error) {
        console.error('Error in async observer:', error);
      }
    }
  }
}

// Async observers
class EmailService implements AsyncObserver {
  async update(data: any): Promise<void> {
    if (data.type === 'user:created') {
      console.log(`[Email] Sending welcome email to ${data.user.email}...`);
      // Simulate async email sending
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log(`[Email] Welcome email sent to ${data.user.email}`);
    }
  }
}

class DatabaseBackup implements AsyncObserver {
  async update(data: any): Promise<void> {
    console.log(`[Backup] Backing up data...`);
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log(`[Backup] Backup completed`);
  }
}

class NotificationService implements AsyncObserver {
  async update(data: any): Promise<void> {
    if (data.type === 'user:created') {
      console.log(`[Notification] Sending push notification...`);
      await new Promise(resolve => setTimeout(resolve, 50));
      console.log(`[Notification] Push notification sent`);
    }
  }
}

// Usage
const asyncObservable = new AsyncObservable();
asyncObservable.attach(new EmailService());
asyncObservable.attach(new DatabaseBackup());
asyncObservable.attach(new NotificationService());

(async () => {
  console.log('Notifying observers in parallel...');
  await asyncObservable.notify({
    type: 'user:created',
    user: { id: '123', name: 'Alice', email: 'alice@example.com' }
  });
  console.log('All notifications completed');
})();
```

---

## 🌍 Real-World Applications

### 1. Model-View-Controller (MVC) Architecture

```typescript
// Model (Subject)
class UserModel {
  private observers: View[] = [];
  private name: string = '';
  private email: string = '';

  attach(view: View): void {
    this.observers.push(view);
  }

  notify(): void {
    for (const view of this.observers) {
      view.update(this);
    }
  }

  setName(name: string): void {
    this.name = name;
    this.notify();
  }

  setEmail(email: string): void {
    this.email = email;
    this.notify();
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }
}

// View (Observer)
interface View {
  update(model: UserModel): void;
  render(): void;
}

class UserProfileView implements View {
  constructor(private model: UserModel) {
    this.model.attach(this);
  }

  update(model: UserModel): void {
    this.render();
  }

  render(): void {
    console.log(`Profile: ${this.model.getName()} (${this.model.getEmail()})`);
  }
}

class UserListView implements View {
  private users: UserModel[] = [];

  addUser(user: UserModel): void {
    this.users.push(user);
    user.attach(this);
  }

  update(model: UserModel): void {
    this.render();
  }

  render(): void {
    console.log('User List:');
    this.users.forEach(user => {
      console.log(`  - ${user.getName()}`);
    });
  }
}
```

### 2. React State Management (Conceptual)

```typescript
// Simplified React-like state management
class ComponentState<T> {
  private state: T;
  private listeners: Set<(state: T) => void> = new Set();

  constructor(initialState: T) {
    this.state = initialState;
  }

  subscribe(listener: (state: T) => void): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  setState(updater: T | ((prev: T) => T)): void {
    if (typeof updater === 'function') {
      this.state = (updater as (prev: T) => T)(this.state);
    } else {
      this.state = updater;
    }
    this.notify();
  }

  getState(): T {
    return this.state;
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

// Usage
const counterState = new ComponentState({ count: 0 });

const unsubscribe1 = counterState.subscribe((state) => {
  console.log(`Component 1: Count is ${state.count}`);
});

const unsubscribe2 = counterState.subscribe((state) => {
  console.log(`Component 2: Count is ${state.count}`);
});

counterState.setState({ count: 1 });
counterState.setState(prev => ({ count: prev.count + 1 }));
unsubscribe1();
counterState.setState({ count: 5 });
```

### 3. Node.js EventEmitter (Real Implementation)

```typescript
// Simplified version of Node.js EventEmitter
import { EventEmitter } from 'events';

class FileWatcher extends EventEmitter {
  private filePath: string;
  private intervalId?: NodeJS.Timeout;

  constructor(filePath: string) {
    super();
    this.filePath = filePath;
  }

  start(): void {
    let lastModified: Date | null = null;

    this.intervalId = setInterval(() => {
      // In real implementation, check file modification time
      const currentModified = new Date(); // Simulated
      
      if (lastModified && currentModified > lastModified) {
        this.emit('change', {
          file: this.filePath,
          timestamp: currentModified
        });
      }
      
      lastModified = currentModified;
    }, 1000);

    this.emit('watching', { file: this.filePath });
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.emit('stopped', { file: this.filePath });
    }
  }
}

// Usage
const watcher = new FileWatcher('/path/to/file.txt');

watcher.on('watching', (data) => {
  console.log(`Started watching: ${data.file}`);
});

watcher.on('change', (data) => {
  console.log(`File changed: ${data.file} at ${data.timestamp}`);
});

watcher.on('stopped', (data) => {
  console.log(`Stopped watching: ${data.file}`);
});

watcher.start();

// Stop after 5 seconds
setTimeout(() => watcher.stop(), 5000);
```

### 4. RxJS Observables (Conceptual)

```typescript
// Simplified Observable implementation
class SimpleObservable<T> {
  private subscribers: Array<(value: T) => void> = [];

  subscribe(callback: (value: T) => void): { unsubscribe: () => void } {
    this.subscribers.push(callback);
    return {
      unsubscribe: () => {
        const index = this.subscribers.indexOf(callback);
        if (index > -1) {
          this.subscribers.splice(index, 1);
        }
      }
    };
  }

  protected next(value: T): void {
    for (const subscriber of this.subscribers) {
      subscriber(value);
    }
  }
}

class Subject<T> extends SimpleObservable<T> {
  next(value: T): void {
    super.next(value);
  }
}

// Usage
const subject = new Subject<number>();

const subscription1 = subject.subscribe(value => {
  console.log(`Subscriber 1: ${value}`);
});

const subscription2 = subject.subscribe(value => {
  console.log(`Subscriber 2: ${value * 2}`);
});

subject.next(1);
subject.next(2);

subscription1.unsubscribe();
subject.next(3);
```

### 5. Vue.js Reactive System (Conceptual)

```typescript
// Simplified Vue reactivity
class ReactiveObject {
  private observers: Map<string, Set<() => void>> = new Map();
  private data: Record<string, any>;

  constructor(data: Record<string, any>) {
    this.data = new Proxy(data, {
      set: (target, property, value) => {
        target[property as string] = value;
        this.notify(property as string);
        return true;
      },
      get: (target, property) => {
        // In real Vue, this would track dependencies
        return target[property as string];
      }
    });
  }

  watch(property: string, callback: () => void): void {
    if (!this.observers.has(property)) {
      this.observers.set(property, new Set());
    }
    this.observers.get(property)!.add(callback);
  }

  private notify(property: string): void {
    const callbacks = this.observers.get(property);
    if (callbacks) {
      for (const callback of callbacks) {
        callback();
      }
    }
  }

  getData(): Record<string, any> {
    return this.data;
  }
}

// Usage
const state = new ReactiveObject({ count: 0, name: 'Vue' });

state.watch('count', () => {
  console.log(`Count changed to: ${state.getData().count}`);
});

state.watch('name', () => {
  console.log(`Name changed to: ${state.getData().name}`);
});

state.getData().count = 1;
state.getData().name = 'Vue 3';
```

---

## 🔄 Observer vs Other Patterns

### Observer vs Mediator

**Observer:**
- One-to-many relationship
- Subject notifies multiple observers
- Observers don't know about each other
- Loose coupling between subject and observers

**Mediator:**
- Many-to-many relationship through mediator
- Objects communicate through mediator
- Mediator knows about all participants
- Reduces direct dependencies between objects

**When to Choose:**
- Use **Observer** when one object needs to notify many others
- Use **Mediator** when many objects need to communicate with each other

### Observer vs Publish-Subscribe (Pub/Sub)

**Observer:**
- Direct relationship between subject and observers
- Subject maintains list of observers
- Synchronous notification typically
- Tight coupling to subject interface

**Pub/Sub:**
- Decoupled through message broker/channel
- Publishers don't know subscribers
- Can be asynchronous
- More flexible, supports filtering, routing

**When to Choose:**
- Use **Observer** for simple, direct notifications
- Use **Pub/Sub** for distributed systems, event buses, message queues

### Observer vs Chain of Responsibility

**Observer:**
- All observers are notified
- No guarantee of order (unless priority added)
- Observers are independent
- Subject doesn't control observer execution

**Chain of Responsibility:**
- Handlers process request in sequence
- One handler processes request
- Can stop propagation
- Request flows through chain

**When to Choose:**
- Use **Observer** when all dependents should be notified
- Use **Chain** when request should be handled by one handler in sequence

### Observer vs Strategy

**Observer:**
- Behavioral pattern for notifications
- Multiple observers react to changes
- Runtime subscription/unsubscription
- Event-driven architecture

**Strategy:**
- Behavioral pattern for algorithms
- One strategy selected at runtime
- Encapsulates algorithm variations
- Algorithm selection pattern

**When to Choose:**
- Use **Observer** for event notifications
- Use **Strategy** for algorithm selection

---

## ⚠️ Common Pitfalls

### 1. Memory Leaks from Not Unsubscribing

```typescript
// ❌ BAD: Observer not detached, causing memory leak
class BadExample {
  private subject: Subject;

  constructor(subject: Subject) {
    this.subject = subject;
    this.subject.attach(this); // Attached but never detached
  }
}

// ✅ GOOD: Proper cleanup
class GoodExample {
  private subject: Subject;

  constructor(subject: Subject) {
    this.subject = subject;
    this.subject.attach(this);
  }

  destroy(): void {
    this.subject.detach(this); // Clean up
  }
}

// ✅ BETTER: Using WeakMap for automatic cleanup
class BetterExample {
  private static subjects = new WeakMap<BetterExample, Subject>();

  constructor(subject: Subject) {
    BetterExample.subjects.set(this, subject);
    subject.attach(this);
  }

  // When object is garbage collected, WeakMap entry is removed
  // But still need explicit detach for immediate cleanup
  destroy(): void {
    const subject = BetterExample.subjects.get(this);
    if (subject) {
      subject.detach(this);
      BetterExample.subjects.delete(this);
    }
  }
}
```

### 2. Observer Order Dependencies

```typescript
// ❌ BAD: Observers depend on execution order
class OrderDependentExample {
  private value: number = 0;

  update(data: number): void {
    // Assumes another observer ran first
    this.value = data * 2; // Might use stale data
  }
}

// ✅ GOOD: Observers are independent
class IndependentExample {
  private value: number = 0;

  update(subject: Subject): void {
    // Pull fresh data from subject
    this.value = subject.getState() * 2;
  }
}

// ✅ BETTER: Use priority if order matters
class PriorityObserver implements Observer {
  getPriority(): number {
    return 100; // Higher priority observers run first
  }

  update(data: any): void {
    // Process with priority
  }
}
```

### 3. Circular Updates

```typescript
// ❌ BAD: Observer updates subject, causing infinite loop
class CircularExample implements Observer {
  update(data: number): void {
    // This causes subject to notify again!
    this.subject.setValue(data + 1);
  }
}

// ✅ GOOD: Prevent circular updates
class SafeExample implements Observer {
  private updating: boolean = false;

  update(data: number): void {
    if (this.updating) {
      return; // Prevent re-entry
    }
    this.updating = true;
    try {
      // Safe update logic
      this.process(data);
    } finally {
      this.updating = false;
    }
  }
}

// ✅ BETTER: Subject tracks if notification is in progress
class SafeSubject {
  private notifying: boolean = false;

  notify(): void {
    if (this.notifying) {
      return; // Prevent recursive notifications
    }
    this.notifying = true;
    try {
      for (const observer of this.observers) {
        observer.update(this);
      }
    } finally {
      this.notifying = false;
    }
  }
}
```

### 4. Exception Handling

```typescript
// ❌ BAD: One observer's error stops all notifications
class BadSubject {
  notify(): void {
    for (const observer of this.observers) {
      observer.update(this); // If this throws, others don't get notified
    }
  }
}

// ✅ GOOD: Isolate errors
class GoodSubject {
  notify(): void {
    for (const observer of this.observers) {
      try {
        observer.update(this);
      } catch (error) {
        console.error('Error in observer:', error);
        // Continue with other observers
      }
    }
  }
}

// ✅ BETTER: Error handling with callbacks
class BetterSubject {
  private errorHandler?: (error: Error, observer: Observer) => void;

  setErrorHandler(handler: (error: Error, observer: Observer) => void): void {
    this.errorHandler = handler;
  }

  notify(): void {
    for (const observer of this.observers) {
      try {
        observer.update(this);
      } catch (error) {
        if (this.errorHandler) {
          this.errorHandler(error as Error, observer);
        } else {
          console.error('Error in observer:', error);
        }
      }
    }
  }
}
```

### 5. Performance Issues with Many Observers

```typescript
// ❌ BAD: Notifying all observers even when not needed
class InefficientSubject {
  notify(): void {
    // Always notifies all observers
    for (const observer of this.observers) {
      observer.update(this);
    }
  }
}

// ✅ GOOD: Filter observers or batch updates
class EfficientSubject {
  private observers: Map<string, Observer[]> = new Map();

  notify(event: string, data: any): void {
    const relevantObservers = this.observers.get(event) || [];
    for (const observer of relevantObservers) {
      observer.update(data);
    }
  }

  // Or use debouncing for frequent updates
  private debounceTimer?: NodeJS.Timeout;

  notifyDebounced(data: any): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.notify(data);
    }, 100); // Wait 100ms before notifying
  }
}
```

---

## ✅ Best Practices

### 1. Use Weak References When Appropriate

```typescript
// Use WeakSet/WeakMap to avoid preventing garbage collection
class SubjectWithWeakRefs {
  private observers = new WeakSet<Observer>();

  attach(observer: Observer): void {
    this.observers.add(observer);
  }

  // Note: WeakSet doesn't support iteration, so this is conceptual
  // In practice, you might need a hybrid approach
}
```

### 2. Implement Unsubscribe Pattern

```typescript
interface Subscription {
  unsubscribe(): void;
}

class Observable<T> {
  private observers: Set<(value: T) => void> = new Set();

  subscribe(observer: (value: T) => void): Subscription {
    this.observers.add(observer);
    return {
      unsubscribe: () => {
        this.observers.delete(observer);
      }
    };
  }

  notify(value: T): void {
    for (const observer of this.observers) {
      observer(value);
    }
  }
}

// Usage
const observable = new Observable<number>();
const subscription = observable.subscribe(value => {
  console.log(value);
});

observable.notify(1);
subscription.unsubscribe();
observable.notify(2); // Won't log
```

### 3. Support Event Filtering

```typescript
interface FilteredObserver {
  update(event: string, data: any): void;
  getEventFilter(): string[]; // Events this observer cares about
}

class FilteredSubject {
  private observers: FilteredObserver[] = [];

  attach(observer: FilteredObserver): void {
    this.observers.push(observer);
  }

  notify(event: string, data: any): void {
    for (const observer of this.observers) {
      const filter = observer.getEventFilter();
      if (filter.includes(event) || filter.includes('*')) {
        observer.update(event, data);
      }
    }
  }
}
```

### 4. Provide State Snapshot

```typescript
class StatefulSubject {
  private state: any;
  private observers: Observer[] = [];

  getState(): any {
    return { ...this.state }; // Return immutable copy
  }

  setState(newState: any): void {
    const oldState = this.state;
    this.state = { ...newState }; // Store immutable copy
    this.notify(oldState, this.state);
  }

  private notify(oldState: any, newState: any): void {
    for (const observer of this.observers) {
      observer.update(oldState, newState);
    }
  }
}
```

### 5. Support Async Observers

```typescript
interface AsyncObserver {
  update(data: any): Promise<void>;
}

class AsyncSubject {
  private observers: AsyncObserver[] = [];

  async notify(data: any): Promise<void> {
    const promises = this.observers.map(observer =>
      observer.update(data).catch(error => {
        console.error('Observer error:', error);
        return Promise.resolve();
      })
    );
    await Promise.allSettled(promises);
  }
}
```

### 6. Implement Observer Priority

```typescript
interface PrioritizedObserver extends Observer {
  getPriority(): number;
}

class PrioritizedSubject {
  private observers: PrioritizedObserver[] = [];

  attach(observer: PrioritizedObserver): void {
    this.observers.push(observer);
    this.observers.sort((a, b) => b.getPriority() - a.getPriority());
  }

  notify(): void {
    for (const observer of this.observers) {
      observer.update(this);
    }
  }
}
```

---

## 🎓 Summary

### Key Takeaways

1. **Purpose**: Observer establishes one-to-many dependency, automatically notifying dependents of state changes
2. **Loose Coupling**: Subject doesn't know concrete observer types, enabling flexible relationships
3. **Use When**: One object changes and many need to be notified, decoupling is needed
4. **Benefits**: Loose coupling, dynamic relationships, broadcast communication
5. **Watch Out**: Memory leaks from not unsubscribing, circular updates, performance with many observers

### When to Choose Observer

Choose Observer when:
- ✅ A change to one object requires changing others
- ✅ An object should notify others without knowing who they are
- ✅ You need to decouple subjects from observers
- ✅ You want dynamic subscription/unsubscription
- ✅ You need broadcast communication

Avoid Observer when:
- ❌ The number of observers is very large (use pub/sub instead)
- ❌ Observers need to know about each other (use Mediator)
- ❌ Update chain could cause circular dependencies
- ❌ Performance is critical and updates are frequent
- ❌ The relationship is one-to-one (direct reference might be simpler)

### Pattern Variations

1. **Push Model**: Subject sends detailed data to observers
2. **Pull Model**: Observers query subject for needed data
3. **Event Emitter**: Generic event-based notification system
4. **Pub/Sub**: Decoupled messaging through channels
5. **Reactive Streams**: Asynchronous stream processing

### Next Steps

- Practice implementing Observer in your projects
- Identify subjects and observers in existing code
- Explore real-world examples (React, Vue, Node.js EventEmitter)
- Compare Observer with Mediator and Pub/Sub patterns
- Experiment with async observers and priority systems
- Study reactive programming libraries (RxJS, MobX)

---

## 📚 Additional Resources

### Design Patterns References

- **Gang of Four (GoF)**: "Design Patterns: Elements of Reusable Object-Oriented Software"
- **Head First Design Patterns**: Chapter on Observer Pattern

### Real-World Examples

- **React**: State updates and component re-rendering
- **Vue.js**: Reactive data system
- **Node.js**: EventEmitter class
- **RxJS**: Observable streams
- **Redux**: State management with subscribers
- **MVC Architecture**: Model-View relationship
- **GUI Frameworks**: Event handling systems
- **Game Engines**: Event systems for game objects

### Modern Implementations

- **RxJS**: Reactive Extensions for JavaScript
- **MobX**: Observable state management
- **Zustand**: Lightweight state management with subscriptions
- **EventEmitter3**: High-performance EventEmitter
- **mitt**: Tiny event emitter

### Practice Exercises

1. **Build a News Publisher System**
   - Create news publisher (subject)
   - Implement multiple subscribers (email, SMS, push)
   - Add filtering by category
   - Support priority notifications

2. **Create a Stock Price Monitor**
   - Track multiple stocks
   - Notify when prices cross thresholds
   - Support different alert types
   - Implement historical tracking

3. **Implement a Form Validation System**
   - Form fields as subjects
   - Validators as observers
   - Real-time validation feedback
   - Support custom validation rules

4. **Build a Chat Application Backend**
   - Message publisher
   - Multiple chat room subscribers
   - User presence observers
   - Notification system

5. **Create a File System Watcher**
   - Watch directory changes
   - Notify on file creation/modification/deletion
   - Support filtering by file type
   - Implement debouncing for rapid changes

---

**Happy Learning! 🚀**

