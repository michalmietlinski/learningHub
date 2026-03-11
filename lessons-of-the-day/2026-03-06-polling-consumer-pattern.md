# Polling Consumer Pattern

## 📋 Learning Objectives

- [ ] Understand pull-based (polling) vs push-based (event-driven) consumption
- [ ] Learn when to use a Polling Consumer
- [ ] Master polling interval, long polling, and batch size
- [ ] Implement polling consumers in different technologies
- [ ] Apply backoff and throttling to avoid waste
- [ ] Compare with Event-Driven Consumer and apply best practices

---

## 🎯 Definition

The **Polling Consumer** is an Enterprise Integration Pattern (EIP) in which the consumer repeatedly asks the message channel (queue, topic) for messages instead of having messages pushed to it. The consumer **pulls** messages on its own schedule.

**Key Principle:**
> "The consumer pulls messages when it is ready" - Control stays with the consumer; no callback or push required from the broker.

---

## 🏗️ Core Concepts

### Pull vs Push

```
Event-Driven (Push):
┌──────────┐      ┌─────────────┐      ┌──────────┐
│  Queue   │─────▶│   Consumer  │      │ Broker   │
└──────────┘      │ (callback   │      │ pushes   │
  Broker pushes   │  invoked)   │      │ when     │
  when message    └─────────────┘      │ available│
  arrives                               └──────────┘

Polling (Pull):
┌──────────┐      ┌─────────────┐
│  Queue   │◀─────│   Consumer  │  Consumer asks
└──────────┘      │ (poll loop) │  "Any message?"
  Consumer         └─────────────┘  Broker returns
  initiates                            or empty
```

**Event-Driven Consumer:** Broker (or channel) pushes messages to the consumer when they arrive. Consumer registers a callback.

**Polling Consumer:** Consumer runs a loop and repeatedly calls “get message(s)” on the channel. If nothing is there, the call returns empty (or blocks for a while in long polling).

### Key Terminology

| Term | Description |
|------|-------------|
| **Poll** | Request to receive message(s) from the channel |
| **Polling interval** | Time between poll attempts |
| **Long polling** | Poll that blocks until a message arrives or a timeout (e.g. 20s) |
| **Batch poll** | Request multiple messages in one poll |
| **Visibility timeout** | (e.g. SQS) Time the message is hidden after being received until ack or timeout |

### When to Use Polling Consumer

**Use polling when:**
- The environment cannot accept push (e.g. no open inbound ports, firewall, serverless).
- You want to **control rate** (e.g. poll every N seconds, process in batches).
- The system is **legacy** or only supports “get next” APIs (e.g. database poll, file poll).
- You want **batch processing** (poll N messages, process, then poll again).
- You prefer **synchronous** “get then process” in one process (no callback model).

**Prefer event-driven when:**
- Low latency is important (react as soon as a message arrives).
- The broker and runtime support push/callbacks (e.g. RabbitMQ `consume`, Kafka consumer with broker-side fetch).
- You want to avoid empty polls and reduce unnecessary requests.

---

## 🛠️ Implementation Examples

### Node.js – Simple Polling Loop (RabbitMQ)

RabbitMQ has no push for a single “get”; you use `get()` in a loop (or long-running `consume` for push). Here we emulate polling with `get()`.

```javascript
const amqp = require('amqplib');

async function pollingConsumer() {
  const conn = await amqp.connect('amqp://localhost');
  const ch = await conn.createChannel();
  const queue = 'tasks';
  await ch.assertQueue(queue, { durable: true });

  const pollIntervalMs = 1000;
  let running = true;

  async function poll() {
    if (!running) return;
    const msg = await ch.get(queue);
    if (msg) {
      try {
        await processMessage(msg);
        ch.ack(msg);
      } catch (err) {
        ch.nack(msg, false, true);
      }
    }
    setTimeout(poll, pollIntervalMs);
  }

  poll();
}

async function processMessage(msg) {
  const body = JSON.parse(msg.content.toString());
  console.log('Processing:', body);
}
```

### Node.js – Batch Polling

```javascript
async function batchPollingConsumer() {
  const conn = await amqp.connect('amqp://localhost');
  const ch = await conn.createChannel();
  await ch.assertQueue('tasks', { durable: true });
  ch.prefetch(10);

  const batchSize = 10;
  const pollIntervalMs = 500;

  async function pollBatch() {
    const messages = [];
    for (let i = 0; i < batchSize; i++) {
      const msg = await ch.get('tasks');
      if (!msg) break;
      messages.push(msg);
    }
    if (messages.length > 0) {
      await processBatch(messages);
      messages.forEach(m => ch.ack(m));
    }
    setTimeout(pollBatch, pollIntervalMs);
  }

  pollBatch();
}
```

### Node.js – Long Polling (AWS SQS)

SQS supports long polling: the request blocks for up to `WaitTimeSeconds` (1–20), reducing empty polls.

```javascript
const { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } = require('@aws-sdk/client-sqs');

const sqs = new SQSClient({ region: 'us-east-1' });
const queueUrl = 'https://sqs.us-east-1.amazonaws.com/123456789/my-queue';

async function longPollingConsumer() {
  while (true) {
    const result = await sqs.send(new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 20,  // Long poll: wait up to 20s for messages
      VisibilityTimeout: 30
    }));

    const messages = result.Messages || [];
    for (const msg of messages) {
      try {
        await processMessage(msg);
        await sqs.send(new DeleteMessageCommand({
          QueueUrl: queueUrl,
          ReceiptHandle: msg.ReceiptHandle
        }));
      } catch (err) {
        console.error('Failed:', err);
        // Message returns to queue after visibility timeout
      }
    }
  }
}
```

### Python – Polling with Backoff

```python
import pika
import time
import json

def polling_consumer():
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    channel.queue_declare(queue='tasks', durable=True)

    min_interval = 1.0
    max_interval = 60.0
    interval = min_interval

    while True:
        method_frame, header_frame, body = channel.basic_get(queue='tasks')
        if method_frame:
            try:
                process_message(json.loads(body))
                channel.basic_ack(delivery_tag=method_frame.delivery_tag)
                interval = min_interval
            except Exception as e:
                channel.basic_nack(delivery_tag=method_frame.delivery_tag, requeue=True)
        else:
            time.sleep(interval)
            interval = min(interval * 1.5, max_interval)

def process_message(data):
    print('Processing', data)
```

### Kafka – Consumer Poll Loop

Kafka’s “consumer” is pull-based: you call `poll()` in a loop. The client fetches from the broker; from the app’s view it’s polling.

```javascript
const { Kafka } = require('kafkajs');
const kafka = new Kafka({ clientId: 'my-app', brokers: ['localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'my-group' });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'orders' });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      await processMessage(message);
    }
  });
}

// Under the hood, the library polls in a loop; you can also use consumer.run()
// with a manual poll loop for more control.
```

### Database / Resource Polling

Polling is also used for “no native queue” sources (DB table, file folder).

```javascript
async function pollDatabaseQueue() {
  const pollIntervalMs = 5000;
  while (true) {
    const rows = await db.query(
      'SELECT * FROM task_queue WHERE status = $1 LIMIT 10 FOR UPDATE SKIP LOCKED',
      ['pending']
    );
    for (const row of rows) {
      await processTask(row);
      await db.query('UPDATE task_queue SET status = $1 WHERE id = $2', ['done', row.id]);
    }
    await sleep(pollIntervalMs);
  }
}
```

---

## 📊 Polling vs Event-Driven Consumer

| Aspect | Polling Consumer | Event-Driven Consumer |
|--------|------------------|------------------------|
| **Who initiates** | Consumer | Broker/channel |
| **Latency** | Depends on interval | Usually lower (immediate push) |
| **Empty requests** | Can be many (short poll) | None |
| **Long polling** | Reduces empty polls | N/A |
| **Rate control** | Natural (you decide when to poll) | Need backpressure/throttling |
| **Environment** | Works behind firewall, serverless | Needs inbound connectivity or broker pull |
| **Batch size** | You choose (1 or N per poll) | Often 1 or broker batch |

---

## ⚠️ Common Pitfalls

### 1. Tight Loop (No Wait)

```javascript
// ❌ BAD: Burns CPU when queue is empty
while (true) {
  const msg = await ch.get('queue');
  if (msg) await process(msg);
}

// ✅ GOOD: Wait between polls
while (true) {
  const msg = await ch.get('queue');
  if (msg) await process(msg);
  else await sleep(1000);
}
```

### 2. Ignoring Long Polling

When the broker supports it (e.g. SQS), use long polling so the server holds the request until a message arrives or timeout, instead of returning “no messages” immediately.

```javascript
// ✅ SQS: WaitTimeSeconds 1–20
ReceiveMessageCommand({ QueueUrl, WaitTimeSeconds: 20, MaxNumberOfMessages: 10 })
```

### 3. No Backoff When Idle

When the queue is often empty, back off to avoid hammering the broker.

```javascript
let interval = 1000;
while (true) {
  const msg = await get();
  if (msg) {
    await process(msg);
    interval = 1000;
  } else {
    await sleep(interval);
    interval = Math.min(interval * 1.5, 30000);
  }
}
```

### 4. Processing Too Slow (Visibility / Requeue)

With SQS (or similar), if processing takes longer than the visibility timeout, the message becomes visible again and may be processed twice. Increase visibility timeout or process in a separate step (e.g. move to “processing” queue).

---

## 🎯 Best Practices

1. **Use long polling** when the broker supports it (e.g. SQS `WaitTimeSeconds`) to cut empty responses.
2. **Back off when idle** (exponential or capped) to reduce load when the queue is empty.
3. **Batch when useful** – poll up to N messages per request to improve throughput.
4. **Respect visibility/timeout** – set visibility (or ack deadline) longer than your processing time; handle duplicates if you can’t.
5. **Shut down cleanly** – finish in-flight work and stop the poll loop on SIGTERM/SIGINT.

---

## 🔗 Related Patterns

| Pattern | Relationship |
|---------|--------------|
| **Event-Driven Consumer** | Push model; use when you want push and the environment allows it. |
| **Message Channel** | Polling consumer reads from a channel (queue/topic). |
| **Message Queue** | Polling is one way to consume from a queue. |
| **Competing Consumers** | Multiple polling consumers on the same queue = load sharing. |

---

## 📝 Key Takeaways

1. **Polling Consumer** = consumer **pulls** messages on its own schedule instead of receiving push.
2. Use **long polling** when available to reduce empty polls and latency.
3. Use **backoff** when the queue is often empty to avoid wasting resources.
4. Prefer **event-driven** consumption when you need low latency and the stack supports push.
5. **Batch polling** can improve throughput; align **visibility timeout** with processing time.

---

**Date Created:** 2026-03-06  
**Pattern Type:** Integration / Consumption  
**Difficulty:** Intermediate  
**Related Patterns:** Event-Driven Consumer, Message Channel, Message Queue
