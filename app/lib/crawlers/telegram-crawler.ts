// ═══════════════════════════════════════════════════════════════
// TELEGRAM CRAWLER
// ═══════════════════════════════════════════════════════════════

import { SourceConfig, TelegramConfig } from './source-registry'
import { checkRateLimit } from './rate-limiter'
import { normalizeTelegram, NormalizedContent, RawTelegramMessage } from './content-normalizer'
import * as cheerio from 'cheerio'

export async function crawlTelegramSource(source: SourceConfig): Promise<NormalizedContent[]> {
  if (source.config.type !== 'telegram') {
    throw new Error('Invalid source config for Telegram crawler')
  }

  const rateCheck = checkRateLimit(source.id, source.rateLimit)
  if (!rateCheck.allowed) {
    console.log(`Rate limited: ${source.id}, retry after ${rateCheck.retryAfter}s`)
    return []
  }

  const config = source.config as TelegramConfig

  try {
    // Use web preview to scrape public channel messages
    const url = `https://t.me/s/${config.channelUsername}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Facebot/1.0)',
      },
    })

    if (!response.ok) {
      console.error(`Telegram fetch error: ${response.status}`)
      return []
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const messages: RawTelegramMessage[] = []
    const channelTitle = $('.tgme_channel_info_header_title').text().trim() || config.channelUsername

    $('.tgme_widget_message').each((_, element) => {
      const $msg = $(element)

      const messageId = $msg.attr('data-post')?.split('/')[1]
      if (!messageId) return

      const text = $msg.find('.tgme_widget_message_text').text().trim()
      if (!text) return

      const dateStr = $msg.find('.tgme_widget_message_date time').attr('datetime')
      const date = dateStr ? new Date(dateStr).getTime() / 1000 : Date.now() / 1000

      const viewsText = $msg.find('.tgme_widget_message_views').text().trim()
      const views = parseViews(viewsText)

      // Apply min views filter
      if (config.minViews && views < config.minViews) {
        return
      }

      messages.push({
        id: parseInt(messageId),
        date,
        text,
        views,
        channel: {
          username: config.channelUsername,
          title: channelTitle,
        },
      })
    })

    return messages.map(msg => normalizeTelegram(
      msg,
      source.id,
      source.name,
      source.category,
      source.credibilityScore
    ))

  } catch (error) {
    console.error(`Telegram crawl error for ${source.id}:`, error)
    return []
  }
}

function parseViews(viewsText: string): number {
  if (!viewsText) return 0

  const normalized = viewsText.toLowerCase().replace(/[,\s]/g, '')

  if (normalized.endsWith('k')) {
    return parseFloat(normalized) * 1000
  }
  if (normalized.endsWith('m')) {
    return parseFloat(normalized) * 1000000
  }

  return parseInt(normalized) || 0
}
