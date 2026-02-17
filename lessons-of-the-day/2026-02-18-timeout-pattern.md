# Timeout Pattern

## 📋 Learning Objectives

- [ ] Understand why timeouts are essential for system resilience
- [ ] Learn different types of timeouts (connection, read, write, overall)
- [ ] Master timeout configuration strategies
- [ ] Understand timeout budgets and cascading timeouts
- [ ] Implement timeouts in different languages and frameworks
- [ ] Combine timeout with other resilience patterns

---

## 🎯 Definition

The **Timeout Pattern** sets a limit on how long an operation can take before it's considered failed. It prevents the system from waiting indefinitely for a response that may never come, freeing up resources for other operations.

**Key Principle:**
> "Fail fast, recover faster" - Don't wait forever for something that's probably not coming.

---

## ⏰ Why Timeouts Matter

### Without Timeout

```
Client                          Slow Service
  │                                  │
  │──── Request ────────────────────▶│
  │                                  │ (processing...)
  │                                  │ (still processing...)
  │                                  │ (service stuck...)
  │     Waiting...                   │
  │     Waiting...                   │
  │     Waiting... (resources held)  │
  │     Waiting... (thread blocked)  │
  │     Waiting... (FOREVER!)        │
  ▼                                  ▼
```

**Problems:**
- ❌ Resources held indefinitely
- ❌ Thread pools exhausted
- ❌ Cascade failures
- ❌ Poor user experience
- ❌ System becomes unresponsive

### With Timeout

```
Client                          Slow Service
  │                                  │
  │──── Request ────────────────────▶│
  │                                  │ (processing...)
  │     [5s timeout started]         │
  │                                  │ (still processing...)
  │     [timeout!]                   │
  │◀─── TimeoutError ────────────────│
  │                                  │
  │     (Resources freed!)           │
  │     (Can retry or fallback)      │
  ▼                                  ▼
```

---

## 📊 Types of Timeouts

### 1. Connection Timeout

Time allowed to establish a connection.

```
Client ──────[Connection Timeout]──────▶ Server
         Waiting for TCP handshake
```

```javascript
// Connection timeout - time to establish connection
const http = require('http');

const options = {
  hostname: 'api.example.com',
  port: 443,
  path: '/data',
  method: 'GET',
  timeout: 3000  // 3 seconds to connect
};

const req = http.request(options, (res) => {
  // Handle response
});

req.on('timeout', () => {
  req.destroy(new Error('Connection timeout'));
});
```

**Typical values:** 1-5 seconds  
**Set short because:** If server is reachable, connection is fast

### 2. Read/Socket Timeout

Time allowed to receive data after connection is established.

```
Client ◀──────[Read Timeout]────────── Server
         Waiting for response data
```

```javascript
// Read timeout - time to receive response
const axios = require('axios');

const response = await axios.get('https://api.example.com/data', {
  timeout: 10000  // 10 seconds for entire request (connect + read)
});
```

**Typical values:** 5-30 seconds  
**Set based on:** Expected operation duration

### 3. Write Timeout

Time allowed to send request data.

```
Client ──────[Write Timeout]──────────▶ Server
         Sending request body
```

```javascript
// Write timeout for large uploads
const controller = new AbortController();
const writeTimeout = setTimeout(() => {
  controller.abort();
}, 30000);  // 30 seconds to upload

try {
  await fetch('https://api.example.com/upload', {
    method: 'POST',
    body: largeFile,
    signal: controller.signal
  });
} finally {
  clearTimeout(writeTimeout);
}
```

**Typical values:** 10-60 seconds  
**Set based on:** Upload size and network speed

### 4. Overall/Request Timeout

Total time for entire operation including retries.

```
Client ──[Overall Timeout: 30s]──────────────────────▶
         │         │         │
         ├─ Try 1 ─┤─ Try 2 ─┤─ Try 3 ─┤
         │  10s    │  10s    │  10s    │
```

```javascript
// Overall timeout including retries
async function fetchWithOverallTimeout(url, overallTimeoutMs = 30000) {
  const deadline = Date.now() + overallTimeoutMs;
  
  const attemptFetch = async (attemptTimeout) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), attemptTimeout);
    
    try {
      return await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }
  };
  
  // Try with remaining time budget
  for (let attempt = 0; attempt < 3; attempt++) {
    const remainingTime = deadline - Date.now();
    
    if (remainingTime <= 0) {
      throw new Error('Overall timeout exceeded');
    }
    
    try {
      // Each attempt gets portion of remaining time
      const attemptTimeout = Math.min(10000, remainingTime);
      return await attemptFetch(attemptTimeout);
    } catch (error) {
      if (attempt === 2) throw error;
      // Wait before retry (counts against overall timeout)
      await sleep(Math.min(1000, remainingTime - 1000));
    }
  }
}
```

### 5. Idle Timeout

Time allowed for connection to remain idle before closing.

```javascript
// Keep-alive with idle timeout
const http = require('http');

const agent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  timeout: 60000  // Close idle connections after 60s
});

const options = {
  hostname: 'api.example.com',
  agent: agent
};
```

---

## 🛠️ Implementation Examples

### JavaScript/TypeScript - Comprehensive Timeout Utility

```typescript
interface TimeoutConfig {
  connectTimeout?: number;
  readTimeout?: number;
  overallTimeout?: number;
}

class TimeoutError extends Error {
  constructor(
    message: string,
    public readonly timeoutType: 'connect' | 'read' | 'overall'
  ) {
    super(message);
    this.name = 'TimeoutError';
  }
}

async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeoutConfig: TimeoutConfig = {}
): Promise<T> {
  const {
    connectTimeout = 5000,
    readTimeout = 30000,
    overallTimeout = 60000
  } = timeoutConfig;

  const overallController = new AbortController();
  const overallTimer = setTimeout(() => {
    overallController.abort();
  }, overallTimeout);

  try {
    // Connection phase
    const connectController = new AbortController();
    const connectTimer = setTimeout(() => {
      connectController.abort();
    }, connectTimeout);

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        signal: connectController.signal
      });
      clearTimeout(connectTimer);
    } catch (error) {
      clearTimeout(connectTimer);
      if (connectController.signal.aborted) {
        throw new TimeoutError(
          `Connection timeout after ${connectTimeout}ms`,
          'connect'
        );
      }
      throw error;
    }

    // Read phase
    const readController = new AbortController();
    const readTimer = setTimeout(() => {
      readController.abort();
    }, readTimeout);

    try {
      const data = await response.json();
      clearTimeout(readTimer);
      return data as T;
    } catch (error) {
      clearTimeout(readTimer);
      if (readController.signal.aborted) {
        throw new TimeoutError(
          `Read timeout after ${readTimeout}ms`,
          'read'
        );
      }
      throw error;
    }
  } finally {
    clearTimeout(overallTimer);
  }
}

// Usage
try {
  const data = await fetchWithTimeout<User>('https://api.example.com/user', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer token' }
  }, {
    connectTimeout: 3000,
    readTimeout: 10000,
    overallTimeout: 15000
  });
} catch (error) {
  if (error instanceof TimeoutError) {
    console.log(`${error.timeoutType} timeout: ${error.message}`);
  }
}
```

### Promise-based Timeout Wrapper

```javascript
// Generic timeout wrapper for any promise
function withTimeout(promise, timeoutMs, errorMessage = 'Operation timed out') {
  let timeoutId;
  
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${errorMessage} after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise])
    .finally(() => clearTimeout(timeoutId));
}

// Usage
async function fetchData() {
  const result = await withTimeout(
    fetch('https://api.example.com/data'),
    5000,
    'API request timed out'
  );
  return result.json();
}

// With async function
async function processOrder(orderId) {
  return withTimeout(
    (async () => {
      const order = await getOrder(orderId);
      const payment = await processPayment(order);
      const shipping = await createShipment(order);
      return { order, payment, shipping };
    })(),
    30000,
    'Order processing timed out'
  );
}
```

### Axios with Timeouts

```javascript
const axios = require('axios');

// Create instance with default timeouts
const apiClient = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,  // 10 seconds default
  
  // For more granular control, use interceptors
});

// Request interceptor for per-request timeout
apiClient.interceptors.request.use((config) => {
  // Set different timeouts based on endpoint
  if (config.url.includes('/upload')) {
    config.timeout = 60000;  // 60s for uploads
  } else if (config.url.includes('/reports')) {
    config.timeout = 30000;  // 30s for reports
  }
  return config;
});

// Response interceptor for timeout handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      // Transform to more descriptive error
      return Promise.reject(new Error(
        `Request to ${error.config.url} timed out after ${error.config.timeout}ms`
      ));
    }
    return Promise.reject(error);
  }
);

// Usage
try {
  const response = await apiClient.get('/users');
} catch (error) {
  console.error('Request failed:', error.message);
}
```

### Node.js HTTP with Separate Timeouts

```javascript
const http = require('http');
const https = require('https');

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      connectTimeout = 5000,
      socketTimeout = 30000,
      ...requestOptions
    } = options;
    
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    // Connection timeout
    req.setTimeout(connectTimeout, () => {
      req.destroy(new Error(`Connection timeout after ${connectTimeout}ms`));
    });
    
    // Socket timeout (for data transfer)
    req.on('socket', (socket) => {
      socket.setTimeout(socketTimeout);
      socket.on('timeout', () => {
        req.destroy(new Error(`Socket timeout after ${socketTimeout}ms`));
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

// Usage
const response = await request('https://api.example.com/data', {
  connectTimeout: 3000,
  socketTimeout: 10000,
  method: 'GET'
});
```

### Python Implementation

```python
import asyncio
import aiohttp
from typing import TypeVar, Callable, Any
from functools import wraps

T = TypeVar('T')

class TimeoutError(Exception):
    def __init__(self, message: str, timeout_type: str):
        super().__init__(message)
        self.timeout_type = timeout_type

async def fetch_with_timeout(
    url: str,
    connect_timeout: float = 5.0,
    read_timeout: float = 30.0,
    overall_timeout: float = 60.0
) -> dict:
    """Fetch with multiple timeout levels."""
    
    timeout = aiohttp.ClientTimeout(
        total=overall_timeout,
        connect=connect_timeout,
        sock_read=read_timeout
    )
    
    try:
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(url) as response:
                return await response.json()
    except asyncio.TimeoutError as e:
        raise TimeoutError(f"Request to {url} timed out", "overall")

# Decorator for timeout
def with_timeout(seconds: float):
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> T:
            try:
                return await asyncio.wait_for(
                    func(*args, **kwargs),
                    timeout=seconds
                )
            except asyncio.TimeoutError:
                raise TimeoutError(
                    f"{func.__name__} timed out after {seconds}s",
                    "operation"
                )
        return wrapper
    return decorator

# Usage
@with_timeout(10.0)
async def process_order(order_id: str) -> dict:
    # Long running operation
    await asyncio.sleep(5)
    return {"order_id": order_id, "status": "processed"}

# With context manager
async def fetch_data(url: str) -> dict:
    async with asyncio.timeout(10.0):
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                return await response.json()
```

### Java Implementation

```java
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.*;

public class TimeoutPatternExample {
    
    // HTTP Client with timeouts
    private static final HttpClient httpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(5))
        .build();
    
    public static String fetchWithTimeout(String url, Duration timeout) 
            throws Exception {
        
        HttpRequest request = HttpRequest.newBuilder()
            .uri(java.net.URI.create(url))
            .timeout(timeout)  // Request timeout
            .GET()
            .build();
        
        HttpResponse<String> response = httpClient.send(
            request, 
            HttpResponse.BodyHandlers.ofString()
        );
        
        return response.body();
    }
    
    // Generic timeout wrapper using CompletableFuture
    public static <T> T withTimeout(
            Callable<T> operation, 
            long timeout, 
            TimeUnit unit) throws Exception {
        
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<T> future = executor.submit(operation);
        
        try {
            return future.get(timeout, unit);
        } catch (TimeoutException e) {
            future.cancel(true);
            throw new TimeoutException(
                "Operation timed out after " + timeout + " " + unit
            );
        } finally {
            executor.shutdown();
        }
    }
    
    // Async with timeout using CompletableFuture
    public static <T> CompletableFuture<T> asyncWithTimeout(
            Supplier<T> operation,
            Duration timeout) {
        
        CompletableFuture<T> future = CompletableFuture.supplyAsync(operation);
        
        return future.orTimeout(timeout.toMillis(), TimeUnit.MILLISECONDS)
            .exceptionally(ex -> {
                if (ex.getCause() instanceof TimeoutException) {
                    throw new CompletionException(
                        "Operation timed out after " + timeout, ex
                    );
                }
                throw new CompletionException(ex);
            });
    }
    
    public static void main(String[] args) throws Exception {
        // HTTP request with timeout
        String response = fetchWithTimeout(
            "https://api.example.com/data",
            Duration.ofSeconds(10)
        );
        
        // Generic operation with timeout
        String result = withTimeout(
            () -> expensiveOperation(),
            30,
            TimeUnit.SECONDS
        );
        
        // Async with timeout
        CompletableFuture<String> asyncResult = asyncWithTimeout(
            () -> anotherOperation(),
            Duration.ofSeconds(15)
        );
    }
}
```

---

## ⏱️ Timeout Budgets

When requests traverse multiple services, use timeout budgets to ensure overall SLA.

### Without Timeout Budget (Problem)

```
Client Request (expects response in 5s)
    │
    ▼ Service A (timeout: 10s)
    │
    ▼ Service B (timeout: 10s)
    │
    ▼ Service C (timeout: 10s)

Problem: Total possible wait = 30s, but client expects 5s!
```

### With Timeout Budget

```
Client Request (budget: 5s)
    │
    ▼ Service A (budget: 5s, uses 1s) ─── remaining: 4s
    │
    ▼ Service B (budget: 4s, uses 2s) ─── remaining: 2s
    │
    ▼ Service C (budget: 2s)
```

```javascript
// Timeout budget implementation
class TimeoutBudget {
  constructor(totalBudgetMs) {
    this.deadline = Date.now() + totalBudgetMs;
    this.originalBudget = totalBudgetMs;
  }
  
  remaining() {
    return Math.max(0, this.deadline - Date.now());
  }
  
  isExpired() {
    return this.remaining() <= 0;
  }
  
  // Get timeout for next operation (with minimum)
  getTimeout(minTimeout = 1000) {
    const remaining = this.remaining();
    if (remaining <= 0) {
      throw new Error('Timeout budget exhausted');
    }
    return Math.max(minTimeout, remaining);
  }
  
  // Create child budget (for downstream calls)
  createChild(reserveMs = 100) {
    const remaining = this.remaining() - reserveMs;
    if (remaining <= 0) {
      throw new Error('Insufficient budget for child operation');
    }
    return new TimeoutBudget(remaining);
  }
}

// Usage in service chain
async function processRequest(data) {
  const budget = new TimeoutBudget(5000);  // 5 second total budget
  
  // Step 1: Validate (pass remaining budget)
  const validation = await withTimeout(
    validateData(data),
    budget.getTimeout()
  );
  
  // Step 2: Process (pass remaining budget)
  const result = await withTimeout(
    processData(data),
    budget.getTimeout()
  );
  
  // Step 3: Save (pass remaining budget)
  await withTimeout(
    saveResult(result),
    budget.getTimeout()
  );
  
  return result;
}

// Passing budget to downstream services
async function callDownstreamService(data, budget) {
  const childBudget = budget.createChild(100);  // Reserve 100ms for overhead
  
  return axios.post('http://downstream/api', data, {
    timeout: childBudget.remaining(),
    headers: {
      'X-Timeout-Budget': childBudget.remaining()  // Pass to downstream
    }
  });
}

// Downstream service reads budget from header
app.use((req, res, next) => {
  const budgetHeader = req.headers['x-timeout-budget'];
  if (budgetHeader) {
    req.timeoutBudget = new TimeoutBudget(parseInt(budgetHeader));
  }
  next();
});
```

### gRPC Deadline Propagation

```javascript
// gRPC automatically propagates deadlines
const grpc = require('@grpc/grpc-js');

// Client sets deadline
const deadline = new Date();
deadline.setSeconds(deadline.getSeconds() + 5);  // 5 second deadline

client.processOrder(request, { deadline }, (error, response) => {
  if (error && error.code === grpc.status.DEADLINE_EXCEEDED) {
    console.log('Request deadline exceeded');
  }
});

// Server can check remaining time
function processOrder(call, callback) {
  const deadline = call.getDeadline();
  const remainingMs = deadline - Date.now();
  
  if (remainingMs < 1000) {
    callback({
      code: grpc.status.DEADLINE_EXCEEDED,
      message: 'Insufficient time to process'
    });
    return;
  }
  
  // Process with remaining time budget
  processWithTimeout(call.request, remainingMs)
    .then(result => callback(null, result))
    .catch(err => callback(err));
}
```

---

## 🔗 Timeout + Other Patterns

### Timeout + Retry

```javascript
async function fetchWithRetryAndTimeout(url, options = {}) {
  const {
    maxRetries = 3,
    perAttemptTimeout = 5000,
    overallTimeout = 20000
  } = options;
  
  const deadline = Date.now() + overallTimeout;
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const remainingTime = deadline - Date.now();
    
    if (remainingTime <= 0) {
      throw new Error('Overall timeout exceeded');
    }
    
    // Use minimum of per-attempt timeout and remaining time
    const timeout = Math.min(perAttemptTimeout, remainingTime);
    
    try {
      return await withTimeout(fetch(url), timeout);
    } catch (error) {
      lastError = error;
      
      // Only retry on timeout, not on other errors
      if (!isTimeoutError(error)) {
        throw error;
      }
      
      console.log(`Attempt ${attempt + 1} timed out, ${remainingTime}ms remaining`);
    }
  }
  
  throw lastError;
}
```

### Timeout + Circuit Breaker

```javascript
class TimeoutCircuitBreaker {
  constructor(options = {}) {
    this.timeout = options.timeout || 5000;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = null;
  }
  
  async execute(fn) {
    // Check circuit breaker
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      // Apply timeout
      const result = await withTimeout(fn(), this.timeout);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

### Timeout + Bulkhead

```javascript
class ResilientClient {
  constructor(options = {}) {
    this.bulkhead = new Bulkhead({
      maxConcurrent: options.maxConcurrent || 10,
      maxQueue: options.maxQueue || 50
    });
    this.timeout = options.timeout || 10000;
  }
  
  async execute(fn) {
    // Bulkhead limits concurrent requests
    return this.bulkhead.execute(async () => {
      // Timeout prevents indefinite waiting
      return withTimeout(fn(), this.timeout);
    });
  }
}

const client = new ResilientClient({
  maxConcurrent: 20,
  timeout: 5000
});

const result = await client.execute(() => 
  fetch('https://api.example.com/data')
);
```

---

## ⚠️ Common Pitfalls

### 1. No Timeout at All

```javascript
// BAD: No timeout - can wait forever
const response = await fetch('https://api.example.com/data');

// GOOD: Always set timeout
const response = await withTimeout(
  fetch('https://api.example.com/data'),
  10000
);
```

### 2. Timeout Too Long

```javascript
// BAD: 5 minute timeout defeats the purpose
const response = await axios.get('/api/data', {
  timeout: 300000  // 5 minutes!
});

// GOOD: Reasonable timeout based on expected duration
const response = await axios.get('/api/data', {
  timeout: 10000  // 10 seconds
});
```

### 3. Timeout Too Short

```javascript
// BAD: 100ms is unrealistic for most APIs
const response = await axios.get('/api/data', {
  timeout: 100  // Too short!
});

// GOOD: Account for network latency + processing time
const response = await axios.get('/api/data', {
  timeout: 5000  // 5 seconds
});
```

### 4. Ignoring Timeout Budget

```javascript
// BAD: Each service uses full timeout, ignoring budget
async function serviceA(data) {
  const result = await withTimeout(callServiceB(data), 10000);
  return withTimeout(callServiceC(result), 10000);  // Could take 20s total!
}

// GOOD: Use timeout budget
async function serviceA(data, budget) {
  const result = await withTimeout(
    callServiceB(data, budget.createChild()),
    budget.getTimeout()
  );
  return withTimeout(
    callServiceC(result, budget.createChild()),
    budget.getTimeout()
  );
}
```

### 5. Not Cleaning Up After Timeout

```javascript
// BAD: Resource not cleaned up on timeout
async function processWithLeak() {
  const connection = await database.connect();
  const result = await withTimeout(longOperation(), 5000);  // If timeout, connection leaks!
  connection.close();
  return result;
}

// GOOD: Always clean up resources
async function processCleanly() {
  const connection = await database.connect();
  try {
    return await withTimeout(longOperation(), 5000);
  } finally {
    connection.close();  // Always closes, even on timeout
  }
}
```

### 6. Timeout Without Cancellation

```javascript
// BAD: Operation continues even after timeout
function withBadTimeout(promise, ms) {
  return Promise.race([
    promise,  // This keeps running even after timeout!
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ]);
}

// GOOD: Cancel the operation on timeout
function withGoodTimeout(fn, ms) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  
  return fn(controller.signal)
    .finally(() => clearTimeout(timeout));
}

// Usage with cancellable fetch
const result = await withGoodTimeout(
  (signal) => fetch(url, { signal }),
  5000
);
```

---

## 📊 Timeout Configuration Guidelines

### By Operation Type

| Operation | Recommended Timeout | Reasoning |
|-----------|---------------------|-----------|
| Health check | 1-3 seconds | Should be fast |
| Database query | 5-30 seconds | Depends on complexity |
| API call | 5-15 seconds | Network + processing |
| File upload | 30-300 seconds | Size dependent |
| Batch job | Minutes to hours | Long-running by design |
| WebSocket ping | 10-30 seconds | Keep-alive check |

### By Service Tier

```javascript
const timeoutConfig = {
  // Critical path - shorter timeouts
  authentication: {
    connect: 2000,
    read: 5000
  },
  
  // Standard services
  api: {
    connect: 5000,
    read: 15000
  },
  
  // Background/batch operations
  analytics: {
    connect: 10000,
    read: 60000
  },
  
  // External services - account for variability
  thirdParty: {
    connect: 10000,
    read: 30000
  }
};
```

### Environment-Based

```javascript
const timeoutConfig = {
  development: {
    default: 30000,  // Longer for debugging
    database: 60000
  },
  
  staging: {
    default: 15000,
    database: 30000
  },
  
  production: {
    default: 10000,  // Shorter for responsiveness
    database: 15000
  }
};

const env = process.env.NODE_ENV || 'development';
const timeout = timeoutConfig[env].default;
```

---

## 📈 Monitoring Timeouts

### Key Metrics

```javascript
// Track timeout metrics
class TimeoutMetrics {
  constructor() {
    this.metrics = {
      total: 0,
      timeouts: 0,
      p50: [],
      p95: [],
      p99: []
    };
  }
  
  record(duration, didTimeout) {
    this.metrics.total++;
    if (didTimeout) {
      this.metrics.timeouts++;
    }
    this.metrics.p50.push(duration);
    
    // Calculate percentiles periodically
  }
  
  getTimeoutRate() {
    return this.metrics.timeouts / this.metrics.total;
  }
  
  alertIfNeeded() {
    const rate = this.getTimeoutRate();
    if (rate > 0.05) {  // > 5% timeout rate
      alert('High timeout rate detected: ' + rate);
    }
  }
}
```

### Dashboard Metrics

| Metric | Alert Threshold | Action |
|--------|-----------------|--------|
| Timeout rate | > 5% | Investigate slow service |
| p99 latency | > timeout | Increase timeout or optimize |
| Connection timeout rate | > 1% | Check network/DNS |
| Read timeout rate | > 3% | Check service performance |

---

## 🎯 Best Practices

### 1. Always Set Timeouts

```javascript
// Every external call should have a timeout
const httpClient = axios.create({
  timeout: 10000  // Default for all requests
});
```

### 2. Use Appropriate Granularity

```javascript
// Different timeouts for different phases
const config = {
  connect: 3000,   // Fast - just TCP handshake
  read: 15000,     // Longer - waiting for response
  overall: 30000   // Includes retries
};
```

### 3. Propagate Deadlines

```javascript
// Pass remaining budget to downstream services
app.use((req, res, next) => {
  const budget = req.headers['x-timeout-budget'];
  if (budget) {
    req.timeoutBudget = parseInt(budget);
  } else {
    req.timeoutBudget = 30000;  // Default 30s
  }
  next();
});
```

### 4. Log Timeout Events

```javascript
// Log for debugging and analysis
async function fetchWithLogging(url, timeout) {
  const start = Date.now();
  try {
    return await withTimeout(fetch(url), timeout);
  } catch (error) {
    const duration = Date.now() - start;
    logger.warn({
      event: 'timeout',
      url,
      timeout,
      duration,
      error: error.message
    });
    throw error;
  }
}
```

---

## 🔗 Related Patterns

| Pattern | Relationship |
|---------|--------------|
| **Retry** | Retry after timeout |
| **Circuit Breaker** | Open circuit on repeated timeouts |
| **Bulkhead** | Prevent timeout from blocking resources |
| **Fallback** | Return cached data on timeout |
| **Health Check** | Use short timeout for health checks |

---

## 📝 Key Takeaways

1. **Always set timeouts** - Never wait indefinitely
2. **Use multiple timeout types** - Connect, read, overall
3. **Implement timeout budgets** - Coordinate across services
4. **Clean up resources** - Don't leak connections on timeout
5. **Cancel operations** - Don't just ignore them
6. **Monitor timeout rates** - Track and alert on anomalies
7. **Configure by operation** - Different operations need different timeouts

---

## 🎯 Summary

The **Timeout Pattern** is fundamental for system resilience:

- ✅ Prevents indefinite waiting
- ✅ Frees up resources
- ✅ Enables fast failure recovery
- ✅ Improves user experience
- ✅ Required for retry and circuit breaker

**Golden Rule:**
```
Every external call needs a timeout.
No exceptions.
```

---

**Date Created:** 2026-02-18  
**Pattern Type:** Resilience / Integration  
**Difficulty:** Beginner to Intermediate  
**Related Patterns:** Retry, Circuit Breaker, Bulkhead, Fallback

