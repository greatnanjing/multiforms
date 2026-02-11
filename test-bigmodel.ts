// Test BigModel API directly
// Run with: deno run --allow-net --allow-env test-bigmodel.ts

const BIGMODEL_API_KEY = Deno.env.get('BIGMODEL_API_KEY') || ''

if (!BIGMODEL_API_KEY) {
  console.error('BIGMODEL_API_KEY not set')
  Deno.exit(1)
}

// Generate JWT token
const parts = BIGMODEL_API_KEY.split('.')
if (parts.length !== 2) {
  console.error('Invalid API key format (should be id.secret)')
  Deno.exit(1)
}

const [id, secret] = parts

const now = Date.now()
const payload = {
  api_key: id,
  exp: now + 3600000,
  timestamp: now,
}

const header = {
  alg: 'HS256',
  sign_type: 'SIGN',
}

function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

const encodedHeader = base64UrlEncode(JSON.stringify(header))
const encodedPayload = base64UrlEncode(JSON.stringify(payload))
const dataToSign = `${encodedHeader}.${encodedPayload}`

const encoder = new TextEncoder()
const keyData = encoder.encode(secret)
const messageData = encoder.encode(dataToSign)

const cryptoKey = await crypto.subtle.importKey(
  'raw',
  keyData,
  { name: 'HMAC', hash: 'SHA-256' },
  false,
  ['sign']
)

const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
const signatureArray = Array.from(new Uint8Array(signature))
const signatureString = btoa(String.fromCharCode(...signatureArray))
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=/g, '')

const token = `${dataToSign}.${signatureString}`

// Call BigModel API
console.log('Testing BigModel API...')
console.log('Token generated:', token.substring(0, 50) + '...')

const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    model: 'glm-4-flash',
    messages: [{
      role: 'user',
      content: '请用不超过20字总结：今天天气很好，我很开心。'
    }],
    max_tokens: 100,
  }),
})

console.log('Response status:', response.status)

if (!response.ok) {
  const error = await response.text()
  console.error('Error:', error)
  Deno.exit(1)
}

const result = await response.json()
console.log('Success!', result.choices?.[0]?.message?.content)
