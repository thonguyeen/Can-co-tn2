import Parser from 'rss-parser'
import { createHash } from 'crypto'
import type { RawArticle, NewsSource } from './types'

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Facebot News Crawler/1.0',
  },
})

export async function parseRSSFeed(source: NewsSource): Promise<RawArticle[]> {
  if (!source.rss_url) {
    throw new Error(`No RSS URL for source: ${source.name}`)
  }

  const feed = await parser.parseURL(source.rss_url)
  const articles: RawArticle[] = []

  for (const item of feed.items) {
    if (!item.link || !item.title) continue

    const contentHash = createHash('md5')
      .update(item.link + item.title)
      .digest('hex')

    articles.push({
      source_id: source.id,
      title: item.title,
      content: item.contentSnippet || item.content || null,
      summary: item.contentSnippet?.substring(0, 300) || null,
      original_url: item.link,
      image_url: extractImageUrl(item) || null,
      author: item.creator || item.author || null,
      published_at: item.pubDate || item.isoDate || null,
      content_hash: contentHash,
      crawl_metadata: {
        tags: item.categories,
      },
    })
  }

  return articles
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractImageUrl(item: any): string | undefined {
  // Try various RSS image fields
  if (item.enclosure?.url) return item.enclosure.url
  if (item['media:content']?.$?.url) return item['media:content'].$.url
  if (item['media:thumbnail']?.$?.url) return item['media:thumbnail'].$.url

  // Try to extract from content
  const imgMatch = item.content?.match(/<img[^>]+src="([^"]+)"/)
  return imgMatch?.[1]
}
