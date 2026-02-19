# Health Check Pattern

## 📋 Learning Objectives

- [ ] Understand the purpose and types of health checks
- [ ] Master liveness vs readiness vs startup probes
- [ ] Implement health check endpoints in different languages
- [ ] Design health aggregation for dependencies
- [ ] Configure Kubernetes health probes
- [ ] Apply health check best practices

---

## 🎯 Definition

The **Health Check Pattern** provides a mechanism for services to report their operational status. External systems (load balancers, orchestrators, monitoring) query health endpoints to determine if a service can handle requests.

**Key Principle:**
> "A service should be able to answer: Am I alive? Am I ready to serve traffic?"

---

## 🏗️ Core Concepts

### Why Health Checks?

```
Without Health Checks:
┌─────────────┐         ┌─────────────┐
│   Client    │────────▶│   Service   │  ← Crashed/Unhealthy
└─────────────┘         │   (dead)    │
        │               └─────────────┘
        │                      ❌
        └──────── Request fails, user sees error

With Health Checks:
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Client    │───▶│ Load Balancer │───▶│   Service   │
└─────────────┘    └──────────────┘    │   (healthy) │
                          │             └─────────────┘
                          │             ┌─────────────┐
                          ├────────────▶│   Service   │ ✓ Health OK
                          │             │   (healthy) │
                          │             └─────────────┘
                          │             ┌─────────────┐
                          └──────X──────│   Service   │ ✗ Unhealthy
                                        │   (dead)    │  → Removed
                                        └─────────────┘
```

---

## 📊 Types of Health Checks

### 1. Liveness Probe

**Question:** "Is the process alive and not deadlocked?"

```
Purpose: Detect if the application needs to be RESTARTED

┌─────────────────────────────────────────────────┐
│ Liveness Check                                  │
├─────────────────────────────────────────────────┤
│ ✓ Process is running                            │
│ ✓ Main thread is responsive                     │
│ ✓ No deadlock detected                          │
│ ✓ Memory is not exhausted                       │
├─────────────────────────────────────────────────┤
│ Failure → RESTART the container/process         │
└─────────────────────────────────────────────────┘
```

**What to check:**
- Process heartbeat
- Main thread responsiveness
- Basic memory availability
- NO external dependencies!

```javascript
// GOOD: Simple liveness check
app.get('/health/live', (req, res) => {
  // Just verify the process can respond
  res.status(200).json({ status: 'alive' });
});

// BAD: Checking database in liveness
app.get('/health/live', async (req, res) => {
  const dbOk = await checkDatabase();  // DON'T DO THIS!
  // If DB is down, container restarts - but that won't fix DB!
});
```

### 2. Readiness Probe

**Question:** "Can this instance handle traffic right now?"

```
Purpose: Detect if the application should RECEIVE TRAFFIC

┌─────────────────────────────────────────────────┐
│ Readiness Check                                 │
├─────────────────────────────────────────────────┤
│ ✓ Application fully initialized                 │
│ ✓ Database connection healthy                   │
│ ✓ Cache connection healthy                      │
│ ✓ Required services reachable                   │
│ ✓ Warmup complete                               │
├─────────────────────────────────────────────────┤
│ Failure → STOP sending traffic (don't restart)  │
└─────────────────────────────────────────────────┘
```

**What to check:**
- All required dependencies
- Database connections
- Cache availability
- External service connectivity
- Warmup/initialization complete

```javascript
// GOOD: Comprehensive readiness check
app.get('/health/ready', async (req, res) => {
  const checks = await Promise.all([
    checkDatabase(),
    checkCache(),
    checkMessageQueue()
  ]);
  
  const allHealthy = checks.every(c => c.healthy);
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ready' : 'not_ready',
    checks
  });
});
```

### 3. Startup Probe

**Question:** "Has the application finished starting up?"

```
Purpose: Allow slow-starting applications time to initialize

┌─────────────────────────────────────────────────┐
│ Startup Check                                   │
├─────────────────────────────────────────────────┤
│ ✓ Application bootstrapped                      │
│ ✓ Initial data loaded                           │
│ ✓ Connections established                       │
│ ✓ Background jobs initialized                   │
├─────────────────────────────────────────────────┤
│ Success → Enable liveness/readiness probes      │
│ Failure (timeout) → RESTART                     │
└─────────────────────────────────────────────────┘
```

**Use when:**
- Application has long startup time
- Need to load large datasets on boot
- Complex initialization sequence

```javascript
let startupComplete = false;

// Called once initialization is done
async function onApplicationReady() {
  await loadReferenceData();
  await warmupCaches();
  await establishConnections();
  startupComplete = true;
}

app.get('/health/startup', (req, res) => {
  if (startupComplete) {
    res.status(200).json({ status: 'started' });
  } else {
    res.status(503).json({ status: 'starting' });
  }
});
```

---

## 🔄 Probe Comparison

| Aspect | Liveness | Readiness | Startup |
|--------|----------|-----------|---------|
| **Purpose** | Is it alive? | Can it serve? | Has it started? |
| **On Failure** | Restart | Stop traffic | Restart (after timeout) |
| **Check Dependencies** | ❌ No | ✅ Yes | ⚠️ Initial only |
| **Frequency** | Every 10-30s | Every 5-10s | During startup |
| **Typical Endpoint** | `/health/live` | `/health/ready` | `/health/startup` |

### Probe Flow in Kubernetes

```
Container Start
      │
      ▼
┌─────────────────┐
│  Startup Probe  │ ─────────────────────────────┐
│   (optional)    │                              │
└────────┬────────┘                              │
         │ Success                     Failure   │
         ▼                          (timeout)    │
┌─────────────────┐                              │
│ Liveness Probe  │◀────────────────────┐        │
└────────┬────────┘                     │        │
         │                              │        ▼
         │ Failure ─────────────────▶ RESTART ◀──┘
         │
         │ Success
         ▼
┌─────────────────┐
│ Readiness Probe │
└────────┬────────┘
         │
         │ Failure ──▶ Remove from Service (no traffic)
         │
         │ Success ──▶ Add to Service (receives traffic)
         ▼
    Running & Serving
```

---

## 🛠️ Implementation Examples

### Node.js/Express - Complete Health System

```javascript
const express = require('express');
const app = express();

// Health check state
const healthState = {
  isReady: false,
  startupComplete: false,
  dependencies: {
    database: { healthy: false, lastCheck: null },
    cache: { healthy: false, lastCheck: null },
    messageQueue: { healthy: false, lastCheck: null }
  }
};

// Dependency check functions
async function checkDatabase() {
  try {
    await db.query('SELECT 1');
    return { healthy: true, latency: '5ms' };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
}

async function checkCache() {
  try {
    await redis.ping();
    return { healthy: true };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
}

async function checkMessageQueue() {
  try {
    await rabbitmq.checkConnection();
    return { healthy: true };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
}

// Background health checker (updates state periodically)
async function updateHealthState() {
  const [db, cache, mq] = await Promise.allSettled([
    checkDatabase(),
    checkCache(),
    checkMessageQueue()
  ]);
  
  healthState.dependencies.database = {
    ...db.value || { healthy: false, error: db.reason },
    lastCheck: new Date().toISOString()
  };
  healthState.dependencies.cache = {
    ...cache.value || { healthy: false, error: cache.reason },
    lastCheck: new Date().toISOString()
  };
  healthState.dependencies.messageQueue = {
    ...mq.value || { healthy: false, error: mq.reason },
    lastCheck: new Date().toISOString()
  };
  
  // Ready if all critical dependencies are healthy
  healthState.isReady = 
    healthState.dependencies.database.healthy &&
    healthState.dependencies.cache.healthy;
}

// Start background health checking
setInterval(updateHealthState, 10000);  // Every 10 seconds

// ═══════════════════════════════════════════════════════════
// HEALTH ENDPOINTS
// ═══════════════════════════════════════════════════════════

// Liveness: Is the process alive?
app.get('/health/live', (req, res) => {
  // Simple check - if we can respond, we're alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

// Readiness: Can we handle traffic?
app.get('/health/ready', (req, res) => {
  if (!healthState.startupComplete) {
    return res.status(503).json({
      status: 'starting',
      message: 'Application still initializing'
    });
  }
  
  if (!healthState.isReady) {
    return res.status(503).json({
      status: 'not_ready',
      dependencies: healthState.dependencies
    });
  }
  
  res.status(200).json({
    status: 'ready',
    dependencies: healthState.dependencies
  });
});

// Startup: Has initialization completed?
app.get('/health/startup', (req, res) => {
  if (healthState.startupComplete) {
    res.status(200).json({ status: 'started' });
  } else {
    res.status(503).json({ status: 'starting' });
  }
});

// Detailed health (for monitoring dashboards)
app.get('/health', async (req, res) => {
  // Force fresh check for detailed endpoint
  await updateHealthState();
  
  const overallHealthy = healthState.startupComplete && healthState.isReady;
  
  res.status(overallHealthy ? 200 : 503).json({
    status: overallHealthy ? 'healthy' : 'unhealthy',
    version: process.env.APP_VERSION || '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    checks: {
      startup: healthState.startupComplete,
      ready: healthState.isReady,
      dependencies: healthState.dependencies
    }
  });
});

// Application startup
async function bootstrap() {
  console.log('Starting application...');
  
  // Initialize connections
  await db.connect();
  await redis.connect();
  await rabbitmq.connect();
  
  // Load initial data
  await loadConfiguration();
  await warmupCaches();
  
  // Initial health check
  await updateHealthState();
  
  // Mark startup complete
  healthState.startupComplete = true;
  console.log('Application ready!');
}

bootstrap();
```

### Python/FastAPI Implementation

```python
from fastapi import FastAPI, Response
from datetime import datetime
from typing import Dict, Any
import asyncio
import asyncpg
import aioredis

app = FastAPI()

class HealthChecker:
    def __init__(self):
        self.startup_complete = False
        self.dependencies: Dict[str, Dict[str, Any]] = {}
    
    async def check_database(self) -> Dict[str, Any]:
        try:
            conn = await asyncpg.connect(DATABASE_URL)
            await conn.execute('SELECT 1')
            await conn.close()
            return {"healthy": True, "latency_ms": 5}
        except Exception as e:
            return {"healthy": False, "error": str(e)}
    
    async def check_redis(self) -> Dict[str, Any]:
        try:
            redis = await aioredis.from_url(REDIS_URL)
            await redis.ping()
            await redis.close()
            return {"healthy": True}
        except Exception as e:
            return {"healthy": False, "error": str(e)}
    
    async def update_health(self):
        db_check, redis_check = await asyncio.gather(
            self.check_database(),
            self.check_redis(),
            return_exceptions=True
        )
        
        self.dependencies = {
            "database": db_check if isinstance(db_check, dict) else {"healthy": False, "error": str(db_check)},
            "redis": redis_check if isinstance(redis_check, dict) else {"healthy": False, "error": str(redis_check)},
        }
        
        for dep in self.dependencies.values():
            dep["last_check"] = datetime.utcnow().isoformat()
    
    @property
    def is_ready(self) -> bool:
        return (
            self.startup_complete and
            all(dep.get("healthy", False) for dep in self.dependencies.values())
        )

health_checker = HealthChecker()

# Background task to update health periodically
async def health_check_loop():
    while True:
        await health_checker.update_health()
        await asyncio.sleep(10)

@app.on_event("startup")
async def startup_event():
    # Initialize connections
    await initialize_database()
    await initialize_redis()
    
    # Run initial health check
    await health_checker.update_health()
    
    # Mark startup complete
    health_checker.startup_complete = True
    
    # Start background health checking
    asyncio.create_task(health_check_loop())

# ═══════════════════════════════════════════════════════════
# HEALTH ENDPOINTS
# ═══════════════════════════════════════════════════════════

@app.get("/health/live")
async def liveness():
    """Liveness probe - is the process alive?"""
    return {"status": "alive", "timestamp": datetime.utcnow().isoformat()}

@app.get("/health/ready")
async def readiness(response: Response):
    """Readiness probe - can we handle traffic?"""
    if not health_checker.startup_complete:
        response.status_code = 503
        return {"status": "starting", "message": "Application initializing"}
    
    if not health_checker.is_ready:
        response.status_code = 503
        return {
            "status": "not_ready",
            "dependencies": health_checker.dependencies
        }
    
    return {
        "status": "ready",
        "dependencies": health_checker.dependencies
    }

@app.get("/health/startup")
async def startup(response: Response):
    """Startup probe - has initialization completed?"""
    if health_checker.startup_complete:
        return {"status": "started"}
    
    response.status_code = 503
    return {"status": "starting"}

@app.get("/health")
async def detailed_health(response: Response):
    """Detailed health check for monitoring"""
    await health_checker.update_health()
    
    overall_healthy = health_checker.is_ready
    
    if not overall_healthy:
        response.status_code = 503
    
    return {
        "status": "healthy" if overall_healthy else "unhealthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {
            "startup": health_checker.startup_complete,
            "ready": health_checker.is_ready,
            "dependencies": health_checker.dependencies
        }
    }
```

### C#/.NET Implementation

```csharp
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Register health checks
builder.Services.AddHealthChecks()
    // Database check
    .AddSqlServer(
        connectionString: builder.Configuration.GetConnectionString("Default"),
        name: "database",
        tags: new[] { "ready" })
    
    // Redis check
    .AddRedis(
        redisConnectionString: builder.Configuration["Redis:Connection"],
        name: "redis",
        tags: new[] { "ready" })
    
    // Custom check
    .AddCheck<StartupHealthCheck>("startup", tags: new[] { "startup" })
    
    // External API check
    .AddUrlGroup(
        uri: new Uri("https://api.external.com/health"),
        name: "external-api",
        tags: new[] { "ready" });

var app = builder.Build();

// ═══════════════════════════════════════════════════════════
// HEALTH ENDPOINTS
// ═══════════════════════════════════════════════════════════

// Liveness - simple ping
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false,  // Don't run any checks
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(
            JsonSerializer.Serialize(new { status = "alive" }));
    }
});

// Readiness - check dependencies
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = WriteHealthResponse
});

// Startup - check initialization
app.MapHealthChecks("/health/startup", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("startup"),
    ResponseWriter = WriteHealthResponse
});

// Detailed health
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = WriteHealthResponse
});

app.Run();

// Custom response writer
static async Task WriteHealthResponse(HttpContext context, HealthReport report)
{
    context.Response.ContentType = "application/json";
    
    var result = new
    {
        status = report.Status.ToString(),
        timestamp = DateTime.UtcNow,
        duration = report.TotalDuration,
        checks = report.Entries.Select(e => new
        {
            name = e.Key,
            status = e.Value.Status.ToString(),
            description = e.Value.Description,
            duration = e.Value.Duration,
            data = e.Value.Data,
            exception = e.Value.Exception?.Message
        })
    };
    
    var statusCode = report.Status == HealthStatus.Healthy ? 200 : 503;
    context.Response.StatusCode = statusCode;
    
    await context.Response.WriteAsync(
        JsonSerializer.Serialize(result, new JsonSerializerOptions 
        { 
            WriteIndented = true 
        }));
}

// Custom startup health check
public class StartupHealthCheck : IHealthCheck
{
    private static bool _isStarted = false;
    
    public static void MarkStarted() => _isStarted = true;
    
    public Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        if (_isStarted)
        {
            return Task.FromResult(HealthCheckResult.Healthy("Application started"));
        }
        
        return Task.FromResult(HealthCheckResult.Unhealthy("Application starting"));
    }
}
```

### Go Implementation

```go
package main

import (
    "encoding/json"
    "net/http"
    "sync"
    "time"
)

type HealthStatus struct {
    Status       string                 `json:"status"`
    Timestamp    time.Time              `json:"timestamp"`
    Dependencies map[string]DepHealth   `json:"dependencies,omitempty"`
}

type DepHealth struct {
    Healthy   bool      `json:"healthy"`
    LastCheck time.Time `json:"last_check"`
    Error     string    `json:"error,omitempty"`
    Latency   string    `json:"latency,omitempty"`
}

type HealthChecker struct {
    mu              sync.RWMutex
    startupComplete bool
    dependencies    map[string]DepHealth
}

var healthChecker = &HealthChecker{
    dependencies: make(map[string]DepHealth),
}

func (h *HealthChecker) CheckDatabase() DepHealth {
    start := time.Now()
    err := db.Ping()
    latency := time.Since(start)
    
    if err != nil {
        return DepHealth{Healthy: false, Error: err.Error(), LastCheck: time.Now()}
    }
    return DepHealth{Healthy: true, Latency: latency.String(), LastCheck: time.Now()}
}

func (h *HealthChecker) CheckRedis() DepHealth {
    err := redisClient.Ping(ctx).Err()
    if err != nil {
        return DepHealth{Healthy: false, Error: err.Error(), LastCheck: time.Now()}
    }
    return DepHealth{Healthy: true, LastCheck: time.Now()}
}

func (h *HealthChecker) UpdateHealth() {
    h.mu.Lock()
    defer h.mu.Unlock()
    
    h.dependencies["database"] = h.CheckDatabase()
    h.dependencies["redis"] = h.CheckRedis()
}

func (h *HealthChecker) IsReady() bool {
    h.mu.RLock()
    defer h.mu.RUnlock()
    
    if !h.startupComplete {
        return false
    }
    
    for _, dep := range h.dependencies {
        if !dep.Healthy {
            return false
        }
    }
    return true
}

// ═══════════════════════════════════════════════════════════
// HEALTH HANDLERS
// ═══════════════════════════════════════════════════════════

func livenessHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(HealthStatus{
        Status:    "alive",
        Timestamp: time.Now(),
    })
}

func readinessHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    healthChecker.mu.RLock()
    deps := healthChecker.dependencies
    startupComplete := healthChecker.startupComplete
    healthChecker.mu.RUnlock()
    
    if !startupComplete {
        w.WriteHeader(http.StatusServiceUnavailable)
        json.NewEncoder(w).Encode(HealthStatus{
            Status:    "starting",
            Timestamp: time.Now(),
        })
        return
    }
    
    if !healthChecker.IsReady() {
        w.WriteHeader(http.StatusServiceUnavailable)
        json.NewEncoder(w).Encode(HealthStatus{
            Status:       "not_ready",
            Timestamp:    time.Now(),
            Dependencies: deps,
        })
        return
    }
    
    json.NewEncoder(w).Encode(HealthStatus{
        Status:       "ready",
        Timestamp:    time.Now(),
        Dependencies: deps,
    })
}

func startupHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    
    healthChecker.mu.RLock()
    started := healthChecker.startupComplete
    healthChecker.mu.RUnlock()
    
    if started {
        json.NewEncoder(w).Encode(map[string]string{"status": "started"})
    } else {
        w.WriteHeader(http.StatusServiceUnavailable)
        json.NewEncoder(w).Encode(map[string]string{"status": "starting"})
    }
}

func main() {
    // Background health checker
    go func() {
        ticker := time.NewTicker(10 * time.Second)
        for range ticker.C {
            healthChecker.UpdateHealth()
        }
    }()
    
    // Routes
    http.HandleFunc("/health/live", livenessHandler)
    http.HandleFunc("/health/ready", readinessHandler)
    http.HandleFunc("/health/startup", startupHandler)
    
    // Initialize and mark startup complete
    go func() {
        initializeApp()
        healthChecker.mu.Lock()
        healthChecker.startupComplete = true
        healthChecker.mu.Unlock()
    }()
    
    http.ListenAndServe(":8080", nil)
}
```

---

## ☸️ Kubernetes Configuration

### Basic Health Probes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: my-app
        image: my-app:1.0.0
        ports:
        - containerPort: 8080
        
        # Liveness Probe
        livenessProbe:
          httpGet:
            path: /health/live
            port: 8080
          initialDelaySeconds: 15    # Wait before first check
          periodSeconds: 20          # Check every 20s
          timeoutSeconds: 5          # Timeout for each check
          failureThreshold: 3        # Restart after 3 failures
        
        # Readiness Probe
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 8080
          initialDelaySeconds: 5     # Start checking sooner
          periodSeconds: 10          # Check more frequently
          timeoutSeconds: 3
          failureThreshold: 3        # Remove from service after 3 failures
          successThreshold: 1        # Back to ready after 1 success
        
        # Startup Probe (K8s 1.16+)
        startupProbe:
          httpGet:
            path: /health/startup
            port: 8080
          initialDelaySeconds: 0
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 30       # 30 × 10s = 5 min max startup time
```

### Advanced Configuration

```yaml
# For slow-starting applications
startupProbe:
  httpGet:
    path: /health/startup
    port: 8080
  failureThreshold: 30      # Number of attempts
  periodSeconds: 10         # 30 × 10s = 5 minutes max startup

# For applications with connection pools
readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
    httpHeaders:            # Custom headers if needed
    - name: X-Health-Check
      value: "true"
  initialDelaySeconds: 10
  periodSeconds: 5
  successThreshold: 2       # Need 2 successes to be ready

# TCP probe (when HTTP not available)
livenessProbe:
  tcpSocket:
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 20

# Exec probe (run command in container)
livenessProbe:
  exec:
    command:
    - /bin/sh
    - -c
    - pg_isready -U postgres
  initialDelaySeconds: 30
  periodSeconds: 10

# gRPC probe (K8s 1.24+)
livenessProbe:
  grpc:
    port: 50051
    service: "my.service.Health"  # Optional
  initialDelaySeconds: 10
  periodSeconds: 20
```

### Probe Timing Guidelines

```
┌─────────────────────────────────────────────────────────────────┐
│                    TIMING RECOMMENDATIONS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Startup Probe:                                                  │
│  ├─ initialDelaySeconds: 0-5s                                   │
│  ├─ periodSeconds: 5-10s                                        │
│  ├─ failureThreshold: (max_startup_time / periodSeconds)        │
│  └─ Example: 5 min startup → 30 failures × 10s period           │
│                                                                  │
│  Liveness Probe:                                                 │
│  ├─ initialDelaySeconds: 10-30s (after startup)                 │
│  ├─ periodSeconds: 10-30s (not too aggressive)                  │
│  ├─ failureThreshold: 3 (avoid flapping)                        │
│  └─ timeoutSeconds: 1-5s (should be quick)                      │
│                                                                  │
│  Readiness Probe:                                                │
│  ├─ initialDelaySeconds: 5-10s                                  │
│  ├─ periodSeconds: 5-15s (depends on traffic needs)             │
│  ├─ failureThreshold: 2-3                                       │
│  └─ successThreshold: 1-2                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Health Aggregation Pattern

### Aggregating Dependency Health

```javascript
class HealthAggregator {
  constructor() {
    this.checks = new Map();
  }
  
  registerCheck(name, checkFn, options = {}) {
    this.checks.set(name, {
      name,
      checkFn,
      critical: options.critical ?? true,   // Is this required for readiness?
      timeout: options.timeout ?? 5000,
      lastResult: null
    });
  }
  
  async runChecks() {
    const results = {};
    
    const checkPromises = Array.from(this.checks.entries()).map(
      async ([name, check]) => {
        const start = Date.now();
        
        try {
          const result = await Promise.race([
            check.checkFn(),
            this.timeout(check.timeout)
          ]);
          
          results[name] = {
            healthy: true,
            critical: check.critical,
            latency: Date.now() - start,
            ...result
          };
        } catch (error) {
          results[name] = {
            healthy: false,
            critical: check.critical,
            error: error.message,
            latency: Date.now() - start
          };
        }
        
        check.lastResult = results[name];
      }
    );
    
    await Promise.all(checkPromises);
    return results;
  }
  
  async getOverallHealth() {
    const checks = await this.runChecks();
    
    // Critical checks must all pass for overall health
    const criticalHealthy = Object.values(checks)
      .filter(c => c.critical)
      .every(c => c.healthy);
    
    // Non-critical checks are informational
    const allHealthy = Object.values(checks).every(c => c.healthy);
    
    return {
      status: criticalHealthy ? 'healthy' : 'unhealthy',
      degraded: criticalHealthy && !allHealthy,
      checks
    };
  }
  
  timeout(ms) {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Health check timeout')), ms)
    );
  }
}

// Usage
const healthAggregator = new HealthAggregator();

healthAggregator.registerCheck('database', async () => {
  await db.query('SELECT 1');
  return { connections: db.pool.size };
}, { critical: true, timeout: 3000 });

healthAggregator.registerCheck('cache', async () => {
  await redis.ping();
  return { };
}, { critical: true, timeout: 2000 });

healthAggregator.registerCheck('external-api', async () => {
  const response = await fetch('https://api.external.com/health');
  return { status: response.status };
}, { critical: false, timeout: 5000 });  // Non-critical

healthAggregator.registerCheck('message-queue', async () => {
  await rabbitmq.checkConnection();
  return { queued: await rabbitmq.getQueueLength() };
}, { critical: true, timeout: 3000 });

// Endpoint
app.get('/health', async (req, res) => {
  const health = await healthAggregator.getOverallHealth();
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});
```

### Response Format (Industry Standard)

```json
{
  "status": "healthy",
  "version": "2.1.0",
  "uptime": 86400,
  "timestamp": "2026-02-20T10:30:00Z",
  "checks": {
    "database": {
      "healthy": true,
      "critical": true,
      "latency": 5,
      "connections": 10
    },
    "cache": {
      "healthy": true,
      "critical": true,
      "latency": 2
    },
    "external-api": {
      "healthy": false,
      "critical": false,
      "latency": 5000,
      "error": "Timeout"
    },
    "message-queue": {
      "healthy": true,
      "critical": true,
      "latency": 8,
      "queued": 42
    }
  }
}
```

---

## ⚠️ Common Pitfalls

### 1. Checking Database in Liveness

```javascript
// ❌ BAD: DB issues cause container restarts
app.get('/health/live', async (req, res) => {
  const dbOk = await db.ping();
  if (!dbOk) {
    return res.status(503).json({ status: 'unhealthy' });
  }
  res.json({ status: 'healthy' });
});
// If DB is down, all pods restart → makes things worse!

// ✅ GOOD: Liveness only checks process health
app.get('/health/live', (req, res) => {
  res.json({ status: 'alive' });
});

// Readiness checks dependencies
app.get('/health/ready', async (req, res) => {
  const dbOk = await db.ping();
  if (!dbOk) {
    return res.status(503).json({ status: 'not_ready' });
  }
  res.json({ status: 'ready' });
});
```

### 2. Expensive Health Checks

```javascript
// ❌ BAD: Heavy operation in health check
app.get('/health/ready', async (req, res) => {
  const count = await db.query('SELECT COUNT(*) FROM large_table');
  // This runs every 10 seconds and can slow down the DB!
});

// ✅ GOOD: Lightweight checks
app.get('/health/ready', async (req, res) => {
  await db.query('SELECT 1');  // Simple ping
  res.json({ status: 'ready' });
});
```

### 3. Not Handling Timeouts

```javascript
// ❌ BAD: Health check hangs forever
app.get('/health/ready', async (req, res) => {
  await db.query('SELECT 1');  // Could hang if DB is slow
  res.json({ status: 'ready' });
});

// ✅ GOOD: Timeout on health checks
app.get('/health/ready', async (req, res) => {
  try {
    await Promise.race([
      db.query('SELECT 1'),
      timeout(3000)
    ]);
    res.json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not_ready', error: error.message });
  }
});
```

### 4. All-or-Nothing Readiness

```javascript
// ❌ BAD: Optional service failure prevents all traffic
app.get('/health/ready', async (req, res) => {
  const dbOk = await checkDb();
  const cacheOk = await checkCache();
  const analyticsOk = await checkAnalytics();  // Non-critical!
  
  if (!dbOk || !cacheOk || !analyticsOk) {
    return res.status(503).json({ status: 'not_ready' });
  }
});

// ✅ GOOD: Distinguish critical vs non-critical
app.get('/health/ready', async (req, res) => {
  const dbOk = await checkDb();        // Critical
  const cacheOk = await checkCache();  // Critical
  const analyticsOk = await checkAnalytics();  // Non-critical
  
  const ready = dbOk && cacheOk;  // Only critical dependencies
  
  res.status(ready ? 200 : 503).json({
    status: ready ? 'ready' : 'not_ready',
    degraded: ready && !analyticsOk,
    checks: { database: dbOk, cache: cacheOk, analytics: analyticsOk }
  });
});
```

---

## 📊 Health Check Decision Matrix

| Check Type | What to Check | Failure Action |
|------------|---------------|----------------|
| **Liveness** | Process alive, no deadlock | Restart container |
| **Readiness** | DB, cache, critical deps | Remove from load balancer |
| **Startup** | Initialization complete | Wait (then restart if timeout) |
| **Deep Health** | All deps + metrics | Alerting, debugging |

---

## 🎯 Best Practices

### 1. Separate Endpoints

```
/health/live     → For liveness probe (simple)
/health/ready    → For readiness probe (checks deps)
/health/startup  → For startup probe (checks init)
/health          → For monitoring (detailed)
```

### 2. Response Time Requirements

```
Liveness:  < 100ms (must be instant)
Readiness: < 1-2s (can check deps)
Detailed:  < 5s (can do more)
```

### 3. Monitor Health Check Failures

```javascript
// Track health check metrics
app.get('/health/ready', async (req, res) => {
  const start = Date.now();
  const result = await runHealthChecks();
  
  // Emit metrics
  metrics.histogram('health_check_duration', Date.now() - start);
  metrics.gauge('health_check_status', result.healthy ? 1 : 0);
  
  if (!result.healthy) {
    metrics.increment('health_check_failures', { 
      reason: result.failedCheck 
    });
  }
  
  res.status(result.healthy ? 200 : 503).json(result);
});
```

### 4. Graceful Shutdown

```javascript
let isShuttingDown = false;

process.on('SIGTERM', () => {
  isShuttingDown = true;
  
  // Give time for load balancer to notice
  setTimeout(() => {
    server.close(() => process.exit(0));
  }, 10000);
});

app.get('/health/ready', (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({ 
      status: 'shutting_down',
      message: 'Service is terminating'
    });
  }
  // ... normal checks
});
```

---

## 🔗 Related Patterns

| Pattern | Relationship |
|---------|--------------|
| **Circuit Breaker** | Uses health status to open/close |
| **Load Balancer** | Routes based on health |
| **Service Discovery** | Registers healthy instances |
| **Retry** | May skip unhealthy instances |
| **Bulkhead** | Health per partition |

---

## 📝 Key Takeaways

1. **Separate liveness from readiness** - Different purposes, different checks
2. **Keep liveness simple** - Don't check external dependencies
3. **Readiness gates traffic** - Check all critical dependencies
4. **Use startup probes for slow apps** - Prevents premature restarts
5. **Distinguish critical vs non-critical** - Partial availability beats none
6. **Add timeouts** - Health checks must not hang
7. **Monitor health check failures** - They indicate real problems

---

## 🎯 Summary

The **Health Check Pattern** enables:

- ✅ Automatic traffic routing away from unhealthy instances
- ✅ Container orchestration (restart unhealthy pods)
- ✅ Graceful degradation during partial outages
- ✅ Self-healing systems via liveness probes
- ✅ Zero-downtime deployments via readiness probes

**Health Check Formula:**
```
Liveness  → Is it alive?      → Restart if not
Readiness → Can it serve?     → Remove from LB if not
Startup   → Is it ready yet?  → Wait, then restart
```

---

**Date Created:** 2026-02-20  
**Pattern Type:** Resilience / Observability  
**Difficulty:** Intermediate  
**Related Patterns:** Circuit Breaker, Load Balancing, Service Discovery

