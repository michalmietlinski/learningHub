# Load Balancing Pattern

## 📋 Learning Objectives

- [ ] Understand what load balancing is and why it matters
- [ ] Master load balancing algorithms (round-robin, least connections, weighted, etc.)
- [ ] Learn Layer 4 vs Layer 7 load balancing
- [ ] Implement client-side and server-side load balancing
- [ ] Configure health checks and session persistence
- [ ] Apply load balancing in Kubernetes, Nginx, and application code
- [ ] Understand common pitfalls and best practices

---

## 🎯 Definition

**Load balancing** is the process of distributing incoming requests or tasks across multiple servers or computing resources to optimize performance, prevent overload, and ensure high availability.

**Key Principle:**
> "Distribute work across multiple resources so no single resource becomes a bottleneck and the system remains available when individual resources fail."

---

## 🏗️ Core Concepts

### The Problem Load Balancing Solves

```
Without Load Balancing:
┌──────────┐         ┌─────────────┐
│  Clients │────────▶│   Server    │  ← Overloaded, single point of failure
└──────────┘         │   (one)     │
                     └─────────────┘
                            ❌ Slow, crashes = outage

With Load Balancing:
┌──────────┐    ┌──────────────┐    ┌─────────────┐
│  Clients │───▶│ Load Balancer │───▶│   Server 1  │
└──────────┘    └───────┬───────┘    ├─────────────┤
                       │             │   Server 2  │
                       ├────────────▶├─────────────┤
                       │             │   Server 3  │
                       └────────────▶└─────────────┘
                            ✅ Distributed load, high availability
```

### Key Terminology

| Term | Description |
|------|-------------|
| **Load Balancer** | Component that distributes requests across backends |
| **Backend / Upstream** | Server(s) that handle the actual work |
| **Pool / Cluster** | Group of backends behind a load balancer |
| **Session Persistence** | Sending same client to same server (sticky session) |
| **Health Check** | Probe to determine if a backend is fit to receive traffic |
| **Layer 4** | Transport layer (TCP/UDP) load balancing |
| **Layer 7** | Application layer (HTTP/HTTPS) load balancing |

---

## 📊 Load Balancing Algorithms

### 1. Round-Robin

Distributes requests sequentially: Server 1 → Server 2 → Server 3 → repeat.

```javascript
// Simple round-robin in application code
const backends = ['http://server1:8080', 'http://server2:8080', 'http://server3:8080'];
let index = 0;

function getNextBackend() {
  const backend = backends[index % backends.length];
  index++;
  return backend;
}

// Use in request
const backend = getNextBackend();
const response = await fetch(`${backend}/api/orders`);
```

**Use when:** Backends are equal, requests are similar in cost.

### 2. Weighted Round-Robin

Like round-robin, but stronger servers get more requests.

```nginx
# Nginx: weighted round-robin
upstream backend {
    server 10.0.0.1:8080 weight=3;
    server 10.0.0.2:8080 weight=2;
    server 10.0.0.3:8080 weight=1;
}
```

```javascript
// Weighted round-robin in code
const backends = [
  { url: 'http://server1:8080', weight: 3 },
  { url: 'http://server2:8080', weight: 2 },
  { url: 'http://server3:8080', weight: 1 }
];
const totalWeight = backends.reduce((s, b) => s + b.weight, 0);
let counter = 0;

function getNextBackend() {
  counter = (counter + 1) % totalWeight;
  let acc = 0;
  for (const b of backends) {
    acc += b.weight;
    if (counter < acc) return b.url;
  }
  return backends[0].url;
}
```

### 3. Least Connections

Sends new requests to the server with the fewest active connections.

```nginx
# Nginx: least connections
upstream backend {
    least_conn;
    server 10.0.0.1:8080;
    server 10.0.0.2:8080;
    server 10.0.0.3:8080;
}
```

**Use when:** Requests have very different durations (e.g. long-lived connections).

### 4. IP Hash

Uses client IP to choose server. Same client → same server (session affinity).

```nginx
# Nginx: ip_hash for sticky sessions
upstream backend {
    ip_hash;
    server 10.0.0.1:8080;
    server 10.0.0.2:8080;
    server 10.0.0.3:8080;
}
```

### 5. Least Response Time

Sends requests to the server with the lowest average response time (or latency).

**Use when:** Server performance varies; good for dynamic load.

### 6. Random / Power of Two Choices

Randomly pick two servers, send to the less loaded one. Simple and effective.

```javascript
// Power of two choices (conceptual)
function selectBackend(backends, getLoad) {
  const a = backends[Math.floor(Math.random() * backends.length)];
  const b = backends[Math.floor(Math.random() * backends.length)];
  return getLoad(a) <= getLoad(b) ? a : b;
}
```

---

## 🔀 Layer 4 vs Layer 7

| Aspect | Layer 4 (L4) | Layer 7 (L7) |
|--------|---------------|---------------|
| **Works with** | TCP/UDP | HTTP/HTTPS, gRPC |
| **Routing by** | IP + port | URL, headers, cookies |
| **SSL** | Pass-through or terminate | Often terminate at LB |
| **Speed** | Faster, less CPU | Slower, more CPU |
| **Use case** | High throughput, simple routing | Content-based routing, APIs |

```nginx
# Layer 4 (stream) - Nginx
stream {
    upstream tcp_backend {
        server 10.0.0.1:3306;
        server 10.0.0.2:3306;
    }
    server {
        listen 3306;
        proxy_pass tcp_backend;
    }
}

# Layer 7 (http) - Nginx
http {
    upstream http_backend {
        server 10.0.0.1:8080;
        server 10.0.0.2:8080;
    }
    server {
        listen 80;
        location / {
            proxy_pass http://http_backend;
        }
    }
}
```

---

## 🛠️ Implementation Examples

### Node.js – Client-Side Round-Robin

```javascript
const backends = [
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003'
];
let current = 0;

async function proxyRequest(req, res) {
  const backend = backends[current % backends.length];
  current++;

  try {
    const response = await fetch(`${backend}${req.url}`, {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' ? req.body : undefined
    });
    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    res.status(502).send('Bad Gateway');
  }
}
```

### Node.js – Health-Aware Load Balancer

```javascript
const backends = [
  { url: 'http://localhost:3001', healthy: true },
  { url: 'http://localhost:3002', healthy: true },
  { url: 'http://localhost:3003', healthy: true }
];

async function checkHealth(url) {
  try {
    const res = await fetch(`${url}/health`, { timeout: 2000 });
    return res.ok;
  } catch {
    return false;
  }
}

async function healthCheckLoop() {
  for (const b of backends) {
    b.healthy = await checkHealth(b.url);
  }
  setTimeout(healthCheckLoop, 10000);
}
healthCheckLoop();

function getHealthyBackend() {
  const healthy = backends.filter(b => b.healthy);
  if (healthy.length === 0) throw new Error('No healthy backends');
  return healthy[Math.floor(Math.random() * healthy.length)].url;
}
```

### Nginx – Basic HTTP Load Balancer

```nginx
upstream api_backend {
    # Default: round-robin
    server 10.0.0.1:8080;
    server 10.0.0.2:8080;
    server 10.0.0.3:8080 backup;  # Use only if others are down
}

server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Nginx – Health Checks and Sticky Session

```nginx
upstream backend {
    least_conn;
    server 10.0.0.1:8080 max_fails=3 fail_timeout=30s;
    server 10.0.0.2:8080 max_fails=3 fail_timeout=30s;
    server 10.0.0.3:8080 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    location / {
        proxy_pass http://backend;
        proxy_next_upstream error timeout http_502 http_503;
        # Sticky session via cookie
        proxy_cookie_path / "/; sticky; secure; HttpOnly; SameSite=strict";
    }
}
```

### Kubernetes – Service Load Balancing

```yaml
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  selector:
    app: order-service
  ports:
    - port: 80
      targetPort: 8080
  type: ClusterIP  # Internal load balancing across pods
---
# Default: round-robin across ready pods
# Session affinity (sticky):
apiVersion: v1
kind: Service
metadata:
  name: order-service
spec:
  sessionAffinity: ClientIP
  sessionAffinityConfig:
    clientIP:
      timeoutSeconds: 10800
  selector:
    app: order-service
  ports:
    - port: 80
      targetPort: 8080
```

### HAProxy – Algorithm and Health Check

```haproxy
frontend http_front
    bind *:80
    default_backend api_servers

backend api_servers
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    server server1 10.0.0.1:8080 check inter 5s fall 3 rise 2
    server server2 10.0.0.2:8080 check inter 5s fall 3 rise 2
    server server3 10.0.0.3:8080 check inter 5s fall 3 rise 2
```

---

## 📐 Session Persistence (Sticky Sessions)

When a client must hit the same backend (e.g. in-memory session):

| Method | How it works | Pros / Cons |
|--------|----------------|-------------|
| **IP hash** | Same client IP → same server | Simple; bad for NAT/mobile |
| **Cookie** | LB sets cookie, next request uses it | Application-friendly |
| **SSL ID** | Same TLS session → same server | No app change; TLS-only |

```javascript
// Application: set cookie so LB can use it
app.use((req, res, next) => {
  if (!req.cookies?.backend_id) {
    res.cookie('backend_id', process.env.POD_NAME || 's1', {
      httpOnly: true,
      maxAge: 3600000
    });
  }
  next();
});
```

---

## ⚠️ Common Pitfalls

### 1. No Health Checks

```javascript
// ❌ BAD: Send traffic to dead server
const backend = backends[index % backends.length];

// ✅ GOOD: Only healthy backends
const backend = healthyBackends[index % healthyBackends.length];
```

### 2. Ignoring Backend Capacity

```nginx
# ✅ Use weight when backends differ
upstream backend {
    server 10.0.0.1:8080 weight=5;
    server 10.0.0.2:8080 weight=1;
}
```

### 3. Sticky Session Overuse

Sticky sessions can create hotspots. Prefer stateless design + shared session store when possible.

### 4. Single Load Balancer

Use active-passive or active-active for the LB itself so it isn’t a single point of failure.

---

## 🎯 Best Practices

1. **Health checks** – Only send traffic to backends that pass health checks.
2. **Graceful shutdown** – Drain connections (connection draining) before removing a backend.
3. **Stateless backends** – Avoid sticky sessions when you can; use shared caches/sessions.
4. **Monitor** – Track latency, error rate, and backend utilization per server.
5. **Fail fast** – Use timeouts and circuit breakers so one slow backend doesn’t block the LB.

---

## 🔗 Related Patterns

| Pattern | Relationship |
|---------|----------------|
| **Health Check** | LB uses health checks to add/remove backends |
| **API Gateway** | Often performs load balancing to backend services |
| **Service Mesh** | Provides L7 load balancing and traffic policy |
| **Circuit Breaker** | Avoid sending traffic to failing backends |
| **Service Discovery** | LB uses it to know the set of backends |

---

## 📝 Key Takeaways

1. Load balancing **distributes requests** across multiple backends for performance and availability.
2. **Round-robin** is simple; **least connections** suits varying request duration; **weighted** suits different server sizes.
3. **Layer 4** is fast and simple; **Layer 7** enables content-based routing and SSL termination.
4. Always use **health checks** and only route to healthy backends.
5. Prefer **stateless** backends; use **sticky sessions** only when necessary.

---

**Date Created:** 2026-03-02  
**Pattern Type:** Infrastructure / Resilience  
**Difficulty:** Intermediate  
**Related Patterns:** Health Check, API Gateway, Service Mesh, Circuit Breaker
