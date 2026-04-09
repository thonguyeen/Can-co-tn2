import * as cheerio from 'cheerio'
import { createHash } from 'crypto'
import type { RawArticle, NewsSource } from './types'

export async function scrapeWebPage(source: NewsSource): Promise<RawArticle[]> {
  const response = await fetch(source.url, {
    headers: {
      'User-Agent': 'Facebot News Crawler/1.0',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.url}: ${response.status}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)
  const articles: RawArticle[] = []

  // Generic article selectors - customize per source if needed
  const articleSelectors = [
    'article',
    '[class*="post"]',
    '[class*="article"]',
    '[class*="news-item"]',
    '.entry',
  ]

  for (const selector of articleSelectors) {
    $(selector).each((_, element) => {
      const $el = $(element)

      // Find title and link
      const $link = $el.find('a[href]').first()
      const title =
        $el.find('h1, h2, h3').first().text().trim() || $link.text().trim()
      const url = $link.attr('href')

      if (!title || !url) return

      // Resolve relative URLs
      const fullUrl = url.startsWith('http')
        ? url
        : new URL(url, source.url).toString()

      // Skip if already have this URL
      if (articles.some((a) => a.original_url === fullUrl)) return

      const snippet = $el.find('p').first().text().trim() || null

      const contentHash = createHash('md5')
        .update(fullUrl + title)
        .digest('hex')

      articles.push({
        source_id: source.id,
        title: title,
        content: snippet,
        summary: snippet?.substring(0, 300) || null,
        original_url: fullUrl,
        image_url: $el.find('img').first().attr('src') || null,
        author: null,
        published_at: null,
        content_hash: contentHash,
        crawl_metadata: {},
      })
    })

    // Stop if we found articles
    if (articles.length > 0) break
  }

  return articles.slice(0, 20) // Limit to 20 articles per crawl
}
