# Iterator Pattern

## Overview

The **Iterator Pattern** is a behavioral design pattern that **provides a way to access the elements of a collection sequentially** without exposing the collection’s underlying representation (e.g. array, tree, graph).

**Also known as:** Cursor Pattern.

**Key principle:** Separate iteration logic from the collection—same iteration interface for different structures; support multiple traversals over the same collection.

## Core Problem Solved

- **Hide collection internals** – clients iterate via next(), current(), hasNext() (or similar) without knowing how data is stored
- **Uniform traversal** – same interface for arrays, lists, trees, graphs
- **Multiple traversals** – several iterators can traverse the same collection independently (e.g. two loops over same list)
- **Lazy / on-demand** – iterators can compute next element on demand (generators, lazy sequences)

## Structure

```
Aggregate (Interface)
└── createIterator(): Iterator

ConcreteAggregate implements Aggregate
├── (internal storage: array, tree, etc.)
└── createIterator(): Iterator → returns new ConcreteIterator(this)

Iterator (Interface)
├── next(): void
├── hasNext(): boolean (or isDone())
└── current(): Item (or currentItem())

ConcreteIterator implements Iterator
├── aggregate: ConcreteAggregate
├── cursor / index
└── next(), hasNext(), current()

Client
└── uses Iterator (never touches aggregate internals)
```

### Participants

| Participant | Role |
|-------------|------|
| **Aggregate** | Collection; defines createIterator() |
| **ConcreteAggregate** | Holds data; createIterator() returns an iterator over it |
| **Iterator** | Interface: next(), hasNext(), current() (or equivalent) |
| **ConcreteIterator** | Tracks position over a ConcreteAggregate; implements traversal |
| **Client** | Uses the iterator to traverse; doesn’t depend on aggregate structure |

### External vs internal iteration

- **External** – client calls next()/hasNext(); client controls the loop. Classic Iterator.
- **Internal** – client passes a callback (e.g. forEach); collection controls the loop. Common in modern APIs.

## Common Use Cases

| Use Case | Example |
|----------|---------|
| Collections | List, Set, Map expose iterators; same for-each style for all |
| Trees / graphs | Pre-order, post-order, breadth-first iterators without exposing structure |
| Lazy sequences | Generators, infinite sequences, filtered/mapped views |
| Pagination | Iterator over “pages” of results (next page, hasNext, current page) |
| Encapsulation | Hide internal representation (e.g. database cursor, stream) |

## Iterator vs Other Patterns

| Pattern | Difference |
|---------|------------|
| **Composite** | Composite trees are often traversed with iterators (e.g. depth-first iterator over composite). |
| **Visitor** | Visitor adds operations over a structure; Iterator only provides traversal. Can combine: iterate and visit each node. |
| **Factory Method** | createIterator() is often a factory method that returns the right iterator for the aggregate. |

## Trade-offs

### ✅ Advantages

- **Uniform interface** – same way to traverse different collections
- **Encapsulation** – aggregate internals hidden
- **Multiple traversals** – many iterators over same collection
- **Lazy** – can compute next on demand (generators, lazy streams)

### ❌ Disadvantages

- **Overhead** – for simple arrays a direct loop may be simpler
- **Modification during iteration** – many implementations forbid structural changes while iterating; need clear contract
- **Single-direction** – standard iterator goes forward; bidirectional or random access need extra methods or different interface

## When to Use vs When to Avoid

**Use when:** You need to traverse a collection without exposing its structure; you want multiple independent traversals or lazy traversal; you have non-trivial structures (trees, graphs).

**Avoid when:** Collection is a simple array and you only need one direct loop; language already provides a standard iteration protocol (e.g. for-of, IEnumerable) and you don’t need extra abstraction.

## Best Practices

1. **Standard protocol** – follow language conventions (e.g. next(), hasNext(), or Symbol.iterator / Iterable).
2. **Fail-fast** – document behavior when collection is modified during iteration (e.g. throw or undefined).
3. **Reset / clone** – if you need to restart traversal, provide a new iterator (createIterator()) or a reset() method.
4. **Generic interface** – iterator returns a common element type so clients don’t depend on concrete aggregate element type.

## Related Patterns

- **Composite** – composite trees often provide iterators (e.g. depth-first, breadth-first).
- **Visitor** – iterate over structure and apply visitor to each element.
- **Factory Method** – createIterator() is a factory method.
- **Memento** – can save iterator position for later restore (e.g. bookmark).

---

## 📚 References

### Lessons of the Day
- **[2025-12-31 - Iterator Pattern](../../../../lessons-of-the-day/2025-12-31-iterator-pattern.md)** – Deep-dive with internal vs external iteration, generators, and iterator protocol

### Related Lessons
- [2025-12-21 - Composite Pattern](../../../../lessons-of-the-day/2025-12-21-composite-pattern.md)
- [2025-12-23 - Visitor Pattern](../../../../lessons-of-the-day/2025-12-23-visitor-pattern.md)
