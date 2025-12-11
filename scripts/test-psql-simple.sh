#!/bin/bash
# Simple psql connection test

CONNECTION_STRING="postgresql://postgres:h4lvPR3S3I1n2H@db.qerncsrkentjwbtodfeh.supabase.co:5432/postgres"

echo "🔍 Testing connection with psql..."
echo "📡 Connection string: postgresql://postgres:***@db.qerncsrkentjwbtodfeh.supabase.co:5432/postgres"
echo ""

# Test 1: Basic connection test
echo "🔄 Test 1: Basic connection..."
psql "${CONNECTION_STRING}" -c "SELECT 'Connection successful!' as status, NOW() as time;" 2>&1

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅✅✅ CONNECTION WORKS! ✅✅✅"
    echo ""
    echo "🔄 Checking tables..."
    psql "${CONNECTION_STRING}" -c "\dt" 2>&1 | grep -E "(users|nodes|connections)" || echo "Tables check completed"
    echo ""
    echo "📝 Use this in your .env file:"
    echo "DATABASE_URL=${CONNECTION_STRING}"
else
    echo ""
    echo "❌ Connection failed (exit code: $EXIT_CODE)"
    echo ""
    echo "💡 Common issues:"
    echo "   1. Supabase project is paused - check dashboard"
    echo "   2. Hostname is incorrect - verify in Supabase settings"
    echo "   3. Password is incorrect - double-check in Supabase"
    echo "   4. Network/firewall blocking connection"
fi

exit $EXIT_CODE
