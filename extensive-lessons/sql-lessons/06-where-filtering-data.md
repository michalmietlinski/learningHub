# WHERE - Filtering Data

## 📋 Learning Objectives

- [ ] Use the WHERE clause to restrict which rows a query returns
- [ ] Apply comparison operators (`=`, `!=` / `<>`, `<`, `>`, `<=`, `>=`)
- [ ] Combine conditions with AND, OR, and NOT
- [ ] Use parentheses to make compound conditions unambiguous
- [ ] Recognize common pitfalls (especially with NULL and with AND/OR precedence)

---

## What is WHERE?

**WHERE** filters rows *after* the database knows which table you are reading from, but *before* it builds the result set you see. Only rows that satisfy the condition are returned.

**Key Principle:**
> "SELECT chooses *columns*. WHERE chooses *rows*. If you omit WHERE, you get every row in the table (which is often more than you want)."

---

## 📝 Basic WHERE Syntax

```sql
SELECT column1, column2
FROM table_name
WHERE condition;
```

- **WHERE** comes after **FROM**
- **condition** is an expression that is true or false for each row (in SQL, also "unknown" when NULLs are involved—more on that in a later lesson)

---

## 🗃️ Sample Data for This Lesson

Use the same tables as in [Lesson 5: SELECT - Retrieving Data](05-select-retrieving-data.md), or run:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    age INTEGER,
    city TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, age, city) VALUES
    ('Alice Johnson', 'alice@example.com', 28, 'New York'),
    ('Bob Smith', 'bob@example.com', 35, 'Los Angeles'),
    ('Charlie Brown', 'charlie@example.com', 22, 'Chicago'),
    ('Diana Ross', 'diana@example.com', 31, 'Houston'),
    ('Eve Wilson', 'eve@example.com', 45, 'Phoenix');

CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT,
    stock INTEGER DEFAULT 0
);

INSERT INTO products (name, price, category, stock) VALUES
    ('Laptop', 999.99, 'Electronics', 50),
    ('Headphones', 79.99, 'Electronics', 200),
    ('Coffee Mug', 12.99, 'Kitchen', 500),
    ('Notebook', 4.99, 'Office', 1000),
    ('Desk Lamp', 34.99, 'Office', 75);
```

---

## Comparison Operators

| Operator | Meaning |
|----------|---------|
| `=` | Equal to |
| `!=` or `<>` | Not equal to (both are widely supported; `<>` is SQL standard) |
| `<` | Less than |
| `>` | Greater than |
| `<=` | Less than or equal |
| `>=` | Greater than or equal |

### Example: Users in a Specific City

```sql
SELECT name, email
FROM users
WHERE city = 'Chicago';
```

### Example: Products Cheaper Than $50

```sql
SELECT name, price
FROM products
WHERE price < 50;
```

### Example: Adults 30 or Older

```sql
SELECT name, age
FROM users
WHERE age >= 30;
```

---

## 🎯 Combining Conditions: AND, OR, NOT

- **AND** — both conditions must be true
- **OR** — at least one condition must be true
- **NOT** — negates a condition

### Example: Electronics Under $100

```sql
SELECT name, price, category
FROM products
WHERE category = 'Electronics'
  AND price < 100;
```

### Example: New York or Los Angeles Users

```sql
SELECT name, city
FROM users
WHERE city = 'New York'
   OR city = 'Los Angeles';
```

### Example: Not Electronics

```sql
SELECT name, category
FROM products
WHERE NOT category = 'Electronics';
```

---

## 🛡️ Parentheses and Precedence

**AND** is evaluated before **OR** in SQL. Without parentheses, results can surprise you.

### Ambiguous (Easy to Misread)

```sql
-- AND binds tighter than OR, so this is:
--   category = 'Kitchen'  OR  (category = 'Office' AND price < 20)
-- Is that what you meant?
SELECT name, price, category
FROM products
WHERE category = 'Kitchen'
   OR category = 'Office'
  AND price < 20;
```

### Clear Intent

```sql
-- Cheap Office items OR anything in Kitchen
SELECT name, price, category
FROM products
WHERE (category = 'Office' AND price < 20)
   OR category = 'Kitchen';
```

**Rule of thumb:** If you mix AND and OR, add parentheses.

---

## 💡 NULL and WHERE (Preview)

If a column can be NULL, comparisons like `WHERE age = NULL` do **not** work the way you might expect. SQL uses special predicates for missing values.

You will cover this properly in [Lesson 40: NULL Handling](40-null-handling.md). For now:

- Stick to comparisons on known values (`city = 'Houston'`, `price > 10`)
- Remember: "unknown" results from NULL comparisons are treated as *not true* in WHERE, so the row is filtered out

---

## How Clauses Fit Together (So Far)

For simple queries without grouping, think of this *logical* flow:

1. **FROM** — pick the table
2. **WHERE** — keep only matching rows
3. **SELECT** — compute columns for those rows

The next lesson adds **ORDER BY** and **LIMIT**, which sort and trim the result *after* WHERE.

---

## Practice Exercises

### Exercise 1: Single Condition

Write a query to list names and emails of users older than 30.

<details>
<summary>Click to see solution</summary>

```sql
SELECT name, email
FROM users
WHERE age > 30;
```
</details>

### Exercise 2: AND

Write a query to list Electronics products that cost between 50 and 500 (inclusive).

<details>
<summary>Click to see solution</summary>

```sql
SELECT name, price
FROM products
WHERE category = 'Electronics'
  AND price >= 50
  AND price <= 500;
```
</details>

### Exercise 3: OR

Write a query to list products that are either in the Office category or have stock greater than 400.

<details>
<summary>Click to see solution</summary>

```sql
SELECT name, category, stock
FROM products
WHERE category = 'Office'
   OR stock > 400;
```
</details>

### Exercise 4: NOT

Write a query to list users who are not from Phoenix.

<details>
<summary>Click to see solution</summary>

```sql
SELECT name, city
FROM users
WHERE NOT city = 'Phoenix';
-- Also common: WHERE city <> 'Phoenix' or WHERE city != 'Phoenix'
```
</details>

### Exercise 5: Parentheses

Write a query for products where: (category is Electronics and price < 100) **or** stock is at least 300.

<details>
<summary>Click to see solution</summary>

```sql
SELECT name, price, category, stock
FROM products
WHERE (category = 'Electronics' AND price < 100)
   OR stock >= 300;
```
</details>

---

## Summary

### Key Points

1. **WHERE** filters rows; without it, you get the whole table.
2. Use **=, != / <>, <, >, <=, >=** to compare values.
3. Combine logic with **AND**, **OR**, and **NOT**.
4. Use **parentheses** when mixing AND and OR so the intent is obvious.
5. **NULL** needs special handling; avoid `= NULL` until you learn `IS NULL`.

### WHERE Syntax Reference

```sql
SELECT columns
FROM table
WHERE condition;

-- Compound
WHERE a = 1 AND (b = 2 OR c = 3);
```

---

## 🔗 Next Steps

**Next Lesson:** [Lesson 7: ORDER BY and LIMIT](07-order-by-and-limit.md)

- Sort results
- Take the "top N" rows and basic pagination with OFFSET

**Related Lessons:**

- [Lesson 5: SELECT - Retrieving Data](05-select-retrieving-data.md)
- [Lesson 41: LIKE and Pattern Matching](41-like-pattern-matching.md)
- [Lesson 42: IN and BETWEEN Operators](42-in-and-between.md)
- [Lesson 40: NULL Handling](40-null-handling.md)

---

## 📖 Additional Resources

**SQLite:**

- SELECT: https://www.sqlite.org/lang_select.html
- Expressions: https://www.sqlite.org/lang_expr.html

**Practice:**

- Rewrite OR conditions using IN after you finish Lesson 42
- Combine WHERE with column aliases from Lesson 5 in the same queries

---

*Last Updated: 2026-04-11*

*Estimated Duration: 8-12 minutes*
