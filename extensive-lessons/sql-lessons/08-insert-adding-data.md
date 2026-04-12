# INSERT - Adding Data

## Learning Objectives

- [ ] Insert one row into a table with `INSERT INTO`
- [ ] Insert many rows in a single statement
- [ ] Choose between listing columns explicitly or relying on table column order
- [ ] Use `INSERT ... SELECT` to copy or derive rows from a query
- [ ] Omit columns safely when defaults or NULL apply

---

## What is INSERT?

**INSERT** adds new rows to a table. You name the table, optionally list which columns you are providing, and supply values that match those columns.

**Key idea:** You are appending data to existing storage. Nothing is returned to the client except status (and sometimes row counts), unlike `SELECT`.

---

## Basic syntax

### Insert one row (explicit columns)

```sql
INSERT INTO table_name (column1, column2, column3)
VALUES (value1, value2, value3);
```

Listing columns is the recommended style: your statement stays correct if the table gains new columns later, and readers see exactly what each value means.

### Insert one row (all columns in table order)

```sql
INSERT INTO table_name
VALUES (value1, value2, value3);
```

You must supply a value for **every** column in the table, in the order the columns were defined. If the table changes, this form breaks easily.

---

## Sample tables

Use your tables from [Lesson 5: SELECT - Retrieving Data](05-select-retrieving-data.md), or create fresh copies:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    age INTEGER,
    city TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT,
    stock INTEGER DEFAULT 0
);
```

---

## Single-row examples

### All columns, explicit list

```sql
INSERT INTO users (id, name, email, age, city)
VALUES (6, 'Frank Lee', 'frank@example.com', 29, 'Seattle');
```

### Omitting columns with defaults

If `created_at` has `DEFAULT CURRENT_TIMESTAMP`, you can skip it:

```sql
INSERT INTO users (id, name, email, age, city)
VALUES (7, 'Grace Kim', 'grace@example.com', 33, 'Boston');
```

SQLite fills `created_at` from the default. Columns without defaults must be included unless they allow `NULL` and you want `NULL`.

### Omitting `id` (SQLite row id)

With `INTEGER PRIMARY KEY`, SQLite can assign the next integer if you omit `id` from the column list:

```sql
INSERT INTO users (name, email, age, city)
VALUES ('Henry Adams', 'henry@example.com', 41, 'Denver');
```

The new row gets an automatically chosen `id`. (Exact behavior can depend on how the key was declared; for learning, this pattern is enough.)

---

## Multiple rows in one INSERT

```sql
INSERT INTO products (name, price, category, stock) VALUES
    ('Mouse', 24.99, 'Electronics', 150),
    ('Pen Set', 8.50, 'Office', 300),
    ('Water Bottle', 15.00, 'Kitchen', 80);
```

One statement, one round trip to the database, clear and efficient for bulk loads.

---

## INSERT ... SELECT

Copy or compute rows from another query instead of listing literals.

### Example: archive high-stock products into a scratch table

Suppose you created:

```sql
CREATE TABLE products_backup (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT,
    stock INTEGER
);
```

Copy matching rows:

```sql
INSERT INTO products_backup (id, name, price, category, stock)
SELECT id, name, price, category, stock
FROM products
WHERE stock > 100;
```

The selected columns must be **compatible in type and count** with the insert column list (or with the table order if you omit the list).

### Example: insert computed rows without a second table

```sql
INSERT INTO products (name, price, category, stock)
SELECT name || ' (refurb)', price * 0.85, category, stock
FROM products
WHERE id = 1;
```

Useful for promotions, denormalized snapshots, or ETL steps.

---

## Rules and pitfalls

1. **NOT NULL columns** need a value unless they have a `DEFAULT`.
2. **Unique constraints** (for example on `email`) cause the insert to fail if you duplicate a value.
3. **Types** should match what the column expects; SQLite is flexible with types, but good habits matter when you move to stricter databases.
4. **Transactions:** In apps, related inserts are often wrapped in a transaction (covered in a later lesson) so either all rows succeed or none do.

---

## Practice exercises

### Exercise 1: One user

Insert a user with `id` 10, name `Irene Park`, email `irene@example.com`, age 27, city `Austin`.

<details>
<summary>Click to see solution</summary>

```sql
INSERT INTO users (id, name, email, age, city)
VALUES (10, 'Irene Park', 'irene@example.com', 27, 'Austin');
```
</details>

### Exercise 2: Two products

Insert two products in one statement: a `Tablet` at 349.99 in `Electronics` with stock 30, and a `Stapler` at 6.25 in `Office` with stock 120.

<details>
<summary>Click to see solution</summary>

```sql
INSERT INTO products (name, price, category, stock) VALUES
    ('Tablet', 349.99, 'Electronics', 30),
    ('Stapler', 6.25, 'Office', 120);
```
</details>

### Exercise 3: INSERT ... SELECT

Insert into `products` a new row that is a 10% discounted copy of the product named `Laptop` (new name `Laptop (sale)`, same category, stock 10). Assume `products` already has a `Laptop` row.

<details>
<summary>Click to see solution</summary>

```sql
INSERT INTO products (name, price, category, stock)
SELECT name || ' (sale)', price * 0.9, category, 10
FROM products
WHERE name = 'Laptop'
LIMIT 1;
```
</details>

---

## Summary

### Key points

1. `INSERT INTO table (cols) VALUES (...)` is the clearest, most maintainable form.
2. You can insert **many value tuples** after one `VALUES` keyword.
3. **Omit** columns only when `DEFAULT` or `NULL` is acceptable.
4. **`INSERT ... SELECT`** moves or derives rows from a query; column lists must line up.

### Syntax reference

```sql
-- One row
INSERT INTO t (a, b) VALUES (1, 'x');

-- Many rows
INSERT INTO t (a, b) VALUES (1, 'x'), (2, 'y');

-- From query
INSERT INTO t (a, b)
SELECT c, d FROM other WHERE ...;
```

---

## Next steps

**Next lesson:** [Lesson 9: UPDATE - Modifying Data](09-update-modifying-data.md)

**Related lessons:**

- [Lesson 4: Creating Your First Table](04-creating-tables.md)
- [Lesson 5: SELECT - Retrieving Data](05-select-retrieving-data.md)
- [Lesson 7: ORDER BY and LIMIT](07-order-by-and-limit.md)

---

## Additional resources

**SQLite:**

- INSERT: https://www.sqlite.org/lang_insert.html

**Practice:**

- Insert rows, then confirm with `SELECT * FROM ...`
- Try an insert that violates `NOT NULL` and read the error message

---

*Last Updated: 2026-04-11*

*Estimated Duration: 6-10 minutes*
