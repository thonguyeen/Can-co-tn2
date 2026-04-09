import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Parse .env.local file
const envFile = readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function updateAvatars() {
  // Map of bot handles to their avatar URLs
  const avatarMap = {
    'minh_ai': '/avatars/minh_ai.svg',
    'hung_crypto': '/avatars/hung_crypto.svg',
    'mai_finance': '/avatars/mai_finance.svg',
    'lan_startup': '/avatars/lan_startup.svg',
    'duc_security': '/avatars/duc_security.svg',
    'nam_gadget': '/avatars/nam_gadget.svg',
    'tuan_esports': '/avatars/tuan_esports.svg',
    'linh_lifestyle': '/avatars/linh_lifestyle.svg',
    'an_politics': '/avatars/an_politics.svg',
  };

  // Keyword-based avatar assignment
  const keywordAvatars = {
    'tech': '/avatars/bot_tech.svg',
    'ai': '/avatars/minh_ai.svg',
    'crypto': '/avatars/bot_crypto.svg',
    'bitcoin': '/avatars/bot_crypto.svg',
    'finance': '/avatars/bot_finance.svg',
    'money': '/avatars/bot_finance.svg',
    'startup': '/avatars/bot_startup.svg',
    'business': '/avatars/bot_startup.svg',
    'security': '/avatars/bot_security.svg',
    'gaming': '/avatars/bot_gaming.svg',
    'game': '/avatars/bot_gaming.svg',
    'esport': '/avatars/bot_gaming.svg',
    'lifestyle': '/avatars/bot_lifestyle.svg',
    'life': '/avatars/bot_lifestyle.svg',
    'news': '/avatars/bot_news.svg',
    'politics': '/avatars/bot_politics.svg',
    'political': '/avatars/an_politics.svg',
  };

  console.log('Updating avatars...');

  // Update specific bots by handle
  for (const [handle, avatarUrl] of Object.entries(avatarMap)) {
    const { error } = await supabase
      .from('bots')
      .update({ avatar_url: avatarUrl })
      .eq('handle', handle);

    if (error) {
      console.log(`Failed: ${handle} - ${error.message}`);
    } else {
      console.log(`Updated: ${handle} -> ${avatarUrl}`);
    }
  }

  // Get all bots and assign avatars based on keywords
  const { data: allBots, error: fetchError } = await supabase
    .from('bots')
    .select('id, handle, name, avatar_url');

  if (fetchError) {
    console.error('Error fetching bots:', fetchError);
    return;
  }

  console.log(`Found ${allBots?.length || 0} bots total`);

  if (allBots) {
    for (const bot of allBots) {
      // Skip if already has a working svg avatar
      if (bot.avatar_url && bot.avatar_url.includes('.svg')) continue;

      const handleLower = (bot.handle || '').toLowerCase();
      const nameLower = (bot.name || '').toLowerCase();

      let matchedAvatar = '/avatars/bot_tech.svg'; // default

      for (const [keyword, avatar] of Object.entries(keywordAvatars)) {
        if (handleLower.includes(keyword) || nameLower.includes(keyword)) {
          matchedAvatar = avatar;
          break;
        }
      }

      const { error } = await supabase
        .from('bots')
        .update({ avatar_url: matchedAvatar })
        .eq('id', bot.id);

      if (!error) {
        console.log(`Auto-assigned: ${bot.handle} -> ${matchedAvatar}`);
      }
    }
  }

  console.log('Done!');
}

updateAvatars();
