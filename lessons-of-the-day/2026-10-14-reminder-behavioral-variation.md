# Reminder: Behavioral Patterns — Where the Step Changes

**Format:** Reminder lesson. One sitting to recall five behavioral patterns that vary a step, and to tell them apart. Definitions, code, and variations stay in the full lessons linked at the end.

**Question this reminder answers:** Where does the changing step live?

---

## 📋 Learning Objectives

- [ ] Recall Strategy, State, Template Method, Command, and Chain of Responsibility in one line each
- [ ] Choose among them from who picks the step, and whether the request is stored or passed on
- [ ] Separate Strategy from State, and Command from the chain, when the diagrams look alike

---

## 🎯 What These Patterns Share

All five take a varying step out of a pile of conditionals. They differ by **where that step lives** and **who chooses it**:

| The varying step lives in… | Who chooses it | Pattern |
|----------------------------|----------------|---------|
| A whole interchangeable algorithm | The client, from outside | **Strategy** |
| The object’s current mode | The object itself, by transitioning | **State** |
| A hook inside a fixed skeleton | A subclass, when the class is written | **Template Method** |
| A request object you can keep | The invoker, now or later | **Command** |
| One handler in a line of handlers | The chain, as the request walks it | **Chain of Responsibility** |

A short, stable `if` needs none of them.

---

## 📦 One Line Each

| Pattern | In one line |
|---------|-------------|
| **Strategy** | A family of algorithms behind one interface. The context holds one and the client swaps it. Also called Policy. |
| **State** | Each mode is its own class. The context delegates to the current state, and that state can move the context to the next mode. The object seems to change class. |
| **Template Method** | The base class owns the order of steps and calls hooks that subclasses fill in. Hollywood principle: the base calls the subclass. |
| **Command** | A request is an object (`execute`, often `undo`) binding a receiver. The invoker runs it without knowing the receiver. Also called Action or Transaction. |
| **Chain of Responsibility** | Handlers are linked. Each one handles the request or passes it to the next. The sender does not name the receiver. |

---

## 📊 Which One Fits

| Situation | Use |
|-----------|-----|
| Several complete ways to do one job (pay, sort, compress, discount), chosen at runtime | **Strategy** |
| Behavior depends on a mode, and the mode changes along known transitions (player, vending machine, document workflow) | **State** |
| Every variant shares the same steps; only some steps differ, and the base class must keep that order | **Template Method** |
| You must queue, log, delay, script, or undo the action | **Command** |
| More than one object might handle a request, and you do not know which one until it arrives (approval levels, middleware, bubbling events) | **Chain of Responsibility** |
| One obvious call, no history, no modes, no pipeline | **A direct call** |

---

## ⚠️ Mix-ups

### Strategy and State

The diagrams match: a context holds a delegate and forwards the call. The difference is who changes the delegate, and whether the delegates know each other.

**Strategy** algorithms are independent. The client passes one in. They do not move the context from one strategy to another.

**State** objects are a machine. A state knows the legal next states and tells the context to transition. The client sends the same request (`play`, `insertCoin`, `approve`); the current state decides what that means.

If you can name the algorithm from outside, it is Strategy. If the same call means different things because the object is in a different mode, it is State.

### Strategy and Template Method

Both vary an algorithm and both stay open to a new variant without editing the caller.

**Template Method** uses inheritance. The skeleton is fixed in the base class. A subclass replaces steps, not the order. The choice is made when you pick the subclass.

**Strategy** uses composition. The whole algorithm is replaceable at runtime. Use it when the variants do not share a stable sequence of steps.

Template Method can call a Strategy for one step: the skeleton stays fixed, and that one step is swapped in.

### Strategy and Command

Both turn behavior into an object you can pass around.

**Strategy** is “which algorithm runs now.” It is usually stateless and runs immediately. It does not remember that it ran.

**Command** is “this request, kept as a thing.” It knows its receiver, can sit in a queue or a log, and can undo. Use Command when you need history, delay, or a macro. Use Strategy when you only need to pick an algorithm.

A command may use a strategy inside `execute` for how that one action is carried out.

### Command and Chain of Responsibility

**Command** is one object. An invoker calls `execute` on it. Undo, a log, and a queue are the point.

**Chain of Responsibility** is a line of handlers. The request walks until a handler takes it. The sender never holds “the” receiver. Undo is not the point.

They compose: a chain can decide which command should run.

### Chain of Responsibility, Strategy, and Decorator

**Strategy:** the client names the one algorithm.

**Chain of Responsibility:** nobody names the handler up front. Each handler accepts or forwards. In the classic form, the first handler that can do the job stops the walk.

**Decorator** (structural reminder) keeps the same interface and every layer runs, adding behavior. A chain that always runs every handler and then continues — logging, Express-style middleware, a pipeline — is the lesson’s pipeline variation of the chain, not a Decorator. Decorator wraps one object to enrich it. The chain routes a request across several handlers.

If every handler must know all the others, that is a Mediator (the collaboration reminder), not a chain.

### State and “session state”

This **State** pattern is modes of one object (draft, review, approved). **Server Session State** (PoEAA, later lesson) is where a user’s data lives between HTTP requests. Same word, different problem.

---

## 🔗 How They Combine

- **Template Method** often creates the varying piece with a **Factory Method** (creational reminder): the skeleton calls a factory hook.
- Stateless **State** objects can be **Singletons** or **Flyweights**; one shared `Idle` is enough when the state holds no per-context data.
- **Command** plus **Memento** stores a snapshot for undo when the reverse operation is not enough. **Command** plus **Composite** is a macro. **Command** plus **Prototype** clones a command you want to reissue.
- **State** can hold a **Strategy** for an algorithm that is legal only in that mode.

---

## 📝 Key Takeaways

1. These five pull a varying step out of conditionals. The choice is where the step lives.
2. **Strategy** is a client-chosen algorithm. **State** is an internal mode that transitions. Same shape, different owner.
3. **Template Method** fixes the order in a base class and lets subclasses fill hooks. **Strategy** replaces the whole algorithm at runtime.
4. **Command** stores a request so you can queue, log, and undo it. **Chain of Responsibility** walks handlers until one takes the request.
5. A small, stable conditional stays a conditional. The full lessons hold the implementations.

---

## 📚 Full Lessons

| Pattern | Lesson |
|---------|--------|
| Strategy | [2025-12-28-strategy-pattern.md](2025-12-28-strategy-pattern.md) |
| Template Method and State | [2025-12-28-template-method-state-pattern.md](2025-12-28-template-method-state-pattern.md) |
| Command | [2025-12-29-command-pattern.md](2025-12-29-command-pattern.md) |
| Chain of Responsibility | [2025-12-30-chain-of-responsibility-pattern.md](2025-12-30-chain-of-responsibility-pattern.md) |
| Server Session State (different problem) | [2026-03-23-server-session-state-pattern.md](2026-03-23-server-session-state-pattern.md) |

---

**Date Created:** 2026-10-14  
**Type:** Reminder lesson (behavioral variation)  
**Series:** Day 3 of the reminder track  
**Related:** [Day 1 — creational](2026-10-06-reminder-creational-patterns.md), [Day 2 — structural](2026-10-07-reminder-structural-patterns.md)
