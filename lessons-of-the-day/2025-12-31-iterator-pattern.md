# Iterator Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand the Iterator pattern definition and intent
- [ ] Learn when to use Iterator vs direct collection access
- [ ] Master internal vs external iteration concepts
- [ ] Recognize real-world applications (collections, generators, lazy evaluation)
- [ ] Understand Iterator vs direct iteration and forEach differences
- [ ] Practice implementing Iterator in different scenarios
- [ ] Learn JavaScript/TypeScript iterator protocol and generators
- [ ] Explore modern variations (async iterators, infinite sequences, filtering iterators)
- [ ] Understand iterator composition and transformation

---

## 🎯 Definition

**Iterator Pattern** is a behavioral design pattern that provides a way to access the elements of an aggregate object sequentially without exposing its underlying representation.

**Intent (GoF):**
- Provide a way to access the elements of an aggregate object sequentially
- Without exposing the underlying representation
- Also known as: **Cursor Pattern**

**Key Principle:**
> "Separate iteration logic from collection structure" - The iterator pattern decouples the traversal algorithm from the collection, allowing you to iterate over different data structures using the same interface, and enabling multiple iterations over the same collection simultaneously.

---

## 🏗️ Structure

### UML Diagram Concept

```
Aggregate (Interface)
└── createIterator(): Iterator

ConcreteAggregate implements Aggregate
├── items: Item[]
└── createIterator(): Iterator
    └── return new ConcreteIterator(this)

Iterator (Interface)
├── first(): void
├── next(): void
├── isDone(): boolean
└── currentItem(): Item

ConcreteIterator implements Iterator
├── aggregate: ConcreteAggregate
├── currentIndex: number
├── first(): void
├── next(): void
├── isDone(): boolean
└── currentItem(): Item
```

### Participants

1. **Iterator** - Defines an interface for accessing and traversing elements
2. **ConcreteIterator** - Implements the Iterator interface, keeps track of the current position in the traversal
3. **Aggregate** - Defines an interface for creating an Iterator object
4. **ConcreteAggregate** - Implements the Aggregate interface, returns an instance of ConcreteIterator
5. **Client** - Uses the Iterator to traverse the aggregate

### Key Concepts

**Separation of Concerns:**
- Collection structure is separate from iteration logic
- Multiple iterators can traverse the same collection
- Different iteration strategies can be implemented
- Collection can be modified without breaking iteration

**Encapsulation:**
- Internal structure of collection is hidden
- Iterator provides controlled access to elements
- Can implement lazy evaluation
- Can implement filtering and transformation

**Multiple Iterations:**
- Multiple iterators can exist simultaneously
- Each iterator maintains its own position
- Iterators are independent of each other
- Can iterate in different directions or orders

**Polymorphism:**
- Same iteration interface for different collections
- Can swap collection implementations
- Client code doesn't depend on collection type
- Enables generic algorithms

**Lazy Evaluation:**
- Elements can be computed on-demand
- Memory efficient for large collections
- Can represent infinite sequences
- Can implement filtering and mapping lazily

---

## 💡 When to Use

### Use Iterator When:

✅ **You need to access elements of a collection without exposing its representation**
- Example: Custom data structures (trees, graphs)
- Example: Database result sets
- Example: File system traversal

✅ **You need multiple ways to traverse the same collection**
- Example: Forward and backward iteration
- Example: Depth-first and breadth-first traversal
- Example: Filtered and unfiltered views

✅ **You need to provide a uniform interface for traversing different collections**
- Example: Iterating over arrays, lists, sets, maps
- Example: Generic algorithms that work with any iterable
- Example: Polymorphic iteration code

✅ **You want to support lazy evaluation or infinite sequences**
- Example: Generating sequences on-demand
- Example: Processing large datasets without loading all into memory
- Example: Infinite sequences (Fibonacci, primes)

✅ **You need to iterate over a collection that can be modified during iteration**
- Example: Safe iteration with modification tracking
- Example: Concurrent iteration and modification
- Example: Snapshot iteration

### Don't Use When:

❌ **Collection is simple and iteration is straightforward** - Direct iteration is simpler
❌ **You only need sequential access and collection is small** - Array indexing is more efficient
❌ **Performance is critical and overhead matters** - Iterator adds slight overhead
❌ **Collection structure is always the same** - Direct access might be clearer
❌ **You need random access frequently** - Iterator is for sequential access

---

## 🔨 Implementation Examples

### Example 1: Basic Iterator Pattern (Custom Collection)

```typescript
// Iterator Interface
interface Iterator<T> {
  first(): void;
  next(): void;
  isDone(): boolean;
  currentItem(): T;
}

// Aggregate Interface
interface Aggregate<T> {
  createIterator(): Iterator<T>;
}

// Concrete Aggregate - Book Collection
class BookCollection implements Aggregate<Book> {
  private books: Book[] = [];

  add(book: Book): void {
    this.books.push(book);
  }

  getCount(): number {
    return this.books.length;
  }

  getBook(index: number): Book {
    return this.books[index];
  }

  createIterator(): Iterator<Book> {
    return new BookIterator(this);
  }
}

// Book Class
class Book {
  constructor(
    public title: string,
    public author: string,
    public year: number
  ) {}
}

// Concrete Iterator
class BookIterator implements Iterator<Book> {
  private currentIndex: number = 0;

  constructor(private collection: BookCollection) {}

  first(): void {
    this.currentIndex = 0;
  }

  next(): void {
    this.currentIndex++;
  }

  isDone(): boolean {
    return this.currentIndex >= this.collection.getCount();
  }

  currentItem(): Book {
    if (this.isDone()) {
      throw new Error('Iterator is done');
    }
    return this.collection.getBook(this.currentIndex);
  }
}

// Usage
const collection = new BookCollection();
collection.add(new Book('Design Patterns', 'Gang of Four', 1994));
collection.add(new Book('Clean Code', 'Robert Martin', 2008));
collection.add(new Book('Refactoring', 'Martin Fowler', 1999));

const iterator = collection.createIterator();

console.log('=== Iterating through books ===');
for (iterator.first(); !iterator.isDone(); iterator.next()) {
  const book = iterator.currentItem();
  console.log(`${book.title} by ${book.author} (${book.year})`);
}
```

### Example 2: Reverse Iterator

```typescript
// Forward Iterator
class ForwardIterator<T> implements Iterator<T> {
  private currentIndex: number = 0;

  constructor(private collection: BookCollection) {}

  first(): void {
    this.currentIndex = 0;
  }

  next(): void {
    this.currentIndex++;
  }

  isDone(): boolean {
    return this.currentIndex >= this.collection.getCount();
  }

  currentItem(): T {
    return this.collection.getBook(this.currentIndex) as T;
  }
}

// Reverse Iterator
class ReverseIterator<T> implements Iterator<T> {
  private currentIndex: number;

  constructor(private collection: BookCollection) {
    this.currentIndex = this.collection.getCount() - 1;
  }

  first(): void {
    this.currentIndex = this.collection.getCount() - 1;
  }

  next(): void {
    this.currentIndex--;
  }

  isDone(): boolean {
    return this.currentIndex < 0;
  }

  currentItem(): T {
    return this.collection.getBook(this.currentIndex) as T;
  }
}

// Extended Collection with Multiple Iterators
class ExtendedBookCollection extends BookCollection {
  createReverseIterator(): Iterator<Book> {
    return new ReverseIterator(this);
  }

  createForwardIterator(): Iterator<Book> {
    return new ForwardIterator(this);
  }
}

// Usage
const extendedCollection = new ExtendedBookCollection();
extendedCollection.add(new Book('Book 1', 'Author 1', 2020));
extendedCollection.add(new Book('Book 2', 'Author 2', 2021));
extendedCollection.add(new Book('Book 3', 'Author 3', 2022));

console.log('=== Forward Iteration ===');
const forwardIter = extendedCollection.createForwardIterator();
for (forwardIter.first(); !forwardIter.isDone(); forwardIter.next()) {
  console.log(forwardIter.currentItem().title);
}

console.log('\n=== Reverse Iteration ===');
const reverseIter = extendedCollection.createReverseIterator();
for (reverseIter.first(); !reverseIter.isDone(); reverseIter.next()) {
  console.log(reverseIter.currentItem().title);
}
```

### Example 3: JavaScript Iterator Protocol (Modern Approach)

```typescript
// Custom Iterable Collection
class NumberCollection implements Iterable<number> {
  private numbers: number[] = [];

  add(number: number): void {
    this.numbers.push(number);
  }

  // Implement Symbol.iterator
  [Symbol.iterator](): Iterator<number> {
    let index = 0;
    const numbers = this.numbers;

    return {
      next(): IteratorResult<number> {
        if (index < numbers.length) {
          return {
            value: numbers[index++],
            done: false
          };
        } else {
          return {
            value: undefined,
            done: true
          };
        }
      }
    };
  }
}

// Usage with for...of
const collection = new NumberCollection();
collection.add(1);
collection.add(2);
collection.add(3);
collection.add(4);
collection.add(5);

console.log('=== Using for...of ===');
for (const num of collection) {
  console.log(num);
}

// Usage with spread operator
console.log('\n=== Using spread operator ===');
const array = [...collection];
console.log(array); // [1, 2, 3, 4, 5]

// Usage with destructuring
console.log('\n=== Using destructuring ===');
const [first, second, ...rest] = collection;
console.log(first, second, rest); // 1 2 [3, 4, 5]
```

### Example 4: Generator Functions (JavaScript/TypeScript)

```typescript
// Generator Function - Infinite Sequence
function* fibonacci(): Generator<number> {
  let a = 0;
  let b = 1;
  
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Usage
console.log('=== Fibonacci Sequence ===');
const fib = fibonacci();
for (let i = 0; i < 10; i++) {
  console.log(fib.next().value);
}

// Generator Function - Range
function* range(start: number, end: number, step: number = 1): Generator<number> {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}

console.log('\n=== Range Generator ===');
for (const num of range(0, 10, 2)) {
  console.log(num); // 0, 2, 4, 6, 8
}

// Generator Function - Filter
function* filter<T>(
  iterable: Iterable<T>,
  predicate: (item: T) => boolean
): Generator<T> {
  for (const item of iterable) {
    if (predicate(item)) {
      yield item;
    }
  }
}

// Generator Function - Map
function* map<T, R>(
  iterable: Iterable<T>,
  transform: (item: T) => R
): Generator<R> {
  for (const item of iterable) {
    yield transform(item);
  }
}

// Usage
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

console.log('\n=== Filtered Even Numbers ===');
for (const num of filter(numbers, n => n % 2 === 0)) {
  console.log(num); // 2, 4, 6, 8, 10
}

console.log('\n=== Mapped Squares ===');
for (const num of map(numbers, n => n * n)) {
  console.log(num); // 1, 4, 9, 16, 25, 36, 49, 64, 81, 100
}

// Generator Function - Take (limit)
function* take<T>(
  iterable: Iterable<T>,
  count: number
): Generator<T> {
  let taken = 0;
  for (const item of iterable) {
    if (taken >= count) break;
    yield item;
    taken++;
  }
}

console.log('\n=== First 5 Fibonacci Numbers ===');
for (const num of take(fibonacci(), 5)) {
  console.log(num); // 0, 1, 1, 2, 3
}
```

### Example 5: Tree Iterator (Depth-First and Breadth-First)

```typescript
// Tree Node
class TreeNode<T> {
  constructor(
    public value: T,
    public children: TreeNode<T>[] = []
  ) {}

  addChild(child: TreeNode<T>): void {
    this.children.push(child);
  }
}

// Tree Collection
class Tree<T> {
  constructor(public root: TreeNode<T> | null = null) {}

  // Depth-First Iterator (Pre-order)
  *depthFirst(): Generator<T> {
    if (!this.root) return;
    
    function* traverse(node: TreeNode<T>): Generator<T> {
      yield node.value;
      for (const child of node.children) {
        yield* traverse(child);
      }
    }
    
    yield* traverse(this.root);
  }

  // Breadth-First Iterator
  *breadthFirst(): Generator<T> {
    if (!this.root) return;
    
    const queue: TreeNode<T>[] = [this.root];
    
    while (queue.length > 0) {
      const node = queue.shift()!;
      yield node.value;
      queue.push(...node.children);
    }
  }
}

// Usage
const tree = new Tree<number>();
tree.root = new TreeNode(1);
tree.root.addChild(new TreeNode(2));
tree.root.addChild(new TreeNode(3));
tree.root.children[0].addChild(new TreeNode(4));
tree.root.children[0].addChild(new TreeNode(5));
tree.root.children[1].addChild(new TreeNode(6));

console.log('=== Depth-First Traversal ===');
for (const value of tree.depthFirst()) {
  console.log(value); // 1, 2, 4, 5, 3, 6
}

console.log('\n=== Breadth-First Traversal ===');
for (const value of tree.breadthFirst()) {
  console.log(value); // 1, 2, 3, 4, 5, 6
}
```

### Example 6: Filtering Iterator

```typescript
// Filtering Iterator
class FilteringIterator<T> implements Iterator<T> {
  private currentIndex: number = 0;

  constructor(
    private collection: T[],
    private predicate: (item: T) => boolean
  ) {
    // Move to first matching item
    this.moveToNext();
  }

  private moveToNext(): void {
    while (
      this.currentIndex < this.collection.length &&
      !this.predicate(this.collection[this.currentIndex])
    ) {
      this.currentIndex++;
    }
  }

  next(): IteratorResult<T> {
    if (this.currentIndex >= this.collection.length) {
      return { value: undefined, done: true };
    }

    const value = this.collection[this.currentIndex];
    this.currentIndex++;
    this.moveToNext();

    return { value, done: false };
  }
}

// Filtering Iterable
class FilteringIterable<T> implements Iterable<T> {
  constructor(
    private collection: T[],
    private predicate: (item: T) => boolean
  ) {}

  [Symbol.iterator](): Iterator<T> {
    return new FilteringIterator(this.collection, this.predicate);
  }
}

// Usage
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

console.log('=== Even Numbers ===');
const evenNumbers = new FilteringIterable(numbers, n => n % 2 === 0);
for (const num of evenNumbers) {
  console.log(num); // 2, 4, 6, 8, 10
}

console.log('\n=== Numbers Greater Than 5 ===');
const greaterThan5 = new FilteringIterable(numbers, n => n > 5);
for (const num of greaterThan5) {
  console.log(num); // 6, 7, 8, 9, 10
}
```

### Example 7: Async Iterator (Streaming Data)

```typescript
// Async Iterator for Streaming Data
class DataStream implements AsyncIterable<string> {
  constructor(
    private dataSource: string[],
    private delay: number = 100
  ) {}

  async *[Symbol.asyncIterator](): AsyncGenerator<string> {
    for (const item of this.dataSource) {
      // Simulate async data fetching
      await new Promise(resolve => setTimeout(resolve, this.delay));
      yield item;
    }
  }
}

// Usage with for await...of
async function processStream() {
  const stream = new DataStream(['chunk1', 'chunk2', 'chunk3', 'chunk4'], 200);

  console.log('=== Processing Async Stream ===');
  for await (const chunk of stream) {
    console.log(`Processed: ${chunk}`);
  }
}

processStream();

// Async Generator - Fetching Pages
async function* fetchPages(urls: string[]): AsyncGenerator<Response> {
  for (const url of urls) {
    const response = await fetch(url);
    yield response;
  }
}

// Usage
async function processPages() {
  const urls = [
    'https://api.example.com/page1',
    'https://api.example.com/page2',
    'https://api.example.com/page3'
  ];

  console.log('\n=== Fetching Pages ===');
  for await (const response of fetchPages(urls)) {
    const data = await response.json();
    console.log('Received:', data);
  }
}
```

### Example 8: Iterator Composition (Chaining Operations)

```typescript
// Iterator Utilities
class IteratorUtils {
  static *filter<T>(
    iterable: Iterable<T>,
    predicate: (item: T) => boolean
  ): Generator<T> {
    for (const item of iterable) {
      if (predicate(item)) {
        yield item;
      }
    }
  }

  static *map<T, R>(
    iterable: Iterable<T>,
    transform: (item: T) => R
  ): Generator<R> {
    for (const item of iterable) {
      yield transform(item);
    }
  }

  static *take<T>(
    iterable: Iterable<T>,
    count: number
  ): Generator<T> {
    let taken = 0;
    for (const item of iterable) {
      if (taken >= count) break;
      yield item;
      taken++;
    }
  }

  static *skip<T>(
    iterable: Iterable<T>,
    count: number
  ): Generator<T> {
    let skipped = 0;
    for (const item of iterable) {
      if (skipped < count) {
        skipped++;
        continue;
      }
      yield item;
    }
  }

  static *flatMap<T, R>(
    iterable: Iterable<T>,
    transform: (item: T) => Iterable<R>
  ): Generator<R> {
    for (const item of iterable) {
      yield* transform(item);
    }
  }
}

// Fluent Iterator API
class FluentIterator<T> implements Iterable<T> {
  constructor(private iterable: Iterable<T>) {}

  filter(predicate: (item: T) => boolean): FluentIterator<T> {
    return new FluentIterator(IteratorUtils.filter(this.iterable, predicate));
  }

  map<R>(transform: (item: T) => R): FluentIterator<R> {
    return new FluentIterator(IteratorUtils.map(this.iterable, transform));
  }

  take(count: number): FluentIterator<T> {
    return new FluentIterator(IteratorUtils.take(this.iterable, count));
  }

  skip(count: number): FluentIterator<T> {
    return new FluentIterator(IteratorUtils.skip(this.iterable, count));
  }

  flatMap<R>(transform: (item: T) => Iterable<R>): FluentIterator<R> {
    return new FluentIterator(IteratorUtils.flatMap(this.iterable, transform));
  }

  toArray(): T[] {
    return [...this.iterable];
  }

  [Symbol.iterator](): Iterator<T> {
    return this.iterable[Symbol.iterator]();
  }
}

// Usage
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

console.log('=== Fluent Iterator API ===');
const result = new FluentIterator(numbers)
  .filter(n => n % 2 === 0)
  .map(n => n * n)
  .skip(1)
  .take(3)
  .toArray();

console.log(result); // [16, 36, 64] (even numbers squared, skip first, take 3)

// Chaining with generators
console.log('\n=== Chained Operations ===');
function* numbersGen() {
  for (let i = 1; i <= 10; i++) {
    yield i;
  }
}

const chained = new FluentIterator(numbersGen())
  .filter(n => n > 5)
  .map(n => n * 2)
  .take(3);

for (const num of chained) {
  console.log(num); // 12, 14, 16
}
```

---

## 🔄 Pattern Variations

### Variation 1: Cursor-Based Iterator

```typescript
// Cursor-based iteration (for databases, large datasets)
interface Cursor<T> {
  hasNext(): boolean;
  next(): Promise<T | null>;
  close(): Promise<void>;
}

class DatabaseCursor<T> implements Cursor<T> {
  private position: number = 0;
  private batch: T[] = [];
  private batchIndex: number = 0;
  private readonly batchSize: number = 100;

  constructor(
    private fetchBatch: (offset: number, limit: number) => Promise<T[]>
  ) {}

  async hasNext(): Promise<boolean> {
    if (this.batchIndex < this.batch.length) {
      return true;
    }

    // Fetch next batch
    this.batch = await this.fetchBatch(this.position, this.batchSize);
    this.batchIndex = 0;
    this.position += this.batch.length;

    return this.batch.length > 0;
  }

  async next(): Promise<T | null> {
    if (!(await this.hasNext())) {
      return null;
    }

    return this.batch[this.batchIndex++];
  }

  async close(): Promise<void> {
    this.batch = [];
    this.batchIndex = 0;
  }
}

// Usage
async function processLargeDataset() {
  const fetchBatch = async (offset: number, limit: number) => {
    // Simulate database query
    return Array.from({ length: limit }, (_, i) => ({
      id: offset + i,
      data: `Item ${offset + i}`
    }));
  };

  const cursor = new DatabaseCursor(fetchBatch);

  while (await cursor.hasNext()) {
    const item = await cursor.next();
    if (item) {
      console.log(item);
    }
  }

  await cursor.close();
}
```

### Variation 2: Snapshot Iterator (Immutable View)

```typescript
// Snapshot Iterator - creates immutable view
class SnapshotIterator<T> implements Iterator<T> {
  private snapshot: T[];
  private index: number = 0;

  constructor(private collection: T[]) {
    // Create snapshot
    this.snapshot = [...collection];
  }

  next(): IteratorResult<T> {
    if (this.index >= this.snapshot.length) {
      return { value: undefined, done: true };
    }

    return {
      value: this.snapshot[this.index++],
      done: false
    };
  }
}

class SnapshotIterable<T> implements Iterable<T> {
  constructor(private collection: T[]) {}

  [Symbol.iterator](): Iterator<T> {
    return new SnapshotIterator(this.collection);
  }
}

// Usage
const collection = [1, 2, 3];
const snapshot = new SnapshotIterable(collection);

// Modify original collection
collection.push(4, 5);

// Snapshot still has original items
console.log('=== Snapshot Iterator ===');
for (const item of snapshot) {
  console.log(item); // 1, 2, 3 (not affected by modifications)
}
```

### Variation 3: Bidirectional Iterator

```typescript
// Bidirectional Iterator
interface BidirectionalIterator<T> extends Iterator<T> {
  previous(): IteratorResult<T>;
  hasPrevious(): boolean;
  first(): void;
  last(): void;
}

class ArrayBidirectionalIterator<T> implements BidirectionalIterator<T> {
  private index: number = 0;

  constructor(private array: T[]) {}

  next(): IteratorResult<T> {
    if (this.index >= this.array.length) {
      return { value: undefined, done: true };
    }

    return {
      value: this.array[this.index++],
      done: false
    };
  }

  previous(): IteratorResult<T> {
    if (this.index <= 0) {
      return { value: undefined, done: true };
    }

    this.index--;
    return {
      value: this.array[this.index],
      done: false
    };
  }

  hasPrevious(): boolean {
    return this.index > 0;
  }

  first(): void {
    this.index = 0;
  }

  last(): void {
    this.index = this.array.length;
  }
}

// Usage
const iterator = new ArrayBidirectionalIterator([1, 2, 3, 4, 5]);

console.log('=== Forward ===');
let result = iterator.next();
while (!result.done) {
  console.log(result.value);
  result = iterator.next();
}

console.log('\n=== Backward ===');
iterator.last();
result = iterator.previous();
while (!result.done) {
  console.log(result.value);
  result = iterator.previous();
}
```

---

## 🔀 Pattern Comparisons

### Iterator vs Direct Iteration

**Direct Iteration:**
```typescript
// Direct array access
for (let i = 0; i < array.length; i++) {
  console.log(array[i]);
}
```

**Iterator Pattern:**
```typescript
// Iterator-based
for (const item of iterable) {
  console.log(item);
}
```

**Differences:**

| Aspect | Direct Iteration | Iterator Pattern |
|--------|-----------------|------------------|
| **Coupling** | Tightly coupled to structure | Decoupled from structure |
| **Multiple Iterations** | Difficult | Easy (multiple iterators) |
| **Lazy Evaluation** | Not possible | Possible |
| **Infinite Sequences** | Not possible | Possible |
| **Performance** | Slightly faster | Slight overhead |
| **Flexibility** | Limited | High |

### Iterator vs forEach

**forEach:**
```typescript
array.forEach(item => console.log(item));
```

**Iterator:**
```typescript
for (const item of array) {
  console.log(item);
}
```

**Differences:**
- **forEach**: Cannot break early, always processes all items
- **Iterator**: Can break early with `break` statement
- **forEach**: Callback-based, less flexible
- **Iterator**: More control, can use `continue`, `break`, `return`

### Internal vs External Iteration

**Internal Iteration (forEach, map, filter):**
```typescript
// Collection controls iteration
array.forEach(item => process(item));
array.map(item => transform(item));
```

**External Iteration (Iterator):**
```typescript
// Client controls iteration
const iterator = collection.createIterator();
while (!iterator.isDone()) {
  process(iterator.currentItem());
  iterator.next();
}
```

**When to use Internal:**
- Simple operations on all items
- Functional programming style
- Less control needed

**When to use External:**
- Need fine-grained control
- Conditional processing
- Early termination needed
- Multiple simultaneous iterations

---

## 🎯 Real-World Applications

### 1. JavaScript/TypeScript Built-in Iterables

JavaScript arrays, strings, maps, sets are all iterable:

```typescript
// Arrays
for (const item of [1, 2, 3]) { }

// Strings
for (const char of 'hello') { }

// Maps
for (const [key, value] of new Map()) { }

// Sets
for (const item of new Set()) { }
```

### 2. Generator Functions

Generators are a form of iterator:

```typescript
function* range(start: number, end: number) {
  for (let i = start; i < end; i++) {
    yield i;
  }
}
```

### 3. Database Cursors

Database libraries use iterators for result sets:

```typescript
const cursor = db.query('SELECT * FROM users');
for await (const user of cursor) {
  process(user);
}
```

### 4. File Processing

Reading files line by line:

```typescript
async function* readLines(file: File): AsyncGenerator<string> {
  const reader = file.stream().getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value);
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      yield line;
    }
  }

  if (buffer) yield buffer;
}
```

### 5. Stream Processing

Processing data streams:

```typescript
async function* processStream(stream: ReadableStream) {
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield process(value);
  }
}
```

---

## ⚠️ Common Pitfalls and Best Practices

### Common Pitfalls

❌ **Modifying Collection During Iteration**
```typescript
// BAD: Modifying during iteration
const array = [1, 2, 3];
for (const item of array) {
  array.push(item * 2); // Infinite loop or unexpected behavior
}

// GOOD: Use snapshot or collect modifications
const array = [1, 2, 3];
const snapshot = [...array];
for (const item of snapshot) {
  array.push(item * 2);
}
```

❌ **Not Closing Iterators**
```typescript
// BAD: Not closing async iterators
const iterator = createAsyncIterator();
for await (const item of iterator) {
  // process
}
// Iterator might not be closed

// GOOD: Use try-finally
const iterator = createAsyncIterator();
try {
  for await (const item of iterator) {
    // process
  }
} finally {
  await iterator.return?.();
}
```

❌ **Reusing Exhausted Iterator**
```typescript
// BAD: Reusing exhausted iterator
const iterator = collection[Symbol.iterator]();
for (const item of iterator) { }
for (const item of iterator) { } // Won't iterate

// GOOD: Create new iterator
for (const item of collection) { }
for (const item of collection) { } // New iterator
```

❌ **Not Handling Errors in Async Iterators**
```typescript
// BAD: No error handling
for await (const item of asyncIterable) {
  process(item);
}

// GOOD: Handle errors
try {
  for await (const item of asyncIterable) {
    process(item);
  }
} catch (error) {
  console.error('Iteration error:', error);
}
```

### Best Practices

✅ **Use for...of for Simple Iteration**
```typescript
// Simple and readable
for (const item of collection) {
  process(item);
}
```

✅ **Use Generators for Complex Sequences**
```typescript
function* complexSequence() {
  yield* step1();
  yield* step2();
  yield* step3();
}
```

✅ **Implement Symbol.iterator for Custom Collections**
```typescript
class CustomCollection implements Iterable<T> {
  [Symbol.iterator](): Iterator<T> {
    // Return iterator
  }
}
```

✅ **Use Async Iterators for Streaming Data**
```typescript
async function* streamData() {
  for await (const chunk of source) {
    yield process(chunk);
  }
}
```

✅ **Compose Iterators for Complex Operations**
```typescript
const result = collection
  .filter(predicate)
  .map(transform)
  .take(limit);
```

✅ **Handle Iterator Lifecycle Properly**
```typescript
class ResourceIterator implements AsyncIterator<T> {
  async return(): Promise<IteratorResult<T>> {
    await this.cleanup();
    return { value: undefined, done: true };
  }
}
```

---

## 🚀 Modern Variations and Extensions

### 1. Iterator Helpers (Proposed JavaScript Feature)

```typescript
// Future JavaScript feature
const result = [1, 2, 3, 4, 5]
  .values()
  .filter(n => n % 2 === 0)
  .map(n => n * n)
  .toArray();
```

### 2. Observable Pattern with Iterators

```typescript
class Observable<T> implements AsyncIterable<T> {
  private subscribers: ((value: T) => void)[] = [];

  subscribe(callback: (value: T) => void): void {
    this.subscribers.push(callback);
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<T> {
    const queue: T[] = [];
    let resolve: ((value: IteratorResult<T>) => void) | null = null;

    this.subscribe(value => {
      queue.push(value);
      if (resolve) {
        resolve({ value: queue.shift()!, done: false });
        resolve = null;
      }
    });

    while (true) {
      if (queue.length > 0) {
        yield queue.shift()!;
      } else {
        yield new Promise<IteratorResult<T>>(r => resolve = r);
      }
    }
  }
}
```

### 3. Lazy Evaluation with Iterators

```typescript
class LazyCollection<T> implements Iterable<T> {
  constructor(
    private generator: () => Generator<T>
  ) {}

  [Symbol.iterator](): Iterator<T> {
    return this.generator();
  }

  filter(predicate: (item: T) => boolean): LazyCollection<T> {
    return new LazyCollection(function*() {
      for (const item of this) {
        if (predicate(item)) {
          yield item;
        }
      }
    }.bind(this));
  }

  map<R>(transform: (item: T) => R): LazyCollection<R> {
    return new LazyCollection(function*() {
      for (const item of this) {
        yield transform(item);
      }
    }.bind(this));
  }
}
```

---

## 📚 Summary

### Key Takeaways

1. **Iterator Pattern** provides a way to access collection elements without exposing structure
2. **Separation of Concerns** - Iteration logic is separate from collection structure
3. **Multiple Iterations** - Multiple iterators can traverse the same collection
4. **Lazy Evaluation** - Elements can be computed on-demand
5. **JavaScript/TypeScript** - Built-in iterator protocol and generators make this pattern native

### When to Use

✅ Use when:
- You need to access collection elements without exposing structure
- You need multiple ways to traverse the same collection
- You want to support lazy evaluation or infinite sequences
- You need uniform interface for different collections
- You're working with large datasets or streams

❌ Don't use when:
- Collection is simple and iteration is straightforward
- Performance is critical and overhead matters
- You only need sequential access to small collections
- Direct access is clearer for your use case

### Pattern Relationships

- **Similar to Visitor**: Both traverse structures, but Iterator focuses on sequential access, Visitor focuses on operations
- **Similar to Composite**: Both work with collections, but Iterator traverses, Composite structures
- **Foundation for**: Generator functions, async iterators, stream processing

### Next Steps

After mastering Iterator Pattern, consider:
- **Mediator Pattern** - For centralized communication
- **Memento Pattern** - For state snapshots
- **Generator Functions** - Advanced iterator usage
- **Async Iterators** - For streaming and async data

---

## 🔗 Related Patterns

- **Visitor**: Traverses object structure and performs operations
- **Composite**: Composes objects into tree structures
- **Factory Method**: Creates iterators for collections
- **Memento**: Can be used to save iterator state

---

## 📖 References

- **Gang of Four**: "Design Patterns: Elements of Reusable Object-Oriented Software"
- **MDN Web Docs**: Iteration Protocols
- **ECMAScript Specification**: Iterator and Generator
- **Refactoring Guru**: Iterator Pattern

