import './load-env';
import { prisma } from '../lib/db';
import { getAnalystBot } from '../lib/openclaw/analyst-bot';

async function testAnalystBot() {
  console.log('🚀 Starting Analyst Bot Test...');

  try {
    const analystBot = getAnalystBot();
    
    // 1. Check if we have enough intents
    const intentCount = await prisma.intent.count({
      where: { status: 'active', category: 'real_estate' }
    });
    console.log(`📊 Current Active Intents: ${intentCount}`);

    if (intentCount < 5) {
      console.warn('⚠️ Under 5 intents found. The bot might skip report generation.');
    }

    // 2. Trigger manual daily report
    console.log('📝 Triggering generateDailyReport()...');
    const result = await analystBot.generateDailyReport();
    
    console.log('📋 Test Result:', JSON.stringify(result, null, 2));

    if (result.success && result.reportId) {
      console.log('✅ Success! Fetching generated report from DB...');
      const report = await prisma.marketReport.findUnique({
        where: { id: result.reportId }
      });
      
      if (report) {
        console.log('\n--- GENERATED REPORT ---');
        console.log(`Title: ${report.title}`);
        console.log(`Region: ${report.region || 'All'}`);
        console.log(`Period: ${report.period}`);
        console.log('\nContent:');
        console.log(report.content);
        console.log('\nStats (JSON):');
        console.log(JSON.stringify(report.stats, null, 2));
        console.log('------------------------\n');
      }
    } else if (result.skipped) {
      console.log('ℹ️ Bot skipped report generation (likely not enough data or already run today).');
    } else {
      console.error('❌ Bot execution failed:', result.error);
    }

  } catch (error) {
    console.error('💥 Fatal error during test:', error);
  } finally {
    process.exit(0);
  }
}

testAnalystBot();
