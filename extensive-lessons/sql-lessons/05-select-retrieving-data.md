# SELECT - Retrieving Data

## 📋 Learning Objectives

- [ ] Understand the SELECT statement and its purpose
- [ ] Use SELECT to retrieve all columns from a table
- [ ] Select specific columns from a table
- [ ] Use column aliases to rename columns in results
- [ ] Understand the order of SELECT query execution
- [ ] Run your first queries and see results

---

## 🎯 What is SELECT?

**SELECT** is the most commonly used SQL statement. It retrieves data from one or more tables in a database. Think of it as asking the database a question and getting back an answer.

**Key Principle:**
> "SELECT is how you ask questions to your database. You specify what data you want (columns), and where to get it from (tables). The database returns the matching data as a result set."

**Fun Fact:** You'll probably write more SELECT statements than any other SQL command. It's estimated that 80-90% of database operations in typical applications are reads (SELECT), not writes (INSERT/UPDATE/DELETE).

---

## 📝 Basic SELECT Syntax

### The Simplest SELECT

```sql
SELECT column1, column2, ...
FROM table_name;
```

### Syntax Breakdown

- **SELECT** - SQL keyword that starts the query
- **column1, column2, ...** - The columns you want to retrieve
- **FROM** - Keyword specifying which table to query
- **table_name** - The table containing the data

---

## 🗃️ Sample Data for This Lesson

Before we start querying, let's set up some sample data. Run these commands to create and populate our tables:

```sql
-- Create the users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    age INTEGER,
    city TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name, email, age, city) VALUES
    ('Alice Johnson', 'alice@example.com', 28, 'New York'),
    ('Bob Smith', 'bob@example.com', 35, 'Los Angeles'),
    ('Charlie Brown', 'charlie@example.com', 22, 'Chicago'),
    ('Diana Ross', 'diana@example.com', 31, 'Houston'),
    ('Eve Wilson', 'eve@example.com', 45, 'Phoenix');

-- Create the products table
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT,
    stock INTEGER DEFAULT 0
);

-- Insert sample data
INSERT INTO products (name, price, category, stock) VALUES
    ('Laptop', 999.99, 'Electronics', 50),
    ('Headphones', 79.99, 'Electronics', 200),
    ('Coffee Mug', 12.99, 'Kitchen', 500),
    ('Notebook', 4.99, 'Office', 1000),
    ('Desk Lamp', 34.99, 'Office', 75);
```

Now you have data to query! Let's learn how to retrieve it.

---

## 🌟 SELECT * - Selecting All Columns

The asterisk (`*`) is a wildcard that means "all columns."

### Syntax

```sql
SELECT * FROM table_name;
```

### Example: Get All Users

```sql
SELECT * FROM users;
```

**Result:**

```
┌────┬───────────────┬─────────────────────┬─────┬─────────────┬─────────────────────┐
│ id │ name          │ email               │ age │ city        │ created_at          │
├────┼───────────────┼─────────────────────┼─────┼─────────────┼─────────────────────┤
│ 1  │ Alice Johnson │ alice@example.com   │ 28  │ New York    │ 2026-02-03 10:30:00 │
│ 2  │ Bob Smith     │ bob@example.com     │ 35  │ Los Angeles │ 2026-02-03 10:30:00 │
│ 3  │ Charlie Brown │ charlie@example.com │ 22  │ Chicago     │ 2026-02-03 10:30:00 │
│ 4  │ Diana Ross    │ diana@example.com   │ 31  │ Houston     │ 2026-02-03 10:30:00 │
│ 5  │ Eve Wilson    │ eve@example.com     │ 45  │ Phoenix     │ 2026-02-03 10:30:00 │
└────┴───────────────┴─────────────────────┴─────┴─────────────┴─────────────────────┘
```

### Example: Get All Products

```sql
SELECT * FROM products;
```

**Result:**

```
┌────┬────────────┬────────┬─────────────┬───────┐
│ id │ name       │ price  │ category    │ stock │
├────┼────────────┼────────┼─────────────┼───────┤
│ 1  │ Laptop     │ 999.99 │ Electronics │ 50    │
│ 2  │ Headphones │ 79.99  │ Electronics │ 200   │
│ 3  │ Coffee Mug │ 12.99  │ Kitchen     │ 500   │
│ 4  │ Notebook   │ 4.99   │ Office      │ 1000  │
│ 5  │ Desk Lamp  │ 34.99  │ Office      │ 75    │
└────┴────────────┴────────┴─────────────┴───────┘
```

### ⚠️ When to Use SELECT *

**✅ Good for:**
- Quick exploration and debugging
- Small tables during development
- When you truly need all columns

**❌ Avoid in production code because:**
- Returns more data than needed (slower)
- If table structure changes, your code might break
- Makes code less clear (what columns are you actually using?)

---

## 🎯 Selecting Specific Columns

Instead of getting all columns, you can specify exactly which ones you need.

### Syntax

```sql
SELECT column1, column2 FROM table_name;
```

### Example: Get User Names and Emails

```sql
SELECT name, email FROM users;
```

**Result:**

```
┌───────────────┬─────────────────────┐
│ name          │ email               │
├───────────────┼─────────────────────┤
│ Alice Johnson │ alice@example.com   │
│ Bob Smith     │ bob@example.com     │
│ Charlie Brown │ charlie@example.com │
│ Diana Ross    │ diana@example.com   │
│ Eve Wilson    │ eve@example.com     │
└───────────────┴─────────────────────┘
```

### Example: Get Product Names and Prices

```sql
SELECT name, price FROM products;
```

**Result:**

```
┌────────────┬────────┐
│ name       │ price  │
├────────────┼────────┤
│ Laptop     │ 999.99 │
│ Headphones │ 79.99  │
│ Coffee Mug │ 12.99  │
│ Notebook   │ 4.99   │
│ Desk Lamp  │ 34.99  │
└────────────┴────────┘
```

### Example: Single Column

You can select just one column:

```sql
SELECT name FROM users;
```

**Result:**

```
┌───────────────┐
│ name          │
├───────────────┤
│ Alice Johnson │
│ Bob Smith     │
│ Charlie Brown │
│ Diana Ross    │
│ Eve Wilson    │
└───────────────┘
```

### Example: Multiple Columns (Different Order)

Columns appear in the order you specify them:

```sql
SELECT email, name, age FROM users;
```

**Result:**

```
┌─────────────────────┬───────────────┬─────┐
│ email               │ name          │ age │
├─────────────────────┼───────────────┼─────┤
│ alice@example.com   │ Alice Johnson │ 28  │
│ bob@example.com     │ Bob Smith     │ 35  │
│ charlie@example.com │ Charlie Brown │ 22  │
│ diana@example.com   │ Diana Ross    │ 31  │
│ eve@example.com     │ Eve Wilson    │ 45  │
└─────────────────────┴───────────────┴─────┘
```

Notice: Email appears first because we listed it first!

---

## 🏷️ Column Aliases (AS)

**Aliases** let you rename columns in the result set. This is useful for:
- Making column names more readable
- Shortening long column names
- Clarifying calculated columns

### Syntax

```sql
SELECT column_name AS alias_name FROM table_name;
```

**Note:** The `AS` keyword is optional but recommended for clarity.

### Example: Renaming Columns

```sql
SELECT 
    name AS user_name,
    email AS user_email
FROM users;
```

**Result:**

```
┌───────────────┬─────────────────────┐
│ user_name     │ user_email          │
├───────────────┼─────────────────────┤
│ Alice Johnson │ alice@example.com   │
│ Bob Smith     │ bob@example.com     │
│ Charlie Brown │ charlie@example.com │
│ Diana Ross    │ diana@example.com   │
│ Eve Wilson    │ eve@example.com     │
└───────────────┴─────────────────────┘
```

### Example: Product Display Names

```sql
SELECT 
    name AS product_name,
    price AS retail_price,
    stock AS quantity_available
FROM products;
```

**Result:**

```
┌──────────────┬──────────────┬────────────────────┐
│ product_name │ retail_price │ quantity_available │
├──────────────┼──────────────┼────────────────────┤
│ Laptop       │ 999.99       │ 50                 │
│ Headphones   │ 79.99        │ 200                │
│ Coffee Mug   │ 12.99        │ 500                │
│ Notebook     │ 4.99         │ 1000               │
│ Desk Lamp    │ 34.99        │ 75                 │
└──────────────┴──────────────┴────────────────────┘
```

### Aliases with Spaces

If your alias contains spaces, use quotes:

```sql
SELECT 
    name AS "Product Name",
    price AS "Retail Price ($)"
FROM products;
```

**Result:**

```
┌──────────────┬──────────────────┐
│ Product Name │ Retail Price ($) │
├──────────────┼──────────────────┤
│ Laptop       │ 999.99           │
│ Headphones   │ 79.99            │
│ Coffee Mug   │ 12.99            │
│ Notebook     │ 4.99             │
│ Desk Lamp    │ 34.99            │
└──────────────┴──────────────────┘
```

### Without AS (Still Works)

The `AS` keyword is optional:

```sql
SELECT name product_name, price retail_price FROM products;
```

This works the same way, but `AS` makes your intent clearer.

---

## 🔢 SELECT with Expressions

You can perform calculations and transformations directly in SELECT:

### Example: Calculate Discounted Price

```sql
SELECT 
    name,
    price,
    price * 0.9 AS discounted_price
FROM products;
```

**Result:**

```
┌────────────┬────────┬──────────────────┐
│ name       │ price  │ discounted_price │
├────────────┼────────┼──────────────────┤
│ Laptop     │ 999.99 │ 899.991          │
│ Headphones │ 79.99  │ 71.991           │
│ Coffee Mug │ 12.99  │ 11.691           │
│ Notebook   │ 4.99   │ 4.491            │
│ Desk Lamp  │ 34.99  │ 31.491           │
└────────────┴────────┴──────────────────┘
```

### Example: Calculate Inventory Value

```sql
SELECT 
    name,
    price,
    stock,
    price * stock AS inventory_value
FROM products;
```

**Result:**

```
┌────────────┬────────┬───────┬─────────────────┐
│ name       │ price  │ stock │ inventory_value │
├────────────┼────────┼───────┼─────────────────┤
│ Laptop     │ 999.99 │ 50    │ 49999.5         │
│ Headphones │ 79.99  │ 200   │ 15998.0         │
│ Coffee Mug │ 12.99  │ 500   │ 6495.0          │
│ Notebook   │ 4.99   │ 1000  │ 4990.0          │
│ Desk Lamp  │ 34.99  │ 75    │ 2624.25         │
└────────────┴────────┴───────┴─────────────────┘
```

### Example: Concatenate Strings

```sql
SELECT 
    name || ' - $' || price AS product_display
FROM products;
```

**Result:**

```
┌─────────────────────────┐
│ product_display         │
├─────────────────────────┤
│ Laptop - $999.99        │
│ Headphones - $79.99     │
│ Coffee Mug - $12.99     │
│ Notebook - $4.99        │
│ Desk Lamp - $34.99      │
└─────────────────────────┘
```

**Note:** In SQLite, `||` concatenates strings. In MySQL, you'd use `CONCAT()`.

---

## 📊 SELECT Without a Table

You can use SELECT for simple calculations without querying a table:

```sql
SELECT 1 + 1;
```

**Result:** `2`

```sql
SELECT 10 * 5 AS result;
```

**Result:** `50`

```sql
SELECT 'Hello, SQL!' AS greeting;
```

**Result:** `Hello, SQL!`

This is useful for:
- Testing expressions
- Quick calculations
- Checking SQL syntax

---

## 🔄 DISTINCT - Removing Duplicates

**DISTINCT** removes duplicate rows from the result set.

### Syntax

```sql
SELECT DISTINCT column_name FROM table_name;
```

### Example: Get Unique Categories

```sql
SELECT DISTINCT category FROM products;
```

**Result:**

```
┌─────────────┐
│ category    │
├─────────────┤
│ Electronics │
│ Kitchen     │
│ Office      │
└─────────────┘
```

Without DISTINCT, you'd see "Electronics" and "Office" twice.

### Example: Get Unique Cities

```sql
SELECT DISTINCT city FROM users;
```

**Result:**

```
┌─────────────┐
│ city        │
├─────────────┤
│ New York    │
│ Los Angeles │
│ Chicago     │
│ Houston     │
│ Phoenix     │
└─────────────┘
```

### DISTINCT with Multiple Columns

When using DISTINCT with multiple columns, it removes rows where the combination is duplicate:

```sql
SELECT DISTINCT category, stock > 100 AS high_stock FROM products;
```

---

## 💡 Best Practices

### 1. Be Specific with Column Names

✅ **Good:**
```sql
SELECT name, email, age FROM users;
```

❌ **Avoid in production:**
```sql
SELECT * FROM users;
```

### 2. Use Meaningful Aliases

✅ **Good:**
```sql
SELECT price * stock AS inventory_value FROM products;
```

❌ **Less Clear:**
```sql
SELECT price * stock AS x FROM products;
```

### 3. Format Your Queries for Readability

✅ **Good:**
```sql
SELECT 
    name,
    email,
    age,
    city
FROM users;
```

❌ **Hard to Read:**
```sql
SELECT name,email,age,city FROM users;
```

### 4. Use Comments for Complex Queries

```sql
-- Get product information with calculated inventory value
SELECT 
    name,
    price,
    stock,
    price * stock AS inventory_value  -- Total value of stock
FROM products;
```

---

## 🎓 Common Mistakes to Avoid

### Mistake 1: Forgetting FROM

❌ **Wrong:**
```sql
SELECT name, email;
```
Error: No tables specified

✅ **Correct:**
```sql
SELECT name, email FROM users;
```

### Mistake 2: Misspelling Column Names

❌ **Wrong:**
```sql
SELECT naem, emial FROM users;
```
Error: no such column: naem

✅ **Correct:**
```sql
SELECT name, email FROM users;
```

### Mistake 3: Using Wrong Table Name

❌ **Wrong:**
```sql
SELECT * FROM user;
```
Error: no such table: user

✅ **Correct:**
```sql
SELECT * FROM users;
```

### Mistake 4: Missing Commas Between Columns

❌ **Wrong:**
```sql
SELECT name email age FROM users;
```
Error: near "email": syntax error

✅ **Correct:**
```sql
SELECT name, email, age FROM users;
```

---

## 🏃 Practice Exercises

### Exercise 1: Basic SELECT

Write a query to get all columns from the `products` table.

<details>
<summary>Click to see solution</summary>

```sql
SELECT * FROM products;
```
</details>

### Exercise 2: Specific Columns

Write a query to get only the `name` and `city` columns from the `users` table.

<details>
<summary>Click to see solution</summary>

```sql
SELECT name, city FROM users;
```
</details>

### Exercise 3: Column Aliases

Write a query to get product names and prices, with aliases "Item" and "Cost".

<details>
<summary>Click to see solution</summary>

```sql
SELECT 
    name AS Item,
    price AS Cost
FROM products;
```
</details>

### Exercise 4: Calculated Column

Write a query to show product names, prices, and a 20% discounted price (as "sale_price").

<details>
<summary>Click to see solution</summary>

```sql
SELECT 
    name,
    price,
    price * 0.8 AS sale_price
FROM products;
```
</details>

### Exercise 5: DISTINCT Values

Write a query to get all unique categories from the `products` table.

<details>
<summary>Click to see solution</summary>

```sql
SELECT DISTINCT category FROM products;
```
</details>

### Exercise 6: Combined Challenge

Write a query that shows user names and emails with the aliases "Full Name" and "Email Address".

<details>
<summary>Click to see solution</summary>

```sql
SELECT 
    name AS "Full Name",
    email AS "Email Address"
FROM users;
```
</details>

---

## 📚 Summary

### Key Points

1. **SELECT** retrieves data from database tables
2. **SELECT *** gets all columns (use sparingly in production)
3. **SELECT column1, column2** gets specific columns
4. **AS** creates column aliases for readability
5. **DISTINCT** removes duplicate rows
6. You can use **expressions** in SELECT (calculations, concatenation)
7. Always specify the **FROM** clause with your table name

### SELECT Syntax Reference

```sql
-- All columns
SELECT * FROM table_name;

-- Specific columns
SELECT column1, column2 FROM table_name;

-- With aliases
SELECT column1 AS alias1, column2 AS alias2 FROM table_name;

-- With expressions
SELECT column1, column1 * 2 AS doubled FROM table_name;

-- Distinct values
SELECT DISTINCT column1 FROM table_name;
```

### Commands to Remember

| Command | Description |
|---------|-------------|
| `SELECT *` | Get all columns |
| `SELECT col1, col2` | Get specific columns |
| `SELECT col AS alias` | Rename column in result |
| `SELECT DISTINCT col` | Get unique values only |
| `SELECT col1 * col2` | Calculate values |

---

## 🔗 Next Steps

Now that you can retrieve data, you're ready to filter it!

**Next Lesson:** [Lesson 6: WHERE - Filtering Data](06-where-filtering-data.md)
- Learn to filter results with conditions
- Use comparison operators (=, <, >, !=)
- Combine multiple conditions with AND/OR

**Related Lessons:**
- [Lesson 4: Creating Your First Table](04-creating-tables.md) - Creating tables
- [Lesson 7: ORDER BY and LIMIT](07-order-by-and-limit.md) - Sorting and limiting results
- [Lesson 8: INSERT - Adding Data](08-insert-adding-data.md) - Adding data to tables

---

## 📖 Additional Resources

**SQLite Documentation:**
- SELECT: https://www.sqlite.org/lang_select.html
- Expressions: https://www.sqlite.org/lang_expr.html

**Practice:**
- Try different column combinations
- Create your own aliases
- Experiment with string concatenation
- Calculate different values from existing columns

---

*Last Updated: 2026-02-03*
*Estimated Duration: 5-8 minutes*

