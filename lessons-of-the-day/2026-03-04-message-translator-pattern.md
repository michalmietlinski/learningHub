# Message Translator Pattern

## 📋 Learning Objectives

- [ ] Understand what message translation is and when to use it
- [ ] Learn format conversion (XML, JSON, CSV, etc.)
- [ ] Master the canonical data model approach
- [ ] Implement translators in different technologies
- [ ] Handle envelope, header, and body transformation
- [ ] Apply best practices and avoid common pitfalls

---

## 🎯 Definition

The **Message Translator** is an Enterprise Integration Pattern (EIP) that converts a message from one format to another so that the receiving system can understand it. The translator changes the message structure, encoding, or protocol representation without changing the business meaning.

**Key Principle:**
> "Transform message format so that the receiver understands it" - Decouple systems that speak different formats by translating in between.

---

## 🏗️ Core Concepts

### What is Message Translation?

```
┌──────────┐      ┌─────────────┐      ┌──────────────┐      ┌──────────┐
│ System A │─────▶│   Message   │─────▶│  Translator  │─────▶│ System B │
│ (XML)    │      │   (XML)     │      │  XML → JSON  │      │ (JSON)   │
└──────────┘      └─────────────┘      └──────────────┘      └──────────┘
```

**How it works:**
1. A message arrives in **source format** (e.g. XML, legacy CSV, SOAP envelope).
2. The translator **parses** the message and **maps** fields to the target format.
3. It produces a new message in **target format** (e.g. JSON, canonical model, REST payload).
4. The translated message is sent to the destination; the receiver sees only the format it expects.

**Use cases:**
- **Format conversion** – XML ↔ JSON, CSV → JSON, binary → structured
- **Legacy integration** – Old system sends fixed-width or EDI; translate to internal API format
- **Canonical model** – Many systems send different formats; translate all to/from one internal format
- **Protocol adaptation** – SOAP body → REST JSON; JMS MapMessage → domain event

### Key Terminology

| Term | Description |
|------|-------------|
| **Source format** | The format of the incoming message |
| **Target format** | The format of the outgoing message |
| **Canonical model** | Single internal format used across the integration layer |
| **Envelope** | Wrapper (headers, metadata) around the message body |
| **Content translation** | Transforming the message body (payload) |
| **Header translation** | Transforming or adding message headers/metadata |

---

## 🔄 Translation Strategies

### 1. Direct Format Conversion

Convert from one format to another with a fixed mapping.

```javascript
// XML → JSON
const xml2js = require('xml2js');

async function translateXmlToJson(message) {
  const body = message.body.toString();
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(body);
  return {
    body: JSON.stringify(result),
    headers: {
      ...message.headers,
      'content-type': 'application/json'
    }
  };
}

// JSON → XML
const js2xmlparser = require('js2xmlparser');

function translateJsonToXml(message) {
  const obj = JSON.parse(message.body.toString());
  const xml = js2xmlparser.parse('root', obj);
  return {
    body: xml,
    headers: {
      ...message.headers,
      'content-type': 'application/xml'
    }
  };
}
```

### 2. Canonical Data Model

Translate every external format to/from one internal format. Systems integrate only with the canonical model.

```
  System A (XML) ──┐
                   ├──▶ [Translator] ──▶ Canonical (internal) ──▶ [Translator] ──▶ System B (JSON)
  System C (CSV) ──┘
```

```javascript
// Canonical order format (internal)
const canonicalOrder = {
  orderId: string,
  customerId: string,
  items: { productId: string, quantity: number }[],
  totalAmount: number,
  currency: string
};

// Legacy XML → Canonical
function translateLegacyXmlToCanonical(message) {
  const parsed = parseXml(message.body);
  return {
    body: JSON.stringify({
      orderId: parsed.OrderHeader.OrderID,
      customerId: parsed.OrderHeader.CustomerID,
      items: parsed.OrderLines.Line.map(l => ({
        productId: l.ProductID,
        quantity: parseInt(l.Qty, 10)
      })),
      totalAmount: parseFloat(parsed.OrderHeader.Total),
      currency: parsed.OrderHeader.Currency || 'USD'
    }),
    headers: { ...message.headers, 'x-format': 'canonical' }
  };
}

// Canonical → REST API JSON (target system)
function translateCanonicalToApiFormat(message) {
  const order = JSON.parse(message.body);
  return {
    body: JSON.stringify({
      id: order.orderId,
      customer_id: order.customerId,
      line_items: order.items.map(i => ({ product_id: i.productId, qty: i.quantity })),
      total: order.totalAmount,
      currency: order.currency
    }),
    headers: { ...message.headers, 'content-type': 'application/json' }
  };
}
```

### 3. Field Mapping and Renaming

Map source field names and structures to target (e.g. snake_case ↔ camelCase, legacy names → domain names).

```javascript
const fieldMappings = {
  'OrderID': 'orderId',
  'CustomerID': 'customerId',
  'OrderLines': 'items',
  'Total': 'totalAmount'
};

function translateByMapping(message) {
  const source = JSON.parse(message.body.toString());
  const target = {};
  for (const [from, to] of Object.entries(fieldMappings)) {
    const value = getNested(source, from);
    if (value !== undefined) setNested(target, to, value);
  }
  return { body: JSON.stringify(target), headers: message.headers };
}
```

### 4. Envelope and Header Translation

Change wrapper and headers while keeping or translating the body.

```javascript
function translateEnvelope(message) {
  const body = message.body;
  const sourceHeaders = message.headers || {};
  return {
    body,
    headers: {
      'message-id': sourceHeaders['x-request-id'] || generateId(),
      'correlation-id': sourceHeaders['correlation-id'],
      'source-system': sourceHeaders['source'] || 'unknown',
      'timestamp': new Date().toISOString(),
      'content-type': 'application/json'
    }
  };
}
```

### 5. Content Enrichment (Translate + Add Data)

Translation plus adding data from external sources (lookups, defaults).

```javascript
async function translateAndEnrich(message) {
  const order = JSON.parse(message.body.toString());
  const customer = await customerService.getById(order.customerId);
  return {
    body: JSON.stringify({
      ...order,
      customerName: customer.name,
      customerSegment: customer.segment,
      translatedAt: new Date().toISOString()
    }),
    headers: message.headers
  };
}
```

---

## 🛠️ Implementation Examples

### Node.js – Generic Message Translator

```javascript
class MessageTranslator {
  constructor(translateFn) {
    this.translateFn = translateFn;
  }

  async translate(message) {
    const result = await this.translateFn({
      body: message.body,
      headers: message.headers || {}
    });
    return {
      body: Buffer.isBuffer(result.body) ? result.body : Buffer.from(
        typeof result.body === 'string' ? result.body : JSON.stringify(result.body)
      ),
      headers: result.headers || message.headers
    };
  }
}

// Usage: JSON to API format
const jsonToApiTranslator = new MessageTranslator((msg) => {
  const src = JSON.parse(msg.body.toString());
  return {
    body: JSON.stringify({
      order_id: src.orderId,
      customer_id: src.customerId,
      items: src.items,
      total: src.totalAmount
    }),
    headers: { ...msg.headers, 'content-type': 'application/json' }
  };
});
```

### Node.js – Pipeline of Translators

```javascript
async function translatePipeline(message, translators) {
  let current = { body: message.body, headers: message.headers || {} };
  for (const translator of translators) {
    current = await translator.translate(current);
  }
  return current;
}

// Example: XML → Canonical → API JSON
const pipeline = [
  new MessageTranslator(xmlToCanonical),
  new MessageTranslator(canonicalToApiJson)
];
const translated = await translatePipeline(incomingMessage, pipeline);
```

### Python – Message Translator

```python
import json
import xml.etree.ElementTree as ET

def translate_xml_to_json(message):
    body = message.body.decode('utf-8')
    root = ET.fromstring(body)
    data = {
        'orderId': root.find('OrderID').text,
        'customerId': root.find('CustomerID').text,
        'items': [
            {'productId': el.find('ProductID').text, 'quantity': int(el.find('Qty').text)}
            for el in root.findall('.//Line')
        ],
        'totalAmount': float(root.find('Total').text)
    }
    return {
        'body': json.dumps(data),
        'headers': {**message.headers, 'content-type': 'application/json'}
    }

def translate_json_to_canonical(message):
    data = json.loads(message.body.decode('utf-8'))
    canonical = {
        'orderId': data.get('order_id') or data.get('orderId'),
        'customerId': data.get('customer_id') or data.get('customerId'),
        'items': data.get('items') or data.get('line_items', []),
        'totalAmount': data.get('total') or data.get('totalAmount'),
        'currency': data.get('currency', 'USD')
    }
    return {
        'body': json.dumps(canonical),
        'headers': {**message.headers, 'x-format': 'canonical'}
    }
```

### Java / Apache Camel – Message Translator

```java
from("jms:incoming-orders")
    .convertBodyTo(String.class)
    .setHeader("Content-Type", constant("application/json"))
    .transform(body().method(OrderTranslator.class, "xmlToJson"))
    .to("jms:outgoing-orders");

// Or using Bean
from("jms:incoming")
    .bean(OrderTranslator.class, "translate")
    .to("jms:outgoing");
```

### GraphQL / REST – Resolver as Translator

```javascript
// Backend returns canonical model; GraphQL layer translates to schema shape
const resolvers = {
  Order: {
    lineItems: (order) => order.items.map(i => ({
      product: { id: i.productId },
      quantity: i.quantity
    })),
    total: (order) => ({ amount: order.totalAmount, currency: order.currency })
  }
};
```

---

## 📊 When to Use Message Translator

| Scenario | Use Translator |
|----------|----------------|
| System A sends XML, System B expects JSON | ✅ |
| Multiple systems each with different formats | ✅ Use canonical model + translators |
| Legacy system uses fixed-width or EDI | ✅ |
| Only need to route or filter, same format | ❌ Use Router/Filter |
| Need to split one message into many | ❌ Use Splitter |
| Need to change transport or protocol only | ⚠️ May be part of adapter; translator focuses on message content |

---

## ⚠️ Common Pitfalls

### 1. Losing Data During Translation

```javascript
// ❌ BAD: Only map known fields, drop the rest
const target = { orderId: source.OrderID, customerId: source.CustomerID };

// ✅ GOOD: Explicit mapping + pass-through or document unknown fields
const target = {
  orderId: source.OrderID,
  customerId: source.CustomerID,
  _unknown: source._unknown ?? {}  // or preserve known extra fields
};
```

### 2. Not Handling Invalid or Missing Fields

```javascript
// ❌ BAD: Assumes all fields exist
const orderId = source.OrderID;

// ✅ GOOD: Validate and default or fail clearly
const orderId = source?.OrderID ?? source?.orderId;
if (!orderId) throw new TranslationError('Missing order identifier');
```

### 3. Changing Business Meaning

Translation should preserve semantics. Don’t alter business rules (e.g. rounding, units) inside a “format” translator; do that in a dedicated service or rule.

### 4. Blocking the Pipeline

Keep translation fast. If you need lookups (e.g. enrich from DB), consider async enrichment or a separate step so the translator stays a pure format transform.

---

## 🎯 Best Practices

1. **Single responsibility** – One translator: one direction, one purpose (e.g. “XML → canonical” only).
2. **Canonical model** – Prefer translating to/from one internal format rather than N×N direct conversions.
3. **Idempotency** – Translating the same message twice should yield the same result.
4. **Preserve correlation** – Forward correlation-id, request-id, and other tracing headers.
5. **Versioning** – Support multiple source/target versions (e.g. by header `x-format-version`) and document compatibility.
6. **Test** – Unit test translators with sample payloads and edge cases (missing fields, null, empty arrays).

---

## 🔗 Related Patterns

| Pattern | Relationship |
|---------|--------------|
| **Envelope Wrapper** | Adds/removes envelope; translator often changes body and headers together |
| **Content-Based Router** | Router uses content; translator changes content for downstream |
| **Message Filter** | Filter passes/rejects; translator transforms |
| **Data Transfer Object (DTO)** | DTOs are often the target of translation (API ↔ domain) |
| **Adapter** | Adapter may include protocol + message translation |

---

## 📝 Key Takeaways

1. **Message Translator** converts message format so the receiver understands it (format, structure, headers).
2. **Canonical model** reduces N×N conversions to N translators (each system ↔ canonical).
3. Translate **envelope and headers** as well as body when the target system expects specific metadata.
4. Keep translation **deterministic and side-effect free** where possible; do enrichment in a separate step if needed.
5. **Validate** input and **preserve** correlation and tracing headers across the pipeline.

---

**Date Created:** 2026-03-04  
**Pattern Type:** Integration / Transformation  
**Difficulty:** Intermediate  
**Related Patterns:** Envelope Wrapper, Content-Based Router, DTO, Adapter
