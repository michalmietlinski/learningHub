# ORDER BY and LIMIT

## Learning Objectives

- [ ] Sort query results with ORDER BY (ascending and descending)
- [ ] Sort by multiple columns for tie-breaking
- [ ] Limit how many rows are returned with LIMIT
- [ ] Skip rows for pagination with OFFSET
- [ ] Combine WHERE, ORDER BY, and LIMIT in one query

---

## Why Sort and Limit?

**ORDER BY** controls *presentation*: which row appears first, second, and so on. **LIMIT** (with optional **OFFSET**) controls *how many* rows you return—essential for "top 10" reports and for loading data in pages.

**Key Principle:**
> "WHERE decides *which* rows qualify. ORDER BY decides *in what order* they appear. LIMIT decides *how many* you actually return."

---

## ORDER BY Syntax

```sql
SELECT column1, column2
FROM table_name
ORDER BY column1 [ASC | DESC];
```

- **ASC** — ascending (smallest to largest, A to Z); this is the default if you omit ASC/DESC
- **DESC** — descending (largest to smallest, Z to A)

`ORDER BY` comes *after* `WHERE` (if you have one).

---

## Sample Data

Use the setup from [Lesson 5: SELECT - Retrieving Data](05-select-retrieving-data.md) or [Lesson 6: WHERE - Filtering Data](06-where-filtering-data.md).

---

## Sorting Examples

### Ascending by Price (Default)

```sql
SELECT name, price
FROM products
ORDER BY price;
```

### Descending by Price (Most Expensive First)

```sql
SELECT name, price
FROM products
ORDER BY price DESC;
```

### Users by Age, Then Name (Tie-Break)

When two rows share the same `age`, `name` breaks the tie:

```sql
SELECT name, age
FROM users
ORDER BY age DESC, name ASC;
```

You can sort by multiple columns: the database sorts by the first column, then the second for equal values in the first, and so on.

---

## LIMIT and OFFSET

### LIMIT — Take Only N Rows

```sql
SELECT name, price
FROM products
ORDER BY price ASC
LIMIT 3;
```

Returns the three cheapest products *if* you sorted by price ascending first.

### OFFSET — Skip Rows (Pagination)

```sql
SELECT name, price
FROM products
ORDER BY price ASC
LIMIT 3 OFFSET 3;
```

Skips the first 3 rows in the sorted result, then returns the next 3. Common pattern for "page 2" when page size is 3.

**SQLite alternative syntax** (same meaning as `LIMIT count OFFSET skip`):

```sql
LIMIT 3 OFFSET 3;
-- In SQLite you may also see: LIMIT 3, 3  (LIMIT count, offset)
```

---

## Combining WHERE + ORDER BY + LIMIT

Typical pattern: filter, sort, take the top slice.

### Example: Top 2 Electronics by Price

```sql
SELECT name, price
FROM products
WHERE category = 'Electronics'
ORDER BY price DESC
LIMIT 2;
```

### Example: Youngest User in Chicago

```sql
SELECT name, age, city
FROM users
WHERE city = 'Chicago'
ORDER BY age ASC
LIMIT 1;
```

---

## Practical Notes

1. **Without ORDER BY**, row order is *not guaranteed*. Never rely on "default" order if you care about which row is "first."
2. **LIMIT without ORDER BY** gives you *some* N rows—not necessarily the "top" or "best" by any rule.
3. **Large OFFSET** can be slow on huge tables in production; later you may use keyset pagination. For learning, OFFSET is fine.
4. **Column positions** — `ORDER BY 2 DESC` sorts by the second column in the SELECT list. It works, but naming the column is clearer for readers.

---

## Clause Order (Simple Queries)

```sql
SELECT ...
FROM ...
WHERE ...
ORDER BY ...
LIMIT ... OFFSET ...;
```

---

## Practice Exercises

### Exercise 1: Basic Sort

List all products sorted alphabetically by name.

<details>
<summary>Click to see solution</summary>

```sql
SELECT name, price, category
FROM products
ORDER BY name ASC;
```
</details>

### Exercise 2: DESC

List users sorted by age, oldest first.

<details>
<summary>Click to see solution</summary>

```sql
SELECT name, age
FROM users
ORDER BY age DESC;
```
</details>

### Exercise 3: Two Sort Keys

List products: category ascending, then within each category price descending.

<details>
<summary>Click to see solution</summary>

```sql
SELECT name, category, price
FROM products
ORDER BY category ASC, price DESC;
```
</details>

### Exercise 4: WHERE + ORDER BY + LIMIT

Get the name and price of the single cheapest Office product.

<details>
<summary>Click to see solution</summary>

```sql
SELECT name, price
FROM products
WHERE category = 'Office'
ORDER BY price ASC
LIMIT 1;
```
</details>

### Exercise 5: Pagination

Assume page size 2. Write a query for "page 3" of users when sorted by `name` ascending (skip 4 rows, take 2).

<details>
<summary>Click to see solution</summary>

```sql
SELECT name, email
FROM users
ORDER BY name ASC
LIMIT 2 OFFSET 4;
```
</details>

---

## Summary

### Key Points

1. Use **ORDER BY** whenever result order matters; specify **ASC** or **DESC** explicitly if it helps readability.
2. Multiple **ORDER BY** columns define stable, predictable sorting.
3. **LIMIT** caps the number of rows; **OFFSET** skips rows from the start of the sorted result.
4. Combine **WHERE → ORDER BY → LIMIT/OFFSET** for filtered, sorted, paginated results.

### Syntax Reference

```sql
SELECT col1, col2
FROM table_name
WHERE condition
ORDER BY col1 DESC, col2 ASC
LIMIT 10 OFFSET 20;
```

---

## Next Steps

**Next Lesson:** [Lesson 8: INSERT - Adding Data](08-insert-adding-data.md)

**Related Lessons:**

- [Lesson 5: SELECT - Retrieving Data](05-select-retrieving-data.md)
- [Lesson 6: WHERE - Filtering Data](06-where-filtering-data.md)

---

## Additional Resources

**SQLite:**

- SELECT (ORDER BY, LIMIT): https://www.sqlite.org/lang_select.html

**Practice:**

- Re-run the same queries with and without `ORDER BY` and notice why reports look different
- Try `LIMIT` with and without `ORDER BY` and compare

---

*Last Updated: 2026-04-11*

*Estimated Duration: 6-10 minutes*
