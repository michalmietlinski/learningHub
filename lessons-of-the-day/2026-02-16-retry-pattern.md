# Retry Pattern

## 📋 Learning Objectives

- [ ] Understand when and why to use retry pattern
- [ ] Learn different retry strategies (immediate, fixed, exponential backoff)
- [ ] Understand jitter and thundering herd problem
- [ ] Master idempotency requirements for safe retries
- [ ] Learn when NOT to retry
- [ ] Implement retry pattern in different languages
- [ ] Combine retry with circuit breaker pattern

---

## 🎯 Definition

The **Retry Pattern** is a resilience pattern that enables an application to handle transient failures by transparently retrying a failed operation. Instead of immediately failing, the application attempts the operation again with the expectation that the failure is temporary.

**Key Principle:**
> "Try, try again" - Many failures are transient and will succeed on retry.

---

## 🏗️ Core Concepts

### What is a Transient Failure?

Transient failures are temporary issues that resolve themselves:

| Type | Example | Duration |
|------|---------|----------|
| **Network glitch** | Packet loss, timeout | Milliseconds |
| **Service restart** | Deployment, scaling | Seconds |
| **Rate limiting** | API throttling | Seconds to minutes |
| **Resource contention** | Database locks | Milliseconds |
| **Temporary overload** | Traffic spike | Seconds to minutes |

### When to Retry vs When NOT to Retry

```
┌─────────────────┐     ┌─────────────────┐
│   RETRY ✅      │     │   DON'T RETRY ❌ │
├─────────────────┤     ├─────────────────┤
│ Network timeout │     │ 400 Bad Request │
│ 503 Service     │     │ 401 Unauthorized│
│   Unavailable   │     │ 403 Forbidden   │
│ 429 Too Many    │     │ 404 Not Found   │
│   Requests      │     │ 422 Validation  │
│ Connection reset│     │ Business logic  │
│ DNS failure     │     │   errors        │
└─────────────────┘     └─────────────────┘
```

**Retry these HTTP status codes:**
- `408` Request Timeout
- `429` Too Many Requests
- `500` Internal Server Error (with caution)
- `502` Bad Gateway
- `503` Service Unavailable
- `504` Gateway Timeout

**Never retry these:**
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `409` Conflict (depends on context)
- `422` Unprocessable Entity

---

## 📊 Retry Strategies

### 1. Immediate Retry

Retry immediately without delay. Only useful for very brief glitches.

```
Request → Fail → Retry → Fail → Retry → Success
           0ms      0ms
```

```javascript
async function immediateRetry(fn, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt} failed`);
    }
  }
  
  throw lastError;
}

// Usage
const result = await immediateRetry(() => fetchData(url), 3);
```

**Pros:** Fast recovery for brief glitches  
**Cons:** Can overwhelm recovering service, wastes resources

### 2. Fixed Interval Retry

Wait a constant time between retries.

```
Request → Fail → Wait 1s → Retry → Wait 1s → Retry → Success
```

```javascript
async function fixedIntervalRetry(fn, maxRetries = 3, delayMs = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt} failed, retrying in ${delayMs}ms`);
      
      if (attempt < maxRetries) {
        await sleep(delayMs);
      }
    }
  }
  
  throw lastError;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**Pros:** Simple, predictable  
**Cons:** May still overwhelm service if many clients retry together

### 3. Exponential Backoff

Double the wait time after each failure. Most recommended strategy.

```
Request → Fail → Wait 1s → Fail → Wait 2s → Fail → Wait 4s → Success
```

```javascript
async function exponentialBackoff(fn, options = {}) {
  const {
    maxRetries = 5,
    baseDelayMs = 1000,
    maxDelayMs = 30000,
    factor = 2
  } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        // Calculate delay: baseDelay * factor^attempt
        const delay = Math.min(
          baseDelayMs * Math.pow(factor, attempt),
          maxDelayMs
        );
        
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms`);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

// Usage
const result = await exponentialBackoff(
  () => fetchData(url),
  { maxRetries: 5, baseDelayMs: 1000, maxDelayMs: 30000 }
);
```

**Delay progression:** 1s → 2s → 4s → 8s → 16s (capped at maxDelay)

### 4. Exponential Backoff with Jitter

Add randomness to prevent thundering herd problem.

```
Without Jitter (Thundering Herd):
Client 1: ──X──1s──X──2s──X──4s──✓
Client 2: ──X──1s──X──2s──X──4s──✓  ← All retry at same time!
Client 3: ──X──1s──X──2s──X──4s──✓

With Jitter:
Client 1: ──X──0.8s──X──2.3s──X──3.5s──✓
Client 2: ──X──1.2s──X──1.8s──X──4.2s──✓  ← Spread out!
Client 3: ──X──0.9s──X──2.1s──X──3.9s──✓
```

```javascript
async function exponentialBackoffWithJitter(fn, options = {}) {
  const {
    maxRetries = 5,
    baseDelayMs = 1000,
    maxDelayMs = 30000,
    jitterFactor = 0.5  // 50% randomness
  } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        // Calculate base delay
        const baseDelay = Math.min(
          baseDelayMs * Math.pow(2, attempt),
          maxDelayMs
        );
        
        // Add jitter: delay * (1 - jitter/2 + random * jitter)
        const jitter = baseDelay * jitterFactor * (Math.random() - 0.5);
        const delay = Math.max(0, baseDelay + jitter);
        
        console.log(`Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms`);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}
```

**Jitter Types:**

```javascript
// Full Jitter: delay = random(0, baseDelay * 2^attempt)
const fullJitter = Math.random() * baseDelay * Math.pow(2, attempt);

// Equal Jitter: delay = baseDelay/2 + random(0, baseDelay/2)
const equalJitter = (baseDelay / 2) + (Math.random() * baseDelay / 2);

// Decorrelated Jitter: delay = min(maxDelay, random(baseDelay, prevDelay * 3))
const decorrelatedJitter = Math.min(maxDelayMs, baseDelayMs + Math.random() * (prevDelay * 3 - baseDelayMs));
```

### 5. Linear Backoff

Increase delay linearly (less aggressive than exponential).

```
Request → Fail → Wait 1s → Fail → Wait 2s → Fail → Wait 3s → Success
```

```javascript
async function linearBackoff(fn, options = {}) {
  const {
    maxRetries = 5,
    delayIncrementMs = 1000,
    maxDelayMs = 10000
  } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const delay = Math.min(
          delayIncrementMs * (attempt + 1),
          maxDelayMs
        );
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}
```

---

## ⚠️ Idempotency Requirement

**Critical:** Retried operations MUST be idempotent (safe to repeat).

### Non-Idempotent (Dangerous!)

```javascript
// BAD: Each retry creates a new order!
async function createOrder(orderData) {
  return await api.post('/orders', orderData);
}

// Retry 1: Creates order #1
// Retry 2: Creates order #2  ← DUPLICATE!
// Retry 3: Creates order #3  ← DUPLICATE!
```

### Idempotent (Safe)

```javascript
// GOOD: Use idempotency key
async function createOrder(orderData, idempotencyKey) {
  return await api.post('/orders', orderData, {
    headers: { 'Idempotency-Key': idempotencyKey }
  });
}

// Retry 1: Creates order #1
// Retry 2: Returns existing order #1 (no duplicate)
// Retry 3: Returns existing order #1 (no duplicate)
```

### HTTP Methods Idempotency

| Method | Idempotent? | Safe to Retry? |
|--------|-------------|----------------|
| GET | ✅ Yes | ✅ Yes |
| HEAD | ✅ Yes | ✅ Yes |
| OPTIONS | ✅ Yes | ✅ Yes |
| PUT | ✅ Yes | ✅ Yes |
| DELETE | ✅ Yes | ✅ Yes |
| POST | ❌ No | ⚠️ With idempotency key |
| PATCH | ❌ No | ⚠️ Depends on implementation |

---

## 🛠️ Implementation Examples

### TypeScript - Comprehensive Retry Utility

```typescript
interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitter: boolean;
  retryCondition?: (error: Error) => boolean;
  onRetry?: (error: Error, attempt: number, delay: number) => void;
}

const defaultOptions: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitter: true,
  retryCondition: () => true,
  onRetry: () => {}
};

async function retry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: Error;
  
  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Check if we should retry this error
      if (!opts.retryCondition!(lastError)) {
        throw lastError;
      }
      
      // Last attempt - don't wait, just throw
      if (attempt === opts.maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      let delay = Math.min(
        opts.baseDelayMs * Math.pow(2, attempt - 1),
        opts.maxDelayMs
      );
      
      // Add jitter if enabled
      if (opts.jitter) {
        delay = delay * (0.5 + Math.random());
      }
      
      // Callback before retry
      opts.onRetry!(lastError, attempt, delay);
      
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

// Usage
const result = await retry(
  () => fetchUserData(userId),
  {
    maxRetries: 5,
    baseDelayMs: 1000,
    jitter: true,
    retryCondition: (error) => {
      // Only retry network errors and 5xx responses
      return isNetworkError(error) || isServerError(error);
    },
    onRetry: (error, attempt, delay) => {
      console.log(`Retry ${attempt} after ${delay}ms due to: ${error.message}`);
    }
  }
);
```

### Retry with Axios Interceptor

```javascript
const axios = require('axios');
const axiosRetry = require('axios-retry');

// Configure axios with retry
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // Retry on network errors or 5xx status codes
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           (error.response && error.response.status >= 500);
  },
  onRetry: (retryCount, error, requestConfig) => {
    console.log(`Retry attempt ${retryCount} for ${requestConfig.url}`);
  }
});

// Usage - retries happen automatically
const response = await axios.get('https://api.example.com/data');
```

### Retry with Fetch API

```javascript
async function fetchWithRetry(url, options = {}, retryOptions = {}) {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 10000
  } = retryOptions;
  
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // Treat certain status codes as retryable errors
      if (response.status >= 500 || response.status === 429) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const delay = Math.min(
          baseDelayMs * Math.pow(2, attempt) * (0.5 + Math.random()),
          maxDelayMs
        );
        console.log(`Fetch failed, retrying in ${Math.round(delay)}ms...`);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

// Usage
const response = await fetchWithRetry(
  'https://api.example.com/data',
  { method: 'GET', headers: { 'Authorization': 'Bearer token' } },
  { maxRetries: 3, baseDelayMs: 1000 }
);
```

### Python Implementation

```python
import time
import random
from functools import wraps
from typing import Callable, Type, Tuple

def retry(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 30.0,
    exponential: bool = True,
    jitter: bool = True,
    exceptions: Tuple[Type[Exception], ...] = (Exception,)
):
    """Decorator for retrying functions with exponential backoff."""
    
    def decorator(func: Callable):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    
                    if attempt < max_retries - 1:
                        # Calculate delay
                        if exponential:
                            delay = min(base_delay * (2 ** attempt), max_delay)
                        else:
                            delay = base_delay
                        
                        # Add jitter
                        if jitter:
                            delay = delay * (0.5 + random.random())
                        
                        print(f"Attempt {attempt + 1} failed: {e}. Retrying in {delay:.2f}s...")
                        time.sleep(delay)
            
            raise last_exception
        
        return wrapper
    return decorator

# Usage
@retry(max_retries=5, base_delay=1.0, exceptions=(ConnectionError, TimeoutError))
def fetch_data(url: str):
    response = requests.get(url, timeout=5)
    response.raise_for_status()
    return response.json()
```

### Java Implementation

```java
import java.util.concurrent.Callable;
import java.util.function.Predicate;

public class RetryUtil {
    
    public static <T> T retry(
            Callable<T> operation,
            int maxRetries,
            long baseDelayMs,
            long maxDelayMs,
            Predicate<Exception> retryCondition
    ) throws Exception {
        
        Exception lastException = null;
        
        for (int attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return operation.call();
            } catch (Exception e) {
                lastException = e;
                
                if (!retryCondition.test(e)) {
                    throw e;  // Don't retry this error
                }
                
                if (attempt < maxRetries - 1) {
                    // Exponential backoff with jitter
                    long delay = Math.min(
                        (long) (baseDelayMs * Math.pow(2, attempt)),
                        maxDelayMs
                    );
                    delay = (long) (delay * (0.5 + Math.random()));
                    
                    System.out.printf("Attempt %d failed, retrying in %dms%n", 
                                     attempt + 1, delay);
                    Thread.sleep(delay);
                }
            }
        }
        
        throw lastException;
    }
    
    // Usage
    public static void main(String[] args) throws Exception {
        String result = retry(
            () -> fetchData("https://api.example.com"),
            3,      // maxRetries
            1000,   // baseDelayMs
            30000,  // maxDelayMs
            e -> e instanceof IOException || e instanceof TimeoutException
        );
    }
}
```

---

## 🔗 Retry + Circuit Breaker

Combine retry with circuit breaker to prevent overwhelming failing services.

```
┌──────────────────────────────────────────────────────────┐
│                     Request Flow                          │
│                                                          │
│  Client                                                  │
│    │                                                     │
│    ▼                                                     │
│  ┌─────────────────┐    ┌─────────────────┐             │
│  │  Retry Logic    │───▶│ Circuit Breaker │             │
│  │  (3 attempts)   │    │ (fail-fast if   │             │
│  │                 │    │  circuit open)  │             │
│  └─────────────────┘    └────────┬────────┘             │
│                                  │                       │
│                                  ▼                       │
│                         ┌───────────────┐               │
│                         │    Service    │               │
│                         └───────────────┘               │
└──────────────────────────────────────────────────────────┘
```

```javascript
class RetryWithCircuitBreaker {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelayMs = options.baseDelayMs || 1000;
    
    // Circuit breaker state
    this.failureCount = 0;
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeoutMs = options.resetTimeoutMs || 30000;
    this.circuitState = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.lastFailureTime = null;
  }
  
  async execute(fn) {
    // Check circuit breaker first
    if (this.circuitState === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.circuitState = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    // Retry logic
    let lastError;
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const result = await fn();
        this.onSuccess();
        return result;
      } catch (error) {
        lastError = error;
        this.onFailure();
        
        // If circuit opened, don't retry
        if (this.circuitState === 'OPEN') {
          throw new Error('Circuit breaker opened during retry');
        }
        
        if (attempt < this.maxRetries - 1) {
          const delay = this.baseDelayMs * Math.pow(2, attempt);
          await sleep(delay);
        }
      }
    }
    
    throw lastError;
  }
  
  onSuccess() {
    this.failureCount = 0;
    this.circuitState = 'CLOSED';
  }
  
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.circuitState = 'OPEN';
      console.log('Circuit breaker OPENED');
    }
  }
}

// Usage
const resilientClient = new RetryWithCircuitBreaker({
  maxRetries: 3,
  baseDelayMs: 1000,
  failureThreshold: 5,
  resetTimeoutMs: 30000
});

try {
  const result = await resilientClient.execute(() => fetchData(url));
} catch (error) {
  console.log('Request failed:', error.message);
}
```

---

## 📊 Retry Budget

Limit total retry attempts across all requests to prevent cascade failures.

```javascript
class RetryBudget {
  constructor(options = {}) {
    this.maxRetriesPerSecond = options.maxRetriesPerSecond || 10;
    this.retryTimestamps = [];
  }
  
  canRetry() {
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    
    // Remove old timestamps
    this.retryTimestamps = this.retryTimestamps.filter(t => t > oneSecondAgo);
    
    // Check if under budget
    return this.retryTimestamps.length < this.maxRetriesPerSecond;
  }
  
  recordRetry() {
    this.retryTimestamps.push(Date.now());
  }
  
  async executeWithBudget(fn, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries - 1) {
          if (!this.canRetry()) {
            console.log('Retry budget exhausted');
            throw error;
          }
          
          this.recordRetry();
          await sleep(1000 * Math.pow(2, attempt));
        }
      }
    }
    
    throw lastError;
  }
}
```

---

## ⚠️ Common Pitfalls

### 1. Retrying Non-Idempotent Operations

```javascript
// BAD: Creates duplicate payments!
async function chargeCustomer(amount) {
  return await retry(() => paymentApi.charge(amount));
}

// GOOD: Use idempotency key
async function chargeCustomer(paymentId, amount) {
  return await retry(() => 
    paymentApi.charge(amount, { idempotencyKey: paymentId })
  );
}
```

### 2. Retrying Non-Retryable Errors

```javascript
// BAD: Retrying authentication errors wastes time
async function fetchData() {
  return await retry(() => api.get('/data'));  // Will retry 401 errors!
}

// GOOD: Only retry transient errors
async function fetchData() {
  return await retry(
    () => api.get('/data'),
    { retryCondition: isTransientError }
  );
}

function isTransientError(error) {
  const status = error.response?.status;
  return !status || status >= 500 || status === 429 || status === 408;
}
```

### 3. No Maximum Delay Cap

```javascript
// BAD: Delay can grow indefinitely
const delay = baseDelay * Math.pow(2, attempt);  // 1s, 2s, 4s, 8s, 16s, 32s, 64s...

// GOOD: Cap maximum delay
const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
```

### 4. Ignoring Retry-After Header

```javascript
// GOOD: Respect server's retry-after header
async function fetchWithRetryAfter(url) {
  try {
    return await fetch(url);
  } catch (error) {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      if (retryAfter) {
        await sleep(parseInt(retryAfter) * 1000);
        return fetch(url);
      }
    }
    throw error;
  }
}
```

### 5. No Jitter (Thundering Herd)

```javascript
// BAD: All clients retry at exact same intervals
const delay = 1000 * Math.pow(2, attempt);  // All clients: 1s, 2s, 4s...

// GOOD: Add jitter to spread out retries
const delay = 1000 * Math.pow(2, attempt) * (0.5 + Math.random());
```

---

## 🎯 Best Practices

### 1. Choose Appropriate Strategy

| Scenario | Recommended Strategy |
|----------|---------------------|
| Database connections | Exponential backoff with jitter |
| API calls | Exponential backoff, respect Retry-After |
| Message queue | Fixed interval with DLQ |
| Microservices | Retry + Circuit breaker |

### 2. Log All Retries

```javascript
async function retryWithLogging(fn, options) {
  return retry(fn, {
    ...options,
    onRetry: (error, attempt, delay) => {
      logger.warn({
        message: 'Retry attempt',
        attempt,
        delay,
        error: error.message,
        stack: error.stack
      });
    }
  });
}
```

### 3. Set Timeout Per Attempt

```javascript
async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

// Retry with per-attempt timeout
const result = await retry(
  () => fetchWithTimeout(url, 5000),
  { maxRetries: 3 }
);
```

### 4. Monitor Retry Metrics

Key metrics to track:
- Retry rate (retries per second)
- Success rate after N retries
- Average retries before success
- Final failure rate

---

## 🔗 Related Patterns

| Pattern | Relationship |
|---------|--------------|
| **Circuit Breaker** | Prevents retries when service is down |
| **Timeout** | Limits how long each attempt waits |
| **Bulkhead** | Isolates retry resources |
| **Fallback** | Provides alternative when retries exhausted |
| **Idempotency** | Required for safe retries |

---

## 📝 Key Takeaways

1. **Use exponential backoff with jitter** - Prevents thundering herd
2. **Only retry transient failures** - Don't retry 4xx errors
3. **Operations must be idempotent** - Safe to repeat
4. **Set maximum retry limit** - Don't retry forever
5. **Cap maximum delay** - Don't wait too long
6. **Combine with circuit breaker** - Fail fast when service is down
7. **Respect Retry-After headers** - Server knows best
8. **Monitor and log retries** - Visibility into system health

---

## 🎯 Summary

The **Retry Pattern** is essential for handling transient failures:

- ✅ Handles temporary network issues
- ✅ Recovers from service restarts
- ✅ Manages rate limiting gracefully
- ✅ Improves system resilience

**Formula for good retry:**
```
Exponential Backoff + Jitter + Max Retries + Max Delay + Idempotency
```

---

**Date Created:** 2026-02-16  
**Pattern Type:** Resilience / Integration  
**Difficulty:** Intermediate  
**Related Patterns:** Circuit Breaker, Timeout, Bulkhead, Fallback

