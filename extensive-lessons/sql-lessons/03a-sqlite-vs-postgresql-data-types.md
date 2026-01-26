# SQLite vs PostgreSQL: Data Types Comparison

## 📋 Learning Objectives

- [ ] Understand key differences between SQLite and PostgreSQL data types
- [ ] Know when to use SQLite vs PostgreSQL
- [ ] Convert table definitions between SQLite and PostgreSQL
- [ ] Understand type strictness differences
- [ ] Recognize compatibility issues when migrating between databases
- [ ] Choose the right database for your project

---

## 🎯 Why Compare SQLite and PostgreSQL?

Both SQLite and PostgreSQL are popular databases, but they have very different approaches to data types:

- **SQLite**: Flexible, dynamic typing, perfect for learning and small projects
- **PostgreSQL**: Strict typing, enterprise-grade, perfect for production applications

Understanding both helps you:
- Choose the right database for your project
- Migrate between databases when needed
- Write portable SQL when possible
- Understand why certain queries work in one but not the other

---

## 📊 Data Type Comparison Table

| Category | SQLite | PostgreSQL | Notes |
|----------|--------|------------|-------|
| **Whole Numbers** | `INTEGER` | `SMALLINT`, `INTEGER`, `BIGINT`, `SERIAL`, `BIGSERIAL` | PostgreSQL has more options |
| **Decimals** | `REAL`, `NUMERIC` | `REAL`, `DOUBLE PRECISION`, `NUMERIC(p,s)`, `DECIMAL(p,s)` | PostgreSQL supports precision |
| **Text** | `TEXT` (unlimited) | `CHAR(n)`, `VARCHAR(n)`, `TEXT` | PostgreSQL enforces length limits |
| **Boolean** | `INTEGER` (0/1) | `BOOLEAN` | PostgreSQL has native boolean |
| **Date** | `TEXT`, `INTEGER`, `REAL` | `DATE` | PostgreSQL has native date type |
| **Time** | `TEXT`, `INTEGER`, `REAL` | `TIME`, `TIME WITH TIME ZONE` | PostgreSQL has native time types |
| **DateTime** | `TEXT`, `INTEGER`, `REAL` | `TIMESTAMP`, `TIMESTAMPTZ` | PostgreSQL has native datetime |
| **Binary** | `BLOB` | `BYTEA` | Different names, similar purpose |
| **UUID** | `TEXT` | `UUID` | PostgreSQL has native UUID type |
| **JSON** | `TEXT` | `JSON`, `JSONB` | PostgreSQL has native JSON support |
| **Array** | Not supported | `ARRAY[]` | PostgreSQL supports arrays |

---

## 🔢 Numeric Types Comparison

### Whole Numbers

**SQLite:**
```sql
CREATE TABLE products (
    id INTEGER,
    quantity INTEGER,
    price REAL
);
```

**PostgreSQL:**
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,           -- Auto-incrementing integer
    quantity SMALLINT,                 -- -32,768 to 32,767
    stock INTEGER,                     -- -2,147,483,648 to 2,147,483,647
    big_number BIGINT,                 -- Very large integers
    price NUMERIC(10, 2)              -- Decimal with precision
);
```

**Key Differences:**
- **SQLite**: One `INTEGER` type for all whole numbers
- **SQLite**: `INTEGER PRIMARY KEY` automatically creates auto-incrementing IDs (no need for `AUTOINCREMENT` keyword)
- **SQLite**: `INTEGER PRIMARY KEY AUTOINCREMENT` prevents ID reuse after deletions
- **PostgreSQL**: Multiple integer types with different ranges
- **PostgreSQL**: `SERIAL` and `BIGSERIAL` for auto-incrementing IDs (similar to SQLite's `INTEGER PRIMARY KEY`)
- **PostgreSQL**: Can specify precision for decimals (`NUMERIC(10, 2)` means 10 digits total, 2 after decimal)

### Decimal Numbers

**SQLite:**
```sql
CREATE TABLE prices (
    id INTEGER,
    amount REAL,                      -- Floating point
    price NUMERIC                     -- Flexible numeric
);
```

**PostgreSQL:**
```sql
CREATE TABLE prices (
    id INTEGER,
    amount REAL,                      -- 6 decimal digits precision
    price NUMERIC(10, 2),             -- Exact: 10 digits, 2 decimals
    precise DECIMAL(19, 4)            -- Exact: 19 digits, 4 decimals
);
```

**Key Differences:**
- **SQLite**: `REAL` is floating-point (may have rounding errors)
- **PostgreSQL**: `NUMERIC`/`DECIMAL` are exact (no rounding errors for money)
- **PostgreSQL**: You specify precision: `NUMERIC(precision, scale)`
- **Best Practice**: Use `NUMERIC` for money in PostgreSQL, `REAL` is fine for measurements

**Example - Money Storage:**
```sql
-- SQLite (acceptable for learning)
price REAL  -- Stores: 19.99

-- PostgreSQL (better for production)
price NUMERIC(10, 2)  -- Stores: 19.99 exactly, no rounding errors
```

---

## 📝 Text Types Comparison

### Text Storage

**SQLite:**
```sql
CREATE TABLE users (
    id INTEGER,
    name TEXT,                        -- Unlimited length
    email TEXT,                       -- Unlimited length
    code VARCHAR(100)                 -- Treated as TEXT, limit not enforced!
);
```

**PostgreSQL:**
```sql
CREATE TABLE users (
    id INTEGER,
    name VARCHAR(100),                -- Max 100 characters (enforced!)
    email VARCHAR(255),               -- Max 255 characters (enforced!)
    code CHAR(10),                    -- Exactly 10 characters (padded)
    bio TEXT                          -- Unlimited length
);
```

**Key Differences:**
- **SQLite**: `TEXT` is unlimited, `VARCHAR(n)` limits are **NOT enforced**
- **PostgreSQL**: `VARCHAR(n)` limits **ARE enforced** - will error if too long
- **PostgreSQL**: `CHAR(n)` is fixed-length (padded with spaces)
- **PostgreSQL**: `TEXT` is unlimited (use when you don't know the max length)

**Example:**
```sql
-- SQLite - This works (limit ignored)
CREATE TABLE test (name VARCHAR(5));
INSERT INTO test VALUES ('This is a very long name');  -- ✅ Works!

-- PostgreSQL - This fails (limit enforced)
CREATE TABLE test (name VARCHAR(5));
INSERT INTO test VALUES ('This is a very long name');  -- ❌ Error: value too long
INSERT INTO test VALUES ('Short');                     -- ✅ Works
```

---

## ✅ Boolean Types Comparison

### Boolean Values

**SQLite:**
```sql
CREATE TABLE users (
    id INTEGER,
    name TEXT,
    is_active INTEGER,                -- 0 = false, 1 = true
    is_verified INTEGER               -- 0 = false, 1 = true
);

-- Inserting
INSERT INTO users (name, is_active, is_verified)
VALUES ('John', 1, 0);

-- Querying
SELECT * FROM users WHERE is_active = 1;
```

**PostgreSQL:**
```sql
CREATE TABLE users (
    id INTEGER,
    name VARCHAR(100),
    is_active BOOLEAN,                -- Native boolean type
    is_verified BOOLEAN               -- Native boolean type
);

-- Inserting (multiple ways)
INSERT INTO users (name, is_active, is_verified)
VALUES 
    ('John', TRUE, FALSE),
    ('Jane', 'true', 'false'),        -- String representation
    ('Bob', 'yes', 'no'),             -- Also works
    ('Alice', 1, 0);                  -- Integer works too!

-- Querying
SELECT * FROM users WHERE is_active = TRUE;
SELECT * FROM users WHERE is_active;  -- Shorthand (TRUE is default)
```

**Key Differences:**
- **SQLite**: Uses `INTEGER` (0/1), no native boolean
- **PostgreSQL**: Has native `BOOLEAN` type
- **PostgreSQL**: Accepts `TRUE`/`FALSE`, `'true'`/`'false'`, `'yes'`/`'no'`, `1`/`0`
- **PostgreSQL**: More readable and self-documenting

---

## 📅 Date and Time Types Comparison

### Date/Time Storage

**SQLite:**
```sql
CREATE TABLE events (
    id INTEGER,
    event_date TEXT,                  -- '2024-01-15'
    event_time TEXT,                  -- '14:30:00'
    event_datetime TEXT,              -- '2024-01-15 14:30:00'
    created_at INTEGER                -- Unix timestamp
);
```

**PostgreSQL:**
```sql
CREATE TABLE events (
    id INTEGER,
    event_date DATE,                  -- Native date type
    event_time TIME,                  -- Native time type
    event_datetime TIMESTAMP,         -- Date and time
    event_timestamptz TIMESTAMPTZ,   -- With timezone
    created_at TIMESTAMP DEFAULT NOW() -- Auto-set timestamp
);
```

**Key Differences:**
- **SQLite**: Stores dates as `TEXT` or `INTEGER` (you manage format)
- **PostgreSQL**: Has native `DATE`, `TIME`, `TIMESTAMP` types
- **PostgreSQL**: Automatic validation (rejects invalid dates)
- **PostgreSQL**: Built-in date functions work better
- **PostgreSQL**: `TIMESTAMPTZ` handles timezones automatically

**Example - Date Operations:**
```sql
-- SQLite - Manual string manipulation
SELECT * FROM events 
WHERE event_date >= '2024-01-01' 
  AND event_date <= '2024-12-31';

-- PostgreSQL - Native date functions
SELECT * FROM events 
WHERE event_date >= '2024-01-01'::DATE 
  AND event_date <= '2024-12-31'::DATE;

-- PostgreSQL - More powerful
SELECT * FROM events 
WHERE event_date BETWEEN '2024-01-01' AND '2024-12-31';

SELECT * FROM events 
WHERE EXTRACT(YEAR FROM event_date) = 2024;
```

---

## 🔲 NULL Handling

Both SQLite and PostgreSQL handle NULL similarly:

```sql
-- Both databases
CREATE TABLE users (
    id INTEGER,
    name TEXT,
    email TEXT
);

-- Both support NULL
INSERT INTO users (name, email) 
VALUES ('John', NULL);

-- Both use IS NULL / IS NOT NULL
SELECT * FROM users WHERE email IS NULL;
SELECT * FROM users WHERE email IS NOT NULL;
```

**Key Point:** NULL handling is consistent across both databases.

---

## 🆔 Special Types: UUID, JSON, Arrays

### UUID (Universally Unique Identifier)

**SQLite:**
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,              -- Store UUID as text
    name TEXT
);

INSERT INTO users (id, name)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'John');
```

**PostgreSQL:**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- Native UUID type
    name VARCHAR(100)
);

-- Auto-generates UUID
INSERT INTO users (name) VALUES ('John');

-- Or manually
INSERT INTO users (id, name)
VALUES ('550e8400-e29b-41d4-a716-446655440000'::UUID, 'John');
```

**Key Differences:**
- **SQLite**: Store UUIDs as `TEXT`
- **PostgreSQL**: Native `UUID` type with validation
- **PostgreSQL**: Can auto-generate UUIDs with `gen_random_uuid()`

### JSON Data

**SQLite:**
```sql
CREATE TABLE products (
    id INTEGER,
    name TEXT,
    metadata TEXT                     -- Store JSON as text
);

INSERT INTO products (name, metadata)
VALUES ('Widget', '{"color": "red", "size": "large"}');
```

**PostgreSQL:**
```sql
CREATE TABLE products (
    id INTEGER,
    name VARCHAR(100),
    metadata JSON,                    -- JSON type (validated)
    data JSONB                        -- Binary JSON (indexed, faster)
);

INSERT INTO products (name, metadata)
VALUES ('Widget', '{"color": "red", "size": "large"}');

-- Query JSON
SELECT name, metadata->>'color' AS color 
FROM products 
WHERE metadata->>'size' = 'large';
```

**Key Differences:**
- **SQLite**: Store JSON as `TEXT` (no validation)
- **PostgreSQL**: Native `JSON` and `JSONB` types
- **PostgreSQL**: Can query JSON directly with `->` and `->>` operators
- **PostgreSQL**: `JSONB` is binary format (faster, indexable)

### Arrays

**SQLite:**
```sql
-- Arrays not supported - use TEXT or separate table
CREATE TABLE users (
    id INTEGER,
    name TEXT,
    tags TEXT                         -- Store as comma-separated: 'tag1,tag2,tag3'
);
```

**PostgreSQL:**
```sql
CREATE TABLE users (
    id INTEGER,
    name VARCHAR(100),
    tags TEXT[]                       -- Array of text
);

INSERT INTO users (name, tags)
VALUES ('John', ARRAY['admin', 'user', 'moderator']);

-- Query arrays
SELECT * FROM users WHERE 'admin' = ANY(tags);
```

**Key Differences:**
- **SQLite**: No array support (use TEXT or normalization)
- **PostgreSQL**: Native array support with `[]` syntax
- **PostgreSQL**: Can query arrays with `ANY()`, `ALL()`, and array operators

---

## 📋 Complete Example: Same Table in Both Databases

### E-commerce Products Table

**SQLite Version:**
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL,
    stock_quantity INTEGER,
    is_available INTEGER,             -- 0 or 1
    category_id INTEGER,
    tags TEXT,                         -- Comma-separated
    metadata TEXT,                     -- JSON as text
    created_at TEXT,                   -- ISO 8601 format
    updated_at TEXT
);

INSERT INTO products (name, description, price, stock_quantity, is_available, created_at)
VALUES (
    'Laptop',
    'High-performance laptop',
    999.99,
    50,
    1,
    '2024-01-15 10:30:00'
);
```

**PostgreSQL Version:**
```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2),              -- Exact decimal
    stock_quantity INTEGER,
    is_available BOOLEAN DEFAULT TRUE,
    category_id INTEGER,
    tags TEXT[],                       -- Array
    metadata JSONB,                    -- Binary JSON
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

INSERT INTO products (name, description, price, stock_quantity, is_available)
VALUES (
    'Laptop',
    'High-performance laptop',
    999.99,
    50,
    TRUE
);
-- created_at automatically set to current timestamp
```

**Key Differences Summary:**
1. **ID**: SQLite uses `INTEGER PRIMARY KEY` (auto-increments automatically), PostgreSQL uses `SERIAL` (explicit auto-increment)
2. **Text**: SQLite `TEXT` unlimited, PostgreSQL `VARCHAR(255)` with limit
3. **Price**: SQLite `REAL`, PostgreSQL `NUMERIC(10, 2)` for exact values
4. **Boolean**: SQLite `INTEGER`, PostgreSQL `BOOLEAN`
5. **Tags**: SQLite `TEXT` (comma-separated), PostgreSQL `TEXT[]` (array)
6. **JSON**: SQLite `TEXT`, PostgreSQL `JSONB`
7. **Timestamps**: SQLite `TEXT`, PostgreSQL `TIMESTAMP` with `DEFAULT NOW()`

---

## 🔄 Migration Considerations

### Migrating from SQLite to PostgreSQL

**Common Issues:**

1. **Text Length Limits**
   ```sql
   -- SQLite (works)
   CREATE TABLE users (name TEXT);
   INSERT INTO users VALUES ('Very long name...');  -- ✅ Works
   
   -- PostgreSQL (might fail)
   CREATE TABLE users (name VARCHAR(50));
   INSERT INTO users VALUES ('Very long name...');  -- ❌ Error if > 50 chars
   ```

2. **Boolean Values**
   ```sql
   -- SQLite
   WHERE is_active = 1
   
   -- PostgreSQL (both work)
   WHERE is_active = TRUE
   WHERE is_active = 1  -- Also works
   ```

3. **Date Formats**
   ```sql
   -- SQLite - manual format
   WHERE created_at >= '2024-01-01'
   
   -- PostgreSQL - type casting
   WHERE created_at >= '2024-01-01'::DATE
   WHERE created_at::DATE >= '2024-01-01'
   ```

4. **Auto-increment IDs**
   ```sql
   -- SQLite (auto-increments automatically)
   id INTEGER PRIMARY KEY
   -- or (never reuses deleted IDs)
   id INTEGER PRIMARY KEY AUTOINCREMENT
   
   -- PostgreSQL
   id SERIAL PRIMARY KEY
   -- or
   id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY
   ```
   
   **Note:** In SQLite, `INTEGER PRIMARY KEY` automatically creates an auto-incrementing column. You don't need a separate keyword like `AUTOINCREMENT` (though you can use it to prevent ID reuse).

### Migration Checklist

When migrating from SQLite to PostgreSQL:

- [ ] Check all `TEXT` columns - decide on `VARCHAR(n)` or `TEXT`
- [ ] Convert `INTEGER` booleans to `BOOLEAN` if desired
- [ ] Convert date `TEXT` columns to `DATE`/`TIMESTAMP`
- [ ] Change `REAL` to `NUMERIC` for money/exact values
- [ ] Update `INTEGER PRIMARY KEY` to `SERIAL` or `IDENTITY`
- [ ] Test all queries (some SQL syntax differs)
- [ ] Update application code for type differences

---

## 🎯 When to Use Which Database?

### Use SQLite When:
- ✅ Learning SQL (simplest setup)
- ✅ Small to medium applications
- ✅ Single-user or low-concurrency
- ✅ Embedded applications (mobile, desktop)
- ✅ Prototyping and development
- ✅ Read-heavy workloads
- ✅ No need for advanced features (arrays, JSON queries, etc.)

### Use PostgreSQL When:
- ✅ Production web applications
- ✅ Multi-user, high-concurrency
- ✅ Need strict data type validation
- ✅ Need advanced features (JSON, arrays, full-text search)
- ✅ Complex queries and analytics
- ✅ Need ACID compliance for critical data
- ✅ Large datasets
- ✅ Need user management and permissions

---

## 🎓 Practice Exercise

### Exercise 1: Convert SQLite Table to PostgreSQL

Convert this SQLite table to PostgreSQL:

**SQLite:**
```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    customer_name TEXT,
    total REAL,
    is_paid INTEGER,
    order_date TEXT,
    items TEXT
);
```

**Your PostgreSQL version:**
<details>
<summary>Click to see solution</summary>

```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255),
    total NUMERIC(10, 2),
    is_paid BOOLEAN,
    order_date DATE,
    items JSONB
);
```

**Key changes:**
- `INTEGER PRIMARY KEY` → `SERIAL PRIMARY KEY`
- `TEXT` → `VARCHAR(255)` (or `TEXT` if unlimited)
- `REAL` → `NUMERIC(10, 2)` (exact for money)
- `INTEGER` (boolean) → `BOOLEAN`
- `TEXT` (date) → `DATE`
- `TEXT` (JSON) → `JSONB`
</details>

### Exercise 2: Write Queries for Both

Write a query to find all paid orders from 2024:

**SQLite:**
```sql
SELECT * FROM orders 
WHERE is_paid = 1 
  AND order_date >= '2024-01-01' 
  AND order_date < '2025-01-01';
```

**PostgreSQL:**
```sql
SELECT * FROM orders 
WHERE is_paid = TRUE 
  AND order_date >= '2024-01-01'::DATE 
  AND order_date < '2025-01-01'::DATE;

-- Or using EXTRACT
SELECT * FROM orders 
WHERE is_paid 
  AND EXTRACT(YEAR FROM order_date) = 2024;
```

---

## ✅ Quick Reference: Type Equivalents

| SQLite | PostgreSQL Equivalent | Notes |
|--------|----------------------|-------|
| `INTEGER` | `INTEGER` or `SERIAL` | Use SERIAL for auto-increment |
| `REAL` | `REAL` or `NUMERIC(p,s)` | Use NUMERIC for exact decimals |
| `TEXT` | `VARCHAR(n)` or `TEXT` | VARCHAR has length limit |
| `INTEGER` (0/1) | `BOOLEAN` | More readable |
| `TEXT` (date) | `DATE` | Native date type |
| `TEXT` (datetime) | `TIMESTAMP` | Native datetime type |
| `TEXT` (UUID) | `UUID` | Native UUID with validation |
| `TEXT` (JSON) | `JSON` or `JSONB` | Native JSON support |
| `TEXT` (array) | `ARRAY[]` | Native array support |
| `BLOB` | `BYTEA` | Binary data |

---

## 🔑 Key Points

1. **SQLite** is flexible and forgiving - great for learning
2. **PostgreSQL** is strict and powerful - great for production
3. **SQLite** doesn't enforce length limits on `VARCHAR(n)`
4. **PostgreSQL** has native types for boolean, date, JSON, arrays, UUID
5. **PostgreSQL** `NUMERIC` is exact (use for money), `REAL` may have rounding
6. **SQLite** uses `INTEGER` for booleans (0/1), PostgreSQL has `BOOLEAN`
7. **SQLite** stores dates as `TEXT`, PostgreSQL has native `DATE`/`TIMESTAMP`
8. When migrating, test thoroughly - type differences can cause issues
9. Choose SQLite for learning/small projects, PostgreSQL for production
10. Both handle NULL the same way

---

## 📚 Next Steps

Now that you understand the differences, you can:

- **Continue with SQLite** for learning (simpler, easier)
- **Learn PostgreSQL** when you need production features
- **Write portable SQL** that works in both when possible

**Related Lessons:**
- [Lesson 3: Understanding Tables and Data Types](03-tables-and-data-types.md)
- [Lesson 4: Creating Your First Table](04-creating-tables.md)
- [Lesson 2: Setting Up Your SQL Environment](02-setting-up-sql-environment.md)

---

*Estimated Duration: 10-15 minutes*

