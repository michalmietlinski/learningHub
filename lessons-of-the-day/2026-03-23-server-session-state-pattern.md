# Server Session State Pattern

## 📋 Learning Objectives

- [ ] Understand the Server Session State pattern and what "conversational state" means
- [ ] Learn where session state lives (in-memory, distributed cache, database)
- [ ] Distinguish server-side session state from client-side state (cookies/tokens)
- [ ] Relate session state to scalability, load balancing, and failover
- [ ] Know when to use Server Session State vs stateless APIs
- [ ] Apply best practices and avoid common pitfalls

---

## 🎯 Definition

The **Server Session State** pattern stores per-user conversational state on the **server side** across multiple requests. The client carries only a **session identifier** (typically in a cookie/header), while the server (or a shared session store) holds the actual session data.

This is useful when a workflow spans multiple steps and needs temporary state (e.g., shopping cart, wizard progress, draft form state) that should not be fully trusted to the client.

**Origin:**
- Martin Fowler, *Patterns of Enterprise Application Architecture* (PoEAA)
- Common in web applications before and alongside stateless token approaches
- Still widely used for carts, back-office workflows, and server-trusted conversational state

**Key Principle:**
> "Keep conversational state on the server and reference it by session id from the client."

**Alternative formulation:**
> "Client sends a key; server retrieves state. The state remains server-owned and can be updated across requests."

---

## 🏗️ Core Concepts

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  SERVER SESSION STATE FLOW                                      │
│                                                                  │
│  1) Client starts interaction                                    │
│  2) Server creates session id (e.g., SID=abc123)                │
│  3) Client stores SID cookie/header                              │
│  4) On each request, client sends SID                            │
│  5) Server loads session data by SID from session store          │
│  6) Server updates session state and returns response            │
│                                                                  │
│  Session data stays server-side; client only holds SID           │
└─────────────────────────────────────────────────────────────────┘
```

### What Usually Goes Into Session

| Good session data | Why |
|-------------------|-----|
| Authentication context (user id, roles snapshot) | Needed across requests after login. |
| Wizard/cart/workflow progress | Multi-step conversational state. |
| CSRF/session metadata | Security/session lifecycle support. |

| Avoid in session | Why |
|------------------|-----|
| Large objects/blobs | Increases memory and network overhead in distributed stores. |
| Sensitive secrets in plaintext | Session stores can be exposed; apply least data + encryption policies. |
| Permanent business data | Store in database as system of record, not session. |

### Storage Options

| Storage | Pros | Cons |
|---------|------|------|
| **In-memory (single node)** | Fast, simple | Not shared across servers; lost on restart; poor horizontal scaling. |
| **Distributed cache (Redis, Memcached)** | Shared across instances; scalable; TTL support | Extra infrastructure; network hop; requires resilience planning. |
| **Database-backed sessions** | Durable, transactional options | Slower than cache; higher DB load for frequent session access. |

---

## 📦 Relation to Other Patterns

| Pattern | Relationship |
|---------|---------------|
| **Remote Facade / BFF** | Facade/BFF may rely on server session state for conversational workflows per client. |
| **Gateway** | Gateway can use session context for routing/auth decisions, but avoid embedding too much mutable state at edge. |
| **Load Balancing** | Session state strategy affects LB design: sticky sessions vs shared session store. |
| **Token/JWT-based stateless auth** | Alternative: keep state on client/token and validate server-side; Server Session State keeps mutable conversation data server-owned. |

---

## 📊 When to Use Server Session State

| Scenario | Use Server Session State? |
|----------|----------------------------|
| Multi-step UI workflow with temporary state | ✅ Natural fit. |
| Need server-controlled mutable user context | ✅ State stays trusted server-side. |
| Small monolith on single node | ✅ Works easily (with in-memory or DB store). |
| Large stateless API ecosystem | ⚠️ Prefer stateless designs unless workflow demands session state. |
| High-scale distributed services with frequent failover | ⚠️ Use distributed session store; avoid local memory-only sessions. |

---

## ⚠️ Common Pitfalls

1. **In-memory sessions with multi-node deployment** - Requests may land on different servers and lose session unless sticky sessions or shared store is used.
2. **Unbounded session growth** - Storing too much data per session increases memory pressure and latency.
3. **No expiration policy** - Stale sessions accumulate and can become security risk.
4. **Session fixation/hijacking risk** - Weak session id handling can allow takeover.
5. **Treating session as source of truth** - Business records must live in database; session is temporary conversational state.

---

## 🎯 Best Practices

1. **Use strong random session IDs** - Rotate on login/privilege changes.
2. **Set TTL and idle timeout** - Expire old sessions consistently.
3. **Keep session payload minimal** - Store only data needed for current conversation.
4. **Use shared session store for scale** - Redis-like store avoids node affinity issues.
5. **Secure transport and cookie flags** - `Secure`, `HttpOnly`, `SameSite` and TLS.
6. **Monitor session metrics** - Count, size, churn, expiration, store latency/errors.

---

## 🔗 Related Patterns & Topics

| Topic | Relationship |
|-------|--------------|
| **Remote Facade** | Often a boundary where session-backed conversational operations are exposed. |
| **Gateway** | May consume session context, especially in web architectures. |
| **Load Balancing** | Session strategy impacts sticky sessions vs centralized store. |
| **JWT / OAuth** | Stateless auth alternatives; can coexist with server session for workflow state. |

---

## 📝 Key Takeaways

1. **Server Session State** keeps conversational user state on server, referenced by session id from client.
2. It's useful for multi-step workflows where state is mutable and should remain server-trusted.
3. For scale, prefer a **shared session store** over per-node memory-only sessions.
4. Keep session data minimal, expiring, and secure (ID rotation, cookie/TLS protections).
5. Session is temporary conversation context, not a long-term system-of-record store.

---

**Date Created:** 2026-03-23  
**Pattern Type:** Enterprise Application (PoEAA) – Session State  
**Difficulty:** Intermediate  
**Related:** Remote Facade, Gateway, Load Balancing, JWT/OAuth
