# String Functions

## Learning Objectives

- [ ] Build strings with `||`
- [ ] Change case with `UPPER` and `LOWER`
- [ ] Remove padding with `TRIM`, `LTRIM`, and `RTRIM`
- [ ] Measure and slice text with `LENGTH` and `SUBSTR` / `SUBSTRING`
- [ ] Replace substrings with `REPLACE`

This lesson is written for **SQLite**. Other databases use the same or very similar names; a short **Portability** note at the end calls out a few common differences.

---

## Why string functions?

Phone numbers, names, tags, and addresses are almost never “clean” the moment you store them. You join pieces together, fix casing, trim spaces, and pull substrings for search or display. String functions do that work **in the query**, so you can keep one source table and many presentations.

You can use these functions in `SELECT` lists, `WHERE`, `ORDER BY`, and `SET` (in `UPDATE`), wherever an expression is allowed.

---

## Sample data

```sql
CREATE TABLE customers (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL,
    display_name TEXT
);

INSERT INTO customers (id, email, display_name) VALUES
    (1, '  alice@EXAMPLE.com  ', 'alice'),
    (2, 'BOB@example.com', '   Bob Smith   '),
    (3, 'charlie+news@example.com', 'Charlie');

CREATE TABLE product_codes (
    id INTEGER PRIMARY KEY,
    code TEXT NOT NULL
);

INSERT INTO product_codes (id, code) VALUES
    (1, 'SKU-ELEC-00042'),
    (2, 'sku-office-7'),
    (3, 'X');
```

Run the examples in this lesson against these tables, or use your own text columns with similar shapes.

---

## Concatenation: `||` and `concat`

**SQLite (and the SQL standard) often uses the double-pipe** to glue strings and values that are implicitly cast to text.

```sql
SELECT display_name || ' <' || email || '>' AS label
FROM customers
WHERE id = 1;
```

If any operand is `NULL`, the whole `||` result is `NULL` in SQLite (treat that carefully when building labels).

String literals and `INTEGER` columns usually concatenate without an explicit cast:

```sql
SELECT 'Order ' || id || ' — ' || code AS title
FROM product_codes
WHERE id = 1;
```

**Newer SQLite** also provides `concat(...)` with multiple arguments; behavior with `NULL` can differ from `||`. On other products, you often see `CONCAT` or `+` (T-SQL) instead of `||`.

---

## `UPPER` and `LOWER`

```sql
SELECT email, LOWER(email) AS email_lower, UPPER('maybe') AS demo
FROM customers
WHERE id = 1;
```

Typical uses: case-insensitive comparisons, normalizing a single column before you compare, or display rules.

**Tip:** Storing a normalized “search” column or using a case-insensitive collation (database-specific) is also common; functions in `WHERE` can affect index use on large tables.

---

## `TRIM`, `LTRIM`, `RTRIM`

Default `TRIM` removes spaces from both ends. `LTRIM` and `RTRIM` only trim the left or right.

```sql
SELECT email,
       TRIM(email) AS email_neat
FROM customers
WHERE id = 1;
```

**SQLite** also allows `TRIM(str, 'chars')` to remove a set of characters from the ends, not only spaces. Other databases vary.

---

## `LENGTH`

**SQLite:** `LENGTH(x)` returns the length of the string in **bytes** for `BLOB`, and a character-oriented length for `TEXT` in most cases. For simple Latin text, byte length matches character count.

```sql
SELECT code, LENGTH(code) AS len
FROM product_codes;
```

**Other systems:** SQL Server’s `LEN` does not count trailing spaces; `LEN` vs `DATALENGTH` differ. **PostgreSQL** has `char_length` / `length` for characters.

---

## `SUBSTR` and `SUBSTRING`

**SQLite** uses `SUBSTR(string, start, length)`.

- `start` is **1-based** for the first character. Use `2` to skip the first character.
- `length` is optional; if omitted, the slice runs to the end of the string.

```sql
SELECT code, SUBSTR(code, 5) AS from_fifth
FROM product_codes
WHERE id = 1;
```

`SUBSTR('hello', -3)` in SQLite means “last three characters” (negative start counts from the end).

**`SUBSTRING`** is an alias in SQLite for the same function.

```sql
SELECT SUBSTRING('abcdef', 2, 3) AS piece;
--  'bcd'
```

**Other systems:** Substring start positions and negative indexes differ; always read the manual for the engine you deploy to.

---

## `REPLACE`

Replaces every occurrence of a **literal** substring in a string (not a regular expression).

```sql
SELECT REPLACE(email, 'example.com', 'example.org') AS new_addr
FROM customers
WHERE id = 1;
```

```sql
SELECT REPLACE('aaabbb', 'a', 'x') AS out;
--  'xxxbbb'
```

---

## Combining functions

Normalize an email for deduplication: trim spaces and lowercase.

```sql
SELECT id,
       TRIM(LOWER(email)) AS email_key
FROM customers;
```

---

## Practice exercises

### Exercise 1: Neat label

For each customer, return one column `line` in the form `name <email>`. Trim spaces on `email` and on `display_name`, and lowercase the email in the result so the label is consistent.

**Target shape (conceptually):** `Bob Smith <bob@example.com>`.

<details>
<summary>Click to see solution</summary>

```sql
SELECT TRIM(display_name) || ' <' || TRIM(LOWER(email)) || '>' AS line
FROM customers;
```
</details>

### Exercise 2: Prefix

From `product_codes`, select `code` and a column `family` with the first 8 characters of `code` (use `SUBSTR` with length 8).

<details>
<summary>Click to see solution</summary>

```sql
SELECT code, SUBSTR(code, 1, 8) AS family
FROM product_codes;
```
</details>

### Exercise 3: Replace domain

List `id` and `email` with every `example.com` changed to `example.net` in the result only (do not `UPDATE` the table).

<details>
<summary>Click to see solution</summary>

```sql
SELECT id, REPLACE(email, 'example.com', 'example.net') AS email
FROM customers;
```
</details>

### Exercise 4: Compare lengths

For `id` 2, does `LENGTH(display_name)` equal `LENGTH(TRIM(display_name))`? Write a `SELECT` that shows both and the name.

<details>
<summary>Click to see solution</summary>

```sql
SELECT display_name,
       LENGTH(display_name) AS len_raw,
       LENGTH(TRIM(display_name)) AS len_trim
FROM customers
WHERE id = 2;
-- len_raw is larger if there is leading or trailing space
```
</details>

---

## Portability (quick reference)

| Need | SQLite | Notes elsewhere |
|------|--------|-----------------|
| Concatenate | `x \|\| y` | MySQL/Postgres: `\|\|` or `concat(...)`; T-SQL: `+` for strings, `CONCAT` |
| Length | `LENGTH` | T-SQL: `LEN` (watch trailing space rules) |
| Substring | `SUBSTR`, `SUBSTRING` | Start index rules differ; SQL Server: `SUBSTRING` from 1 |
| Upper / lower / trim / replace | same names in many products | always verify NULL behavior |

---

## Summary

### Key points

1. `||` joins strings; watch **NULL** behavior.
2. `UPPER` / `LOWER` for case, `TRIM` family for padding.
3. `LENGTH` measures size; `SUBSTR` / `SUBSTRING` slices text (1-based start in SQLite).
4. `REPLACE` does literal string substitution, not regex.

### Function cheat sheet (SQLite)

```sql
'Hi ' || 'there'
UPPER('x')   LOWER('X')
TRIM('  a  ')   LTRIM('  a')   RTRIM('a  ')
LENGTH('abc')
SUBSTR('abcdef', 2, 3)   -- 'bcd'
REPLACE('a.a', '.', '-')
```

---

## Next steps

**Next lesson:** [Lesson 12: Numeric Functions](12-numeric-functions.md)

**Related lessons:**

- [Lesson 5: SELECT - Retrieving Data](05-select-retrieving-data.md)
- [Lesson 41: LIKE and Pattern Matching](41-like-pattern-matching.md) (more text matching)

---

## Additional resources

**SQLite:**

- String functions: https://www.sqlite.org/lang_corefunc.html

**Practice:**

- Build a `SELECT` that only lists emails whose trimmed length is greater than 10
- Take a `code` like `SKU-ELEC-00042` and return only the middle segment (`ELEC`); in SQLite, `INSTR(s, t)` can find the position of a substring, then you can pair it with `SUBSTR` (optional challenge)

---

*Last Updated: 2026-04-11*

*Estimated Duration: 8-12 minutes*
