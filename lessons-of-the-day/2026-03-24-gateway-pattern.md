# Gateway Pattern (PoEAA Base Pattern)

## 📋 Learning Objectives

- [ ] Understand the Gateway base pattern and why it isolates external systems
- [ ] Learn how Gateway provides a stable API over volatile/external interfaces
- [ ] Distinguish Gateway from API Gateway, Repository, and Adapter
- [ ] Master common responsibilities: translation, error mapping, retry/timeouts, observability
- [ ] Know when to use Gateway per integration boundary
- [ ] Apply best practices and avoid common pitfalls

---

## 🎯 Definition

The **Gateway** (in PoEAA base patterns) is an object that **encapsulates access to an external system or subsystem** and presents a clean interface to the rest of the application. It hides protocol details, request/response formats, endpoint mechanics, and low-level failure handling behind a local API.

Its goal is to keep domain/application code independent from external interface churn and transport concerns.

**Origin:**
- Martin Fowler, *Patterns of Enterprise Application Architecture* (PoEAA)
- Foundation pattern for integrating with remote services, legacy systems, queues, files, or infrastructure APIs
- Often combined with DTO/translator patterns to map external contracts to internal models

**Key Principle:**
> "Put a gateway between your app and external systems so the rest of your code depends on a stable local interface, not on external protocol details."

**Alternative formulation:**
> "External calls should go through one dedicated boundary object that translates, validates, and normalizes communication."

---

## 🏗️ Core Concepts

### Why Gateway Exists

Without a gateway, application services often call HTTP/SQL/SDK clients directly:
- endpoint URLs and headers spread through business code
- error handling duplicated inconsistently
- retry/timeouts missing or ad hoc
- external schema changes leak across many modules

A Gateway centralizes that boundary.

### Boundary Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  APPLICATION / DOMAIN                                            │
│   OrderService, BillingUseCase, ...                              │
│                │                                                  │
│                ▼                                                  │
│          PaymentGateway (interface)                               │
│          InventoryGateway (interface)                             │
│                │                                                  │
│                ▼                                                  │
│   HTTP/SDK/Queue/File specific gateway implementations            │
│   - request mapping                                                │
│   - response mapping                                               │
│   - error mapping                                                  │
│   - timeout/retry policy                                           │
│                │                                                  │
│                ▼                                                  │
│          External systems (payment API, ERP, etc.)                │
└─────────────────────────────────────────────────────────────────┘
```

### Typical Responsibilities

| Responsibility | What it means |
|----------------|---------------|
| **Protocol encapsulation** | Hide HTTP/SDK/queue/file details from use-case code. |
| **Data translation** | Map internal DTO/model to external payload and back. |
| **Error normalization** | Convert transport/vendor errors into app/domain-level errors. |
| **Resilience policy** | Apply timeout/retry/circuit breaker rules in one place. |
| **Telemetry** | Add logging, metrics, tracing at integration boundary. |

### One Gateway per External Boundary

Prefer clear ownership:
- `PaymentGateway`
- `InventoryGateway`
- `ShippingGateway`

Avoid giant "ExternalSystemsGateway" classes that mix unrelated concerns.

---

## 📦 Relation to Other Patterns

| Pattern | Relationship |
|---------|---------------|
| **API Gateway (microservices edge)** | Different scope: API Gateway is edge infrastructure for clients; PoEAA Gateway is code-level boundary object inside an app/service. |
| **Repository** | Repository abstracts persistence/domain aggregates; Gateway abstracts external systems/integrations. |
| **Adapter** | Adapter changes one interface into another; a Gateway often uses adapter-like translation but also owns operational concerns (timeouts/errors/retries). |
| **Remote Facade** | Remote Facade is a coarse API exposed to remote clients; Gateway is usually used by internal code to call outward dependencies. |
| **Message Translator / Envelope Wrapper** | Useful within gateway implementation when integrating message-based or schema-mismatched systems. |

---

## 📊 When to Use Gateway

| Scenario | Use Gateway? |
|----------|--------------|
| Calling third-party API/SDK from business logic | ✅ Isolate dependency and normalize behavior. |
| Integrating with legacy/unstable external contracts | ✅ Shield core code from contract changes. |
| Need consistent timeout/retry/error policy | ✅ Centralize operational behavior per dependency. |
| Internal simple module call (same codebase/process) | ⚠️ Usually unnecessary; direct interface may be enough. |
| Multiple apps need same integration behavior | ✅ Consider shared gateway library/component if ownership allows. |

---

## ⚠️ Common Pitfalls

1. **God Gateway** - One massive class for all external systems becomes unmaintainable.
2. **Leaking transport details upward** - Returning raw HTTP responses/status codes to use cases couples core logic to protocol.
3. **Missing resilience defaults** - No timeout/retry leads to hanging calls and cascading failures.
4. **Silent data translation errors** - Mapping mistakes at boundary can corrupt business behavior; validate and test mappings.
5. **Business logic in gateway** - Gateway should translate and coordinate boundary concerns, not implement core domain rules.

---

## 🎯 Best Practices

1. **Define interface in application/domain boundary** and implement in infrastructure.
2. **Use dependency-specific gateway per external system** for clear ownership and testing.
3. **Normalize errors** to domain/app error types (e.g., `PaymentDeclined`, `InventoryUnavailable`, `DependencyTimeout`).
4. **Set explicit timeout/retry policy** per operation; avoid global one-size-fits-all.
5. **Keep contracts explicit** with DTO mapping and version-aware transformations.
6. **Instrument boundaries** with logs/metrics/traces to debug integration issues quickly.

---

## 🔗 Related Patterns & Topics

| Topic | Relationship |
|-------|--------------|
| **Remote Facade** | Exposes coarse API to inbound remote clients; Gateway handles outbound dependency access. |
| **Repository** | Similar abstraction idea, different target (domain persistence vs external systems). |
| **Circuit Breaker / Retry / Timeout** | Commonly applied inside gateway implementations. |
| **Message Translator** | Often used inside gateways when external schema differs from internal model. |

---

## 📝 Key Takeaways

1. **Gateway** isolates your core code from external protocol and vendor details.
2. It provides a stable local interface and central place for translation, error mapping, and resilience.
3. Keep one gateway per external boundary and avoid mixing unrelated dependencies.
4. Distinguish PoEAA Gateway from API Gateway (edge infrastructure concept).
5. Treat gateway as an integration boundary, not a home for domain business rules.

---

**Date Created:** 2026-03-24  
**Pattern Type:** Enterprise Application (PoEAA) – Base Pattern  
**Difficulty:** Intermediate  
**Related:** Repository, Remote Facade, Adapter, API Gateway, Retry/Timeout/Circuit Breaker
