# Materialized Views - Simple Guide

## 📋 Learning Objectives

- [ ] Understand what materialized views are
- [ ] Learn when to use materialized views
- [ ] Master creating and refreshing materialized views
- [ ] Recognize trade-offs vs regular views
- [ ] Understand materialized views in different databases
- [ ] Practice implementing materialized views
- [ ] Learn common patterns and use cases
- [ ] Understand best practices

---

## 🎯 Definition

**Materialized View** is a database object that stores the results of a query as a physical table. Unlike regular views (which are virtual), materialized views store actual data that can be queried directly, providing fast read performance at the cost of storage space and the need to refresh the data periodically.

**Simple Analogy:**
- **Regular View** = A saved query (runs every time you use it)
- **Materialized View** = A saved query result (pre-computed, stored as a table)

**Key Principles:**
- **Pre-computed** - Results are calculated and stored
- **Fast Reads** - No computation needed when querying
- **Periodic Refresh** - Data needs to be updated manually or automatically
- **Storage Cost** - Takes up database space
- **Performance Gain** - Much faster than running the original query

**Key Principle:**
> "A materialized view is like a snapshot of a complex query result. Instead of running the expensive query every time, you run it once, store the result, and query the stored result. You refresh it when the underlying data changes."

---

## 🏗️ Structure

### Regular View vs Materialized View

**Regular View (Virtual):**
```
┌─────────────────────────────────────────────────────────┐
│              Regular View                                │
│                                                          │
│  CREATE VIEW user_orders AS                            │
│  SELECT u.name, o.total, o.date                        │
│  FROM users u                                           │
│  JOIN orders o ON u.id = o.user_id;                    │
│                                                          │
│  Query: SELECT * FROM user_orders;                     │
│  → Runs the JOIN every time                             │
│  → Slower (computes on-the-fly)                        │
│  → Always up-to-date                                   │
│  → No storage cost                                     │
└─────────────────────────────────────────────────────────┘
```

**Materialized View (Physical):**
```
┌─────────────────────────────────────────────────────────┐
│          Materialized View                               │
│                                                          │
│  CREATE MATERIALIZED VIEW user_orders_mv AS             │
│  SELECT u.name, o.total, o.date                        │
│  FROM users u                                           │
│  JOIN orders o ON u.id = o.user_id;                    │
│                                                          │
│  → Stores result as a table                            │
│  → Fast (no computation)                                │
│  → Needs refresh (may be stale)                        │
│  → Storage cost                                         │
│                                                          │
│  Query: SELECT * FROM user_orders_mv;                 │
│  → Reads from stored table (fast!)                     │
└─────────────────────────────────────────────────────────┘
```

### Comparison

| Aspect | Regular View | Materialized View |
|--------|-------------|-------------------|
| **Storage** | None (virtual) | Yes (physical table) |
| **Query Speed** | Slower (computes each time) | Faster (pre-computed) |
| **Data Freshness** | Always current | May be stale |
| **Refresh** | Automatic | Manual/Scheduled |
| **Use Case** | Simple queries | Complex/expensive queries |

---

## 🔍 Core Concepts

### 1. What is a Materialized View?

**Definition:** A database object that stores the result of a query as a physical table, which can be queried directly without re-executing the original query.

**Purpose:**
- Speed up expensive queries
- Pre-compute aggregations
- Cache complex join results
- Optimize read-heavy workloads

**Example:**

```sql
-- Expensive query (slow)
SELECT 
  u.name,
  COUNT(o.id) as order_count,
  SUM(o.total) as total_spent,
  AVG(o.total) as avg_order
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;

-- Create materialized view (run once, store result)
CREATE MATERIALIZED VIEW user_statistics AS
SELECT 
  u.name,
  COUNT(o.id) as order_count,
  SUM(o.total) as total_spent,
  AVG(o.total) as avg_order
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;

-- Query materialized view (fast!)
SELECT * FROM user_statistics WHERE order_count > 10;
```

### 2. When to Use Materialized Views

#### Use Materialized Views When:

✅ **Expensive Queries**
- Complex joins
- Aggregations
- Calculations
- Queries that take seconds/minutes

✅ **Read-Heavy Workloads**
- Many reads, few writes
- Reports and analytics
- Dashboards
- Frequently accessed data

✅ **Data Doesn't Change Often**
- Historical data
- Reference data
- Periodic reports
- Can tolerate some staleness

✅ **Performance Critical**
- User-facing queries
- Real-time dashboards
- Analytics
- Search results

#### Don't Use Materialized Views When:

❌ **Data Changes Frequently**
- Real-time data needed
- Always need current data
- High write frequency
- Can't tolerate staleness

❌ **Simple Queries**
- Queries are already fast
- No performance issues
- Overhead not justified

❌ **Storage Constraints**
- Limited storage space
- Very large result sets
- Storage is expensive

### 3. Creating Materialized Views

#### PostgreSQL Example

```sql
-- Create materialized view
CREATE MATERIALIZED VIEW user_order_summary AS
SELECT 
  u.id as user_id,
  u.name,
  u.email,
  COUNT(o.id) as total_orders,
  SUM(o.total) as total_spent,
  AVG(o.total) as avg_order_value,
  MAX(o.date) as last_order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name, u.email;

-- Create index on materialized view for faster queries
CREATE INDEX idx_user_order_summary_user_id 
ON user_order_summary(user_id);

-- Query the materialized view (fast!)
SELECT * FROM user_order_summary 
WHERE total_spent > 1000
ORDER BY total_spent DESC;

-- Refresh the materialized view (when data changes)
REFRESH MATERIALIZED VIEW user_order_summary;

-- Refresh concurrently (doesn't block reads)
REFRESH MATERIALIZED VIEW CONCURRENTLY user_order_summary;
```

#### Oracle Example

```sql
-- Create materialized view
CREATE MATERIALIZED VIEW user_order_summary
BUILD IMMEDIATE
REFRESH FAST ON COMMIT
AS
SELECT 
  u.id as user_id,
  u.name,
  COUNT(o.id) as total_orders,
  SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;

-- Refresh automatically on commit
-- (Oracle handles this automatically)
```

#### MySQL Example

```sql
-- MySQL doesn't have native materialized views
-- Use a regular table and refresh it manually

-- Create table to store materialized view
CREATE TABLE user_order_summary AS
SELECT 
  u.id as user_id,
  u.name,
  COUNT(o.id) as total_orders,
  SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;

-- Refresh by truncating and re-inserting
TRUNCATE TABLE user_order_summary;
INSERT INTO user_order_summary
SELECT 
  u.id as user_id,
  u.name,
  COUNT(o.id) as total_orders,
  SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;
```

### 4. Refreshing Materialized Views

**Refresh Strategies:**

**A. Manual Refresh**
```sql
-- Refresh when needed
REFRESH MATERIALIZED VIEW user_order_summary;
```

**B. Scheduled Refresh**
```sql
-- Using cron job or scheduled task
-- Refresh every hour
0 * * * * psql -c "REFRESH MATERIALIZED VIEW user_order_summary;"
```

**C. Automatic Refresh (Oracle)**
```sql
-- Refresh on commit
CREATE MATERIALIZED VIEW user_order_summary
REFRESH FAST ON COMMIT
AS SELECT ...;
```

**D. Incremental Refresh**
```sql
-- Only refresh changed data (if supported)
REFRESH MATERIALIZED VIEW CONCURRENTLY user_order_summary;
```

### 5. Common Patterns

#### Pattern 1: Aggregation Views

```sql
-- Pre-compute aggregations
CREATE MATERIALIZED VIEW daily_sales_summary AS
SELECT 
  DATE(order_date) as sale_date,
  COUNT(*) as order_count,
  SUM(total) as total_revenue,
  AVG(total) as avg_order_value
FROM orders
GROUP BY DATE(order_date);

-- Fast query
SELECT * FROM daily_sales_summary 
WHERE sale_date >= CURRENT_DATE - INTERVAL '30 days';
```

#### Pattern 2: Join Results

```sql
-- Pre-compute complex joins
CREATE MATERIALIZED VIEW product_catalog AS
SELECT 
  p.id,
  p.name,
  p.price,
  c.name as category_name,
  s.name as supplier_name,
  COUNT(r.id) as review_count,
  AVG(r.rating) as avg_rating
FROM products p
JOIN categories c ON p.category_id = c.id
JOIN suppliers s ON p.supplier_id = s.id
LEFT JOIN reviews r ON p.id = r.product_id
GROUP BY p.id, p.name, p.price, c.name, s.name;

-- Fast query
SELECT * FROM product_catalog 
WHERE category_name = 'Electronics' 
AND avg_rating > 4.0;
```

#### Pattern 3: Denormalized Data

```sql
-- Denormalize for fast reads
CREATE MATERIALIZED VIEW user_profile AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.created_at,
  COUNT(DISTINCT o.id) as order_count,
  SUM(o.total) as lifetime_value,
  MAX(o.date) as last_order_date,
  STRING_AGG(DISTINCT p.name, ', ') as purchased_products
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.id
GROUP BY u.id, u.name, u.email, u.created_at;

-- Fast query
SELECT * FROM user_profile 
WHERE lifetime_value > 1000;
```

---

## 💡 When to Use Materialized Views

### Use Materialized Views When:

✅ **Expensive Queries**
- Complex joins across multiple tables
- Heavy aggregations (SUM, COUNT, AVG)
- Calculations and transformations
- Queries taking seconds or minutes

✅ **Read-Heavy, Write-Light**
- Many reads, few writes
- Reports and analytics
- Dashboards
- Frequently accessed summaries

✅ **Data Changes Infrequently**
- Historical data
- Reference data
- Periodic reports
- Can tolerate some staleness

✅ **Performance Critical**
- User-facing queries
- Real-time dashboards
- Search results
- API responses

### Don't Use Materialized Views When:

❌ **Real-Time Data Required**
- Always need current data
- High write frequency
- Can't tolerate staleness
- Financial transactions

❌ **Simple Queries**
- Queries already fast
- No performance issues
- Overhead not justified

❌ **Storage Constraints**
- Limited storage
- Very large result sets
- Storage expensive

---

## 🏛️ Implementation Examples

### Example 1: Sales Dashboard

```sql
-- Create materialized view for sales dashboard
CREATE MATERIALIZED VIEW sales_dashboard AS
SELECT 
  DATE_TRUNC('day', order_date) as date,
  COUNT(*) as orders,
  SUM(total) as revenue,
  COUNT(DISTINCT user_id) as customers,
  AVG(total) as avg_order_value
FROM orders
WHERE order_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', order_date);

-- Create index
CREATE INDEX idx_sales_dashboard_date ON sales_dashboard(date);

-- Query (fast!)
SELECT * FROM sales_dashboard 
ORDER BY date DESC 
LIMIT 30;

-- Refresh daily
-- (Set up cron job or scheduled task)
```

### Example 2: Product Catalog

```sql
-- Create materialized view for product catalog
CREATE MATERIALIZED VIEW product_catalog_view AS
SELECT 
  p.id,
  p.name,
  p.price,
  p.stock,
  c.name as category,
  s.name as supplier,
  COUNT(r.id) as review_count,
  ROUND(AVG(r.rating), 2) as avg_rating,
  STRING_AGG(DISTINCT t.name, ', ') as tags
FROM products p
JOIN categories c ON p.category_id = c.id
JOIN suppliers s ON p.supplier_id = s.id
LEFT JOIN reviews r ON p.id = r.product_id
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id
GROUP BY p.id, p.name, p.price, p.stock, c.name, s.name;

-- Query (fast!)
SELECT * FROM product_catalog_view 
WHERE category = 'Electronics' 
AND avg_rating > 4.0
ORDER BY avg_rating DESC;
```

### Example 3: User Statistics

```sql
-- Create materialized view for user statistics
CREATE MATERIALIZED VIEW user_statistics AS
SELECT 
  u.id,
  u.name,
  u.email,
  u.created_at,
  COUNT(DISTINCT o.id) as total_orders,
  SUM(o.total) as total_spent,
  AVG(o.total) as avg_order_value,
  MAX(o.date) as last_order_date,
  COUNT(DISTINCT oi.product_id) as unique_products_purchased
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY u.id, u.name, u.email, u.created_at;

-- Query (fast!)
SELECT * FROM user_statistics 
WHERE total_spent > 1000
ORDER BY total_spent DESC
LIMIT 100;
```

---

## ⚠️ Common Pitfalls

### 1. Forgetting to Refresh

**Problem:** Materialized view becomes stale and shows outdated data.

**❌ Wrong:**

```sql
-- Create materialized view
CREATE MATERIALIZED VIEW user_stats AS SELECT ...;

-- Never refresh it
-- Data becomes stale!
```

**✅ Correct:**

```sql
-- Create materialized view
CREATE MATERIALIZED VIEW user_stats AS SELECT ...;

-- Set up automatic refresh (cron, scheduled task, or trigger)
-- Or refresh manually when needed
REFRESH MATERIALIZED VIEW user_stats;
```

### 2. Refreshing Too Frequently

**Problem:** Refreshing too often negates performance benefits.

**❌ Wrong:**

```sql
-- Refresh on every query (defeats the purpose!)
-- This is worse than a regular view!
```

**✅ Correct:**

```sql
-- Refresh based on data change frequency
-- Daily for daily reports
-- Hourly for frequently changing data
-- On-demand for rarely changing data
```

### 3. Not Creating Indexes

**Problem:** Materialized view queries are still slow without indexes.

**❌ Wrong:**

```sql
CREATE MATERIALIZED VIEW user_stats AS SELECT ...;
-- No indexes - queries still slow!
```

**✅ Correct:**

```sql
CREATE MATERIALIZED VIEW user_stats AS SELECT ...;
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_stats_total_spent ON user_stats(total_spent);
-- Now queries are fast!
```

---

## ✅ Best Practices

### 1. Refresh Strategy

✅ **Do:**
- Refresh based on data change frequency
- Use scheduled refreshes for predictable patterns
- Refresh concurrently when possible
- Monitor refresh performance

❌ **Don't:**
- Refresh too frequently
- Forget to refresh
- Block reads during refresh (use CONCURRENTLY)

### 2. Indexing

✅ **Do:**
- Create indexes on frequently queried columns
- Index foreign keys
- Index columns used in WHERE clauses
- Monitor index usage

❌ **Don't:**
- Create too many indexes
- Index every column
- Forget to index

### 3. Monitoring

✅ **Do:**
- Monitor refresh times
- Track query performance
- Monitor storage usage
- Check data freshness

❌ **Don't:**
- Ignore performance metrics
- Skip monitoring
- Forget about storage costs

---

## 🔀 Materialized Views vs Other Patterns

### Materialized Views vs Regular Views

**Regular Views:**
- Virtual (no storage)
- Always current
- Slower (computes each time)
- Simple queries

**Materialized Views:**
- Physical (takes storage)
- May be stale
- Faster (pre-computed)
- Complex queries

### Materialized Views vs Caching

**Caching:**
- Application-level
- TTL-based expiration
- In-memory
- Application-specific

**Materialized Views:**
- Database-level
- Manual refresh
- Disk storage
- Database-wide

### Materialized Views vs Projections (CQRS)

**Projections:**
- Application-level
- Event-driven updates
- Custom transformation logic
- Multiple read models

**Materialized Views:**
- Database-level
- Query-based refresh
- SQL-based
- Database views

---

## 🌍 Real-World Applications

### 1. Analytics Dashboards

**Use Case:** Pre-compute dashboard data
```sql
CREATE MATERIALIZED VIEW dashboard_stats AS
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as events,
  SUM(value) as total_value
FROM events
GROUP BY DATE_TRUNC('hour', created_at);
```

### 2. Reporting Systems

**Use Case:** Generate reports quickly
```sql
CREATE MATERIALIZED VIEW monthly_sales_report AS
SELECT 
  DATE_TRUNC('month', order_date) as month,
  SUM(total) as revenue,
  COUNT(*) as orders
FROM orders
GROUP BY DATE_TRUNC('month', order_date);
```

### 3. Search Optimization

**Use Case:** Pre-compute search results
```sql
CREATE MATERIALIZED VIEW product_search_index AS
SELECT 
  p.id,
  p.name,
  p.description,
  c.name as category,
  STRING_AGG(t.name, ' ') as tags
FROM products p
JOIN categories c ON p.category_id = c.id
LEFT JOIN product_tags pt ON p.id = pt.product_id
LEFT JOIN tags t ON pt.tag_id = t.id
GROUP BY p.id, p.name, p.description, c.name;
```

---

## 📊 Benefits and Trade-offs

### Benefits

✅ **Performance**
- Much faster queries
- No computation on read
- Better user experience
- Reduced database load

✅ **Simplicity**
- Simple to create
- Standard SQL
- Database-native
- Easy to query

### Trade-offs

❌ **Storage**
- Takes up space
- Duplicates data
- Storage costs
- Larger database

❌ **Freshness**
- May be stale
- Needs refresh
- Refresh overhead
- Consistency trade-off

---

## 🎓 Summary

### Key Takeaways

1. **Materialized Views** store query results as physical tables
2. **Pre-computed** - Results calculated and stored
3. **Fast Reads** - No computation when querying
4. **Periodic Refresh** - Data needs to be updated
5. **Storage Cost** - Takes up database space
6. **Performance Gain** - Much faster than original query

### When to Use

✅ **Use Materialized Views When:**
- Expensive queries (joins, aggregations)
- Read-heavy workloads
- Data doesn't change often
- Performance is critical

❌ **Avoid Materialized Views When:**
- Real-time data required
- Simple queries
- Storage constrained
- Data changes frequently

### Best Practices

- Refresh based on data change frequency
- Create indexes on materialized views
- Monitor refresh performance
- Balance freshness vs performance
- Use CONCURRENTLY refresh when possible

### Next Steps

After mastering Materialized Views, consider:
- **[Denormalization](./2026-01-22-denormalization.md)** - Optimize read performance
- **[Projections](./2026-01-21-projections.md)** - Build read models from events
- **[CQRS](./2026-01-20-cqrs-pattern.md)** - Separate read and write models
- **Database Optimization** - Query optimization techniques

---

## 📚 Additional Resources

**Related Patterns:**
- [Denormalization](./2026-01-22-denormalization.md) - Optimize read performance
- [Projections](./2026-01-21-projections.md) - Build read models from events
- [CQRS](./2026-01-20-cqrs-pattern.md) - Separate read and write models

**Database Documentation:**
- PostgreSQL Materialized Views
- Oracle Materialized Views
- MySQL Workarounds for Materialized Views

---

