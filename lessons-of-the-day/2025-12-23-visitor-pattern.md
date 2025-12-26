# Visitor Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Visitor pattern definition and intent
- [ ] Learn when to use Visitor vs other behavioral patterns
- [ ] Master double dispatch and accept/visit methods
- [ ] Recognize real-world applications
- [ ] Understand visitor hierarchies and compound visitors
- [ ] Practice implementing Visitor in different scenarios
- [ ] Learn common pitfalls and best practices

---

## 🎯 Definition

**Visitor Pattern** is a behavioral design pattern that lets you separate algorithms from the objects on which they operate. It allows you to define new operations without changing the classes of the elements on which it operates.

**Intent (GoF):**
- Represent an operation to be performed on elements of an object structure
- Define new operations without changing the classes of the elements
- Separate algorithms from object structure
- Also known as: **Double Dispatch Pattern**

**Key Principle:**
> "Separate the algorithm from the structure" - The visitor pattern allows you to add new operations to existing object structures without modifying those structures, by moving the operation logic into separate visitor classes.

---

## 🏗️ Structure

### UML Diagram Concept

```
Element (Interface)
├── accept(visitor: Visitor): void

ConcreteElementA implements Element
├── accept(visitor: Visitor): void
│   └── visitor.visitConcreteElementA(this)
└── operationA(): void

ConcreteElementB implements Element
├── accept(visitor: Visitor): void
│   └── visitor.visitConcreteElementB(this)
└── operationB(): void

Visitor (Interface)
├── visitConcreteElementA(element: ConcreteElementA): void
└── visitConcreteElementB(element: ConcreteElementB): void

ConcreteVisitor1 implements Visitor
├── visitConcreteElementA(element: ConcreteElementA): void
└── visitConcreteElementB(element: ConcreteElementB): void

ConcreteVisitor2 implements Visitor
├── visitConcreteElementA(element: ConcreteElementA): void
└── visitConcreteElementB(element: ConcreteElementB): void

ObjectStructure
├── elements: Element[]
├── accept(visitor: Visitor): void
└── add(element: Element): void
```

### Participants

1. **Visitor** - Declares a visit operation for each ConcreteElement class
2. **ConcreteVisitor** - Implements each operation declared by Visitor
3. **Element** - Defines an accept operation that takes a visitor as an argument
4. **ConcreteElement** - Implements accept operation and calls visitor's visit method
5. **ObjectStructure** - Can enumerate its elements and provide a high-level interface to allow visitors to visit its elements
6. **Client** - Creates visitor objects and passes them to elements via accept

### Key Concepts

**Double Dispatch:**
- First dispatch: Element accepts visitor
- Second dispatch: Visitor visits specific element type
- Enables type-specific operations without type checking

**Accept Method:**
- Each element implements accept(visitor)
- Calls visitor.visitElementType(this)
- Enables visitor to access element's type

**Separation of Concerns:**
- Elements define structure
- Visitors define operations
- New operations = new visitor classes

**Open/Closed Principle:**
- Open for extension (new visitors)
- Closed for modification (existing elements)

---

## 💡 When to Use

### Use Visitor When:

✅ **You need to perform operations on a complex object structure**
- Example: AST traversal, document processing, file system operations

✅ **Operations vary by element type**
- Example: Different rendering for different shapes, different export formats

✅ **You want to add new operations without modifying element classes**
- Example: Adding export, validation, or analysis operations

✅ **Element classes are stable but operations change frequently**
- Example: Document structure is fixed, but new operations are added often

✅ **You need to perform operations across a heterogeneous collection**
- Example: Processing different types of nodes in a tree

### Don't Use When:

❌ **Element classes change frequently** - Visitor requires stable element hierarchy
❌ **Operations are simple and don't vary by type** - Overhead not worth it
❌ **You need to access private members** - Visitor needs public interface
❌ **Performance is critical** - Double dispatch has overhead
❌ **Element hierarchy is small and stable** - Direct methods might be simpler

---

## 🔨 Implementation Examples

### Example 1: Basic Visitor Pattern (Shape Rendering)

```typescript
// Element Interface
interface Shape {
  accept(visitor: ShapeVisitor): void;
}

// Concrete Elements
class Circle implements Shape {
  constructor(
    public x: number,
    public y: number,
    public radius: number
  ) {}
  
  accept(visitor: ShapeVisitor): void {
    visitor.visitCircle(this);
  }
}

class Rectangle implements Shape {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}
  
  accept(visitor: ShapeVisitor): void {
    visitor.visitRectangle(this);
  }
}

class Triangle implements Shape {
  constructor(
    public x1: number, public y1: number,
    public x2: number, public y2: number,
    public x3: number, public y3: number
  ) {}
  
  accept(visitor: ShapeVisitor): void {
    visitor.visitTriangle(this);
  }
}

// Visitor Interface
interface ShapeVisitor {
  visitCircle(circle: Circle): void;
  visitRectangle(rectangle: Rectangle): void;
  visitTriangle(triangle: Triangle): void;
}

// Concrete Visitors
class RenderVisitor implements ShapeVisitor {
  visitCircle(circle: Circle): void {
    console.log(
      `Rendering Circle at (${circle.x}, ${circle.y}) ` +
      `with radius ${circle.radius} using Canvas API`
    );
    // In real app: ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
  }
  
  visitRectangle(rectangle: Rectangle): void {
    console.log(
      `Rendering Rectangle at (${rectangle.x}, ${rectangle.y}) ` +
      `with size ${rectangle.width}x${rectangle.height} using Canvas API`
    );
    // In real app: ctx.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
  }
  
  visitTriangle(triangle: Triangle): void {
    console.log(
      `Rendering Triangle with vertices ` +
      `(${triangle.x1}, ${triangle.y1}), ` +
      `(${triangle.x2}, ${triangle.y2}), ` +
      `(${triangle.x3}, ${triangle.y3}) using Canvas API`
    );
    // In real app: ctx.moveTo, ctx.lineTo, etc.
  }
}

class AreaCalculatorVisitor implements ShapeVisitor {
  private totalArea: number = 0;
  
  visitCircle(circle: Circle): void {
    const area = Math.PI * circle.radius * circle.radius;
    this.totalArea += area;
    console.log(`Circle area: ${area.toFixed(2)}`);
  }
  
  visitRectangle(rectangle: Rectangle): void {
    const area = rectangle.width * rectangle.height;
    this.totalArea += area;
    console.log(`Rectangle area: ${area.toFixed(2)}`);
  }
  
  visitTriangle(triangle: Triangle): void {
    const area = Math.abs(
      (triangle.x1 * (triangle.y2 - triangle.y3) +
       triangle.x2 * (triangle.y3 - triangle.y1) +
       triangle.x3 * (triangle.y1 - triangle.y2)) / 2
    );
    this.totalArea += area;
    console.log(`Triangle area: ${area.toFixed(2)}`);
  }
  
  getTotalArea(): number {
    return this.totalArea;
  }
  
  reset(): void {
    this.totalArea = 0;
  }
}

class ExportVisitor implements ShapeVisitor {
  private exportData: string[] = [];
  
  visitCircle(circle: Circle): void {
    this.exportData.push(
      `<circle cx="${circle.x}" cy="${circle.y}" r="${circle.radius}" />`
    );
  }
  
  visitRectangle(rectangle: Rectangle): void {
    this.exportData.push(
      `<rect x="${rectangle.x}" y="${rectangle.y}" ` +
      `width="${rectangle.width}" height="${rectangle.height}" />`
    );
  }
  
  visitTriangle(triangle: Triangle): void {
    this.exportData.push(
      `<polygon points="${triangle.x1},${triangle.y1} ` +
      `${triangle.x2},${triangle.y2} ${triangle.x3},${triangle.y3}" />`
    );
  }
  
  getSVG(): string {
    return `<svg>${this.exportData.join('\n')}</svg>`;
  }
  
  getJSON(): string {
    return JSON.stringify(this.exportData.map((svg, index) => ({
      id: index,
      svg
    })));
  }
}

// Object Structure
class Drawing {
  private shapes: Shape[] = [];
  
  add(shape: Shape): void {
    this.shapes.push(shape);
  }
  
  accept(visitor: ShapeVisitor): void {
    this.shapes.forEach(shape => {
      shape.accept(visitor);
    });
  }
  
  getShapes(): Shape[] {
    return [...this.shapes];
  }
}

// Usage
const drawing = new Drawing();
drawing.add(new Circle(10, 10, 5));
drawing.add(new Rectangle(20, 20, 10, 15));
drawing.add(new Triangle(0, 0, 10, 0, 5, 10));
drawing.add(new Circle(50, 50, 8));

console.log('=== Rendering Shapes ===');
const renderVisitor = new RenderVisitor();
drawing.accept(renderVisitor);

console.log('\n=== Calculating Areas ===');
const areaVisitor = new AreaCalculatorVisitor();
drawing.accept(areaVisitor);
console.log(`Total area: ${areaVisitor.getTotalArea().toFixed(2)}`);

console.log('\n=== Exporting to SVG ===');
const exportVisitor = new ExportVisitor();
drawing.accept(exportVisitor);
console.log(exportVisitor.getSVG());
```

### Example 2: AST (Abstract Syntax Tree) Visitor

```typescript
// Element Interface
interface ASTNode {
  accept(visitor: ASTVisitor): any;
}

// Concrete Elements
class NumberNode implements ASTNode {
  constructor(public value: number) {}
  
  accept(visitor: ASTVisitor): any {
    return visitor.visitNumber(this);
  }
}

class AddNode implements ASTNode {
  constructor(
    public left: ASTNode,
    public right: ASTNode
  ) {}
  
  accept(visitor: ASTVisitor): any {
    return visitor.visitAdd(this);
  }
}

class SubtractNode implements ASTNode {
  constructor(
    public left: ASTNode,
    public right: ASTNode
  ) {}
  
  accept(visitor: ASTVisitor): any {
    return visitor.visitSubtract(this);
  }
}

class MultiplyNode implements ASTNode {
  constructor(
    public left: ASTNode,
    public right: ASTNode
  ) {}
  
  accept(visitor: ASTVisitor): any {
    return visitor.visitMultiply(this);
  }
}

class DivideNode implements ASTNode {
  constructor(
    public left: ASTNode,
    public right: ASTNode
  ) {}
  
  accept(visitor: ASTVisitor): any {
    return visitor.visitDivide(this);
  }
}

// Visitor Interface
interface ASTVisitor {
  visitNumber(node: NumberNode): any;
  visitAdd(node: AddNode): any;
  visitSubtract(node: SubtractNode): any;
  visitMultiply(node: MultiplyNode): any;
  visitDivide(node: DivideNode): any;
}

// Concrete Visitors
class EvaluateVisitor implements ASTVisitor {
  visitNumber(node: NumberNode): number {
    return node.value;
  }
  
  visitAdd(node: AddNode): number {
    return node.left.accept(this) + node.right.accept(this);
  }
  
  visitSubtract(node: SubtractNode): number {
    return node.left.accept(this) - node.right.accept(this);
  }
  
  visitMultiply(node: MultiplyNode): number {
    return node.left.accept(this) * node.right.accept(this);
  }
  
  visitDivide(node: DivideNode): number {
    const right = node.right.accept(this);
    if (right === 0) {
      throw new Error('Division by zero');
    }
    return node.left.accept(this) / right;
  }
}

class PrintVisitor implements ASTVisitor {
  visitNumber(node: NumberNode): string {
    return node.value.toString();
  }
  
  visitAdd(node: AddNode): string {
    return `(${node.left.accept(this)} + ${node.right.accept(this)})`;
  }
  
  visitSubtract(node: SubtractNode): string {
    return `(${node.left.accept(this)} - ${node.right.accept(this)})`;
  }
  
  visitMultiply(node: MultiplyNode): string {
    return `(${node.left.accept(this)} * ${node.right.accept(this)})`;
  }
  
  visitDivide(node: DivideNode): string {
    return `(${node.left.accept(this)} / ${node.right.accept(this)})`;
  }
}

class OptimizeVisitor implements ASTVisitor {
  visitNumber(node: NumberNode): ASTNode {
    return node; // Numbers are already optimized
  }
  
  visitAdd(node: AddNode): ASTNode {
    const left = node.left.accept(this);
    const right = node.right.accept(this);
    
    // Optimize: 0 + x = x
    if (left instanceof NumberNode && left.value === 0) {
      return right;
    }
    if (right instanceof NumberNode && right.value === 0) {
      return left;
    }
    
    // Optimize: constant folding
    if (left instanceof NumberNode && right instanceof NumberNode) {
      return new NumberNode(left.value + right.value);
    }
    
    return new AddNode(left, right);
  }
  
  visitSubtract(node: SubtractNode): ASTNode {
    const left = node.left.accept(this);
    const right = node.right.accept(this);
    
    // Optimize: x - 0 = x
    if (right instanceof NumberNode && right.value === 0) {
      return left;
    }
    
    // Optimize: constant folding
    if (left instanceof NumberNode && right instanceof NumberNode) {
      return new NumberNode(left.value - right.value);
    }
    
    return new SubtractNode(left, right);
  }
  
  visitMultiply(node: MultiplyNode): ASTNode {
    const left = node.left.accept(this);
    const right = node.right.accept(this);
    
    // Optimize: 0 * x = 0
    if ((left instanceof NumberNode && left.value === 0) ||
        (right instanceof NumberNode && right.value === 0)) {
      return new NumberNode(0);
    }
    
    // Optimize: 1 * x = x
    if (left instanceof NumberNode && left.value === 1) {
      return right;
    }
    if (right instanceof NumberNode && right.value === 1) {
      return left;
    }
    
    // Optimize: constant folding
    if (left instanceof NumberNode && right instanceof NumberNode) {
      return new NumberNode(left.value * right.value);
    }
    
    return new MultiplyNode(left, right);
  }
  
  visitDivide(node: DivideNode): ASTNode {
    const left = node.left.accept(this);
    const right = node.right.accept(this);
    
    // Optimize: x / 1 = x
    if (right instanceof NumberNode && right.value === 1) {
      return left;
    }
    
    // Optimize: constant folding
    if (left instanceof NumberNode && right instanceof NumberNode) {
      if (right.value === 0) {
        throw new Error('Division by zero');
      }
      return new NumberNode(left.value / right.value);
    }
    
    return new DivideNode(left, right);
  }
}

class CodeGeneratorVisitor implements ASTVisitor {
  visitNumber(node: NumberNode): string {
    return node.value.toString();
  }
  
  visitAdd(node: AddNode): string {
    return `(${node.left.accept(this)} + ${node.right.accept(this)})`;
  }
  
  visitSubtract(node: SubtractNode): string {
    return `(${node.left.accept(this)} - ${node.right.accept(this)})`;
  }
  
  visitMultiply(node: MultiplyNode): string {
    return `(${node.left.accept(this)} * ${node.right.accept(this)})`;
  }
  
  visitDivide(node: DivideNode): string {
    return `(${node.left.accept(this)} / ${node.right.accept(this)})`;
  }
  
  generateJavaScript(ast: ASTNode): string {
    return `const result = ${ast.accept(this)};`;
  }
  
  generatePython(ast: ASTNode): string {
    return `result = ${ast.accept(this)}`;
  }
}

// Usage
// Build AST: (2 + 3) * (4 - 1)
const ast = new MultiplyNode(
  new AddNode(
    new NumberNode(2),
    new NumberNode(3)
  ),
  new SubtractNode(
    new NumberNode(4),
    new NumberNode(1)
  )
);

console.log('=== Evaluating AST ===');
const evaluateVisitor = new EvaluateVisitor();
const result = ast.accept(evaluateVisitor);
console.log(`Result: ${result}`);

console.log('\n=== Printing AST ===');
const printVisitor = new PrintVisitor();
console.log(`Expression: ${ast.accept(printVisitor)}`);

console.log('\n=== Optimizing AST ===');
const optimizeVisitor = new OptimizeVisitor();
const optimized = ast.accept(optimizeVisitor);
console.log(`Original: ${ast.accept(printVisitor)}`);
console.log(`Optimized: ${optimized.accept(printVisitor)}`);
console.log(`Optimized result: ${optimized.accept(evaluateVisitor)}`);

console.log('\n=== Generating Code ===');
const codeGenVisitor = new CodeGeneratorVisitor();
console.log(`JavaScript: ${codeGenVisitor.generateJavaScript(ast)}`);
console.log(`Python: ${codeGenVisitor.generatePython(ast)}`);
```

### Example 3: Document Processing (HTML/XML)

```typescript
// Element Interface
interface DocumentNode {
  accept(visitor: DocumentVisitor): void;
}

// Concrete Elements
class TextNode implements DocumentNode {
  constructor(public content: string) {}
  
  accept(visitor: DocumentVisitor): void {
    visitor.visitText(this);
  }
}

class ElementNode implements DocumentNode {
  private children: DocumentNode[] = [];
  
  constructor(
    public tagName: string,
    public attributes: Map<string, string> = new Map()
  ) {}
  
  addChild(child: DocumentNode): void {
    this.children.push(child);
  }
  
  getChildren(): DocumentNode[] {
    return [...this.children];
  }
  
  accept(visitor: DocumentVisitor): void {
    visitor.visitElement(this);
    this.children.forEach(child => {
      child.accept(visitor);
    });
  }
}

// Visitor Interface
interface DocumentVisitor {
  visitText(node: TextNode): void;
  visitElement(node: ElementNode): void;
}

// Concrete Visitors
class HTMLRendererVisitor implements DocumentVisitor {
  private output: string = '';
  private indent: number = 0;
  
  visitText(node: TextNode): void {
    this.output += ' '.repeat(this.indent) + node.content + '\n';
  }
  
  visitElement(node: ElementNode): void {
    const attrs = Array.from(node.attributes.entries())
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    const attrsStr = attrs ? ' ' + attrs : '';
    
    this.output += ' '.repeat(this.indent) + `<${node.tagName}${attrsStr}>\n`;
    this.indent += 2;
    
    // Children are visited automatically via accept
    
    this.indent -= 2;
    this.output += ' '.repeat(this.indent) + `</${node.tagName}>\n`;
  }
  
  getHTML(): string {
    return this.output;
  }
  
  reset(): void {
    this.output = '';
    this.indent = 0;
  }
}

class TextExtractorVisitor implements DocumentVisitor {
  private text: string = '';
  
  visitText(node: TextNode): void {
    this.text += node.content + ' ';
  }
  
  visitElement(node: ElementNode): void {
    // Just traverse, text extraction happens in visitText
  }
  
  getText(): string {
    return this.text.trim();
  }
  
  reset(): void {
    this.text = '';
  }
}

class LinkExtractorVisitor implements DocumentVisitor {
  private links: Array<{ text: string; href: string }> = [];
  
  visitText(node: TextNode): void {
    // Links are in element nodes
  }
  
  visitElement(node: ElementNode): void {
    if (node.tagName === 'a') {
      const href = node.attributes.get('href') || '';
      const textVisitor = new TextExtractorVisitor();
      node.getChildren().forEach(child => child.accept(textVisitor));
      const text = textVisitor.getText();
      this.links.push({ text, href });
    }
  }
  
  getLinks(): Array<{ text: string; href: string }> {
    return [...this.links];
  }
  
  reset(): void {
    this.links = [];
  }
}

class WordCountVisitor implements DocumentVisitor {
  private wordCount: number = 0;
  
  visitText(node: TextNode): void {
    const words = node.content.trim().split(/\s+/).filter(word => word.length > 0);
    this.wordCount += words.length;
  }
  
  visitElement(node: ElementNode): void {
    // Just traverse
  }
  
  getWordCount(): number {
    return this.wordCount;
  }
  
  reset(): void {
    this.wordCount = 0;
  }
}

class ValidatorVisitor implements DocumentVisitor {
  private errors: string[] = [];
  
  visitText(node: TextNode): void {
    // Text nodes are always valid
  }
  
  visitElement(node: ElementNode): void {
    // Validate tag name
    if (!node.tagName.match(/^[a-z][a-z0-9]*$/i)) {
      this.errors.push(`Invalid tag name: ${node.tagName}`);
    }
    
    // Validate required attributes
    if (node.tagName === 'a' && !node.attributes.has('href')) {
      this.errors.push('Anchor tag missing href attribute');
    }
    
    if (node.tagName === 'img' && !node.attributes.has('alt')) {
      this.errors.push('Image tag missing alt attribute');
    }
  }
  
  getErrors(): string[] {
    return [...this.errors];
  }
  
  isValid(): boolean {
    return this.errors.length === 0;
  }
  
  reset(): void {
    this.errors = [];
  }
}

// Usage
const document = new ElementNode('html');
const head = new ElementNode('head');
const title = new ElementNode('title');
title.addChild(new TextNode('My Page'));
head.addChild(title);
document.addChild(head);

const body = new ElementNode('body');
const h1 = new ElementNode('h1');
h1.addChild(new TextNode('Welcome'));
body.addChild(h1);

const p = new ElementNode('p');
p.addChild(new TextNode('This is a paragraph with '));
const link = new ElementNode('a');
link.attributes.set('href', 'https://example.com');
link.addChild(new TextNode('a link'));
p.addChild(link);
p.addChild(new TextNode(' in it.'));
body.addChild(p);

const img = new ElementNode('img');
img.attributes.set('src', 'image.jpg');
body.addChild(img);

document.addChild(body);

console.log('=== Rendering HTML ===');
const renderer = new HTMLRendererVisitor();
document.accept(renderer);
console.log(renderer.getHTML());

console.log('=== Extracting Text ===');
const textExtractor = new TextExtractorVisitor();
document.accept(textExtractor);
console.log(`Text: ${textExtractor.getText()}`);

console.log('\n=== Extracting Links ===');
const linkExtractor = new LinkExtractorVisitor();
document.accept(linkExtractor);
linkExtractor.getLinks().forEach(link => {
  console.log(`Link: "${link.text}" -> ${link.href}`);
});

console.log('\n=== Word Count ===');
const wordCounter = new WordCountVisitor();
document.accept(wordCounter);
console.log(`Total words: ${wordCounter.getWordCount()}`);

console.log('\n=== Validating Document ===');
const validator = new ValidatorVisitor();
document.accept(validator);
if (validator.isValid()) {
  console.log('Document is valid!');
} else {
  console.log('Validation errors:');
  validator.getErrors().forEach(error => console.log(`  - ${error}`));
}
```

### Example 4: File System Operations

```typescript
// Element Interface
interface FileSystemNode {
  accept(visitor: FileSystemVisitor): void;
  getName(): string;
  getPath(): string;
}

// Concrete Elements
class File implements FileSystemNode {
  constructor(
    private name: string,
    private path: string,
    private size: number,
    private content: string = ''
  ) {}
  
  getName(): string {
    return this.name;
  }
  
  getPath(): string {
    return this.path;
  }
  
  getSize(): number {
    return this.size;
  }
  
  getContent(): string {
    return this.content;
  }
  
  accept(visitor: FileSystemVisitor): void {
    visitor.visitFile(this);
  }
}

class Directory implements FileSystemNode {
  private children: FileSystemNode[] = [];
  
  constructor(
    private name: string,
    private path: string
  ) {}
  
  getName(): string {
    return this.name;
  }
  
  getPath(): string {
    return this.path;
  }
  
  addChild(child: FileSystemNode): void {
    this.children.push(child);
  }
  
  getChildren(): FileSystemNode[] {
    return [...this.children];
  }
  
  accept(visitor: FileSystemVisitor): void {
    visitor.visitDirectory(this);
    this.children.forEach(child => {
      child.accept(visitor);
    });
  }
}

// Visitor Interface
interface FileSystemVisitor {
  visitFile(file: File): void;
  visitDirectory(directory: Directory): void;
}

// Concrete Visitors
class SizeCalculatorVisitor implements FileSystemVisitor {
  private totalSize: number = 0;
  
  visitFile(file: File): void {
    this.totalSize += file.getSize();
  }
  
  visitDirectory(directory: Directory): void {
    // Size calculated from files
  }
  
  getTotalSize(): number {
    return this.totalSize;
  }
  
  reset(): void {
    this.totalSize = 0;
  }
}

class SearchVisitor implements FileSystemVisitor {
  private results: FileSystemNode[] = [];
  private searchTerm: string;
  
  constructor(searchTerm: string) {
    this.searchTerm = searchTerm.toLowerCase();
  }
  
  visitFile(file: File): void {
    if (file.getName().toLowerCase().includes(this.searchTerm) ||
        file.getContent().toLowerCase().includes(this.searchTerm)) {
      this.results.push(file);
    }
  }
  
  visitDirectory(directory: Directory): void {
    if (directory.getName().toLowerCase().includes(this.searchTerm)) {
      this.results.push(directory);
    }
  }
  
  getResults(): FileSystemNode[] {
    return [...this.results];
  }
  
  reset(): void {
    this.results = [];
  }
}

class FileTypeCounterVisitor implements FileSystemVisitor {
  private counts: Map<string, number> = new Map();
  
  visitFile(file: File): void {
    const extension = this.getExtension(file.getName());
    const count = this.counts.get(extension) || 0;
    this.counts.set(extension, count + 1);
  }
  
  visitDirectory(directory: Directory): void {
    // Directories don't have extensions
  }
  
  private getExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot > 0 ? filename.substring(lastDot + 1) : 'no-extension';
  }
  
  getCounts(): Map<string, number> {
    return new Map(this.counts);
  }
  
  reset(): void {
    this.counts.clear();
  }
}

class BackupVisitor implements FileSystemVisitor {
  private backup: Array<{ path: string; type: string; size?: number }> = [];
  
  visitFile(file: File): void {
    this.backup.push({
      path: file.getPath(),
      type: 'file',
      size: file.getSize()
    });
  }
  
  visitDirectory(directory: Directory): void {
    this.backup.push({
      path: directory.getPath(),
      type: 'directory'
    });
  }
  
  getBackup(): Array<{ path: string; type: string; size?: number }> {
    return [...this.backup];
  }
  
  generateBackupScript(): string {
    const lines = this.backup.map(item => {
      if (item.type === 'directory') {
        return `mkdir -p "${item.path}"`;
      } else {
        return `cp "${item.path}" "${item.path}.backup"`;
      }
    });
    return lines.join('\n');
  }
  
  reset(): void {
    this.backup = [];
  }
}

// Usage
const root = new Directory('root', '/root');
const documents = new Directory('documents', '/root/documents');
const photos = new Directory('photos', '/root/photos');

documents.addChild(new File('readme.txt', '/root/documents/readme.txt', 1024, 'This is a readme file'));
documents.addChild(new File('notes.md', '/root/documents/notes.md', 2048, 'Some notes here'));
photos.addChild(new File('vacation.jpg', '/root/photos/vacation.jpg', 1024000));
photos.addChild(new File('family.png', '/root/photos/family.png', 2048000));

root.addChild(documents);
root.addChild(photos);

console.log('=== Calculating Total Size ===');
const sizeCalculator = new SizeCalculatorVisitor();
root.accept(sizeCalculator);
console.log(`Total size: ${sizeCalculator.getTotalSize()} bytes`);

console.log('\n=== Searching for Files ===');
const searchVisitor = new SearchVisitor('readme');
root.accept(searchVisitor);
console.log('Search results:');
searchVisitor.getResults().forEach(result => {
  console.log(`  - ${result.getPath()}`);
});

console.log('\n=== Counting File Types ===');
const typeCounter = new FileTypeCounterVisitor();
root.accept(typeCounter);
console.log('File type counts:');
typeCounter.getCounts().forEach((count, extension) => {
  console.log(`  .${extension}: ${count} files`);
});

console.log('\n=== Generating Backup Script ===');
const backupVisitor = new BackupVisitor();
root.accept(backupVisitor);
console.log(backupVisitor.generateBackupScript());
```

### Example 5: Expression Evaluator with Multiple Outputs

```typescript
// Element Interface
interface Expression {
  accept(visitor: ExpressionVisitor): any;
}

// Concrete Elements
class Variable implements Expression {
  constructor(public name: string) {}
  
  accept(visitor: ExpressionVisitor): any {
    return visitor.visitVariable(this);
  }
}

class Constant implements Expression {
  constructor(public value: number) {}
  
  accept(visitor: ExpressionVisitor): any {
    return visitor.visitConstant(this);
  }
}

class BinaryExpression implements Expression {
  constructor(
    public operator: string,
    public left: Expression,
    public right: Expression
  ) {}
  
  accept(visitor: ExpressionVisitor): any {
    return visitor.visitBinaryExpression(this);
  }
}

// Visitor Interface
interface ExpressionVisitor {
  visitVariable(variable: Variable): any;
  visitConstant(constant: Constant): any;
  visitBinaryExpression(expr: BinaryExpression): any;
}

// Concrete Visitors
class EvaluateVisitor implements ExpressionVisitor {
  private variables: Map<string, number>;
  
  constructor(variables: Map<string, number> = new Map()) {
    this.variables = variables;
  }
  
  visitVariable(variable: Variable): number {
    const value = this.variables.get(variable.name);
    if (value === undefined) {
      throw new Error(`Variable ${variable.name} is not defined`);
    }
    return value;
  }
  
  visitConstant(constant: Constant): number {
    return constant.value;
  }
  
  visitBinaryExpression(expr: BinaryExpression): number {
    const left = expr.left.accept(this);
    const right = expr.right.accept(this);
    
    switch (expr.operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/':
        if (right === 0) throw new Error('Division by zero');
        return left / right;
      case '^': return Math.pow(left, right);
      default: throw new Error(`Unknown operator: ${expr.operator}`);
    }
  }
}

class DifferentiateVisitor implements ExpressionVisitor {
  constructor(private variable: string) {}
  
  visitVariable(variable: Variable): Expression {
    if (variable.name === this.variable) {
      return new Constant(1); // d/dx(x) = 1
    }
    return new Constant(0); // d/dx(constant) = 0
  }
  
  visitConstant(constant: Constant): Expression {
    return new Constant(0); // d/dx(constant) = 0
  }
  
  visitBinaryExpression(expr: BinaryExpression): Expression {
    const left = expr.left.accept(this);
    const right = expr.right.accept(this);
    
    switch (expr.operator) {
      case '+':
      case '-':
        return new BinaryExpression(expr.operator, left, right);
      case '*':
        // Product rule: (f*g)' = f'*g + f*g'
        return new BinaryExpression(
          '+',
          new BinaryExpression('*', left, expr.right),
          new BinaryExpression('*', expr.left, right)
        );
      case '/':
        // Quotient rule: (f/g)' = (f'*g - f*g') / g^2
        return new BinaryExpression(
          '/',
          new BinaryExpression(
            '-',
            new BinaryExpression('*', left, expr.right),
            new BinaryExpression('*', expr.left, right)
          ),
          new BinaryExpression('^', expr.right, new Constant(2))
        );
      case '^':
        // Power rule (simplified): (x^n)' = n*x^(n-1)
        if (expr.right instanceof Constant) {
          return new BinaryExpression(
            '*',
            expr.right,
            new BinaryExpression(
              '^',
              expr.left,
              new Constant(expr.right.value - 1)
            )
          );
        }
        throw new Error('Complex power rule not implemented');
      default:
        throw new Error(`Unknown operator: ${expr.operator}`);
    }
  }
}

class SimplifyVisitor implements ExpressionVisitor {
  visitVariable(variable: Variable): Expression {
    return variable;
  }
  
  visitConstant(constant: Constant): Expression {
    return constant;
  }
  
  visitBinaryExpression(expr: BinaryExpression): Expression {
    const left = expr.left.accept(this);
    const right = expr.right.accept(this);
    
    // Constant folding
    if (left instanceof Constant && right instanceof Constant) {
      const evalVisitor = new EvaluateVisitor();
      const result = new BinaryExpression(expr.operator, left, right).accept(evalVisitor);
      return new Constant(result);
    }
    
    // Simplify: x + 0 = x, x * 1 = x, etc.
    if (expr.operator === '+' && right instanceof Constant && right.value === 0) {
      return left;
    }
    if (expr.operator === '+' && left instanceof Constant && left.value === 0) {
      return right;
    }
    if (expr.operator === '*' && right instanceof Constant && right.value === 1) {
      return left;
    }
    if (expr.operator === '*' && left instanceof Constant && left.value === 1) {
      return right;
    }
    if (expr.operator === '*' && (right instanceof Constant && right.value === 0 ||
                                   left instanceof Constant && left.value === 0)) {
      return new Constant(0);
    }
    
    return new BinaryExpression(expr.operator, left, right);
  }
}

class PrintVisitor implements ExpressionVisitor {
  visitVariable(variable: Variable): string {
    return variable.name;
  }
  
  visitConstant(constant: Constant): string {
    return constant.value.toString();
  }
  
  visitBinaryExpression(expr: BinaryExpression): string {
    return `(${expr.left.accept(this)} ${expr.operator} ${expr.right.accept(this)})`;
  }
}

// Usage
// Expression: x^2 + 2*x + 1
const x = new Variable('x');
const expr = new BinaryExpression(
  '+',
  new BinaryExpression('+', new BinaryExpression('^', x, new Constant(2)),
                       new BinaryExpression('*', new Constant(2), x)),
  new Constant(1)
);

console.log('=== Original Expression ===');
const printVisitor = new PrintVisitor();
console.log(`Expression: ${expr.accept(printVisitor)}`);

console.log('\n=== Evaluating Expression ===');
const evalVisitor = new EvaluateVisitor(new Map([['x', 3]]));
const result = expr.accept(evalVisitor);
console.log(`When x = 3: ${result}`);

console.log('\n=== Differentiating Expression ===');
const diffVisitor = new DifferentiateVisitor('x');
const derivative = expr.accept(diffVisitor);
console.log(`Derivative: ${derivative.accept(printVisitor)}`);

console.log('\n=== Simplifying Derivative ===');
const simplifyVisitor = new SimplifyVisitor();
const simplified = derivative.accept(simplifyVisitor);
console.log(`Simplified: ${simplified.accept(printVisitor)}`);

console.log('\n=== Evaluating Derivative ===');
const derivativeEval = new EvaluateVisitor(new Map([['x', 3]]));
const derivativeResult = simplified.accept(derivativeEval);
console.log(`When x = 3: ${derivativeResult}`);
```

### Example 6: Compiler/Interpreter Operations

```typescript
// Element Interface
interface Statement {
  accept(visitor: StatementVisitor): void;
}

// Concrete Elements
class AssignmentStatement implements Statement {
  constructor(
    public variable: string,
    public expression: Expression
  ) {}
  
  accept(visitor: StatementVisitor): void {
    visitor.visitAssignment(this);
  }
}

class IfStatement implements Statement {
  constructor(
    public condition: Expression,
    public thenBranch: Statement[],
    public elseBranch: Statement[] = []
  ) {}
  
  accept(visitor: StatementVisitor): void {
    visitor.visitIf(this);
  }
}

class WhileStatement implements Statement {
  constructor(
    public condition: Expression,
    public body: Statement[]
  ) {}
  
  accept(visitor: StatementVisitor): void {
    visitor.visitWhile(this);
  }
}

class PrintStatement implements Statement {
  constructor(public expression: Expression) {}
  
  accept(visitor: StatementVisitor): void {
    visitor.visitPrint(this);
  }
}

// Simple Expression for this example
interface Expression {
  accept(visitor: ExpressionVisitor): any;
}

class NumberExpr implements Expression {
  constructor(public value: number) {}
  accept(visitor: ExpressionVisitor): any {
    return visitor.visitNumber(this);
  }
}

class VariableExpr implements Expression {
  constructor(public name: string) {}
  accept(visitor: ExpressionVisitor): any {
    return visitor.visitVariable(this);
  }
}

class BinaryExpr implements Expression {
  constructor(
    public operator: string,
    public left: Expression,
    public right: Expression
  ) {}
  accept(visitor: ExpressionVisitor): any {
    return visitor.visitBinary(this);
  }
}

// Visitor Interfaces
interface StatementVisitor {
  visitAssignment(stmt: AssignmentStatement): void;
  visitIf(stmt: IfStatement): void;
  visitWhile(stmt: WhileStatement): void;
  visitPrint(stmt: PrintStatement): void;
}

interface ExpressionVisitor {
  visitNumber(expr: NumberExpr): any;
  visitVariable(expr: VariableExpr): any;
  visitBinary(expr: BinaryExpr): any;
}

// Concrete Visitors
class InterpreterVisitor implements StatementVisitor, ExpressionVisitor {
  private variables: Map<string, number> = new Map();
  private output: string[] = [];
  
  visitAssignment(stmt: AssignmentStatement): void {
    const value = stmt.expression.accept(this);
    this.variables.set(stmt.variable, value);
  }
  
  visitIf(stmt: IfStatement): void {
    const condition = stmt.condition.accept(this);
    if (condition) {
      stmt.thenBranch.forEach(s => s.accept(this));
    } else {
      stmt.elseBranch.forEach(s => s.accept(this));
    }
  }
  
  visitWhile(stmt: WhileStatement): void {
    while (stmt.condition.accept(this)) {
      stmt.body.forEach(s => s.accept(this));
    }
  }
  
  visitPrint(stmt: PrintStatement): void {
    const value = stmt.expression.accept(this);
    this.output.push(value.toString());
  }
  
  visitNumber(expr: NumberExpr): number {
    return expr.value;
  }
  
  visitVariable(expr: VariableExpr): number {
    const value = this.variables.get(expr.name);
    if (value === undefined) {
      throw new Error(`Variable ${expr.name} is not defined`);
    }
    return value;
  }
  
  visitBinary(expr: BinaryExpr): number {
    const left = expr.left.accept(this);
    const right = expr.right.accept(this);
    
    switch (expr.operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      case '>': return left > right ? 1 : 0;
      case '<': return left < right ? 1 : 0;
      case '==': return left === right ? 1 : 0;
      default: throw new Error(`Unknown operator: ${expr.operator}`);
    }
  }
  
  getOutput(): string[] {
    return [...this.output];
  }
  
  reset(): void {
    this.variables.clear();
    this.output = [];
  }
}

class CodeGeneratorVisitor implements StatementVisitor, ExpressionVisitor {
  private code: string[] = [];
  private indent: number = 0;
  
  private addLine(line: string): void {
    this.code.push('  '.repeat(this.indent) + line);
  }
  
  visitAssignment(stmt: AssignmentStatement): void {
    const expr = stmt.expression.accept(this);
    this.addLine(`${stmt.variable} = ${expr}`);
  }
  
  visitIf(stmt: IfStatement): void {
    const condition = stmt.condition.accept(this);
    this.addLine(`if ${condition}:`);
    this.indent++;
    stmt.thenBranch.forEach(s => s.accept(this));
    this.indent--;
    if (stmt.elseBranch.length > 0) {
      this.addLine('else:');
      this.indent++;
      stmt.elseBranch.forEach(s => s.accept(this));
      this.indent--;
    }
  }
  
  visitWhile(stmt: WhileStatement): void {
    const condition = stmt.condition.accept(this);
    this.addLine(`while ${condition}:`);
    this.indent++;
    stmt.body.forEach(s => s.accept(this));
    this.indent--;
  }
  
  visitPrint(stmt: PrintStatement): void {
    const expr = stmt.expression.accept(this);
    this.addLine(`print(${expr})`);
  }
  
  visitNumber(expr: NumberExpr): string {
    return expr.value.toString();
  }
  
  visitVariable(expr: VariableExpr): string {
    return expr.name;
  }
  
  visitBinary(expr: BinaryExpr): string {
    return `(${expr.left.accept(this)} ${expr.operator} ${expr.right.accept(this)})`;
  }
  
  getCode(): string {
    return this.code.join('\n');
  }
  
  reset(): void {
    this.code = [];
    this.indent = 0;
  }
}

class TypeCheckerVisitor implements StatementVisitor, ExpressionVisitor {
  private variables: Map<string, string> = new Map(); // variable -> type
  private errors: string[] = [];
  
  visitAssignment(stmt: AssignmentStatement): void {
    const type = stmt.expression.accept(this);
    this.variables.set(stmt.variable, type);
  }
  
  visitIf(stmt: IfStatement): void {
    const conditionType = stmt.condition.accept(this);
    if (conditionType !== 'number') {
      this.errors.push('If condition must be a number (boolean)');
    }
    stmt.thenBranch.forEach(s => s.accept(this));
    stmt.elseBranch.forEach(s => s.accept(this));
  }
  
  visitWhile(stmt: WhileStatement): void {
    const conditionType = stmt.condition.accept(this);
    if (conditionType !== 'number') {
      this.errors.push('While condition must be a number (boolean)');
    }
    stmt.body.forEach(s => s.accept(this));
  }
  
  visitPrint(stmt: PrintStatement): void {
    stmt.expression.accept(this);
  }
  
  visitNumber(expr: NumberExpr): string {
    return 'number';
  }
  
  visitVariable(expr: VariableExpr): string {
    const type = this.variables.get(expr.name);
    if (!type) {
      this.errors.push(`Variable ${expr.name} used before assignment`);
      return 'unknown';
    }
    return type;
  }
  
  visitBinary(expr: BinaryExpr): string {
    const leftType = expr.left.accept(this);
    const rightType = expr.right.accept(this);
    
    if (leftType !== 'number' || rightType !== 'number') {
      this.errors.push(`Binary operation ${expr.operator} requires number operands`);
      return 'unknown';
    }
    
    return 'number';
  }
  
  getErrors(): string[] {
    return [...this.errors];
  }
  
  isValid(): boolean {
    return this.errors.length === 0;
  }
  
  reset(): void {
    this.variables.clear();
    this.errors = [];
  }
}

// Usage
const program: Statement[] = [
  new AssignmentStatement('x', new NumberExpr(10)),
  new AssignmentStatement('y', new NumberExpr(5)),
  new IfStatement(
    new BinaryExpr('>', new VariableExpr('x'), new VariableExpr('y')),
    [
      new PrintStatement(new VariableExpr('x'))
    ],
    [
      new PrintStatement(new VariableExpr('y'))
    ]
  ),
  new WhileStatement(
    new BinaryExpr('>', new VariableExpr('x'), new NumberExpr(0)),
    [
      new PrintStatement(new VariableExpr('x')),
      new AssignmentStatement('x', new BinaryExpr('-', new VariableExpr('x'), new NumberExpr(1)))
    ]
  )
];

console.log('=== Type Checking ===');
const typeChecker = new TypeCheckerVisitor();
program.forEach(stmt => stmt.accept(typeChecker));
if (typeChecker.isValid()) {
  console.log('Program is type-safe!');
} else {
  console.log('Type errors:');
  typeChecker.getErrors().forEach(error => console.log(`  - ${error}`));
}

console.log('\n=== Generating Code ===');
const codeGen = new CodeGeneratorVisitor();
program.forEach(stmt => stmt.accept(codeGen));
console.log(codeGen.getCode());

console.log('\n=== Executing Program ===');
const interpreter = new InterpreterVisitor();
program.forEach(stmt => stmt.accept(interpreter));
console.log('Output:');
interpreter.getOutput().forEach(line => console.log(`  ${line}`));
```

---

## 🔄 Visitor vs Other Patterns

### Visitor vs Strategy

| Aspect | Visitor | Strategy |
|--------|---------|----------|
| **Purpose** | Add operations to object structure | Encapsulate algorithms |
| **Structure** | Works on multiple object types | Works on single object |
| **When** | Operations vary by element type | Need interchangeable algorithms |
| **Focus** | External operations on structure | Internal algorithm selection |

**Example:**
- **Visitor**: Different rendering for different shapes
- **Strategy**: Different sorting algorithms

### Visitor vs Iterator

| Aspect | Visitor | Iterator |
|--------|---------|----------|
| **Purpose** | Perform operations on elements | Traverse elements |
| **Focus** | Operations vary by type | Sequential access |
| **When** | Need type-specific operations | Need to iterate |
| **Can Combine** | Yes - Iterator for traversal, Visitor for operations |

**Example:**
- **Visitor**: Render, export, validate elements
- **Iterator**: Traverse tree structure

### Visitor vs Command

| Aspect | Visitor | Command |
|--------|---------|---------|
| **Purpose** | Add operations to structure | Encapsulate requests |
| **Structure** | Works on object structure | Encapsulates single operation |
| **When** | Operations on multiple types | Need undo/redo, queuing |
| **Focus** | Type-specific operations | Request encapsulation |

**Example:**
- **Visitor**: Process AST nodes differently
- **Command**: Undoable operations

### Visitor vs Composite

| Aspect | Visitor | Composite |
|--------|---------|-----------|
| **Purpose** | Add operations | Build tree structures |
| **Focus** | Operations on structure | Structure organization |
| **When** | Need type-specific operations | Need hierarchies |
| **Can Combine** | Yes - Visitor operates on Composite structure |

**Example:**
- **Visitor**: Render, export composite tree
- **Composite**: Build file system tree

---

## 🎨 Real-World Applications

### 1. Compiler/Interpreter Design

```typescript
// AST nodes accept visitors for:
// - Type checking
// - Code generation
// - Optimization
// - Static analysis
```

### 2. Document Processing

```typescript
// Document nodes accept visitors for:
// - Rendering (HTML, PDF, Markdown)
// - Validation
// - Transformation
// - Analysis
```

### 3. File System Operations

```typescript
// File system nodes accept visitors for:
// - Backup
// - Search
// - Size calculation
// - Permission checking
```

### 4. GUI Frameworks

```typescript
// UI components accept visitors for:
// - Rendering
// - Event handling
// - Layout calculation
// - Accessibility checking
```

### 5. Database Query Processing

```typescript
// Query nodes accept visitors for:
// - Optimization
// - Execution planning
// - Validation
// - Cost estimation
```

### 6. Game Engines

```typescript
// Game objects accept visitors for:
// - Rendering
// - Collision detection
// - Physics updates
// - Serialization
```

---

## ⚠️ Common Pitfalls and Best Practices

### Pitfalls

❌ **Breaking Encapsulation**
- Problem: Visitor needs access to element internals
- Solution: Provide public interface or use friend classes

```typescript
// ❌ Bad: Visitor accesses private members
class BadElement {
  private secret: string; // Private!
}

class BadVisitor {
  visit(element: BadElement) {
    console.log(element.secret); // Error!
  }
}

// ✅ Good: Public interface
class GoodElement {
  public getData(): string {
    return this.secret;
  }
}

class GoodVisitor {
  visit(element: GoodElement) {
    console.log(element.getData()); // OK!
  }
}
```

❌ **Adding New Element Types**
- Problem: Adding new element requires updating all visitors
- Solution: Use default implementations or abstract base visitor

```typescript
// ❌ Bad: All visitors must implement new method
interface Visitor {
  visitA(element: A): void;
  visitB(element: B): void;
  visitC(element: C): void; // New - breaks all visitors!
}

// ✅ Good: Default implementation
abstract class BaseVisitor implements Visitor {
  visitA(element: A): void {
    // Default implementation
  }
  visitB(element: B): void {
    // Default implementation
  }
  visitC(element: C): void {
    // Default implementation - new visitors can override
  }
}
```

❌ **Visitor State Management**
- Problem: Visitor accumulates state incorrectly
- Solution: Reset state or create new visitor instances

```typescript
// ❌ Bad: State not reset
class BadVisitor {
  private count: number = 0;
  
  visit(element: Element) {
    this.count++;
  }
  
  // Forgot to reset!
}

// ✅ Good: Reset method
class GoodVisitor {
  private count: number = 0;
  
  visit(element: Element) {
    this.count++;
  }
  
  reset(): void {
    this.count = 0;
  }
  
  getCount(): number {
    return this.count;
  }
}
```

❌ **Circular Dependencies**
- Problem: Elements and visitors depend on each other
- Solution: Use interfaces and dependency inversion

```typescript
// ❌ Bad: Circular dependency
class Element {
  accept(visitor: ConcreteVisitor) { } // Depends on concrete visitor
}

// ✅ Good: Dependency inversion
class Element {
  accept(visitor: Visitor) { } // Depends on interface
}
```

### Best Practices

✅ **Use Interfaces for Visitors**
- Define visitor interface
- Elements depend on interface, not concrete visitors
- Enables multiple visitor implementations

✅ **Provide Default Implementations**
- Abstract base visitor with default behavior
- New visitors extend base, override only needed methods
- Reduces boilerplate

```typescript
// ✅ Good: Base visitor
abstract class BaseVisitor implements Visitor {
  visitA(element: A): void {
    // Default: do nothing
  }
  
  visitB(element: B): void {
    // Default: do nothing
  }
}

class ConcreteVisitor extends BaseVisitor {
  visitA(element: A): void {
    // Override only what's needed
    console.log('Processing A');
  }
}
```

✅ **Separate State from Behavior**
- Visitor methods should be stateless or manage state explicitly
- Use reset methods for reusable visitors
- Consider creating new visitor instances for each operation

✅ **Document Element Requirements**
- Document what methods/elements visitor needs
- Make dependencies explicit
- Help users understand visitor requirements

✅ **Handle Missing Methods Gracefully**
- Provide default implementations
- Throw meaningful errors if method must be implemented
- Consider optional visitor methods

✅ **Consider Visitor Composition**
- Combine multiple visitors
- Chain visitors for complex operations
- Use visitor decorators

```typescript
// ✅ Good: Visitor composition
class CompositeVisitor implements Visitor {
  private visitors: Visitor[];
  
  constructor(visitors: Visitor[]) {
    this.visitors = visitors;
  }
  
  visitA(element: A): void {
    this.visitors.forEach(v => v.visitA(element));
  }
}
```

---

## 🧪 Testing Visitor

### Unit Testing

```typescript
describe('Visitor Pattern', () => {
  describe('Element Accept', () => {
    it('should call correct visitor method', () => {
      const element = new Circle(10, 10, 5);
      const visitor = {
        visitCircle: jest.fn(),
        visitRectangle: jest.fn()
      };
      
      element.accept(visitor);
      
      expect(visitor.visitCircle).toHaveBeenCalledWith(element);
      expect(visitor.visitRectangle).not.toHaveBeenCalled();
    });
  });
  
  describe('Visitor Operations', () => {
    it('should perform operation correctly', () => {
      const visitor = new AreaCalculatorVisitor();
      const circle = new Circle(0, 0, 5);
      
      circle.accept(visitor);
      
      expect(visitor.getTotalArea()).toBeCloseTo(Math.PI * 25, 2);
    });
    
    it('should accumulate state across multiple elements', () => {
      const visitor = new AreaCalculatorVisitor();
      const shapes = [
        new Circle(0, 0, 5),
        new Rectangle(0, 0, 10, 10)
      ];
      
      shapes.forEach(shape => shape.accept(visitor));
      
      const expected = Math.PI * 25 + 100;
      expect(visitor.getTotalArea()).toBeCloseTo(expected, 2);
    });
  });
  
  describe('Object Structure', () => {
    it('should visit all elements', () => {
      const structure = new Drawing();
      structure.add(new Circle(0, 0, 5));
      structure.add(new Rectangle(0, 0, 10, 10));
      
      const visitor = {
        visitCircle: jest.fn(),
        visitRectangle: jest.fn()
      };
      
      structure.accept(visitor);
      
      expect(visitor.visitCircle).toHaveBeenCalledTimes(1);
      expect(visitor.visitRectangle).toHaveBeenCalledTimes(1);
    });
  });
});
```

---

## 📊 Advantages and Disadvantages

### Advantages

✅ **Open/Closed Principle**
- Open for extension (new visitors)
- Closed for modification (existing elements)
- Add new operations without changing element classes

✅ **Separation of Concerns**
- Elements define structure
- Visitors define operations
- Clear separation of responsibilities

✅ **Type Safety**
- Double dispatch ensures type-specific operations
- Compile-time type checking
- No need for type checking/casting

✅ **Flexibility**
- Multiple visitors for same structure
- Easy to add new operations
- Visitors can be composed

✅ **Centralized Operations**
- Related operations grouped in visitor
- Easy to maintain and test
- Operations can share state

### Disadvantages

❌ **Adding New Element Types**
- Requires updating all existing visitors
- Can break existing code
- Violates Open/Closed for elements

❌ **Breaking Encapsulation**
- Visitors need access to element internals
- May require exposing private data
- Can compromise encapsulation

❌ **Complexity**
- Double dispatch can be hard to understand
- More complex than direct methods
- Requires understanding visitor pattern

❌ **Performance Overhead**
- Double dispatch has runtime cost
- Method call overhead
- May not be suitable for performance-critical code

❌ **Tight Coupling**
- Visitors depend on element types
- Changes to elements affect visitors
- Can create maintenance issues

---

## 🔗 Related Patterns

### Visitor and Composite

- **Visitor** operates on object structure
- **Composite** builds tree structures
- Visitor commonly used with Composite to operate on tree

### Visitor and Iterator

- **Visitor** performs operations
- **Iterator** traverses structure
- Often used together: Iterator for traversal, Visitor for operations

### Visitor and Interpreter

- **Visitor** implements operations on AST
- **Interpreter** builds AST
- Visitor pattern essential for interpreter implementations

### Visitor and Strategy

- **Visitor** selects operation based on element type
- **Strategy** selects algorithm
- Can be combined for complex behavior selection

### Visitor and Decorator

- **Visitor** adds operations externally
- **Decorator** adds behavior to objects
- Different approaches to extending functionality

---

## 🎓 Summary

### Key Takeaways

1. **Purpose**: Visitor separates algorithms from object structure, allowing new operations without modifying elements
2. **Double Dispatch**: Element accepts visitor, visitor visits specific element type
3. **Use When**: Operations vary by element type, need to add operations without modifying elements
4. **Benefits**: Open/Closed principle, separation of concerns, type safety
5. **Watch Out**: Adding new elements breaks visitors, encapsulation concerns, complexity

### When to Choose Visitor

Choose Visitor when:
- ✅ You need to perform operations on a complex object structure
- ✅ Operations vary by element type
- ✅ You want to add new operations without modifying element classes
- ✅ Element classes are stable but operations change frequently
- ✅ You need to perform operations across a heterogeneous collection

Avoid Visitor when:
- ❌ Element classes change frequently
- ❌ Operations are simple and don't vary by type
- ❌ You need to access private members (without proper interface)
- ❌ Performance is critical
- ❌ Element hierarchy is small and stable

### Next Steps

- Practice implementing Visitor in your projects
- Identify object structures that could benefit from Visitor
- Explore real-world examples (compilers, document processors)
- Compare Visitor with other behavioral patterns
- Experiment with visitor composition and chaining
- Study how Visitor is used in language implementations

---

## 📚 Additional Resources

### Design Patterns References

- **Gang of Four (GoF)**: "Design Patterns: Elements of Reusable Object-Oriented Software"
- **Head First Design Patterns**: Chapter on Visitor Pattern

### Real-World Examples

- Compiler/Interpreter AST processing
- Document processors (HTML, XML, Markdown)
- File system operations
- GUI framework rendering
- Database query optimization
- Game engine object processing

### Practice Exercises

1. **Create an AST Visitor System**
   - Build expression AST
   - Implement evaluate, print, optimize visitors
   - Add new operations (differentiate, simplify)

2. **Build a Document Processor**
   - Create document node hierarchy
   - Implement render, validate, transform visitors
   - Support multiple output formats

3. **Implement a File System Analyzer**
   - Create file system tree
   - Implement size, search, backup visitors
   - Add new analysis operations

---

**Happy Learning! 🚀**





