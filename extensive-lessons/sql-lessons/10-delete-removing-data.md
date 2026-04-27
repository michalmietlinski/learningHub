# DELETE - Removing Data

## Learning Objectives

- [ ] Remove rows with `DELETE FROM` and `WHERE`
- [ ] Understand that omitting `WHERE` deletes all rows in the table
- [ ] Compare hard deletes with a simple **soft delete** pattern
- [ ] Adopt safe habits (verify with `SELECT` first, use backups in production)
- [ ] Know that foreign keys and `ON DELETE` can affect what you can remove

---

## What is DELETE?

**DELETE** removes whole rows from a table. It does not remove columns; for that you change the schema (later lessons) or set values to `NULL` with `UPDATE`.

**Key idea:** Deletion is usually permanent. Some databases and backups can help you recover, but in normal use you should assume deleted rows are gone.

---

## Basic syntax

```sql
DELETE FROM table_name
WHERE condition;
```

- **`DELETE FROM`** — which table to remove rows from
- **`WHERE`** — which rows to remove; in real work this is almost always present

When every row in the table matches the condition, the table becomes empty. When **no** `WHERE` is given, **every row** in the table is deleted.

---

## Sample data

Minimal `users` and `products` for the examples (same family as previous lessons):

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    age INTEGER,
    city TEXT
);

INSERT INTO users (id, name, email, age, city) VALUES
    (1, 'Alice Johnson', 'alice@example.com', 28, 'New York'),
    (2, 'Bob Smith', 'bob@example.com', 35, 'Los Angeles'),
    (3, 'Temp User', 'temp@example.com', 19, 'Testville');

CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT,
    stock INTEGER DEFAULT 0
);

INSERT INTO products (id, name, price, category, stock) VALUES
    (1, 'Laptop', 999.99, 'Electronics', 50),
    (2, 'Discontinued Item', 1.00, 'Clearance', 0);
```

---

## Delete specific rows

Remove one user by primary key:

```sql
DELETE FROM users
WHERE id = 3;
```

Remove all products in a category:

```sql
DELETE FROM products
WHERE category = 'Clearance';
```

The number of rows removed equals the number of rows that match `WHERE` (if constraints allow).

---

## DELETE without WHERE

```sql
DELETE FROM users;
```

This removes **all rows** from `users`. The table still exists; it is just empty. This is a common way to clear a table in SQLite (there is no separate `TRUNCATE` the way some other systems have it).

**Treat this as high risk.** In a script or application, double-check the table name and that you really mean “every row.”

---

## Soft delete (concept)

Sometimes you do not want physical removal: you mark a row as deleted so it can be restored or audited.

Example: add a column and “delete” by updating it:

```sql
-- Concept only: your table would need a deleted_at column, often NULL means active
-- UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = 3;
-- Applications then use WHERE deleted_at IS NULL in SELECT
```

**Hard delete** — `DELETE` removes the row. **Soft delete** — row stays, status or timestamp changes. Your reporting and foreign keys must follow the same rule everywhere.

---

## Foreign keys and related rows

If another table has a **foreign key** pointing at rows you delete, the database may:

- **Block** the delete,
- **Cascade** and delete or null out related rows (depending on `ON DELETE` definitions),

or, if foreign keys are not enabled in SQLite, you may create inconsistent data. Design and constraints are covered in later lessons; the takeaway is: deleting parent rows can affect children.

---

## Safe habits

1. **Preview:** `SELECT * FROM table WHERE ...` with the same condition you plan for `DELETE`.
2. **Limit scope:** Prefer `WHERE id = ?` or other selective predicates over broad filters when possible.
3. **Backups** in production before bulk deletes.
4. **Transactions** (later lesson) so you can roll back a mistaken batch in one session.

---

## Practice exercises

### Exercise 1: Delete one row

Delete the user with `id` 3 (`Temp User`).

<details>
<summary>Click to see solution</summary>

```sql
DELETE FROM users
WHERE id = 3;
```
</details>

### Exercise 2: Delete by condition

Delete all products with `stock` equal to 0.

<details>
<summary>Click to see solution</summary>

```sql
DELETE FROM products
WHERE stock = 0;
```
</details>

### Exercise 3: Contrast

What is the difference between `DELETE FROM users WHERE 1=1` and `DELETE FROM users`? How many rows are removed if the table has 2 rows?

<details>
<summary>Click to see solution</summary>

In standard SQL, both delete **all** rows: the first has a `WHERE` that is always true; the second has no `WHERE`, which also means all rows. If there are 2 rows, 2 are removed. Style-wise, `DELETE FROM users` is clearer for “empty this table for real.”
</details>

### Exercise 4: Risk

Why is `DELETE FROM important_table` without a `WHERE` dangerous?

<details>
<summary>Click to see solution</summary>

It targets every row in the table, so the entire table is emptied. There is no “undo” unless you have backups or a transaction you can roll back. One typo on the table name or running the wrong script can cause large data loss.
</details>

---

## Summary

### Key points

1. `DELETE FROM t WHERE ...` removes rows that match; no `WHERE` means **all** rows in `t`.
2. `DELETE` removes whole rows, not single columns.
3. **Soft delete** keeps rows and marks them inactive; **hard delete** uses `DELETE`.
4. Be explicit with `WHERE`, preview with `SELECT`, and know how related tables behave.

### Syntax reference

```sql
DELETE FROM t WHERE id = 1;
DELETE FROM t;  -- all rows: extremely careful
```

---

## Next steps

**Next lesson:** [Lesson 11: String Functions](11-string-functions.md)

**Related lessons:**

- [Lesson 6: WHERE - Filtering Data](06-where-filtering-data.md)
- [Lesson 9: UPDATE - Modifying Data](09-update-modifying-data.md)

---

## Additional resources

**SQLite:**

- DELETE: https://www.sqlite.org/lang_delete.html

**Practice:**

- `DELETE` a row, then `SELECT` from the same table to confirm it is gone
- Try your preview-then-delete workflow on a copy of a small table

---

*Last Updated: 2026-04-11*

*Estimated Duration: 5-8 minutes*
