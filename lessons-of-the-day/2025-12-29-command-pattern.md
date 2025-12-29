# Command Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Command pattern definition and intent
- [ ] Learn when to use Command vs other behavioral patterns
- [ ] Master the command-invoker-receiver relationship
- [ ] Recognize real-world applications (undo/redo, queuing, logging, macros)
- [ ] Understand Command vs Strategy pattern differences
- [ ] Practice implementing Command with undo/redo functionality
- [ ] Learn common pitfalls and best practices
- [ ] Explore modern variations (functional commands, command queues)
- [ ] Understand macro commands and command composition

---

## 🎯 Definition

**Command Pattern** is a behavioral design pattern that turns a request into a stand-alone object that contains all information about the request. This transformation lets you parameterize methods with different requests, delay or queue a request's execution, and support undoable operations.

**Intent (GoF):**
- Encapsulate a request as an object
- Parameterize clients with different requests
- Queue requests, log requests, and support undo operations
- Also known as: **Action Pattern**, **Transaction Pattern**

**Key Principle:**
> "Encapsulate requests as objects" - The command pattern encapsulates method invocation, allowing you to parameterize objects with operations, queue operations, log them, and support undoable operations. It decouples the object that invokes the operation from the one that performs it.

---

## 🏗️ Structure

### UML Diagram Concept

```
Client
└── creates Command objects

Command (Interface)
├── execute(): void
└── undo(): void (optional)

ConcreteCommand implements Command
├── receiver: Receiver
├── state: State (for undo)
├── execute(): void
│   └── receiver.action()
└── undo(): void
    └── receiver.reverseAction()

Receiver
├── action(): void
└── reverseAction(): void

Invoker
├── commands: Command[]
├── executeCommand(command: Command): void
├── undoLastCommand(): void
└── executeAll(): void
```

### Participants

1. **Command** - Declares an interface for executing an operation
2. **ConcreteCommand** - Defines a binding between a Receiver object and an action, implements Execute by invoking the corresponding operation(s) on Receiver
3. **Client** - Creates a ConcreteCommand object and sets its receiver
4. **Invoker** - Asks the command to carry out the request
5. **Receiver** - Knows how to perform the operations associated with carrying out a request

### Key Concepts

**Request Encapsulation:**
- Request is encapsulated as an object
- Contains all information needed to execute
- Can be stored, passed around, and executed later

**Decoupling:**
- Invoker doesn't know about receiver
- Command knows about receiver
- Client creates command and sets receiver

**Undo/Redo Support:**
- Commands can store state for undo
- Commands can implement reverse operations
- History can be maintained

**Queuing and Logging:**
- Commands can be queued
- Commands can be logged
- Commands can be executed asynchronously

**Macro Commands:**
- Commands can be composed
- Multiple commands can be executed together
- Composite pattern can be used

**Parameterization:**
- Objects can be parameterized with commands
- Different commands can be assigned to same object
- Runtime command selection

---

## 💡 When to Use

### Use Command When:

✅ **You need to parameterize objects with operations**
- Example: Menu items that execute different commands
- Example: Buttons that perform different actions

✅ **You need to queue operations, schedule them, or execute them remotely**
- Example: Job queue system
- Example: Remote procedure calls
- Example: Task scheduler

✅ **You need to support undo/redo operations**
- Example: Text editor with undo/redo
- Example: Drawing application with history
- Example: Transaction system

✅ **You need to log requests and support auditing**
- Example: Audit log system
- Example: Transaction logging
- Example: Command history

✅ **You need to structure a system around high-level operations built on primitive operations**
- Example: Macro commands
- Example: Composite commands
- Example: Scripting system

✅ **You want to decouple the object that invokes the operation from the one that performs it**
- Example: Remote control for different devices
- Example: API that accepts command objects
- Example: Event-driven systems

### Don't Use When:

❌ **Operations are simple and don't need undo/redo** - Direct method calls are simpler
❌ **You don't need queuing, logging, or undo** - Overhead not worth it
❌ **Commands don't have parameters** - Simple function pointers might suffice
❌ **Performance is critical** - Command objects add overhead
❌ **Operations are always synchronous and immediate** - Direct calls are more efficient

---

## 🔨 Implementation Examples

### Example 1: Basic Command Pattern (Remote Control)

```typescript
// Command Interface
interface Command {
  execute(): void;
}

// Receiver
class Light {
  private isOn: boolean = false;

  turnOn(): void {
    this.isOn = true;
    console.log('Light is ON');
  }

  turnOff(): void {
    this.isOn = false;
    console.log('Light is OFF');
  }

  getState(): boolean {
    return this.isOn;
  }
}

class TV {
  private isOn: boolean = false;
  private volume: number = 0;

  turnOn(): void {
    this.isOn = true;
    console.log('TV is ON');
  }

  turnOff(): void {
    this.isOn = false;
    console.log('TV is OFF');
  }

  setVolume(volume: number): void {
    this.volume = volume;
    console.log(`TV volume set to ${volume}`);
  }

  getVolume(): number {
    return this.volume;
  }
}

// Concrete Commands
class LightOnCommand implements Command {
  constructor(private light: Light) {}

  execute(): void {
    this.light.turnOn();
  }
}

class LightOffCommand implements Command {
  constructor(private light: Light) {}

  execute(): void {
    this.light.turnOff();
  }
}

class TVOnCommand implements Command {
  constructor(private tv: TV) {}

  execute(): void {
    this.tv.turnOn();
  }
}

class TVOffCommand implements Command {
  constructor(private tv: TV) {}

  execute(): void {
    this.tv.turnOff();
  }
}

class TVVolumeCommand implements Command {
  constructor(
    private tv: TV,
    private volume: number
  ) {}

  execute(): void {
    this.tv.setVolume(this.volume);
  }
}

// Invoker
class RemoteControl {
  private commands: Map<string, Command> = new Map();

  setCommand(slot: string, command: Command): void {
    this.commands.set(slot, command);
  }

  pressButton(slot: string): void {
    const command = this.commands.get(slot);
    if (command) {
      command.execute();
    } else {
      console.log(`No command assigned to slot: ${slot}`);
    }
  }
}

// Usage
const light = new Light();
const tv = new TV();

const remote = new RemoteControl();

remote.setCommand('button1', new LightOnCommand(light));
remote.setCommand('button2', new LightOffCommand(light));
remote.setCommand('button3', new TVOnCommand(tv));
remote.setCommand('button4', new TVOffCommand(tv));
remote.setCommand('button5', new TVVolumeCommand(tv, 50));

remote.pressButton('button1');  // Light is ON
remote.pressButton('button3');   // TV is ON
remote.pressButton('button5');   // TV volume set to 50
remote.pressButton('button2');   // Light is OFF
remote.pressButton('button4');   // TV is OFF
```

### Example 2: Command Pattern with Undo/Redo (Text Editor)

```typescript
// Command Interface with Undo
interface Command {
  execute(): void;
  undo(): void;
}

// Receiver
class TextEditor {
  private content: string = '';

  insert(text: string, position: number): void {
    this.content = 
      this.content.slice(0, position) + 
      text + 
      this.content.slice(position);
  }

  delete(start: number, length: number): string {
    const deleted = this.content.slice(start, start + length);
    this.content = 
      this.content.slice(0, start) + 
      this.content.slice(start + length);
    return deleted;
  }

  getContent(): string {
    return this.content;
  }

  getLength(): number {
    return this.content.length;
  }
}

// Concrete Commands
class InsertCommand implements Command {
  private position: number;
  private text: string;

  constructor(
    private editor: TextEditor,
    text: string,
    position: number
  ) {
    this.text = text;
    this.position = position;
  }

  execute(): void {
    this.editor.insert(this.text, this.position);
    console.log(`Inserted "${this.text}" at position ${this.position}`);
  }

  undo(): void {
    this.editor.delete(this.position, this.text.length);
    console.log(`Undid insertion of "${this.text}"`);
  }
}

class DeleteCommand implements Command {
  private deletedText: string = '';
  private position: number;
  private length: number;

  constructor(
    private editor: TextEditor,
    position: number,
    length: number
  ) {
    this.position = position;
    this.length = length;
  }

  execute(): void {
    this.deletedText = this.editor.delete(this.position, this.length);
    console.log(`Deleted "${this.deletedText}" from position ${this.position}`);
  }

  undo(): void {
    this.editor.insert(this.deletedText, this.position);
    console.log(`Undid deletion, restored "${this.deletedText}"`);
  }
}

// Invoker with History
class CommandManager {
  private history: Command[] = [];
  private currentIndex: number = -1;

  executeCommand(command: Command): void {
    // Remove any commands after current index (when undoing and then executing new command)
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    command.execute();
    this.history.push(command);
    this.currentIndex++;
  }

  undo(): void {
    if (this.currentIndex >= 0) {
      const command = this.history[this.currentIndex];
      command.undo();
      this.currentIndex--;
    } else {
      console.log('Nothing to undo');
    }
  }

  redo(): void {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      command.execute();
    } else {
      console.log('Nothing to redo');
    }
  }

  getHistory(): string[] {
    return this.history.map((cmd, idx) => 
      `${idx}: ${cmd.constructor.name}${idx === this.currentIndex ? ' (current)' : ''}`
    );
  }
}

// Usage
const editor = new TextEditor();
const manager = new CommandManager();

manager.executeCommand(new InsertCommand(editor, 'Hello', 0));
manager.executeCommand(new InsertCommand(editor, ' World', 5));
manager.executeCommand(new InsertCommand(editor, '!', 11));

console.log(`Content: "${editor.getContent()}"`); // "Hello World!"

manager.undo();
console.log(`Content: "${editor.getContent()}"`); // "Hello World"

manager.undo();
console.log(`Content: "${editor.getContent()}"`); // "Hello"

manager.redo();
console.log(`Content: "${editor.getContent()}"`); // "Hello World"

manager.executeCommand(new DeleteCommand(editor, 0, 5));
console.log(`Content: "${editor.getContent()}"`); // " World"

manager.undo();
console.log(`Content: "${editor.getContent()}"`); // "Hello World"
```

### Example 3: Macro Commands (Composite Commands)

```typescript
// Command Interface
interface Command {
  execute(): void;
  undo(): void;
}

// Macro Command (Composite)
class MacroCommand implements Command {
  private commands: Command[] = [];

  addCommand(command: Command): void {
    this.commands.push(command);
  }

  removeCommand(command: Command): void {
    const index = this.commands.indexOf(command);
    if (index > -1) {
      this.commands.splice(index, 1);
    }
  }

  execute(): void {
    console.log('Executing macro command...');
    for (const command of this.commands) {
      command.execute();
    }
    console.log('Macro command completed');
  }

  undo(): void {
    console.log('Undoing macro command...');
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
    console.log('Macro command undone');
  }
}

// Receivers
class Light {
  private isOn: boolean = false;

  turnOn(): void {
    this.isOn = true;
    console.log('Light turned ON');
  }

  turnOff(): void {
    this.isOn = false;
    console.log('Light turned OFF');
  }
}

class TV {
  private isOn: boolean = false;

  turnOn(): void {
    this.isOn = true;
    console.log('TV turned ON');
  }

  turnOff(): void {
    this.isOn = false;
    console.log('TV turned OFF');
  }
}

class Stereo {
  private isOn: boolean = false;
  private volume: number = 0;

  turnOn(): void {
    this.isOn = true;
    console.log('Stereo turned ON');
  }

  turnOff(): void {
    this.isOn = false;
    console.log('Stereo turned OFF');
  }

  setVolume(volume: number): void {
    this.volume = volume;
    console.log(`Stereo volume set to ${volume}`);
  }
}

// Concrete Commands
class LightOnCommand implements Command {
  constructor(private light: Light) {}

  execute(): void {
    this.light.turnOn();
  }

  undo(): void {
    this.light.turnOff();
  }
}

class LightOffCommand implements Command {
  constructor(private light: Light) {}

  execute(): void {
    this.light.turnOff();
  }

  undo(): void {
    this.light.turnOn();
  }
}

class TVOnCommand implements Command {
  constructor(private tv: TV) {}

  execute(): void {
    this.tv.turnOn();
  }

  undo(): void {
    this.tv.turnOff();
  }
}

class TVOffCommand implements Command {
  constructor(private tv: TV) {}

  execute(): void {
    this.tv.turnOff();
  }

  undo(): void {
    this.tv.turnOn();
  }
}

class StereoOnCommand implements Command {
  constructor(private stereo: Stereo) {}

  execute(): void {
    this.stereo.turnOn();
  }

  undo(): void {
    this.stereo.turnOff();
  }
}

class StereoVolumeCommand implements Command {
  private previousVolume: number = 0;

  constructor(
    private stereo: Stereo,
    private volume: number
  ) {}

  execute(): void {
    this.previousVolume = this.stereo.getVolume();
    this.stereo.setVolume(this.volume);
  }

  undo(): void {
    this.stereo.setVolume(this.previousVolume);
  }
}

// Usage
const light = new Light();
const tv = new TV();
const stereo = new Stereo();

// Create "Party Mode" macro
const partyMode = new MacroCommand();
partyMode.addCommand(new LightOffCommand(light));
partyMode.addCommand(new TVOnCommand(tv));
partyMode.addCommand(new StereoOnCommand(stereo));
partyMode.addCommand(new StereoVolumeCommand(stereo, 80));

// Create "Sleep Mode" macro
const sleepMode = new MacroCommand();
sleepMode.addCommand(new TVOffCommand(tv));
sleepMode.addCommand(new StereoOffCommand(stereo));
sleepMode.addCommand(new LightOffCommand(light));

console.log('=== Party Mode ===');
partyMode.execute();

console.log('\n=== Sleep Mode ===');
sleepMode.execute();

console.log('\n=== Undo Sleep Mode ===');
sleepMode.undo();
```

### Example 4: Command Pattern with Queuing and Logging

```typescript
// Command Interface
interface Command {
  execute(): void;
  getDescription(): string;
}

// Receiver
class Database {
  private data: Map<string, any> = new Map();

  insert(key: string, value: any): void {
    this.data.set(key, value);
    console.log(`Inserted: ${key} = ${value}`);
  }

  update(key: string, value: any): void {
    if (this.data.has(key)) {
      this.data.set(key, value);
      console.log(`Updated: ${key} = ${value}`);
    } else {
      throw new Error(`Key ${key} not found`);
    }
  }

  delete(key: string): void {
    if (this.data.has(key)) {
      this.data.delete(key);
      console.log(`Deleted: ${key}`);
    } else {
      throw new Error(`Key ${key} not found`);
    }
  }

  get(key: string): any {
    return this.data.get(key);
  }
}

// Concrete Commands
class InsertCommand implements Command {
  constructor(
    private database: Database,
    private key: string,
    private value: any
  ) {}

  execute(): void {
    this.database.insert(this.key, this.value);
  }

  getDescription(): string {
    return `INSERT ${this.key} = ${this.value}`;
  }
}

class UpdateCommand implements Command {
  constructor(
    private database: Database,
    private key: string,
    private value: any
  ) {}

  execute(): void {
    this.database.update(this.key, this.value);
  }

  getDescription(): string {
    return `UPDATE ${this.key} = ${this.value}`;
  }
}

class DeleteCommand implements Command {
  constructor(
    private database: Database,
    private key: string
  ) {}

  execute(): void {
    this.database.delete(this.key);
  }

  getDescription(): string {
    return `DELETE ${this.key}`;
  }
}

// Command Queue
class CommandQueue {
  private queue: Command[] = [];
  private isProcessing: boolean = false;

  enqueue(command: Command): void {
    this.queue.push(command);
    console.log(`Command queued: ${command.getDescription()}`);
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const command = this.queue.shift()!;
      try {
        command.execute();
        await this.delay(100); // Simulate async processing
      } catch (error) {
        console.error(`Error executing command: ${error}`);
      }
    }

    this.isProcessing = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}

// Command Logger
class CommandLogger {
  private log: string[] = [];

  logCommand(command: Command): void {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${command.getDescription()}`;
    this.log.push(entry);
    console.log(`Logged: ${entry}`);
  }

  getLog(): string[] {
    return [...this.log];
  }

  saveLog(): void {
    const logContent = this.log.join('\n');
    console.log('=== Command Log ===');
    console.log(logContent);
    // In real implementation, save to file
  }
}

// Invoker with Queue and Logger
class CommandInvoker {
  constructor(
    private queue: CommandQueue,
    private logger: CommandLogger
  ) {}

  execute(command: Command): void {
    this.logger.logCommand(command);
    this.queue.enqueue(command);
  }

  executeImmediate(command: Command): void {
    this.logger.logCommand(command);
    command.execute();
  }
}

// Usage
const database = new Database();
const queue = new CommandQueue();
const logger = new CommandLogger();
const invoker = new CommandInvoker(queue, logger);

// Queue commands
invoker.execute(new InsertCommand(database, 'user1', { name: 'John', age: 30 }));
invoker.execute(new InsertCommand(database, 'user2', { name: 'Jane', age: 25 }));
invoker.execute(new UpdateCommand(database, 'user1', { name: 'John Doe', age: 31 }));
invoker.execute(new DeleteCommand(database, 'user2'));

// Execute immediate command
invoker.executeImmediate(new InsertCommand(database, 'user3', { name: 'Bob', age: 35 }));

// Save log
setTimeout(() => {
  logger.saveLog();
}, 1000);
```

### Example 5: Command Pattern for Transaction System

```typescript
// Command Interface
interface Transaction {
  execute(): void;
  rollback(): void;
  getDescription(): string;
}

// Receiver
class BankAccount {
  private balance: number = 0;
  private transactions: string[] = [];

  deposit(amount: number): void {
    if (amount <= 0) {
      throw new Error('Deposit amount must be positive');
    }
    this.balance += amount;
    this.transactions.push(`Deposited $${amount}`);
    console.log(`Deposited $${amount}. Balance: $${this.balance}`);
  }

  withdraw(amount: number): void {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be positive');
    }
    if (this.balance < amount) {
      throw new Error('Insufficient funds');
    }
    this.balance -= amount;
    this.transactions.push(`Withdrew $${amount}`);
    console.log(`Withdrew $${amount}. Balance: $${this.balance}`);
  }

  getBalance(): number {
    return this.balance;
  }

  getTransactions(): string[] {
    return [...this.transactions];
  }
}

// Concrete Commands
class DepositTransaction implements Transaction {
  constructor(
    private account: BankAccount,
    private amount: number
  ) {}

  execute(): void {
    this.account.deposit(this.amount);
  }

  rollback(): void {
    this.account.withdraw(this.amount);
    console.log(`Rolled back deposit of $${this.amount}`);
  }

  getDescription(): string {
    return `Deposit $${this.amount}`;
  }
}

class WithdrawTransaction implements Transaction {
  constructor(
    private account: BankAccount,
    private amount: number
  ) {}

  execute(): void {
    this.account.withdraw(this.amount);
  }

  rollback(): void {
    this.account.deposit(this.amount);
    console.log(`Rolled back withdrawal of $${this.amount}`);
  }

  getDescription(): string {
    return `Withdraw $${this.amount}`;
  }
}

// Transaction Manager
class TransactionManager {
  private transactions: Transaction[] = [];
  private executedTransactions: Transaction[] = [];

  addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction);
  }

  executeAll(): void {
    console.log('Executing all transactions...');
    try {
      for (const transaction of this.transactions) {
        transaction.execute();
        this.executedTransactions.push(transaction);
      }
      this.transactions = [];
      console.log('All transactions executed successfully');
    } catch (error) {
      console.error(`Transaction failed: ${error}`);
      this.rollbackAll();
      throw error;
    }
  }

  rollbackAll(): void {
    console.log('Rolling back all transactions...');
    // Rollback in reverse order
    for (let i = this.executedTransactions.length - 1; i >= 0; i--) {
      this.executedTransactions[i].rollback();
    }
    this.executedTransactions = [];
  }

  getPendingTransactions(): string[] {
    return this.transactions.map(t => t.getDescription());
  }
}

// Usage
const account = new BankAccount();
const manager = new TransactionManager();

// Add transactions
manager.addTransaction(new DepositTransaction(account, 1000));
manager.addTransaction(new WithdrawTransaction(account, 200));
manager.addTransaction(new DepositTransaction(account, 500));
manager.addTransaction(new WithdrawTransaction(account, 300));

console.log('Pending transactions:', manager.getPendingTransactions());

// Execute all
manager.executeAll();
console.log(`Final balance: $${account.getBalance()}`);

// Test rollback
const account2 = new BankAccount();
const manager2 = new TransactionManager();

manager2.addTransaction(new DepositTransaction(account2, 1000));
manager2.addTransaction(new WithdrawTransaction(account2, 200));
manager2.addTransaction(new WithdrawTransaction(account2, 1000)); // This will fail

try {
  manager2.executeAll();
} catch (error) {
  console.log('Transaction failed, all rolled back');
  console.log(`Balance after rollback: $${account2.getBalance()}`);
}
```

---

## 🔄 Command vs Strategy Pattern

### Key Differences

| Aspect | Command Pattern | Strategy Pattern |
|-------|----------------|------------------|
| **Purpose** | Encapsulate requests as objects | Encapsulate algorithms |
| **Focus** | Request/action encapsulation | Algorithm selection |
| **Undo/Redo** | Supports undo/redo | No undo/redo |
| **Queuing** | Can be queued and logged | Usually immediate execution |
| **State** | Commands can store state | Strategies are often stateless |
| **When to Use** | Need undo, queuing, logging | Need algorithm selection |
| **Relationship** | Command knows receiver | Strategy is used by context |

### Command vs Strategy - When to Use Which

**Use Command When:**
- You need undo/redo functionality
- You need to queue operations
- You need to log operations
- You need to parameterize objects with operations
- You need macro commands

**Use Strategy When:**
- You need to select algorithms at runtime
- Algorithms are interchangeable
- You don't need undo/redo
- Operations are immediate

---

## ⚠️ Common Pitfalls and Best Practices

### Common Pitfalls

1. **Over-Engineering Simple Operations**
   - Using Command pattern for simple method calls
   - Adds unnecessary complexity
   - Use only when you need undo, queuing, or logging

2. **Storing Too Much State in Commands**
   - Commands can become bloated
   - Store only what's needed for undo
   - Consider Memento pattern for complex state

3. **Circular Dependencies**
   - Commands holding references to receivers
   - Receivers holding references to commands
   - Use dependency injection

4. **Not Handling Undo Properly**
   - Forgetting to implement undo
   - Undo not restoring exact state
   - Test undo functionality thoroughly

5. **Command Explosion**
   - Too many command classes
   - Consider parameterized commands
   - Use command factories

### Best Practices

1. **Use Command Interface Consistently**
   ```typescript
   interface Command {
     execute(): void;
     undo?(): void; // Optional for commands that don't need undo
     getDescription?(): string; // For logging
   }
   ```

2. **Implement Undo Carefully**
   ```typescript
   class DeleteCommand implements Command {
     private deletedItem: Item;
     
     execute(): void {
       this.deletedItem = this.receiver.delete(this.id);
       // Store what's needed for undo
     }
     
     undo(): void {
       this.receiver.restore(this.deletedItem);
       // Restore exact state
     }
   }
   ```

3. **Use Command Factories**
   ```typescript
   class CommandFactory {
     createInsertCommand(receiver: Receiver, data: any): Command {
       return new InsertCommand(receiver, data);
     }
     
     createDeleteCommand(receiver: Receiver, id: string): Command {
       return new DeleteCommand(receiver, id);
     }
   }
   ```

4. **Parameterize Commands When Possible**
   ```typescript
   class ParameterizedCommand implements Command {
     constructor(
       private receiver: Receiver,
       private action: string,
       private params: any
     ) {}
     
     execute(): void {
       this.receiver[this.action](this.params);
     }
   }
   ```

5. **Handle Command Failures**
   ```typescript
   class SafeCommand implements Command {
     execute(): void {
       try {
         this.doExecute();
       } catch (error) {
         this.handleError(error);
       }
     }
     
     protected abstract doExecute(): void;
     protected abstract handleError(error: Error): void;
   }
   ```

6. **Use Command History Wisely**
   ```typescript
   class CommandHistory {
     private history: Command[] = [];
     private maxSize: number = 100;
     
     add(command: Command): void {
       this.history.push(command);
       if (this.history.length > this.maxSize) {
         this.history.shift(); // Remove oldest
       }
     }
   }
   ```

---

## 🧪 Testing Command Pattern

### Testing Individual Commands

```typescript
describe('InsertCommand', () => {
  it('should insert text at position', () => {
    const editor = new TextEditor();
    const command = new InsertCommand(editor, 'Hello', 0);
    
    command.execute();
    expect(editor.getContent()).toBe('Hello');
  });

  it('should undo insertion', () => {
    const editor = new TextEditor();
    const command = new InsertCommand(editor, 'Hello', 0);
    
    command.execute();
    command.undo();
    expect(editor.getContent()).toBe('');
  });
});
```

### Testing Command Manager

```typescript
describe('CommandManager', () => {
  it('should execute and undo commands', () => {
    const editor = new TextEditor();
    const manager = new CommandManager();
    
    manager.executeCommand(new InsertCommand(editor, 'Hello', 0));
    expect(editor.getContent()).toBe('Hello');
    
    manager.undo();
    expect(editor.getContent()).toBe('');
  });

  it('should support redo', () => {
    const editor = new TextEditor();
    const manager = new CommandManager();
    
    manager.executeCommand(new InsertCommand(editor, 'Hello', 0));
    manager.undo();
    manager.redo();
    
    expect(editor.getContent()).toBe('Hello');
  });
});
```

### Testing Macro Commands

```typescript
describe('MacroCommand', () => {
  it('should execute all commands', () => {
    const light = new Light();
    const tv = new TV();
    const macro = new MacroCommand();
    
    macro.addCommand(new LightOnCommand(light));
    macro.addCommand(new TVOnCommand(tv));
    
    macro.execute();
    
    expect(light.getState()).toBe(true);
    expect(tv.getState()).toBe(true);
  });

  it('should undo all commands in reverse order', () => {
    const light = new Light();
    const tv = new TV();
    const macro = new MacroCommand();
    
    macro.addCommand(new LightOnCommand(light));
    macro.addCommand(new TVOnCommand(tv));
    
    macro.execute();
    macro.undo();
    
    expect(light.getState()).toBe(false);
    expect(tv.getState()).toBe(false);
  });
});
```

---

## 📊 Advantages and Disadvantages

### Advantages

✅ **Decouples Invoker from Receiver**
- Invoker doesn't know about receiver
- Commands can be passed around
- Easy to add new commands

✅ **Supports Undo/Redo**
- Commands can store state
- History can be maintained
- Enables undo/redo functionality

✅ **Supports Queuing and Logging**
- Commands can be queued
- Commands can be logged
- Enables audit trails

✅ **Supports Macro Commands**
- Commands can be composed
- Multiple operations as one
- Enables scripting

✅ **Parameterizes Objects with Operations**
- Objects can be parameterized
- Runtime operation selection
- Flexible system design

✅ **Follows Open/Closed Principle**
- Open for extension (new commands)
- Closed for modification (invoker)

### Disadvantages

❌ **Increased Number of Classes**
- Each command is a class
- Can lead to class explosion
- More files to maintain

❌ **Overhead for Simple Operations**
- Command objects add overhead
- May be overkill for simple calls
- Performance considerations

❌ **Complexity**
- More complex than direct calls
- Requires understanding of pattern
- Can be harder to debug

❌ **State Management**
- Commands need to store state for undo
- Can become memory intensive
- History management complexity

---

## 🔗 Related Patterns

### Command + Memento
Use Memento pattern to store complex state for undo operations.

```typescript
class CommandWithMemento implements Command {
  private memento: Memento;
  
  execute(): void {
    this.memento = this.receiver.createMemento();
    this.receiver.performAction();
  }
  
  undo(): void {
    this.receiver.restoreMemento(this.memento);
  }
}
```

### Command + Composite
Use Composite pattern to create macro commands.

```typescript
class MacroCommand extends CompositeCommand {
  // Can contain multiple commands
  // Executes all child commands
}
```

### Command + Prototype
Use Prototype pattern to clone commands.

```typescript
class CloneableCommand implements Command, Cloneable {
  clone(): Command {
    return Object.create(this);
  }
}
```

### Command + Chain of Responsibility
Use Chain of Responsibility to find appropriate command handler.

### Command + Strategy
Commands can use Strategy pattern for different execution strategies.

---

## 🎓 Summary

The **Command Pattern** is a powerful behavioral design pattern that:

1. **Encapsulates requests as objects** - Requests become first-class objects
2. **Supports undo/redo** - Commands can store state and reverse operations
3. **Enables queuing and logging** - Commands can be queued, logged, and audited
4. **Decouples invoker from receiver** - Invoker doesn't know about receiver
5. **Supports macro commands** - Commands can be composed into larger operations
6. **Parameterizes objects** - Objects can be parameterized with different operations

**Key Takeaways:**
- Use Command when you need undo/redo functionality
- Use Command when you need to queue or log operations
- Commands should store minimal state needed for undo
- Consider command factories to reduce class explosion
- Macro commands enable powerful composition

**When to Use:**
- Need undo/redo operations
- Need to queue operations
- Need to log operations
- Need to parameterize objects with operations
- Need macro commands

**When NOT to Use:**
- Simple operations that don't need undo
- Operations are always immediate
- Performance is critical
- No need for queuing or logging

**Real-World Applications:**
- Text editors (undo/redo)
- Drawing applications (history)
- Transaction systems (rollback)
- Job queues
- Remote procedure calls
- Menu systems
- Macro recording

---

## 📚 Additional Resources

### Books
- **Design Patterns: Elements of Reusable Object-Oriented Software** (Gang of Four) - Original Command pattern description
- **Head First Design Patterns** - Command pattern with practical examples
- **Refactoring: Improving the Design of Existing Code** (Martin Fowler) - Command pattern in refactoring context

### Online Resources
- [Refactoring Guru - Command Pattern](https://refactoring.guru/design-patterns/command)
- [SourceMaking - Command Pattern](https://sourcemaking.com/design_patterns/command)
- [Wikipedia - Command Pattern](https://en.wikipedia.org/wiki/Command_pattern)

### Related Topics
- Undo/Redo Systems
- Transaction Management
- Job Queues
- Event Sourcing
- CQRS (Command Query Responsibility Segregation)
- Macro Recording
- Remote Procedure Calls (RPC)
- Action Pattern
- Transaction Pattern

---

**Next Steps:**
- Practice implementing Command pattern with undo/redo
- Experiment with command queuing systems
- Try creating macro commands
- Consider learning about Memento Pattern (for complex undo)
- Explore event sourcing patterns

