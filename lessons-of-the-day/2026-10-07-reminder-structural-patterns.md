# Reminder: Structural Patterns

**Format:** Reminder lesson. One sitting to recall the seven structural patterns and tell them apart. Definitions, code, and variations stay in the full lessons linked at the end.

**Question this reminder answers:** Is this wrapping, sharing, or a tree?

---

## 📋 Learning Objectives

- [ ] Recall each structural pattern in one line
- [ ] Tell the five wrappers apart by what they do to the interface
- [ ] Keep Composite and Flyweight out of the wrapper pile

---

## 🎯 What These Patterns Share

All seven arrange objects that already exist. They do not decide who calls `new` (that was the creational reminder). They split into three jobs:

| Job | Patterns |
|-----|----------|
| **Wrap** something so the client sees a different surface, a simpler surface, extra behavior, or controlled access | Adapter, Bridge, Decorator, Facade, Proxy |
| **Treat a tree like one object** | Composite |
| **Share the common part of many similar objects** | Flyweight |

The wrappers are the ones that blur. Composite and Flyweight answer different questions.

---

## 📦 One Line Each

| Pattern | In one line |
|---------|-------------|
| **Adapter** | Converts one existing interface into the interface the client already expects. Object adapter (composition) is the usual form; class adapter needs multiple inheritance. |
| **Bridge** | Splits one design into two hierarchies, abstraction and implementation, so each can grow on its own. Also called handle/body. |
| **Decorator** | Wraps an object with the **same** interface and adds behavior. Decorators stack. |
| **Facade** | One simpler interface in front of a subsystem of several classes. Clients can still reach the subsystem directly. |
| **Proxy** | Same interface as the real subject, standing in to control access: virtual (lazy), remote, protection, cache, or smart reference. |
| **Composite** | Leaves and groups share one interface, so a client can treat a part and a whole the same way. |
| **Flyweight** | Many fine-grained objects share immutable **intrinsic** state; the caller passes **extrinsic** state (position, color) into each operation. A factory returns the shared instance. |

---

## 📊 Which One Fits

| Situation | Use |
|-----------|-----|
| A class you cannot or should not change speaks a different interface from the one your client uses | **Adapter** |
| Two dimensions would otherwise explode into a class for every combination (shape × renderer, remote control × device) | **Bridge** |
| You want to add logging, caching, compression, or formatting at runtime, and stack those additions | **Decorator** |
| A client must start or query several collaborating classes through one obvious method | **Facade** |
| You must delay creation, guard a call, cache a result, or stand in for an object in another process | **Proxy** |
| Files and folders, menus, UI trees, org charts: an operation should run on one node or on the whole branch | **Composite** |
| Thousands of similar objects (glyphs, trees, tiles) would waste memory if each stored the same data | **Flyweight** |
| The object is already easy to call, and there is no tree and no crowd of duplicates | **Leave it alone** |

---

## ⚠️ Mix-ups

### The interface test (Adapter, Decorator, Proxy)

These three all sit in front of one object. Ask what happens to the interface.

| | Interface the client sees | What the wrapper is for | How many |
|--|---------------------------|-------------------------|----------|
| **Adapter** | A **different** interface from the thing inside | Make an incompatible class usable | Usually one adapter per adaptee |
| **Decorator** | The **same** interface | Add behavior | Stack them |
| **Proxy** | The **same** interface | Control access to the real subject | Usually one; the client may not know it is there |

A logging wrapper that still exposes `read()` is a Decorator (or a smart proxy, if the point is access rather than a new feature). A wrapper that turns `specificRequest()` into `request()` is an Adapter. A wrapper that loads the image on the first `draw()` and otherwise forwards `draw()` is a Proxy.

### Facade against Adapter, Decorator, and Proxy

**Facade** is one-to-many: it hides a subsystem and offers a smaller interface. The client’s life gets simpler.

**Adapter** is one-to-one: it translates a single incompatible interface. The client’s interface is the one it already wanted, not a newly simplified tour of many classes.

**Decorator** stacks behavior and keeps the original interface. From the client’s side the object can get richer, not smaller. The facade-versus-decorator lesson puts it this way: a facade reduces what the client must know; a decorator adds layers.

**Proxy** stands for one object and controls access to it. A facade stands for many objects and simplifies them.

### Bridge against Adapter and Decorator

**Bridge** is chosen while you are designing. Abstraction and implementation are two hierarchies on purpose (a shape holds a renderer; you add shapes without adding renderers, and the reverse). The companion lesson is [Abstraction and Implementation](2025-12-17-abstraction-and-implementation.md): what the client can ask, versus how it is carried out.

**Adapter** is applied after the classes exist, because their interfaces do not match. It is a repair, not a planned split of two dimensions.

**Decorator** adds responsibilities at runtime along one interface. Bridge picks an implementation at construction and keeps a one-to-one link between the abstraction and that implementation.

### Composite and Flyweight are not wrappers

**Composite** is a tree. A leaf and a composite implement the same component interface; `operation` on a group forwards to children. A decorator chain is a line of wrappers, not a part-whole hierarchy. You can decorate a node inside a composite; that is two patterns composed.

**Flyweight** is sharing. Intrinsic state lives in the shared object and stays immutable. Extrinsic state is passed in by the caller. Identity of the shared object does not matter.

Flyweight is easy to confuse with patterns from the creational reminder:

- **Singleton** is one instance of one class. Flyweight is many shared instances, one per distinct intrinsic state (one glyph for “A”, another for “B”).
- **Prototype** copies a whole object. Flyweight refuses to copy the shared part.
- **Object Pool** lends mutable, expensive objects and takes them back. Flyweight shares immutable data for the life of the process.

A composite of trees in a game often stores flyweight tree types and keeps position as extrinsic state.

### GoF Facade and Remote Facade

The GoF **Facade** simplifies a local subsystem. **Remote Facade** (PoEAA, later lesson) is a coarse-grained API across a process or network, so a remote client does not pay for a chatty series of fine-grained calls. Same word, different boundary.

---

## 🔗 How They Combine

- Adapt a legacy type, then put a proxy in front if access must be lazy or guarded.
- Decorate individual nodes of a composite.
- Share flyweight leaves inside a composite when the tree repeats the same parts.
- A facade may call adapters internally so the subsystem can use third-party libraries without leaking their interfaces.
- Bridge is the planned split; if a third-party implementor does not match the implementor interface, an adapter sits on that side of the bridge.

---

## 📝 Key Takeaways

1. Structural patterns arrange objects you already have: wrap, tree, or share.
2. Adapter changes the interface. Decorator and Proxy keep it. Decorator adds behavior and stacks; Proxy controls access and usually does not stack.
3. Facade simplifies many classes. Bridge splits two hierarchies on purpose, before the class explosion. Adapter repairs an interface after the fact.
4. Composite is part and whole behind one interface. Flyweight shares immutable intrinsic state and takes extrinsic state as an argument.
5. The full lessons and the two comparison notes hold the code.

---

## 📚 Full Lessons

| Pattern | Lesson |
|---------|--------|
| Adapter | [2025-12-16-adapter-pattern.md](2025-12-16-adapter-pattern.md) |
| Decorator vs Adapter | [2025-12-16-decorator-vs-adapter-deep-dive.md](2025-12-16-decorator-vs-adapter-deep-dive.md) |
| Bridge | [2025-12-17-bridge-pattern.md](2025-12-17-bridge-pattern.md) |
| Abstraction and implementation | [2025-12-17-abstraction-and-implementation.md](2025-12-17-abstraction-and-implementation.md) |
| Facade | [2025-12-19-facade-pattern.md](2025-12-19-facade-pattern.md) |
| Decorator | [2025-12-20-decorator-pattern.md](2025-12-20-decorator-pattern.md) |
| Composite | [2025-12-21-composite-pattern.md](2025-12-21-composite-pattern.md) |
| Flyweight | [2025-12-22-flyweight-pattern.md](2025-12-22-flyweight-pattern.md) |
| Proxy | [2025-12-23-proxy-pattern.md](2025-12-23-proxy-pattern.md) |
| Facade vs Decorator | [2025-12-24-facade-vs-decorator-and-static-vs-dynamic.md](2025-12-24-facade-vs-decorator-and-static-vs-dynamic.md) |
| Remote Facade (different pattern) | [2026-03-20-remote-facade-pattern.md](2026-03-20-remote-facade-pattern.md) |

---

**Date Created:** 2026-10-07  
**Type:** Reminder lesson (structural patterns)  
**Series:** Day 2 of the reminder track  
**Related:** GoF structural patterns, Section 1 of the learning plan; [Day 1 — creational](2026-10-06-reminder-creational-patterns.md)
