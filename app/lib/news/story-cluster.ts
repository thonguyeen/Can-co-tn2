// ═══════════════════════════════════════════════════════════════
// STORY CLUSTERING
// Groups related posts/news into story clusters
// ═══════════════════════════════════════════════════════════════

export interface StoryCluster {
  id: string
  title: string
  category: string
  posts: ClusterPost[]
  createdAt: string
  updatedAt: string
  postCount: number
  urgencyLevel: string
  isBreaking: boolean
}

export interface ClusterPost {
  id: string
  content: string
  botId: string
  botHandle?: string
  createdAt: string
  similarity: number
}

interface PostForClustering {
  id: string
  content: string
  bot_id: string
  created_at: string
  bot_handle?: string
}

// ═══════════════════════════════════════════════════════════════
// KEYWORD EXTRACTION
// ═══════════════════════════════════════════════════════════════

const STOP_WORDS = new Set([
  'và', 'của', 'cho', 'với', 'trong', 'là', 'có', 'được', 'này', 'đó',
  'một', 'các', 'những', 'nhưng', 'hay', 'hoặc', 'nếu', 'thì', 'đã',
  'sẽ', 'đang', 'rất', 'cũng', 'từ', 'theo', 'về', 'như', 'khi', 'để',
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'but', 'and', 'or',
  'not', 'no', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'than', 'too', 'very', 'that', 'this', 'it',
])

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
}

// ═══════════════════════════════════════════════════════════════
// SIMILARITY CALCULATION
// ═══════════════════════════════════════════════════════════════

function calculateSimilarity(text1: string, text2: string): number {
  const keywords1 = new Set(extractKeywords(text1))
  const keywords2 = new Set(extractKeywords(text2))

  if (keywords1.size === 0 || keywords2.size === 0) return 0

  let intersection = 0
  for (const word of keywords1) {
    if (keywords2.has(word)) intersection++
  }

  // Jaccard similarity
  const union = keywords1.size + keywords2.size - intersection
  return union > 0 ? intersection / union : 0
}

// ═══════════════════════════════════════════════════════════════
// CLUSTERING ALGORITHM
// ═══════════════════════════════════════════════════════════════

const SIMILARITY_THRESHOLD = 0.25 // Minimum similarity to cluster together
const MAX_CLUSTER_AGE_HOURS = 24 // Max age difference between posts in a cluster

/**
 * Cluster posts into related story groups
 */
export function clusterPosts(posts: PostForClustering[]): StoryCluster[] {
  if (posts.length === 0) return []

  const clusters: StoryCluster[] = []
  const assigned = new Set<string>()

  // Sort by date (newest first)
  const sorted = [...posts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  for (const post of sorted) {
    if (assigned.has(post.id)) continue

    // Try to find an existing cluster for this post
    let bestCluster: StoryCluster | null = null
    let bestSimilarity = 0

    for (const cluster of clusters) {
      // Check time constraint
      const clusterAge = Math.abs(
        new Date(post.created_at).getTime() - new Date(cluster.createdAt).getTime()
      )
      if (clusterAge > MAX_CLUSTER_AGE_HOURS * 60 * 60 * 1000) continue

      // Calculate similarity with cluster representative (first post)
      const similarity = calculateSimilarity(post.content, cluster.posts[0].content)

      if (similarity > bestSimilarity && similarity >= SIMILARITY_THRESHOLD) {
        bestSimilarity = similarity
        bestCluster = cluster
      }
    }

    if (bestCluster) {
      // Add to existing cluster
      bestCluster.posts.push({
        id: post.id,
        content: post.content,
        botId: post.bot_id,
        botHandle: post.bot_handle,
        createdAt: post.created_at,
        similarity: bestSimilarity,
      })
      bestCluster.postCount++
      bestCluster.updatedAt = post.created_at
      assigned.add(post.id)
    } else {
      // Create new cluster
      const cluster: StoryCluster = {
        id: `cluster-${post.id}`,
        title: extractTitle(post.content),
        category: 'general',
        posts: [{
          id: post.id,
          content: post.content,
          botId: post.bot_id,
          botHandle: post.bot_handle,
          createdAt: post.created_at,
          similarity: 1,
        }],
        createdAt: post.created_at,
        updatedAt: post.created_at,
        postCount: 1,
        urgencyLevel: 'low',
        isBreaking: false,
      }
      clusters.push(cluster)
      assigned.add(post.id)
    }
  }

  return clusters.filter(c => c.postCount > 0)
}

/**
 * Extract a short title from post content
 */
function extractTitle(content: string): string {
  // Get first line, strip emojis and special chars
  const firstLine = content.split('\n')[0]
    .replace(/[🚀💰📱⚠️🦄🎮🧠✅❌📸🎉🇻🇳🤖]/g, '')
    .trim()

  if (firstLine.length <= 60) return firstLine
  return firstLine.substring(0, 57) + '...'
}

/**
 * Find which cluster a new post belongs to
 */
export function findClusterForPost(
  post: PostForClustering,
  existingClusters: StoryCluster[]
): { cluster: StoryCluster; similarity: number } | null {
  let bestCluster: StoryCluster | null = null
  let bestSimilarity = 0

  for (const cluster of existingClusters) {
    const clusterAge = Math.abs(
      new Date(post.created_at).getTime() - new Date(cluster.createdAt).getTime()
    )
    if (clusterAge > MAX_CLUSTER_AGE_HOURS * 60 * 60 * 1000) continue

    const similarity = calculateSimilarity(post.content, cluster.posts[0].content)

    if (similarity > bestSimilarity && similarity >= SIMILARITY_THRESHOLD) {
      bestSimilarity = similarity
      bestCluster = cluster
    }
  }

  if (bestCluster) {
    return { cluster: bestCluster, similarity: bestSimilarity }
  }
  return null
}
