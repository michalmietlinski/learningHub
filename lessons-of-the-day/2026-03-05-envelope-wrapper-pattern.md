# Envelope Wrapper Pattern

## 📋 Learning Objectives

- [ ] Understand what an envelope is and why wrap messages
- [ ] Learn when to add vs remove envelope (wrap vs unwrap)
- [ ] Implement envelope wrapping in different technologies
- [ ] Handle headers, metadata, and tracing in envelopes
- [ ] Combine with Message Translator and routing
- [ ] Apply best practices and avoid common pitfalls

---

## 🎯 Definition

The **Envelope Wrapper** is an Enterprise Integration Pattern (EIP) that wraps a message (payload) in an envelope—adding headers, metadata, or protocol-specific wrapper—or unwraps it to expose the inner payload. The envelope carries information about the message without changing the payload itself.

**Key Principle:**
> "Wrap messages in an envelope to carry metadata and protocol context; unwrap when the consumer only needs the payload."

---

## 🏗️ Core Concepts

### What is an Envelope?

```
Without envelope:
┌─────────────────┐
│  Payload (body) │
└─────────────────┘

With envelope:
┌─────────────────────────────────────┐
│  ENVELOPE (headers + metadata)      │
│  ┌─────────────────────────────────┤
│  │ message-id, correlation-id,       │
│  │ source, timestamp, content-type  │
│  ├─────────────────────────────────┤
│  │  PAYLOAD (body)                  │
│  └─────────────────────────────────┘
└─────────────────────────────────────┘
```

**How it works:**
1. **Wrap** – A producer or intermediary wraps the payload in an envelope (adds headers, standard fields, protocol wrapper).
2. **Transport** – The envelope travels with the message; routers, filters, and translators can read headers without parsing the body.
3. **Unwrap** – A consumer or adapter removes the envelope and passes only the payload to the application.

**Use cases:**
- **Correlation and tracing** – Add `correlation-id`, `request-id`, `trace-id` for distributed tracing.
- **Protocol adaptation** – SOAP envelope, JMS message properties, HTTP headers around a body.
- **Routing and filtering** – Content-Based Router or Message Filter uses envelope headers only.
- **Metadata** – Source system, timestamp, schema version, content-type.

### Key Terminology

| Term | Description |
|------|-------------|
| **Envelope** | Wrapper around the payload that carries metadata |
| **Payload / Body** | The actual business message |
| **Headers** | Key-value metadata in the envelope (e.g. AMQP, JMS, HTTP) |
| **Wrap** | Add an envelope around a payload |
| **Unwrap** | Remove the envelope and expose the payload |

---

## 📦 Wrap Strategies

### 1. Add Headers Only (Same Body)

Body unchanged; add or replace headers.

```javascript
function wrapWithHeaders(payload, metadata) {
  return {
    body: payload,
    headers: {
      'message-id': metadata.messageId || generateId(),
      'correlation-id': metadata.correlationId,
      'source': metadata.source,
      'timestamp': new Date().toISOString(),
      'content-type': 'application/json'
    }
  };
}

// Usage
const envelope = wrapWithHeaders(
  JSON.stringify({ orderId: '123', amount: 100 }),
  { correlationId: 'req-456', source: 'order-service' }
);
```

### 2. Full Envelope Object (Body Inside Envelope)

Payload becomes a field inside a single object.

```javascript
function wrapInEnvelope(payload, metadata) {
  return {
    envelope: {
      messageId: metadata.messageId || generateId(),
      correlationId: metadata.correlationId,
      source: metadata.source,
      timestamp: new Date().toISOString(),
      schemaVersion: '1.0'
    },
    payload: typeof payload === 'string' ? JSON.parse(payload) : payload
  };
}

// Serialized form
const message = JSON.stringify(wrapInEnvelope({ orderId: '123' }, { source: 'api' }));
```

### 3. Protocol-Specific Envelope (e.g. SOAP, JMS)

Structure follows the protocol; body is the inner content.

```javascript
// JMS-style: properties + body
function wrapJmsStyle(body, properties) {
  return {
    properties: {
      JMSCorrelationID: properties.correlationId,
      JMSTimestamp: Date.now(),
      ...properties
    },
    body: body
  };
}

// SOAP-style: envelope with header and body
function wrapSoapStyle(body) {
  return {
    Envelope: {
      Header: { MessageID: generateId(), Timestamp: new Date().toISOString() },
      Body: body
    }
  };
}
```

### 4. Add Tracing Headers

Standard headers for distributed tracing (e.g. W3C Trace Context).

```javascript
function wrapWithTracing(payload, traceContext) {
  return {
    body: payload,
    headers: {
      ...payload.headers,
      'traceparent': traceContext.traceparent,
      'tracestate': traceContext.tracestate,
      'correlation-id': traceContext.correlationId
    }
  };
}
```

---

## 📤 Unwrap Strategies

### 1. Strip Headers, Keep Body

Consumer only needs the body; headers are used by infrastructure.

```javascript
function unwrapToBody(message) {
  return message.body;
}
```

### 2. Extract Payload from Envelope Object

When the message is a single object with `envelope` + `payload`.

```javascript
function unwrapFromEnvelope(message) {
  const parsed = typeof message.body === 'string'
    ? JSON.parse(message.body)
    : message.body;
  return parsed.payload;
}
```

### 3. Unwrap and Forward Headers to Application

Some apps need selected headers (e.g. correlation-id for logging).

```javascript
function unwrapWithHeaders(message) {
  const body = message.body;
  const headers = message.headers || {};
  return {
    payload: typeof body === 'string' ? JSON.parse(body) : body,
    correlationId: headers['correlation-id'],
    messageId: headers['message-id']
  };
}
```

---

## 🛠️ Implementation Examples

### Node.js – Envelope Wrapper Class

```javascript
class EnvelopeWrapper {
  static wrap(payload, metadata = {}) {
    const messageId = metadata.messageId || `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return {
      body: Buffer.isBuffer(payload) ? payload : Buffer.from(
        typeof payload === 'string' ? payload : JSON.stringify(payload)
      ),
      headers: {
        'message-id': messageId,
        'correlation-id': metadata.correlationId || messageId,
        'source': metadata.source || 'unknown',
        'timestamp': new Date().toISOString(),
        'content-type': metadata.contentType || 'application/json',
        ...metadata.extraHeaders
      }
    };
  }

  static unwrap(message) {
    return {
      payload: message.body,
      messageId: message.headers?.['message-id'],
      correlationId: message.headers?.['correlation-id'],
      source: message.headers?.['source']
    };
  }
}

// Usage
const wrapped = EnvelopeWrapper.wrap(
  { orderId: '123', amount: 100 },
  { correlationId: 'req-456', source: 'order-service' }
);
channel.sendToQueue('queue', wrapped.body, { headers: wrapped.headers });

// Consumer
const { payload } = EnvelopeWrapper.unwrap(message);
const data = JSON.parse(payload.toString());
```

### Node.js – Pipeline (Wrap → Process → Unwrap)

```javascript
async function processWithEnvelope(rawMessage) {
  const wrapped = EnvelopeWrapper.unwrap(rawMessage);
  const payload = JSON.parse(wrapped.payload.toString());
  const result = await processOrder(payload);
  return EnvelopeWrapper.wrap(result, {
    correlationId: wrapped.correlationId,
    source: 'order-processor'
  });
}
```

### Python – Envelope Helpers

```python
import json
import uuid
from datetime import datetime

def wrap_envelope(payload, correlation_id=None, source=None):
    message_id = str(uuid.uuid4())
    return {
        'body': payload if isinstance(payload, (bytes, str)) else json.dumps(payload),
        'headers': {
            'message-id': message_id,
            'correlation-id': correlation_id or message_id,
            'source': source or 'unknown',
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'content-type': 'application/json'
        }
    }

def unwrap_envelope(message):
    body = message.body
    if isinstance(body, bytes):
        body = body.decode('utf-8')
    return {
        'payload': json.loads(body) if body.strip().startswith('{') else body,
        'message_id': message.properties.headers.get('message-id'),
        'correlation_id': message.properties.headers.get('correlation-id')
    }
```

### RabbitMQ – Headers as Envelope

```javascript
// Producer: wrap
channel.publish('', 'orders', body, {
  persistent: true,
  headers: {
    'x-message-id': generateId(),
    'x-correlation-id': correlationId,
    'x-source': 'order-api',
    'x-timestamp': new Date().toISOString()
  }
});

// Consumer: unwrap
channel.consume('orders', (msg) => {
  const payload = JSON.parse(msg.content.toString());
  const envelope = msg.properties.headers || {};
  const correlationId = envelope['x-correlation-id'];
  processOrder(payload, correlationId);
  channel.ack(msg);
});
```

---

## 📊 When to Use Envelope Wrapper

| Scenario | Use envelope |
|----------|----------------|
| Need correlation/tracing across services | ✅ Add correlation-id, trace headers |
| Router/filter must decide by metadata only | ✅ Put routing keys in headers |
| Protocol requires wrapper (SOAP, JMS) | ✅ Wrap in protocol envelope |
| Consumer must not see infrastructure metadata | ✅ Unwrap and pass only payload |
| Same payload, different contexts | ✅ Add context in envelope |

**Don’t use for:** Transforming payload format (use Message Translator); splitting/combining messages (use Splitter/Aggregator).

---

## ⚠️ Common Pitfalls

### 1. Losing Correlation on Unwrap

```javascript
// ❌ BAD: Unwrap and drop correlation
const payload = JSON.parse(message.body);
await nextStep(payload);  // Downstream can't correlate

// ✅ GOOD: Pass correlation through
const { payload, correlationId } = unwrap(message);
await nextStep(payload, { correlationId });
```

### 2. Putting Business Data Only in Headers

Headers are for metadata; large or critical business data belongs in the payload so it’s persisted and translated with the message.

### 3. Inconsistent Envelope Shape

Standardize envelope format (e.g. always `message-id`, `correlation-id`, `timestamp`) so all components know what to expect.

---

## 🎯 Best Practices

1. **Standard headers** – Use consistent names (`message-id`, `correlation-id`, `source`, `timestamp`) across services.
2. **Preserve correlation** – When unwrapping, pass correlation-id to logging and to the next hop.
3. **Idempotency keys** – Carry idempotency key in envelope when processing must be deduplicated.
4. **Schema version** – Add `schema-version` or `content-type` so consumers can handle multiple versions.
5. **Don’t overload headers** – Keep headers small; put large or business-critical data in the payload.

---

## 🔗 Related Patterns

| Pattern | Relationship |
|---------|--------------|
| **Message Translator** | Translator often changes body format; envelope carries metadata. Can translate envelope and body together. |
| **Content-Based Router** | Router reads envelope headers to route; Envelope Wrapper adds those headers. |
| **Message Filter** | Filter can use envelope headers to decide pass/reject. |
| **Request-Reply** | Correlation-id in envelope ties request and reply. |

---

## 📝 Key Takeaways

1. **Envelope** = metadata wrapper around the payload (headers, protocol wrapper).
2. **Wrap** to add correlation, tracing, source, timestamp; **unwrap** when the app only needs the payload.
3. Use **consistent header names** and **preserve correlation** when unwrapping.
4. Keep **business data in the payload**; use envelope for infrastructure and routing.
5. Envelope Wrapper complements **Message Translator** (format) and **Content-Based Router** (routing by headers).

---

**Date Created:** 2026-03-05  
**Pattern Type:** Integration / Message Structure  
**Difficulty:** Intermediate  
**Related Patterns:** Message Translator, Content-Based Router, Message Filter
