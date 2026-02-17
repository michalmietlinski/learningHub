# Bulkhead Pattern

## 📋 Learning Objectives

- [ ] Understand the bulkhead pattern and its origins
- [ ] Learn different bulkhead isolation strategies
- [ ] Master thread pool and semaphore bulkheads
- [ ] Understand when and how to partition resources
- [ ] Implement bulkhead pattern in different scenarios
- [ ] Combine bulkhead with other resilience patterns

---

## 🎯 Definition

The **Bulkhead Pattern** isolates elements of an application into pools so that if one fails, the others will continue to function. It prevents a failure in one part of the system from cascading and taking down the entire application.

**Named after:** Ship bulkheads - watertight compartments that prevent the entire ship from sinking if one section is breached.

**Key Principle:**
> "Isolate failures" - A problem in one area shouldn't bring down the whole system.

---

## 🚢 The Ship Analogy

```
Ship WITHOUT Bulkheads:
┌─────────────────────────────────────┐
│              🚢 SHIP                │
│  💧💧💧💧💧💧💧💧💧💧💧💧💧💧💧💧  │  ← Water floods entire ship
│  💧💧💧💧💧💧💧💧💧💧💧💧💧💧💧💧  │
└─────────────────────────────────────┘
                 ⬇️ SINKS!

Ship WITH Bulkheads:
┌─────────┬─────────┬─────────┬───────┐
│ 💧💧💧  │         │         │       │
│ 💧💧💧  │  SAFE   │  SAFE   │ SAFE  │  ← Water contained to one section
│ 💧💧💧  │         │         │       │
└─────────┴─────────┴─────────┴───────┘
                 ✅ STAYS AFLOAT!
```

---

## 🏗️ Core Concepts

### Without Bulkhead (Shared Resources)

```
┌─────────────────────────────────────────────────┐
│                  Application                     │
│                                                  │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│   │Service A│  │Service B│  │Service C│        │
│   └────┬────┘  └────┬────┘  └────┬────┘        │
│        │            │            │              │
│        └────────────┼────────────┘              │
│                     ▼                           │
│         ┌─────────────────────┐                │
│         │   Shared Thread     │                │
│         │   Pool (100)        │  ← All services│
│         │   [▓▓▓▓▓▓▓▓▓▓]     │     share pool │
│         └─────────────────────┘                │
└─────────────────────────────────────────────────┘

Problem: Service A is slow → exhausts all threads → B and C fail too!
```

### With Bulkhead (Isolated Resources)

```
┌─────────────────────────────────────────────────┐
│                  Application                     │
│                                                  │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│   │Service A│  │Service B│  │Service C│        │
│   └────┬────┘  └────┬────┘  └────┬────┘        │
│        │            │            │              │
│        ▼            ▼            ▼              │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│   │Pool A   │  │Pool B   │  │Pool C   │        │
│   │(30)     │  │(40)     │  │(30)     │        │
│   │[▓▓▓▓▓▓] │  │[▓▓░░░░] │  │[▓░░░░░] │        │
│   └─────────┘  └─────────┘  └─────────┘        │
└─────────────────────────────────────────────────┘

Benefit: Service A exhausts its pool → B and C continue working!
```

---

## 📊 Bulkhead Types

### 1. Thread Pool Bulkhead

Each service gets its own dedicated thread pool.

```javascript
// Thread Pool Bulkhead implementation
class ThreadPoolBulkhead {
  constructor(name, options = {}) {
    this.name = name;
    this.maxConcurrent = options.maxConcurrent || 10;
    this.queueSize = options.queueSize || 100;
    this.activeCount = 0;
    this.queue = [];
  }
  
  async execute(fn) {
    // Check if we can execute immediately
    if (this.activeCount < this.maxConcurrent) {
      return this.runTask(fn);
    }
    
    // Check if queue has space
    if (this.queue.length >= this.queueSize) {
      throw new BulkheadFullError(
        `Bulkhead '${this.name}' is full: ${this.activeCount} active, ${this.queue.length} queued`
      );
    }
    
    // Add to queue and wait
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
    });
  }
  
  async runTask(fn) {
    this.activeCount++;
    
    try {
      return await fn();
    } finally {
      this.activeCount--;
      this.processQueue();
    }
  }
  
  processQueue() {
    if (this.queue.length > 0 && this.activeCount < this.maxConcurrent) {
      const { fn, resolve, reject } = this.queue.shift();
      this.runTask(fn).then(resolve).catch(reject);
    }
  }
  
  getMetrics() {
    return {
      name: this.name,
      activeCount: this.activeCount,
      queueSize: this.queue.length,
      availableSlots: this.maxConcurrent - this.activeCount
    };
  }
}

class BulkheadFullError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BulkheadFullError';
  }
}

// Usage
const orderServiceBulkhead = new ThreadPoolBulkhead('order-service', {
  maxConcurrent: 20,
  queueSize: 50
});

const paymentServiceBulkhead = new ThreadPoolBulkhead('payment-service', {
  maxConcurrent: 10,
  queueSize: 20
});

async function processOrder(orderId) {
  return orderServiceBulkhead.execute(async () => {
    return await orderService.process(orderId);
  });
}

async function processPayment(paymentId) {
  return paymentServiceBulkhead.execute(async () => {
    return await paymentService.charge(paymentId);
  });
}
```

**Pros:**
- ✅ True isolation - each service has dedicated resources
- ✅ Can limit queue size
- ✅ Better for CPU-bound operations

**Cons:**
- ❌ Resource overhead (threads are expensive)
- ❌ More complex to configure
- ❌ Fixed thread count may not adapt to load

### 2. Semaphore Bulkhead

Limits concurrent access using semaphores (counters).

```javascript
// Semaphore Bulkhead implementation
class SemaphoreBulkhead {
  constructor(name, maxConcurrent = 10) {
    this.name = name;
    this.maxConcurrent = maxConcurrent;
    this.currentCount = 0;
    this.waitingQueue = [];
  }
  
  async acquire() {
    if (this.currentCount < this.maxConcurrent) {
      this.currentCount++;
      return true;
    }
    
    // Wait for a slot to become available
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.waitingQueue.indexOf(waiter);
        if (index > -1) {
          this.waitingQueue.splice(index, 1);
        }
        reject(new BulkheadFullError(`Timeout waiting for bulkhead '${this.name}'`));
      }, 5000); // 5 second timeout
      
      const waiter = { resolve, reject, timeout };
      this.waitingQueue.push(waiter);
    });
  }
  
  release() {
    this.currentCount--;
    
    if (this.waitingQueue.length > 0) {
      const waiter = this.waitingQueue.shift();
      clearTimeout(waiter.timeout);
      this.currentCount++;
      waiter.resolve(true);
    }
  }
  
  async execute(fn) {
    await this.acquire();
    
    try {
      return await fn();
    } finally {
      this.release();
    }
  }
  
  getMetrics() {
    return {
      name: this.name,
      current: this.currentCount,
      max: this.maxConcurrent,
      waiting: this.waitingQueue.length,
      available: this.maxConcurrent - this.currentCount
    };
  }
}

// Usage
const apiCallBulkhead = new SemaphoreBulkhead('external-api', 5);

async function callExternalAPI(data) {
  return apiCallBulkhead.execute(async () => {
    return await fetch('https://api.external.com/data', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  });
}
```

**Pros:**
- ✅ Lightweight (no thread overhead)
- ✅ Good for I/O-bound operations
- ✅ Simple to implement

**Cons:**
- ❌ No queue management built-in
- ❌ Shared thread pool still exists
- ❌ Less isolation than thread pool

### 3. Connection Pool Bulkhead

Separate connection pools for different services/databases.

```javascript
// Database connection pool bulkhead
const { Pool } = require('pg');

// Separate pools for different workloads
const transactionalPool = new Pool({
  host: 'db.example.com',
  database: 'myapp',
  max: 20,                    // Max connections
  min: 5,                     // Min connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

const analyticsPool = new Pool({
  host: 'db.example.com',
  database: 'myapp',
  max: 5,                     // Fewer connections for heavy queries
  min: 1,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 5000
});

const reportsPool = new Pool({
  host: 'db-replica.example.com',  // Read replica
  database: 'myapp',
  max: 10,
  min: 2
});

// Service functions use appropriate pool
async function createOrder(orderData) {
  const client = await transactionalPool.connect();
  try {
    await client.query('BEGIN');
    // ... transactional operations
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function runAnalyticsQuery(query) {
  // Uses separate pool - won't affect transactional operations
  return analyticsPool.query(query);
}

async function generateReport(reportId) {
  // Uses read replica - won't affect main database
  return reportsPool.query('SELECT * FROM reports WHERE id = $1', [reportId]);
}
```

### 4. Process Bulkhead

Isolate workloads into separate processes or containers.

```yaml
# Docker Compose - Process-level bulkhead
version: '3.8'

services:
  # Web API - handles user requests
  web-api:
    image: myapp:latest
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
    environment:
      - SERVICE_TYPE=api

  # Background worker - handles async jobs
  worker:
    image: myapp:latest
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
    environment:
      - SERVICE_TYPE=worker

  # Report generator - heavy computations
  report-service:
    image: myapp:latest
    deploy:
      replicas: 1
      resources:
        limits:
          cpus: '4.0'
          memory: 4G
    environment:
      - SERVICE_TYPE=reports
```

```javascript
// Kubernetes - Pod-level bulkhead with resource limits
const podSpec = {
  apiVersion: 'v1',
  kind: 'Pod',
  metadata: { name: 'api-pod' },
  spec: {
    containers: [{
      name: 'api',
      image: 'myapp:latest',
      resources: {
        requests: {
          memory: '256Mi',
          cpu: '250m'
        },
        limits: {
          memory: '512Mi',
          cpu: '500m'
        }
      }
    }]
  }
};
```

---

## 🛠️ Implementation Examples

### TypeScript - Complete Bulkhead Manager

```typescript
interface BulkheadConfig {
  maxConcurrent: number;
  maxQueue: number;
  timeout: number;
  name: string;
}

interface BulkheadMetrics {
  name: string;
  active: number;
  queued: number;
  rejected: number;
  completed: number;
  failed: number;
}

class Bulkhead {
  private config: BulkheadConfig;
  private activeCount = 0;
  private queue: Array<{
    fn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    timer: NodeJS.Timeout;
  }> = [];
  private metrics = {
    rejected: 0,
    completed: 0,
    failed: 0
  };

  constructor(config: Partial<BulkheadConfig>) {
    this.config = {
      maxConcurrent: config.maxConcurrent || 10,
      maxQueue: config.maxQueue || 100,
      timeout: config.timeout || 30000,
      name: config.name || 'default'
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Can execute immediately?
    if (this.activeCount < this.config.maxConcurrent) {
      return this.run(fn);
    }

    // Queue full?
    if (this.queue.length >= this.config.maxQueue) {
      this.metrics.rejected++;
      throw new Error(
        `Bulkhead '${this.config.name}' rejected: queue full ` +
        `(${this.activeCount} active, ${this.queue.length} queued)`
      );
    }

    // Add to queue with timeout
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.removeFromQueue(entry);
        this.metrics.rejected++;
        reject(new Error(
          `Bulkhead '${this.config.name}' timeout after ${this.config.timeout}ms`
        ));
      }, this.config.timeout);

      const entry = { fn, resolve, reject, timer };
      this.queue.push(entry);
    });
  }

  private async run<T>(fn: () => Promise<T>): Promise<T> {
    this.activeCount++;

    try {
      const result = await fn();
      this.metrics.completed++;
      return result;
    } catch (error) {
      this.metrics.failed++;
      throw error;
    } finally {
      this.activeCount--;
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.queue.length > 0 && this.activeCount < this.config.maxConcurrent) {
      const entry = this.queue.shift()!;
      clearTimeout(entry.timer);
      this.run(entry.fn).then(entry.resolve).catch(entry.reject);
    }
  }

  private removeFromQueue(entry: any): void {
    const index = this.queue.indexOf(entry);
    if (index > -1) {
      this.queue.splice(index, 1);
    }
  }

  getMetrics(): BulkheadMetrics {
    return {
      name: this.config.name,
      active: this.activeCount,
      queued: this.queue.length,
      ...this.metrics
    };
  }
}

// Bulkhead Registry for managing multiple bulkheads
class BulkheadRegistry {
  private bulkheads = new Map<string, Bulkhead>();

  register(name: string, config: Partial<BulkheadConfig>): Bulkhead {
    const bulkhead = new Bulkhead({ ...config, name });
    this.bulkheads.set(name, bulkhead);
    return bulkhead;
  }

  get(name: string): Bulkhead {
    const bulkhead = this.bulkheads.get(name);
    if (!bulkhead) {
      throw new Error(`Bulkhead '${name}' not found`);
    }
    return bulkhead;
  }

  getAllMetrics(): BulkheadMetrics[] {
    return Array.from(this.bulkheads.values()).map(b => b.getMetrics());
  }
}

// Usage
const registry = new BulkheadRegistry();

// Configure bulkheads for different services
const orderBulkhead = registry.register('orders', {
  maxConcurrent: 20,
  maxQueue: 100,
  timeout: 10000
});

const paymentBulkhead = registry.register('payments', {
  maxConcurrent: 10,
  maxQueue: 50,
  timeout: 30000
});

const inventoryBulkhead = registry.register('inventory', {
  maxConcurrent: 30,
  maxQueue: 200,
  timeout: 5000
});

// Service calls use bulkheads
async function createOrder(orderData: any) {
  return orderBulkhead.execute(async () => {
    // Order creation logic
    const order = await orderService.create(orderData);
    
    // Payment uses its own bulkhead
    await paymentBulkhead.execute(async () => {
      await paymentService.charge(order.id, order.total);
    });
    
    // Inventory uses its own bulkhead
    await inventoryBulkhead.execute(async () => {
      await inventoryService.reserve(order.items);
    });
    
    return order;
  });
}

// Monitor all bulkheads
setInterval(() => {
  const metrics = registry.getAllMetrics();
  console.log('Bulkhead Metrics:', metrics);
}, 5000);
```

### Python Implementation

```python
import asyncio
from dataclasses import dataclass
from typing import Callable, TypeVar, Generic
from contextlib import asynccontextmanager

T = TypeVar('T')

@dataclass
class BulkheadConfig:
    name: str
    max_concurrent: int = 10
    max_queue: int = 100
    timeout: float = 30.0

class BulkheadFullError(Exception):
    pass

class Bulkhead:
    def __init__(self, config: BulkheadConfig):
        self.config = config
        self._semaphore = asyncio.Semaphore(config.max_concurrent)
        self._queue_semaphore = asyncio.Semaphore(config.max_queue)
        self._metrics = {
            'completed': 0,
            'failed': 0,
            'rejected': 0
        }
    
    async def execute(self, fn: Callable[[], T]) -> T:
        # Try to acquire queue slot
        if not self._queue_semaphore.locked() or self._queue_semaphore._value > 0:
            pass
        else:
            self._metrics['rejected'] += 1
            raise BulkheadFullError(
                f"Bulkhead '{self.config.name}' queue is full"
            )
        
        try:
            async with asyncio.timeout(self.config.timeout):
                async with self._semaphore:
                    try:
                        result = await fn()
                        self._metrics['completed'] += 1
                        return result
                    except Exception as e:
                        self._metrics['failed'] += 1
                        raise
        except asyncio.TimeoutError:
            self._metrics['rejected'] += 1
            raise BulkheadFullError(
                f"Bulkhead '{self.config.name}' timeout"
            )
    
    @asynccontextmanager
    async def acquire(self):
        """Context manager for manual bulkhead control"""
        async with self._semaphore:
            yield
    
    def get_metrics(self) -> dict:
        return {
            'name': self.config.name,
            'max_concurrent': self.config.max_concurrent,
            **self._metrics
        }

# Usage
order_bulkhead = Bulkhead(BulkheadConfig(
    name='orders',
    max_concurrent=20,
    max_queue=100
))

payment_bulkhead = Bulkhead(BulkheadConfig(
    name='payments',
    max_concurrent=10,
    max_queue=50
))

async def process_order(order_id: str):
    async def _process():
        # Simulate order processing
        await asyncio.sleep(0.1)
        return {'order_id': order_id, 'status': 'processed'}
    
    return await order_bulkhead.execute(_process)

async def charge_payment(payment_id: str, amount: float):
    async def _charge():
        # Simulate payment
        await asyncio.sleep(0.5)
        return {'payment_id': payment_id, 'charged': amount}
    
    return await payment_bulkhead.execute(_charge)

# Run multiple concurrent requests
async def main():
    tasks = [
        process_order(f'order-{i}')
        for i in range(50)
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Check metrics
    print(order_bulkhead.get_metrics())

asyncio.run(main())
```

### Java with Resilience4j

```java
import io.github.resilience4j.bulkhead.Bulkhead;
import io.github.resilience4j.bulkhead.BulkheadConfig;
import io.github.resilience4j.bulkhead.BulkheadRegistry;
import io.github.resilience4j.bulkhead.ThreadPoolBulkhead;
import io.github.resilience4j.bulkhead.ThreadPoolBulkheadConfig;

import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.function.Supplier;

public class BulkheadExample {
    
    // Semaphore-based bulkhead
    public static Bulkhead createSemaphoreBulkhead(String name) {
        BulkheadConfig config = BulkheadConfig.custom()
            .maxConcurrentCalls(10)
            .maxWaitDuration(Duration.ofMillis(500))
            .build();
        
        BulkheadRegistry registry = BulkheadRegistry.of(config);
        return registry.bulkhead(name);
    }
    
    // Thread pool bulkhead
    public static ThreadPoolBulkhead createThreadPoolBulkhead(String name) {
        ThreadPoolBulkheadConfig config = ThreadPoolBulkheadConfig.custom()
            .maxThreadPoolSize(10)
            .coreThreadPoolSize(5)
            .queueCapacity(100)
            .keepAliveDuration(Duration.ofMillis(100))
            .build();
        
        return ThreadPoolBulkhead.of(name, config);
    }
    
    public static void main(String[] args) {
        // Create bulkheads
        Bulkhead orderBulkhead = createSemaphoreBulkhead("orders");
        ThreadPoolBulkhead paymentBulkhead = createThreadPoolBulkhead("payments");
        
        // Decorate functions with semaphore bulkhead
        Supplier<String> decoratedOrderService = Bulkhead.decorateSupplier(
            orderBulkhead,
            () -> processOrder("order-123")
        );
        
        // Execute with thread pool bulkhead
        CompletableFuture<String> paymentFuture = paymentBulkhead.executeSupplier(
            () -> processPayment("payment-456")
        );
        
        // Get metrics
        System.out.println("Order Bulkhead Metrics:");
        System.out.println("  Available concurrent calls: " + 
            orderBulkhead.getMetrics().getAvailableConcurrentCalls());
        
        System.out.println("Payment Bulkhead Metrics:");
        System.out.println("  Active thread count: " + 
            paymentBulkhead.getMetrics().getActiveThreadCount());
        System.out.println("  Queue depth: " + 
            paymentBulkhead.getMetrics().getQueueDepth());
    }
    
    private static String processOrder(String orderId) {
        // Simulate order processing
        try { Thread.sleep(100); } catch (InterruptedException e) {}
        return "Order " + orderId + " processed";
    }
    
    private static String processPayment(String paymentId) {
        // Simulate payment processing
        try { Thread.sleep(500); } catch (InterruptedException e) {}
        return "Payment " + paymentId + " charged";
    }
}
```

---

## 🎯 Sizing Bulkheads

### Calculating Bulkhead Size

```
Concurrent Calls = (Requests/sec) × (Average Latency in seconds)

Example:
- 100 requests/second
- 200ms average latency
- Concurrent calls = 100 × 0.2 = 20

Add buffer for spikes:
- Bulkhead size = 20 × 1.5 = 30 concurrent calls
```

### Sizing by Service Criticality

```javascript
const bulkheadConfig = {
  // Critical path - larger allocation
  'payment-service': {
    maxConcurrent: 50,    // High priority
    maxQueue: 200,
    timeout: 30000
  },
  
  // Standard services
  'order-service': {
    maxConcurrent: 30,
    maxQueue: 100,
    timeout: 10000
  },
  
  // Non-critical - smaller allocation
  'notification-service': {
    maxConcurrent: 10,    // Low priority
    maxQueue: 50,
    timeout: 5000
  },
  
  // Background tasks - limited resources
  'analytics-service': {
    maxConcurrent: 5,     // Prevent resource hogging
    maxQueue: 20,
    timeout: 60000
  }
};
```

---

## 🔗 Bulkhead + Other Patterns

### Bulkhead + Circuit Breaker

```javascript
class ResilientService {
  constructor(name, options = {}) {
    this.bulkhead = new Bulkhead({
      name,
      maxConcurrent: options.maxConcurrent || 10,
      maxQueue: options.maxQueue || 50
    });
    
    this.circuitBreaker = new CircuitBreaker({
      name,
      failureThreshold: options.failureThreshold || 5,
      resetTimeout: options.resetTimeout || 30000
    });
  }
  
  async execute(fn) {
    // First check circuit breaker
    if (this.circuitBreaker.isOpen()) {
      throw new Error('Circuit breaker is open');
    }
    
    // Then apply bulkhead
    try {
      const result = await this.bulkhead.execute(async () => {
        const response = await fn();
        this.circuitBreaker.recordSuccess();
        return response;
      });
      return result;
    } catch (error) {
      this.circuitBreaker.recordFailure();
      throw error;
    }
  }
}

// Usage
const orderService = new ResilientService('orders', {
  maxConcurrent: 20,
  failureThreshold: 5,
  resetTimeout: 30000
});

const result = await orderService.execute(() => 
  api.post('/orders', orderData)
);
```

### Bulkhead + Retry + Timeout

```javascript
class FullyResilientClient {
  constructor(config) {
    this.bulkhead = new Bulkhead(config.bulkhead);
    this.maxRetries = config.maxRetries || 3;
    this.timeout = config.timeout || 5000;
  }
  
  async execute(fn) {
    return this.bulkhead.execute(async () => {
      return this.retryWithTimeout(fn);
    });
  }
  
  async retryWithTimeout(fn) {
    let lastError;
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await this.withTimeout(fn, this.timeout);
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries - 1) {
          await this.delay(1000 * Math.pow(2, attempt));
        }
      }
    }
    
    throw lastError;
  }
  
  withTimeout(fn, ms) {
    return Promise.race([
      fn(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), ms)
      )
    ]);
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage
const client = new FullyResilientClient({
  bulkhead: { maxConcurrent: 10, maxQueue: 50 },
  maxRetries: 3,
  timeout: 5000
});

const result = await client.execute(() => 
  fetch('https://api.example.com/data')
);
```

---

## ⚠️ Common Pitfalls

### 1. Bulkhead Too Small

```javascript
// BAD: Bulkhead smaller than normal load
const bulkhead = new Bulkhead({
  maxConcurrent: 5,  // Normal load is 20 requests!
  maxQueue: 10
});

// Results: Constant rejections under normal load
```

### 2. Bulkhead Too Large

```javascript
// BAD: Bulkhead doesn't provide isolation
const bulkhead = new Bulkhead({
  maxConcurrent: 1000,  // Same as no bulkhead!
  maxQueue: 5000
});

// Results: Slow service can still exhaust resources
```

### 3. Shared Queue Across Bulkheads

```javascript
// BAD: Bulkheads share a queue
const sharedQueue = [];

const bulkheadA = new Bulkhead({ queue: sharedQueue });  // Shares queue!
const bulkheadB = new Bulkhead({ queue: sharedQueue });

// Results: No real isolation between services
```

### 4. Not Monitoring Bulkhead Metrics

```javascript
// BAD: No visibility into bulkhead state
async function callService() {
  return bulkhead.execute(() => service.call());
}

// GOOD: Monitor and alert on bulkhead metrics
setInterval(() => {
  const metrics = bulkhead.getMetrics();
  
  // Alert if bulkhead is frequently full
  if (metrics.rejected > 100) {
    alerting.send('Bulkhead rejection spike', metrics);
  }
  
  // Alert if queue is building up
  if (metrics.queued > metrics.maxQueue * 0.8) {
    alerting.send('Bulkhead queue filling up', metrics);
  }
}, 10000);
```

---

## 📊 Monitoring & Metrics

### Key Metrics to Track

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| Active count | Currently executing calls | > 90% of max |
| Queue depth | Waiting calls | > 80% of max |
| Rejection rate | Calls rejected per second | > 1% of total |
| Wait time | Time spent in queue | > 2× normal |
| Success rate | Successful calls | < 99% |

### Metrics Dashboard

```javascript
// Prometheus-style metrics
const prometheus = require('prom-client');

class MonitoredBulkhead extends Bulkhead {
  constructor(config) {
    super(config);
    
    this.activeGauge = new prometheus.Gauge({
      name: `bulkhead_${config.name}_active`,
      help: 'Currently active calls'
    });
    
    this.queueGauge = new prometheus.Gauge({
      name: `bulkhead_${config.name}_queued`,
      help: 'Calls waiting in queue'
    });
    
    this.rejectedCounter = new prometheus.Counter({
      name: `bulkhead_${config.name}_rejected_total`,
      help: 'Total rejected calls'
    });
    
    this.completedCounter = new prometheus.Counter({
      name: `bulkhead_${config.name}_completed_total`,
      help: 'Total completed calls',
      labelNames: ['status']  // success, failure
    });
  }
  
  async execute(fn) {
    try {
      const result = await super.execute(fn);
      this.completedCounter.inc({ status: 'success' });
      return result;
    } catch (error) {
      if (error instanceof BulkheadFullError) {
        this.rejectedCounter.inc();
      } else {
        this.completedCounter.inc({ status: 'failure' });
      }
      throw error;
    } finally {
      this.updateGauges();
    }
  }
  
  updateGauges() {
    const metrics = this.getMetrics();
    this.activeGauge.set(metrics.active);
    this.queueGauge.set(metrics.queued);
  }
}
```

---

## 🎯 Best Practices

### 1. Size Based on Service Characteristics

```javascript
// CPU-bound service: smaller bulkhead
const cpuBoundBulkhead = new Bulkhead({
  maxConcurrent: 4,  // ~= number of CPU cores
  maxQueue: 10
});

// I/O-bound service: larger bulkhead
const ioBoundBulkhead = new Bulkhead({
  maxConcurrent: 100,  // Many concurrent I/O operations OK
  maxQueue: 500
});
```

### 2. Different Bulkheads for Different Operations

```javascript
// Read operations: higher concurrency
const readBulkhead = new Bulkhead({
  name: 'db-reads',
  maxConcurrent: 50
});

// Write operations: lower concurrency
const writeBulkhead = new Bulkhead({
  name: 'db-writes',
  maxConcurrent: 20
});
```

### 3. Graceful Degradation

```javascript
async function getProductData(productId) {
  try {
    return await productBulkhead.execute(() => 
      productService.getFullDetails(productId)
    );
  } catch (error) {
    if (error instanceof BulkheadFullError) {
      // Return cached/minimal data instead of failing
      return getCachedProduct(productId);
    }
    throw error;
  }
}
```

---

## 🔗 Related Patterns

| Pattern | Relationship |
|---------|--------------|
| **Circuit Breaker** | Fails fast when service is down |
| **Retry** | Retry within bulkhead limits |
| **Timeout** | Prevent single call from blocking bulkhead |
| **Rate Limiting** | Limit incoming requests |
| **Queue-Based Load Leveling** | Decouple request rate from processing |

---

## 📝 Key Takeaways

1. **Isolate resources** - Each service gets its own pool
2. **Size appropriately** - Based on load and criticality
3. **Choose the right type** - Thread pool vs semaphore
4. **Monitor continuously** - Track active, queued, rejected
5. **Combine with other patterns** - Circuit breaker, retry, timeout
6. **Plan for rejection** - Handle BulkheadFullError gracefully
7. **Test under load** - Verify isolation works as expected

---

## 🎯 Summary

The **Bulkhead Pattern** is essential for system resilience:

- ✅ Prevents cascade failures
- ✅ Isolates resource consumption
- ✅ Ensures critical services stay available
- ✅ Provides predictable system behavior

**Key formula:**
```
Resilience = Bulkhead + Circuit Breaker + Retry + Timeout
```

---

**Date Created:** 2026-02-17  
**Pattern Type:** Resilience / Integration  
**Difficulty:** Intermediate  
**Related Patterns:** Circuit Breaker, Retry, Timeout, Rate Limiting

