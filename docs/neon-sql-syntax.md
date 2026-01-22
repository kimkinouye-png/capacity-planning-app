# Neon SQL Syntax Reference

## Quick Answer

**Neon uses standard PostgreSQL SQL syntax.** Your `database/schema.sql` file should work as-is without any modifications.

## What This Means

- ✅ Standard PostgreSQL SQL commands work (`CREATE TABLE`, `INSERT`, `SELECT`, etc.)
- ✅ Standard PostgreSQL data types work (`UUID`, `JSONB`, `TIMESTAMPTZ`, etc.)
- ✅ Standard PostgreSQL functions work (`gen_random_uuid()`, `NOW()`, etc.)
- ✅ Your existing `schema.sql` file is ready to use

## Neon Documentation

If you need SQL syntax reference:

1. **Neon Documentation:**
   - https://neon.tech/docs
   - Look for "SQL Reference" or "PostgreSQL Compatibility"

2. **PostgreSQL Documentation:**
   - Neon is PostgreSQL-compatible, so standard PostgreSQL docs work
   - https://www.postgresql.org/docs/

3. **Neon SQL Editor Help:**
   - In the Neon SQL Editor, there's usually a help icon or documentation link
   - The editor may have autocomplete for SQL keywords

## Your Schema File

Your `database/schema.sql` uses standard PostgreSQL syntax:
- `CREATE TABLE IF NOT EXISTS`
- `UUID PRIMARY KEY`
- `JSONB` for JSON data
- `TIMESTAMPTZ` for timestamps
- `gen_random_uuid()` for UUID generation
- Standard PostgreSQL functions

**This will work perfectly in Neon!**

## Running Your Schema

1. Open `database/schema.sql` in your editor
2. Copy all the SQL
3. Paste it into Neon SQL Editor
4. Click "Run"

No syntax changes needed!

## Common PostgreSQL/Neon SQL Commands

If you need to write custom queries later:

```sql
-- Create table
CREATE TABLE table_name (column_name TYPE);

-- Insert data
INSERT INTO table_name (column1, column2) VALUES (value1, value2);

-- Select data
SELECT * FROM table_name WHERE condition;

-- Update data
UPDATE table_name SET column = value WHERE condition;

-- Delete data
DELETE FROM table_name WHERE condition;
```

All standard PostgreSQL syntax works in Neon!
