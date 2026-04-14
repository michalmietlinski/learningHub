# UPDATE - Modifying Data

## Learning Objectives

- [ ] Change existing rows with `UPDATE` and `SET`
- [ ] Update several columns in one statement
- [ ] Use `WHERE` so only the intended rows change
- [ ] Understand why `UPDATE` without `WHERE` is dangerous
- [ ] Express conditions the same way as in `SELECT` (comparison, `AND`, `OR`)

---

## What is UPDATE?

**UPDATE** changes values in rows that already exist. You name the table, list column assignments in `SET`, and usually restrict which rows are affected with `WHERE`.

**Key idea:** Unlike `INSERT`, you are not creating new rows (unless combined with other patterns you will see later). You are overwriting column values for matching rows.

---

## Basic syntax

```sql
UPDATE table_name
SET column1 = value1,
    column2 = value2
WHERE condition;
```

- **`SET`** — one or more `column = expression` assignments, separated by commas
- **`WHERE`** — which rows to update; almost always required in real work

---

## Sample data

Use the `users` and `products` tables from [Lesson 5: SELECT - Retrieving Data](05-select-retrieving-data.md) or [Lesson 8: INSERT - Adding Data](08-insert-adding-data.md). Minimal setup:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    age INTEGER,
    city TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, name, email, age, city) VALUES
    (1, 'Alice Johnson', 'alice@example.com', 28, 'New York'),
    (2, 'Bob Smith', 'bob@example.com', 35, 'Los Angeles');

CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT,
    stock INTEGER DEFAULT 0
);

INSERT INTO products (id, name, price, category, stock) VALUES
    (1, 'Laptop', 999.99, 'Electronics', 50),
    (2, 'Headphones', 79.99, 'Electronics', 200);
```

---

## Updating one column

Raise the price of product `id` 2:

```sql
UPDATE products
SET price = 69.99
WHERE id = 2;
```

Only rows that satisfy `WHERE id = 2` are changed. Here, that is at most one row.

---

## Updating multiple columns

Change Bob's city and age:

```sql
UPDATE users
SET city = 'San Diego',
    age = 36
WHERE id = 2;
```

All listed assignments apply to **each** row that matches the `WHERE` clause.

---

## Using expressions in SET

Values can be expressions, not only literals:

```sql
UPDATE products
SET price = price * 1.05,
    stock = stock - 1
WHERE id = 1;
```

This increases price by 5% and decrements stock by one for the matching row.

---

## WHERE is not optional in practice

### Correct: scoped update

```sql
UPDATE users
SET email = 'alice.new@example.com'
WHERE id = 1;
```

### Dangerous: no WHERE

```sql
UPDATE users
SET email = 'oops@example.com';
```

**Every row** in `users` gets that email. In production this is usually a serious mistake.

**Habits that help:**

- Write the `WHERE` first, or run a `SELECT` with the same `WHERE` to see how many rows match, then run the `UPDATE`.
- Use transactions in applications so you can roll back if the row count is wrong (transactions are covered in a later lesson).

---

## How many rows match?

The effect of `UPDATE` depends entirely on `WHERE`:

- `WHERE id = 1` — zero or one row (for a unique `id`)
- `WHERE category = 'Electronics'` — every electronics product
- `WHERE stock < 10` — all low-stock rows

If zero rows match, the `UPDATE` succeeds but changes nothing.

---

## Practice exercises

### Exercise 1: Single column

Set Alice's (`id` 1) city to `Portland`.

<details>
<summary>Click to see solution</summary>

```sql
UPDATE users
SET city = 'Portland'
WHERE id = 1;
```
</details>

### Exercise 2: Multiple columns

For the Laptop (`id` 1), set `price` to `899.99` and `stock` to `40`.

<details>
<summary>Click to see solution</summary>

```sql
UPDATE products
SET price = 899.99,
    stock = 40
WHERE id = 1;
```
</details>

### Exercise 3: Expression

Increase the price of all `Electronics` products by 10% (`price = price * 1.10`).

<details>
<summary>Click to see solution</summary>

```sql
UPDATE products
SET price = price * 1.10
WHERE category = 'Electronics';
```
</details>

### Exercise 4: Thinking before updating

Explain what this statement does. How many rows could it affect?

```sql
UPDATE users SET age = age + 1 WHERE city = 'Los Angeles';
```

<details>
<summary>Click to see solution</summary>

It adds 1 to `age` for every user whose `city` is `Los Angeles`. The number of rows is however many users match that city (could be zero, one, or many).
</details>

---

## Summary

### Key points

1. `UPDATE table SET col = val [, col2 = val2 ...] WHERE ...` is the standard shape.
2. **Always** constrain with `WHERE` unless you truly intend to change every row.
3. Multiple columns use one `SET` with comma-separated assignments.
4. The right-hand side of `=` can be an expression, including other columns.

### Syntax reference

```sql
UPDATE t
SET a = 1, b = b + 1
WHERE id = 42;
```

---

## Next steps

**Next lesson:** [Lesson 10: DELETE - Removing Data](10-delete-removing-data.md)

**Related lessons:**

- [Lesson 6: WHERE - Filtering Data](06-where-filtering-data.md)
- [Lesson 8: INSERT - Adding Data](08-insert-adding-data.md)

---

## Additional resources

**SQLite:**

- UPDATE: https://www.sqlite.org/lang_update.html

**Practice:**

- After an `UPDATE`, run `SELECT` with the same `WHERE` to verify the new values
- Try a `WHERE` that matches no rows and confirm nothing breaks

---

*Last Updated: 2026-04-11*

*Estimated Duration: 6-10 minutes*
