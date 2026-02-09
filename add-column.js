const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load .env.local manually
let supabaseUrl, supabaseKey;
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line.startsWith('#') || line === '') return;
    const eqIndex = line.indexOf('=');
    if (eqIndex > 0) {
      const k = line.substring(0, eqIndex).trim();
      const v = line.substring(eqIndex + 1).trim();
      if (k === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = v;
      if (k === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') supabaseKey = v;
    }
  });
} catch (err) {
  console.error('Error loading .env.local:', err.message);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Check if questions column exists first
async function checkAndAddColumn() {
  try {
    // Try to fetch one template with questions column
    const { data, error } = await supabase
      .from('templates')
      .select('id, questions')
      .limit(1);

    if (error && error.message.includes('questions')) {
      console.log('Column does not exist, need to add it via SQL editor');
      console.log('Please run this SQL in Supabase SQL Editor:');
      console.log('ALTER TABLE public.templates ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT \'[]\'::jsonb;');
      return false;
    }

    console.log('Column exists! Now inserting templates...');
    return true;
  } catch (err) {
    console.error('Error:', err.message);
    return false;
  }
}

checkAndAddColumn().then(hasColumn => {
  if (hasColumn) {
    console.log('Ready to insert templates!');
  }
});
