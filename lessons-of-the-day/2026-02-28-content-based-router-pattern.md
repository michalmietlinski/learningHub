# Content-Based Router Pattern

## 📋 Learning Objectives

- [ ] Understand what content-based routing is and when to use it
- [ ] Learn how to route messages based on message content and headers
- [ ] Master routing strategies and evaluation criteria
- [ ] Understand routing rules and condition evaluation
- [ ] Learn implementation patterns in different technologies
- [ ] Compare content-based routing with other routing patterns
- [ ] Apply best practices for content-based routing

---

## 🎯 Definition

The **Content-Based Router** is an Enterprise Integration Pattern (EIP) that routes messages to different destinations based on the content of the message. The router examines message headers, body, or both to determine the appropriate destination channel.

**Key Principle:**
> "Route messages dynamically based on their content" - Different messages go to different places based on what they contain.

---

## 🏗️ Core Concepts

### What is Content-Based Routing?

```
┌──────────┐
│ Producer │
└────┬─────┘
     │ Message
     ▼
┌─────────────────────┐
│ Content-Based Router│
│  (Evaluates Content) │
└─────┬───────┬───────┘
      │       │       │
      ▼       ▼       ▼
  ┌──────┐ ┌──────┐ ┌──────┐
  │Queue1│ │Queue2│ │Queue3│
  └──────┘ └──────┘ └──────┘
```

**How it works:**
1. **Message arrives** at the router
2. **Router examines** message content (headers, body, properties)
3. **Router evaluates** routing rules/conditions
4. **Router routes** message to appropriate destination(s)
5. **Message continues** to selected channel(s)

### Key Terminology

| Term | Description |
|------|-------------|
| **Router** | Component that examines messages and routes them |
| **Routing Rule** | Condition that determines message destination |
| **Routing Criteria** | Message properties used for routing (headers, body, metadata) |
| **Destination Channel** | Target queue/topic where message is sent |
| **Default Route** | Fallback destination when no rules match |
| **Multi-Cast** | Routing to multiple destinations simultaneously |

---

## 🔀 Routing Strategies

### 1. Header-Based Routing

Route messages based on message headers/metadata.

```javascript
// Example: Route by message type header
function routeByHeader(message) {
  const messageType = message.headers['message-type'];
  
  switch (messageType) {
    case 'order':
      return 'order-processing-queue';
    case 'payment':
      return 'payment-processing-queue';
    case 'notification':
      return 'notification-queue';
    default:
      return 'default-queue';
  }
}
```

**Use Cases:**
- Message type classification
- Priority-based routing
- Tenant-based routing (multi-tenancy)
- Version-based routing

### 2. Body-Based Routing

Route messages based on message body content.

```javascript
// Example: Route by order status in body
function routeByBody(message) {
  const body = JSON.parse(message.body);
  
  if (body.orderStatus === 'pending') {
    return 'pending-orders-queue';
  } else if (body.orderStatus === 'confirmed') {
    return 'confirmed-orders-queue';
  } else if (body.orderStatus === 'cancelled') {
    return 'cancelled-orders-queue';
  }
  
  return 'default-queue';
}
```

**Use Cases:**
- Status-based routing
- Category-based routing
- Value-based routing (e.g., amount thresholds)
- Content type routing

### 3. Composite Routing

Route based on multiple criteria (headers + body).

```javascript
// Example: Route by priority AND amount
function routeComposite(message) {
  const headers = message.headers;
  const body = JSON.parse(message.body);
  
  // High priority orders go to fast queue
  if (headers.priority === 'high' && body.amount > 1000) {
    return 'high-priority-large-orders-queue';
  }
  
  // Regular orders
  if (body.amount > 100) {
    return 'standard-orders-queue';
  }
  
  // Small orders
  return 'small-orders-queue';
}
```

**Use Cases:**
- Complex business rules
- Multi-dimensional routing
- Conditional routing logic

---

## 🛠️ Implementation Examples

### Node.js/Express - Simple Content Router

```javascript
const express = require('express');
const amqp = require('amqplib');

class ContentBasedRouter {
  constructor(amqpConnection) {
    this.connection = amqpConnection;
    this.routingRules = [];
  }
  
  // Add routing rule
  addRule(condition, destination) {
    this.routingRules.push({ condition, destination });
  }
  
  // Evaluate message against rules
  async route(message) {
    const messageData = {
      headers: message.properties.headers || {},
      body: JSON.parse(message.content.toString())
    };
    
    // Evaluate rules in order (first match wins)
    for (const rule of this.routingRules) {
      if (rule.condition(messageData)) {
        const channel = await this.connection.createChannel();
        await channel.assertQueue(rule.destination, { durable: true });
        channel.sendToQueue(rule.destination, message.content, {
          headers: messageData.headers
        });
        await channel.close();
        return rule.destination;
      }
    }
    
    // Default route
    const defaultChannel = await this.connection.createChannel();
    await defaultChannel.assertQueue('default-queue', { durable: true });
    defaultChannel.sendToQueue('default-queue', message.content);
    await defaultChannel.close();
    return 'default-queue';
  }
}

// Usage
async function setupRouter() {
  const connection = await amqp.connect('amqp://localhost');
  const router = new ContentBasedRouter(connection);
  
  // Define routing rules
  router.addRule(
    (msg) => msg.headers['message-type'] === 'order' && msg.body.amount > 1000,
    'high-value-orders-queue'
  );
  
  router.addRule(
    (msg) => msg.headers['message-type'] === 'order',
    'standard-orders-queue'
  );
  
  router.addRule(
    (msg) => msg.headers['message-type'] === 'payment',
    'payment-queue'
  );
  
  // Consume from input queue and route
  const channel = await connection.createChannel();
  await channel.assertQueue('input-queue', { durable: true });
  
  channel.consume('input-queue', async (message) => {
    if (message) {
      const destination = await router.route(message);
      console.log(`Routed to: ${destination}`);
      channel.ack(message);
    }
  });
}

setupRouter();
```

### Python - Content Router with Rule Engine

```python
from typing import Callable, Dict, Any, List
import json
import pika

class RoutingRule:
    def __init__(self, condition: Callable, destination: str, priority: int = 0):
        self.condition = condition
        self.destination = destination
        self.priority = priority
    
    def matches(self, message_data: Dict[str, Any]) -> bool:
        return self.condition(message_data)

class ContentBasedRouter:
    def __init__(self, connection: pika.BlockingConnection):
        self.connection = connection
        self.rules: List[RoutingRule] = []
    
    def add_rule(self, condition: Callable, destination: str, priority: int = 0):
        """Add routing rule with optional priority (higher = evaluated first)"""
        rule = RoutingRule(condition, destination, priority)
        self.rules.append(rule)
        # Sort by priority (descending)
        self.rules.sort(key=lambda r: r.priority, reverse=True)
    
    def route(self, message: pika.spec.Basic.Deliver, 
              properties: pika.spec.BasicProperties, 
              body: bytes) -> str:
        """Route message based on content"""
        message_data = {
            'headers': properties.headers or {},
            'body': json.loads(body.decode('utf-8'))
        }
        
        # Evaluate rules in priority order
        for rule in self.rules:
            if rule.matches(message_data):
                channel = self.connection.channel()
                channel.queue_declare(queue=rule.destination, durable=True)
                channel.basic_publish(
                    exchange='',
                    routing_key=rule.destination,
                    body=body,
                    properties=properties
                )
                channel.close()
                return rule.destination
        
        # Default route
        channel = self.connection.channel()
        channel.queue_declare(queue='default-queue', durable=True)
        channel.basic_publish(
            exchange='',
            routing_key='default-queue',
            body=body,
            properties=properties
        )
        channel.close()
        return 'default-queue'

# Usage
def setup_router():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters('localhost')
    )
    router = ContentBasedRouter(connection)
    
    # High priority: Large orders
    router.add_rule(
        lambda msg: (
            msg['headers'].get('message-type') == 'order' and
            msg['body'].get('amount', 0) > 1000
        ),
        'high-value-orders-queue',
        priority=10
    )
    
    # Medium priority: Regular orders
    router.add_rule(
        lambda msg: msg['headers'].get('message-type') == 'order',
        'standard-orders-queue',
        priority=5
    )
    
    # Low priority: Payments
    router.add_rule(
        lambda msg: msg['headers'].get('message-type') == 'payment',
        'payment-queue',
        priority=1
    )
    
    # Consume and route
    channel = connection.channel()
    channel.queue_declare(queue='input-queue', durable=True)
    
    def on_message(ch, method, properties, body):
        destination = router.route(method, properties, body)
        print(f"Routed to: {destination}")
        ch.basic_ack(delivery_tag=method.delivery_tag)
    
    channel.basic_consume(
        queue='input-queue',
        on_message_callback=on_message
    )
    
    channel.start_consuming()

setup_router()
```

### Java/Spring Integration - Content Router

```java
import org.springframework.integration.annotation.Router;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Component;

@Component
public class OrderContentRouter {
    
    @Router(inputChannel = "orderInputChannel")
    public String route(Message<Order> message) {
        Order order = message.getPayload();
        Map<String, Object> headers = message.getHeaders();
        
        // Route based on order properties
        if (order.getAmount() > 10000) {
            return "highValueOrdersChannel";
        }
        
        if (order.getPriority() == Priority.HIGH) {
            return "priorityOrdersChannel";
        }
        
        if (order.getStatus() == OrderStatus.URGENT) {
            return "urgentOrdersChannel";
        }
        
        // Route by region from headers
        String region = (String) headers.get("region");
        if ("EU".equals(region)) {
            return "euOrdersChannel";
        } else if ("US".equals(region)) {
            return "usOrdersChannel";
        }
        
        // Default route
        return "standardOrdersChannel";
    }
}

// Configuration
@Configuration
@EnableIntegration
public class RouterConfig {
    
    @Bean
    public MessageChannel orderInputChannel() {
        return new DirectChannel();
    }
    
    @Bean
    public MessageChannel highValueOrdersChannel() {
        return new DirectChannel();
    }
    
    @Bean
    public MessageChannel standardOrdersChannel() {
        return new DirectChannel();
    }
    
    // ... other channels
}
```

### Apache Camel - Content-Based Router

```java
import org.apache.camel.builder.RouteBuilder;

public class ContentBasedRouterRoute extends RouteBuilder {
    
    @Override
    public void configure() throws Exception {
        from("jms:input-queue")
            .choice()
                // Route by header
                .when(header("message-type").isEqualTo("order"))
                    .choice()
                        // Nested routing by body
                        .when(simple("${body.amount} > 1000"))
                            .to("jms:high-value-orders")
                        .when(simple("${body.priority} == 'HIGH'"))
                            .to("jms:priority-orders")
                        .otherwise()
                            .to("jms:standard-orders")
                    .endChoice()
                .when(header("message-type").isEqualTo("payment"))
                    .to("jms:payment-queue")
                .when(header("message-type").isEqualTo("notification"))
                    .choice()
                        .when(simple("${body.urgency} == 'CRITICAL'"))
                            .to("jms:critical-notifications")
                        .otherwise()
                            .to("jms:standard-notifications")
                    .endChoice()
                .otherwise()
                    .to("jms:default-queue")
            .end();
    }
}
```

---

## 📊 Routing Patterns Comparison

### Content-Based Router vs Other Routing Patterns

| Pattern | Routing Criteria | Use Case |
|---------|------------------|----------|
| **Content-Based Router** | Message content (headers, body) | Dynamic routing based on message data |
| **Message Filter** | Boolean condition | Filter unwanted messages (pass/reject) |
| **Recipient List** | Static list | Route to multiple known destinations |
| **Splitter** | Message structure | Split one message into multiple |
| **Aggregator** | Correlation ID | Combine multiple messages into one |
| **Dynamic Router** | Runtime evaluation | Route based on external data/services |

### When to Use Content-Based Router

✅ **Use when:**
- Routing depends on message content
- Different message types need different processing
- Business rules determine destination
- Multi-tenant systems (route by tenant ID)
- Priority-based processing
- Region/country-based routing

❌ **Don't use when:**
- Simple static routing (use Recipient List)
- All messages go to same destination
- Routing based on external state (use Dynamic Router)
- Need to filter out messages (use Message Filter)

---

## 🎯 Advanced Patterns

### 1. Multi-Cast Routing

Route the same message to multiple destinations.

```javascript
class MultiCastRouter {
  async route(message, destinations) {
    const channels = [];
    
    for (const destination of destinations) {
      const channel = await this.connection.createChannel();
      await channel.assertQueue(destination, { durable: true });
      channel.sendToQueue(destination, message.content, {
        headers: message.properties.headers
      });
      channels.push(channel);
    }
    
    // Close all channels
    await Promise.all(channels.map(ch => ch.close()));
    return destinations;
  }
  
  // Route to multiple queues based on conditions
  async routeMulti(message) {
    const destinations = [];
    const messageData = {
      headers: message.properties.headers || {},
      body: JSON.parse(message.content.toString())
    };
    
    // Evaluate all matching rules (not just first)
    for (const rule of this.routingRules) {
      if (rule.condition(messageData)) {
        destinations.push(rule.destination);
      }
    }
    
    if (destinations.length > 0) {
      return await this.route(message, destinations);
    }
    
    // Default
    return await this.route(message, ['default-queue']);
  }
}
```

### 2. Conditional Routing with Fallback

```javascript
class ConditionalRouter {
  constructor() {
    this.rules = [];
    this.defaultRoute = 'default-queue';
  }
  
  addRule(condition, destination, fallback = null) {
    this.rules.push({ condition, destination, fallback });
  }
  
  async route(message) {
    const messageData = this.parseMessage(message);
    
    for (const rule of this.rules) {
      try {
        if (rule.condition(messageData)) {
          // Try primary destination
          if (await this.sendToQueue(rule.destination, message)) {
            return rule.destination;
          }
          
          // Fallback if primary fails
          if (rule.fallback) {
            await this.sendToQueue(rule.fallback, message);
            return rule.fallback;
          }
        }
      } catch (error) {
        console.error(`Routing error: ${error.message}`);
        // Continue to next rule
      }
    }
    
    // Default route
    await this.sendToQueue(this.defaultRoute, message);
    return this.defaultRoute;
  }
}
```

### 3. Rule Engine Integration

```javascript
// Using a rule engine library (e.g., json-rules-engine)
const { Engine } = require('json-rules-engine');

class RuleEngineRouter {
  constructor() {
    this.engines = new Map(); // destination -> engine
  }
  
  addRoutingRule(destination, ruleDefinition) {
    const engine = new Engine();
    engine.addRule({
      conditions: ruleDefinition.conditions,
      event: { type: 'route', destination }
    });
    this.engines.set(destination, engine);
  }
  
  async route(message) {
    const facts = {
      headers: message.properties.headers || {},
      body: JSON.parse(message.content.toString())
    };
    
    // Run all engines
    for (const [destination, engine] of this.engines) {
      const { events } = await engine.run(facts);
      if (events.length > 0) {
        // Rule matched
        await this.sendToQueue(destination, message);
        return destination;
      }
    }
    
    // Default
    await this.sendToQueue('default-queue', message);
    return 'default-queue';
  }
}

// Usage
const router = new RuleEngineRouter();

// Define rule: High-value orders from EU
router.addRoutingRule('high-value-eu-orders', {
  all: [
    {
      fact: 'body',
      path: '$.amount',
      operator: 'greaterThan',
      value: 1000
    },
    {
      fact: 'headers',
      path: '$.region',
      operator: 'equal',
      value: 'EU'
    }
  ]
});
```

---

## ⚠️ Common Pitfalls

### 1. Rule Order Matters

```javascript
// ❌ BAD: General rule before specific rule
router.addRule(
  (msg) => msg.headers['type'] === 'order',  // Matches all orders
  'all-orders-queue'
);
router.addRule(
  (msg) => msg.headers['type'] === 'order' && msg.body.amount > 1000,
  'high-value-orders-queue'  // Never reached!
);

// ✅ GOOD: Specific rules first
router.addRule(
  (msg) => msg.headers['type'] === 'order' && msg.body.amount > 1000,
  'high-value-orders-queue',
  priority: 10  // Higher priority
);
router.addRule(
  (msg) => msg.headers['type'] === 'order',
  'standard-orders-queue',
  priority: 5
);
```

### 2. Missing Default Route

```javascript
// ❌ BAD: No default route
function route(message) {
  if (message.type === 'order') {
    return 'order-queue';
  }
  // What if type is 'payment'? Message is lost!
}

// ✅ GOOD: Always have default
function route(message) {
  if (message.type === 'order') {
    return 'order-queue';
  }
  return 'default-queue';  // Safe fallback
}
```

### 3. Expensive Content Parsing

```javascript
// ❌ BAD: Parse body for every rule evaluation
function route(message) {
  for (const rule of rules) {
    const body = JSON.parse(message.content.toString());  // Expensive!
    if (rule.condition({ body })) {
      return rule.destination;
    }
  }
}

// ✅ GOOD: Parse once, reuse
function route(message) {
  const parsedBody = JSON.parse(message.content.toString());
  const messageData = {
    headers: message.properties.headers || {},
    body: parsedBody
  };
  
  for (const rule of rules) {
    if (rule.condition(messageData)) {
      return rule.destination;
    }
  }
}
```

### 4. Not Handling Routing Failures

```javascript
// ❌ BAD: No error handling
async function route(message) {
  const destination = evaluateRules(message);
  await channel.sendToQueue(destination, message.content);
}

// ✅ GOOD: Handle failures gracefully
async function route(message) {
  try {
    const destination = evaluateRules(message);
    await channel.sendToQueue(destination, message.content, {
      persistent: true
    });
  } catch (error) {
    // Send to dead letter queue
    await channel.sendToQueue('dlq', message.content, {
      headers: {
        ...message.properties.headers,
        'x-routing-error': error.message
      }
    });
  }
}
```

---

## 🎯 Best Practices

### 1. Rule Organization

```javascript
// Organize rules by priority and specificity
class RouterConfig {
  static getRules() {
    return [
      // High priority: Specific rules first
      {
        condition: (msg) => msg.body.amount > 10000 && msg.headers.region === 'EU',
        destination: 'premium-eu-orders',
        priority: 100
      },
      {
        condition: (msg) => msg.body.amount > 1000,
        destination: 'high-value-orders',
        priority: 50
      },
      // Medium priority: General rules
      {
        condition: (msg) => msg.headers.type === 'order',
        destination: 'standard-orders',
        priority: 10
      },
      // Low priority: Catch-all
      {
        condition: () => true,  // Always matches
        destination: 'default-queue',
        priority: 1
      }
    ];
  }
}
```

### 2. Performance Optimization

```javascript
// Cache parsed messages
class OptimizedRouter {
  constructor() {
    this.parseCache = new Map();
  }
  
  parseMessage(message) {
    const messageId = message.properties.messageId;
    
    if (this.parseCache.has(messageId)) {
      return this.parseCache.get(messageId);
    }
    
    const parsed = {
      headers: message.properties.headers || {},
      body: JSON.parse(message.content.toString())
    };
    
    this.parseCache.set(messageId, parsed);
    return parsed;
  }
  
  // Clear cache periodically
  clearCache() {
    this.parseCache.clear();
  }
}
```

### 3. Monitoring and Logging

```javascript
class MonitoredRouter {
  constructor() {
    this.routingMetrics = {
      totalRouted: 0,
      routesByDestination: new Map(),
      routingErrors: 0
    };
  }
  
  async route(message) {
    const startTime = Date.now();
    
    try {
      const destination = await this.evaluateAndRoute(message);
      
      // Update metrics
      this.routingMetrics.totalRouted++;
      const count = this.routingMetrics.routesByDestination.get(destination) || 0;
      this.routingMetrics.routesByDestination.set(destination, count + 1);
      
      const duration = Date.now() - startTime;
      console.log(`Routed to ${destination} in ${duration}ms`);
      
      return destination;
    } catch (error) {
      this.routingMetrics.routingErrors++;
      throw error;
    }
  }
  
  getMetrics() {
    return {
      ...this.routingMetrics,
      routesByDestination: Object.fromEntries(
        this.routingMetrics.routesByDestination
      )
    };
  }
}
```

### 4. Testing Routing Rules

```javascript
// Unit test routing rules
describe('ContentBasedRouter', () => {
  let router;
  
  beforeEach(() => {
    router = new ContentBasedRouter(mockConnection);
    router.addRule(
      (msg) => msg.body.amount > 1000,
      'high-value-queue'
    );
    router.addRule(
      (msg) => msg.body.amount <= 1000,
      'standard-queue'
    );
  });
  
  it('should route high-value orders correctly', async () => {
    const message = createMessage({
      body: { amount: 1500, orderId: '123' }
    });
    
    const destination = await router.route(message);
    expect(destination).toBe('high-value-queue');
  });
  
  it('should route standard orders correctly', async () => {
    const message = createMessage({
      body: { amount: 500, orderId: '456' }
    });
    
    const destination = await router.route(message);
    expect(destination).toBe('standard-queue');
  });
});
```

---

## 🔗 Related Patterns

| Pattern | Relationship |
|---------|--------------|
| **Message Filter** | Filters messages (pass/reject), while router routes to destinations |
| **Recipient List** | Static list of destinations vs dynamic content-based routing |
| **Dynamic Router** | Runtime evaluation vs content-based evaluation |
| **Splitter** | Splits messages, router routes complete messages |
| **Message Translator** | Often used before router to normalize message format |
| **Envelope Wrapper** | Adds metadata that router can use for routing |

---

## 📝 Key Takeaways

1. **Content-based routing** enables dynamic message routing based on message content
2. **Route by headers** for metadata-based decisions (fast, doesn't parse body)
3. **Route by body** for business logic-based decisions (slower, requires parsing)
4. **Rule order matters** - specific rules before general rules
5. **Always have a default route** to prevent message loss
6. **Optimize parsing** - parse message body once, reuse for all rules
7. **Monitor routing** - track metrics to understand routing behavior
8. **Test routing rules** - ensure rules work correctly for all scenarios

---

## 🎯 Summary

The **Content-Based Router Pattern** enables:

- ✅ Dynamic message routing based on content
- ✅ Flexible business rule implementation
- ✅ Multi-tenant system support
- ✅ Priority and category-based processing
- ✅ Decoupling routing logic from producers/consumers

**Content-Based Router Formula:**
```
Message → Examine Content → Evaluate Rules → Route to Destination(s)
```

---

**Date Created:** 2026-02-28  
**Pattern Type:** Integration / Routing  
**Difficulty:** Intermediate  
**Related Patterns:** Message Filter, Recipient List, Dynamic Router, Message Translator

