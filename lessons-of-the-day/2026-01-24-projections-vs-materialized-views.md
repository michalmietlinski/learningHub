# Projections vs Materialized Views - Key Differences

## 📋 Learning Objectives

- [ ] Understand the fundamental differences between projections and materialized views
- [ ] Learn when to use each approach
- [ ] Recognize architectural and implementation differences
- [ ] Understand update mechanisms and consistency models

---

## 🎯 Quick Comparison

**Materialized Views:**
- Database-level feature
- SQL-based query results
- Manual or scheduled refresh
- Database-native optimization

**Projections:**
- Application-level pattern
- Event-driven updates
- Real-time or near-real-time
- Custom transformation logic

---

## 🔍 Core Differences

### 1. Architecture Level

**Materialized Views:**
```
┌─────────────────────────────────────────┐
│         Database Layer                  │
│                                         │
│  CREATE MATERIALIZED VIEW ...          │
│  REFRESH MATERIALIZED VIEW ...         │
│                                         │
│  → Database handles everything         │
└─────────────────────────────────────────┘
```

**Projections:**
```
┌─────────────────────────────────────────┐
│      Application Layer                  │
│                                         │
│  Event Handler → Projection Logic      │
│  → Updates Read Model                  │
│                                         │
│  → Application handles transformation  │
└─────────────────────────────────────────┘
```

### 2. Update Mechanism

**Materialized Views:**
- **Refresh-based**: Manual or scheduled
- **Query-based**: Re-runs SQL query
- **Full refresh**: Recomputes entire view
- **Incremental**: Some databases support (PostgreSQL CONCURRENTLY)

```sql
-- Manual refresh
REFRESH MATERIALIZED VIEW sales_summary;

-- Scheduled refresh (cron)
0 * * * * psql -c "REFRESH MATERIALIZED VIEW sales_summary;"
```

**Projections:**
- **Event-driven**: Reacts to events immediately
- **Incremental**: Updates only affected data
- **Real-time**: Near-instant updates
- **Idempotent**: Can replay events

```typescript
// Event-driven projection
eventBus.on('OrderCreated', (event) => {
  projection.updateOrderSummary(event.orderId, event.total);
});
```

### 3. Data Source

**Materialized Views:**
- **Source**: Database tables
- **Query**: SQL SELECT statement
- **Scope**: Single database
- **Format**: Relational data

```sql
CREATE MATERIALIZED VIEW user_stats AS
SELECT 
  u.id,
  COUNT(o.id) as order_count,
  SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id;
```

**Projections:**
- **Source**: Event stream
- **Query**: Event processing logic
- **Scope**: Cross-service, distributed
- **Format**: Any structure (JSON, documents, etc.)
- **Storage**: Read models saved to database (SQL, NoSQL, etc.)

```typescript
// Projection from events - updates database read model
class OrderSummaryProjection {
  constructor(private db: Database) {}
  
  async handle(event: OrderCreatedEvent) {
    // Read model IS stored in database
    await this.db.query(`
      UPDATE user_summary 
      SET order_count = order_count + 1,
          total_spent = total_spent + $1
      WHERE user_id = $2
    `, [event.total, event.userId]);
  }
}
```

### 4. Consistency Model

**Materialized Views:**
- **Strong consistency**: After refresh, data is current
- **Stale data**: Between refreshes, data may be outdated
- **Refresh overhead**: Full refresh can be expensive
- **Blocking**: Refresh may lock table (unless CONCURRENTLY)

**Projections:**
- **Eventual consistency**: Read models lag behind write models
- **Near real-time**: Updates happen as events arrive
- **No blocking**: Updates are incremental
- **Rebuildable**: Can rebuild from event stream

### 5. Technology Stack

**Materialized Views:**
- **Database feature**: PostgreSQL, Oracle, SQL Server
- **SQL-based**: Standard SQL syntax
- **Database tools**: Built into database engine
- **No code**: Pure database configuration
- **Storage**: Database-native (same database)

**Projections:**
- **Application pattern**: Any language/framework
- **Code-based**: Custom implementation
- **Event infrastructure**: Message bus, event store
- **Requires code**: Must implement projection logic
- **Storage**: Read models in database (can be different DB, NoSQL, etc.)

### 6. Use Cases

**Materialized Views - Best For:**
- ✅ SQL-based analytics
- ✅ Reporting dashboards
- ✅ Pre-computed aggregations
- ✅ Single database optimization
- ✅ Simple denormalization

**Projections - Best For:**
- ✅ Event-driven architectures
- ✅ CQRS systems
- ✅ Microservices read models
- ✅ Cross-service data synchronization
- ✅ Complex transformations

---

## 📊 Side-by-Side Comparison

| Aspect | Materialized Views | Projections |
|--------|-------------------|-------------|
| **Level** | Database | Application |
| **Language** | SQL | Any (code) |
| **Update** | Refresh (scheduled) | Event-driven (real-time) |
| **Source** | Database tables | Event stream |
| **Consistency** | Strong (after refresh) | Eventual |
| **Scope** | Single database | Distributed |
| **Complexity** | Low (SQL only) | Medium (code required) |
| **Performance** | Fast reads | Fast reads + fast updates |
| **Rebuild** | Re-run query | Replay events |
| **Flexibility** | SQL limitations | Full programming power |

---

## 💡 When to Use Which?

### Use Materialized Views When:

✅ **SQL-based system**
- All data in one database
- SQL queries are sufficient
- Simple aggregations and joins

✅ **Scheduled updates are OK**
- Data doesn't need to be real-time
- Hourly/daily refresh is acceptable
- Batch processing is fine

✅ **Database-native solution**
- Want to leverage database features
- Prefer SQL over code
- Simple setup and maintenance

### Use Projections When:

✅ **Event-driven architecture**
- Using event sourcing or CQRS
- Events are the source of truth
- Need event replay capability

✅ **Real-time updates needed**
- Data must be current quickly
- Can't wait for scheduled refresh
- Event-driven updates required

✅ **Distributed system**
- Multiple services/microservices
- Cross-service data synchronization
- Complex transformation logic

✅ **Custom transformations**
- Need complex business logic
- SQL isn't sufficient
- Want full programming flexibility

---

## 🔀 Hybrid Approach

You can use both together:

```sql
-- Materialized view for SQL-based analytics
CREATE MATERIALIZED VIEW daily_sales AS
SELECT DATE(created_at), SUM(total) as revenue
FROM orders
GROUP BY DATE(created_at);
```

```typescript
// Projection for event-driven read model (saved to database)
class UserDashboardProjection {
  constructor(private db: Database) {}
  
  async handle(event: OrderCreatedEvent) {
    // Updates read model in database (real-time)
    await this.db.query(`
      UPDATE user_dashboard 
      SET order_count = order_count + 1,
          last_order_date = $1
      WHERE user_id = $2
    `, [event.createdAt, event.userId]);
  }
}
```

**Use materialized views for:**
- SQL reporting
- Database-level optimization

**Use projections for:**
- Event-driven features
- Real-time dashboards
- Cross-service synchronization

---

## ⚠️ Common Confusions

### ❌ "Projections are just materialized views in code"

**Reality:** Projections are event-driven and incremental, while materialized views are query-based and refresh-based. Both store data in databases, but update mechanisms differ.

### ❌ "Projections don't use databases"

**Reality:** Projections DO save to databases! The read models created by projections are typically stored in databases (SQL or NoSQL). The difference is the update mechanism (event-driven vs refresh-based) and where the logic lives (application code vs database).

### ❌ "Materialized views are always better"

**Reality:** Depends on architecture. Event-driven systems need projections.

### ❌ "You can only use one"

**Reality:** Use both! Materialized views for SQL analytics, projections for event-driven features.

---

## ✅ Key Takeaways

1. **Materialized Views** = Database feature, SQL-based, refresh-driven
2. **Projections** = Application pattern, event-driven, code-based
3. **Both store data in databases** - The difference is HOW they update, not WHERE they store
4. **Materialized Views** = Strong consistency after refresh, may be stale
5. **Projections** = Eventual consistency, near real-time updates
6. **Materialized Views** = Single database, SQL queries
7. **Projections** = Distributed, event stream processing, read models in DB
8. **Use both** when you need SQL analytics AND event-driven features

---

## 📚 Related Topics

- **[Materialized Views](./2026-01-23-materialized-views.md)** - Database-level pre-computed views
- **[Projections](./2026-01-21-projections.md)** - Event-driven read models
- **[CQRS](./2026-01-20-cqrs-pattern.md)** - Command Query Responsibility Segregation
- **[Event Sourcing](./2026-01-21-event-sourcing.md)** - Event-driven data storage

---

