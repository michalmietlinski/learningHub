# REST API Design Principles - Deep Dive

## 📋 Learning Objectives

- [ ] Understand REST definition, constraints, and architectural principles
- [ ] Master the Richardson Maturity Model (Levels 0-3)
- [ ] Learn resource naming conventions and URI design
- [ ] Understand proper HTTP method usage (GET, POST, PUT, PATCH, DELETE)
- [ ] Master HTTP status codes for different scenarios
- [ ] Learn pagination, filtering, and sorting patterns
- [ ] Understand HATEOAS and hypermedia-driven APIs
- [ ] Practice API versioning strategies
- [ ] Learn error handling and response design
- [ ] Explore real-world API design best practices

---

## 🎯 Definition

**REST (Representational State Transfer)** is an architectural style for designing networked applications. It relies on a stateless, client-server communication protocol (typically HTTP) and treats server-side resources as objects that can be created, read, updated, or deleted using standard HTTP methods.

**Origin:**
- Defined by Roy Fielding in his 2000 doctoral dissertation
- Described as the architectural style of the World Wide Web
- Became the dominant API design approach in the 2000s-2010s
- Alternative to SOAP and RPC-style web services
- Foundation for modern web APIs and microservices
- Powers most public APIs (Twitter, GitHub, Stripe, etc.)

**REST Constraints:**
1. **Client-Server** - Separation of concerns between UI and data storage
2. **Stateless** - Each request contains all information needed to process it
3. **Cacheable** - Responses must define themselves as cacheable or not
4. **Uniform Interface** - Standardized way to interact with resources
5. **Layered System** - Client can't tell if connected directly to server
6. **Code on Demand** (optional) - Server can extend client functionality

**Key Principle:**
> "REST is an architectural style that defines constraints for creating scalable web services. RESTful APIs use HTTP methods explicitly, are stateless, expose directory structure-like URIs, and transfer data in JSON or XML format."

**Alternative Formulation:**
> "REST treats everything as a resource identified by a URI. Clients interact with resources using standard HTTP methods (GET, POST, PUT, DELETE), receiving representations of resources (typically JSON) that can include links to related resources."

---

## 🏗️ Structure

### REST Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         REST API                                 │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Uniform Interface                         ││
│  │                                                              ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      ││
│  │  │  Resources   │  │    HTTP      │  │   Resource   │      ││
│  │  │  (URIs)      │  │   Methods    │  │   Represent- │      ││
│  │  │              │  │              │  │   ations     │      ││
│  │  │ /users       │  │ GET          │  │ JSON         │      ││
│  │  │ /users/{id}  │  │ POST         │  │ XML          │      ││
│  │  │ /orders      │  │ PUT          │  │ HTML         │      ││
│  │  │ /products    │  │ PATCH        │  │              │      ││
│  │  │              │  │ DELETE       │  │              │      ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘      ││
│  │                                                              ││
│  │  ┌──────────────────────────────────────────────────────┐  ││
│  │  │                   HATEOAS                              │  ││
│  │  │  Hypermedia As The Engine Of Application State        │  ││
│  │  │  Links guide clients through available actions        │  ││
│  │  └──────────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Stateless   │  │  Cacheable   │  │   Layered    │          │
│  │              │  │              │  │   System     │          │
│  │ No session   │  │ ETags        │  │ Proxies      │          │
│  │ state on     │  │ Cache-Control│  │ Gateways     │          │
│  │ server       │  │ Last-Modified│  │ Load         │          │
│  │              │  │              │  │ Balancers    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### HTTP Methods and CRUD Operations

```
┌─────────────────────────────────────────────────────────────────┐
│                   HTTP Methods → CRUD                            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │   HTTP Method    CRUD         Safe?   Idempotent?           ││
│  │   ───────────    ────         ─────   ──────────            ││
│  │                                                              ││
│  │   GET            Read         ✅ Yes   ✅ Yes                ││
│  │   POST           Create       ❌ No    ❌ No                 ││
│  │   PUT            Replace      ❌ No    ✅ Yes                ││
│  │   PATCH          Update       ❌ No    ❌ No*                ││
│  │   DELETE         Delete       ❌ No    ✅ Yes                ││
│  │                                                              ││
│  │   * PATCH can be idempotent if designed properly            ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Safe = No side effects (read-only)                             │
│  Idempotent = Multiple identical requests = same result         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Resource URI Design

```
┌─────────────────────────────────────────────────────────────────┐
│                   URI Structure                                  │
│                                                                  │
│   https://api.example.com/v1/users/123/orders?status=pending    │
│   ─────────────────────── ── ───── ─── ────── ─────────────     │
│           │                │   │    │    │          │           │
│           │                │   │    │    │          └─ Query    │
│           │                │   │    │    │             Params   │
│           │                │   │    │    │                      │
│           │                │   │    │    └─ Sub-resource        │
│           │                │   │    │                           │
│           │                │   │    └─ Resource ID              │
│           │                │   │                                │
│           │                │   └─ Collection                    │
│           │                │                                    │
│           │                └─ Version                           │
│           │                                                     │
│           └─ Base URL                                           │
│                                                                  │
│  Examples:                                                       │
│  ────────                                                        │
│  GET    /users              → List all users                    │
│  GET    /users/123          → Get user 123                      │
│  POST   /users              → Create new user                   │
│  PUT    /users/123          → Replace user 123                  │
│  PATCH  /users/123          → Update user 123                   │
│  DELETE /users/123          → Delete user 123                   │
│                                                                  │
│  GET    /users/123/orders   → Get orders for user 123           │
│  POST   /users/123/orders   → Create order for user 123         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Core Concepts Deep Dive

### 1. Richardson Maturity Model

The Richardson Maturity Model (RMM) describes levels of REST maturity:

```
┌─────────────────────────────────────────────────────────────────┐
│              Richardson Maturity Model                           │
│                                                                  │
│  Level 3: Hypermedia Controls (HATEOAS)        ┌───────────┐   │
│  ─────────────────────────────────────────     │  Glory of │   │
│  • Responses include links to related actions  │   REST    │   │
│  • Self-documenting API                        └───────────┘   │
│  • Discoverable through hypermedia                    ▲        │
│                                                       │        │
│  Level 2: HTTP Verbs                                  │        │
│  ───────────────────                                  │        │
│  • Proper use of GET, POST, PUT, DELETE              │        │
│  • HTTP status codes                                  │        │
│  • Most "REST" APIs are here                          │        │
│                                                       │        │
│  Level 1: Resources                                   │        │
│  ──────────────────                                   │        │
│  • Multiple URIs for different resources             │        │
│  • Individual endpoints                               │        │
│  • Still using single HTTP method                     │        │
│                                                       │        │
│  Level 0: The Swamp of POX                           │        │
│  ─────────────────────────                            │        │
│  • HTTP as transport only                             │        │
│  • Single URI, single method (POST)                  │        │
│  • SOAP-style, RPC-style                              │        │
│                                                       │        │
└─────────────────────────────────────────────────────────────────┘
```

**Level 0 Example (RPC Style):**
```http
POST /api HTTP/1.1
Content-Type: application/json

{
    "method": "getUser",
    "params": { "userId": 123 }
}
```

**Level 1 Example (Resources):**
```http
POST /users/123 HTTP/1.1
Content-Type: application/json

{
    "action": "get"
}
```

**Level 2 Example (HTTP Verbs):**
```http
GET /users/123 HTTP/1.1
Accept: application/json
```

**Level 3 Example (HATEOAS):**
```http
GET /users/123 HTTP/1.1
Accept: application/json

Response:
{
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "_links": {
        "self": { "href": "/users/123" },
        "orders": { "href": "/users/123/orders" },
        "update": { "href": "/users/123", "method": "PUT" },
        "delete": { "href": "/users/123", "method": "DELETE" }
    }
}
```

### 2. Resource Naming Conventions

**Best Practices:**

```
✅ DO:
────────────────────────────────────────────────────────────────
• Use nouns for resources          /users, /products, /orders
• Use plural names                 /users (not /user)
• Use lowercase                    /users (not /Users)
• Use hyphens for readability      /user-accounts
• Use hierarchy for relationships  /users/123/orders
• Use query params for filtering   /users?status=active

❌ DON'T:
────────────────────────────────────────────────────────────────
• Use verbs in URIs               /getUsers, /createUser
• Use file extensions             /users.json, /users.xml
• Use underscores                 /user_accounts
• Use CRUD names                  /users/create, /users/delete
• Use inconsistent naming         /user vs /products
```

**Resource Naming Examples:**

```
Good URI Design:
────────────────────────────────────────────────────────────────
GET    /users                    List all users
GET    /users/123                Get user 123
POST   /users                    Create a user
PUT    /users/123                Replace user 123
PATCH  /users/123                Partially update user 123
DELETE /users/123                Delete user 123

GET    /users/123/orders         Get orders for user 123
GET    /users/123/orders/456     Get order 456 for user 123
POST   /users/123/orders         Create order for user 123

GET    /products                 List all products
GET    /products?category=electronics    Filter by category
GET    /products?sort=price&order=asc    Sort by price

Bad URI Design:
────────────────────────────────────────────────────────────────
GET    /getUsers                 ❌ Verb in URI
GET    /user/123                 ❌ Singular
POST   /users/create             ❌ CRUD in URI
GET    /Users/123                ❌ Uppercase
DELETE /users/123/delete         ❌ Redundant action
GET    /get-all-users            ❌ Verb and hyphen
```

### 3. HTTP Status Codes

**Success Codes (2xx):**

| Code | Name | Usage |
|------|------|-------|
| `200` | OK | Successful GET, PUT, PATCH, DELETE |
| `201` | Created | Successful POST (resource created) |
| `202` | Accepted | Request accepted for async processing |
| `204` | No Content | Successful DELETE (no response body) |

**Client Error Codes (4xx):**

| Code | Name | Usage |
|------|------|-------|
| `400` | Bad Request | Invalid request syntax, malformed JSON |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Authenticated but not authorized |
| `404` | Not Found | Resource doesn't exist |
| `405` | Method Not Allowed | HTTP method not supported for resource |
| `409` | Conflict | Conflict with current state (duplicate, etc.) |
| `422` | Unprocessable Entity | Validation errors |
| `429` | Too Many Requests | Rate limit exceeded |

**Server Error Codes (5xx):**

| Code | Name | Usage |
|------|------|-------|
| `500` | Internal Server Error | Unexpected server error |
| `502` | Bad Gateway | Invalid response from upstream server |
| `503` | Service Unavailable | Server temporarily unavailable |
| `504` | Gateway Timeout | Upstream server timeout |

**Status Code Decision Tree:**

```
Request Received
       │
       ▼
   Valid Request?
       │
   ┌───┴───┐
   │       │
  No      Yes
   │       │
   ▼       ▼
  4xx   Authorized?
         │
     ┌───┴───┐
     │       │
    No      Yes
     │       │
     ▼       ▼
   401/403  Resource Exists?
              │
          ┌───┴───┐
          │       │
         No      Yes
          │       │
          ▼       ▼
         404   Operation Success?
                 │
             ┌───┴───┐
             │       │
            No      Yes
             │       │
             ▼       ▼
           5xx     2xx
```

### 4. Request and Response Design

**Request Headers:**

```http
GET /users/123 HTTP/1.1
Host: api.example.com
Accept: application/json
Accept-Language: en-US
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
Cache-Control: no-cache
```

**Response Headers:**

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 256
Cache-Control: max-age=3600
ETag: "33a64df551425fcc55e4d42a148795d9f25f89d4"
Last-Modified: Sat, 07 Feb 2026 10:00:00 GMT
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1612742400
```

**Response Body Structure:**

```json
{
    "data": {
        "id": 123,
        "type": "user",
        "attributes": {
            "name": "John Doe",
            "email": "john@example.com",
            "createdAt": "2026-01-15T10:30:00Z",
            "updatedAt": "2026-02-01T14:20:00Z"
        },
        "relationships": {
            "orders": {
                "links": {
                    "related": "/users/123/orders"
                }
            },
            "profile": {
                "data": { "type": "profile", "id": "456" }
            }
        }
    },
    "meta": {
        "requestId": "550e8400-e29b-41d4",
        "timestamp": "2026-02-08T12:00:00Z"
    },
    "links": {
        "self": "/users/123"
    }
}
```

### 5. Pagination Patterns

**Offset-Based Pagination:**

```http
GET /users?offset=0&limit=20

Response:
{
    "data": [...],
    "pagination": {
        "offset": 0,
        "limit": 20,
        "total": 150
    },
    "links": {
        "self": "/users?offset=0&limit=20",
        "next": "/users?offset=20&limit=20",
        "last": "/users?offset=140&limit=20"
    }
}
```

**Page-Based Pagination:**

```http
GET /users?page=1&per_page=20

Response:
{
    "data": [...],
    "pagination": {
        "page": 1,
        "perPage": 20,
        "totalPages": 8,
        "totalItems": 150
    },
    "links": {
        "self": "/users?page=1&per_page=20",
        "first": "/users?page=1&per_page=20",
        "prev": null,
        "next": "/users?page=2&per_page=20",
        "last": "/users?page=8&per_page=20"
    }
}
```

**Cursor-Based Pagination (Recommended for large datasets):**

```http
GET /users?cursor=eyJpZCI6MTIzfQ&limit=20

Response:
{
    "data": [...],
    "pagination": {
        "cursor": "eyJpZCI6MTQzfQ",
        "hasMore": true
    },
    "links": {
        "self": "/users?cursor=eyJpZCI6MTIzfQ&limit=20",
        "next": "/users?cursor=eyJpZCI6MTQzfQ&limit=20"
    }
}
```

**Pagination Comparison:**

| Method | Pros | Cons |
|--------|------|------|
| **Offset** | Simple, random access | Slow for large offsets, inconsistent with changes |
| **Page** | User-friendly | Same as offset |
| **Cursor** | Consistent, performant | No random access, opaque cursor |

### 6. Filtering, Sorting, and Searching

**Filtering:**

```http
# Simple filtering
GET /products?category=electronics
GET /products?category=electronics&brand=apple

# Multiple values
GET /products?category=electronics,clothing
GET /products?status[]=active&status[]=pending

# Range filtering
GET /products?price_min=100&price_max=500
GET /orders?created_after=2026-01-01&created_before=2026-02-01

# Comparison operators
GET /products?price[gte]=100&price[lte]=500
GET /products?rating[gt]=4
```

**Sorting:**

```http
# Single sort
GET /products?sort=price
GET /products?sort=-price          # Descending (minus prefix)

# Multiple sort
GET /products?sort=category,-price  # Category asc, then price desc

# Alternative syntax
GET /products?sort_by=price&order=asc
GET /products?orderBy=price&orderDir=desc
```

**Searching:**

```http
# Full-text search
GET /products?q=laptop
GET /products?search=laptop

# Field-specific search
GET /users?email_contains=@gmail.com
GET /products?name_starts_with=Apple
```

**Combined Example:**

```http
GET /products?category=electronics&price[gte]=100&price[lte]=1000&sort=-rating,price&page=1&per_page=20&q=laptop
```

### 7. HATEOAS (Hypermedia)

**Definition:**
HATEOAS (Hypermedia As The Engine Of Application State) means that API responses include links to related resources and available actions.

**Basic HATEOAS Response:**

```json
{
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "status": "active",
    "_links": {
        "self": {
            "href": "/users/123"
        },
        "orders": {
            "href": "/users/123/orders"
        },
        "profile": {
            "href": "/users/123/profile"
        },
        "deactivate": {
            "href": "/users/123/deactivate",
            "method": "POST"
        }
    }
}
```

**HAL (Hypertext Application Language) Format:**

```json
{
    "_links": {
        "self": { "href": "/orders/123" },
        "customer": { "href": "/customers/456" },
        "items": { "href": "/orders/123/items" }
    },
    "_embedded": {
        "items": [
            {
                "_links": {
                    "self": { "href": "/products/789" }
                },
                "name": "Widget",
                "price": 9.99,
                "quantity": 2
            }
        ]
    },
    "id": 123,
    "status": "processing",
    "total": 19.98,
    "currency": "USD"
}
```

**JSON:API Format:**

```json
{
    "data": {
        "type": "orders",
        "id": "123",
        "attributes": {
            "status": "processing",
            "total": 19.98
        },
        "relationships": {
            "customer": {
                "links": {
                    "related": "/orders/123/customer"
                },
                "data": { "type": "customers", "id": "456" }
            },
            "items": {
                "links": {
                    "related": "/orders/123/items"
                }
            }
        },
        "links": {
            "self": "/orders/123"
        }
    },
    "included": [
        {
            "type": "customers",
            "id": "456",
            "attributes": {
                "name": "John Doe"
            }
        }
    ]
}
```

### 8. API Versioning

**Versioning Strategies:**

**1. URI Path Versioning (Most Common):**
```http
GET /v1/users/123
GET /v2/users/123

# Pros: Clear, easy to implement
# Cons: Not truly RESTful (version in URI)
```

**2. Query Parameter Versioning:**
```http
GET /users/123?version=1
GET /users/123?api-version=2026-02-08

# Pros: Clean URIs
# Cons: Easy to miss, caching complications
```

**3. Header Versioning:**
```http
GET /users/123
Accept: application/vnd.example.v1+json
Accept: application/vnd.example.v2+json

# Or custom header:
GET /users/123
X-API-Version: 1

# Pros: Clean URIs, RESTful
# Cons: Less visible, harder to test
```

**4. Content Negotiation (Media Type):**
```http
GET /users/123
Accept: application/vnd.example.user.v1+json

# Pros: Most RESTful
# Cons: Complex, less common
```

**Versioning Best Practices:**

```
✅ DO:
• Version from day one
• Use semantic versioning for major changes
• Support at least N-1 version
• Provide clear deprecation timeline
• Document version differences

❌ DON'T:
• Break backward compatibility in same version
• Remove versions without notice
• Version too frequently
• Make breaking changes for minor issues
```

### 9. Error Handling

**Error Response Structure:**

```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "The request contains invalid data",
        "details": [
            {
                "field": "email",
                "code": "INVALID_FORMAT",
                "message": "Email must be a valid email address"
            },
            {
                "field": "age",
                "code": "OUT_OF_RANGE",
                "message": "Age must be between 18 and 120"
            }
        ],
        "timestamp": "2026-02-08T12:00:00Z",
        "path": "/users",
        "requestId": "550e8400-e29b-41d4"
    }
}
```

**RFC 7807 Problem Details:**

```json
{
    "type": "https://api.example.com/errors/validation-error",
    "title": "Validation Error",
    "status": 422,
    "detail": "The request body contains invalid fields",
    "instance": "/users",
    "errors": [
        {
            "pointer": "/data/attributes/email",
            "detail": "Invalid email format"
        }
    ]
}
```

**Error Responses by Status Code:**

```json
// 400 Bad Request
{
    "error": {
        "code": "INVALID_JSON",
        "message": "Request body is not valid JSON"
    }
}

// 401 Unauthorized
{
    "error": {
        "code": "INVALID_TOKEN",
        "message": "The access token is invalid or expired"
    }
}

// 403 Forbidden
{
    "error": {
        "code": "INSUFFICIENT_PERMISSIONS",
        "message": "You do not have permission to access this resource"
    }
}

// 404 Not Found
{
    "error": {
        "code": "RESOURCE_NOT_FOUND",
        "message": "User with ID 123 not found"
    }
}

// 409 Conflict
{
    "error": {
        "code": "DUPLICATE_RESOURCE",
        "message": "A user with this email already exists"
    }
}

// 429 Too Many Requests
{
    "error": {
        "code": "RATE_LIMIT_EXCEEDED",
        "message": "Too many requests. Please retry after 60 seconds",
        "retryAfter": 60
    }
}

// 500 Internal Server Error
{
    "error": {
        "code": "INTERNAL_ERROR",
        "message": "An unexpected error occurred",
        "requestId": "550e8400-e29b-41d4"
    }
}
```

---

## 💻 Implementation Examples

### Node.js/Express REST API

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// In-memory data store
let users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active' }
];
let nextId = 3;

// Middleware: Request logging
app.use((req, res, next) => {
    req.requestId = crypto.randomUUID();
    res.setHeader('X-Request-ID', req.requestId);
    console.log(`${req.method} ${req.path} [${req.requestId}]`);
    next();
});

// GET /users - List all users with pagination and filtering
app.get('/users', (req, res) => {
    let result = [...users];
    
    // Filtering
    if (req.query.status) {
        result = result.filter(u => u.status === req.query.status);
    }
    if (req.query.search) {
        const search = req.query.search.toLowerCase();
        result = result.filter(u => 
            u.name.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search)
        );
    }
    
    // Sorting
    if (req.query.sort) {
        const sortField = req.query.sort.replace('-', '');
        const sortOrder = req.query.sort.startsWith('-') ? -1 : 1;
        result.sort((a, b) => {
            if (a[sortField] < b[sortField]) return -1 * sortOrder;
            if (a[sortField] > b[sortField]) return 1 * sortOrder;
            return 0;
        });
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const totalItems = result.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const offset = (page - 1) * perPage;
    
    result = result.slice(offset, offset + perPage);
    
    res.json({
        data: result,
        pagination: {
            page,
            perPage,
            totalItems,
            totalPages
        },
        links: {
            self: `/users?page=${page}&per_page=${perPage}`,
            first: `/users?page=1&per_page=${perPage}`,
            prev: page > 1 ? `/users?page=${page - 1}&per_page=${perPage}` : null,
            next: page < totalPages ? `/users?page=${page + 1}&per_page=${perPage}` : null,
            last: `/users?page=${totalPages}&per_page=${perPage}`
        }
    });
});

// GET /users/:id - Get single user
app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    
    if (!user) {
        return res.status(404).json({
            error: {
                code: 'RESOURCE_NOT_FOUND',
                message: `User with ID ${req.params.id} not found`,
                requestId: req.requestId
            }
        });
    }
    
    res.json({
        data: user,
        links: {
            self: `/users/${user.id}`,
            orders: `/users/${user.id}/orders`,
            update: { href: `/users/${user.id}`, method: 'PUT' },
            delete: { href: `/users/${user.id}`, method: 'DELETE' }
        }
    });
});

// POST /users - Create new user
app.post('/users', (req, res) => {
    const { name, email } = req.body;
    
    // Validation
    const errors = [];
    if (!name || name.trim().length === 0) {
        errors.push({
            field: 'name',
            code: 'REQUIRED',
            message: 'Name is required'
        });
    }
    if (!email || !email.includes('@')) {
        errors.push({
            field: 'email',
            code: 'INVALID_FORMAT',
            message: 'Valid email is required'
        });
    }
    if (users.find(u => u.email === email)) {
        errors.push({
            field: 'email',
            code: 'DUPLICATE',
            message: 'Email already exists'
        });
    }
    
    if (errors.length > 0) {
        return res.status(422).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: errors,
                requestId: req.requestId
            }
        });
    }
    
    const user = {
        id: nextId++,
        name: name.trim(),
        email: email.toLowerCase(),
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    users.push(user);
    
    res.status(201)
        .setHeader('Location', `/users/${user.id}`)
        .json({
            data: user,
            links: {
                self: `/users/${user.id}`
            }
        });
});

// PUT /users/:id - Replace user (full update)
app.put('/users/:id', (req, res) => {
    const index = users.findIndex(u => u.id === parseInt(req.params.id));
    
    if (index === -1) {
        return res.status(404).json({
            error: {
                code: 'RESOURCE_NOT_FOUND',
                message: `User with ID ${req.params.id} not found`
            }
        });
    }
    
    const { name, email, status } = req.body;
    
    // Full replacement - all fields required
    if (!name || !email) {
        return res.status(422).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'All fields are required for PUT'
            }
        });
    }
    
    users[index] = {
        ...users[index],
        name,
        email,
        status: status || 'active',
        updatedAt: new Date().toISOString()
    };
    
    res.json({ data: users[index] });
});

// PATCH /users/:id - Partial update
app.patch('/users/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    
    if (!user) {
        return res.status(404).json({
            error: {
                code: 'RESOURCE_NOT_FOUND',
                message: `User with ID ${req.params.id} not found`
            }
        });
    }
    
    // Only update provided fields
    const allowedFields = ['name', 'email', 'status'];
    for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
            user[field] = req.body[field];
        }
    }
    user.updatedAt = new Date().toISOString();
    
    res.json({ data: user });
});

// DELETE /users/:id - Delete user
app.delete('/users/:id', (req, res) => {
    const index = users.findIndex(u => u.id === parseInt(req.params.id));
    
    if (index === -1) {
        return res.status(404).json({
            error: {
                code: 'RESOURCE_NOT_FOUND',
                message: `User with ID ${req.params.id} not found`
            }
        });
    }
    
    users.splice(index, 1);
    res.status(204).send();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred',
            requestId: req.requestId
        }
    });
});

app.listen(3000, () => {
    console.log('REST API running on http://localhost:3000');
});
```

### Python/FastAPI REST API

```python
from fastapi import FastAPI, HTTPException, Query, Path, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

app = FastAPI(title="User API", version="1.0.0")

# Models
class UserStatus(str, Enum):
    active = "active"
    inactive = "inactive"
    suspended = "suspended"

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    
class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    status: Optional[UserStatus] = None

class User(BaseModel):
    id: int
    name: str
    email: str
    status: UserStatus
    created_at: datetime
    updated_at: Optional[datetime] = None

class UserResponse(BaseModel):
    data: User
    links: dict

class UserListResponse(BaseModel):
    data: List[User]
    pagination: dict
    links: dict

class ErrorDetail(BaseModel):
    field: Optional[str] = None
    code: str
    message: str

class ErrorResponse(BaseModel):
    code: str
    message: str
    details: Optional[List[ErrorDetail]] = None
    request_id: str

# In-memory storage
users_db: dict[int, User] = {}
next_id = 1

# Middleware for request ID
@app.middleware("http")
async def add_request_id(request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# GET /users - List users with pagination
@app.get("/users", response_model=UserListResponse)
async def list_users(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Items per page"),
    status: Optional[UserStatus] = Query(None, description="Filter by status"),
    search: Optional[str] = Query(None, description="Search in name/email"),
    sort: Optional[str] = Query(None, description="Sort field (prefix with - for desc)")
):
    result = list(users_db.values())
    
    # Filter by status
    if status:
        result = [u for u in result if u.status == status]
    
    # Search
    if search:
        search_lower = search.lower()
        result = [u for u in result if 
                  search_lower in u.name.lower() or 
                  search_lower in u.email.lower()]
    
    # Sort
    if sort:
        reverse = sort.startswith("-")
        sort_field = sort.lstrip("-")
        if hasattr(User, sort_field):
            result.sort(key=lambda u: getattr(u, sort_field), reverse=reverse)
    
    # Pagination
    total_items = len(result)
    total_pages = (total_items + per_page - 1) // per_page
    offset = (page - 1) * per_page
    result = result[offset:offset + per_page]
    
    return UserListResponse(
        data=result,
        pagination={
            "page": page,
            "per_page": per_page,
            "total_items": total_items,
            "total_pages": total_pages
        },
        links={
            "self": f"/users?page={page}&per_page={per_page}",
            "first": f"/users?page=1&per_page={per_page}",
            "prev": f"/users?page={page-1}&per_page={per_page}" if page > 1 else None,
            "next": f"/users?page={page+1}&per_page={per_page}" if page < total_pages else None,
            "last": f"/users?page={total_pages}&per_page={per_page}"
        }
    )

# GET /users/{id} - Get single user
@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int = Path(..., gt=0)):
    if user_id not in users_db:
        raise HTTPException(
            status_code=404,
            detail={
                "code": "RESOURCE_NOT_FOUND",
                "message": f"User with ID {user_id} not found"
            }
        )
    
    user = users_db[user_id]
    return UserResponse(
        data=user,
        links={
            "self": f"/users/{user_id}",
            "orders": f"/users/{user_id}/orders",
            "update": {"href": f"/users/{user_id}", "method": "PUT"},
            "delete": {"href": f"/users/{user_id}", "method": "DELETE"}
        }
    )

# POST /users - Create user
@app.post("/users", response_model=UserResponse, status_code=201)
async def create_user(user_data: UserCreate):
    global next_id
    
    # Check for duplicate email
    for existing in users_db.values():
        if existing.email == user_data.email:
            raise HTTPException(
                status_code=409,
                detail={
                    "code": "DUPLICATE_RESOURCE",
                    "message": "A user with this email already exists"
                }
            )
    
    user = User(
        id=next_id,
        name=user_data.name,
        email=user_data.email,
        status=UserStatus.active,
        created_at=datetime.utcnow()
    )
    
    users_db[next_id] = user
    next_id += 1
    
    return UserResponse(
        data=user,
        links={"self": f"/users/{user.id}"}
    )

# PUT /users/{id} - Full update
@app.put("/users/{user_id}", response_model=UserResponse)
async def replace_user(user_id: int, user_data: UserCreate):
    if user_id not in users_db:
        raise HTTPException(
            status_code=404,
            detail={"code": "RESOURCE_NOT_FOUND", "message": f"User {user_id} not found"}
        )
    
    user = users_db[user_id]
    user.name = user_data.name
    user.email = user_data.email
    user.updated_at = datetime.utcnow()
    
    return UserResponse(data=user, links={"self": f"/users/{user_id}"})

# PATCH /users/{id} - Partial update
@app.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_data: UserUpdate):
    if user_id not in users_db:
        raise HTTPException(
            status_code=404,
            detail={"code": "RESOURCE_NOT_FOUND", "message": f"User {user_id} not found"}
        )
    
    user = users_db[user_id]
    
    if user_data.name is not None:
        user.name = user_data.name
    if user_data.email is not None:
        user.email = user_data.email
    if user_data.status is not None:
        user.status = user_data.status
    
    user.updated_at = datetime.utcnow()
    
    return UserResponse(data=user, links={"self": f"/users/{user_id}"})

# DELETE /users/{id}
@app.delete("/users/{user_id}", status_code=204)
async def delete_user(user_id: int):
    if user_id not in users_db:
        raise HTTPException(
            status_code=404,
            detail={"code": "RESOURCE_NOT_FOUND", "message": f"User {user_id} not found"}
        )
    
    del users_db[user_id]
    return None
```

---

## 💡 When to Use REST

### Use REST When:

✅ **Public APIs**
- Third-party integrations
- Developer-friendly APIs
- Wide client variety
- Standard HTTP clients

✅ **CRUD Operations**
- Resource-based operations
- Standard data manipulation
- Simple business logic
- Clear resource boundaries

✅ **Cacheable Content**
- GET requests are cacheable
- Static or semi-static data
- CDN-friendly responses
- Browser caching support

✅ **Stateless Interactions**
- No session state needed
- Scalable architecture
- Load balancer friendly
- Microservices communication

### Consider Alternatives When:

❌ **Complex Queries**
- Multiple related resources
- Flexible query requirements
- Consider **GraphQL**

❌ **Real-Time Data**
- Live updates needed
- Bidirectional communication
- Consider **WebSockets** or **SSE**

❌ **High-Performance Internal APIs**
- Low latency critical
- High throughput
- Consider **gRPC**

❌ **Formal Contracts Required**
- Enterprise integration
- Strict validation
- Consider **SOAP**

---

## 🔀 REST vs Other API Styles

| Aspect | REST | GraphQL | gRPC | SOAP |
|--------|------|---------|------|------|
| **Format** | JSON/XML | JSON | Protobuf | XML |
| **Transport** | HTTP | HTTP | HTTP/2 | HTTP/SMTP |
| **Contract** | OpenAPI (optional) | Schema (required) | Proto files | WSDL |
| **Caching** | HTTP caching | Custom | Custom | Limited |
| **Learning Curve** | Low | Medium | Medium | High |
| **Flexibility** | Fixed endpoints | Flexible queries | Fixed methods | Fixed |
| **Performance** | Good | Good | Excellent | Poor |
| **Browser Support** | Native | Native | Limited | Limited |

---

## 📊 Benefits and Trade-offs

### Benefits

✅ **Simplicity**
- Uses standard HTTP
- Easy to understand
- Wide tooling support
- No special libraries needed

✅ **Scalability**
- Stateless design
- HTTP caching
- Load balancer compatible
- CDN support

✅ **Flexibility**
- Multiple formats (JSON, XML)
- Language agnostic
- Platform independent
- Loose coupling

✅ **Visibility**
- Human-readable
- Easy to debug
- Standard HTTP tools
- Browser testable

### Trade-offs

❌ **Over-fetching/Under-fetching**
- Fixed response structure
- May get more/less data than needed
- Multiple requests for related data

❌ **No Real-Time**
- Request-response only
- Polling for updates
- Not ideal for live data

❌ **Versioning Challenges**
- Breaking changes difficult
- Multiple versions to maintain
- Client migration needed

---

## ⚠️ Common Pitfalls

### 1. Using Verbs in URIs

```
❌ Bad:
GET /getUsers
POST /createUser
PUT /updateUser/123
DELETE /deleteUser/123

✅ Good:
GET /users
POST /users
PUT /users/123
DELETE /users/123
```

### 2. Ignoring HTTP Methods

```
❌ Bad:
POST /users/123/delete
POST /users/123/update

✅ Good:
DELETE /users/123
PUT /users/123
```

### 3. Wrong Status Codes

```
❌ Bad:
// Always returning 200
HTTP/1.1 200 OK
{
    "success": false,
    "error": "User not found"
}

✅ Good:
HTTP/1.1 404 Not Found
{
    "error": {
        "code": "RESOURCE_NOT_FOUND",
        "message": "User not found"
    }
}
```

### 4. Inconsistent Naming

```
❌ Bad:
/users
/Product
/order-items
/getCategories

✅ Good:
/users
/products
/order-items  (or /orders/{id}/items)
/categories
```

### 5. Deep Nesting

```
❌ Bad (too deep):
/users/123/orders/456/items/789/reviews/101

✅ Good (flattened):
/order-items/789/reviews/101
or
/reviews/101
```

---

## ✅ Best Practices

### URI Design

✅ **Do:**
- Use nouns, not verbs
- Use plural resource names
- Use lowercase with hyphens
- Keep URIs short and intuitive
- Use consistent naming

### HTTP Methods

✅ **Do:**
- GET for reading (safe, idempotent)
- POST for creating (not idempotent)
- PUT for full replacement (idempotent)
- PATCH for partial updates
- DELETE for removal (idempotent)

### Response Design

✅ **Do:**
- Use appropriate status codes
- Include helpful error messages
- Provide consistent response structure
- Include pagination metadata
- Add HATEOAS links where useful

### Security

✅ **Do:**
- Use HTTPS always
- Validate all inputs
- Use proper authentication (OAuth, JWT)
- Implement rate limiting
- Don't expose sensitive data

### Documentation

✅ **Do:**
- Use OpenAPI/Swagger
- Document all endpoints
- Provide examples
- Document error responses
- Keep docs up to date

---

## 🎓 Summary

### Key Takeaways

1. **REST** is an architectural style using HTTP methods on resources
2. **Richardson Maturity Model** has 4 levels (0-3), aim for Level 2+
3. **Resources** are nouns identified by URIs (e.g., `/users/123`)
4. **HTTP Methods** map to CRUD: GET=Read, POST=Create, PUT=Replace, PATCH=Update, DELETE=Delete
5. **Status Codes** communicate success (2xx), client errors (4xx), server errors (5xx)
6. **Pagination** handles large datasets (offset, page, or cursor-based)
7. **HATEOAS** makes APIs self-documenting through hypermedia links
8. **Versioning** strategies include URI path, query params, or headers

### REST Design Checklist

```
✅ Resource-based URIs (nouns, plural)
✅ Proper HTTP methods
✅ Meaningful status codes
✅ Consistent error format
✅ Pagination for collections
✅ Filtering and sorting
✅ API versioning strategy
✅ Authentication/Authorization
✅ Rate limiting
✅ Documentation (OpenAPI)
```

### Next Steps

After understanding REST API Design, consider:
- **GraphQL** - Flexible query language alternative
- **OpenAPI/Swagger** - API documentation standard
- **OAuth 2.0 / JWT** - API security
- **API Gateway** - Already completed! ✅
- **gRPC** - High-performance alternative

---

## 📚 Additional Resources

**Standards:**
- REST Dissertation (Roy Fielding, 2000)
- OpenAPI Specification 3.0
- JSON:API Specification
- HAL Specification

**Tools:**
- Swagger/OpenAPI Editor
- Postman
- Insomnia
- curl

**Books:**
- "REST API Design Rulebook" - Mark Masse
- "RESTful Web APIs" - Leonard Richardson
- "API Design Patterns" - JJ Geewax

---

*Lesson created: 2026-02-08*

