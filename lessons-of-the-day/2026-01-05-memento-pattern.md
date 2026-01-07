# Memento Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Memento pattern definition and intent
- [ ] Learn when to use Memento vs other behavioral patterns
- [ ] Master the Originator-Caretaker-Memento relationship
- [ ] Recognize real-world applications (undo/redo, save/load, state snapshots)
- [ ] Understand Memento vs Command pattern differences
- [ ] Practice implementing Memento in different scenarios
- [ ] Learn common pitfalls and best practices
- [ ] Explore modern variations (narrow vs wide interfaces, incremental mementos)
- [ ] Understand encapsulation trade-offs and when to avoid it

---

## 🎯 Definition

**Memento Pattern** is a behavioral design pattern that lets you save and restore the previous state of an object without revealing the details of its implementation.

**Intent (GoF):**
- Without violating encapsulation, capture and externalize an object's internal state
- Allow the object to be restored to this state later
- Also known as: **Token Pattern**, **Snapshot Pattern**

**Key Principle:**
> "Save state without breaking encapsulation" - The memento pattern allows you to save snapshots of an object's state without exposing its internal structure. The originator can save its state to a memento and restore it later, while the caretaker manages the mementos without knowing their internal structure.

---

## 🏗️ Structure

### UML Diagram Concept

```
Originator
├── state: State
├── createMemento(): Memento
│   └── return new Memento(this.state)
└── restore(memento: Memento): void
    └── this.state = memento.getState()

Memento
├── state: State (private)
├── constructor(state: State)
│   └── this.state = state
└── getState(): State
    └── return this.state

Caretaker
├── mementos: Memento[]
├── save(originator: Originator): void
│   └── mementos.push(originator.createMemento())
└── restore(originator: Originator, index: number): void
    └── originator.restore(mementos[index])
```

### Participants

1. **Originator** - The object whose state needs to be saved. Creates a memento containing a snapshot of its current state and uses the memento to restore its state.
2. **Memento** - Stores the internal state of the Originator. Protects against access by objects other than the originator.
3. **Caretaker** - Manages mementos but never operates on or examines the contents of a memento. Responsible for keeping track of the memento history.

### Key Concepts

**Encapsulation Protection:**
- Memento hides originator's internal state
- Only originator can access memento's state
- Caretaker stores mementos without knowing their structure
- Prevents breaking encapsulation

**State Snapshot:**
- Captures complete state at a point in time
- Can be stored and restored later
- Enables undo/redo functionality
- Supports save/load operations

**Separation of Concerns:**
- Originator manages its own state
- Memento stores state snapshot
- Caretaker manages memento history
- Clear responsibilities

**Narrow vs Wide Interface:**
- Narrow interface: Only originator can access state
- Wide interface: Caretaker can access state (breaks encapsulation)
- Trade-off between encapsulation and flexibility

**Memory Management:**
- Mementos can consume significant memory
- Need strategy for managing memento history
- Can implement incremental mementos
- May need to limit history size

---

## 💡 When to Use

### Use Memento When:

✅ **You need to implement undo/redo functionality**
- Example: Text editors, drawing applications, command processors
- Example: Game state management
- Example: Configuration management

✅ **You need to save and restore object state**
- Example: Save/load game functionality
- Example: Checkpoint/restore system state
- Example: Transaction rollback

✅ **You want to capture state without breaking encapsulation**
- Example: When internal state is complex
- Example: When you don't want to expose implementation details
- Example: When state structure might change

✅ **You need to provide snapshots of object state**
- Example: Debugging and inspection tools
- Example: Audit trails
- Example: State comparison

✅ **Direct access to state would violate encapsulation**
- Example: When state contains private/protected fields
- Example: When state structure is implementation detail
- Example: When you want to maintain abstraction

### Don't Use When:

❌ **State is simple and can be copied directly** - Direct copying is simpler
❌ **Memory usage is a critical concern** - Mementos can consume significant memory
❌ **State changes frequently** - Creating mementos on every change is expensive
❌ **You need to access state from outside originator** - Breaks encapsulation
❌ **State is too large to snapshot efficiently** - Consider incremental mementos or alternatives

---

## 🔨 Implementation Examples

### Example 1: Basic Memento Pattern (Text Editor)

```typescript
// Memento - Stores state snapshot
class TextMemento {
  private state: string;

  constructor(state: string) {
    this.state = state;
  }

  getState(): string {
    return this.state;
  }
}

// Originator - Object whose state is saved
class TextEditor {
  private content: string = '';

  setContent(content: string): void {
    this.content = content;
    console.log(`Content set to: "${this.content}"`);
  }

  getContent(): string {
    return this.content;
  }

  // Create memento with current state
  createMemento(): TextMemento {
    console.log('Creating memento...');
    return new TextMemento(this.content);
  }

  // Restore state from memento
  restore(memento: TextMemento): void {
    this.content = memento.getState();
    console.log(`Content restored to: "${this.content}"`);
  }
}

// Caretaker - Manages memento history
class EditorHistory {
  private history: TextMemento[] = [];
  private currentIndex: number = -1;

  save(editor: TextEditor): void {
    // Remove any "future" history if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    const memento = editor.createMemento();
    this.history.push(memento);
    this.currentIndex = this.history.length - 1;
    console.log(`State saved. History size: ${this.history.length}`);
  }

  undo(editor: TextEditor): boolean {
    if (this.currentIndex <= 0) {
      console.log('Nothing to undo');
      return false;
    }

    this.currentIndex--;
    editor.restore(this.history[this.currentIndex]);
    return true;
  }

  redo(editor: TextEditor): boolean {
    if (this.currentIndex >= this.history.length - 1) {
      console.log('Nothing to redo');
      return false;
    }

    this.currentIndex++;
    editor.restore(this.history[this.currentIndex]);
    return true;
  }

  getHistorySize(): number {
    return this.history.length;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }
}

// Usage
const editor = new TextEditor();
const history = new EditorHistory();

console.log('=== Text Editor with Undo/Redo ===\n');

editor.setContent('Hello');
history.save(editor);

editor.setContent('Hello World');
history.save(editor);

editor.setContent('Hello World!');
history.save(editor);

console.log('\n--- Undo Operations ---');
history.undo(editor);
history.undo(editor);

console.log('\n--- Redo Operations ---');
history.redo(editor);
```

### Example 2: Game State Memento

```typescript
// Game State Interface
interface GameState {
  level: number;
  score: number;
  health: number;
  inventory: string[];
  position: { x: number; y: number };
}

// Memento - Stores game state
class GameMemento {
  private state: GameState;

  constructor(state: GameState) {
    // Deep copy to prevent external modifications
    this.state = {
      level: state.level,
      score: state.score,
      health: state.health,
      inventory: [...state.inventory],
      position: { ...state.position }
    };
  }

  getState(): GameState {
    // Return deep copy to prevent modifications
    return {
      level: this.state.level,
      score: this.state.score,
      health: this.state.health,
      inventory: [...this.state.inventory],
      position: { ...this.state.position }
    };
  }
}

// Originator - Game whose state is saved
class Game {
  private state: GameState;

  constructor() {
    this.state = {
      level: 1,
      score: 0,
      health: 100,
      inventory: [],
      position: { x: 0, y: 0 }
    };
  }

  // Game actions
  advanceLevel(): void {
    this.state.level++;
    this.state.score += 100;
    console.log(`Advanced to level ${this.state.level}`);
  }

  takeDamage(amount: number): void {
    this.state.health -= amount;
    console.log(`Took ${amount} damage. Health: ${this.state.health}`);
  }

  addItem(item: string): void {
    this.state.inventory.push(item);
    console.log(`Added ${item} to inventory`);
  }

  move(x: number, y: number): void {
    this.state.position.x = x;
    this.state.position.y = y;
    console.log(`Moved to position (${x}, ${y})`);
  }

  getState(): GameState {
    return { ...this.state };
  }

  // Memento operations
  createMemento(): GameMemento {
    console.log('Creating game save...');
    return new GameMemento(this.state);
  }

  restore(memento: GameMemento): void {
    this.state = memento.getState();
    console.log('Game state restored');
    this.displayState();
  }

  displayState(): void {
    console.log(`Level: ${this.state.level}, Score: ${this.state.score}, Health: ${this.state.health}`);
    console.log(`Inventory: [${this.state.inventory.join(', ')}]`);
    console.log(`Position: (${this.state.position.x}, ${this.state.position.y})`);
  }
}

// Caretaker - Manages game saves
class SaveManager {
  private saves: Map<string, GameMemento> = new Map();
  private autoSave: GameMemento | null = null;

  saveGame(game: Game, saveName: string): void {
    const memento = game.createMemento();
    this.saves.set(saveName, memento);
    console.log(`Game saved as: ${saveName}`);
  }

  loadGame(game: Game, saveName: string): boolean {
    const memento = this.saves.get(saveName);
    if (memento) {
      game.restore(memento);
      return true;
    }
    console.log(`Save "${saveName}" not found`);
    return false;
  }

  autoSaveGame(game: Game): void {
    this.autoSave = game.createMemento();
    console.log('Auto-save created');
  }

  loadAutoSave(game: Game): boolean {
    if (this.autoSave) {
      game.restore(this.autoSave);
      return true;
    }
    console.log('No auto-save available');
    return false;
  }

  listSaves(): string[] {
    return Array.from(this.saves.keys());
  }

  deleteSave(saveName: string): boolean {
    return this.saves.delete(saveName);
  }
}

// Usage
const game = new Game();
const saveManager = new SaveManager();

console.log('=== Game State Management ===\n');

game.advanceLevel();
game.addItem('Sword');
game.move(10, 20);
saveManager.saveGame(game, 'save1');

game.advanceLevel();
game.takeDamage(20);
game.addItem('Shield');
saveManager.saveGame(game, 'save2');

game.advanceLevel();
game.takeDamage(30);
saveManager.autoSaveGame(game);

console.log('\n--- Loading Save 1 ---');
saveManager.loadGame(game, 'save1');

console.log('\n--- Loading Save 2 ---');
saveManager.loadGame(game, 'save2');

console.log('\n--- Loading Auto-save ---');
saveManager.loadAutoSave(game);

console.log('\n--- Available Saves ---');
console.log(saveManager.listSaves());
```

### Example 3: Form State Memento

```typescript
// Form State
interface FormState {
  fields: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Memento
class FormMemento {
  private state: FormState;

  constructor(state: FormState) {
    // Deep clone
    this.state = {
      fields: { ...state.fields },
      errors: { ...state.errors },
      touched: { ...state.touched }
    };
  }

  getState(): FormState {
    return {
      fields: { ...this.state.fields },
      errors: { ...this.state.errors },
      touched: { ...this.state.touched }
    };
  }
}

// Originator - Form
class Form {
  private state: FormState;

  constructor() {
    this.state = {
      fields: {},
      errors: {},
      touched: {}
    };
  }

  setField(name: string, value: any): void {
    this.state.fields[name] = value;
    this.state.touched[name] = true;
    this.validateField(name);
  }

  private validateField(name: string): void {
    const value = this.state.fields[name];
    
    if (!value) {
      this.state.errors[name] = `${name} is required`;
    } else {
      delete this.state.errors[name];
    }
  }

  getField(name: string): any {
    return this.state.fields[name];
  }

  getErrors(): Record<string, string> {
    return { ...this.state.errors };
  }

  isValid(): boolean {
    return Object.keys(this.state.errors).length === 0;
  }

  createMemento(): FormMemento {
    return new FormMemento(this.state);
  }

  restore(memento: FormMemento): void {
    this.state = memento.getState();
    console.log('Form state restored');
  }

  reset(): void {
    this.state = {
      fields: {},
      errors: {},
      touched: {}
    };
  }
}

// Caretaker - Form History
class FormHistory {
  private history: FormMemento[] = [];
  private maxHistory: number = 10;

  save(form: Form): void {
    const memento = form.createMemento();
    this.history.push(memento);
    
    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    console.log(`Form state saved (${this.history.length}/${this.maxHistory})`);
  }

  restorePrevious(form: Form): boolean {
    if (this.history.length > 0) {
      const memento = this.history.pop();
      form.restore(memento!);
      return true;
    }
    console.log('No previous state to restore');
    return false;
  }

  clear(): void {
    this.history = [];
    console.log('Form history cleared');
  }
}

// Usage
const form = new Form();
const history = new FormHistory();

console.log('=== Form State Management ===\n');

form.setField('name', 'John');
form.setField('email', 'john@example.com');
history.save(form);

console.log('Fields:', form.getField('name'), form.getField('email'));
console.log('Valid:', form.isValid());

form.setField('name', '');
history.save(form);

console.log('\nAfter clearing name:');
console.log('Errors:', form.getErrors());
console.log('Valid:', form.isValid());

console.log('\n=== Restoring Previous State ===');
history.restorePrevious(form);
console.log('Fields:', form.getField('name'), form.getField('email'));
console.log('Valid:', form.isValid());
```

### Example 4: Configuration Memento

```typescript
// Configuration State
interface ConfigurationState {
  theme: 'light' | 'dark';
  language: string;
  fontSize: number;
  notifications: boolean;
  autoSave: boolean;
  settings: Record<string, any>;
}

// Memento
class ConfigurationMemento {
  private state: ConfigurationState;

  constructor(state: ConfigurationState) {
    this.state = JSON.parse(JSON.stringify(state)); // Deep clone
  }

  getState(): ConfigurationState {
    return JSON.parse(JSON.stringify(this.state)); // Return deep copy
  }
}

// Originator
class ApplicationConfiguration {
  private state: ConfigurationState;

  constructor() {
    this.state = {
      theme: 'light',
      language: 'en',
      fontSize: 14,
      notifications: true,
      autoSave: true,
      settings: {}
    };
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.state.theme = theme;
    console.log(`Theme changed to: ${theme}`);
  }

  setLanguage(language: string): void {
    this.state.language = language;
    console.log(`Language changed to: ${language}`);
  }

  setFontSize(size: number): void {
    this.state.fontSize = size;
    console.log(`Font size changed to: ${size}`);
  }

  setNotifications(enabled: boolean): void {
    this.state.notifications = enabled;
    console.log(`Notifications ${enabled ? 'enabled' : 'disabled'}`);
  }

  setAutoSave(enabled: boolean): void {
    this.state.autoSave = enabled;
    console.log(`Auto-save ${enabled ? 'enabled' : 'disabled'}`);
  }

  setSetting(key: string, value: any): void {
    this.state.settings[key] = value;
    console.log(`Setting ${key} = ${value}`);
  }

  getState(): ConfigurationState {
    return JSON.parse(JSON.stringify(this.state));
  }

  createMemento(): ConfigurationMemento {
    return new ConfigurationMemento(this.state);
  }

  restore(memento: ConfigurationMemento): void {
    this.state = memento.getState();
    console.log('Configuration restored');
    this.display();
  }

  display(): void {
    console.log('Current Configuration:');
    console.log(`  Theme: ${this.state.theme}`);
    console.log(`  Language: ${this.state.language}`);
    console.log(`  Font Size: ${this.state.fontSize}`);
    console.log(`  Notifications: ${this.state.notifications}`);
    console.log(`  Auto-save: ${this.state.autoSave}`);
    console.log(`  Custom Settings:`, this.state.settings);
  }
}

// Caretaker
class ConfigurationManager {
  private snapshots: ConfigurationMemento[] = [];
  private maxHistory: number = 10;

  saveSnapshot(config: ApplicationConfiguration): void {
    const memento = config.createMemento();
    
    // Limit history size
    if (this.snapshots.length >= this.maxHistory) {
      this.snapshots.shift();
    }
    
    this.snapshots.push(memento);
    console.log(`Snapshot saved. History: ${this.snapshots.length}/${this.maxHistory}`);
  }

  restoreSnapshot(config: ApplicationConfiguration, index: number): boolean {
    if (index < 0 || index >= this.snapshots.length) {
      console.log(`Invalid snapshot index: ${index}`);
      return false;
    }

    config.restore(this.snapshots[index]);
    return true;
  }

  restoreLatest(config: ApplicationConfiguration): boolean {
    if (this.snapshots.length === 0) {
      console.log('No snapshots available');
      return false;
    }

    const latest = this.snapshots[this.snapshots.length - 1];
    config.restore(latest);
    return true;
  }

  getSnapshotCount(): number {
    return this.snapshots.length;
  }

  clearHistory(): void {
    this.snapshots = [];
    console.log('Snapshot history cleared');
  }
}

// Usage
const config = new ApplicationConfiguration();
const manager = new ConfigurationManager();

console.log('=== Configuration Management ===\n');

config.display();
manager.saveSnapshot(config);

console.log('\n--- Making Changes ---');
config.setTheme('dark');
config.setLanguage('fr');
config.setFontSize(16);
config.setSetting('sidebar', true);
config.display();

manager.saveSnapshot(config);

console.log('\n--- More Changes ---');
config.setNotifications(false);
config.setAutoSave(false);
config.setSetting('sidebar', false);
config.display();

manager.saveSnapshot(config);

console.log('\n--- Restoring Previous Snapshot ---');
manager.restoreSnapshot(config, 1);

console.log('\n--- Restoring Latest ---');
manager.restoreLatest(config);
```

### Example 5: Drawing Application Memento

```typescript
// Shape Interface
interface Shape {
  type: string;
  x: number;
  y: number;
  color: string;
  [key: string]: any;
}

// Drawing State
interface DrawingState {
  shapes: Shape[];
  backgroundColor: string;
  selectedShape: number | null;
}

// Memento
class DrawingMemento {
  private state: DrawingState;

  constructor(state: DrawingState) {
    this.state = {
      shapes: state.shapes.map(shape => ({ ...shape })),
      backgroundColor: state.backgroundColor,
      selectedShape: state.selectedShape
    };
  }

  getState(): DrawingState {
    return {
      shapes: this.state.shapes.map(shape => ({ ...shape })),
      backgroundColor: this.state.backgroundColor,
      selectedShape: this.state.selectedShape
    };
  }
}

// Originator
class DrawingCanvas {
  private state: DrawingState;

  constructor() {
    this.state = {
      shapes: [],
      backgroundColor: 'white',
      selectedShape: null
    };
  }

  setBackgroundColor(color: string): void {
    this.state.backgroundColor = color;
    console.log(`Background color set to: ${color}`);
  }

  addShape(shape: Shape): void {
    this.state.shapes.push({ ...shape });
    console.log(`Added ${shape.type} at (${shape.x}, ${shape.y})`);
  }

  removeShape(index: number): void {
    if (index >= 0 && index < this.state.shapes.length) {
      const shape = this.state.shapes.splice(index, 1)[0];
      console.log(`Removed ${shape.type} at index ${index}`);
    }
  }

  selectShape(index: number): void {
    if (index >= 0 && index < this.state.shapes.length) {
      this.state.selectedShape = index;
      console.log(`Selected shape at index ${index}`);
    }
  }

  moveShape(index: number, x: number, y: number): void {
    if (index >= 0 && index < this.state.shapes.length) {
      this.state.shapes[index].x = x;
      this.state.shapes[index].y = y;
      console.log(`Moved shape ${index} to (${x}, ${y})`);
    }
  }

  getState(): DrawingState {
    return {
      shapes: this.state.shapes.map(shape => ({ ...shape })),
      backgroundColor: this.state.backgroundColor,
      selectedShape: this.state.selectedShape
    };
  }

  createMemento(): DrawingMemento {
    return new DrawingMemento(this.state);
  }

  restore(memento: DrawingMemento): void {
    this.state = memento.getState();
    console.log('Drawing restored');
    this.display();
  }

  display(): void {
    console.log(`Background: ${this.state.backgroundColor}`);
    console.log(`Shapes: ${this.state.shapes.length}`);
    this.state.shapes.forEach((shape, index) => {
      console.log(`  ${index}: ${shape.type} at (${shape.x}, ${shape.y}) - ${shape.color}`);
    });
    if (this.state.selectedShape !== null) {
      console.log(`Selected: ${this.state.selectedShape}`);
    }
  }
}

// Caretaker
class DrawingHistory {
  private history: DrawingMemento[] = [];
  private currentIndex: number = -1;
  private maxHistory: number = 50;

  save(canvas: DrawingCanvas): void {
    // Remove future history if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    const memento = canvas.createMemento();
    this.history.push(memento);
    this.currentIndex = this.history.length - 1;

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }

    console.log(`State saved (${this.currentIndex + 1}/${this.history.length})`);
  }

  undo(canvas: DrawingCanvas): boolean {
    if (this.currentIndex <= 0) {
      console.log('Nothing to undo');
      return false;
    }

    this.currentIndex--;
    canvas.restore(this.history[this.currentIndex]);
    return true;
  }

  redo(canvas: DrawingCanvas): boolean {
    if (this.currentIndex >= this.history.length - 1) {
      console.log('Nothing to redo');
      return false;
    }

    this.currentIndex++;
    canvas.restore(this.history[this.currentIndex]);
    return true;
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
    console.log('History cleared');
  }
}

// Usage
const canvas = new DrawingCanvas();
const history = new DrawingHistory();

console.log('=== Drawing Application ===\n');

canvas.setBackgroundColor('lightblue');
history.save(canvas);

canvas.addShape({ type: 'circle', x: 10, y: 10, color: 'red', radius: 5 });
history.save(canvas);

canvas.addShape({ type: 'rectangle', x: 50, y: 50, color: 'blue', width: 20, height: 15 });
history.save(canvas);

canvas.addShape({ type: 'line', x: 0, y: 0, color: 'green', x2: 100, y2: 100 });
history.save(canvas);

console.log('\n--- Undo ---');
history.undo(canvas);

console.log('\n--- Undo Again ---');
history.undo(canvas);

console.log('\n--- Redo ---');
history.redo(canvas);

canvas.moveShape(0, 15, 15);
history.save(canvas);

console.log('\n--- Final State ---');
canvas.display();
```

### Example 6: Transaction Memento (Rollback Support)

```typescript
// Transaction State
interface TransactionState {
  balance: number;
  transactions: Array<{
    id: string;
    type: 'debit' | 'credit';
    amount: number;
    timestamp: Date;
    description: string;
  }>;
}

// Memento
class TransactionMemento {
  private state: TransactionState;

  constructor(state: TransactionState) {
    this.state = {
      balance: state.balance,
      transactions: state.transactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        timestamp: new Date(tx.timestamp),
        description: tx.description
      }))
    };
  }

  getState(): TransactionState {
    return {
      balance: this.state.balance,
      transactions: this.state.transactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        timestamp: new Date(tx.timestamp),
        description: tx.description
      }))
    };
  }
}

// Originator
class BankAccount {
  private state: TransactionState;

  constructor(initialBalance: number = 0) {
    this.state = {
      balance: initialBalance,
      transactions: []
    };
  }

  deposit(amount: number, description: string): void {
    const transaction = {
      id: this.generateId(),
      type: 'credit' as const,
      amount,
      timestamp: new Date(),
      description
    };

    this.state.transactions.push(transaction);
    this.state.balance += amount;
    console.log(`Deposited ${amount}. New balance: ${this.state.balance}`);
  }

  withdraw(amount: number, description: string): boolean {
    if (this.state.balance < amount) {
      console.log(`Insufficient funds. Balance: ${this.state.balance}`);
      return false;
    }

    const transaction = {
      id: this.generateId(),
      type: 'debit' as const,
      amount,
      timestamp: new Date(),
      description
    };

    this.state.transactions.push(transaction);
    this.state.balance -= amount;
    console.log(`Withdrew ${amount}. New balance: ${this.state.balance}`);
    return true;
  }

  getBalance(): number {
    return this.state.balance;
  }

  getTransactions(): TransactionState['transactions'] {
    return [...this.state.transactions];
  }

  createMemento(): TransactionMemento {
    return new TransactionMemento(this.state);
  }

  restore(memento: TransactionMemento): void {
    this.state = memento.getState();
    console.log('Account state restored');
    this.display();
  }

  private generateId(): string {
    return `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  display(): void {
    console.log(`\nBalance: ${this.state.balance}`);
    console.log(`Transactions: ${this.state.transactions.length}`);
    this.state.transactions.forEach(tx => {
      const sign = tx.type === 'credit' ? '+' : '-';
      console.log(`  ${sign}${tx.amount} - ${tx.description} (${tx.id})`);
    });
  }
}

// Caretaker
class TransactionManager {
  private checkpoints: Map<string, TransactionMemento> = new Map();
  private undoStack: TransactionMemento[] = [];
  private redoStack: TransactionMemento[] = [];

  createCheckpoint(account: BankAccount, name: string): void {
    const memento = account.createMemento();
    this.checkpoints.set(name, memento);
    console.log(`Checkpoint "${name}" created`);
  }

  restoreCheckpoint(account: BankAccount, name: string): boolean {
    const memento = this.checkpoints.get(name);
    if (memento) {
      account.restore(memento);
      return true;
    }
    console.log(`Checkpoint "${name}" not found`);
    return false;
  }

  saveState(account: BankAccount): void {
    const memento = account.createMemento();
    this.undoStack.push(memento);
    this.redoStack = []; // Clear redo stack on new action
    console.log('State saved for undo');
  }

  undo(account: BankAccount): boolean {
    if (this.undoStack.length <= 1) {
      console.log('Nothing to undo');
      return false;
    }

    // Current state goes to redo stack
    const current = this.undoStack.pop()!;
    this.redoStack.push(current);

    // Restore previous state
    const previous = this.undoStack[this.undoStack.length - 1];
    account.restore(previous);
    return true;
  }

  redo(account: BankAccount): boolean {
    if (this.redoStack.length === 0) {
      console.log('Nothing to redo');
      return false;
    }

    const next = this.redoStack.pop()!;
    this.undoStack.push(next);
    account.restore(next);
    return true;
  }

  listCheckpoints(): string[] {
    return Array.from(this.checkpoints.keys());
  }
}

// Usage
const account = new BankAccount(1000);
const manager = new TransactionManager();

console.log('=== Bank Account Transaction Management ===\n');

manager.saveState(account);
account.deposit(500, 'Salary');
manager.saveState(account);

manager.createCheckpoint(account, 'after-salary');

account.withdraw(200, 'Rent');
manager.saveState(account);

account.withdraw(150, 'Groceries');
manager.saveState(account);

account.deposit(100, 'Refund');
manager.saveState(account);

console.log('\n--- Undo Last Transaction ---');
manager.undo(account);

console.log('\n--- Undo Again ---');
manager.undo(account);

console.log('\n--- Redo ---');
manager.redo(account);

console.log('\n--- Restore Checkpoint ---');
manager.restoreCheckpoint(account, 'after-salary');

console.log('\n--- Available Checkpoints ---');
console.log(manager.listCheckpoints());
```

### Example 7: Incremental Memento (Memory Efficient)

```typescript
// Base State
interface DocumentState {
  content: string;
  cursorPosition: number;
  selection: { start: number; end: number } | null;
}

// Incremental Memento - Stores only changes
class IncrementalMemento {
  private baseState: DocumentState | null;
  private changes: Array<{
    type: 'insert' | 'delete' | 'move';
    position: number;
    data?: string;
    length?: number;
  }>;

  constructor(
    baseState: DocumentState | null,
    changes: IncrementalMemento['changes']
  ) {
    this.baseState = baseState ? { ...baseState } : null;
    this.changes = [...changes];
  }

  getBaseState(): DocumentState | null {
    return this.baseState ? { ...this.baseState } : null;
  }

  getChanges(): IncrementalMemento['changes'] {
    return [...this.changes];
  }
}

// Originator
class Document {
  private state: DocumentState;

  constructor() {
    this.state = {
      content: '',
      cursorPosition: 0,
      selection: null
    };
  }

  insert(text: string, position: number): void {
    const before = this.state.content.slice(0, position);
    const after = this.state.content.slice(position);
    this.state.content = before + text + after;
    this.state.cursorPosition = position + text.length;
    console.log(`Inserted "${text}" at position ${position}`);
  }

  delete(start: number, length: number): void {
    const before = this.state.content.slice(0, start);
    const after = this.state.content.slice(start + length);
    this.state.content = before + after;
    this.state.cursorPosition = start;
    console.log(`Deleted ${length} characters from position ${start}`);
  }

  setCursor(position: number): void {
    this.state.cursorPosition = position;
  }

  setSelection(start: number, end: number): void {
    this.state.selection = { start, end };
  }

  getContent(): string {
    return this.state.content;
  }

  getState(): DocumentState {
    return { ...this.state };
  }

  // Create incremental memento
  createIncrementalMemento(
    baseState: DocumentState | null,
    change: IncrementalMemento['changes'][0]
  ): IncrementalMemento {
    return new IncrementalMemento(baseState, [change]);
  }

  // Apply incremental memento
  applyIncrementalMemento(memento: IncrementalMemento): void {
    const baseState = memento.getBaseState();
    if (baseState) {
      this.state = { ...baseState };
    }

    const changes = memento.getChanges();
    changes.forEach(change => {
      switch (change.type) {
        case 'insert':
          if (change.data !== undefined) {
            this.insert(change.data, change.position);
          }
          break;
        case 'delete':
          if (change.length !== undefined) {
            this.delete(change.position, change.length);
          }
          break;
        case 'move':
          this.setCursor(change.position);
          break;
      }
    });

    console.log('Incremental memento applied');
  }

  // Create full memento (for checkpoints)
  createFullMemento(): DocumentMemento {
    return new DocumentMemento(this.state);
  }

  restore(memento: DocumentMemento): void {
    this.state = memento.getState();
    console.log('Document restored from full memento');
  }
}

// Full Memento (for checkpoints)
class DocumentMemento {
  private state: DocumentState;

  constructor(state: DocumentState) {
    this.state = { ...state };
  }

  getState(): DocumentState {
    return { ...this.state };
  }
}

// Caretaker with incremental mementos
class DocumentHistory {
  private checkpoints: DocumentMemento[] = [];
  private incrementalHistory: IncrementalMemento[] = [];
  private checkpointInterval: number = 10; // Create checkpoint every N changes
  private currentCheckpointIndex: number = -1;

  saveChange(
    document: Document,
    change: IncrementalMemento['changes'][0]
  ): void {
    const baseState = this.getBaseState();
    const memento = document.createIncrementalMemento(baseState, change);
    this.incrementalHistory.push(memento);

    // Create checkpoint periodically
    if (this.incrementalHistory.length % this.checkpointInterval === 0) {
      const fullMemento = document.createFullMemento();
      this.checkpoints.push(fullMemento);
      this.currentCheckpointIndex = this.checkpoints.length - 1;
      console.log(`Checkpoint created (${this.checkpoints.length} total)`);
    }

    console.log(`Change saved. History: ${this.incrementalHistory.length} changes`);
  }

  undo(document: Document): boolean {
    if (this.incrementalHistory.length === 0) {
      console.log('Nothing to undo');
      return false;
    }

    // Remove last change
    this.incrementalHistory.pop();

    // Restore to last checkpoint and replay changes
    if (this.currentCheckpointIndex >= 0) {
      document.restore(this.checkpoints[this.currentCheckpointIndex]);
    } else {
      // No checkpoint, restore to empty
      document.restore(new DocumentMemento({
        content: '',
        cursorPosition: 0,
        selection: null
      }));
    }

    // Replay remaining changes
    this.incrementalHistory.forEach(memento => {
      document.applyIncrementalMemento(memento);
    });

    return true;
  }

  private getBaseState(): DocumentState | null {
    if (this.currentCheckpointIndex >= 0) {
      return this.checkpoints[this.currentCheckpointIndex].getState();
    }
    return null;
  }

  getHistorySize(): number {
    return this.incrementalHistory.length;
  }

  getCheckpointCount(): number {
    return this.checkpoints.length;
  }
}

// Usage
const document = new Document();
const history = new DocumentHistory();

console.log('=== Incremental Memento Pattern ===\n');

document.insert('Hello', 0);
history.saveChange(document, { type: 'insert', position: 0, data: 'Hello' });

document.insert(' World', 5);
history.saveChange(document, { type: 'insert', position: 5, data: ' World' });

document.insert('!', 11);
history.saveChange(document, { type: 'insert', position: 11, data: '!' });

console.log(`\nContent: "${document.getContent()}"`);
console.log(`History: ${history.getHistorySize()} changes, ${history.getCheckpointCount()} checkpoints`);

console.log('\n--- Undo ---');
history.undo(document);
console.log(`Content: "${document.getContent()}"`);

console.log('\n--- Undo Again ---');
history.undo(document);
console.log(`Content: "${document.getContent()}"`);
```

---

## 🔄 Pattern Variations

### Variation 1: Narrow Interface (Encapsulation Preserved)

```typescript
// Narrow interface - only originator can access state
class NarrowMemento {
  private state: any;

  constructor(state: any) {
    this.state = state;
  }

  // Only originator can access (friend class pattern)
  getStateForOriginator(): any {
    return this.state;
  }
}

class Originator {
  createMemento(): NarrowMemento {
    return new NarrowMemento(this.state);
  }

  restore(memento: NarrowMemento): void {
    // Only originator can access state
    this.state = memento.getStateForOriginator();
  }
}
```

### Variation 2: Wide Interface (Encapsulation Broken)

```typescript
// Wide interface - caretaker can access state
class WideMemento {
  public state: any; // Public access

  constructor(state: any) {
    this.state = state;
  }
}

class Caretaker {
  inspect(memento: WideMemento): void {
    // Can directly access state (breaks encapsulation)
    console.log('State:', memento.state);
  }
}
```

### Variation 3: Memento with Metadata

```typescript
class MetadataMemento {
  private state: any;
  private timestamp: Date;
  private description: string;

  constructor(state: any, description: string) {
    this.state = state;
    this.timestamp = new Date();
    this.description = description;
  }

  getState(): any {
    return this.state;
  }

  getTimestamp(): Date {
    return this.timestamp;
  }

  getDescription(): string {
    return this.description;
  }
}
```

---

## 🔀 Pattern Comparisons

### Memento vs Command

**Similarities:**
- Both support undo/redo functionality
- Both can store state
- Both enable history management

**Differences:**

| Aspect | Memento | Command |
|--------|---------|---------|
| **Focus** | State snapshot | Action encapsulation |
| **What's Stored** | Object state | Action + parameters |
| **Undo Mechanism** | Restore state | Execute inverse action |
| **Memory** | Can be large | Usually smaller |
| **Use Case** | State restoration | Action queuing |

**When to use Memento:**
- Need to restore exact state
- State is complex
- Don't need to replay actions
- State changes are not easily reversible

**When to use Command:**
- Actions are reversible
- Need to queue/execute actions
- Want to log actions
- Memory is a concern

### Memento vs Prototype

**Similarities:**
- Both create copies
- Both preserve state

**Differences:**

| Aspect | Memento | Prototype |
|--------|---------|-----------|
| **Purpose** | State restoration | Object creation |
| **Access** | Restricted (narrow) | Public |
| **Lifecycle** | Temporary | Permanent |
| **Use Case** | Undo/redo | Cloning objects |

### Memento vs State

**Similarities:**
- Both deal with state
- Both can change object behavior

**Differences:**

| Aspect | Memento | State |
|--------|---------|-------|
| **Purpose** | Save/restore state | Change behavior based on state |
| **Structure** | External snapshot | Internal state objects |
| **Use Case** | History management | State machine |

---

## 🎯 Real-World Applications

### 1. Text Editors (Undo/Redo)

```typescript
class TextEditor {
  private content: string;
  private history: TextMemento[] = [];

  undo(): void {
    const memento = this.history.pop();
    if (memento) {
      this.restore(memento);
    }
  }
}
```

### 2. Game Save/Load Systems

```typescript
class Game {
  saveGame(): GameMemento {
    return new GameMemento(this.state);
  }

  loadGame(memento: GameMemento): void {
    this.restore(memento);
  }
}
```

### 3. Database Transactions (Rollback)

```typescript
class Transaction {
  begin(): TransactionMemento {
    return new TransactionMemento(this.state);
  }

  rollback(memento: TransactionMemento): void {
    this.restore(memento);
  }
}
```

### 4. Configuration Management

```typescript
class ConfigManager {
  saveConfig(): ConfigMemento {
    return new ConfigMemento(this.settings);
  }

  restoreConfig(memento: ConfigMemento): void {
    this.restore(memento);
  }
}
```

### 5. Browser History

```typescript
class Browser {
  goBack(): void {
    const memento = this.history.pop();
    this.restore(memento);
  }
}
```

---

## ⚠️ Common Pitfalls and Best Practices

### Common Pitfalls

❌ **Breaking Encapsulation**
```typescript
// BAD: Public state access
class BadMemento {
  public state: any; // Breaks encapsulation
}

// GOOD: Narrow interface
class GoodMemento {
  private state: any;
  getState(): any { return this.state; } // Only originator calls
}
```

❌ **Shallow Copying**
```typescript
// BAD: Shallow copy - references shared
class BadMemento {
  constructor(state: any) {
    this.state = state; // Reference, not copy
  }
}

// GOOD: Deep copy
class GoodMemento {
  constructor(state: any) {
    this.state = JSON.parse(JSON.stringify(state)); // Deep copy
  }
}
```

❌ **Unlimited History**
```typescript
// BAD: No limit on history
class BadHistory {
  private mementos: Memento[] = [];
  save(memento: Memento): void {
    this.mementos.push(memento); // Can grow indefinitely
  }
}

// GOOD: Limited history
class GoodHistory {
  private mementos: Memento[] = [];
  private maxSize: number = 100;
  
  save(memento: Memento): void {
    if (this.mementos.length >= this.maxSize) {
      this.mementos.shift();
    }
    this.mementos.push(memento);
  }
}
```

❌ **Storing Large Objects**
```typescript
// BAD: Storing entire large object
class BadMemento {
  private entireLargeObject: LargeObject; // Memory intensive
}

// GOOD: Incremental mementos
class GoodMemento {
  private changes: Change[]; // Only store changes
}
```

❌ **Not Handling Circular References**
```typescript
// BAD: JSON.stringify fails on circular refs
class BadMemento {
  constructor(state: any) {
    this.state = JSON.parse(JSON.stringify(state)); // Fails on circular refs
  }
}

// GOOD: Handle circular references
function deepClone(obj: any, visited = new WeakMap()): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (visited.has(obj)) return visited.get(obj);
  
  const clone = Array.isArray(obj) ? [] : {};
  visited.set(obj, clone);
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], visited);
    }
  }
  
  return clone;
}

class GoodMemento {
  constructor(state: any) {
    this.state = deepClone(state); // Handles circular refs
  }
}
```

### Best Practices

✅ **Use Deep Copying**
```typescript
class Memento {
  constructor(state: any) {
    // Use structuredClone for modern environments (handles most cases)
    this.state = structuredClone(state);
  }
  
  // Or use custom deep clone for circular references
  private deepCopy(obj: any, visited = new WeakMap()): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (visited.has(obj)) return visited.get(obj);
    
    const clone = Array.isArray(obj) ? [] : {};
    visited.set(obj, clone);
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clone[key] = this.deepCopy(obj[key], visited);
      }
    }
    
    return clone;
  }
}
```

✅ **Implement Narrow Interface**
```typescript
class Memento {
  private state: any;
  
  // Only originator should call this
  getStateForOriginator(): any {
    return this.state;
  }
}
```

✅ **Limit History Size**
```typescript
class History {
  private maxSize: number = 50;
  
  save(memento: Memento): void {
    if (this.mementos.length >= this.maxSize) {
      this.mementos.shift();
    }
    this.mementos.push(memento);
  }
}
```

✅ **Use Incremental Mementos for Large States**
```typescript
class IncrementalMemento {
  private baseState: State | null;
  private changes: Change[];
  // Only store changes, not full state
}
```

✅ **Consider Memory Management**
```typescript
class History {
  clearOldHistory(): void {
    // Remove mementos older than threshold
    this.mementos = this.mementos.slice(-this.maxSize);
  }
}
```

---

## 🚀 Modern Variations and Extensions

### 1. Serializable Mementos

```typescript
interface Serializable {
  serialize(): string;
  deserialize(data: string): void;
}

class SerializableMemento implements Serializable {
  private state: any;

  serialize(): string {
    return JSON.stringify(this.state);
  }

  deserialize(data: string): void {
    this.state = JSON.parse(data);
  }
}
```

### 2. Compressed Mementos

```typescript
class CompressedMemento {
  private compressedState: string;

  constructor(state: any) {
    const serialized = JSON.stringify(state);
    this.compressedState = this.compress(serialized);
  }

  getState(): any {
    const decompressed = this.decompress(this.compressedState);
    return JSON.parse(decompressed);
  }

  private compress(data: string): string {
    // Compression logic
    return data; // Simplified
  }

  private decompress(data: string): string {
    // Decompression logic
    return data; // Simplified
  }
}
```

### 3. Memento with Expiration

```typescript
class ExpiringMemento {
  private state: any;
  private expirationTime: Date;

  constructor(state: any, ttl: number) {
    this.state = state;
    this.expirationTime = new Date(Date.now() + ttl);
  }

  isValid(): boolean {
    return new Date() < this.expirationTime;
  }

  getState(): any {
    if (!this.isValid()) {
      throw new Error('Memento has expired');
    }
    return this.state;
  }
}
```

---

## 📚 Summary

### Key Takeaways

1. **Memento Pattern** saves and restores object state without breaking encapsulation
2. **Three Participants** - Originator (saves/restores), Memento (stores state), Caretaker (manages history)
3. **Encapsulation Protection** - Memento hides internal state from caretaker
4. **State Snapshot** - Captures complete state at a point in time
5. **Memory Considerations** - Can consume significant memory, consider incremental mementos

### When to Use

✅ Use when:
- Need undo/redo functionality
- Need to save/restore object state
- Want to preserve encapsulation
- State is complex and needs snapshot
- Need checkpoint/restore functionality

❌ Don't use when:
- State is simple and can be copied directly
- Memory usage is critical
- State changes very frequently
- Need to access state from outside originator
- State is too large to snapshot efficiently

### Pattern Relationships

- **Similar to Command**: Both support undo, but Memento saves state, Command saves actions
- **Can use with**: Command (for action history), State (for state management)
- **Alternative to**: Prototype (for state copying), Serialization (for state persistence)

### Next Steps

After mastering Memento Pattern, consider:
- **Command Pattern** - For action-based undo/redo
- **State Pattern** - For state machine management
- **Prototype Pattern** - For object cloning
- **Serialization** - For persistent state storage

---

## 🔗 Related Patterns

- **Command**: Encapsulates requests as objects, supports undo/redo
- **State**: Allows object to alter behavior when internal state changes
- **Prototype**: Creates objects by cloning existing instances
- **Serialization**: Converts objects to/from persistent format

---

## 📖 References

- **Gang of Four**: "Design Patterns: Elements of Reusable Object-Oriented Software"
- **Refactoring Guru**: Memento Pattern
- **Source Making**: Memento Design Pattern

