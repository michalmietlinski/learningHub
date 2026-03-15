# EIP Taxonomy – Summary Lesson

**Format:** Summary lesson (overview only; no code examples). Use with the full EIP lessons for detail and implementation.

---

## 📋 Learning Objectives

- [ ] See how Enterprise Integration Patterns (EIP) are grouped and named
- [ ] Recall each pattern’s role in one place
- [ ] Know where each pattern sits in the messaging pipeline (channels → routing → transformation → consumption)
- [ ] Use this as a quick reference before or after the full lessons

---

## 🎯 What Is EIP?

**Enterprise Integration Patterns (EIP)** are a set of patterns for designing and describing messaging and integration systems. They come from the book *Enterprise Integration Patterns* (Hohpe & Woolf) and give a **shared vocabulary** and **taxonomy** for channels, routing, transformation, and endpoints. This summary gives a short overview of each pattern you’ve covered and how they fit together.

---

## 📊 Taxonomy Overview

EIP can be grouped by **where** they sit in a message flow:

```
  Producers → [Channels] → [Routing] → [Transformation] → [Consumption] → Consumers
                │              │              │                  │
         Message Queue    Router, Filter   Translator,       Event-Driven,
         Message Channel                  Envelope          Polling Consumer
         (Point-to-Point,                  Wrapper          API Gateway,
          Pub/Sub)                                         Service Mesh
```

Supporting patterns (resilience, scale): **Load Balancing**, **Circuit Breaker**, **Retry**, **Bulkhead**, **Timeout**, **Fallback**, **Health Check**.

---

## 📦 Messaging (Channels)

| Pattern | In one line |
|--------|--------------|
| **Message Queue** | Decouples sender and receiver; messages are stored and delivered asynchronously; supports at-least-once and ordering within a queue. |
| **Dead Letter Queue (DLQ)** | Failed or unprocessable messages are moved to a separate queue for inspection, retry, or alerting instead of being lost. |
| **Message Channel** | Abstract connection over which messages flow; **Point-to-Point** (one consumer per message) vs **Publish-Subscribe** (one message to many subscribers). |

---

## 📦 Routing

| Pattern | In one line |
|--------|--------------|
| **Content-Based Router** | Sends each message to a different channel or handler based on the **content** of the message (e.g. type, region, priority). |
| **Message Filter** | Subscribes to a channel but **discards** messages that don’t match a condition; only matching messages are processed. |

---

## 📦 Message Flow (Split & Combine)

| Pattern | In one line |
|--------|--------------|
| **Splitter** | Takes one **composite** message and produces **many** messages (one per part) so each part can be processed independently. |
| **Aggregator** | Collects **many** related messages (e.g. by correlation id), and when a **completion condition** is met (count, timeout, or custom), emits **one** combined message. |
| **Scatter–Gather** | Splitter → process each part in parallel → Aggregator; the combined flow is sometimes called **Composed Message Processor**. |

---

## 📦 Transformation

| Pattern | In one line |
|--------|--------------|
| **Message Translator** | Converts a message from one **format** to another (e.g. XML → JSON, legacy → canonical) so the receiver can understand it without changing business meaning. |
| **Envelope Wrapper** | **Wraps** a payload with **metadata** (headers, correlation id, trace id) or **unwraps** it; used for tracing, routing by headers, and protocol adaptation. |

---

## 📦 Endpoints & Consumption

| Pattern | In one line |
|--------|--------------|
| **API Gateway** | Single **edge** entry point for clients; routes, aggregates, and sometimes translates calls to backend services; handles auth, rate limiting, and versioning. |
| **Service Mesh** | **Service-to-service** communication: discovery, load balancing, TLS, retries, and observability in the infrastructure layer (sidecar or proxy). |
| **Event-Driven Consumer** | **Push** model: the broker or producer delivers messages to the consumer when they arrive; consumer reacts to events. |
| **Polling Consumer** | **Pull** model: the consumer repeatedly asks the channel or queue for the next message; useful when the consumer controls rate or when no push is available. |

---

## 📦 Supporting (Resilience & Scale)

| Pattern | In one line |
|--------|--------------|
| **Load Balancing** | Distributes requests or messages across multiple instances to improve throughput and availability. |
| **Circuit Breaker** | Stops calling a failing dependency after a threshold; fails fast or uses fallback until the dependency is healthy again. |
| **Retry** | Automatically retries failed operations (with backoff and limits) to handle transient failures. |
| **Bulkhead** | Isolates resources (threads, connections) per dependency or tenant so one failure doesn’t exhaust all capacity. |
| **Timeout** | Stops waiting after a maximum time to avoid indefinite blocking. |
| **Fallback** | Provides a default response or path when the primary call fails. |
| **Health Check** | Exposes liveness (process up) and readiness (able to serve) so orchestrators and load balancers can route traffic correctly. |

---

## 🔗 How Patterns Combine

- **Channel** (Queue or Pub/Sub) is usually the backbone; **Router** and **Filter** decide where messages go; **Translator** and **Envelope** adapt format and metadata.
- **Splitter** and **Aggregator** together implement scatter–gather; **Event-Driven** or **Polling Consumer** defines how the application receives messages.
- **API Gateway** and **Service Mesh** are endpoint/infrastructure patterns; **Load Balancing** and **Circuit Breaker** (and related resilience patterns) make the system scalable and fault-tolerant.

---

## 📝 Key Takeaways

1. **EIP** gives a standard vocabulary for integration: channels, routing, transformation, and consumption.
2. **Channels** (Queue, Point-to-Point, Pub/Sub) carry messages; **routing** (Content-Based Router, Filter) and **transformation** (Translator, Envelope) shape the flow.
3. **Splitter** and **Aggregator** handle composite messages and scatter–gather; **Event-Driven** and **Polling Consumer** define how consumers get messages.
4. **API Gateway** and **Service Mesh** sit at the edge and between services; **resilience patterns** (Circuit Breaker, Retry, etc.) protect and scale the system.
5. Use this summary as a **map**; use the full EIP lessons for design details and implementation.

---

## 📚 Full Lessons (Reference)

| Pattern / topic | Lesson |
|------------------|--------|
| Message Queue, DLQ | 2026-02-15 |
| Message Channel | 2026-03-01 |
| Content-Based Router | 2026-02-28 |
| Message Filter | 2026-02-29 |
| Splitter / Aggregator | 2026-03-03 |
| Message Translator | 2026-03-04 |
| Envelope Wrapper | 2026-03-05 |
| Polling Consumer | 2026-03-06 |
| API Gateway | 2026-02-05 |
| Service Mesh | 2026-02-10 |
| Event-Driven Consumer | 2026-01-27 |
| Load Balancing | 2026-03-02 |
| Circuit Breaker (and resilience) | 2026-02-11, 2026-02-16–20 |

---

**Date Created:** 2026-03-12  
**Type:** Summary lesson (EIP taxonomy)  
**Related:** All EIP lessons in Section 10 of the learning plan
