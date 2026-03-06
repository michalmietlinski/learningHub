# Splitter / Aggregator Pattern

## 📋 Learning Objectives

- [ ] Understand the Splitter pattern and when to use it
- [ ] Understand the Aggregator pattern and when to use it
- [ ] Learn split strategies (body, headers, iteration)
- [ ] Learn aggregation strategies (correlation, completion, timeout)
- [ ] Implement scatter-gather (split → process → aggregate)
- [ ] Apply patterns in different technologies
- [ ] Avoid common pitfalls and apply best practices

---

## 🎯 Definition

**Splitter** and **Aggregator** are Enterprise Integration Patterns (EIP) that work with message flow: the **Splitter** breaks one message into many; the **Aggregator** combines many messages into one. They are often used together in a scatter-gather flow.

**Splitter – Key Principle:**
> "Break a composite message into multiple messages so each part can be processed independently."

**Aggregator – Key Principle:**
> "Combine multiple related messages into one message when a completion condition is met."

---

## 🏗️ Core Concepts

### Splitter Pattern

```
┌──────────┐      ┌─────────────┐      ┌──────────────┐
│ Producer │─────▶│   One       │─────▶│   Splitter   │
└──────────┘      │   Message   │      └──────┬───────┘
                  └─────────────┘             │
                                              │  Many messages
                      ┌───────────────────────┼───────────────────────┐
                      ▼                       ▼                       ▼
                 ┌─────────┐            ┌─────────┐            ┌─────────┐
                 │ Part 1  │            │ Part 2  │            │ Part 3  │
                 └─────────┘            └─────────┘            └─────────┘
```

**How it works:**
1. One message containing multiple logical parts arrives.
2. The splitter inspects the message (body, headers, or both).
3. It produces multiple outgoing messages (one per part, or per batch).
4. Each part can be processed in parallel by downstream components.

**Use cases:** Batch orders → single order messages; CSV/file rows → row messages; a list of IDs → one message per ID.

### Aggregator Pattern

```
                 ┌─────────┐            ┌─────────┐            ┌─────────┐
                 │ Msg 1   │            │ Msg 2   │            │ Msg 3   │
                 └────┬────┘            └────┬────┘            └────┬────┘
                      │                     │                     │
                      └─────────────────────┼─────────────────────┘
                                            ▼
                                    ┌───────────────┐
                                    │  Aggregator   │
                                    │ (correlation, │
                                    │  completion)  │
                                    └───────┬───────┘
                                            │  One message
                                            ▼
                                    ┌───────────────┐
                                    │   Consumer    │
                                    └───────────────┘
```

**How it works:**
1. Many messages arrive (often from a previous split-and-process step).
2. The aggregator groups them by a **correlation key** (e.g. `correlationId`, `batchId`).
3. When a **completion condition** is met (e.g. expected count, timeout, or custom condition), it releases one aggregated message.
4. The consumer receives a single combined result.

**Use cases:** Collect all responses from parallel processing; combine order line items into one confirmation; merge partial search results.

### Key Terminology

| Term | Description |
|------|-------------|
| **Splitter** | Component that splits one message into many |
| **Aggregator** | Component that combines many messages into one |
| **Correlation ID / Key** | Identifier used to group messages for aggregation |
| **Completion condition** | Rule that decides when to release the aggregate (count, timeout, condition) |
| **Scatter-gather** | Pattern: split → process in parallel → aggregate |
| **Fragment** | One of the messages produced by the splitter |

---

## ✂️ Splitter Strategies

### 1. Body-based split (array or list)

Split by a list or array in the message body.

```javascript
// Split order batch into individual order messages
function splitOrderBatch(message) {
  const body = JSON.parse(message.body);
  const orders = body.orders; // Array of orders

  return orders.map((order, index) => ({
    body: JSON.stringify(order),
    headers: {
      ...message.headers,
      'correlation-id': message.headers['correlation-id'] || generateId(),
      'batch-size': orders.length,
      'fragment-index': index
    }
  }));
}
```

### 2. Iteration split (one message per element)

Same idea: one output message per element, optionally with metadata.

```javascript
function splitByIteration(message) {
  const items = message.body.items;
  const correlationId = message.headers['correlation-id'] || generateId();

  return items.map((item, i) => ({
    body: JSON.stringify(item),
    headers: {
      'correlation-id': correlationId,
      'fragment-index': i,
      'fragment-total': items.length
    }
  }));
}
```

### 3. Delimited split (e.g. CSV lines)

Split by a delimiter (lines, commas, etc.).

```javascript
function splitCsvMessage(message) {
  const text = message.body.toString();
  const lines = text.split('\n');
  const header = lines[0];

  return lines.slice(1).map((line, i) => ({
    body: JSON.stringify({ header, line: line.split(',') }),
    headers: {
      'correlation-id': message.headers['correlation-id'],
      'fragment-index': i,
      'fragment-total': lines.length - 1
    }
  }));
}
```

### 4. XPath / JSON path split

Split by a path into the structure (e.g. `$.orders[*]`). Conceptually the same as body-based split; implementation depends on your stack (e.g. Camel, custom parser).

---

## 🔗 Aggregator Strategies

### 1. Completion by count

Release when a fixed number of fragments has been received.

```javascript
class CountBasedAggregator {
  constructor(expectedCount) {
    this.expectedCount = expectedCount;
    this.buckets = new Map(); // correlationId -> { messages: [], received: number }
  }

  add(correlationId, message) {
    if (!this.buckets.has(correlationId)) {
      this.buckets.set(correlationId, { messages: [], received: 0 });
    }
    const bucket = this.buckets.get(correlationId);
    bucket.messages.push(message);
    bucket.received++;

    if (bucket.received >= this.expectedCount) {
      const result = this.release(correlationId);
      this.buckets.delete(correlationId);
      return result;
    }
    return null;
  }

  release(correlationId) {
    const bucket = this.buckets.get(correlationId);
    return {
      body: JSON.stringify({ results: bucket.messages.map(m => JSON.parse(m.body)) }),
      headers: { 'correlation-id': correlationId }
    };
  }
}
```

### 2. Completion by timeout

Release when no new message arrives for a given time (or after a deadline).

```javascript
class TimeoutBasedAggregator {
  constructor(timeoutMs) {
    this.timeoutMs = timeoutMs;
    this.buckets = new Map();
    this.timers = new Map();
  }

  add(correlationId, message) {
    if (!this.buckets.has(correlationId)) {
      this.buckets.set(correlationId, []);
      const timer = setTimeout(() => this.releaseByTimeout(correlationId), this.timeoutMs);
      this.timers.set(correlationId, timer);
    }
    this.buckets.get(correlationId).push(message);
  }

  releaseByTimeout(correlationId) {
    this.timers.delete(correlationId);
    const messages = this.buckets.get(correlationId) || [];
    this.buckets.delete(correlationId);
    return {
      body: JSON.stringify({ results: messages.map(m => JSON.parse(m.body)) }),
      headers: { 'correlation-id': correlationId }
    };
  }
}
```

### 3. Completion by condition

Release when a custom condition holds (e.g. "all fragment indices received", "end marker seen").

```javascript
class ConditionBasedAggregator {
  constructor(isComplete) {
    this.isComplete = isComplete; // (bucket) => boolean
    this.buckets = new Map();
  }

  add(correlationId, message) {
    if (!this.buckets.has(correlationId)) {
      this.buckets.set(correlationId, { messages: [], headers: message.headers });
    }
    const bucket = this.buckets.get(correlationId);
    bucket.messages.push(message);

    if (this.isComplete(bucket)) {
      const result = this.release(correlationId);
      this.buckets.delete(correlationId);
      return result;
    }
    return null;
  }

  release(correlationId) {
    const bucket = this.buckets.get(correlationId);
    return {
      body: JSON.stringify({ results: bucket.messages.map(m => JSON.parse(m.body)) }),
      headers: { ...bucket.headers, 'correlation-id': correlationId }
    };
  }
}

// Example: complete when we have all fragments (using fragment-total header)
const aggregator = new ConditionBasedAggregator((bucket) => {
  const total = bucket.messages[0]?.headers['fragment-total'];
  return total != null && bucket.messages.length >= total;
});
```

---

## 🛠️ Implementation Examples

### Node.js – Splitter then Aggregator (scatter-gather)

```javascript
const amqp = require('amqplib');

async function runScatterGather() {
  const conn = await amqp.connect('amqp://localhost');
  const ch = await conn.createChannel();

  const correlationId = `batch-${Date.now()}`;
  const batch = {
    orders: [
      { id: '1', product: 'A', qty: 2 },
      { id: '2', product: 'B', qty: 1 }
    ]
  };

  // 1. Split
  const fragments = batch.orders.map((order, i) => ({
    body: JSON.stringify(order),
    headers: {
      'correlation-id': correlationId,
      'fragment-index': i,
      'fragment-total': batch.orders.length
    }
  }));

  await ch.assertQueue('order-items');
  for (const msg of fragments) {
    ch.sendToQueue('order-items', Buffer.from(msg.body), { headers: msg.headers });
  }

  // 2. Workers process order-items and publish to order-results with same correlation-id

  // 3. Aggregate (consumer of order-results)
  const aggregator = new CountBasedAggregator(batch.orders.length);
  await ch.consume('order-results', (raw) => {
    const correlationId = raw.properties.headers['correlation-id'];
    const out = aggregator.add(correlationId, raw);
    if (out) {
      ch.sendToQueue('aggregated-results', Buffer.from(out.body), { headers: out.headers });
    }
    ch.ack(raw);
  });
}
```

### Python – Splitter

```python
import json

def split_order_batch(message):
    body = json.loads(message.body)
    orders = body['orders']
    correlation_id = message.properties.headers.get('correlation-id', str(uuid.uuid4()))

    return [
        {
            'body': json.dumps(order),
            'headers': {
                'correlation-id': correlation_id,
                'fragment-index': i,
                'fragment-total': len(orders)
            }
        }
        for i, order in enumerate(orders)
    ]

# Usage with RabbitMQ
def on_batch_received(ch, method, properties, body):
    message = type('Msg', (), {'body': body, 'properties': properties})()
    fragments = split_order_batch(message)
    for frag in fragments:
        ch.basic_publish(
            exchange='',
            routing_key='order-items',
            body=frag['body'],
            properties=pika.BasicProperties(headers=frag['headers'])
        )
    ch.basic_ack(delivery_tag=method.delivery_tag)
```

### Python – Aggregator

```python
from collections import defaultdict

class Aggregator:
    def __init__(self, expected_count_getter=None, timeout_seconds=30):
        self.buckets = defaultdict(list)
        self.expected_count_getter = expected_count_getter  # (headers) -> int
        self.timeout_seconds = timeout_seconds

    def add(self, correlation_id, message):
        self.buckets[correlation_id].append(message)
        bucket = self.buckets[correlation_id]
        expected = self.expected_count_getter(bucket[0].properties.headers) if self.expected_count_getter else len(bucket)
        if len(bucket) >= expected:
            result = self._release(correlation_id)
            del self.buckets[correlation_id]
            return result
        return None

    def _release(self, correlation_id):
        messages = self.buckets[correlation_id]
        return {
            'body': json.dumps([json.loads(m.body) for m in messages]),
            'headers': {'correlation-id': correlation_id}
        }
```

### Apache Camel – Splitter and Aggregator

```java
// Splitter
from("jms:order-batches")
    .split(body().method("getOrders"))
    .setHeader("correlationId", constant(header("CorrelationId")))
    .to("jms:order-items");

// Aggregator
from("jms:order-results")
    .aggregate(header("correlationId"), new ArrayListAggregationStrategy())
    .completionSize(header("fragmentTotal"))
    .completionTimeout(30000L)
    .to("jms:aggregated-results");
```

---

## 📊 Scatter-Gather Flow

Combined flow: one in → split → process in parallel → aggregate → one out.

```
   ┌─────────────┐
   │ Batch Order │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │  Splitter   │
   └──────┬──────┘
          │  N messages (same correlation-id)
    ┌─────┼─────┐
    ▼     ▼     ▼
 ┌─────┐ ┌─────┐ ┌─────┐
 │Worker│ │Worker│ │Worker│
 └──┬──┘ └──┬──┘ └──┬──┘
    │       │       │  N result messages
    └───────┼───────┘
            ▼
    ┌─────────────┐
    │ Aggregator  │  (by correlation-id, completion size or timeout)
    └──────┬──────┘
           │  1 message
           ▼
    ┌─────────────┐
    │  Consumer   │
    └─────────────┘
```

---

## ⚠️ Common Pitfalls

### 1. Missing or weak correlation

```javascript
// ❌ BAD: No correlation – aggregator cannot group
splitterOutput.forEach(msg => send(msg));

// ✅ GOOD: Same correlation-id on every fragment
const corrId = generateId();
splitterOutput.forEach(msg => {
  msg.headers['correlation-id'] = corrId;
  send(msg);
});
```

### 2. Wrong completion condition

```javascript
// ❌ BAD: Fixed count when batch size can vary
const aggregator = new CountBasedAggregator(10); // What if we get 7?

// ✅ GOOD: Use fragment-total from first message or header
const aggregator = new ConditionBasedAggregator((bucket) => {
  const total = bucket.messages[0]?.headers['fragment-total'];
  return total != null && bucket.messages.length >= total;
});
```

### 3. Never releasing (no timeout)

```javascript
// ❌ BAD: Only count – if one fragment is lost, aggregate never releases
if (bucket.messages.length === expectedCount) release();

// ✅ GOOD: Count OR timeout
if (bucket.messages.length >= expectedCount) release();
else if (Date.now() - bucket.firstSeen > timeoutMs) release(); // partial result
```

### 4. Splitting without fragment metadata

Always attach at least `correlation-id` and, when possible, `fragment-index` and `fragment-total` so the aggregator and downstream logic can work correctly.

---

## 🎯 Best Practices

1. **Correlation ID** – Assign a unique correlation ID per logical batch and put it on every split fragment and every response.
2. **Fragment metadata** – Add `fragment-index` and `fragment-total` (or equivalent) so the aggregator knows when the set is complete.
3. **Completion** – Prefer completion by count (using `fragment-total`) plus a **timeout** to handle lost or slow messages.
4. **Idempotency** – Aggregator input can be replayed; make aggregation and downstream processing idempotent where possible.
5. **Order** – If order matters, either preserve it via `fragment-index` when building the aggregate or document that order is not guaranteed.

---

## 🔗 Related Patterns

| Pattern | Relationship |
|---------|--------------|
| **Content-Based Router** | Routes whole messages; Splitter produces multiple messages from one. |
| **Message Filter** | Filters single messages; Aggregator combines multiple messages. |
| **Request-Reply** | Aggregator often used to collect replies before sending one response. |
| **Message Channel** | Splitter output and aggregator input are sent over channels. |
| **Composed Message Processor** | Splitter can be the first step in a composed flow. |

---

## 📝 Key Takeaways

1. **Splitter** turns one composite message into many; **Aggregator** turns many related messages into one.
2. Use a **correlation ID** (and fragment index/total) so the aggregator can group and know when to release.
3. **Completion** can be by count, timeout, or custom condition; often use count + timeout.
4. **Scatter-gather** = split → process in parallel → aggregate.
5. Design for **lost or late fragments** (timeout, partial results) and **idempotency** where needed.

---

**Date Created:** 2026-03-03  
**Pattern Type:** Integration / Message Flow  
**Difficulty:** Intermediate  
**Related Patterns:** Content-Based Router, Message Filter, Request-Reply, Message Channel
