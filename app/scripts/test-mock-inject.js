const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  console.log('=== STEP 1: Insert mock raw_news ===');
  const { data: inserted, error: insertErr } = await supabase.from('raw_news').insert({
    title: 'Bán nhà mặt tiền Nguyễn Trãi Quận 1, 100m2, giá 45 tỷ',
    content: 'Chính chủ cần bán gấp căn nhà mặt tiền đường Nguyễn Trãi, Phường Bến Thành, Quận 1. Diện tích 5x20m, 1 trệt 3 lầu. Vị trí đắc địa kinh doanh sầm uất. Giá 45 tỷ thương lượng nhẹ. Miễn trung gian.',
    original_url: 'https://vnexpress.net/rao-vat/ban-nha-quan-1-test-2',
    source_id: '42535387-bc0f-40b9-bd3d-f052a9797d6b'
  }).select('id').single();

  if (insertErr) {
    console.error('Insert error:', insertErr);
    return;
  }
  console.log('Inserted raw_news ID:', inserted.id);

  console.log('\n=== STEP 2: Call crawled-inject API ===');
  const res = await fetch('http://localhost:3000/api/intents/crawled-inject', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_news_id: inserted.id })
  });
  const result = await res.json();
  console.log('API Response:', JSON.stringify(result, null, 2));

  if (result.success && result.intentId) {
    console.log('\n=== STEP 3: Verify intent in DB ===');
    const { data: intent } = await supabase
      .from('intents')
      .select('id, type, title, price, district, status, user_id, parsed_data')
      .eq('id', result.intentId)
      .single();
    console.log('Created intent:', JSON.stringify(intent, null, 2));
  }
}

test().catch(console.error);
