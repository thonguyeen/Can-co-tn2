
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const { data } = await supabase.from('raw_news').select('id').limit(1);
  if (data && data.length > 0) {
    const ids = data.map(d => d.id);
    await supabase.from('raw_news').update({ is_processed: false }).in('id', ids);
    console.log('Reset ' + ids.length + ' tin!');
    
    // Now trigger the inject API
    const res = await fetch('http://localhost:3000/api/intents/crawled-inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batch_limit: 1 })
    });
    const result = await res.json();
    console.log("Crawl-to-Inject Result:", JSON.stringify(result, null, 2));
  } else {
    console.log('No news in DB');
  }
}
test();
