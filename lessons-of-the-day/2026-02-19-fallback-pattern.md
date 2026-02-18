# Fallback Pattern

## 📋 Learning Objectives

- [ ] Understand the fallback pattern and graceful degradation
- [ ] Learn different fallback strategies
- [ ] Master fallback implementation techniques
- [ ] Understand when to use which fallback type
- [ ] Combine fallback with other resilience patterns
- [ ] Design effective fallback hierarchies

---

## 🎯 Definition

The **Fallback Pattern** provides an alternative response or behavior when a primary operation fails. Instead of propagating failures to users, the system degrades gracefully by returning cached data, default values, or alternative service responses.

**Key Principle:**
> "Something is better than nothing" - Provide degraded functionality rather than complete failure.

---

## 🏗️ Core Concepts

### Without Fallback

```
Client                          Service
  │                                │
  │──── Request ──────────────────▶│
  │                                │ ❌ FAILURE
  │◀─── 500 Error ─────────────────│
  │                                │
  │     😢 User sees error         │
  ▼                                ▼
```

### With Fallback

```
Client                          Service              Fallback
  │                                │                    │
  │──── Request ──────────────────▶│                    │
  │                                │ ❌ FAILURE         │
  │                                │                    │
  │                          ┌─────┴─────┐             │
  │                          │ Try       │             │
  │                          │ Fallback  │────────────▶│
  │                          └───────────┘             │
  │                                                    │
  │◀─────────────── Fallback Response ─────────────────│
  │                                                    │
  │     😊 User gets something useful                  │
  ▼                                                    ▼
```

---

## 📊 Fallback Strategies

### 1. Static Default Value

Return a hardcoded default when the primary fails.

```javascript
async function getUserPreferences(userId) {
  try {
    return await preferencesService.get(userId);
  } catch (error) {
    // Return sensible defaults
    return {
      theme: 'light',
      language: 'en',
      notifications: true,
      timezone: 'UTC'
    };
  }
}

// More complex defaults
const DEFAULT_CONFIG = {
  features: {
    darkMode: false,
    betaFeatures: false,
    analytics: true
  },
  limits: {
    maxUploadSize: 10 * 1024 * 1024,  // 10MB
    maxItems: 100
  }
};

async function getConfig() {
  try {
    return await configService.fetch();
  } catch (error) {
    console.warn('Config service unavailable, using defaults');
    return DEFAULT_CONFIG;
  }
}
```

**Best for:**
- Configuration settings
- User preferences
- Feature flags
- Non-critical data

### 2. Cached Response

Return previously cached successful response.

```javascript
class CacheFallback {
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 3600000;  // 1 hour default
  }
  
  async execute(key, primaryFn) {
    try {
      // Try primary operation
      const result = await primaryFn();
      
      // Cache successful response
      this.cache.set(key, {
        data: result,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      // Try cache fallback
      const cached = this.cache.get(key);
      
      if (cached) {
        const age = Date.now() - cached.timestamp;
        console.warn(`Primary failed, using cached data (${age}ms old)`);
        return cached.data;
      }
      
      // No cache available, rethrow
      throw error;
    }
  }
  
  // Get from cache even if stale (emergency fallback)
  getStale(key) {
    const cached = this.cache.get(key);
    return cached?.data;
  }
}

// Usage
const fallbackCache = new CacheFallback({ ttl: 300000 });  // 5 min TTL

async function getProductCatalog() {
  return fallbackCache.execute('product-catalog', async () => {
    return await catalogService.getAll();
  });
}
```

**Cache-Aside with Fallback:**

```javascript
class CacheAsideFallback {
  constructor(cache, options = {}) {
    this.cache = cache;
    this.staleTTL = options.staleTTL || 86400000;  // 24 hours
  }
  
  async get(key, fetchFn) {
    // 1. Try cache first
    const cached = await this.cache.get(key);
    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }
    
    // 2. Try primary source
    try {
      const fresh = await fetchFn();
      await this.cache.set(key, {
        data: fresh,
        timestamp: Date.now(),
        fresh: true
      });
      return fresh;
    } catch (error) {
      // 3. Fallback to stale cache
      if (cached && !this.isTooStale(cached)) {
        console.warn(`Using stale cache for ${key}`);
        return cached.data;
      }
      
      throw error;
    }
  }
  
  isExpired(cached) {
    return Date.now() - cached.timestamp > this.ttl;
  }
  
  isTooStale(cached) {
    return Date.now() - cached.timestamp > this.staleTTL;
  }
}
```

**Best for:**
- Product listings
- User profiles
- Reference data
- Any data that changes slowly

### 3. Alternative Service

Call a backup service when primary fails.

```javascript
class ServiceFallback {
  constructor(services) {
    this.services = services;  // Array of services in priority order
  }
  
  async execute(operation) {
    let lastError;
    
    for (const service of this.services) {
      try {
        return await operation(service);
      } catch (error) {
        lastError = error;
        console.warn(`Service ${service.name} failed: ${error.message}`);
      }
    }
    
    throw lastError;
  }
}

// Usage
const paymentServices = new ServiceFallback([
  { name: 'stripe', client: stripeClient },
  { name: 'paypal', client: paypalClient },
  { name: 'braintree', client: braintreeClient }
]);

async function processPayment(amount, card) {
  return paymentServices.execute(async (service) => {
    return await service.client.charge(amount, card);
  });
}

// Geographic fallback
const apiEndpoints = new ServiceFallback([
  { name: 'primary', url: 'https://api-us.example.com' },
  { name: 'eu-backup', url: 'https://api-eu.example.com' },
  { name: 'asia-backup', url: 'https://api-asia.example.com' }
]);

async function fetchData(path) {
  return apiEndpoints.execute(async (endpoint) => {
    return await fetch(`${endpoint.url}${path}`);
  });
}
```

**Best for:**
- Payment processing
- Third-party API calls
- Multi-region deployments
- Critical operations with redundancy

### 4. Degraded Response

Return partial or simplified data.

```javascript
async function getProductDetails(productId) {
  try {
    // Full product with reviews, recommendations, etc.
    return await getFullProductDetails(productId);
  } catch (error) {
    console.warn('Full details unavailable, returning basic info');
    
    try {
      // Fallback to basic product info only
      return await getBasicProductInfo(productId);
    } catch (basicError) {
      // Last resort: minimal data from database
      return await getProductFromDB(productId);
    }
  }
}

// Feature degradation
async function getSearchResults(query) {
  const results = {
    products: [],
    suggestions: [],
    filters: [],
    sponsored: []
  };
  
  // Try each component independently
  try {
    results.products = await searchService.search(query);
  } catch (e) {
    results.products = await cachedSearch.get(query) || [];
  }
  
  try {
    results.suggestions = await suggestionService.get(query);
  } catch (e) {
    results.suggestions = [];  // Non-critical, empty is OK
  }
  
  try {
    results.filters = await filterService.getFilters(query);
  } catch (e) {
    results.filters = DEFAULT_FILTERS;
  }
  
  try {
    results.sponsored = await adService.getSponsored(query);
  } catch (e) {
    results.sponsored = [];  // Skip ads if service is down
  }
  
  return results;
}
```

**Best for:**
- Search results
- Dashboard widgets
- Composite pages
- Non-critical features

### 5. Queue for Later

Store failed operations for retry later.

```javascript
class QueueFallback {
  constructor(queue) {
    this.queue = queue;  // Message queue (Redis, SQS, etc.)
  }
  
  async execute(operation, fallbackData) {
    try {
      return await operation();
    } catch (error) {
      // Queue for later processing
      await this.queue.add({
        operation: fallbackData.operationType,
        payload: fallbackData.payload,
        timestamp: Date.now(),
        retryCount: 0
      });
      
      return {
        status: 'queued',
        message: 'Operation queued for processing',
        trackingId: fallbackData.id
      };
    }
  }
}

// Usage
const emailFallback = new QueueFallback(emailQueue);

async function sendWelcomeEmail(userId, email) {
  return emailFallback.execute(
    () => emailService.send(email, 'welcome', { userId }),
    {
      operationType: 'SEND_EMAIL',
      payload: { userId, email, template: 'welcome' },
      id: generateTrackingId()
    }
  );
}

// Process queued items later
async function processEmailQueue() {
  while (true) {
    const job = await emailQueue.getNext();
    if (!job) break;
    
    try {
      await emailService.send(job.payload.email, job.payload.template, job.payload);
      await emailQueue.complete(job.id);
    } catch (error) {
      if (job.retryCount < 3) {
        await emailQueue.retry(job.id);
      } else {
        await emailQueue.fail(job.id, error);
      }
    }
  }
}
```

**Best for:**
- Email sending
- Notifications
- Analytics events
- Non-time-sensitive operations

### 6. Fail Silent

Simply ignore the failure for non-critical operations.

```javascript
async function loadDashboard(userId) {
  // Critical: must succeed
  const user = await userService.get(userId);
  
  // Non-critical: fail silently
  const analytics = await failSilent(
    () => analyticsService.getUserStats(userId),
    null
  );
  
  const recommendations = await failSilent(
    () => recommendationService.get(userId),
    []
  );
  
  const notifications = await failSilent(
    () => notificationService.getUnread(userId),
    []
  );
  
  return {
    user,
    analytics,
    recommendations,
    notifications
  };
}

// Fail silent helper
async function failSilent(fn, defaultValue) {
  try {
    return await fn();
  } catch (error) {
    console.warn('Non-critical operation failed:', error.message);
    return defaultValue;
  }
}

// Decorator version
function silentFallback(defaultValue) {
  return function(target, propertyKey, descriptor) {
    const original = descriptor.value;
    
    descriptor.value = async function(...args) {
      try {
        return await original.apply(this, args);
      } catch (error) {
        console.warn(`${propertyKey} failed silently:`, error.message);
        return defaultValue;
      }
    };
    
    return descriptor;
  };
}

// Usage with decorator
class DashboardService {
  @silentFallback([])
  async getRecommendations(userId) {
    return await api.get(`/recommendations/${userId}`);
  }
  
  @silentFallback({ views: 0, clicks: 0 })
  async getAnalytics(userId) {
    return await api.get(`/analytics/${userId}`);
  }
}
```

**Best for:**
- Analytics/tracking
- Personalization
- Ads/sponsored content
- Nice-to-have features

---

## 🛠️ Implementation Examples

### TypeScript - Comprehensive Fallback System

```typescript
type FallbackStrategy<T> = () => T | Promise<T>;

interface FallbackOptions<T> {
  strategies: FallbackStrategy<T>[];
  onFallback?: (index: number, error: Error) => void;
  timeout?: number;
}

class FallbackChain<T> {
  private strategies: FallbackStrategy<T>[];
  private onFallback?: (index: number, error: Error) => void;
  private timeout: number;

  constructor(options: FallbackOptions<T>) {
    this.strategies = options.strategies;
    this.onFallback = options.onFallback;
    this.timeout = options.timeout || 5000;
  }

  async execute(): Promise<T> {
    let lastError: Error = new Error('No strategies provided');

    for (let i = 0; i < this.strategies.length; i++) {
      try {
        const result = await this.withTimeout(this.strategies[i]());
        return result;
      } catch (error) {
        lastError = error as Error;
        this.onFallback?.(i, lastError);
        
        // Continue to next fallback
        if (i < this.strategies.length - 1) {
          console.log(`Strategy ${i} failed, trying fallback ${i + 1}`);
        }
      }
    }

    throw lastError;
  }

  private withTimeout(promise: T | Promise<T>): Promise<T> {
    return Promise.race([
      Promise.resolve(promise),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), this.timeout)
      )
    ]);
  }
}

// Usage
const productFallback = new FallbackChain<Product>({
  strategies: [
    // Strategy 1: Primary API
    () => productApi.getProduct(productId),
    
    // Strategy 2: Cache
    () => productCache.get(productId),
    
    // Strategy 3: Database
    () => productDb.findById(productId),
    
    // Strategy 4: Static default
    () => ({ id: productId, name: 'Product Unavailable', price: 0 })
  ],
  onFallback: (index, error) => {
    metrics.increment(`product.fallback.${index}`);
    logger.warn(`Product fallback to strategy ${index}`, { error });
  },
  timeout: 3000
});

const product = await productFallback.execute();
```

### React Hook for Fallback Data

```typescript
import { useState, useEffect, useCallback } from 'react';

interface UseFallbackOptions<T> {
  primary: () => Promise<T>;
  fallback: T | (() => T | Promise<T>);
  deps?: any[];
  retryDelay?: number;
  maxRetries?: number;
}

function useFallback<T>(options: UseFallbackOptions<T>) {
  const { primary, fallback, deps = [], retryDelay = 5000, maxRetries = 3 } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [isFromFallback, setIsFromFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    try {
      const result = await primary();
      setData(result);
      setIsFromFallback(false);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      setError(err as Error);
      
      // Use fallback
      const fallbackData = typeof fallback === 'function' 
        ? await (fallback as () => T | Promise<T>)()
        : fallback;
      
      setData(fallbackData);
      setIsFromFallback(true);
      
      // Schedule retry
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(c => c + 1);
        }, retryDelay);
      }
    } finally {
      setLoading(false);
    }
  }, [primary, fallback, retryCount, maxRetries, retryDelay]);

  useEffect(() => {
    fetchData();
  }, [...deps, retryCount]);

  return { data, loading, error, isFromFallback, retry: fetchData };
}

// Usage in component
function ProductList() {
  const { data: products, loading, isFromFallback } = useFallback({
    primary: () => api.getProducts(),
    fallback: CACHED_PRODUCTS,
    retryDelay: 10000,
    maxRetries: 3
  });

  if (loading) return <Spinner />;

  return (
    <div>
      {isFromFallback && (
        <Banner type="warning">
          Showing cached data. Some information may be outdated.
        </Banner>
      )}
      <ProductGrid products={products} />
    </div>
  );
}
```

### Python Implementation

```python
from typing import TypeVar, Callable, List, Any, Optional
from functools import wraps
import asyncio
import logging

T = TypeVar('T')

class FallbackChain:
    def __init__(self, strategies: List[Callable[[], T]]):
        self.strategies = strategies
        self.logger = logging.getLogger(__name__)
    
    async def execute(self) -> T:
        last_error = None
        
        for i, strategy in enumerate(self.strategies):
            try:
                if asyncio.iscoroutinefunction(strategy):
                    return await strategy()
                return strategy()
            except Exception as e:
                last_error = e
                self.logger.warning(f"Strategy {i} failed: {e}")
        
        raise last_error

# Decorator for fallback
def with_fallback(fallback_value: Any = None, fallback_fn: Callable = None):
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> T:
            try:
                if asyncio.iscoroutinefunction(func):
                    return await func(*args, **kwargs)
                return func(*args, **kwargs)
            except Exception as e:
                logging.warning(f"{func.__name__} failed, using fallback: {e}")
                
                if fallback_fn:
                    if asyncio.iscoroutinefunction(fallback_fn):
                        return await fallback_fn(*args, **kwargs)
                    return fallback_fn(*args, **kwargs)
                
                return fallback_value
        
        return wrapper
    return decorator

# Usage
@with_fallback(fallback_value=[])
async def get_recommendations(user_id: str) -> list:
    return await recommendation_service.get(user_id)

@with_fallback(fallback_fn=lambda uid: cache.get(f"user:{uid}"))
async def get_user_profile(user_id: str) -> dict:
    return await user_service.get(user_id)

# Complex fallback chain
async def get_product(product_id: str) -> dict:
    chain = FallbackChain([
        lambda: product_api.get(product_id),
        lambda: product_cache.get(product_id),
        lambda: product_db.find(product_id),
        lambda: {"id": product_id, "name": "Unknown", "available": False}
    ])
    return await chain.execute()
```

### Java with Resilience4j

```java
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.decorators.Decorators;
import io.vavr.control.Try;

import java.util.function.Supplier;

public class FallbackExample {
    
    private final CircuitBreaker circuitBreaker;
    private final ProductCache cache;
    private final ProductRepository repository;
    
    public Product getProduct(String productId) {
        Supplier<Product> supplier = () -> productApi.get(productId);
        
        return Decorators.ofSupplier(supplier)
            .withCircuitBreaker(circuitBreaker)
            .withFallback(List.of(
                CallNotPermittedException.class,
                TimeoutException.class
            ), e -> getFromCache(productId))
            .withFallback(
                CacheNotFoundException.class,
                e -> getFromDatabase(productId)
            )
            .withFallback(
                Exception.class,
                e -> getDefaultProduct(productId)
            )
            .get();
    }
    
    private Product getFromCache(String productId) {
        return cache.get(productId)
            .orElseThrow(() -> new CacheNotFoundException(productId));
    }
    
    private Product getFromDatabase(String productId) {
        return repository.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException(productId));
    }
    
    private Product getDefaultProduct(String productId) {
        return new Product(productId, "Unavailable", BigDecimal.ZERO, false);
    }
    
    // Async with CompletableFuture
    public CompletableFuture<Product> getProductAsync(String productId) {
        return CompletableFuture
            .supplyAsync(() -> productApi.get(productId))
            .exceptionally(e -> {
                log.warn("API failed, trying cache", e);
                return cache.get(productId).orElse(null);
            })
            .thenApply(product -> {
                if (product == null) {
                    log.warn("Cache miss, using default");
                    return getDefaultProduct(productId);
                }
                return product;
            });
    }
}
```

---

## 🔗 Fallback + Other Patterns

### Fallback + Circuit Breaker

```javascript
class CircuitBreakerWithFallback {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.fallback = options.fallback;
    
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = null;
  }
  
  async execute(primaryFn) {
    // Circuit is open - go directly to fallback
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        console.log('Circuit OPEN, using fallback');
        return this.executeFallback();
      }
    }
    
    try {
      const result = await primaryFn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      return this.executeFallback();
    }
  }
  
  async executeFallback() {
    if (typeof this.fallback === 'function') {
      return await this.fallback();
    }
    return this.fallback;
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

// Usage
const productService = new CircuitBreakerWithFallback({
  failureThreshold: 3,
  resetTimeout: 30000,
  fallback: () => productCache.getAll()
});

const products = await productService.execute(() => 
  productApi.getAll()
);
```

### Fallback + Retry + Timeout

```javascript
class ResilientService {
  constructor(options = {}) {
    this.timeout = options.timeout || 5000;
    this.maxRetries = options.maxRetries || 3;
    this.fallback = options.fallback;
  }
  
  async execute(primaryFn) {
    let lastError;
    
    // Try with retries
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await this.withTimeout(primaryFn(), this.timeout);
      } catch (error) {
        lastError = error;
        if (attempt < this.maxRetries - 1) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }
    
    // All retries failed, use fallback
    console.warn('All retries failed, using fallback');
    if (this.fallback) {
      return typeof this.fallback === 'function' 
        ? await this.fallback() 
        : this.fallback;
    }
    
    throw lastError;
  }
  
  withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), ms)
      )
    ]);
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

## ⚠️ Common Pitfalls

### 1. Hiding Critical Failures

```javascript
// BAD: Silently failing on critical operations
async function processPayment(amount) {
  try {
    return await paymentService.charge(amount);
  } catch (error) {
    return { success: true };  // DANGEROUS! Pretending payment succeeded
  }
}

// GOOD: Only use fallback for non-critical parts
async function processPayment(amount) {
  // Payment must succeed - no silent fallback
  const payment = await paymentService.charge(amount);
  
  // Receipt email can have fallback
  try {
    await emailService.sendReceipt(payment);
  } catch (error) {
    await emailQueue.add(payment);  // Queue for later
  }
  
  return payment;
}
```

### 2. Stale Fallback Data

```javascript
// BAD: No indication of data staleness
async function getInventory(productId) {
  try {
    return await inventoryService.get(productId);
  } catch (error) {
    return cachedInventory[productId];  // Could be hours old!
  }
}

// GOOD: Include staleness information
async function getInventory(productId) {
  try {
    const inventory = await inventoryService.get(productId);
    return { ...inventory, isRealtime: true };
  } catch (error) {
    const cached = await cache.get(`inventory:${productId}`);
    return { 
      ...cached.data, 
      isRealtime: false,
      cachedAt: cached.timestamp,
      warning: 'Inventory data may be outdated'
    };
  }
}
```

### 3. Fallback Causes More Load

```javascript
// BAD: Fallback hits database for every request when service is down
async function getUser(userId) {
  try {
    return await userService.get(userId);  // Fast, cached
  } catch (error) {
    return await database.query('SELECT * FROM users WHERE id = ?', [userId]);
    // If service is down, ALL requests hit database!
  }
}

// GOOD: Fallback also uses caching
async function getUser(userId) {
  try {
    return await userService.get(userId);
  } catch (error) {
    // Check local cache first
    const cached = await localCache.get(`user:${userId}`);
    if (cached) return cached;
    
    // Only then hit database
    const user = await database.query('SELECT * FROM users WHERE id = ?', [userId]);
    await localCache.set(`user:${userId}`, user, 60);  // Cache for 60s
    return user;
  }
}
```

### 4. Inconsistent Fallback Behavior

```javascript
// BAD: Different fallback behavior for same data
// In ProductList.js
const products = await getProducts().catch(() => []);

// In ProductDetail.js  
const product = await getProduct(id).catch(() => null);

// In Cart.js
const products = await getProducts().catch(() => { throw error });

// GOOD: Consistent fallback service
class ProductService {
  async getProducts() {
    return this.withFallback(
      () => api.getProducts(),
      () => cache.get('products'),
      []
    );
  }
  
  async getProduct(id) {
    return this.withFallback(
      () => api.getProduct(id),
      () => cache.get(`product:${id}`),
      this.getDefaultProduct(id)
    );
  }
}
```

---

## 📊 Fallback Decision Matrix

| Scenario | Fallback Strategy | Example |
|----------|-------------------|---------|
| Config/Settings | Static defaults | Feature flags |
| Product catalog | Cached data | E-commerce listings |
| User preferences | Static + cached | Theme, language |
| Search results | Degraded results | Fewer filters |
| Payment | Alternative service | Stripe → PayPal |
| Analytics | Fail silent | Page views |
| Notifications | Queue for later | Email, push |
| Inventory | Cached with warning | Stock levels |

---

## 🎯 Best Practices

### 1. Categorize Operations by Criticality

```javascript
const operationTypes = {
  CRITICAL: 'critical',      // Must succeed, no silent fallback
  IMPORTANT: 'important',    // Needs fallback, user should know
  OPTIONAL: 'optional'       // Can fail silently
};

async function processOrder(order) {
  // CRITICAL: Payment must succeed
  const payment = await paymentService.charge(order.total);
  
  // IMPORTANT: Inventory update with fallback
  const inventory = await withFallback(
    () => inventoryService.reserve(order.items),
    () => queueInventoryUpdate(order),
    operationTypes.IMPORTANT
  );
  
  // OPTIONAL: Analytics can fail silently
  await failSilent(() => analytics.track('order_created', order));
  
  return { payment, inventory };
}
```

### 2. Monitor Fallback Usage

```javascript
class MonitoredFallback {
  async execute(primary, fallback, operationName) {
    const start = Date.now();
    
    try {
      const result = await primary();
      metrics.increment(`${operationName}.primary.success`);
      metrics.timing(`${operationName}.primary.duration`, Date.now() - start);
      return result;
    } catch (error) {
      metrics.increment(`${operationName}.primary.failure`);
      metrics.increment(`${operationName}.fallback.used`);
      
      const result = await fallback();
      metrics.timing(`${operationName}.fallback.duration`, Date.now() - start);
      return result;
    }
  }
}
```

### 3. Test Fallbacks Regularly

```javascript
// Chaos testing - randomly fail to trigger fallback
class ChaosWrapper {
  constructor(options = {}) {
    this.failureRate = options.failureRate || 0;  // 0-1
    this.enabled = options.enabled || false;
  }
  
  async execute(fn) {
    if (this.enabled && Math.random() < this.failureRate) {
      throw new Error('Chaos: Simulated failure');
    }
    return fn();
  }
}

// In tests
describe('Fallback behavior', () => {
  it('should use cached data when API fails', async () => {
    // Setup: Populate cache
    await cache.set('products', mockProducts);
    
    // Mock API failure
    jest.spyOn(api, 'getProducts').mockRejectedValue(new Error('API down'));
    
    // Execute
    const result = await productService.getProducts();
    
    // Verify fallback was used
    expect(result).toEqual(mockProducts);
    expect(result.isFromFallback).toBe(true);
  });
});
```

---

## 🔗 Related Patterns

| Pattern | Relationship |
|---------|--------------|
| **Circuit Breaker** | Opens circuit → use fallback |
| **Retry** | All retries fail → use fallback |
| **Timeout** | Timeout exceeded → use fallback |
| **Cache-Aside** | Cache miss fallback |
| **Bulkhead** | Bulkhead full → use fallback |

---

## 📝 Key Takeaways

1. **Something is better than nothing** - Graceful degradation beats failure
2. **Match fallback to criticality** - Don't silent-fail critical operations
3. **Indicate fallback usage** - Users should know when data is stale
4. **Chain fallbacks** - Multiple levels: API → Cache → DB → Default
5. **Monitor fallback rates** - High rates indicate systemic issues
6. **Test fallbacks** - They're only useful if they work
7. **Prevent fallback storms** - Fallback shouldn't overload other systems

---

## 🎯 Summary

The **Fallback Pattern** provides graceful degradation:

- ✅ Improves user experience during failures
- ✅ Prevents cascade failures
- ✅ Enables partial functionality
- ✅ Works with other resilience patterns

**Key formula:**
```
Resilience = Primary → Retry → Circuit Breaker → Fallback
```

---

**Date Created:** 2026-02-19  
**Pattern Type:** Resilience / Integration  
**Difficulty:** Intermediate  
**Related Patterns:** Circuit Breaker, Retry, Timeout, Cache-Aside

