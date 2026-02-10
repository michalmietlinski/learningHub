# Circuit Breaker Pattern - Deep Dive

## 📋 Learning Objectives

- [ ] Understand Circuit Breaker pattern definition and principles
- [ ] Learn the three states: Closed, Open, and Half-Open
- [ ] Master failure detection and threshold configuration
- [ ] Recognize when to use Circuit Breaker vs retry patterns
- [ ] Understand fallback strategies and graceful degradation
- [ ] Practice implementing Circuit Breaker in real scenarios
- [ ] Learn timeout management and failure counting strategies
- [ ] Explore real-world applications and use cases
- [ ] Understand common pitfalls and best practices
- [ ] Compare with related resilience patterns (Retry, Bulkhead, Timeout)

---

## 🎯 Definition

**Circuit Breaker** is a resilience pattern that prevents cascading failures in distributed systems by stopping requests to a failing service after a threshold of failures is reached. Like an electrical circuit breaker that trips to prevent damage, the software circuit breaker "opens" to protect the system from repeated failures.

**Origin:**
- Introduced by Michael Nygard in "Release It!" (2007)
- Inspired by electrical circuit breakers
- Response to cascading failure problems in distributed systems
- Popularized by Netflix's Hystrix library (2011)
- Foundation for modern resilience engineering
- Essential pattern in microservices architecture

**Key Principles:**
- **Fail Fast** - Don't wait for timeout when service is known to be down
- **Protect Resources** - Prevent resource exhaustion from waiting requests
- **Graceful Degradation** - Provide fallback responses when service is unavailable
- **Self-Healing** - Automatically recover when service becomes healthy
- **Transparency** - Make failure states visible for monitoring
- **Isolation** - Prevent failures from cascading to other services

**Key Principle:**
> "Circuit Breaker prevents an application from repeatedly trying to execute an operation that's likely to fail, allowing it to continue without waiting for the fault to be fixed or wasting CPU cycles while it determines the fault is long-lasting."

**Alternative Formulation:**
> "The Circuit Breaker pattern wraps a protected function call in a circuit breaker object, which monitors for failures. Once the failures reach a certain threshold, the circuit breaker trips, and all further calls to the circuit breaker return with an error or fallback, without the protected call being made at all."

---

## 🏗️ Structure

### Without Circuit Breaker

```
┌─────────────────────────────────────────────────────────────────┐
│                     Without Circuit Breaker                       │
│                                                                   │
│  ┌──────────────┐         ┌─────────────────┐                    │
│  │              │  calls  │    Service B    │                    │
│  │  Service A   │────────►│    (failing)    │                    │
│  │              │         │                 │                    │
│  └──────┬───────┘         └────────┬────────┘                    │
│         │                          │                             │
│         │                          │ timeout (30s)               │
│         │                          │ timeout (30s)               │
│         │                          │ timeout (30s)               │
│         │                          │ timeout (30s)               │
│         │                          ▼                             │
│         │                    ┌──────────┐                        │
│         └───────────────────►│  Thread  │ (blocked, waiting)     │
│                              │  Pool    │                        │
│                              │ Exhausted│                        │
│                              └──────────┘                        │
│                                                                   │
│  Problems:                                                        │
│  ❌ Resources blocked waiting for timeouts                       │
│  ❌ Thread pool exhaustion                                       │
│  ❌ Cascading failures to upstream services                      │
│  ❌ Slow recovery after service returns                          │
│  ❌ User experience degraded (long wait times)                   │
└─────────────────────────────────────────────────────────────────┘
```

### With Circuit Breaker

```
┌─────────────────────────────────────────────────────────────────┐
│                      With Circuit Breaker                         │
│                                                                   │
│  ┌──────────────┐    ┌───────────────────┐    ┌─────────────┐   │
│  │              │    │  Circuit Breaker   │    │  Service B  │   │
│  │  Service A   │───►│                    │───►│             │   │
│  │              │    │  State: CLOSED     │    │             │   │
│  └──────────────┘    └───────────────────┘    └─────────────┘   │
│                                                                   │
│        Normal Operation (CLOSED State)                           │
│        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                             │
│        Requests flow through, failures counted                   │
│                                                                   │
│                             │                                     │
│                             │ Threshold exceeded                  │
│                             ▼                                     │
│                                                                   │
│  ┌──────────────┐    ┌───────────────────┐                       │
│  │              │    │  Circuit Breaker   │    ┌─────────────┐   │
│  │  Service A   │───►│                    │ ╳ │  Service B  │   │
│  │              │    │  State: OPEN       │    │  (failing)  │   │
│  └──────┬───────┘    └───────────────────┘    └─────────────┘   │
│         │                     │                                   │
│         │                     ▼                                   │
│         │            ┌───────────────────┐                       │
│         └───────────►│  Fallback Response │ (immediate)          │
│                      │  or Error          │                       │
│                      └───────────────────┘                       │
│                                                                   │
│        Circuit Open (OPEN State)                                 │
│        ━━━━━━━━━━━━━━━━━━━━━━━━                                  │
│        Requests fail fast, no waiting                            │
│                                                                   │
│  Benefits:                                                        │
│  ✅ Fail fast - no resource blocking                             │
│  ✅ Prevent cascading failures                                   │
│  ✅ Allow service recovery time                                  │
│  ✅ Graceful degradation with fallbacks                          │
│  ✅ Self-healing when service recovers                           │
└─────────────────────────────────────────────────────────────────┘
```

### Circuit Breaker State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│                   Circuit Breaker States                          │
│                                                                   │
│     ┌─────────────────────────────────────────────────────┐      │
│     │                      CLOSED                          │      │
│     │                                                      │      │
│     │  • Requests flow through to service                 │      │
│     │  • Failures are counted                             │      │
│     │  • Success resets failure count                     │      │
│     │  • Threshold: N failures in time window             │      │
│     └──────────────────────┬──────────────────────────────┘      │
│                            │                                      │
│                            │ Failure threshold exceeded           │
│                            ▼                                      │
│     ┌─────────────────────────────────────────────────────┐      │
│     │                       OPEN                           │      │
│     │                                                      │      │
│     │  • Requests fail immediately (fast fail)            │      │
│     │  • No calls to service                              │      │
│     │  • Returns fallback or error                        │      │
│     │  • Timer starts for recovery check                  │      │
│     └──────────────────────┬──────────────────────────────┘      │
│                            │                                      │
│                            │ Timeout expires (recovery time)      │
│                            ▼                                      │
│     ┌─────────────────────────────────────────────────────┐      │
│     │                    HALF-OPEN                         │      │
│     │                                                      │      │
│     │  • Limited requests allowed through (probe)         │      │
│     │  • Tests if service has recovered                   │      │
│     │  • Success → Close circuit                          │      │
│     │  • Failure → Open circuit again                     │      │
│     └──────────────────────┬──────────────────────────────┘      │
│                            │                                      │
│              ┌─────────────┴─────────────┐                       │
│              │                           │                        │
│              ▼                           ▼                        │
│     ┌────────────────┐          ┌────────────────┐               │
│     │  Test SUCCESS  │          │  Test FAILURE  │               │
│     │  → CLOSED      │          │  → OPEN        │               │
│     └────────────────┘          └────────────────┘               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Circuit Breaker Timing Diagram

```
Requests ──►

Time ────────────────────────────────────────────────────────────►

│  CLOSED          │     OPEN        │ HALF-OPEN │   CLOSED
│                  │                 │           │
│ ✓ ✓ ✓ ✗ ✗ ✗ ✗ ✗ │  ✗ ✗ ✗ ✗ ✗ ✗  │    ✓      │  ✓ ✓ ✓ ✓
│  │ │ │ │ │ │ │ │ │  │ │ │ │ │ │   │    │      │  │ │ │ │
│  ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ │  │ │ │ │ │ │   │    │      │  ▼ ▼ ▼ ▼
│  S S S F F F F F │  F F F F F F   │    S      │  S S S S
│                  │  (fast fail)    │  (probe)  │
│  ◄─ failures ─►  │                 │           │
│     counted      │  ◄─ timeout ─►  │           │
│                  │                 │           │
│  Threshold = 5   │  Reset = 30s    │           │  Normal operation
│  failures        │                 │           │  resumes

Legend:
✓ = Request allowed
✗ = Request blocked/failed
S = Success
F = Failure
```

---

## 🔍 Core Concepts Deep Dive

### 1. Circuit Breaker States

**Definition:**
The Circuit Breaker has three states that control request flow based on the health of the downstream service.

#### State 1: CLOSED (Normal Operation)

```typescript
// CLOSED State behavior
class ClosedState {
  private failureCount = 0;
  private successCount = 0;
  private readonly failureThreshold: number;
  
  constructor(threshold: number) {
    this.failureThreshold = threshold;
  }

  async execute<T>(action: () => Promise<T>): Promise<T> {
    try {
      const result = await action(); // Execute the protected call
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0; // Reset on success
    this.successCount++;
  }

  private onFailure(): void {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      // Transition to OPEN state
      this.transitionToOpen();
    }
  }
}
```

**Characteristics:**
- All requests flow through to the service
- Failures are counted
- Successful calls reset failure count
- Monitors failure rate

#### State 2: OPEN (Failing Fast)

```typescript
// OPEN State behavior
class OpenState {
  private readonly openedAt: number;
  private readonly resetTimeout: number;

  constructor(resetTimeout: number) {
    this.openedAt = Date.now();
    this.resetTimeout = resetTimeout;
  }

  async execute<T>(fallback?: () => T): Promise<T> {
    // Check if timeout has expired
    if (this.shouldAttemptReset()) {
      // Transition to HALF-OPEN
      return this.transitionToHalfOpen();
    }

    // Fast fail - don't call the service
    if (fallback) {
      return fallback();
    }
    throw new CircuitBreakerOpenError('Circuit breaker is open');
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.openedAt >= this.resetTimeout;
  }
}
```

**Characteristics:**
- Requests fail immediately (no service call)
- Returns fallback or throws error
- Waits for reset timeout before recovery attempt
- Protects failing service from additional load

#### State 3: HALF-OPEN (Testing Recovery)

```typescript
// HALF-OPEN State behavior
class HalfOpenState {
  private readonly maxProbeRequests: number;
  private probeRequestCount = 0;
  private successCount = 0;
  private readonly successThreshold: number;

  constructor(successThreshold: number = 3, maxProbes: number = 5) {
    this.successThreshold = successThreshold;
    this.maxProbeRequests = maxProbes;
  }

  async execute<T>(action: () => Promise<T>): Promise<T> {
    if (this.probeRequestCount >= this.maxProbeRequests) {
      // Too many probes, back to OPEN
      throw new CircuitBreakerOpenError('Probe limit reached');
    }

    this.probeRequestCount++;

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.successCount++;
    if (this.successCount >= this.successThreshold) {
      // Service recovered - transition to CLOSED
      this.transitionToClosed();
    }
  }

  private onFailure(): void {
    // Service still failing - back to OPEN
    this.transitionToOpen();
  }
}
```

**Characteristics:**
- Limited requests allowed through
- Tests if service has recovered
- Success leads to CLOSED state
- Failure leads back to OPEN state

### 2. Failure Detection Strategies

**Definition:**
How the circuit breaker counts and interprets failures determines when to trip.

#### A. Consecutive Failure Count

```typescript
// Trip after N consecutive failures
class ConsecutiveFailureCounter {
  private consecutiveFailures = 0;
  private readonly threshold: number;

  constructor(threshold: number) {
    this.threshold = threshold;
  }

  recordSuccess(): void {
    this.consecutiveFailures = 0;
  }

  recordFailure(): boolean {
    this.consecutiveFailures++;
    return this.consecutiveFailures >= this.threshold;
  }
}

// Example: Trip after 5 consecutive failures
const counter = new ConsecutiveFailureCounter(5);
// ✓ ✓ ✓ ✗ ✗ ✗ ✗ ✗ → TRIP!
```

#### B. Failure Rate (Sliding Window)

```typescript
// Trip when failure rate exceeds threshold
class SlidingWindowFailureRate {
  private readonly windowSize: number;
  private readonly failureRateThreshold: number;
  private readonly requests: { success: boolean; timestamp: number }[] = [];

  constructor(windowSize: number, failureRateThreshold: number) {
    this.windowSize = windowSize; // in milliseconds
    this.failureRateThreshold = failureRateThreshold; // percentage
  }

  record(success: boolean): boolean {
    const now = Date.now();
    
    // Remove old entries outside window
    this.requests = this.requests.filter(
      r => now - r.timestamp < this.windowSize
    );
    
    this.requests.push({ success, timestamp: now });
    
    return this.shouldTrip();
  }

  private shouldTrip(): boolean {
    if (this.requests.length < 10) {
      return false; // Minimum sample size
    }

    const failures = this.requests.filter(r => !r.success).length;
    const failureRate = (failures / this.requests.length) * 100;
    
    return failureRate >= this.failureRateThreshold;
  }
}

// Example: Trip when >50% failure rate in 60 seconds
const rateCounter = new SlidingWindowFailureRate(60000, 50);
```

#### C. Count-Based Sliding Window

```typescript
// Trip based on last N requests
class CountBasedSlidingWindow {
  private readonly windowSize: number;
  private readonly failureThreshold: number;
  private readonly results: boolean[] = [];

  constructor(windowSize: number, failureThreshold: number) {
    this.windowSize = windowSize; // number of requests
    this.failureThreshold = failureThreshold; // number of failures
  }

  record(success: boolean): boolean {
    this.results.push(success);
    
    // Keep only last N requests
    if (this.results.length > this.windowSize) {
      this.results.shift();
    }
    
    return this.shouldTrip();
  }

  private shouldTrip(): boolean {
    if (this.results.length < this.windowSize) {
      return false;
    }

    const failures = this.results.filter(r => !r).length;
    return failures >= this.failureThreshold;
  }
}

// Example: Trip when 5+ failures in last 10 requests
const countWindow = new CountBasedSlidingWindow(10, 5);
```

### 3. Fallback Strategies

**Definition:**
Fallbacks provide alternative responses when the circuit is open or calls fail.

#### A. Default Value Fallback

```typescript
// Return a default value
async function getUserWithFallback(userId: string): Promise<User> {
  return await circuitBreaker.execute(
    () => userService.getUser(userId),
    () => ({
      // Default/cached user
      id: userId,
      name: 'Guest User',
      isDefault: true
    })
  );
}
```

#### B. Cache Fallback

```typescript
// Return cached data
class CacheFallbackCircuitBreaker {
  private cache = new Map<string, { data: any; timestamp: number }>();
  
  async execute<T>(
    key: string,
    action: () => Promise<T>,
    ttl: number = 300000
  ): Promise<T> {
    try {
      const result = await this.breaker.execute(action);
      // Cache successful result
      this.cache.set(key, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      // Return cached data if available
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data;
      }
      throw error;
    }
  }
}
```

#### C. Alternative Service Fallback

```typescript
// Try alternative service
async function getDataWithAlternative<T>(
  primaryService: () => Promise<T>,
  secondaryService: () => Promise<T>
): Promise<T> {
  try {
    return await primaryCircuitBreaker.execute(primaryService);
  } catch (error) {
    // Fallback to secondary service
    return await secondaryCircuitBreaker.execute(secondaryService);
  }
}

// Example
const data = await getDataWithAlternative(
  () => primaryApi.getData(),
  () => backupApi.getData()
);
```

#### D. Graceful Degradation Fallback

```typescript
// Degrade functionality gracefully
async function getProductRecommendations(userId: string): Promise<Product[]> {
  return await circuitBreaker.execute(
    // Primary: Personalized recommendations
    () => recommendationService.getPersonalized(userId),
    // Fallback: Popular products (degraded experience)
    () => productService.getPopular()
  );
}
```

### 4. Timeout Management

**Definition:**
Timeouts work with circuit breakers to prevent indefinite waiting.

```typescript
class TimeoutCircuitBreaker {
  private readonly timeout: number;
  
  constructor(timeout: number) {
    this.timeout = timeout;
  }

  async execute<T>(action: () => Promise<T>): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new TimeoutError(`Operation timed out after ${this.timeout}ms`));
      }, this.timeout);
    });

    try {
      // Race between action and timeout
      const result = await Promise.race([action(), timeoutPromise]);
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
}

// Usage
const breaker = new TimeoutCircuitBreaker(5000); // 5 second timeout
const result = await breaker.execute(() => httpClient.get('/api/data'));
```

### 5. What Counts as a Failure?

**Definition:**
Configuring which exceptions or responses trigger the circuit breaker.

```typescript
class ConfigurableCircuitBreaker {
  private readonly shouldCount: (error: Error) => boolean;

  constructor(config: {
    shouldCountAsFailure: (error: Error) => boolean;
  }) {
    this.shouldCount = config.shouldCountAsFailure;
  }

  async execute<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (error) {
      if (this.shouldCount(error)) {
        this.recordFailure();
      }
      throw error;
    }
  }
}

// Example configurations
const breaker = new ConfigurableCircuitBreaker({
  shouldCountAsFailure: (error) => {
    // Only count server errors, not client errors
    if (error instanceof HttpError) {
      return error.status >= 500; // 5xx errors
    }
    // Count timeouts
    if (error instanceof TimeoutError) {
      return true;
    }
    // Count connection errors
    if (error instanceof ConnectionError) {
      return true;
    }
    // Don't count validation errors (4xx)
    return false;
  }
});
```

---

## 💡 When to Use Circuit Breaker

### Use Circuit Breaker When:

✅ **Remote Service Calls**
- HTTP/REST API calls
- gRPC calls
- Database connections
- Message queue operations

✅ **Potential for Cascading Failures**
- Microservices architecture
- Distributed systems
- Service mesh
- API Gateway

✅ **Resource Protection Needed**
- Thread pool exhaustion
- Connection pool exhaustion
- Memory exhaustion
- CPU saturation

✅ **Transient Failures Expected**
- Network issues
- Service deployments
- Temporary overload
- Infrastructure problems

✅ **Graceful Degradation Possible**
- Fallback responses available
- Cached data acceptable
- Alternative services exist
- Degraded mode possible

### Don't Use Circuit Breaker When:

❌ **Local Operations**
- In-memory calculations
- File system operations
- Local database
- Synchronous operations

❌ **Non-Retryable Operations**
- Non-idempotent writes
- Financial transactions
- Order placement
- Critical data modifications

❌ **Immediate Failure Required**
- Security checks
- Authentication
- Authorization
- Validation

❌ **Simple Applications**
- Single service
- Monolithic architecture
- No external dependencies
- Low traffic

---

## 🏛️ Implementation Examples

### Example 1: Basic Circuit Breaker Implementation

```typescript
// Complete Circuit Breaker implementation
enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

interface CircuitBreakerConfig {
  failureThreshold: number;      // Failures before opening
  successThreshold: number;      // Successes to close from half-open
  timeout: number;               // Request timeout (ms)
  resetTimeout: number;          // Time before half-open (ms)
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private readonly config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold ?? 5,
      successThreshold: config.successThreshold ?? 3,
      timeout: config.timeout ?? 10000,
      resetTimeout: config.resetTimeout ?? 30000
    };
  }

  async execute<T>(
    action: () => Promise<T>,
    fallback?: () => T
  ): Promise<T> {
    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        console.log('Circuit transitioning to HALF_OPEN');
      } else {
        // Fast fail
        console.log('Circuit is OPEN - fast failing');
        if (fallback) {
          return fallback();
        }
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(action);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }

  private async executeWithTimeout<T>(action: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, this.config.timeout);

      action()
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      console.log(`HALF_OPEN success: ${this.successCount}/${this.config.successThreshold}`);
      
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        console.log('Circuit CLOSED - service recovered');
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    console.log(`Failure count: ${this.failureCount}/${this.config.failureThreshold}`);

    if (this.state === CircuitState.HALF_OPEN) {
      // Single failure in half-open goes back to open
      this.state = CircuitState.OPEN;
      console.log('Circuit OPEN - probe failed');
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      console.log('Circuit OPEN - threshold exceeded');
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true;
    return Date.now() - this.lastFailureTime >= this.config.resetTimeout;
  }

  getState(): CircuitState {
    return this.state;
  }
}

// Usage
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 5000,
  resetTimeout: 30000
});

async function callExternalService() {
  return await breaker.execute(
    () => fetch('https://api.example.com/data').then(r => r.json()),
    () => ({ fallback: true, data: [] })
  );
}
```

### Example 2: Circuit Breaker with Metrics

```typescript
// Circuit Breaker with monitoring
interface CircuitBreakerMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rejectedRequests: number;
  currentState: CircuitState;
  lastStateChange: Date | null;
  averageResponseTime: number;
}

class MonitoredCircuitBreaker {
  private breaker: CircuitBreaker;
  private metrics: CircuitBreakerMetrics;
  private responseTimes: number[] = [];

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.breaker = new CircuitBreaker(config);
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rejectedRequests: 0,
      currentState: CircuitState.CLOSED,
      lastStateChange: null,
      averageResponseTime: 0
    };
  }

  async execute<T>(
    action: () => Promise<T>,
    fallback?: () => T
  ): Promise<T> {
    this.metrics.totalRequests++;
    const previousState = this.breaker.getState();
    const startTime = Date.now();

    try {
      const result = await this.breaker.execute(action, fallback);
      
      const responseTime = Date.now() - startTime;
      this.recordResponseTime(responseTime);
      this.metrics.successfulRequests++;
      
      return result;
    } catch (error) {
      if ((error as Error).message === 'Circuit breaker is open') {
        this.metrics.rejectedRequests++;
      } else {
        this.metrics.failedRequests++;
      }
      throw error;
    } finally {
      // Track state changes
      const currentState = this.breaker.getState();
      if (currentState !== previousState) {
        this.metrics.currentState = currentState;
        this.metrics.lastStateChange = new Date();
        this.emitStateChange(previousState, currentState);
      }
    }
  }

  private recordResponseTime(time: number): void {
    this.responseTimes.push(time);
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }
    this.metrics.averageResponseTime = 
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }

  private emitStateChange(from: CircuitState, to: CircuitState): void {
    console.log(`Circuit state changed: ${from} → ${to}`);
    // Emit event for monitoring systems
    // eventEmitter.emit('circuit-state-change', { from, to, timestamp: new Date() });
  }

  getMetrics(): CircuitBreakerMetrics {
    return { ...this.metrics };
  }

  getHealthStatus(): string {
    const state = this.breaker.getState();
    const failureRate = this.metrics.totalRequests > 0
      ? (this.metrics.failedRequests / this.metrics.totalRequests) * 100
      : 0;

    return JSON.stringify({
      state,
      failureRate: `${failureRate.toFixed(2)}%`,
      averageResponseTime: `${this.metrics.averageResponseTime.toFixed(2)}ms`,
      totalRequests: this.metrics.totalRequests,
      rejectedRequests: this.metrics.rejectedRequests
    }, null, 2);
  }
}
```

### Example 3: Circuit Breaker Registry

```typescript
// Manage multiple circuit breakers
class CircuitBreakerRegistry {
  private breakers = new Map<string, MonitoredCircuitBreaker>();
  private defaultConfig: Partial<CircuitBreakerConfig>;

  constructor(defaultConfig: Partial<CircuitBreakerConfig> = {}) {
    this.defaultConfig = defaultConfig;
  }

  getBreaker(
    name: string,
    config?: Partial<CircuitBreakerConfig>
  ): MonitoredCircuitBreaker {
    if (!this.breakers.has(name)) {
      const breakerConfig = { ...this.defaultConfig, ...config };
      this.breakers.set(name, new MonitoredCircuitBreaker(breakerConfig));
    }
    return this.breakers.get(name)!;
  }

  getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {};
    for (const [name, breaker] of this.breakers) {
      metrics[name] = breaker.getMetrics();
    }
    return metrics;
  }

  getHealthReport(): string {
    const report: Record<string, any> = {};
    for (const [name, breaker] of this.breakers) {
      report[name] = JSON.parse(breaker.getHealthStatus());
    }
    return JSON.stringify(report, null, 2);
  }
}

// Usage
const registry = new CircuitBreakerRegistry({
  failureThreshold: 5,
  timeout: 5000,
  resetTimeout: 30000
});

// Get or create breakers for different services
const userServiceBreaker = registry.getBreaker('user-service');
const orderServiceBreaker = registry.getBreaker('order-service', {
  failureThreshold: 3,  // More sensitive
  timeout: 3000
});
const paymentServiceBreaker = registry.getBreaker('payment-service', {
  failureThreshold: 2,  // Very sensitive for payments
  resetTimeout: 60000   // Longer reset time
});

// Check health of all circuits
console.log(registry.getHealthReport());
```

### Example 4: Express.js Middleware

```typescript
// Circuit Breaker middleware for Express
import express from 'express';

function circuitBreakerMiddleware(
  registry: CircuitBreakerRegistry
): express.RequestHandler {
  return (req, res, next) => {
    // Attach circuit breaker execution helper to request
    req.executeWithBreaker = async <T>(
      serviceName: string,
      action: () => Promise<T>,
      fallback?: () => T
    ): Promise<T> => {
      const breaker = registry.getBreaker(serviceName);
      return breaker.execute(action, fallback);
    };
    next();
  };
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      executeWithBreaker: <T>(
        serviceName: string,
        action: () => Promise<T>,
        fallback?: () => T
      ) => Promise<T>;
    }
  }
}

// Usage in routes
const app = express();
app.use(circuitBreakerMiddleware(registry));

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await req.executeWithBreaker(
      'user-service',
      () => userService.getUser(req.params.id),
      () => ({ id: req.params.id, name: 'Unknown', cached: true })
    );
    res.json(user);
  } catch (error) {
    res.status(503).json({ error: 'Service temporarily unavailable' });
  }
});

// Health check endpoint
app.get('/health/circuits', (req, res) => {
  res.json(JSON.parse(registry.getHealthReport()));
});
```

### Example 5: Decorator Pattern Implementation

```typescript
// TypeScript decorator for circuit breaker
function CircuitBreakerDecorator(
  breakerName: string,
  fallbackMethod?: string
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const breaker = registry.getBreaker(breakerName);
      
      const action = () => originalMethod.apply(this, args);
      const fallback = fallbackMethod 
        ? () => (this as any)[fallbackMethod](...args)
        : undefined;

      return breaker.execute(action, fallback);
    };

    return descriptor;
  };
}

// Usage with decorators
class UserService {
  @CircuitBreakerDecorator('user-service', 'getUserFallback')
  async getUser(userId: string): Promise<User> {
    const response = await fetch(`http://user-api/users/${userId}`);
    return response.json();
  }

  async getUserFallback(userId: string): Promise<User> {
    // Return cached or default user
    return {
      id: userId,
      name: 'Guest User',
      email: 'guest@example.com',
      isFallback: true
    };
  }

  @CircuitBreakerDecorator('recommendation-service')
  async getRecommendations(userId: string): Promise<Product[]> {
    const response = await fetch(`http://rec-api/users/${userId}/recommendations`);
    return response.json();
  }
}
```

### Example 6: Using Opossum (Node.js Library)

```typescript
// Using Opossum - popular Node.js circuit breaker
import CircuitBreaker from 'opossum';

// Create circuit breaker
const breakerOptions = {
  timeout: 3000,              // Request timeout
  errorThresholdPercentage: 50, // Error rate to trip
  resetTimeout: 30000,        // Time before half-open
  volumeThreshold: 10,        // Minimum requests before tripping
  rollingCountTimeout: 10000, // Stats window
  rollingCountBuckets: 10     // Number of buckets for stats
};

// Wrap async function
async function fetchUserData(userId: string) {
  const response = await fetch(`https://api.example.com/users/${userId}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

const userBreaker = new CircuitBreaker(fetchUserData, breakerOptions);

// Event handlers
userBreaker.on('success', (result) => {
  console.log('Request succeeded:', result);
});

userBreaker.on('timeout', () => {
  console.log('Request timed out');
});

userBreaker.on('reject', () => {
  console.log('Request rejected - circuit open');
});

userBreaker.on('open', () => {
  console.log('Circuit opened!');
});

userBreaker.on('halfOpen', () => {
  console.log('Circuit half-opened - testing recovery');
});

userBreaker.on('close', () => {
  console.log('Circuit closed - service recovered');
});

userBreaker.on('fallback', (result) => {
  console.log('Fallback returned:', result);
});

// Set fallback
userBreaker.fallback((userId: string) => ({
  id: userId,
  name: 'Cached User',
  isFallback: true
}));

// Usage
async function getUser(userId: string) {
  try {
    return await userBreaker.fire(userId);
  } catch (error) {
    console.error('Failed to get user:', error);
    throw error;
  }
}

// Get circuit stats
console.log(userBreaker.stats);
// {
//   failures: 3,
//   fallbacks: 2,
//   successes: 97,
//   rejects: 5,
//   fires: 105,
//   timeouts: 1,
//   cacheHits: 0,
//   cacheMisses: 0,
//   semaphoreRejections: 0,
//   percentiles: { ... }
// }
```

### Example 7: Resilience4j Style (TypeScript)

```typescript
// Resilience4j-inspired implementation
interface CircuitBreakerConfig {
  failureRateThreshold: number;
  minimumNumberOfCalls: number;
  slidingWindowSize: number;
  slidingWindowType: 'COUNT_BASED' | 'TIME_BASED';
  waitDurationInOpenState: number;
  permittedNumberOfCallsInHalfOpenState: number;
  automaticTransitionFromOpenToHalfOpenEnabled: boolean;
  recordExceptions: (new (...args: any[]) => Error)[];
  ignoreExceptions: (new (...args: any[]) => Error)[];
}

class Resilience4jStyleCircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitState = CircuitState.CLOSED;
  private slidingWindow: { success: boolean; timestamp: number }[] = [];
  private halfOpenCalls = 0;
  private lastOpenedTime: number | null = null;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureRateThreshold: config.failureRateThreshold ?? 50,
      minimumNumberOfCalls: config.minimumNumberOfCalls ?? 10,
      slidingWindowSize: config.slidingWindowSize ?? 100,
      slidingWindowType: config.slidingWindowType ?? 'COUNT_BASED',
      waitDurationInOpenState: config.waitDurationInOpenState ?? 60000,
      permittedNumberOfCallsInHalfOpenState: 
        config.permittedNumberOfCallsInHalfOpenState ?? 10,
      automaticTransitionFromOpenToHalfOpenEnabled:
        config.automaticTransitionFromOpenToHalfOpenEnabled ?? true,
      recordExceptions: config.recordExceptions ?? [Error],
      ignoreExceptions: config.ignoreExceptions ?? []
    };
  }

  async execute<T>(action: () => Promise<T>): Promise<T> {
    this.checkStateTransition();

    if (this.state === CircuitState.OPEN) {
      throw new CircuitBreakerOpenException(
        `CircuitBreaker is OPEN and does not permit further calls`
      );
    }

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.halfOpenCalls >= this.config.permittedNumberOfCallsInHalfOpenState) {
        throw new CircuitBreakerOpenException(
          `CircuitBreaker is HALF_OPEN and max calls reached`
        );
      }
      this.halfOpenCalls++;
    }

    try {
      const result = await action();
      this.recordSuccess();
      return result;
    } catch (error) {
      if (this.shouldRecordException(error as Error)) {
        this.recordFailure();
      }
      throw error;
    }
  }

  private checkStateTransition(): void {
    if (
      this.state === CircuitState.OPEN &&
      this.config.automaticTransitionFromOpenToHalfOpenEnabled &&
      this.lastOpenedTime &&
      Date.now() - this.lastOpenedTime >= this.config.waitDurationInOpenState
    ) {
      this.transitionToHalfOpen();
    }
  }

  private recordSuccess(): void {
    this.slidingWindow.push({ success: true, timestamp: Date.now() });
    this.trimSlidingWindow();

    if (this.state === CircuitState.HALF_OPEN) {
      const recentSuccesses = this.getRecentResults().filter(r => r.success).length;
      if (recentSuccesses >= this.config.permittedNumberOfCallsInHalfOpenState) {
        this.transitionToClosed();
      }
    }
  }

  private recordFailure(): void {
    this.slidingWindow.push({ success: false, timestamp: Date.now() });
    this.trimSlidingWindow();

    if (this.state === CircuitState.HALF_OPEN) {
      this.transitionToOpen();
      return;
    }

    const results = this.getRecentResults();
    if (results.length >= this.config.minimumNumberOfCalls) {
      const failureRate = this.calculateFailureRate(results);
      if (failureRate >= this.config.failureRateThreshold) {
        this.transitionToOpen();
      }
    }
  }

  private calculateFailureRate(results: { success: boolean }[]): number {
    const failures = results.filter(r => !r.success).length;
    return (failures / results.length) * 100;
  }

  private getRecentResults(): { success: boolean; timestamp: number }[] {
    if (this.config.slidingWindowType === 'COUNT_BASED') {
      return this.slidingWindow.slice(-this.config.slidingWindowSize);
    } else {
      const windowStart = Date.now() - this.config.slidingWindowSize;
      return this.slidingWindow.filter(r => r.timestamp >= windowStart);
    }
  }

  private trimSlidingWindow(): void {
    if (this.config.slidingWindowType === 'COUNT_BASED') {
      while (this.slidingWindow.length > this.config.slidingWindowSize * 2) {
        this.slidingWindow.shift();
      }
    } else {
      const windowStart = Date.now() - this.config.slidingWindowSize * 2;
      this.slidingWindow = this.slidingWindow.filter(
        r => r.timestamp >= windowStart
      );
    }
  }

  private transitionToOpen(): void {
    this.state = CircuitState.OPEN;
    this.lastOpenedTime = Date.now();
    console.log('Circuit Breaker transitioned to OPEN');
  }

  private transitionToHalfOpen(): void {
    this.state = CircuitState.HALF_OPEN;
    this.halfOpenCalls = 0;
    console.log('Circuit Breaker transitioned to HALF_OPEN');
  }

  private transitionToClosed(): void {
    this.state = CircuitState.CLOSED;
    this.slidingWindow = [];
    this.halfOpenCalls = 0;
    console.log('Circuit Breaker transitioned to CLOSED');
  }

  private shouldRecordException(error: Error): boolean {
    for (const ExceptionClass of this.config.ignoreExceptions) {
      if (error instanceof ExceptionClass) return false;
    }
    for (const ExceptionClass of this.config.recordExceptions) {
      if (error instanceof ExceptionClass) return true;
    }
    return false;
  }

  getState(): CircuitState {
    return this.state;
  }

  getMetrics() {
    const results = this.getRecentResults();
    return {
      state: this.state,
      failureRate: this.calculateFailureRate(results),
      numberOfCalls: results.length,
      numberOfFailedCalls: results.filter(r => !r.success).length,
      numberOfSuccessfulCalls: results.filter(r => r.success).length
    };
  }
}

class CircuitBreakerOpenException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerOpenException';
  }
}
```

---

## ⚠️ Common Pitfalls

### 1. Wrong Failure Threshold

**Problem:** Threshold too high or too low for the use case.

**❌ Wrong:**

```typescript
// Too high - circuit never trips, cascading failures occur
const breaker = new CircuitBreaker({
  failureThreshold: 1000, // Way too high
  resetTimeout: 30000
});

// Too low - circuit trips on minor issues
const sensitiveBreaker = new CircuitBreaker({
  failureThreshold: 1, // Too sensitive
  resetTimeout: 30000
});
```

**✅ Correct:**

```typescript
// Appropriate thresholds based on context
const breaker = new CircuitBreaker({
  failureThreshold: 5,        // Reasonable for most services
  resetTimeout: 30000
});

// More sensitive for critical services
const criticalBreaker = new CircuitBreaker({
  failureThreshold: 3,        // Lower threshold
  resetTimeout: 60000         // Longer recovery
});

// Less sensitive for non-critical services
const nonCriticalBreaker = new CircuitBreaker({
  failureThreshold: 10,       // Higher threshold
  resetTimeout: 15000         // Shorter recovery
});
```

**Solution:**
- Analyze historical failure patterns
- Start conservative, tune based on metrics
- Different thresholds for different services
- Consider failure rate vs count

### 2. Missing Fallback Handling

**Problem:** No fallback when circuit is open, causing user-facing errors.

**❌ Wrong:**

```typescript
// No fallback - users see raw errors
async function getProducts(): Promise<Product[]> {
  return await circuitBreaker.execute(
    () => productService.getProducts()
    // No fallback!
  );
}

// User sees: "Circuit breaker is open"
```

**✅ Correct:**

```typescript
// Graceful fallback
async function getProducts(): Promise<Product[]> {
  return await circuitBreaker.execute(
    () => productService.getProducts(),
    // Fallback: cached products
    () => cachedProductService.getProducts()
  );
}

// Or with degraded experience
async function getRecommendations(userId: string): Promise<Product[]> {
  return await circuitBreaker.execute(
    () => recommendationService.getPersonalized(userId),
    // Fallback: show popular products instead
    () => productService.getPopular()
  );
}
```

**Solution:**
- Always provide meaningful fallbacks
- Use cached data when possible
- Degrade gracefully (reduced functionality)
- Return empty results instead of errors when appropriate

### 3. Not Considering What Counts as Failure

**Problem:** All exceptions trigger the circuit breaker.

**❌ Wrong:**

```typescript
// Everything counts as failure
async execute(action) {
  try {
    return await action();
  } catch (error) {
    this.failureCount++; // ALL errors count
    throw error;
  }
}

// 404 Not Found → failure (wrong!)
// 400 Bad Request → failure (wrong!)
// 500 Internal Error → failure (correct)
```

**✅ Correct:**

```typescript
// Only count relevant failures
async execute(action) {
  try {
    return await action();
  } catch (error) {
    if (this.shouldCountAsFailure(error)) {
      this.failureCount++;
    }
    throw error;
  }
}

shouldCountAsFailure(error: Error): boolean {
  if (error instanceof HttpError) {
    // Only server errors (5xx) indicate service problems
    return error.status >= 500;
  }
  if (error instanceof TimeoutError) {
    return true; // Timeouts indicate problems
  }
  if (error instanceof NetworkError) {
    return true; // Network issues indicate problems
  }
  // Client errors (4xx) don't indicate service problems
  return false;
}
```

**Solution:**
- Configure which exceptions count
- Distinguish client vs server errors
- Count timeouts and connection errors
- Ignore validation/authentication errors

### 4. Forgetting the Half-Open State

**Problem:** Going directly from OPEN to CLOSED without testing.

**❌ Wrong:**

```typescript
// Missing half-open state
if (this.state === 'OPEN' && this.shouldReset()) {
  this.state = 'CLOSED'; // Directly to closed!
  // If service is still down, flood of failures
}
```

**✅ Correct:**

```typescript
// Proper state transitions
if (this.state === 'OPEN' && this.shouldReset()) {
  this.state = 'HALF_OPEN'; // Test first
  this.probeCount = 0;
}

// In HALF_OPEN
if (this.state === 'HALF_OPEN') {
  if (success) {
    this.successCount++;
    if (this.successCount >= this.successThreshold) {
      this.state = 'CLOSED'; // Service recovered
    }
  } else {
    this.state = 'OPEN'; // Back to open
    this.resetTimer();
  }
}
```

**Solution:**
- Always implement half-open state
- Limit probe requests in half-open
- Require multiple successes to close
- Single failure returns to open

### 5. Same Configuration for All Services

**Problem:** Using identical settings for all circuit breakers.

**❌ Wrong:**

```typescript
// Same config for everything
const defaultConfig = {
  failureThreshold: 5,
  timeout: 5000,
  resetTimeout: 30000
};

const userBreaker = new CircuitBreaker(defaultConfig);
const paymentBreaker = new CircuitBreaker(defaultConfig);  // Should be different!
const analyticsBreaker = new CircuitBreaker(defaultConfig); // Should be different!
```

**✅ Correct:**

```typescript
// Service-specific configuration
const userBreaker = new CircuitBreaker({
  failureThreshold: 5,
  timeout: 5000,
  resetTimeout: 30000
});

// Critical payment service - more sensitive
const paymentBreaker = new CircuitBreaker({
  failureThreshold: 2,
  timeout: 10000,     // Longer timeout for payments
  resetTimeout: 60000 // Longer recovery
});

// Non-critical analytics - less sensitive
const analyticsBreaker = new CircuitBreaker({
  failureThreshold: 10,
  timeout: 3000,
  resetTimeout: 15000
});
```

**Solution:**
- Tune thresholds per service
- Consider service criticality
- Adjust timeouts based on expected latency
- Configure reset times based on recovery patterns

---

## ✅ Best Practices

### 1. Configuration

✅ **Do:**
- Set appropriate thresholds based on traffic
- Use percentage-based failure rates for high traffic
- Configure different settings per service
- Document threshold decisions

❌ **Don't:**
- Use same config for all services
- Set thresholds without data
- Ignore traffic volume
- Skip threshold documentation

### 2. Fallbacks

✅ **Do:**
- Provide meaningful fallback responses
- Use cached data when available
- Degrade gracefully
- Log fallback activations

❌ **Don't:**
- Return raw errors to users
- Skip fallback implementation
- Use stale data without indication
- Ignore fallback metrics

### 3. Monitoring

✅ **Do:**
- Monitor circuit state changes
- Track failure rates and patterns
- Alert on frequent trips
- Analyze recovery times

❌ **Don't:**
- Deploy without monitoring
- Ignore circuit events
- Skip alerting setup
- Neglect metrics analysis

### 4. Testing

✅ **Do:**
- Test all three states
- Verify fallback behavior
- Test state transitions
- Simulate failures in staging

❌ **Don't:**
- Skip circuit breaker testing
- Test only happy path
- Ignore edge cases
- Deploy without failure testing

### 5. Integration

✅ **Do:**
- Combine with retries (retry before trip)
- Use with timeouts
- Implement bulkhead pattern
- Consider service mesh integration

❌ **Don't:**
- Replace retries with circuit breaker
- Ignore timeout configuration
- Skip resource isolation
- Duplicate functionality

---

## 🔀 Circuit Breaker vs Related Patterns

### Circuit Breaker vs Retry

**Circuit Breaker:**
- Prevents calls to failing service
- State-based (open/closed)
- Protects system resources
- Fast fail when service down

**Retry:**
- Retries failed requests
- Stateless
- Handles transient failures
- Persists on errors

**When to Use:**
- **Circuit Breaker:** Service is down, prevent resource exhaustion
- **Retry:** Transient errors, intermittent failures
- **Both:** Retry first, trip circuit after repeated failures

```typescript
// Combining Retry and Circuit Breaker
async function callService() {
  return await circuitBreaker.execute(
    () => retry(
      () => service.call(),
      { retries: 3, delay: 1000 }
    )
  );
}
// Retry handles transient failures
// Circuit breaker prevents overload when service is down
```

### Circuit Breaker vs Bulkhead

**Circuit Breaker:**
- Stops calls to failing service
- Based on failure rate
- Binary state (allow/deny)
- Service-level protection

**Bulkhead:**
- Limits concurrent calls
- Based on resource limits
- Gradual degradation
- Resource-level protection

**When to Use:**
- **Circuit Breaker:** Service failures
- **Bulkhead:** Resource exhaustion, isolation
- **Both:** Often used together

```typescript
// Combining Bulkhead and Circuit Breaker
class ResilientService {
  private bulkhead = new Bulkhead({ maxConcurrent: 10 });
  private circuitBreaker = new CircuitBreaker();

  async call() {
    return await this.bulkhead.execute(
      () => this.circuitBreaker.execute(
        () => service.call()
      )
    );
  }
}
```

### Circuit Breaker vs Timeout

**Circuit Breaker:**
- Prevents calls based on history
- State-based decision
- Applies to service
- Protects from cascading failures

**Timeout:**
- Limits wait time per call
- Per-request limit
- Applies to operation
- Protects from hanging

**When to Use:**
- **Circuit Breaker:** Service-level protection
- **Timeout:** Request-level protection
- **Both:** Timeout feeds circuit breaker

```typescript
// Timeout integrated with Circuit Breaker
class TimeoutCircuitBreaker {
  async execute(action, timeout = 5000) {
    try {
      const result = await Promise.race([
        action(),
        this.createTimeout(timeout)
      ]);
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }
}
```

---

## 🌍 Real-World Applications

### 1. E-Commerce Platform

**Use Case:** Protect checkout flow from failing payment service.

```typescript
// Payment service circuit breaker
const paymentBreaker = new CircuitBreaker({
  failureThreshold: 2,      // Very sensitive
  timeout: 15000,           // Payment takes time
  resetTimeout: 120000      // Long recovery
});

async function processPayment(order: Order): Promise<PaymentResult> {
  return await paymentBreaker.execute(
    () => paymentService.process(order),
    // Fallback: Queue for later processing
    () => {
      paymentQueue.enqueue(order);
      return {
        status: 'pending',
        message: 'Payment queued for processing'
      };
    }
  );
}
```

### 2. Social Media Feed

**Use Case:** Handle recommendation service failures gracefully.

```typescript
// Recommendation service circuit breaker
const recBreaker = new CircuitBreaker({
  failureThreshold: 5,
  timeout: 2000,
  resetTimeout: 30000
});

async function getFeed(userId: string): Promise<Post[]> {
  try {
    // Try personalized feed
    const recommendations = await recBreaker.execute(
      () => recommendationService.getPersonalized(userId)
    );
    return recommendations;
  } catch (error) {
    // Fallback to chronological feed
    return await postService.getRecent();
  }
}
```

### 3. API Gateway

**Use Case:** Protect gateway from failing downstream services.

```typescript
// Per-service circuit breakers in gateway
class APIGateway {
  private breakers = new CircuitBreakerRegistry();

  async routeRequest(service: string, request: Request): Promise<Response> {
    const breaker = this.breakers.getBreaker(service);
    
    return await breaker.execute(
      () => this.forwardToService(service, request),
      () => this.getCachedResponse(service, request)
    );
  }
}
```

### 4. Microservices Communication

**Use Case:** Prevent cascading failures across services.

```typescript
// Service-to-service communication
class OrderService {
  private inventoryBreaker = new CircuitBreaker();
  private shippingBreaker = new CircuitBreaker();

  async createOrder(order: Order): Promise<OrderResult> {
    // Check inventory
    const available = await this.inventoryBreaker.execute(
      () => inventoryService.check(order.items),
      () => this.getCachedInventory(order.items)
    );

    if (!available) {
      throw new OutOfStockError();
    }

    // Schedule shipping
    const shipping = await this.shippingBreaker.execute(
      () => shippingService.schedule(order),
      () => ({ status: 'pending', estimatedDate: null })
    );

    return { order, shipping };
  }
}
```

---

## 📊 Benefits and Trade-offs

### Benefits

✅ **Fail Fast**
- No waiting for timeouts
- Quick error responses
- Better user experience
- Reduced latency during failures

✅ **Prevent Cascading Failures**
- Stop failure propagation
- Protect upstream services
- Maintain system stability
- Isolate failing components

✅ **Graceful Degradation**
- Fallback responses
- Cached data usage
- Reduced functionality
- Better than complete failure

✅ **Self-Healing**
- Automatic recovery
- No manual intervention
- Half-open probing
- Gradual traffic restoration

✅ **Resource Protection**
- Prevent thread exhaustion
- Protect connection pools
- Reduce CPU waste
- Memory protection

### Trade-offs

❌ **Complexity**
- Additional code
- State management
- Configuration tuning
- Testing requirements

❌ **Configuration Challenges**
- Finding right thresholds
- Service-specific tuning
- Ongoing adjustment
- Threshold drift

❌ **Potential for False Positives**
- Trip on temporary issues
- Block healthy requests
- Premature circuit opening
- Aggressive thresholds

❌ **Monitoring Overhead**
- Additional metrics
- State tracking
- Alert management
- Dashboard maintenance

---

## 🎓 Summary

### Key Takeaways

1. **Circuit Breaker** prevents cascading failures by stopping calls to failing services
2. **Three states:** CLOSED (normal), OPEN (failing fast), HALF-OPEN (testing)
3. **Fail fast** when service is known to be down
4. **Fallbacks** provide graceful degradation
5. **Configuration** should be tuned per service
6. **Monitoring** is essential for production systems

### When to Use

✅ **Use Circuit Breaker When:**
- Remote service calls
- Potential for cascading failures
- Resource protection needed
- Graceful degradation possible
- Transient failures expected

❌ **Avoid Circuit Breaker When:**
- Local operations
- Non-retryable operations
- Immediate failure required
- Simple applications

### Best Practices

- Configure appropriate thresholds per service
- Always provide meaningful fallbacks
- Monitor circuit state changes
- Test all three states
- Combine with retry, timeout, and bulkhead patterns
- Use percentage-based failure rates for high traffic

### Next Steps

After mastering Circuit Breaker Pattern, consider:
- **[Retry Pattern](./2026-XX-XX-retry-pattern.md)** - Handle transient failures
- **[Bulkhead Pattern](./2026-XX-XX-bulkhead-pattern.md)** - Resource isolation
- **[Timeout Pattern](./2026-XX-XX-timeout-pattern.md)** - Request timeouts
- **[Service Mesh](./2026-02-10-service-mesh.md)** - Infrastructure-level resilience
- **[API Gateway Pattern](./2026-02-05-api-gateway-pattern.md)** - Centralized service access

---

## 📚 Additional Resources

**Original Sources:**
- Michael Nygard - "Release It!" (2007)
- Martin Fowler - "Circuit Breaker" article (2014)
- Netflix Hystrix documentation
- Microsoft Azure Architecture Patterns

**Related Patterns:**
- [API Gateway Pattern](./2026-02-05-api-gateway-pattern.md) - Single entry point
- [Service Mesh](./2026-02-10-service-mesh.md) - Service-to-service communication
- [Microservices Architecture](./2026-01-24-microservices-architecture.md) - Distributed systems
- [Event-Driven Architecture](./2026-01-27-event-driven-architecture.md) - Asynchronous communication

**Books:**
- "Release It!" by Michael Nygard
- "Building Microservices" by Sam Newman
- "Designing Data-Intensive Applications" by Martin Kleppmann
- "Microservices Patterns" by Chris Richardson

**Libraries:**
- **Node.js:** Opossum, Brakes
- **Java:** Resilience4j, Hystrix (deprecated)
- **.NET:** Polly
- **Go:** gobreaker, hystrix-go
- **Python:** pybreaker, circuitbreaker

---

*Last Updated: 2026-02-11*
*Status: Complete*

