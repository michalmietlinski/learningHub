# Message Filter Pattern

## 📋 Learning Objectives

- [ ] Understand what message filtering is and when to use it
- [ ] Learn how to filter messages based on content, headers, or conditions
- [ ] Master different filtering strategies (pass/reject, whitelist/blacklist)
- [ ] Understand filter composition and chaining
- [ ] Learn implementation patterns in different technologies
- [ ] Compare message filtering with content-based routing
- [ ] Apply best practices for message filtering

---

## 🎯 Definition

The **Message Filter** is an Enterprise Integration Pattern (EIP) that removes unwanted messages from a channel based on a set of criteria. Unlike a router that sends messages to different destinations, a filter makes a binary decision: **pass** (allow) or **reject** (discard) the message.

**Key Principle:**
> "Remove unwanted messages before processing" - Only allow messages that meet certain criteria to pass through.

---

## 🏗️ Core Concepts

### What is Message Filtering?

```
┌──────────┐
│ Producer │
└────┬─────┘
     │ Messages
     ▼
┌─────────────────┐
│ Message Filter  │
│ (Pass/Reject)   │
└─────┬───────────┘
      │
      │ Passed Messages
      ▼
┌──────────┐
│ Consumer │
└──────────┘

Rejected Messages → Discarded or DLQ
```

**How it works:**
1. **Message arrives** at the filter
2. **Filter evaluates** message against criteria
3. **Filter decides**: Pass (allow) or Reject (discard)
4. **Passed messages** continue to consumer
5. **Rejected messages** are discarded or sent to DLQ

### Key Terminology

| Term | Description |
|------|-------------|
| **Filter** | Component that evaluates messages and decides pass/reject |
| **Filter Criteria** | Conditions that determine if message passes |
| **Pass** | Message meets criteria, allowed to continue |
| **Reject** | Message doesn't meet criteria, discarded |
| **Whitelist** | Only allow messages matching specific criteria |
| **Blacklist** | Reject messages matching specific criteria |
| **Filter Chain** | Multiple filters applied sequentially |

---

## 🔍 Filtering Strategies

### 1. Pass/Reject Filter

Simple binary decision: message either passes or is rejected.

```javascript
// Example: Only pass high-priority messages
function passRejectFilter(message) {
  const priority = message.headers['priority'];
  
  if (priority === 'high' || priority === 'urgent') {
    return true;  // Pass
  }
  
  return false;  // Reject
}
```

**Use Cases:**
- Priority-based filtering
- Status-based filtering
- Type-based filtering

### 2. Whitelist Filter

Only allow messages matching specific criteria.

```javascript
// Example: Only allow specific message types
const ALLOWED_TYPES = ['order', 'payment', 'notification'];

function whitelistFilter(message) {
  const messageType = message.headers['message-type'];
  return ALLOWED_TYPES.includes(messageType);
}
```

**Use Cases:**
- Security filtering (only allow known types)
- Version filtering (only allow supported versions)
- Tenant filtering (only allow specific tenants)

### 3. Blacklist Filter

Reject messages matching specific criteria.

```javascript
// Example: Reject spam or invalid messages
const BLOCKED_SOURCES = ['spam-source', 'invalid-source'];
const BLOCKED_PATTERNS = [/test/i, /debug/i];

function blacklistFilter(message) {
  const source = message.headers['source'];
  
  // Reject if source is blocked
  if (BLOCKED_SOURCES.includes(source)) {
    return false;
  }
  
  // Reject if body matches blocked patterns
  const body = message.body.toString();
  if (BLOCKED_PATTERNS.some(pattern => pattern.test(body))) {
    return false;
  }
  
  return true;  // Pass
}
```

**Use Cases:**
- Spam filtering
- Malicious content filtering
- Invalid data filtering

### 4. Conditional Filter

Filter based on complex business logic.

```javascript
// Example: Filter based on business rules
function conditionalFilter(message) {
  const body = JSON.parse(message.body.toString());
  const headers = message.headers;
  
  // Reject if amount is negative
  if (body.amount && body.amount < 0) {
    return false;
  }
  
  // Reject if order is too old (more than 30 days)
  if (body.orderDate) {
    const orderDate = new Date(body.orderDate);
    const daysOld = (Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysOld > 30) {
      return false;
    }
  }
  
  // Reject if missing required fields
  if (!body.orderId || !body.customerId) {
    return false;
  }
  
  return true;  // Pass
}
```

**Use Cases:**
- Business rule validation
- Data quality filtering
- Age-based filtering

---

## 🛠️ Implementation Examples

### Node.js/Express - Message Filter

```javascript
const amqp = require('amqplib');

class MessageFilter {
  constructor(filterFunction) {
    this.filterFunction = filterFunction;
    this.stats = {
      passed: 0,
      rejected: 0
    };
  }
  
  // Filter a single message
  filter(message) {
    const messageData = {
      headers: message.properties.headers || {},
      body: JSON.parse(message.content.toString())
    };
    
    const shouldPass = this.filterFunction(messageData);
    
    if (shouldPass) {
      this.stats.passed++;
      return { pass: true, message };
    } else {
      this.stats.rejected++;
      return { pass: false, message };
    }
  }
  
  getStats() {
    return { ...this.stats };
  }
}

// Usage: Priority filter
async function setupPriorityFilter() {
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  
  await channel.assertQueue('input-queue', { durable: true });
  await channel.assertQueue('output-queue', { durable: true });
  await channel.assertQueue('rejected-queue', { durable: true });  // DLQ
  
  // Create filter: Only pass high/urgent priority
  const filter = new MessageFilter((messageData) => {
    const priority = messageData.headers.priority;
    return priority === 'high' || priority === 'urgent';
  });
  
  // Consume and filter
  channel.consume('input-queue', async (message) => {
    if (message) {
      const result = filter.filter(message);
      
      if (result.pass) {
        // Pass to output queue
        channel.sendToQueue('output-queue', message.content, {
          headers: message.properties.headers
        });
        console.log('Message passed filter');
      } else {
        // Send to rejected queue (DLQ)
        channel.sendToQueue('rejected-queue', message.content, {
          headers: {
            ...message.properties.headers,
            'x-filter-reason': 'Priority not high enough'
          }
        });
        console.log('Message rejected by filter');
      }
      
      channel.ack(message);
    }
  });
  
  console.log('Filter listening on input-queue');
}

setupPriorityFilter();
```

### Python - Message Filter with Multiple Criteria

```python
from typing import Callable, Dict, Any, List
import json
import pika

class MessageFilter:
    def __init__(self, filter_function: Callable):
        self.filter_function = filter_function
        self.stats = {'passed': 0, 'rejected': 0}
    
    def filter(self, message_data: Dict[str, Any]) -> bool:
        """Filter message, return True if pass, False if reject"""
        should_pass = self.filter_function(message_data)
        
        if should_pass:
            self.stats['passed'] += 1
        else:
            self.stats['rejected'] += 1
        
        return should_pass
    
    def get_stats(self) -> Dict[str, int]:
        return self.stats.copy()

class CompositeFilter:
    """Filter that combines multiple filter functions"""
    def __init__(self, filters: List[Callable], mode: str = 'AND'):
        """
        mode: 'AND' - all filters must pass
              'OR' - any filter must pass
        """
        self.filters = filters
        self.mode = mode
    
    def filter(self, message_data: Dict[str, Any]) -> bool:
        if self.mode == 'AND':
            return all(f(message_data) for f in self.filters)
        else:  # OR
            return any(f(message_data) for f in self.filters)

# Usage: Composite filter
def setup_composite_filter():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters('localhost')
    )
    channel = connection.channel()
    
    channel.queue_declare(queue='input-queue', durable=True)
    channel.queue_declare(queue='output-queue', durable=True)
    channel.queue_declare(queue='rejected-queue', durable=True)
    
    # Define individual filters
    def priority_filter(msg):
        return msg['headers'].get('priority') in ['high', 'urgent']
    
    def amount_filter(msg):
        amount = msg['body'].get('amount', 0)
        return amount > 0  # Reject negative amounts
    
    def type_filter(msg):
        msg_type = msg['headers'].get('message-type')
        return msg_type in ['order', 'payment']
    
    # Composite filter: All conditions must pass (AND)
    composite = CompositeFilter([
        priority_filter,
        amount_filter,
        type_filter
    ], mode='AND')
    
    def on_message(ch, method, properties, body):
        message_data = {
            'headers': properties.headers or {},
            'body': json.loads(body.decode('utf-8'))
        }
        
        if composite.filter(message_data):
            # Pass
            ch.basic_publish(
                exchange='',
                routing_key='output-queue',
                body=body,
                properties=properties
            )
            print('Message passed filter')
        else:
            # Reject
            ch.basic_publish(
                exchange='',
                routing_key='rejected-queue',
                body=body,
                properties=pika.BasicProperties(
                    headers={
                        **(properties.headers or {}),
                        'x-filter-reason': 'Failed composite filter'
                    }
                )
            )
            print('Message rejected by filter')
        
        ch.basic_ack(delivery_tag=method.delivery_tag)
    
    channel.basic_consume(
        queue='input-queue',
        on_message_callback=on_message
    )
    
    print('Filter listening on input-queue')
    channel.start_consuming()

setup_composite_filter()
```

### Java/Spring Integration - Message Filter

```java
import org.springframework.integration.annotation.Filter;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;

@Component
public class OrderMessageFilter {
    
    @Filter(inputChannel = "orderInputChannel", 
           outputChannel = "filteredOrderChannel",
           discardChannel = "rejectedOrderChannel")
    public boolean filterOrder(Message<Order> message) {
        Order order = message.getPayload();
        Map<String, Object> headers = message.getHeaders();
        
        // Reject if amount is negative
        if (order.getAmount() < 0) {
            return false;  // Reject
        }
        
        // Reject if order is too old
        if (order.getOrderDate().isBefore(
            LocalDateTime.now().minusDays(30))) {
            return false;  // Reject
        }
        
        // Reject if priority is low
        if (headers.get("priority") == "low") {
            return false;  // Reject
        }
        
        return true;  // Pass
    }
}

// Configuration
@Configuration
@EnableIntegration
public class FilterConfig {
    
    @Bean
    public MessageChannel orderInputChannel() {
        return new DirectChannel();
    }
    
    @Bean
    public MessageChannel filteredOrderChannel() {
        return new DirectChannel();
    }
    
    @Bean
    public MessageChannel rejectedOrderChannel() {
        return new DirectChannel();
    }
}
```

### Apache Camel - Message Filter

```java
import org.apache.camel.builder.RouteBuilder;

public class MessageFilterRoute extends RouteBuilder {
    
    @Override
    public void configure() throws Exception {
        from("jms:input-queue")
            .filter()
                // Filter condition: Only pass high priority
                .simple("${header.priority} == 'high'")
                // Passed messages
                .to("jms:output-queue")
            .end()
            // Rejected messages (optional)
            .to("jms:rejected-queue");
        
        // Alternative: Filter with body evaluation
        from("jms:orders")
            .filter()
                .simple("${body.amount} > 0 && ${body.amount} < 10000")
                .to("jms:standard-orders")
            .end()
            .to("jms:large-orders");
        
        // Filter with multiple conditions
        from("jms:messages")
            .filter()
                .simple("${header.message-type} == 'order'")
                .filter()
                    .simple("${body.status} == 'pending'")
                    .to("jms:pending-orders")
                .end()
            .end();
    }
}
```

---

## 📊 Filter vs Router Comparison

### Message Filter vs Content-Based Router

| Aspect | Message Filter | Content-Based Router |
|--------|----------------|---------------------|
| **Decision** | Binary (Pass/Reject) | Multi-way (Route to destination) |
| **Output** | One channel (passed) or DLQ | Multiple destination channels |
| **Purpose** | Remove unwanted messages | Route to appropriate destination |
| **Use Case** | Quality control, validation | Business logic routing |
| **Complexity** | Simpler (boolean decision) | More complex (multiple routes) |

### When to Use Message Filter

✅ **Use when:**
- Need to remove unwanted messages
- Quality control/validation
- Security filtering (whitelist/blacklist)
- Data validation before processing
- Simple pass/reject logic

❌ **Don't use when:**
- Need to route to different destinations (use Router)
- Need to transform messages (use Message Translator)
- Need to split messages (use Splitter)

---

## 🎯 Advanced Patterns

### 1. Filter Chain

Apply multiple filters sequentially.

```javascript
class FilterChain {
  constructor() {
    this.filters = [];
  }
  
  addFilter(filterFunction) {
    this.filters.push(filterFunction);
    return this;  // Fluent interface
  }
  
  filter(message) {
    const messageData = {
      headers: message.properties.headers || {},
      body: JSON.parse(message.content.toString())
    };
    
    // All filters must pass (AND logic)
    for (const filterFn of this.filters) {
      if (!filterFn(messageData)) {
        return { pass: false, reason: 'Filter chain failed' };
      }
    }
    
    return { pass: true };
  }
}

// Usage
const chain = new FilterChain()
  .addFilter(msg => msg.headers.priority === 'high')
  .addFilter(msg => msg.body.amount > 0)
  .addFilter(msg => msg.body.orderId !== undefined);

const result = chain.filter(message);
```

### 2. Conditional Filter with Fallback

```javascript
class ConditionalFilter {
  constructor(primaryFilter, fallbackFilter = null) {
    this.primaryFilter = primaryFilter;
    this.fallbackFilter = fallbackFilter;
  }
  
  filter(message) {
    try {
      const messageData = this.parseMessage(message);
      
      // Try primary filter
      if (this.primaryFilter(messageData)) {
        return { pass: true, source: 'primary' };
      }
      
      // Try fallback filter if exists
      if (this.fallbackFilter && this.fallbackFilter(messageData)) {
        return { pass: true, source: 'fallback' };
      }
      
      return { pass: false };
    } catch (error) {
      // On error, use fallback or reject
      if (this.fallbackFilter) {
        return { pass: true, source: 'fallback-error' };
      }
      return { pass: false, error: error.message };
    }
  }
}
```

### 3. Time-Based Filter

```javascript
class TimeBasedFilter {
  constructor(options = {}) {
    this.startTime = options.startTime || null;
    this.endTime = options.endTime || null;
    this.timezone = options.timezone || 'UTC';
  }
  
  filter(message) {
    const now = new Date();
    
    // Check start time
    if (this.startTime && now < this.startTime) {
      return false;  // Too early
    }
    
    // Check end time
    if (this.endTime && now > this.endTime) {
      return false;  // Too late
    }
    
    return true;  // Within time window
  }
}

// Usage: Only process messages during business hours
const businessHoursFilter = new TimeBasedFilter({
  startTime: new Date('2026-01-01T09:00:00Z'),
  endTime: new Date('2026-01-01T17:00:00Z')
});
```

### 4. Rate Limiting Filter

```javascript
class RateLimitingFilter {
  constructor(maxMessagesPerSecond = 10) {
    this.maxMessagesPerSecond = maxMessagesPerSecond;
    this.messageTimestamps = [];
  }
  
  filter(message) {
    const now = Date.now();
    
    // Remove timestamps older than 1 second
    this.messageTimestamps = this.messageTimestamps.filter(
      timestamp => now - timestamp < 1000
    );
    
    // Check if we're at the limit
    if (this.messageTimestamps.length >= this.maxMessagesPerSecond) {
      return false;  // Rate limit exceeded
    }
    
    // Record this message
    this.messageTimestamps.push(now);
    return true;  // Pass
  }
}

// Usage: Limit to 100 messages per second
const rateLimiter = new RateLimitingFilter(100);
```

### 5. Whitelist/Blacklist Filter

```javascript
class ListFilter {
  constructor(type = 'whitelist', items = []) {
    this.type = type;  // 'whitelist' or 'blacklist'
    this.items = new Set(items);
  }
  
  filter(message) {
    const messageData = this.parseMessage(message);
    const value = messageData.headers['message-type'];
    
    const isInList = this.items.has(value);
    
    if (this.type === 'whitelist') {
      return isInList;  // Pass if in whitelist
    } else {  // blacklist
      return !isInList;  // Pass if NOT in blacklist
    }
  }
}

// Usage: Whitelist - only allow specific types
const whitelist = new ListFilter('whitelist', ['order', 'payment']);

// Usage: Blacklist - reject specific types
const blacklist = new ListFilter('blacklist', ['spam', 'test']);
```

---

## ⚠️ Common Pitfalls

### 1. Silent Message Loss

```javascript
// ❌ BAD: Messages are silently discarded
function filter(message) {
  if (message.priority !== 'high') {
    return false;  // Message is lost!
  }
  return true;
}

// ✅ GOOD: Log or send to DLQ
function filter(message) {
  if (message.priority !== 'high') {
    // Send to DLQ for analysis
    sendToDLQ(message, 'Priority not high enough');
    return false;
  }
  return true;
}
```

### 2. Expensive Filter Operations

```javascript
// ❌ BAD: Expensive operation on every message
function filter(message) {
  // Database call for every message!
  const user = await db.users.findById(message.userId);
  return user.isActive;
}

// ✅ GOOD: Cache or use headers
function filter(message) {
  // Use header if available, avoid DB call
  return message.headers['user-active'] === 'true';
}
```

### 3. Not Handling Filter Errors

```javascript
// ❌ BAD: Filter crashes on invalid message
function filter(message) {
  const body = JSON.parse(message.body);  // Crashes if invalid JSON!
  return body.amount > 0;
}

// ✅ GOOD: Handle errors gracefully
function filter(message) {
  try {
    const body = JSON.parse(message.body);
    return body.amount > 0;
  } catch (error) {
    // Reject invalid messages
    sendToDLQ(message, `Parse error: ${error.message}`);
    return false;
  }
}
```

### 4. Filter Order Matters

```javascript
// ❌ BAD: Expensive filter before cheap filter
const filters = [
  expensiveDatabaseFilter,  // Runs for all messages
  simpleHeaderFilter        // Could have rejected earlier
];

// ✅ GOOD: Cheap filters first
const filters = [
  simpleHeaderFilter,       // Fast rejection
  expensiveDatabaseFilter   // Only runs if passed first filter
];
```

---

## 🎯 Best Practices

### 1. Always Have a DLQ

```javascript
class FilterWithDLQ {
  constructor(filterFunction, dlqName = 'rejected-queue') {
    this.filterFunction = filterFunction;
    this.dlqName = dlqName;
  }
  
  async filter(message, channel) {
    const shouldPass = this.filterFunction(message);
    
    if (!shouldPass) {
      // Send to DLQ with reason
      await channel.sendToQueue(this.dlqName, message.content, {
        headers: {
          ...message.properties.headers,
          'x-filter-reason': 'Filtered out',
          'x-filter-timestamp': new Date().toISOString()
        }
      });
    }
    
    return shouldPass;
  }
}
```

### 2. Monitor Filter Performance

```javascript
class MonitoredFilter {
  constructor(filterFunction) {
    this.filterFunction = filterFunction;
    this.metrics = {
      total: 0,
      passed: 0,
      rejected: 0,
      errors: 0,
      avgFilterTime: 0
    };
  }
  
  filter(message) {
    const startTime = Date.now();
    this.metrics.total++;
    
    try {
      const shouldPass = this.filterFunction(message);
      
      if (shouldPass) {
        this.metrics.passed++;
      } else {
        this.metrics.rejected++;
      }
      
      const duration = Date.now() - startTime;
      this.updateAvgTime(duration);
      
      return shouldPass;
    } catch (error) {
      this.metrics.errors++;
      console.error('Filter error:', error);
      return false;  // Reject on error
    }
  }
  
  updateAvgTime(duration) {
    const total = this.metrics.total;
    this.metrics.avgFilterTime = 
      (this.metrics.avgFilterTime * (total - 1) + duration) / total;
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      passRate: this.metrics.passed / this.metrics.total,
      rejectRate: this.metrics.rejected / this.metrics.total
    };
  }
}
```

### 3. Optimize Filter Order

```javascript
// Order filters by:
// 1. Speed (fastest first)
// 2. Selectivity (most selective first)
// 3. Cost (cheapest first)

class OptimizedFilterChain {
  constructor() {
    this.filters = [];
  }
  
  addFilter(filterFunction, metadata = {}) {
    this.filters.push({
      filter: filterFunction,
      speed: metadata.speed || 'medium',  // fast, medium, slow
      selectivity: metadata.selectivity || 0.5,  // 0-1, higher = more selective
      cost: metadata.cost || 0  // 0 = free, higher = more expensive
    });
    
    // Sort by: speed (fast first), then selectivity (high first)
    this.filters.sort((a, b) => {
      const speedOrder = { fast: 0, medium: 1, slow: 2 };
      if (speedOrder[a.speed] !== speedOrder[b.speed]) {
        return speedOrder[a.speed] - speedOrder[b.speed];
      }
      return b.selectivity - a.selectivity;  // Higher selectivity first
    });
    
    return this;
  }
  
  filter(message) {
    for (const { filter } of this.filters) {
      if (!filter(message)) {
        return false;
      }
    }
    return true;
  }
}
```

### 4. Test Filters Thoroughly

```javascript
// Unit test filters
describe('MessageFilter', () => {
  let filter;
  
  beforeEach(() => {
    filter = new MessageFilter((msg) => {
      return msg.headers.priority === 'high';
    });
  });
  
  it('should pass high priority messages', () => {
    const message = createMessage({
      headers: { priority: 'high' }
    });
    
    const result = filter.filter(message);
    expect(result.pass).toBe(true);
  });
  
  it('should reject low priority messages', () => {
    const message = createMessage({
      headers: { priority: 'low' }
    });
    
    const result = filter.filter(message);
    expect(result.pass).toBe(false);
  });
  
  it('should handle missing priority header', () => {
    const message = createMessage({
      headers: {}
    });
    
    const result = filter.filter(message);
    expect(result.pass).toBe(false);
  });
});
```

---

## 🔗 Related Patterns

| Pattern | Relationship |
|---------|--------------|
| **Content-Based Router** | Router routes to destinations, Filter passes/rejects |
| **Message Translator** | Often used before filter to normalize message format |
| **Splitter** | Splits messages, Filter filters complete messages |
| **Dead Letter Queue** | Where rejected messages are often sent |
| **Message Channel** | Messages flow through channels, filters sit in between |

---

## 📝 Key Takeaways

1. **Message Filter** makes binary pass/reject decisions
2. **Use whitelist** for security (only allow known types)
3. **Use blacklist** for spam/invalid content filtering
4. **Always use DLQ** for rejected messages (don't silently discard)
5. **Order filters** by speed and selectivity (fast/selective first)
6. **Monitor filter metrics** to understand filtering behavior
7. **Handle errors gracefully** - reject on error, don't crash
8. **Test filters thoroughly** - edge cases matter

---

## 🎯 Summary

The **Message Filter Pattern** enables:

- ✅ Quality control by removing unwanted messages
- ✅ Security through whitelist/blacklist filtering
- ✅ Data validation before processing
- ✅ Performance optimization (reject early)
- ✅ Clean separation of filtering logic

**Message Filter Formula:**
```
Message → Evaluate Criteria → Pass (continue) or Reject (discard/DLQ)
```

---

**Date Created:** 2026-02-29  
**Pattern Type:** Integration / Filtering  
**Difficulty:** Intermediate  
**Related Patterns:** Content-Based Router, Message Translator, Dead Letter Queue

