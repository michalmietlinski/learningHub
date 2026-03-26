# GRASP Principles - General Responsibility Assignment Software Patterns

## 📋 Learning Objectives

- [ ] Understand what GRASP is and why it improves object-oriented design
- [ ] Learn all 9 GRASP principles with practical intent
- [ ] Apply GRASP to assign responsibilities in maintainable ways
- [ ] Recognize common misuses (god classes, high coupling, low cohesion)
- [ ] Connect GRASP to SOLID, Clean Architecture, and DDD decisions

---

## 🎯 Definition

**GRASP** (General Responsibility Assignment Software Patterns) is a set of nine design principles that help you decide **which class or component should do what**. GRASP is not about syntax or frameworks; it is about assigning responsibilities to reduce coupling, keep cohesion high, and keep systems flexible.

The core question GRASP answers is:
> "Given a requirement, where should this behavior live so the design stays understandable, testable, and change-friendly?"

**Origin:**
- Craig Larman, *Applying UML and Patterns*
- Used as responsibility-assignment heuristics in OOP design
- Complements SOLID and common design patterns

---

## 🧭 The 9 GRASP Principles

### 1) Information Expert
Assign responsibility to the class that has the necessary information.

- `Order` calculates total because it owns order lines.
- `Invoice` validates invoice fields because it owns invoice data.

### 2) Creator
Class B should create class A when B aggregates/contains/closely uses A.

- `Order` creates `OrderLine`.
- `Cart` creates `CartItem`.

### 3) Controller
Use a non-UI object to handle system operations from UI/API.

- `OrderController` receives "place order" request.
- It coordinates services/entities instead of UI doing business logic.

### 4) Low Coupling
Assign responsibilities to minimize dependencies between classes.

- Depend on `IOrderRepository`, not SQL implementation.
- Avoid classes that know too much about other modules.

### 5) High Cohesion
Keep each class focused on closely related responsibilities.

- `PaymentService` should process payments, not build PDF reports.
- `ReportService` should not validate domain invariants.

### 6) Polymorphism
When behavior varies by type, use polymorphic operations.

- `PaymentMethod.charge()` implemented by `CardPayment`, `PayPalPayment`.
- Avoid long `if/else` chains by type when possible.

### 7) Pure Fabrication
Create a service class that does not represent a domain concept when it improves design.

- `EmailSender`, `AuditLogger`, `PasswordHasher`.
- Useful for infrastructure concerns and testability.

### 8) Indirection
Insert an intermediary to decouple components.

- Event bus between publisher and subscribers.
- Application service between controller and repositories.

### 9) Protected Variations
Shield unstable points behind stable interfaces.

- External payment gateway hidden behind `IPaymentProvider`.
- Database vendor differences hidden behind repository/data access abstractions.

---

## 🏗️ Quick Responsibility Assignment Example

Requirement: "Place order, reserve stock, charge payment, persist order."

```
API -> OrderController -> PlaceOrderService
                      -> IInventoryGateway
                      -> IPaymentProvider
                      -> IOrderRepository
                      -> UnitOfWork
```

How GRASP helps:
- **Controller:** `OrderController` receives request.
- **Indirection + Pure Fabrication:** `PlaceOrderService` coordinates the use case.
- **Protected Variations:** gateways/providers abstract external systems.
- **Information Expert:** `Order` validates its own state and computes total.
- **Low Coupling:** service depends on interfaces.
- **High Cohesion:** each class has one focused reason to change.

---

## ⚠️ Common Pitfalls

1. **One controller does everything** - Turns into a god class and breaks cohesion.
2. **Anemic domain model** - All logic in services, entities only getters/setters.
3. **Over-abstraction too early** - Too many interfaces without real variation.
4. **Ignoring Information Expert** - Logic placed in unrelated helper classes.
5. **Coupling to infrastructure** - Domain/application directly calling SQL/SDK code.

---

## 🎯 Best Practices

1. **Start with responsibilities, not classes** - List behaviors first, then assign.
2. **Prefer Information Expert first** - Put behavior near the data it needs.
3. **Use services intentionally** - For orchestration and cross-aggregate workflows.
4. **Abstract only unstable boundaries** - External APIs, storage, message buses.
5. **Review coupling/cohesion regularly** - Refactor when classes get mixed concerns.

---

## 📊 GRASP vs Related Principles

| Principle | Focus | Relationship to GRASP |
|----------|-------|------------------------|
| **SOLID** | Class/interface design quality | GRASP helps assign responsibilities; SOLID helps refine class design afterwards. |
| **Separation of Concerns** | Splitting system responsibilities | GRASP operationalizes this at class/component level. |
| **DDD** | Domain modeling and boundaries | GRASP supports tactical decisions inside aggregates/services. |
| **Clean Architecture** | Dependency direction and layers | GRASP guides responsibility assignment within and across those layers. |

---

## 💻 Mini Code Example

```typescript
interface PaymentProvider {
  charge(customerId: string, amount: number): Promise<void>;
}

class Order {
  constructor(private readonly lines: Array<{ price: number; qty: number }>) {}

  totalAmount(): number {
    // Information Expert: Order knows its own lines.
    return this.lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  }
}

class PlaceOrderService {
  constructor(
    private readonly paymentProvider: PaymentProvider,
    private readonly orderRepository: { save(order: Order): Promise<void> }
  ) {}

  async execute(order: Order, customerId: string): Promise<void> {
    await this.paymentProvider.charge(customerId, order.totalAmount());
    await this.orderRepository.save(order);
  }
}
```

What this demonstrates:
- **Protected Variations:** `PaymentProvider` interface hides vendor API.
- **Low Coupling:** service uses abstractions, not concrete SDK classes.
- **Information Expert:** `Order` computes total.
- **High Cohesion:** service orchestrates use case, entity holds core domain behavior.

---

## 🧪 Practice and Interview Prep

### Quick practice tasks
1. Take one existing class that has 3+ responsibilities and split it using GRASP.
2. Replace one `if/else`-by-type block with polymorphism.
3. Identify one unstable external dependency and introduce an interface boundary.

### Interview questions
1. What is the difference between Information Expert and Controller?
2. When is Pure Fabrication useful, and when can it become over-engineering?
3. How do Low Coupling and High Cohesion influence testability?
4. How does Protected Variations help with third-party API changes?
5. How do GRASP and SOLID complement each other in real codebases?

---

## 📝 Key Takeaways

1. GRASP is a responsibility-assignment toolkit for cleaner OOP design.
2. Information Expert, Low Coupling, and High Cohesion are the most practical daily anchors.
3. Controller, Indirection, and Pure Fabrication help structure use-case orchestration.
4. Polymorphism and Protected Variations reduce brittle branching and vendor lock-in.
5. GRASP works best together with SOLID and architecture boundaries.

---

**Date Created:** 2026-03-26  
**Topic Type:** Foundational Principles  
**Difficulty:** Intermediate  
**Related:** SOLID, Separation of Concerns, Clean Architecture, DDD
