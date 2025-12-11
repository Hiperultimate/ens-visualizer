#!/bin/bash
# Test database connection using psql

set -e

echo "🔍 Testing database connection with psql...\n"

# Connection details
PASSWORD="h4lvPR3S3I1n2H"
HOSTNAME="db.qerncsrkentjwbtodfeh.supabase.co"
PORT="5432"
DATABASE="postgres"
USER="postgres"

CONNECTION_STRING="postgresql://${USER}:${PASSWORD}@${HOSTNAME}:${PORT}/${DATABASE}"

echo "📝 Connection details:"
echo "   Hostname: ${HOSTNAME}"
echo "   Port: ${PORT}"
echo "   Database: ${DATABASE}"
echo "   User: ${USER}"
echo ""

# First, try to resolve the hostname
echo "🔄 Step 1: Testing DNS resolution..."
if nslookup "${HOSTNAME}" > /dev/null 2>&1; then
    echo "✅ DNS resolution successful"
    nslookup "${HOSTNAME}" | grep -A 2 "Name:"
else
    echo "❌ DNS resolution failed"
    echo "   The hostname cannot be resolved"
    echo ""
    echo "💡 This usually means:"
    echo "   - Supabase project is paused"
    echo "   - Hostname is incorrect"
    echo "   - Network/DNS issues"
    exit 1
fi

echo ""
echo "🔄 Step 2: Testing connection with psql..."

# Test connection with a simple query
if psql "${CONNECTION_STRING}" -c "SELECT NOW() as current_time, version() as pg_version;" 2>&1; then
    echo ""
    echo "✅✅✅ CONNECTION SUCCESSFUL! ✅✅✅"
    
    echo ""
    echo "🔄 Step 3: Checking database tables..."
    psql "${CONNECTION_STRING}" -c "
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'nodes', 'connections')
        ORDER BY table_name;
    " 2>&1
    
    echo ""
    echo "📝 Connection string for .env file:"
    echo "DATABASE_URL=${CONNECTION_STRING}"
else
    echo ""
    echo "❌ Connection failed"
    exit 1
fi
