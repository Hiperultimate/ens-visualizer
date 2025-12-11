#!/usr/bin/env node
/**
 * Parse and analyze the connection string
 */

const connectionString = 'postgresql://postgres:h^lvPR^S3I*n@H@db.qerncsrkentjwbtodfeh.supabase.co:5432/postgres'

console.log('🔍 Analyzing connection string...\n')
console.log('Original:', connectionString)
console.log('')

// Try to parse it
try {
  const url = new URL(connectionString)
  console.log('Parsed components:')
  console.log('  Protocol:', url.protocol)
  console.log('  Username:', url.username)
  console.log('  Password:', url.password ? '***' : '(none)')
  console.log('  Hostname:', url.hostname)
  console.log('  Port:', url.port)
  console.log('  Pathname:', url.pathname)
  console.log('')
  
  // Show the actual password (for debugging)
  console.log('Actual password:', url.password)
  console.log('Actual hostname:', url.hostname)
  console.log('')
  
  // Check if hostname looks valid
  if (url.hostname.includes('@')) {
    console.log('⚠️  WARNING: Hostname contains "@" character!')
    console.log('   This suggests the password parsing is incorrect.')
    console.log('   The password might need URL encoding.')
  }
  
  // Show what the password should be if we URL-encode special chars
  const specialChars = {
    '^': '%5E',
    '*': '%2A',
    '@': '%40',
    '#': '%23',
    '$': '%24',
    '%': '%25',
    '&': '%26',
    '+': '%2B',
    '=': '%3D',
    '/': '%2F',
    '?': '%3F',
  }
  
  let encoded = url.password
  for (const [char, encodedChar] of Object.entries(specialChars)) {
    encoded = encoded.replace(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), encodedChar)
  }
  
  console.log('\n💡 URL-encoded password would be:', encoded)
  console.log('\n📝 Corrected connection string:')
  console.log(`postgresql://postgres:${encoded}@${url.hostname}:${url.port}${url.pathname}`)
  
} catch (error) {
  console.error('Error parsing URL:', error.message)
  
  // Manual parsing attempt
  console.log('\n🔧 Manual parsing attempt:')
  const match = connectionString.match(/^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/)
  if (match) {
    console.log('  Username:', match[1])
    console.log('  Password:', match[2])
    console.log('  Host:', match[3])
    console.log('  Port:', match[4])
    console.log('  Database:', match[5])
  } else {
    console.log('  Could not parse connection string')
  }
}
