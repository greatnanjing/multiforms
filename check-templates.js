const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkTemplates() {
  const { data, error, count } = await supabase
    .from('templates')
    .select('*', { count: 'exact', head: false })
  
  console.log('Templates count:', count)
  console.log('Templates:', JSON.stringify(data, null, 2))
}

checkTemplates().catch(console.error)
