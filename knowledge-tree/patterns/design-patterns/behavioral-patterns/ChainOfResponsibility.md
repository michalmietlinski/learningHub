# Chain of Responsibility Pattern

## Overview

The **Chain of Responsibility Pattern** is a behavioral design pattern that **passes a request along a chain of handlers**. Each handler either processes the request or forwards it to the next handler. Sender is decoupled from receivers.

**Also known as:** Chain of Command Pattern.

**Key principle:** Pass the request along the chain—multiple objects get a chance to handle it; decouple sender from receiver.

## Core Problem Solved

- **Decouple** sender from receiver—sender doesn’t know which object will handle the request
- **Give multiple handlers a chance** to process the request (e.g. first that can handle it wins, or all run in sequence)
- **Build flexible pipelines** (middleware, validation, logging, auth) that are easy to extend
- **Single Responsibility** – each handler does one kind of check or action

## Structure

```
Handler (Abstract)
├── next: Handler | null
├── setNext(handler): Handler
└── handle(request): void
    ├── if canHandle(request) → process(request); return
    └── if next → next.handle(request)

ConcreteHandlerA, ConcreteHandlerB extend Handler
└── handle(request): void (canHandle + process or forward)

Client
└── sends request to first handler in chain
```

### Participants

| Participant | Role |
|-------------|------|
| **Handler** | Defines handle(request); holds optional next handler; processes or forwards |
| **ConcreteHandler** | Implements canHandle and process; forwards to next if not handling |
| **Client** | Sends request to the first handler in the chain |

### Variations

- **Stop on first handler** – first handler that can handle processes and stops.
- **All handlers** – request passes through all (e.g. logging middleware); each may do something and pass on.
- **Default handler** – end of chain handles “unhandled” or does nothing.

## Common Use Cases

| Use Case | Example |
|----------|---------|
| Middleware | Web: auth → logging → validation → handler; each can short-circuit or pass |
| Event handling | Event bubbles or is passed along until handled |
| Validation | A chain of validators (format → business rules → permissions) |
| Logging / processing | Request passes through multiple processors (log, metrics, transform) |
| Support / escalation | Level 1 → Level 2 → Level 3 support |

## Chain of Responsibility vs Other Patterns

| Pattern | Difference |
|---------|------------|
| **Decorator** | Decorator adds behavior and always forwards; Chain handlers may not forward (stop). Decorator wraps one object; Chain is a linked list of handlers. |
| **Command** | Command is a request object executed by one invoker. Chain passes request to many handlers until one handles it. |
| **Observer** | Observer broadcasts to all. Chain passes to next until one handles (or all run in pipeline). |

## Trade-offs

### ✅ Advantages

- **Decouples sender and receiver** – sender only knows the first handler
- **Flexible** – add/remove/reorder handlers without changing sender or other handlers
- **Single Responsibility** – each handler has one job
- **Dynamic chain** – build chain at runtime (e.g. from config)

### ❌ Disadvantages

- **No guarantee** – request might not be handled if no handler accepts it (need fallback or default)
- **Debugging** – request flows through many objects; can be hard to trace
- **Performance** – many hops; for simple cases a single dispatcher may be simpler

## When to Use vs When to Avoid

**Use when:** Multiple objects can handle a request and you don’t want sender to know which; you want a pipeline (middleware, validation, logging) that’s easy to extend.

**Avoid when:** Exactly one handler should process each request and you know which; chain would add indirection without benefit.

## Best Practices

1. **Define a clear request type** – object or interface that flows along the chain (and can be enriched or short-circuited).
2. **Default/final handler** – end the chain with a handler that always runs (e.g. 404, default policy) so every request is “handled.”
3. **Keep handlers focused** – one concern per handler; combine with composition if needed.
4. **Document order** – order of handlers often matters (e.g. auth before business logic); document or make it explicit in config.

## Related Patterns

- **Decorator** – both use “forward to next”; Decorator adds behavior and wraps one; Chain is linear list of handlers.
- **Command** – command object can be the “request” passed along the chain.
- **Composite** – a handler in the chain could be a composite that forwards to children.

---

## 📚 References

### Lessons of the Day
- **[2025-12-30 - Chain of Responsibility Pattern](../../../../lessons-of-the-day/2025-12-30-chain-of-responsibility-pattern.md)** – Deep-dive with handler chain, middleware, and breaking the chain

### Related Lessons
- [2025-12-20 - Decorator Pattern](../../../../lessons-of-the-day/2025-12-20-decorator-pattern.md)
- [2025-12-29 - Command Pattern](../../../../lessons-of-the-day/2025-12-29-command-pattern.md)
