// ═══════════════════════════════════════════════════════════════
// YOUTUBE CRAWLER
// ═══════════════════════════════════════════════════════════════

import { SourceConfig, YouTubeConfig } from './source-registry'
import { checkRateLimit } from './rate-limiter'
import { normalizeYouTube, NormalizedContent, RawYouTubeVideo } from './content-normalizer'

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3'

export async function crawlYouTubeSource(source: SourceConfig): Promise<NormalizedContent[]> {
  if (source.config.type !== 'youtube') {
    throw new Error('Invalid source config for YouTube crawler')
  }

  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    console.warn('YOUTUBE_API_KEY not set, skipping YouTube crawl')
    return []
  }

  const rateCheck = checkRateLimit(source.id, source.rateLimit)
  if (!rateCheck.allowed) {
    console.log(`Rate limited: ${source.id}, retry after ${rateCheck.retryAfter}s`)
    return []
  }

  const config = source.config as YouTubeConfig

  try {
    let videoIds: string[] = []

    switch (config.mode) {
      case 'channel':
        videoIds = await getChannelVideos(config.target, apiKey, config.maxAgeDays)
        break

      case 'search':
        videoIds = await searchVideos(config.target, apiKey)
        break

      case 'trending':
        videoIds = await getTrendingVideos(config.target, apiKey)
        break

      case 'playlist':
        videoIds = await getPlaylistVideos(config.target, apiKey)
        break

      default:
        console.warn(`Unsupported YouTube mode: ${config.mode}`)
        return []
    }

    if (videoIds.length === 0) {
      return []
    }

    const videos = await getVideoDetails(videoIds, apiKey)

    const results: NormalizedContent[] = []

    for (const video of videos) {
      if (config.minViews && video.statistics) {
        if (parseInt(video.statistics.viewCount) < config.minViews) {
          continue
        }
      }

      results.push(normalizeYouTube(
        video,
        source.id,
        source.name,
        source.category,
        source.credibilityScore
      ))
    }

    return results

  } catch (error) {
    console.error(`YouTube crawl error for ${source.id}:`, error)
    return []
  }
}

async function getChannelVideos(
  channelId: string,
  apiKey: string,
  maxAgeDays?: number
): Promise<string[]> {
  const params = new URLSearchParams({
    part: 'snippet',
    channelId,
    maxResults: '10',
    order: 'date',
    type: 'video',
    key: apiKey,
  })

  if (maxAgeDays) {
    const publishedAfter = new Date()
    publishedAfter.setDate(publishedAfter.getDate() - maxAgeDays)
    params.set('publishedAfter', publishedAfter.toISOString())
  }

  const response = await fetch(`${YOUTUBE_API_BASE}/search?${params.toString()}`)
  if (!response.ok) return []

  const data = await response.json()
  return data.items?.map((item: any) => item.id.videoId).filter(Boolean) || []
}

async function searchVideos(query: string, apiKey: string): Promise<string[]> {
  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    maxResults: '10',
    order: 'relevance',
    type: 'video',
    key: apiKey,
  })

  const response = await fetch(`${YOUTUBE_API_BASE}/search?${params.toString()}`)
  if (!response.ok) return []

  const data = await response.json()
  return data.items?.map((item: any) => item.id.videoId).filter(Boolean) || []
}

async function getTrendingVideos(regionCode: string, apiKey: string): Promise<string[]> {
  const params = new URLSearchParams({
    part: 'snippet',
    chart: 'mostPopular',
    regionCode,
    maxResults: '10',
    videoCategoryId: '28', // Science & Technology
    key: apiKey,
  })

  const response = await fetch(`${YOUTUBE_API_BASE}/videos?${params.toString()}`)
  if (!response.ok) return []

  const data = await response.json()
  return data.items?.map((item: any) => item.id).filter(Boolean) || []
}

async function getPlaylistVideos(playlistId: string, apiKey: string): Promise<string[]> {
  const params = new URLSearchParams({
    part: 'snippet',
    playlistId,
    maxResults: '10',
    key: apiKey,
  })

  const response = await fetch(`${YOUTUBE_API_BASE}/playlistItems?${params.toString()}`)
  if (!response.ok) return []

  const data = await response.json()
  return data.items?.map((item: any) => item.snippet?.resourceId?.videoId).filter(Boolean) || []
}

async function getVideoDetails(videoIds: string[], apiKey: string): Promise<RawYouTubeVideo[]> {
  const params = new URLSearchParams({
    part: 'snippet,statistics,contentDetails',
    id: videoIds.join(','),
    key: apiKey,
  })

  const response = await fetch(`${YOUTUBE_API_BASE}/videos?${params.toString()}`)
  if (!response.ok) return []

  const data = await response.json()

  return data.items?.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
    channelId: item.snippet.channelId,
    channelTitle: item.snippet.channelTitle,
    thumbnails: item.snippet.thumbnails,
    statistics: item.statistics,
    contentDetails: item.contentDetails,
  })) || []
}
