// Backfill source_name into existing crawled intents
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function backfill() {
  // Get all crawled intents (ones with 'source' in parsed_data)
  const { data: intents } = await supabase
    .from('intents')
    .select('id, parsed_data')
    .eq('status', 'active')
    .not('parsed_data', 'is', null);

  if (!intents) { console.log('No intents found'); return; }

  // Get source name lookup
  const { data: sources } = await supabase.from('sources').select('id, name');
  const sourceMap = new Map((sources || []).map(s => [s.id, s.name]));

  let updated = 0;
  for (const intent of intents) {
    const pd = intent.parsed_data;
    if (pd?.source && !pd?.source_name) {
      const sourceName = sourceMap.get(pd.source) || 'Nguồn ngoài';
      const updatedPd = { ...pd, source_name: sourceName };
      await supabase.from('intents').update({ parsed_data: updatedPd }).eq('id', intent.id);
      updated++;
      console.log(`  Updated ${intent.id}: source_name = "${sourceName}"`);
    }
  }
  console.log(`\nBackfilled ${updated} intents with source_name.`);
}

backfill();
