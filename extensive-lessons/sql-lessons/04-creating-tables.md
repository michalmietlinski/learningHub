# Creating Your First Table

## 📋 Learning Objectives

- [ ] Create tables using CREATE TABLE
- [ ] Define columns with appropriate data types
- [ ] Understand basic column constraints (NOT NULL, DEFAULT)
- [ ] Create multiple tables for different purposes
- [ ] View table structure
- [ ] Drop tables when needed

---

## 🎯 What is CREATE TABLE?

**CREATE TABLE** is a SQL statement that creates a new table in your database. It defines the table's structure by specifying column names, data types, and optional constraints.

**Key Principle:**
> "CREATE TABLE defines the blueprint for your data. You specify what columns the table will have, what type of data each column can store, and any rules (constraints) that must be followed."

---

## 📝 Basic CREATE TABLE Syntax

### Simple Syntax

```sql
CREATE TABLE table_name (
    column1 datatype,
    column2 datatype,
    column3 datatype
);
```

### Syntax Breakdown

- **CREATE TABLE** - SQL keyword to create a new table
- **table_name** - The name you give to your table (use descriptive names)
- **column_name** - The name of each column
- **datatype** - The type of data the column will store (INTEGER, TEXT, REAL, etc.)
- **Constraints** - Optional rules (NOT NULL, DEFAULT, etc.)

---

## 🏗️ Creating Your First Table: Users Table

Let's create a simple `users` table to store user information.

### Example 1: Basic Users Table

```sql
CREATE TABLE users (
    id INTEGER,
    name TEXT,
    email TEXT,
    age INTEGER
);
```

**What this does:**
- Creates a table named `users`
- Defines 4 columns: `id`, `name`, `email`, `age`
- `id` and `age` store integers
- `name` and `email` store text

### Visual Representation

```
users table
┌────┬──────────────┬─────────────────────┬─────┐
│ id │ name         │ email               │ age │
├────┼──────────────┼─────────────────────┼─────┤
│    │              │                     │     │
│    │              │                     │     │
│    │              │                     │     │
└────┴──────────────┴─────────────────────┴─────┘
(Empty table, ready for data)
```

---

## 🔧 Column Constraints

Constraints are rules that enforce data integrity. Let's add some basic constraints to make our table better.

### NOT NULL Constraint

**NOT NULL** ensures a column cannot have a NULL (empty) value.

```sql
CREATE TABLE users (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    age INTEGER
);
```

**What this means:**
- `id`, `name`, and `email` are required (cannot be empty)
- `age` is optional (can be NULL)

### DEFAULT Constraint

**DEFAULT** provides a default value when no value is specified.

```sql
CREATE TABLE users (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    age INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**What this means:**
- If `age` is not provided, it defaults to `0`
- If `created_at` is not provided, it defaults to the current timestamp

### Combined Example: Users Table with Constraints

```sql
CREATE TABLE users (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    age INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📦 Example 2: Products Table

Let's create a more complex table for an e-commerce system.

```sql
CREATE TABLE products (
    product_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    category TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**Column Breakdown:**
- `product_id` - Required integer (product identifier)
- `name` - Required text (product name)
- `description` - Optional text (can be NULL)
- `price` - Required real number (product price)
- `stock_quantity` - Integer, defaults to 0 if not specified
- `category` - Optional text (product category)
- `created_at` - Text, defaults to current timestamp

### Visual Representation

```
products table
┌────────────┬──────────┬─────────────┬───────┬────────────────┬──────────┬──────────────┐
│ product_id │ name     │ description │ price │ stock_quantity │ category │ created_at   │
├────────────┼──────────┼─────────────┼───────┼────────────────┼──────────┼──────────────┤
│            │          │             │       │                │          │              │
│            │          │             │       │                │          │              │
└────────────┴──────────┴─────────────┴───────┴────────────────┴──────────┴──────────────┘
```

---

## 📋 Example 3: Orders Table

Here's another example for an orders table:

```sql
CREATE TABLE orders (
    order_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    order_date TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**Column Breakdown:**
- `order_id` - Required integer (order identifier)
- `user_id` - Required integer (links to users table)
- `total_amount` - Required real number (order total)
- `status` - Text, defaults to 'pending' if not specified
- `order_date` - Text, defaults to current timestamp

---

## 👀 Viewing Table Structure

After creating a table, you can view its structure to verify it was created correctly.

### SQLite: .schema command

```sql
.schema users
```

**Output:**
```
CREATE TABLE users (
    id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    age INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### SQLite: .tables command

To see all tables in your database:

```sql
.tables
```

**Output:**
```
orders   products  users
```

### PostgreSQL: \d command

```sql
\d users
```

### MySQL: DESCRIBE command

```sql
DESCRIBE users;
```

or

```sql
SHOW COLUMNS FROM users;
```

---

## 🗑️ Dropping Tables

**DROP TABLE** removes a table and all its data from the database.

### Syntax

```sql
DROP TABLE table_name;
```

### Example

```sql
DROP TABLE users;
```

**⚠️ Warning:** This permanently deletes the table and all its data. Use with caution!

### Drop Table If Exists

To avoid errors if the table doesn't exist:

```sql
DROP TABLE IF EXISTS users;
```

This is safer because it won't cause an error if the table doesn't exist.

---

## 💡 Best Practices

### 1. Use Descriptive Table Names

✅ **Good:**
```sql
CREATE TABLE users (...);
CREATE TABLE product_categories (...);
CREATE TABLE order_items (...);
```

❌ **Bad:**
```sql
CREATE TABLE t1 (...);
CREATE TABLE data (...);
CREATE TABLE stuff (...);
```

### 2. Use Consistent Naming Conventions

Choose a naming style and stick with it:

**Option A: snake_case (Recommended)**
```sql
CREATE TABLE user_profiles (...);
CREATE TABLE order_items (...);
```

**Option B: camelCase**
```sql
CREATE TABLE userProfiles (...);
CREATE TABLE orderItems (...);
```

### 3. Use NOT NULL for Required Fields

```sql
CREATE TABLE users (
    id INTEGER NOT NULL,        -- Required
    name TEXT NOT NULL,          -- Required
    email TEXT NOT NULL,         -- Required
    phone TEXT                   -- Optional
);
```

### 4. Use DEFAULT for Common Values

```sql
CREATE TABLE orders (
    order_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',      -- Most orders start as pending
    created_at TEXT DEFAULT CURRENT_TIMESTAMP  -- Auto-set timestamp
);
```

### 5. Choose Appropriate Data Types

✅ **Good:**
```sql
CREATE TABLE products (
    product_id INTEGER,      -- IDs are integers
    name TEXT,               -- Names are text
    price REAL,              -- Prices have decimals
    in_stock INTEGER         -- Stock count is integer
);
```

❌ **Bad:**
```sql
CREATE TABLE products (
    product_id TEXT,         -- IDs should be integers
    name INTEGER,            -- Names should be text
    price TEXT,              -- Prices should be REAL
    in_stock TEXT            -- Stock should be integer
);
```

---

## 🎓 Common Mistakes to Avoid

### Mistake 1: Forgetting Commas

❌ **Wrong:**
```sql
CREATE TABLE users (
    id INTEGER
    name TEXT
    email TEXT
);
```

✅ **Correct:**
```sql
CREATE TABLE users (
    id INTEGER,
    name TEXT,
    email TEXT
);
```

**Note:** The last column doesn't need a comma.

### Mistake 2: Missing Parentheses

❌ **Wrong:**
```sql
CREATE TABLE users 
    id INTEGER,
    name TEXT;
```

✅ **Correct:**
```sql
CREATE TABLE users (
    id INTEGER,
    name TEXT
);
```

### Mistake 3: Using Reserved Words as Table Names

❌ **Wrong:**
```sql
CREATE TABLE select (...);
CREATE TABLE table (...);
CREATE TABLE order (...);
```

✅ **Correct:**
```sql
CREATE TABLE users (...);
CREATE TABLE products (...);
CREATE TABLE orders (...);
```

**Note:** If you must use a reserved word, wrap it in quotes (but it's better to avoid them):
```sql
CREATE TABLE "order" (...);  -- Works but not recommended
```

### Mistake 4: Creating Table Without Specifying Data Types

While SQLite is flexible, always specify data types for clarity:

✅ **Good:**
```sql
CREATE TABLE users (
    id INTEGER,
    name TEXT
);
```

❌ **Less Clear:**
```sql
CREATE TABLE users (
    id,
    name
);
```

---

## 🏃 Practice Exercises

### Exercise 1: Create a Students Table

Create a `students` table with:
- `student_id` (INTEGER, required)
- `first_name` (TEXT, required)
- `last_name` (TEXT, required)
- `email` (TEXT, required)
- `enrollment_date` (TEXT, defaults to current timestamp)

<details>
<summary>Click to see solution</summary>

```sql
CREATE TABLE students (
    student_id INTEGER NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    enrollment_date TEXT DEFAULT CURRENT_TIMESTAMP
);
```
</details>

### Exercise 2: Create a Books Table

Create a `books` table with:
- `book_id` (INTEGER, required)
- `title` (TEXT, required)
- `author` (TEXT, required)
- `isbn` (TEXT, optional)
- `price` (REAL, required)
- `pages` (INTEGER, optional)

<details>
<summary>Click to see solution</summary>

```sql
CREATE TABLE books (
    book_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT,
    price REAL NOT NULL,
    pages INTEGER
);
```
</details>

### Exercise 3: View and Drop

1. View the structure of your `students` table
2. View all tables in your database
3. Drop the `books` table (if you created it)

<details>
<summary>Click to see solution</summary>

```sql
-- View structure
.schema students

-- View all tables
.tables

-- Drop books table
DROP TABLE IF EXISTS books;
```
</details>

---

## 📚 Summary

### Key Points

1. **CREATE TABLE** creates a new table in your database
2. **Columns** define the structure with names and data types
3. **NOT NULL** ensures a column must have a value
4. **DEFAULT** provides a default value when none is specified
5. **DROP TABLE** removes a table and all its data
6. Use descriptive names and appropriate data types

### CREATE TABLE Syntax

```sql
CREATE TABLE table_name (
    column1 datatype constraints,
    column2 datatype constraints,
    column3 datatype constraints
);
```

### Common Constraints

- `NOT NULL` - Column cannot be empty
- `DEFAULT value` - Default value if none provided
- `DEFAULT CURRENT_TIMESTAMP` - Current date/time

### Commands to Remember

- `CREATE TABLE` - Create a new table
- `.schema table_name` - View table structure (SQLite)
- `.tables` - List all tables (SQLite)
- `DROP TABLE` - Delete a table
- `DROP TABLE IF EXISTS` - Safely delete a table

---

## 🔗 Next Steps

Now that you can create tables, you're ready to:

**Next Lesson:** [Lesson 5: SELECT - Retrieving Data](05-select-retrieving-data.md)
- Learn how to retrieve data from tables
- Use SELECT to query your tables
- Filter and sort results

**Related Lessons:**
- [Lesson 3: Understanding Tables and Data Types](03-tables-and-data-types.md) - Data types reference
- [Lesson 6: INSERT - Adding Data](06-insert-adding-data.md) - Add data to your tables

---

## 📖 Additional Resources

**SQLite Documentation:**
- CREATE TABLE: https://www.sqlite.org/lang_createtable.html
- Data Types: https://www.sqlite.org/datatype3.html

**Practice:**
- Try creating tables for different scenarios (blog posts, comments, categories)
- Experiment with different data types
- Practice using NOT NULL and DEFAULT constraints

---

*Last Updated: 2026-02-05*
*Estimated Duration: 8-12 minutes*

