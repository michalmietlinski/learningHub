# Abstract Factory Pattern

## Overview

Creates **families of related objects** without specifying concrete classes. Ensures products from one family work together.

**Also known as:** Kit Pattern

## Structure

```
AbstractFactory
├── createProductA(): AbstractProductA
└── createProductB(): AbstractProductB

ConcreteFactory1 → ProductA1, ProductB1
ConcreteFactory2 → ProductA2, ProductB2

Client → uses AbstractFactory + AbstractProducts only
```

## Key Difference from Factory Method

| Factory Method | Abstract Factory |
|----------------|------------------|
| ONE product type | FAMILIES of products |
| Uses inheritance | Uses composition |
| Single method | Multiple methods |

## When to Use

✅ Need families of related products (UI themes, DB providers)  
✅ Products must be used together (Windows components)  
✅ Want to hide implementation details  

❌ Only one product type → use Factory Method  
❌ Products unrelated → overkill  

## Trade-offs

| ✅ Pros | ❌ Cons |
|---------|---------|
| Ensures family consistency | Many interfaces/classes |
| Loose coupling | Adding new product types is hard |
| Easy to swap families | Can be overkill |

---

## 📚 References

### Lessons of the Day
- **[2025-12-15 - Abstract Factory Pattern](../../../lessons-of-the-day/2025-12-15-abstract-factory-pattern.md)** - Full implementation examples (JS/TS/Python/Java), real-world examples (React Native, ORMs, theme systems), variations, and best practices

### Related Lessons
- [2025-12-14 - Factory Method Pattern](../../../lessons-of-the-day/2025-12-14-factory-method-pattern.md)

