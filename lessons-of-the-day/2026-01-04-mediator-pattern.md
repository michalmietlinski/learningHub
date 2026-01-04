# Mediator Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Mediator pattern definition and intent
- [ ] Learn when to use Mediator vs Observer and other behavioral patterns
- [ ] Master the mediator-colleague relationship and centralized communication
- [ ] Recognize real-world applications (UI frameworks, chat systems, form validation, game systems)
- [ ] Understand Mediator vs Observer pattern differences
- [ ] Practice implementing Mediator in different scenarios
- [ ] Learn common pitfalls and best practices
- [ ] Explore modern variations (event bus, message broker, reactive mediators)
- [ ] Understand mediator complexity and when to avoid it

---

## 🎯 Definition

**Mediator Pattern** is a behavioral design pattern that defines an object that encapsulates how a set of objects interact. Mediator promotes loose coupling by keeping objects from referring to each other explicitly, and it lets you vary their interaction independently.

**Intent (GoF):**
- Define an object that encapsulates how a set of objects interact
- Promote loose coupling by keeping objects from referring to each other explicitly
- Allow you to vary their interaction independently
- Also known as: **Intermediary Pattern**, **Controller Pattern**

**Key Principle:**
> "Centralize communication" - The mediator pattern centralizes complex communications and control logic between multiple objects, reducing coupling between them. Instead of objects communicating directly with each other, they communicate through a mediator, making the system easier to understand and maintain.

---

## 🏗️ Structure

### UML Diagram Concept

```
Mediator (Interface)
└── notify(sender: Colleague, event: string): void

ConcreteMediator implements Mediator
├── colleagues: Colleague[]
├── register(colleague: Colleague): void
└── notify(sender: Colleague, event: string): void
    └── switch (event)
        ├── case "event1"
        │   └── colleague1.handle()
        ├── case "event2"
        │   └── colleague2.handle()
        └── case "event3"
            └── colleague3.handle()

Colleague (Abstract)
├── mediator: Mediator
├── setMediator(mediator: Mediator): void
└── notify(event: string): void
    └── mediator.notify(this, event)

ConcreteColleagueA extends Colleague
└── doSomething(): void
    └── this.notify("eventA")

ConcreteColleagueB extends Colleague
└── doSomething(): void
    └── this.notify("eventB")

ConcreteColleagueC extends Colleague
└── doSomething(): void
    └── this.notify("eventC")
```

### Participants

1. **Mediator** - Defines an interface for communicating with Colleague objects
2. **ConcreteMediator** - Implements cooperative behavior by coordinating Colleague objects, knows and maintains its colleagues
3. **Colleague** - Defines an interface for communicating with a Mediator, each Colleague class knows its Mediator object
4. **ConcreteColleague** - Implements the Colleague interface, communicates with its mediator whenever it would have otherwise communicated with another colleague directly

### Key Concepts

**Centralized Communication:**
- All communication goes through mediator
- Colleagues don't know about each other
- Mediator knows about all colleagues
- Communication logic is centralized

**Loose Coupling:**
- Colleagues are decoupled from each other
- Colleagues only depend on mediator interface
- Easy to add/remove colleagues
- Easy to change communication logic

**Single Responsibility:**
- Mediator handles all communication
- Colleagues focus on their own behavior
- Clear separation of concerns
- Easier to test and maintain

**Complexity Management:**
- Reduces number of connections (N*N to N)
- Simplifies object interactions
- Makes system easier to understand
- Can become complex if mediator grows too large

**Reusability:**
- Colleagues can be reused in different contexts
- Different mediators can be used with same colleagues
- Easy to swap mediator implementations
- Enables plugin architectures

---

## 💡 When to Use

### Use Mediator When:

✅ **A set of objects communicate in well-defined but complex ways**
- Example: UI components that need to coordinate (form validation, dialog interactions)
- Example: Chat system where users send messages to each other
- Example: Game systems where entities interact (player, enemies, items)

✅ **You want to avoid tight coupling between objects**
- Example: Components that would otherwise have many direct dependencies
- Example: Services that need to coordinate but shouldn't know about each other
- Example: Modules that need to communicate without circular dependencies

✅ **You want to reuse an object in a different context**
- Example: UI components that work in different forms
- Example: Business logic components in different workflows
- Example: Game entities in different game modes

✅ **You want to centralize control logic**
- Example: Form validation where fields depend on each other
- Example: Workflow orchestration
- Example: Event coordination in applications

✅ **The communication logic is complex and would benefit from centralization**
- Example: Multi-step processes with dependencies
- Example: State machines with multiple participants
- Example: Complex business rules involving multiple entities

### Don't Use When:

❌ **Objects communicate in simple, well-understood ways** - Direct communication is clearer
❌ **Mediator becomes too complex** - Consider breaking into multiple mediators
❌ **Performance is critical** - Mediator adds indirection overhead
❌ **Objects need direct references to each other** - Mediator might be overkill
❌ **Communication patterns are stable and unlikely to change** - Direct coupling might be acceptable

---

## 🔨 Implementation Examples

### Example 1: Basic Mediator Pattern (Chat System)

```typescript
// Mediator Interface
interface ChatMediator {
  sendMessage(message: string, sender: User): void;
  addUser(user: User): void;
}

// Colleague Interface
abstract class User {
  protected mediator: ChatMediator;
  protected name: string;

  constructor(name: string, mediator: ChatMediator) {
    this.name = name;
    this.mediator = mediator;
    this.mediator.addUser(this);
  }

  abstract send(message: string): void;
  abstract receive(message: string, sender: string): void;

  getName(): string {
    return this.name;
  }
}

// Concrete Mediator
class ChatRoom implements ChatMediator {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
    console.log(`${user.getName()} joined the chat room`);
  }

  sendMessage(message: string, sender: User): void {
    console.log(`\n${sender.getName()} sends: "${message}"`);
    this.users.forEach(user => {
      if (user !== sender) {
        user.receive(message, sender.getName());
      }
    });
  }
}

// Concrete Colleagues
class ChatUser extends User {
  send(message: string): void {
    console.log(`${this.name} is sending message...`);
    this.mediator.sendMessage(message, this);
  }

  receive(message: string, sender: string): void {
    console.log(`${this.name} received from ${sender}: "${message}"`);
  }
}

// Usage
const chatRoom = new ChatRoom();

const alice = new ChatUser('Alice', chatRoom);
const bob = new ChatUser('Bob', chatRoom);
const charlie = new ChatUser('Charlie', chatRoom);

alice.send('Hello everyone!');
bob.send('Hi Alice!');
charlie.send('Hey guys!');
```

### Example 2: Form Validation Mediator

```typescript
// Mediator Interface
interface FormMediator {
  notify(component: FormComponent, event: string, data?: any): void;
  register(component: FormComponent): void;
}

// Colleague Interface
abstract class FormComponent {
  protected mediator: FormMediator;
  protected value: any;
  protected isValid: boolean = true;
  protected errorMessage: string = '';

  constructor(mediator: FormMediator) {
    this.mediator = mediator;
    this.mediator.register(this);
  }

  abstract validate(): boolean;
  abstract handleChange(value: any): void;

  getValue(): any {
    return this.value;
  }

  getIsValid(): boolean {
    return this.isValid;
  }

  getErrorMessage(): string {
    return this.errorMessage;
  }

  setValue(value: any): void {
    this.value = value;
    this.handleChange(value);
  }

  protected notify(event: string, data?: any): void {
    this.mediator.notify(this, event, data);
  }
}

// Concrete Mediator
class RegistrationFormMediator implements FormMediator {
  private components: Map<string, FormComponent> = new Map();

  register(component: FormComponent): void {
    this.components.set(component.constructor.name, component);
  }

  notify(component: FormComponent, event: string, data?: any): void {
    const componentName = component.constructor.name;

    switch (event) {
      case 'change':
        this.handleChange(componentName, component);
        break;
      case 'validate':
        this.handleValidation(componentName, component);
        break;
    }
  }

  private handleChange(componentName: string, component: FormComponent): void {
    // Email change affects username availability
    if (componentName === 'EmailInput') {
      const usernameInput = this.components.get('UsernameInput');
      if (usernameInput) {
        const email = component.getValue();
        const suggestedUsername = email.split('@')[0];
        // In real implementation, check username availability
        console.log(`Suggested username: ${suggestedUsername}`);
      }
    }

    // Password change requires confirmation re-validation
    if (componentName === 'PasswordInput') {
      const confirmPassword = this.components.get('ConfirmPasswordInput');
      if (confirmPassword) {
        confirmPassword.validate();
      }
    }

    // Username change might affect email suggestions
    if (componentName === 'UsernameInput') {
      const emailInput = this.components.get('EmailInput');
      if (emailInput && !emailInput.getValue()) {
        const username = component.getValue();
        const suggestedEmail = `${username}@example.com`;
        console.log(`Suggested email: ${suggestedEmail}`);
      }
    }
  }

  private handleValidation(componentName: string, component: FormComponent): void {
    // Cross-field validation logic
    if (componentName === 'ConfirmPasswordInput') {
      const passwordInput = this.components.get('PasswordInput');
      if (passwordInput) {
        const password = passwordInput.getValue();
        const confirmPassword = component.getValue();
        
        if (password !== confirmPassword) {
          (component as ConfirmPasswordInput).setError('Passwords do not match');
        } else {
          (component as ConfirmPasswordInput).clearError();
        }
      }
    }
  }

  validateAll(): boolean {
    let isValid = true;
    this.components.forEach(component => {
      if (!component.validate()) {
        isValid = false;
      }
    });
    return isValid;
  }

  getFormData(): Record<string, any> {
    const data: Record<string, any> = {};
    this.components.forEach((component, name) => {
      data[name] = component.getValue();
    });
    return data;
  }
}

// Concrete Colleagues
class EmailInput extends FormComponent {
  validate(): boolean {
    const email = this.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      this.isValid = false;
      this.errorMessage = 'Email is required';
      return false;
    }
    
    if (!emailRegex.test(email)) {
      this.isValid = false;
      this.errorMessage = 'Invalid email format';
      return false;
    }
    
    this.isValid = true;
    this.errorMessage = '';
    return true;
  }

  handleChange(value: any): void {
    this.value = value;
    this.validate();
    this.notify('change');
  }
}

class UsernameInput extends FormComponent {
  validate(): boolean {
    const username = this.value;
    
    if (!username) {
      this.isValid = false;
      this.errorMessage = 'Username is required';
      return false;
    }
    
    if (username.length < 3) {
      this.isValid = false;
      this.errorMessage = 'Username must be at least 3 characters';
      return false;
    }
    
    this.isValid = true;
    this.errorMessage = '';
    return true;
  }

  handleChange(value: any): void {
    this.value = value;
    this.validate();
    this.notify('change');
  }
}

class PasswordInput extends FormComponent {
  validate(): boolean {
    const password = this.value;
    
    if (!password) {
      this.isValid = false;
      this.errorMessage = 'Password is required';
      return false;
    }
    
    if (password.length < 8) {
      this.isValid = false;
      this.errorMessage = 'Password must be at least 8 characters';
      return false;
    }
    
    this.isValid = true;
    this.errorMessage = '';
    return true;
  }

  handleChange(value: any): void {
    this.value = value;
    this.validate();
    this.notify('change');
  }
}

class ConfirmPasswordInput extends FormComponent {
  validate(): boolean {
    const confirmPassword = this.value;
    
    if (!confirmPassword) {
      this.isValid = false;
      this.errorMessage = 'Please confirm your password';
      return false;
    }
    
    this.isValid = true;
    this.errorMessage = '';
    return true;
  }

  handleChange(value: any): void {
    this.value = value;
    this.notify('change');
    this.notify('validate');
  }

  setError(message: string): void {
    this.isValid = false;
    this.errorMessage = message;
  }

  clearError(): void {
    this.isValid = true;
    this.errorMessage = '';
  }
}

// Usage
const mediator = new RegistrationFormMediator();

const emailInput = new EmailInput(mediator);
const usernameInput = new UsernameInput(mediator);
const passwordInput = new PasswordInput(mediator);
const confirmPasswordInput = new ConfirmPasswordInput(mediator);

console.log('=== Form Interaction ===\n');

emailInput.setValue('john.doe@example.com');
usernameInput.setValue('johndoe');
passwordInput.setValue('securepass123');
confirmPasswordInput.setValue('securepass123');

console.log('\n=== Form Validation ===');
const isValid = mediator.validateAll();
console.log(`Form is valid: ${isValid}`);

console.log('\n=== Form Data ===');
console.log(mediator.getFormData());
```

### Example 3: Air Traffic Control System (ATC Mediator)

```typescript
// Mediator Interface
interface AirTrafficControl {
  requestLanding(aircraft: Aircraft): void;
  requestTakeoff(aircraft: Aircraft): void;
  notifyPosition(aircraft: Aircraft, position: string): void;
  register(aircraft: Aircraft): void;
}

// Colleague Interface
abstract class Aircraft {
  protected atc: AirTrafficControl;
  protected callSign: string;
  protected status: 'flying' | 'landing' | 'onGround' | 'takingOff' = 'flying';

  constructor(callSign: string, atc: AirTrafficControl) {
    this.callSign = callSign;
    this.atc = atc;
    this.atc.register(this);
  }

  abstract requestLanding(): void;
  abstract requestTakeoff(): void;
  abstract notifyPosition(position: string): void;

  getCallSign(): string {
    return this.callSign;
  }

  getStatus(): string {
    return this.status;
  }
}

// Concrete Mediator
class AirportControlTower implements AirTrafficControl {
  private aircrafts: Aircraft[] = [];
  private runwayInUse: Aircraft | null = null;
  private landingQueue: Aircraft[] = [];
  private takeoffQueue: Aircraft[] = [];

  register(aircraft: Aircraft): void {
    this.aircrafts.push(aircraft);
    console.log(`Aircraft ${aircraft.getCallSign()} registered with ATC`);
  }

  requestLanding(aircraft: Aircraft): void {
    console.log(`\n${aircraft.getCallSign()} requests landing permission`);
    
    if (this.runwayInUse) {
      console.log(`Runway busy. ${aircraft.getCallSign()} added to landing queue`);
      this.landingQueue.push(aircraft);
      return;
    }

    this.approveLanding(aircraft);
  }

  requestTakeoff(aircraft: Aircraft): void {
    console.log(`\n${aircraft.getCallSign()} requests takeoff permission`);
    
    if (this.runwayInUse) {
      console.log(`Runway busy. ${aircraft.getCallSign()} added to takeoff queue`);
      this.takeoffQueue.push(aircraft);
      return;
    }

    this.approveTakeoff(aircraft);
  }

  notifyPosition(aircraft: Aircraft, position: string): void {
    console.log(`${aircraft.getCallSign()} reports position: ${position}`);
    
    if (position === 'runway clear' && this.runwayInUse === aircraft) {
      this.runwayInUse = null;
      this.processQueues();
    }
  }

  private approveLanding(aircraft: Aircraft): void {
    this.runwayInUse = aircraft;
    console.log(`✓ Landing approved for ${aircraft.getCallSign()}`);
    (aircraft as any).status = 'landing';
  }

  private approveTakeoff(aircraft: Aircraft): void {
    this.runwayInUse = aircraft;
    console.log(`✓ Takeoff approved for ${aircraft.getCallSign()}`);
    (aircraft as any).status = 'takingOff';
  }

  private processQueues(): void {
    // Priority: landing queue first
    if (this.landingQueue.length > 0) {
      const next = this.landingQueue.shift()!;
      this.approveLanding(next);
    } else if (this.takeoffQueue.length > 0) {
      const next = this.takeoffQueue.shift()!;
      this.approveTakeoff(next);
    }
  }
}

// Concrete Colleagues
class CommercialAircraft extends Aircraft {
  requestLanding(): void {
    this.atc.requestLanding(this);
  }

  requestTakeoff(): void {
    this.atc.requestTakeoff(this);
  }

  notifyPosition(position: string): void {
    this.atc.notifyPosition(this, position);
  }

  land(): void {
    console.log(`${this.callSign} is landing...`);
    setTimeout(() => {
      this.status = 'onGround';
      this.notifyPosition('runway clear');
    }, 1000);
  }

  takeoff(): void {
    console.log(`${this.callSign} is taking off...`);
    setTimeout(() => {
      this.status = 'flying';
      this.notifyPosition('runway clear');
    }, 1000);
  }
}

// Usage
const atc = new AirportControlTower();

const flight101 = new CommercialAircraft('FL101', atc);
const flight202 = new CommercialAircraft('FL202', atc);
const flight303 = new CommercialAircraft('FL303', atc);

flight101.requestLanding();
flight101.land();

setTimeout(() => {
  flight202.requestLanding();
  flight303.requestTakeoff();
}, 500);

setTimeout(() => {
  flight202.land();
}, 2000);
```

### Example 4: Event Bus Mediator (Reactive Pattern)

```typescript
// Event Types
type EventType = string;
type EventHandler = (data: any) => void;

// Mediator Interface
interface EventBus {
  subscribe(eventType: EventType, handler: EventHandler): void;
  unsubscribe(eventType: EventType, handler: EventHandler): void;
  publish(eventType: EventType, data: any): void;
}

// Concrete Mediator
class EventBusMediator implements EventBus {
  private handlers: Map<EventType, Set<EventHandler>> = new Map();

  subscribe(eventType: EventType, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
    console.log(`Handler subscribed to ${eventType}`);
  }

  unsubscribe(eventType: EventType, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      console.log(`Handler unsubscribed from ${eventType}`);
    }
  }

  publish(eventType: EventType, data: any): void {
    console.log(`\nPublishing event: ${eventType}`, data);
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in handler for ${eventType}:`, error);
        }
      });
    }
  }

  getSubscriberCount(eventType: EventType): number {
    return this.handlers.get(eventType)?.size || 0;
  }
}

// Colleague Interface
abstract class Component {
  protected eventBus: EventBus;
  protected name: string;

  constructor(name: string, eventBus: EventBus) {
    this.name = name;
    this.eventBus = eventBus;
  }

  protected publish(eventType: EventType, data: any): void {
    this.eventBus.publish(eventType, data);
  }

  protected subscribe(eventType: EventType, handler: EventHandler): void {
    this.eventBus.subscribe(eventType, handler);
  }

  getName(): string {
    return this.name;
  }
}

// Concrete Colleagues
class UserService extends Component {
  constructor(eventBus: EventBus) {
    super('UserService', eventBus);
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    this.subscribe('user:login', (data) => {
      console.log(`${this.name}: User logged in`, data);
      this.publish('notification:send', {
        type: 'success',
        message: 'Welcome back!'
      });
    });

    this.subscribe('user:logout', (data) => {
      console.log(`${this.name}: User logged out`, data);
    });
  }

  login(username: string, password: string): void {
    console.log(`${this.name}: Attempting login for ${username}`);
    // Simulate authentication
    if (username && password) {
      this.publish('user:login', { username, timestamp: new Date() });
    }
  }

  logout(userId: string): void {
    console.log(`${this.name}: Logging out user ${userId}`);
    this.publish('user:logout', { userId, timestamp: new Date() });
  }
}

class NotificationService extends Component {
  constructor(eventBus: EventBus) {
    super('NotificationService', eventBus);
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    this.subscribe('notification:send', (data) => {
      console.log(`${this.name}: Sending notification`, data);
      this.showNotification(data);
    });
  }

  private showNotification(data: any): void {
    console.log(`📢 ${data.type.toUpperCase()}: ${data.message}`);
  }
}

class AnalyticsService extends Component {
  constructor(eventBus: EventBus) {
    super('AnalyticsService', eventBus);
    this.setupSubscriptions();
  }

  private setupSubscriptions(): void {
    this.subscribe('user:login', (data) => {
      console.log(`${this.name}: Tracking login event`, data);
      this.trackEvent('user_login', data);
    });

    this.subscribe('user:logout', (data) => {
      console.log(`${this.name}: Tracking logout event`, data);
      this.trackEvent('user_logout', data);
    });
  }

  private trackEvent(eventName: string, data: any): void {
    console.log(`📊 Analytics: ${eventName}`, data);
  }
}

// Usage
const eventBus = new EventBusMediator();

const userService = new UserService(eventBus);
const notificationService = new NotificationService(eventBus);
const analyticsService = new AnalyticsService(eventBus);

console.log('=== Event-Driven System ===\n');

userService.login('john.doe', 'password123');

console.log('\n---\n');

userService.logout('user-123');
```

### Example 5: Game System Mediator

```typescript
// Mediator Interface
interface GameMediator {
  playerAction(player: Player, action: string, target?: GameEntity): void;
  entityAction(entity: GameEntity, action: string, data?: any): void;
  register(entity: GameEntity): void;
}

// Colleague Interface
abstract class GameEntity {
  protected mediator: GameMediator;
  protected name: string;
  protected health: number;
  protected position: { x: number; y: number };

  constructor(
    name: string,
    health: number,
    position: { x: number; y: number },
    mediator: GameMediator
  ) {
    this.name = name;
    this.health = health;
    this.position = position;
    this.mediator = mediator;
    this.mediator.register(this);
  }

  abstract takeDamage(amount: number): void;
  abstract update(): void;

  getName(): string {
    return this.name;
  }

  getHealth(): number {
    return this.health;
  }

  getPosition(): { x: number; y: number } {
    return this.position;
  }

  protected notify(action: string, data?: any): void {
    this.mediator.entityAction(this, action, data);
  }
}

// Concrete Mediator
class GameWorld implements GameMediator {
  private entities: GameEntity[] = [];
  private events: string[] = [];

  register(entity: GameEntity): void {
    this.entities.push(entity);
    console.log(`${entity.getName()} entered the game world`);
  }

  playerAction(player: Player, action: string, target?: GameEntity): void {
    console.log(`\n${player.getName()} performs: ${action}`);
    
    switch (action) {
      case 'attack':
        if (target) {
          this.handleAttack(player, target);
        }
        break;
      case 'pickup':
        if (target) {
          this.handlePickup(player, target);
        }
        break;
      case 'useItem':
        this.handleUseItem(player);
        break;
    }
  }

  entityAction(entity: GameEntity, action: string, data?: any): void {
    switch (action) {
      case 'died':
        this.handleEntityDeath(entity);
        break;
      case 'spawned':
        console.log(`${entity.getName()} spawned at`, data);
        break;
      case 'moved':
        console.log(`${entity.getName()} moved to`, data);
        break;
    }
  }

  private handleAttack(attacker: Player, target: GameEntity): void {
    const damage = attacker.getAttackPower();
    console.log(`${attacker.getName()} attacks ${target.getName()} for ${damage} damage`);
    target.takeDamage(damage);
    
    if (target.getHealth() <= 0) {
      this.handleEntityDeath(target);
      attacker.gainExperience(10);
    }
  }

  private handlePickup(player: Player, item: GameEntity): void {
    if (item instanceof Item) {
      console.log(`${player.getName()} picked up ${item.getName()}`);
      player.addItem(item);
      this.removeEntity(item);
    }
  }

  private handleUseItem(player: Player): void {
    const item = player.useItem();
    if (item) {
      console.log(`${player.getName()} used ${item.getName()}`);
      player.heal(item.getHealAmount());
    }
  }

  private handleEntityDeath(entity: GameEntity): void {
    console.log(`💀 ${entity.getName()} died`);
    this.removeEntity(entity);
    
    if (entity instanceof Enemy) {
      this.spawnLoot(entity.getPosition());
    }
  }

  private spawnLoot(position: { x: number; y: number }): void {
    const loot = new Item('Health Potion', 50, position, this);
    console.log(`✨ Loot spawned at`, position);
  }

  private removeEntity(entity: GameEntity): void {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
    }
  }

  update(): void {
    this.entities.forEach(entity => entity.update());
  }
}

// Concrete Colleagues
class Player extends GameEntity {
  private experience: number = 0;
  private level: number = 1;
  private attackPower: number = 10;
  private inventory: Item[] = [];

  constructor(name: string, mediator: GameMediator) {
    super(name, 100, { x: 0, y: 0 }, mediator);
  }

  takeDamage(amount: number): void {
    this.health -= amount;
    console.log(`${this.name} took ${amount} damage. Health: ${this.health}`);
  }

  update(): void {
    // Player update logic
  }

  attack(target: GameEntity): void {
    this.mediator.playerAction(this, 'attack', target);
  }

  pickup(item: GameEntity): void {
    this.mediator.playerAction(this, 'pickup', item);
  }

  useItem(): Item | null {
    const item = this.inventory.pop();
    if (item) {
      this.mediator.playerAction(this, 'useItem');
    }
    return item || null;
  }

  addItem(item: Item): void {
    this.inventory.push(item);
  }

  gainExperience(amount: number): void {
    this.experience += amount;
    console.log(`${this.name} gained ${amount} XP. Total: ${this.experience}`);
  }

  heal(amount: number): void {
    this.health = Math.min(100, this.health + amount);
    console.log(`${this.name} healed ${amount}. Health: ${this.health}`);
  }

  getAttackPower(): number {
    return this.attackPower;
  }
}

class Enemy extends GameEntity {
  private attackPower: number = 5;

  constructor(name: string, position: { x: number; y: number }, mediator: GameMediator) {
    super(name, 50, position, mediator);
  }

  takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.notify('died');
    }
  }

  update(): void {
    // Enemy AI logic
  }

  getAttackPower(): number {
    return this.attackPower;
  }
}

class Item extends GameEntity {
  private healAmount: number;

  constructor(
    name: string,
    healAmount: number,
    position: { x: number; y: number },
    mediator: GameMediator
  ) {
    super(name, 1, position, mediator);
    this.healAmount = healAmount;
  }

  takeDamage(amount: number): void {
    // Items don't take damage
  }

  update(): void {
    // Items don't update
  }

  getHealAmount(): number {
    return this.healAmount;
  }
}

// Usage
const gameWorld = new GameWorld();

const player = new Player('Hero', gameWorld);
const enemy1 = new Enemy('Goblin', { x: 10, y: 10 }, gameWorld);
const enemy2 = new Enemy('Orc', { x: 20, y: 20 }, gameWorld);

console.log('=== Game System ===\n');

player.attack(enemy1);
player.attack(enemy1);
player.attack(enemy2);

gameWorld.update();
```

### Example 6: Dialog System Mediator

```typescript
// Mediator Interface
interface DialogMediator {
  notify(component: DialogComponent, event: string, data?: any): void;
  register(component: DialogComponent): void;
  showDialog(): void;
  closeDialog(): void;
}

// Colleague Interface
abstract class DialogComponent {
  protected mediator: DialogMediator;
  protected visible: boolean = true;

  constructor(mediator: DialogMediator) {
    this.mediator = mediator;
    this.mediator.register(this);
  }

  abstract render(): string;
  abstract handleEvent(event: string, data?: any): void;

  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  isVisible(): boolean {
    return this.visible;
  }

  protected notify(event: string, data?: any): void {
    this.mediator.notify(this, event, data);
  }
}

// Concrete Mediator
class ModalDialogMediator implements DialogMediator {
  private components: DialogComponent[] = [];
  private isOpen: boolean = false;

  register(component: DialogComponent): void {
    this.components.push(component);
  }

  notify(component: DialogComponent, event: string, data?: any): void {
    const componentName = component.constructor.name;

    switch (event) {
      case 'ok':
        this.handleOk();
        break;
      case 'cancel':
        this.handleCancel();
        break;
      case 'validate':
        this.handleValidation(component);
        break;
    }
  }

  private handleOk(): void {
    // Validate all components
    let isValid = true;
    this.components.forEach(component => {
      component.handleEvent('validate');
      // In real implementation, check validation state
    });

    if (isValid) {
      console.log('Dialog: OK clicked - closing dialog');
      this.closeDialog();
    } else {
      console.log('Dialog: Validation failed - keeping dialog open');
    }
  }

  private handleCancel(): void {
    console.log('Dialog: Cancel clicked - closing dialog');
    this.closeDialog();
  }

  private handleValidation(component: DialogComponent): void {
    component.handleEvent('validate');
  }

  showDialog(): void {
    this.isOpen = true;
    console.log('Dialog opened');
    this.components.forEach(component => component.setVisible(true));
  }

  closeDialog(): void {
    this.isOpen = false;
    console.log('Dialog closed');
    this.components.forEach(component => component.setVisible(false));
  }

  render(): string {
    if (!this.isOpen) return '';

    const componentsHtml = this.components
      .filter(c => c.isVisible())
      .map(c => c.render())
      .join('\n');

    return `
      <div class="modal-dialog">
        ${componentsHtml}
      </div>
    `;
  }
}

// Concrete Colleagues
class DialogTitle extends DialogComponent {
  constructor(private title: string, mediator: DialogMediator) {
    super(mediator);
  }

  render(): string {
    return `<h2>${this.title}</h2>`;
  }

  handleEvent(event: string, data?: any): void {
    // Title doesn't handle events
  }
}

class DialogInput extends DialogComponent {
  private value: string = '';
  private isValid: boolean = true;
  private errorMessage: string = '';

  constructor(
    private label: string,
    private validator: (value: string) => boolean,
    mediator: DialogMediator
  ) {
    super(mediator);
  }

  render(): string {
    const errorClass = this.isValid ? '' : 'error';
    return `
      <div class="input-group ${errorClass}">
        <label>${this.label}</label>
        <input value="${this.value}" />
        ${this.errorMessage ? `<span class="error">${this.errorMessage}</span>` : ''}
      </div>
    `;
  }

  handleEvent(event: string, data?: any): void {
    if (event === 'validate') {
      this.validate();
    } else if (event === 'change') {
      this.value = data;
      this.validate();
    }
  }

  private validate(): void {
    this.isValid = this.validator(this.value);
    if (!this.isValid) {
      this.errorMessage = `${this.label} is invalid`;
    } else {
      this.errorMessage = '';
    }
  }

  getValue(): string {
    return this.value;
  }
}

class DialogButton extends DialogComponent {
  constructor(
    private label: string,
    private action: string,
    mediator: DialogMediator
  ) {
    super(mediator);
  }

  render(): string {
    return `<button data-action="${this.action}">${this.label}</button>`;
  }

  handleEvent(event: string, data?: any): void {
    if (event === 'click' && data === this.action) {
      this.notify(this.action);
    }
  }

  click(): void {
    this.handleEvent('click', this.action);
  }
}

// Usage
const dialog = new ModalDialogMediator();

const title = new DialogTitle('User Registration', dialog);
const nameInput = new DialogInput(
  'Name',
  (value) => value.length >= 3,
  dialog
);
const emailInput = new DialogInput(
  'Email',
  (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  dialog
);
const okButton = new DialogButton('OK', 'ok', dialog);
const cancelButton = new DialogButton('Cancel', 'cancel', dialog);

dialog.showDialog();
console.log(dialog.render());

nameInput.handleEvent('change', 'Jo');
emailInput.handleEvent('change', 'john@example.com');

okButton.click();
```

---

## 🔄 Pattern Variations

### Variation 1: Hierarchical Mediator

```typescript
// Mediator with hierarchy
interface HierarchicalMediator extends Mediator {
  setParent(parent: Mediator): void;
  getParent(): Mediator | null;
}

class RegionalMediator implements HierarchicalMediator {
  private parent: Mediator | null = null;
  private children: Mediator[] = [];

  setParent(parent: Mediator): void {
    this.parent = parent;
  }

  getParent(): Mediator | null {
    return this.parent;
  }

  notify(sender: Colleague, event: string): void {
    // Handle locally first
    this.handleLocal(sender, event);
    
    // Propagate to parent if needed
    if (this.parent && this.shouldPropagate(event)) {
      this.parent.notify(sender, event);
    }
  }

  private handleLocal(sender: Colleague, event: string): void {
    // Local handling logic
  }

  private shouldPropagate(event: string): boolean {
    // Determine if event should propagate
    return true;
  }
}
```

### Variation 2: Event-Driven Mediator

```typescript
// Event-driven mediator using observer pattern
class EventDrivenMediator {
  private eventHandlers: Map<string, Set<Function>> = new Map();

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: Function): void {
    this.eventHandlers.get(event)?.delete(handler);
  }

  emit(event: string, data?: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }
}
```

---

## 🔀 Pattern Comparisons

### Mediator vs Observer

**Similarities:**
- Both decouple components
- Both handle communication
- Both support many-to-many relationships

**Differences:**

| Aspect | Mediator | Observer |
|--------|----------|----------|
| **Communication** | Centralized through mediator | Direct between subject and observers |
| **Coupling** | Colleagues don't know each other | Observers know about subject |
| **Control** | Mediator controls all communication | Subject notifies observers |
| **Complexity** | Can become complex | Simpler for basic cases |
| **Use Case** | Complex interactions | Simple notifications |

**When to use Mediator:**
- Complex interactions between multiple objects
- Need centralized control logic
- Objects shouldn't know about each other
- Communication patterns are complex

**When to use Observer:**
- Simple one-to-many notifications
- Subject needs to notify multiple observers
- Loose coupling is sufficient
- No complex coordination needed

### Mediator vs Facade

**Similarities:**
- Both provide simplified interfaces
- Both reduce coupling
- Both centralize logic

**Differences:**

| Aspect | Mediator | Facade |
|--------|----------|--------|
| **Purpose** | Coordinates peers | Simplifies subsystem |
| **Relationships** | Peer-to-peer | Client-to-subsystem |
| **Communication** | Bidirectional | Unidirectional |
| **Complexity** | Can be complex | Usually simpler |

**When to use Mediator:**
- Need to coordinate peer objects
- Complex interactions between equals
- Objects need to communicate with each other

**When to use Facade:**
- Need to simplify subsystem interface
- Hide complexity from client
- One-way communication is sufficient

### Mediator vs Command

**Similarities:**
- Both encapsulate behavior
- Both can queue operations
- Both support undo/redo

**Differences:**

| Aspect | Mediator | Command |
|--------|----------|---------|
| **Focus** | Communication | Action encapsulation |
| **Structure** | Central coordinator | Command objects |
| **Undo** | Not typically supported | Often supports undo |
| **Use Case** | Object coordination | Action queuing |

---

## 🎯 Real-World Applications

### 1. UI Frameworks (React, Vue, Angular)

Component communication through mediators:

```typescript
// React Context as Mediator
const ThemeContext = createContext();

function App() {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Components />
    </ThemeContext.Provider>
  );
}
```

### 2. Chat Applications

Chat rooms act as mediators:

```typescript
class ChatRoom {
  private users: User[] = [];
  
  sendMessage(message: string, sender: User): void {
    this.users.forEach(user => {
      if (user !== sender) {
        user.receive(message);
      }
    });
  }
}
```

### 3. Form Validation

Form mediators coordinate field validation:

```typescript
class FormMediator {
  validateAll(): boolean {
    // Coordinate validation across all fields
  }
}
```

### 4. Game Engines

Game world coordinates entity interactions:

```typescript
class GameWorld {
  handleCollision(entity1: Entity, entity2: Entity): void {
    // Coordinate collision handling
  }
}
```

### 5. Message Brokers

Message brokers mediate between services:

```typescript
class MessageBroker {
  publish(topic: string, message: any): void {
    // Route message to subscribers
  }
}
```

---

## ⚠️ Common Pitfalls and Best Practices

### Common Pitfalls

❌ **God Object Mediator**
```typescript
// BAD: Mediator knows too much
class GodMediator {
  handleEverything(): void {
    // 1000+ lines of logic
  }
}

// GOOD: Break into multiple mediators
class FormMediator { }
class ValidationMediator { }
class NotificationMediator { }
```

❌ **Tight Coupling to Concrete Classes**
```typescript
// BAD: Mediator depends on concrete classes
class BadMediator {
  notify(user: ChatUser, message: string): void {
    // Direct dependency
  }
}

// GOOD: Depend on interfaces
class GoodMediator {
  notify(colleague: Colleague, event: string): void {
    // Interface-based
  }
}
```

❌ **Circular Dependencies**
```typescript
// BAD: Circular dependency
class Mediator {
  constructor(private colleague: Colleague) {
    this.colleague.setMediator(this);
  }
}

// GOOD: Set mediator after construction
const mediator = new Mediator();
const colleague = new Colleague(mediator);
mediator.register(colleague);
```

❌ **Mediator Becomes Bottleneck**
```typescript
// BAD: All communication goes through mediator
// Can become performance bottleneck

// GOOD: Use mediator for coordination, direct calls for simple cases
if (simpleCase) {
  objectA.directCall(objectB);
} else {
  mediator.coordinate(objectA, objectB);
}
```

### Best Practices

✅ **Keep Mediator Focused**
```typescript
class FocusedMediator {
  // Handle one type of coordination
  coordinateFormValidation(): void { }
}
```

✅ **Use Interfaces for Colleagues**
```typescript
interface Colleague {
  notify(event: string): void;
}
```

✅ **Delegate to Colleagues When Appropriate**
```typescript
class Mediator {
  notify(sender: Colleague, event: string): void {
    // Let colleagues handle their own logic
    sender.handle(event);
  }
}
```

✅ **Consider Event Bus for Loose Coupling**
```typescript
class EventBusMediator {
  publish(event: string, data: any): void {
    // Publish-subscribe pattern
  }
}
```

✅ **Break Complex Mediators into Hierarchies**
```typescript
class RegionalMediator {
  private localMediators: Mediator[] = [];
  // Delegate to local mediators
}
```

---

## 🚀 Modern Variations and Extensions

### 1. Reactive Mediator (RxJS Style)

```typescript
class ReactiveMediator {
  private subjects: Map<string, Subject<any>> = new Map();

  getStream(eventType: string): Observable<any> {
    if (!this.subjects.has(eventType)) {
      this.subjects.set(eventType, new Subject());
    }
    return this.subjects.get(eventType)!.asObservable();
  }

  publish(eventType: string, data: any): void {
    const subject = this.subjects.get(eventType);
    if (subject) {
      subject.next(data);
    }
  }
}
```

### 2. Command-Based Mediator

```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class CommandMediator {
  private commands: Command[] = [];
  
  execute(command: Command): void {
    command.execute();
    this.commands.push(command);
  }
  
  undo(): void {
    const command = this.commands.pop();
    command?.undo();
  }
}
```

---

## 📚 Summary

### Key Takeaways

1. **Mediator Pattern** centralizes complex communication between objects
2. **Loose Coupling** - Objects don't know about each other, only the mediator
3. **Single Responsibility** - Mediator handles coordination, colleagues handle their own logic
4. **Complexity Management** - Reduces N*N connections to N connections
5. **Reusability** - Colleagues can be reused in different contexts

### When to Use

✅ Use when:
- Objects communicate in complex ways
- You want to avoid tight coupling
- Communication logic is complex
- You need centralized control
- Objects need to be reusable in different contexts

❌ Don't use when:
- Communication is simple
- Mediator becomes too complex
- Performance is critical
- Objects need direct references

### Pattern Relationships

- **Similar to Observer**: Both decouple, but Mediator centralizes, Observer distributes
- **Similar to Facade**: Both simplify, but Mediator coordinates peers, Facade simplifies subsystem
- **Can use with**: Command, Strategy, Observer patterns

### Next Steps

After mastering Mediator Pattern, consider:
- **Memento Pattern** - For state snapshots
- **Interpreter Pattern** - For language processing
- **Event-Driven Architecture** - Advanced mediator usage
- **Message Brokers** - Distributed mediators

---

## 🔗 Related Patterns

- **Observer**: Defines one-to-many dependency between objects
- **Facade**: Provides unified interface to subsystem
- **Command**: Encapsulates requests as objects
- **Strategy**: Defines family of algorithms

---

## 📖 References

- **Gang of Four**: "Design Patterns: Elements of Reusable Object-Oriented Software"
- **Refactoring Guru**: Mediator Pattern
- **Source Making**: Mediator Design Pattern

