# Database Setup Guide

This guide explains how to set up the PostgreSQL database for the ENS Network Graph feature.

## Prerequisites

- PostgreSQL database (local or hosted on Supabase)
- Database connection string

## Setup Steps

### 1. Create Database

If using Supabase:
1. Go to your Supabase project dashboard
2. Navigate to Settings > Database
3. Copy the connection string (it will look like: `postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres`)

If using local PostgreSQL:
1. Create a new database:
   ```sql
   CREATE DATABASE ens_network;
   ```

### 2. Set Environment Variable

Add the connection string to your `.env` file:

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

For Supabase, the format is:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

### 3. Run Schema Migration

Execute the SQL schema file to create the necessary tables:

**Option 1: Using psql command line**
```bash
psql $DATABASE_URL -f database/schema.sql
```

**Option 2: Using Supabase SQL Editor**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `database/schema.sql`
4. Paste and execute

**Option 3: Using a database client**
- Use pgAdmin, DBeaver, or any PostgreSQL client
- Connect to your database
- Execute the SQL from `database/schema.sql`

### 4. Verify Tables

After running the schema, verify that the tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'nodes', 'connections');
```

You should see all three tables listed.

## Database Schema

The database consists of three main tables:

1. **users**: Stores unique user identifiers (UUIDs)
2. **nodes**: Stores ENS domain nodes in the network graph
3. **connections**: Stores edges/connections between nodes

See `database/schema.sql` for the complete schema definition.

## Troubleshooting

### Connection Issues

If you're having connection issues:

1. **Check your connection string format**: It should be `postgresql://user:password@host:port/database`
2. **For Supabase**: Make sure to URL-encode special characters in your password
3. **SSL**: Supabase requires SSL connections. The code handles this automatically.

### Schema Errors

If you get errors when running the schema:

1. Make sure you have the necessary permissions (CREATE TABLE, CREATE INDEX, etc.)
2. Check if tables already exist - the schema uses `CREATE TABLE IF NOT EXISTS` so it's safe to run multiple times
3. Ensure you're connected to the correct database

## Security Notes

- Never commit your `.env` file with the actual database credentials
- Use environment variables for all sensitive information
- For production, use connection pooling and proper access controls
- Consider using Supabase's built-in security features (Row Level Security) for multi-tenant scenarios
