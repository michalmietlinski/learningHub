# Composite Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Composite pattern definition and intent
- [ ] Learn when to use Composite vs other structural patterns
- [ ] Master building tree structures with uniform interfaces
- [ ] Recognize real-world applications
- [ ] Understand leaf vs composite components
- [ ] Practice implementing Composite in different scenarios
- [ ] Learn common pitfalls and best practices

---

## 🎯 Definition

**Composite Pattern** is a structural design pattern that lets you compose objects into tree structures to represent part-whole hierarchies. It allows clients to treat individual objects and compositions of objects uniformly.

**Intent (GoF):**
- Compose objects into tree structures to represent part-whole hierarchies
- Allow clients to treat individual objects and compositions uniformly
- Also known as: **Object Tree Pattern**

**Key Principle:**
> "Treat individual objects and compositions uniformly" - The composite pattern allows you to build tree structures where both individual objects (leaves) and compositions (composites) can be treated the same way by clients.

---

## 🏗️ Structure

### UML Diagram Concept

```
Component (Interface/Abstract)
├── operation(): void
├── add(component: Component): void
├── remove(component: Component): void
├── getChild(index: number): Component
└── isComposite(): boolean

Leaf implements Component
├── operation(): void
└── (add, remove, getChild throw errors or do nothing)

Composite implements Component
├── children: Component[]
├── operation(): void
│   └── for each child: child.operation()
├── add(component: Component): void
├── remove(component: Component): void
├── getChild(index: number): Component
└── isComposite(): boolean

Client
└── uses Component (can be Leaf or Composite)
```

### Participants

1. **Component** - Declares the interface for objects in the composition and implements default behavior for the interface common to all classes
2. **Leaf** - Represents leaf objects in the composition (has no children)
3. **Composite** - Defines behavior for components having children and stores child components
4. **Client** - Manipulates objects in the composition through the Component interface

### Key Concepts

**Component:**
- Defines interface for all objects in composition
- Implements default behavior for common operations
- Declares interface for accessing and managing child components

**Leaf:**
- Represents leaf nodes (no children)
- Implements Component interface
- Performs actual operations

**Composite:**
- Stores child components (can be Leaf or Composite)
- Implements child-related operations
- Delegates operations to children

**Uniform Interface:**
- Both Leaf and Composite implement Component
- Client treats them the same way
- Operations work on both individual objects and compositions

---

## 💡 When to Use

### Use Composite When:

✅ **You need to represent part-whole hierarchies**
- Example: File system (files and folders), UI components (buttons and containers)

✅ **You want clients to ignore the difference between individual objects and compositions**
- Example: Treating a single file and a folder of files the same way

✅ **You need to build tree structures**
- Example: Organizational charts, menu systems, expression trees

✅ **You want to add/remove objects dynamically**
- Example: Building UI dynamically, managing file structures

✅ **Operations should apply to both individual objects and groups**
- Example: Calculating total size of files and folders, rendering UI components

### Don't Use When:

❌ **The structure is not hierarchical** - Composite is for tree structures
❌ **Leaf and Composite have fundamentally different behaviors** - Uniform interface won't work
❌ **Performance is critical** - Tree traversal can be expensive
❌ **The hierarchy is simple** - Direct implementation might be simpler

---

## 🔨 Implementation Examples

### Example 1: Basic Composite Pattern (File System)

```typescript
// Component Interface
interface FileSystemItem {
  getName(): string;
  getSize(): number;
  display(indent: string): void;
  isComposite(): boolean;
}

// Leaf - File
class File implements FileSystemItem {
  constructor(private name: string, private size: number) {}
  
  getName(): string {
    return this.name;
  }
  
  getSize(): number {
    return this.size;
  }
  
  display(indent: string = ''): void {
    console.log(`${indent}📄 ${this.name} (${this.size} bytes)`);
  }
  
  isComposite(): boolean {
    return false;
  }
}

// Composite - Folder
class Folder implements FileSystemItem {
  private children: FileSystemItem[] = [];
  
  constructor(private name: string) {}
  
  getName(): string {
    return this.name;
  }
  
  getSize(): number {
    // Sum of all children's sizes
    return this.children.reduce((total, child) => total + child.getSize(), 0);
  }
  
  display(indent: string = ''): void {
    console.log(`${indent}📁 ${this.name}/ (${this.getSize()} bytes)`);
    this.children.forEach(child => {
      child.display(indent + '  ');
    });
  }
  
  add(item: FileSystemItem): void {
    this.children.push(item);
  }
  
  remove(item: FileSystemItem): void {
    const index = this.children.indexOf(item);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }
  
  getChild(index: number): FileSystemItem | null {
    return this.children[index] || null;
  }
  
  getChildren(): FileSystemItem[] {
    return [...this.children];
  }
  
  isComposite(): boolean {
    return true;
  }
}

// Usage
const root = new Folder('root');
const documents = new Folder('documents');
const photos = new Folder('photos');
const videos = new Folder('videos');

// Add files
documents.add(new File('readme.txt', 1024));
documents.add(new File('notes.md', 2048));
photos.add(new File('vacation.jpg', 1024000));
photos.add(new File('family.jpg', 2048000));
videos.add(new File('movie.mp4', 104857600));

// Build hierarchy
root.add(documents);
root.add(photos);
root.add(videos);

// Display tree structure
console.log('=== File System Structure ===');
root.display();

// Calculate total size
console.log(`\nTotal size: ${root.getSize()} bytes`);

// Treat all items uniformly
function processItem(item: FileSystemItem): void {
  console.log(`Processing: ${item.getName()} (${item.getSize()} bytes)`);
  item.display();
}

console.log('\n=== Processing Items Uniformly ===');
processItem(root);
processItem(documents);
processItem(new File('standalone.txt', 512));
```

### Example 2: UI Component Tree

```typescript
// Component Interface
interface UIComponent {
  render(): string;
  getWidth(): number;
  getHeight(): number;
  add(component: UIComponent): void;
  remove(component: UIComponent): void;
  getChild(index: number): UIComponent | null;
  isComposite(): boolean;
}

// Leaf - Button
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
  
  add(component: UIComponent): void {
    throw new Error('Cannot add to leaf component');
  }
  
  remove(component: UIComponent): void {
    throw new Error('Cannot remove from leaf component');
  }
  
  getChild(index: number): UIComponent | null {
    return null;
  }
  
  isComposite(): boolean {
    return false;
  }
}

// Leaf - Input
class Input implements UIComponent {
  constructor(
    private placeholder: string,
    private width: number = 200,
    private height: number = 30
  ) {}
  
  render(): string {
    return `<input type="text" placeholder="${this.placeholder}" style="width: ${this.width}px; height: ${this.height}px" />`;
  }
  
  getWidth(): number {
    return this.width;
  }
  
  getHeight(): number {
    return this.height;
  }
  
  add(component: UIComponent): void {
    throw new Error('Cannot add to leaf component');
  }
  
  remove(component: UIComponent): void {
    throw new Error('Cannot remove from leaf component');
  }
  
  getChild(index: number): UIComponent | null {
    return null;
  }
  
  isComposite(): boolean {
    return false;
  }
}

// Composite - Container
class Container implements UIComponent {
  private children: UIComponent[] = [];
  
  constructor(
    private name: string,
    private layout: 'vertical' | 'horizontal' = 'vertical'
  ) {}
  
  render(): string {
    const childrenHTML = this.children
      .map(child => child.render())
      .join(this.layout === 'vertical' ? '<br/>' : ' ');
    
    return `<div class="container" style="display: ${this.layout === 'vertical' ? 'block' : 'flex'}">
      ${childrenHTML}
    </div>`;
  }
  
  getWidth(): number {
    if (this.layout === 'horizontal') {
      return this.children.reduce((sum, child) => sum + child.getWidth(), 0);
    }
    return Math.max(...this.children.map(child => child.getWidth()), 0);
  }
  
  getHeight(): number {
    if (this.layout === 'vertical') {
      return this.children.reduce((sum, child) => sum + child.getHeight(), 0);
    }
    return Math.max(...this.children.map(child => child.getHeight()), 0);
  }
  
  add(component: UIComponent): void {
    this.children.push(component);
  }
  
  remove(component: UIComponent): void {
    const index = this.children.indexOf(component);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }
  
  getChild(index: number): UIComponent | null {
    return this.children[index] || null;
  }
  
  getChildren(): UIComponent[] {
    return [...this.children];
  }
  
  isComposite(): boolean {
    return true;
  }
}

// Usage
const form = new Container('loginForm', 'vertical');
const usernameInput = new Input('Username');
const passwordInput = new Input('Password');
const submitButton = new Button('Submit');
const cancelButton = new Button('Cancel');

// Build form
form.add(usernameInput);
form.add(passwordInput);

const buttonContainer = new Container('buttons', 'horizontal');
buttonContainer.add(submitButton);
buttonContainer.add(cancelButton);

form.add(buttonContainer);

// Render entire form
console.log('=== Form Structure ===');
console.log(form.render());

// Calculate dimensions
console.log(`\nForm dimensions: ${form.getWidth()}x${form.getHeight()}`);

// Traverse tree
function traverse(component: UIComponent, depth: number = 0): void {
  const indent = '  '.repeat(depth);
  console.log(`${indent}${component.isComposite() ? '📦' : '📄'} ${component.isComposite() ? 'Container' : 'Component'}`);
  
  if (component.isComposite()) {
    const composite = component as Container;
    for (let i = 0; i < composite.getChildren().length; i++) {
      const child = composite.getChild(i);
      if (child) {
        traverse(child, depth + 1);
      }
    }
  }
}

console.log('\n=== Component Tree ===');
traverse(form);
```

### Example 3: Organizational Structure

```typescript
// Component Interface
interface Employee {
  getName(): string;
  getSalary(): number;
  getRole(): string;
  display(indent: string): void;
  add(employee: Employee): void;
  remove(employee: Employee): void;
  getSubordinates(): Employee[];
  isComposite(): boolean;
}

// Leaf - Individual Employee
class IndividualEmployee implements Employee {
  constructor(
    private name: string,
    private salary: number,
    private role: string
  ) {}
  
  getName(): string {
    return this.name;
  }
  
  getSalary(): number {
    return this.salary;
  }
  
  getRole(): string {
    return this.role;
  }
  
  display(indent: string = ''): void {
    console.log(`${indent}👤 ${this.name} - ${this.role} ($${this.salary})`);
  }
  
  add(employee: Employee): void {
    throw new Error('Individual employees cannot have subordinates');
  }
  
  remove(employee: Employee): void {
    throw new Error('Individual employees cannot have subordinates');
  }
  
  getSubordinates(): Employee[] {
    return [];
  }
  
  isComposite(): boolean {
    return false;
  }
}

// Composite - Manager/Director
class Manager implements Employee {
  private subordinates: Employee[] = [];
  
  constructor(
    private name: string,
    private salary: number,
    private role: string
  ) {}
  
  getName(): string {
    return this.name;
  }
  
  getSalary(): number {
    // Manager's salary + sum of all subordinates' salaries
    const subordinatesTotal = this.subordinates.reduce(
      (sum, emp) => sum + emp.getSalary(),
      0
    );
    return this.salary + subordinatesTotal;
  }
  
  getRole(): string {
    return this.role;
  }
  
  display(indent: string = ''): void {
    console.log(`${indent}👔 ${this.name} - ${this.role} ($${this.salary} + team: $${this.getSalary() - this.salary})`);
    this.subordinates.forEach(emp => {
      emp.display(indent + '  ');
    });
  }
  
  add(employee: Employee): void {
    this.subordinates.push(employee);
  }
  
  remove(employee: Employee): void {
    const index = this.subordinates.indexOf(employee);
    if (index > -1) {
      this.subordinates.splice(index, 1);
    }
  }
  
  getSubordinates(): Employee[] {
    return [...this.subordinates];
  }
  
  isComposite(): boolean {
    return true;
  }
  
  getTeamSize(): number {
    return this.subordinates.reduce((count, emp) => {
      if (emp.isComposite()) {
        return count + 1 + (emp as Manager).getTeamSize();
      }
      return count + 1;
    }, 0);
  }
}

// Usage
const ceo = new Manager('Alice Johnson', 200000, 'CEO');

const cto = new Manager('Bob Smith', 150000, 'CTO');
const cfo = new Manager('Carol White', 150000, 'CFO');

const devManager = new Manager('David Brown', 120000, 'Development Manager');
const dev1 = new IndividualEmployee('Eve Davis', 80000, 'Senior Developer');
const dev2 = new IndividualEmployee('Frank Miller', 70000, 'Developer');
const dev3 = new IndividualEmployee('Grace Lee', 75000, 'Developer');

const financeManager = new Manager('Henry Wilson', 110000, 'Finance Manager');
const accountant1 = new IndividualEmployee('Ivy Taylor', 60000, 'Accountant');
const accountant2 = new IndividualEmployee('Jack Anderson', 65000, 'Senior Accountant');

// Build organizational structure
ceo.add(cto);
ceo.add(cfo);

cto.add(devManager);
devManager.add(dev1);
devManager.add(dev2);
devManager.add(dev3);

cfo.add(financeManager);
financeManager.add(accountant1);
financeManager.add(accountant2);

// Display organization
console.log('=== Organizational Structure ===');
ceo.display();

// Calculate total payroll
console.log(`\nTotal Payroll: $${ceo.getSalary()}`);

// Get team sizes
console.log(`\nTeam Sizes:`);
console.log(`CEO team: ${ceo.getTeamSize()} employees`);
console.log(`CTO team: ${cto.getTeamSize()} employees`);
console.log(`CFO team: ${cfo.getTeamSize()} employees`);

// Uniform operation on all employees
function giveRaise(employee: Employee, percentage: number): void {
  if (employee.isComposite()) {
    const manager = employee as Manager;
    manager.getSubordinates().forEach(sub => {
      giveRaise(sub, percentage);
    });
  }
  // In real implementation, would update salary
  console.log(`Giving ${percentage}% raise to ${employee.getName()}`);
}

console.log('\n=== Giving Company-Wide Raise ===');
giveRaise(ceo, 5);
```

### Example 4: Expression Tree

```typescript
// Component Interface
interface Expression {
  evaluate(): number;
  display(): string;
  isComposite(): boolean;
}

// Leaf - Number
class NumberExpression implements Expression {
  constructor(private value: number) {}
  
  evaluate(): number {
    return this.value;
  }
  
  display(): string {
    return this.value.toString();
  }
  
  isComposite(): boolean {
    return false;
  }
}

// Composite - Binary Operation
abstract class BinaryExpression implements Expression {
  protected left: Expression;
  protected right: Expression;
  
  constructor(left: Expression, right: Expression) {
    this.left = left;
    this.right = right;
  }
  
  abstract evaluate(): number;
  
  display(): string {
    return `(${this.left.display()} ${this.getOperator()} ${this.right.display()})`;
  }
  
  abstract getOperator(): string;
  
  isComposite(): boolean {
    return true;
  }
  
  getLeft(): Expression {
    return this.left;
  }
  
  getRight(): Expression {
    return this.right;
  }
}

// Concrete Composites
class AddExpression extends BinaryExpression {
  evaluate(): number {
    return this.left.evaluate() + this.right.evaluate();
  }
  
  getOperator(): string {
    return '+';
  }
}

class SubtractExpression extends BinaryExpression {
  evaluate(): number {
    return this.left.evaluate() - this.right.evaluate();
  }
  
  getOperator(): string {
    return '-';
  }
}

class MultiplyExpression extends BinaryExpression {
  evaluate(): number {
    return this.left.evaluate() * this.right.evaluate();
  }
  
  getOperator(): string {
    return '*';
  }
}

class DivideExpression extends BinaryExpression {
  evaluate(): number {
    const rightValue = this.right.evaluate();
    if (rightValue === 0) {
      throw new Error('Division by zero');
    }
    return this.left.evaluate() / rightValue;
  }
  
  getOperator(): string {
    return '/';
  }
}

// Usage
// Build expression: (2 + 3) * (4 - 1)
const expr = new MultiplyExpression(
  new AddExpression(
    new NumberExpression(2),
    new NumberExpression(3)
  ),
  new SubtractExpression(
    new NumberExpression(4),
    new NumberExpression(1)
  )
);

console.log('=== Expression Tree ===');
console.log(`Expression: ${expr.display()}`);
console.log(`Result: ${expr.evaluate()}`);

// More complex: ((10 + 5) * 2) / 3
const complexExpr = new DivideExpression(
  new MultiplyExpression(
    new AddExpression(
      new NumberExpression(10),
      new NumberExpression(5)
    ),
    new NumberExpression(2)
  ),
  new NumberExpression(3)
);

console.log(`\nComplex Expression: ${complexExpr.display()}`);
console.log(`Result: ${complexExpr.evaluate()}`);

// Traverse expression tree
function traverseExpression(expr: Expression, depth: number = 0): void {
  const indent = '  '.repeat(depth);
  if (expr.isComposite()) {
    const binary = expr as BinaryExpression;
    console.log(`${indent}${binary.getOperator()}`);
    traverseExpression(binary.getLeft(), depth + 1);
    traverseExpression(binary.getRight(), depth + 1);
  } else {
    const num = expr as NumberExpression;
    console.log(`${indent}${num.evaluate()}`);
  }
}

console.log('\n=== Expression Tree Structure ===');
traverseExpression(complexExpr);
```

### Example 5: Menu System

```typescript
// Component Interface
interface MenuItem {
  getName(): string;
  getPrice(): number;
  display(indent: string): void;
  add(item: MenuItem): void;
  remove(item: MenuItem): void;
  getChildren(): MenuItem[];
  isComposite(): boolean;
}

// Leaf - Individual Menu Item
class MenuItemLeaf implements MenuItem {
  constructor(
    private name: string,
    private price: number,
    private description: string
  ) {}
  
  getName(): string {
    return this.name;
  }
  
  getPrice(): number {
    return this.price;
  }
  
  display(indent: string = ''): void {
    console.log(`${indent}🍽️  ${this.name} - $${this.price}`);
    console.log(`${indent}   ${this.description}`);
  }
  
  add(item: MenuItem): void {
    throw new Error('Cannot add to menu item');
  }
  
  remove(item: MenuItem): void {
    throw new Error('Cannot remove from menu item');
  }
  
  getChildren(): MenuItem[] {
    return [];
  }
  
  isComposite(): boolean {
    return false;
  }
}

// Composite - Menu Category
class MenuCategory implements MenuItem {
  private items: MenuItem[] = [];
  
  constructor(private name: string, private description: string = '') {}
  
  getName(): string {
    return this.name;
  }
  
  getPrice(): number {
    // Category doesn't have a price, but we can calculate average
    if (this.items.length === 0) return 0;
    const total = this.items.reduce((sum, item) => sum + item.getPrice(), 0);
    return total / this.items.length;
  }
  
  display(indent: string = ''): void {
    console.log(`${indent}📋 ${this.name}`);
    if (this.description) {
      console.log(`${indent}   ${this.description}`);
    }
    this.items.forEach(item => {
      item.display(indent + '  ');
    });
  }
  
  add(item: MenuItem): void {
    this.items.push(item);
  }
  
  remove(item: MenuItem): void {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
    }
  }
  
  getChildren(): MenuItem[] {
    return [...this.items];
  }
  
  isComposite(): boolean {
    return true;
  }
  
  getTotalPrice(): number {
    return this.items.reduce((sum, item) => {
      if (item.isComposite()) {
        return sum + (item as MenuCategory).getTotalPrice();
      }
      return sum + item.getPrice();
    }, 0);
  }
}

// Usage
const menu = new MenuCategory('Restaurant Menu', 'Our delicious offerings');

// Appetizers
const appetizers = new MenuCategory('Appetizers');
appetizers.add(new MenuItemLeaf('Bruschetta', 8, 'Toasted bread with tomatoes and basil'));
appetizers.add(new MenuItemLeaf('Caesar Salad', 10, 'Fresh romaine with Caesar dressing'));
appetizers.add(new MenuItemLeaf('Soup of the Day', 7, 'Chef\'s daily selection'));

// Main Courses
const mainCourses = new MenuCategory('Main Courses');
mainCourses.add(new MenuItemLeaf('Grilled Salmon', 24, 'Fresh Atlantic salmon with vegetables'));
mainCourses.add(new MenuItemLeaf('Pasta Carbonara', 18, 'Creamy pasta with bacon'));
mainCourses.add(new MenuItemLeaf('Ribeye Steak', 32, 'Prime cut with mashed potatoes'));

// Desserts
const desserts = new MenuCategory('Desserts');
desserts.add(new MenuItemLeaf('Tiramisu', 9, 'Classic Italian dessert'));
desserts.add(new MenuItemLeaf('Chocolate Cake', 8, 'Rich chocolate layer cake'));
desserts.add(new MenuItemLeaf('Ice Cream', 6, 'Vanilla, chocolate, or strawberry'));

// Build menu
menu.add(appetizers);
menu.add(mainCourses);
menu.add(desserts);

// Display menu
console.log('=== Restaurant Menu ===');
menu.display();

// Calculate menu statistics
console.log(`\n=== Menu Statistics ===`);
console.log(`Total items: ${menu.getChildren().reduce((count, cat) => {
  return count + (cat as MenuCategory).getChildren().length;
}, 0)}`);
console.log(`Average price: $${menu.getPrice().toFixed(2)}`);

// Find items by price range
function findItemsInRange(category: MenuCategory, min: number, max: number): MenuItem[] {
  const results: MenuItem[] = [];
  
  category.getChildren().forEach(item => {
    if (item.isComposite()) {
      results.push(...findItemsInRange(item as MenuCategory, min, max));
    } else {
      if (item.getPrice() >= min && item.getPrice() <= max) {
        results.push(item);
      }
    }
  });
  
  return results;
}

console.log('\n=== Items between $8 and $15 ===');
const affordableItems = findItemsInRange(menu, 8, 15);
affordableItems.forEach(item => {
  console.log(`- ${item.getName()}: $${item.getPrice()}`);
});
```

### Example 6: Shopping Cart with Composite

```typescript
// Component Interface
interface CartItem {
  getName(): string;
  getPrice(): number;
  getQuantity(): number;
  getTotalPrice(): number;
  display(indent: string): void;
  add(item: CartItem): void;
  remove(item: CartItem): void;
  isComposite(): boolean;
}

// Leaf - Product
class Product implements CartItem {
  constructor(
    private name: string,
    private price: number,
    private quantity: number = 1
  ) {}
  
  getName(): string {
    return this.name;
  }
  
  getPrice(): number {
    return this.price;
  }
  
  getQuantity(): number {
    return this.quantity;
  }
  
  getTotalPrice(): number {
    return this.price * this.quantity;
  }
  
  display(indent: string = ''): void {
    console.log(`${indent}🛍️  ${this.name} x${this.quantity} - $${this.getPrice()} each = $${this.getTotalPrice()}`);
  }
  
  add(item: CartItem): void {
    throw new Error('Cannot add to product');
  }
  
  remove(item: CartItem): void {
    throw new Error('Cannot remove from product');
  }
  
  isComposite(): boolean {
    return false;
  }
  
  setQuantity(quantity: number): void {
    this.quantity = quantity;
  }
}

// Composite - Cart Section/Bundle
class CartSection implements CartItem {
  private items: CartItem[] = [];
  
  constructor(private name: string) {}
  
  getName(): string {
    return this.name;
  }
  
  getPrice(): number {
    return this.getTotalPrice();
  }
  
  getQuantity(): number {
    return 1; // Section is a single unit
  }
  
  getTotalPrice(): number {
    return this.items.reduce((sum, item) => sum + item.getTotalPrice(), 0);
  }
  
  display(indent: string = ''): void {
    console.log(`${indent}📦 ${this.name} (Total: $${this.getTotalPrice()})`);
    this.items.forEach(item => {
      item.display(indent + '  ');
    });
  }
  
  add(item: CartItem): void {
    this.items.push(item);
  }
  
  remove(item: CartItem): void {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
    }
  }
  
  isComposite(): boolean {
    return true;
  }
  
  getItems(): CartItem[] {
    return [...this.items];
  }
  
  applyDiscount(percentage: number): void {
    // Apply discount to all items
    this.items.forEach(item => {
      if (item.isComposite()) {
        (item as CartSection).applyDiscount(percentage);
      } else {
        const product = item as Product;
        // In real implementation, would modify price
        console.log(`Applying ${percentage}% discount to ${product.getName()}`);
      }
    });
  }
}

// Usage
const cart = new CartSection('Shopping Cart');

// Electronics section
const electronics = new CartSection('Electronics');
electronics.add(new Product('Laptop', 999, 1));
electronics.add(new Product('Mouse', 25, 2));
electronics.add(new Product('Keyboard', 75, 1));

// Books section
const books = new CartSection('Books');
books.add(new Product('Design Patterns Book', 45, 1));
books.add(new Product('JavaScript Guide', 30, 2));

// Groceries section
const groceries = new CartSection('Groceries');
groceries.add(new Product('Milk', 3, 2));
groceries.add(new Product('Bread', 2, 3));

// Build cart
cart.add(electronics);
cart.add(books);
cart.add(groceries);

// Display cart
console.log('=== Shopping Cart ===');
cart.display();

// Calculate totals
console.log(`\n=== Cart Summary ===`);
console.log(`Total items: ${cart.getItems().reduce((count, section) => {
  return count + section.getItems().length;
}, 0)}`);
console.log(`Total price: $${cart.getTotalPrice()}`);

// Apply discount to electronics
console.log('\n=== Applying 10% Discount to Electronics ===');
electronics.applyDiscount(10);
```

---

## 🔄 Composite vs Other Patterns

### Composite vs Decorator

| Aspect | Composite | Decorator |
|--------|-----------|-----------|
| **Purpose** | Build tree structures | Add behavior to objects |
| **Structure** | Tree hierarchy | Wrapper chain |
| **Focus** | Part-whole relationships | Behavior extension |
| **When** | Need tree structures | Need to add features |

**Example:**
- **Composite**: Folder containing files and subfolders
- **Decorator**: File with compression, encryption decorators

### Composite vs Chain of Responsibility

| Aspect | Composite | Chain of Responsibility |
|--------|-----------|-------------------------|
| **Purpose** | Represent tree structures | Pass requests along chain |
| **Structure** | Tree | Linear chain |
| **Focus** | Hierarchical organization | Request handling |
| **When** | Need part-whole hierarchy | Need request processing chain |

### Composite vs Flyweight

| Aspect | Composite | Flyweight |
|--------|-----------|-----------|
| **Purpose** | Build tree structures | Share common state |
| **Focus** | Structure | Memory optimization |
| **When** | Need hierarchies | Need to reduce memory |
| **Can Combine** | Yes - use Flyweight in Composite leaves |

---

## 🎨 Real-World Applications

### 1. React Component Tree

```javascript
// React components are essentially composite pattern
function App() {
  return (
    <div>
      <Header />
      <Main>
        <Sidebar />
        <Content>
          <Article />
          <Comments />
        </Content>
      </Main>
      <Footer />
    </div>
  );
}

// Each component can contain other components
// Both leaf components (like <img />) and composite components (like <div />) 
// implement the same interface (render, props, etc.)
```

### 2. File Systems

```typescript
// Operating systems use composite for file/folder structure
interface FileSystemNode {
  getName(): string;
  getSize(): number;
  list(): FileSystemNode[];
}

// Both File and Directory implement same interface
// Directory can contain Files and other Directories
```

### 3. DOM (Document Object Model)

```javascript
// DOM uses composite pattern
// Both Element nodes and Text nodes implement Node interface
// Elements can contain other Elements and Text nodes

const div = document.createElement('div');
const span = document.createElement('span');
const text = document.createTextNode('Hello');

span.appendChild(text);
div.appendChild(span);

// All nodes have same interface: appendChild, removeChild, etc.
```

### 4. Menu Systems

```typescript
// GUI frameworks use composite for menus
interface MenuItem {
  render(): void;
  onClick(): void;
  add(item: MenuItem): void;
}

// Both MenuItem (leaf) and Menu (composite) implement same interface
// Menu can contain MenuItems and sub-Menus
```

### 5. Expression Parsers

```typescript
// Compilers use composite for AST (Abstract Syntax Tree)
interface ASTNode {
  evaluate(): any;
  getChildren(): ASTNode[];
}

// Both leaf nodes (literals, variables) and composite nodes (operators)
// implement same interface
```

### 6. Organizational Charts

```typescript
// HR systems use composite for org charts
interface Employee {
  getName(): string;
  getSubordinates(): Employee[];
  getTotalTeamSize(): number;
}

// Both IndividualEmployee and Manager implement same interface
// Manager can contain IndividualEmployees and other Managers
```

---

## ⚠️ Common Pitfalls and Best Practices

### Pitfalls

❌ **Violating Uniform Interface**
- Problem: Leaf and Composite have different interfaces
- Solution: Ensure both implement Component interface fully

```typescript
// ❌ Bad: Different interfaces
interface Leaf {
  operation(): void;
}

interface Composite {
  operation(): void;
  add(child: Component): void; // Only composite has this
}

// ✅ Good: Uniform interface
interface Component {
  operation(): void;
  add?(child: Component): void; // Optional, but in interface
  remove?(child: Component): void;
}
```

❌ **Leaf Operations in Composite**
- Problem: Composite tries to perform leaf-specific operations
- Solution: Delegate to children, don't perform operations directly

```typescript
// ❌ Bad: Composite doing leaf work
class BadComposite {
  operation() {
    // Doing work directly instead of delegating
    this.doWork();
  }
}

// ✅ Good: Composite delegates
class GoodComposite {
  operation() {
    this.children.forEach(child => {
      child.operation(); // Delegate to children
    });
  }
}
```

❌ **Circular References**
- Problem: Composite contains itself, creating infinite loop
- Solution: Add validation to prevent adding parent to its own subtree

```typescript
// ❌ Bad: No cycle detection
class BadComposite {
  add(child: Component) {
    this.children.push(child); // Could add itself!
  }
}

// ✅ Good: Cycle detection
class GoodComposite {
  add(child: Component) {
    if (this.isAncestor(child)) {
      throw new Error('Cannot add ancestor as child');
    }
    this.children.push(child);
  }
  
  private isAncestor(child: Component): boolean {
    // Check if child is ancestor of this
    // Implementation depends on structure
  }
}
```

❌ **Too Many Operations in Component**
- Problem: Component interface has too many methods
- Solution: Use optional methods or separate interfaces

```typescript
// ❌ Bad: Too many required methods
interface Component {
  operation(): void;
  add(): void;
  remove(): void;
  getChild(): Component;
  // ... 20 more methods
}

// ✅ Good: Minimal interface, optional methods
interface Component {
  operation(): void;
  isComposite(): boolean;
}

interface Composite extends Component {
  add(child: Component): void;
  remove(child: Component): void;
  getChild(index: number): Component | null;
}
```

### Best Practices

✅ **Uniform Interface**
- Both Leaf and Composite implement Component interface
- Client treats them the same way

✅ **Transparent vs Safe Composite**
- **Transparent**: Component has add/remove (leaf throws errors)
- **Safe**: Only Composite has add/remove (type-safe but less uniform)

```typescript
// Transparent (more uniform, but leaf must handle add/remove)
interface Component {
  operation(): void;
  add(child: Component): void; // Leaf throws error
  remove(child: Component): void; // Leaf throws error
}

// Safe (type-safe, but less uniform)
interface Component {
  operation(): void;
}

interface Composite extends Component {
  add(child: Component): void;
  remove(child: Component): void;
}
```

✅ **Child Management**
- Composite manages its children
- Provide methods to add, remove, get children
- Consider iterator pattern for traversal

✅ **Operation Delegation**
- Composite delegates operations to children
- Don't perform operations directly in composite
- Let children handle their own operations

✅ **Tree Traversal**
- Provide methods to traverse tree
- Support different traversal orders (pre-order, post-order, etc.)
- Consider visitor pattern for complex traversals

```typescript
// ✅ Good: Traversal support
class Composite {
  traverse(visitor: (component: Component) => void): void {
    visitor(this);
    this.children.forEach(child => {
      if (child.isComposite()) {
        (child as Composite).traverse(visitor);
      } else {
        visitor(child);
      }
    });
  }
  
  find(predicate: (component: Component) => boolean): Component | null {
    if (predicate(this)) {
      return this;
    }
    
    for (const child of this.children) {
      if (child.isComposite()) {
        const found = (child as Composite).find(predicate);
        if (found) return found;
      } else if (predicate(child)) {
        return child;
      }
    }
    
    return null;
  }
}
```

✅ **Error Handling**
- Leaf should handle add/remove gracefully (throw or no-op)
- Composite should validate operations
- Document expected behavior

---

## 🧪 Testing Composite

### Unit Testing

```typescript
describe('Composite Pattern', () => {
  describe('Leaf Component', () => {
    it('should perform operation', () => {
      const leaf = new File('test.txt', 1024);
      expect(leaf.getSize()).toBe(1024);
    });
    
    it('should throw error when trying to add child', () => {
      const leaf = new File('test.txt', 1024);
      expect(() => {
        leaf.add(new File('other.txt', 512));
      }).toThrow();
    });
  });
  
  describe('Composite Component', () => {
    it('should add and remove children', () => {
      const folder = new Folder('test');
      const file1 = new File('file1.txt', 100);
      const file2 = new File('file2.txt', 200);
      
      folder.add(file1);
      folder.add(file2);
      
      expect(folder.getChildren().length).toBe(2);
      
      folder.remove(file1);
      expect(folder.getChildren().length).toBe(1);
    });
    
    it('should calculate total size correctly', () => {
      const folder = new Folder('test');
      folder.add(new File('file1.txt', 100));
      folder.add(new File('file2.txt', 200));
      
      expect(folder.getSize()).toBe(300);
    });
    
    it('should handle nested composites', () => {
      const root = new Folder('root');
      const subfolder = new Folder('sub');
      subfolder.add(new File('file.txt', 100));
      root.add(subfolder);
      
      expect(root.getSize()).toBe(100);
    });
  });
  
  describe('Uniform Interface', () => {
    it('should treat leaf and composite uniformly', () => {
      const items: FileSystemItem[] = [
        new File('file.txt', 100),
        new Folder('folder')
      ];
      
      items.forEach(item => {
        expect(item.getName()).toBeDefined();
        expect(item.getSize()).toBeDefined();
        expect(item.display).toBeDefined();
      });
    });
  });
});
```

---

## 📊 Advantages and Disadvantages

### Advantages

✅ **Uniform Treatment**
- Client treats leaf and composite the same way
- Simplifies client code

✅ **Easy to Add New Types**
- Add new leaf or composite types easily
- Extends hierarchy without modifying existing code

✅ **Flexible Structure**
- Build complex tree structures
- Add/remove components dynamically

✅ **Recursive Composition**
- Composites can contain other composites
- Build arbitrarily deep hierarchies

✅ **Open/Closed Principle**
- Open for extension (new components)
- Closed for modification (existing code)

### Disadvantages

❌ **Design Complexity**
- Can be harder to understand than simple structures
- Requires careful interface design

❌ **Performance Overhead**
- Tree traversal can be expensive
- Multiple method calls through hierarchy

❌ **Type Safety**
- In transparent approach, leaf must handle composite operations
- Can lead to runtime errors if not careful

❌ **Limited Operations**
- Some operations don't make sense for both leaf and composite
- May need to use optional methods or type checking

---

## 🔗 Related Patterns

### Composite and Iterator
- **Composite** builds tree structures
- **Iterator** traverses structures
- Often used together for tree traversal

### Composite and Visitor
- **Composite** builds tree structures
- **Visitor** performs operations on tree
- Visitor pattern works well with composite

### Composite and Flyweight
- **Composite** builds tree structures
- **Flyweight** shares common state
- Use Flyweight for leaf nodes to save memory

### Composite and Decorator
- **Composite** builds tree structures
- **Decorator** adds behavior
- Can decorate composite components

### Composite and Chain of Responsibility
- **Composite** builds tree structures
- **Chain of Responsibility** processes requests
- Can use composite to build chain

---

## 🎓 Summary

### Key Takeaways

1. **Purpose**: Composite builds tree structures where leaf and composite are treated uniformly
2. **Structure**: Component interface, Leaf (no children), Composite (has children)
3. **Use When**: You need part-whole hierarchies, want uniform treatment, need tree structures
4. **Benefits**: Uniform interface, flexible structure, easy extension
5. **Watch Out**: Design complexity, performance, type safety

### When to Choose Composite

Choose Composite when:
- ✅ You need to represent part-whole hierarchies
- ✅ You want clients to treat individual objects and compositions uniformly
- ✅ You need to build tree structures
- ✅ You want to add/remove objects dynamically
- ✅ Operations should apply to both individual objects and groups

Avoid Composite when:
- ❌ The structure is not hierarchical
- ❌ Leaf and Composite have fundamentally different behaviors
- ❌ Performance is critical and tree traversal is expensive
- ❌ The hierarchy is simple and direct implementation is better

### Next Steps

- Practice implementing Composite in your projects
- Identify tree structures in your codebase
- Explore real-world examples (React, DOM, file systems)
- Compare Composite with other structural patterns
- Experiment with tree traversal algorithms

---

## 📚 Additional Resources

### Design Patterns References
- **Gang of Four (GoF)**: "Design Patterns: Elements of Reusable Object-Oriented Software"
- **Head First Design Patterns**: Chapter on Composite Pattern

### Real-World Examples
- React component tree
- DOM (Document Object Model)
- File systems
- Menu systems
- Expression trees
- Organizational charts

### Practice Exercises

1. **Create a File System Composite**
   - Implement File and Folder classes
   - Support nested folders
   - Calculate total size recursively
   - Display tree structure

2. **Build a UI Component Tree**
   - Create leaf components (Button, Input)
   - Create composite components (Container, Form)
   - Support nested containers
   - Render entire tree

3. **Implement an Expression Parser**
   - Build expression tree with numbers and operators
   - Support nested expressions
   - Evaluate expressions recursively
   - Display expression structure

---

**Happy Learning! 🚀**


