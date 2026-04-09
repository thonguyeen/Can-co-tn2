// BATCH SCRIPT: Crawl RSS → AI Parse → Inject to Feed
// Usage: node --env-file=.env.local scripts/batch-crawl-inject.js

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('🕷️  BƯỚC 1/2: CÀO TIN TỪ RSS...');
  console.log('═══════════════════════════════════════════════════\n');

  // Step 1: Trigger crawl (legacy sources — all RSS)
  const crawlRes = await fetch('http://localhost:3000/api/crawl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}), // empty = crawl all sources
  });
  const crawlResult = await crawlRes.json();

  if (!crawlResult.success) {
    console.error('❌ Crawl thất bại:', crawlResult.error);
    return;
  }

  const s = crawlResult.summary;
  console.log(`✅ Crawl xong!`);
  console.log(`   📡 Sources: ${s.total_sources} (${s.successful} OK, ${s.failed} lỗi)`);
  console.log(`   📰 Tìm thấy: ${s.total_articles_found} bài`);
  console.log(`   🆕 Tin mới: ${s.total_articles_new} bài`);
  console.log(`   ⏱️  Thời gian: ${(s.total_duration_ms / 1000).toFixed(1)}s\n`);

  if (crawlResult.results) {
    for (const r of crawlResult.results) {
      const icon = r.status === 'success' ? '✅' : '❌';
      console.log(`   ${icon} ${r.source_name}: ${r.articles_new} mới / ${r.articles_found} tổng${r.error ? ' — ' + r.error : ''}`);
    }
  }

  if (s.total_articles_new === 0) {
    console.log('\n⚠️  Không có tin mới. Dừng lại.');
    return;
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('🤖  BƯỚC 2/2: AI PHÂN TÍCH & BƠM LÊN FEED...');
  console.log('═══════════════════════════════════════════════════\n');

  // Step 2: Inject unprocessed news into intents (batch)
  const injectRes = await fetch('http://localhost:3000/api/intents/crawled-inject', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batch_limit: 5 }), // Process 5 at a time
  });
  const injectResult = await injectRes.json();

  if (!injectResult.success) {
    console.error('❌ Inject thất bại:', injectResult.error);
    return;
  }

  console.log(`✅ AI xử lý xong! Đã tạo ${injectResult.generated} bài trên Feed.\n`);

  if (injectResult.results) {
    for (const r of injectResult.results) {
      if (r.intentId) {
        console.log(`   ✅ raw_news ${r.rawNewsId.substring(0, 8)}... → Intent ${r.intentId.substring(0, 8)}...`);
      } else {
        console.log(`   ❌ raw_news ${r.rawNewsId.substring(0, 8)}... — ${r.error}`);
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('🎉  HOÀN TẤT! Mở http://localhost:3000/demo để xem!');
  console.log('═══════════════════════════════════════════════════');
}

main().catch(console.error);
