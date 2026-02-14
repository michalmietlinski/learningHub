# Understanding Tables and Data Types

## 📋 Learning Objectives

- [ ] Understand table structure (columns, rows)
- [ ] Know common SQL data types
- [ ] Understand SQLite-specific data types
- [ ] Choose appropriate data types for your data
- [ ] Understand NULL values and their importance
- [ ] Recognize the difference between data types in SQLite vs other databases

---

## 🗂️ What is a Table?

A **table** is the fundamental structure in a relational database where data is stored. Think of it as a spreadsheet with rows and columns, but with strict rules about what data can be stored.

### Table Structure

**Columns (Fields):**
- Define the structure of the data
- Each column has a name and a data type
- Columns are like the headers in a spreadsheet
- Example: `name`, `age`, `email`

**Rows (Records):**
- Each row represents a single record or entry
- Contains actual data values
- Rows are like the data rows in a spreadsheet
- Example: One row might contain: `John`, `25`, `john@example.com`

### Visual Example

```
┌────┬──────────┬─────┬──────────────────┐
│ id │ name     │ age │ email            │
├────┼──────────┼─────┼──────────────────┤
│ 1  │ Alice    │ 25  │ alice@example.com│
│ 2  │ Bob      │ 30  │ bob@example.com  │
│ 3  │ Charlie  │ 28  │ charlie@example  │
└────┴──────────┴─────┴──────────────────┘
```

**Columns:** `id`, `name`, `age`, `email`  
**Rows:** 3 records (Alice, Bob, Charlie)

---

## 📊 SQLite Data Types

SQLite uses a unique approach to data types called **dynamic typing**. Unlike other databases, SQLite is more flexible with data types, but it's still important to understand them.

### SQLite Storage Classes

SQLite has 5 main storage classes:

1. **NULL** - Missing or unknown value
2. **INTEGER** - Whole numbers (positive or negative)
3. **REAL** - Floating-point numbers (decimals)
4. **TEXT** - Character strings
5. **BLOB** - Binary Large Object (images, files, etc.)

### SQLite Type Affinity

While SQLite is flexible, you can specify **type affinities** when creating tables. SQLite will try to store values according to these affinities:

| Type Affinity | Description | Examples |
|--------------|-------------|----------|
| **INTEGER** | Whole numbers | `1`, `-5`, `1000` |
| **TEXT** | Character strings | `'Hello'`, `'John Doe'` |
| **REAL** | Floating-point numbers | `3.14`, `-2.5`, `99.99` |
| **NUMERIC** | Numbers (INTEGER or REAL) | `100`, `3.14` |
| **BLOB** | Binary data | Images, files |

**Note:** SQLite also accepts type names like `VARCHAR`, `CHAR`, `FLOAT`, `DOUBLE`, `DECIMAL`, etc., but they are mapped to the 5 storage classes above.

---

## 🔢 Numeric Data Types

### INTEGER

Used for whole numbers (no decimal points).

**SQLite:**
```sql
CREATE TABLE students (
    id INTEGER,
    age INTEGER,
    score INTEGER
);
```

**Examples:**
- `25` ✅
- `-10` ✅
- `1000` ✅
- `3.14` ❌ (will be stored as REAL)

**Use for:**
- IDs, ages, counts, quantities
- Any whole number value

### Auto-Incrementing IDs in SQLite

SQLite has a special feature for creating auto-incrementing primary keys (like `SERIAL` in PostgreSQL or `AUTO_INCREMENT` in MySQL).

**Method 1: INTEGER PRIMARY KEY (Recommended)**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,    -- Auto-increments automatically!
    name TEXT,
    email TEXT
);

-- Insert without specifying ID
INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');
INSERT INTO users (name, email) VALUES ('Bob', 'bob@example.com');

-- IDs are automatically assigned: 1, 2, 3, ...
```

**Method 2: INTEGER PRIMARY KEY AUTOINCREMENT**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Never reuses deleted IDs
    name TEXT,
    email TEXT
);
```

**Key Differences:**

| Feature | `INTEGER PRIMARY KEY` | `INTEGER PRIMARY KEY AUTOINCREMENT` |
|---------|----------------------|-------------------------------------|
| **Auto-increment** | ✅ Yes | ✅ Yes |
| **Reuses deleted IDs** | ✅ Yes (may have gaps) | ❌ No (guaranteed no reuse) |
| **Performance** | ⚡ Faster | ⚠️ Slightly slower |
| **Max ID tracking** | No | Yes (uses sqlite_sequence table) |
| **When to use** | Most cases (recommended) | When you need guaranteed unique IDs even after deletions |

**Example:**
```sql
-- Create table
CREATE TABLE test (
    id INTEGER PRIMARY KEY,
    name TEXT
);

-- Insert rows
INSERT INTO test (name) VALUES ('First');
INSERT INTO test (name) VALUES ('Second');
-- IDs: 1, 2

-- Delete a row
DELETE FROM test WHERE id = 1;

-- Insert new row
INSERT INTO test (name) VALUES ('Third');
-- ID: 3 (not 1) - gap is created

-- With AUTOINCREMENT, deleted IDs are never reused
```

**Important Notes:**
- Only works with `INTEGER` type (not `TEXT` or `REAL`)
- Must be `PRIMARY KEY` (or `UNIQUE` + `NOT NULL`)
- You can still manually insert IDs if needed
- If you insert a specific ID, SQLite will use the next available number after the highest ID

**Best Practice:** Use `INTEGER PRIMARY KEY` for most cases. Only use `AUTOINCREMENT` if you need to guarantee that deleted IDs are never reused.

### REAL

Used for floating-point numbers (decimals).

**SQLite:**
```sql
CREATE TABLE products (
    id INTEGER,
    price REAL,
    weight REAL,
    rating REAL
);
```

**Examples:**
- `3.14` ✅
- `99.99` ✅
- `-2.5` ✅
- `100` ✅ (can store as REAL too)

**Use for:**
- Prices, measurements, percentages
- Any value that needs decimal precision

### NUMERIC

A flexible type that can store both integers and decimals. SQLite will choose the most appropriate storage.

**SQLite:**
```sql
CREATE TABLE transactions (
    id INTEGER,
    amount NUMERIC
);
```

---

## 📝 Text Data Types

### TEXT

Used for character strings of any length.

**SQLite:**
```sql
CREATE TABLE users (
    id INTEGER,
    name TEXT,
    email TEXT,
    bio TEXT
);
```

**Examples:**
- `'John'` ✅
- `'Hello, World!'` ✅
- `'This is a very long text...'` ✅

**Use for:**
- Names, addresses, descriptions
- Any text data

**Note:** In SQLite, `TEXT` is the primary text type. Other databases use `VARCHAR(n)` or `CHAR(n)`, but in SQLite, you can use `TEXT` for all text needs.

### VARCHAR and CHAR (SQLite Compatibility)

SQLite accepts these type names for compatibility, but they're treated as `TEXT`:

```sql
CREATE TABLE users (
    name VARCHAR(100),    -- Treated as TEXT
    code CHAR(10),        -- Treated as TEXT
    description TEXT      -- Same as above
);
```

**Important:** In SQLite, the length limits (like `VARCHAR(100)`) are **not enforced**. SQLite will store text of any length. This is different from MySQL/PostgreSQL where length limits are enforced.

---

## 📅 Date and Time Types

SQLite doesn't have separate DATE, DATETIME, or TIMESTAMP types. Instead, it uses **TEXT**, **REAL**, or **INTEGER** to store dates and times.

### Common Approaches

**1. TEXT (ISO 8601 format - Recommended)**
```sql
CREATE TABLE events (
    id INTEGER,
    event_date TEXT,        -- '2024-01-15'
    event_time TEXT,        -- '14:30:00'
    event_datetime TEXT     -- '2024-01-15 14:30:00'
);
```

**Examples:**
- `'2024-01-15'` (date)
- `'14:30:00'` (time)
- `'2024-01-15 14:30:00'` (datetime)
- `'2024-01-15T14:30:00Z'` (ISO 8601 with timezone)

**2. INTEGER (Unix timestamp)**
```sql
CREATE TABLE events (
    id INTEGER,
    created_at INTEGER      -- Unix timestamp: 1705324800
);
```

**3. REAL (Julian day number)**
```sql
CREATE TABLE events (
    id INTEGER,
    event_date REAL         -- Julian day: 2460324.5
);
```

**Recommendation:** Use **TEXT** with ISO 8601 format (`'YYYY-MM-DD HH:MM:SS'`) for readability and compatibility.

---

## ✅ Boolean Values

SQLite doesn't have a separate BOOLEAN type. Use **INTEGER** where:
- `0` = FALSE
- `1` = TRUE
- `NULL` = Unknown/Not set

**SQLite:**
```sql
CREATE TABLE users (
    id INTEGER,
    name TEXT,
    is_active INTEGER,      -- 0 or 1
    is_verified INTEGER     -- 0 or 1
);
```

**Examples:**
```sql
INSERT INTO users (name, is_active, is_verified) 
VALUES ('John', 1, 0);  -- Active but not verified

SELECT * FROM users WHERE is_active = 1;
```

---

## 🔲 NULL Values

**NULL** represents a missing or unknown value. It's not the same as zero or an empty string.

### Important NULL Facts

- **NULL ≠ 0** - NULL is "no value", 0 is a value
- **NULL ≠ ''** - NULL is "no value", '' is an empty string
- **NULL = NULL** is **FALSE** - Use `IS NULL` or `IS NOT NULL` to check
- Any operation with NULL usually returns NULL

**Example:**
```sql
CREATE TABLE students (
    id INTEGER,
    name TEXT,
    age INTEGER,
    email TEXT
);

-- Inserting data with NULL
INSERT INTO students (name, age, email) 
VALUES 
    ('Alice', 25, 'alice@example.com'),
    ('Bob', NULL, 'bob@example.com'),        -- Age unknown
    ('Charlie', 30, NULL);                   -- Email unknown
```

**Querying NULL:**
```sql
-- Find students with unknown age
SELECT * FROM students WHERE age IS NULL;

-- Find students with known age
SELECT * FROM students WHERE age IS NOT NULL;
```

---

## 🎯 Choosing the Right Data Type

### Decision Guide

**Use INTEGER for:**
- ✅ IDs, counts, quantities
- ✅ Ages, years, scores
- ✅ Boolean values (0/1)
- ✅ Any whole number

**Use REAL for:**
- ✅ Prices, measurements
- ✅ Percentages, ratings
- ✅ Any decimal number

**Use TEXT for:**
- ✅ Names, addresses, descriptions
- ✅ Dates and times (ISO 8601 format)
- ✅ Email addresses, URLs
- ✅ Any text data

**Use BLOB for:**
- ✅ Images, files
- ✅ Binary data
- ⚠️ Usually better to store file paths in TEXT and files separately

### Example: E-commerce Database

```sql
CREATE TABLE products (
    id INTEGER,                    -- Product ID (whole number)
    name TEXT,                     -- Product name (text)
    description TEXT,              -- Long description (text)
    price REAL,                    -- Price with decimals (e.g., 19.99)
    stock_quantity INTEGER,        -- Stock count (whole number)
    is_available INTEGER,          -- Boolean: 0 or 1
    created_at TEXT,               -- Date: '2024-01-15 10:30:00'
    category_id INTEGER            -- Foreign key (whole number)
);

CREATE TABLE customers (
    id INTEGER,                    -- Customer ID
    first_name TEXT,               -- First name
    last_name TEXT,                -- Last name
    email TEXT,                    -- Email address
    phone TEXT,                    -- Phone number (text, not number!)
    date_of_birth TEXT,            -- Date: '1990-05-15'
    created_at TEXT                -- Timestamp
);
```

**Why phone is TEXT?**
- Phone numbers can start with 0 (e.g., `0123456789`)
- May contain special characters (`+`, `-`, `()`, spaces)
- We don't do math with phone numbers
- Leading zeros would be lost if stored as INTEGER

---

## 📚 SQLite vs Other Databases

### Key Differences

| Feature | SQLite | MySQL/PostgreSQL |
|---------|--------|------------------|
| **Text Types** | TEXT (unlimited) | VARCHAR(n), CHAR(n), TEXT |
| **Length Limits** | Not enforced | Enforced |
| **Boolean** | INTEGER (0/1) | BOOLEAN type |
| **Date Types** | TEXT/INTEGER/REAL | DATE, DATETIME, TIMESTAMP |
| **Type Flexibility** | Very flexible | Strict typing |

### Why SQLite is Flexible

SQLite uses **dynamic typing** - the data type is determined by the value itself, not just the column definition. This makes it easier for beginners but requires discipline to use types correctly.

**Example:**
```sql
-- In SQLite, this works:
CREATE TABLE test (value TEXT);
INSERT INTO test VALUES (123);        -- Stores as INTEGER
INSERT INTO test VALUES ('123');      -- Stores as TEXT
INSERT INTO test VALUES (3.14);       -- Stores as REAL

-- In PostgreSQL, this would fail:
CREATE TABLE test (value VARCHAR(10));
INSERT INTO test VALUES (123);        -- Error: type mismatch
```

---

## 🎓 Practice Exercise

Create a database and practice with different data types:

### Step 1: Create a Database

```bash
sqlite3 practice.db
```

### Step 2: Create Tables with Different Data Types

```sql
-- Create a library database
CREATE TABLE books (
    id INTEGER,
    title TEXT,
    author TEXT,
    isbn TEXT,
    pages INTEGER,
    price REAL,
    is_available INTEGER,
    published_date TEXT
);

CREATE TABLE members (
    id INTEGER,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    date_of_birth TEXT,
    joined_date TEXT,
    is_active INTEGER
);
```

### Step 3: Insert Data

```sql
INSERT INTO books (title, author, isbn, pages, price, is_available, published_date)
VALUES 
    ('The Great Gatsby', 'F. Scott Fitzgerald', '978-0-7432-7356-5', 180, 12.99, 1, '1925-04-10'),
    ('1984', 'George Orwell', '978-0-452-28423-4', 328, 9.99, 1, '1949-06-08'),
    ('To Kill a Mockingbird', 'Harper Lee', '978-0-06-112008-4', 376, 11.99, 0, '1960-07-11');

INSERT INTO members (first_name, last_name, email, phone, date_of_birth, joined_date, is_active)
VALUES 
    ('Alice', 'Smith', 'alice@example.com', '555-0101', '1990-05-15', '2023-01-10', 1),
    ('Bob', 'Jones', 'bob@example.com', '555-0102', '1985-08-22', '2023-02-15', 1),
    ('Charlie', 'Brown', NULL, '555-0103', '1992-12-03', '2023-03-20', 0);
```

### Step 4: Query the Data

```sql
-- List all books
SELECT * FROM books;

-- Find available books
SELECT title, price FROM books WHERE is_available = 1;

-- Find members with email
SELECT first_name, last_name, email FROM members WHERE email IS NOT NULL;

-- Find active members
SELECT * FROM members WHERE is_active = 1;
```

### Step 5: Check Table Structure

```bash
.schema books
.schema members
```

---

## ✅ Quick Reference: SQLite Data Types

| Use Case | SQLite Type | Example Values |
|----------|-------------|----------------|
| Whole numbers | `INTEGER` | `1`, `-5`, `1000` |
| Decimal numbers | `REAL` | `3.14`, `99.99`, `-2.5` |
| Text | `TEXT` | `'Hello'`, `'John Doe'` |
| Dates | `TEXT` | `'2024-01-15'` |
| Times | `TEXT` | `'14:30:00'` |
| Boolean | `INTEGER` | `0` (false), `1` (true) |
| Binary data | `BLOB` | Images, files |

---

## 🔑 Key Points

1. **Tables** are made of **columns** (structure) and **rows** (data)
2. SQLite has 5 storage classes: NULL, INTEGER, REAL, TEXT, BLOB
3. SQLite uses **dynamic typing** - more flexible than other databases
4. Use **INTEGER** for whole numbers and booleans (0/1)
5. Use **REAL** for decimal numbers
6. Use **TEXT** for strings, dates, and times (ISO 8601 format)
7. **NULL** represents missing/unknown values - use `IS NULL` to check
8. Choose data types based on how you'll use the data
9. Phone numbers and IDs with leading zeros should be TEXT, not INTEGER
10. SQLite doesn't enforce length limits on TEXT columns

---

## 📚 Next Steps

Now that you understand tables and data types, you're ready to create your own tables!

**Next Lesson:** [Lesson 4: Creating Your First Table](04-creating-tables.md)
- Learn CREATE TABLE syntax
- Define columns with data types
- Add constraints to your tables
- Practice creating real-world tables

---

## 🔗 Related Lessons

- [Lesson 2: Setting Up Your SQL Environment](02-setting-up-sql-environment.md)
- [Lesson 3a: SQLite vs PostgreSQL Data Types Comparison](03a-sqlite-vs-postgresql-data-types.md) - Compare SQLite and PostgreSQL data types
- [Lesson 4: Creating Your First Table](04-creating-tables.md)
- [Lesson 5: SELECT - Retrieving Data](05-select-retrieving-data.md)

---

*Estimated Duration: 8-12 minutes*

