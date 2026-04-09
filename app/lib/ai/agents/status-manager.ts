import { prisma } from '@/lib/db'

type VerificationStatus = 'unverified' | 'partial' | 'verified' | 'debunked'

interface StatusUpdate {
  postId: string
  oldStatus: VerificationStatus
  newStatus: VerificationStatus
  note: string
}

export async function updatePostStatus(
  postId: string,
  newStatus: VerificationStatus,
  note: string
): Promise<StatusUpdate | null> {
  // Get current status
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { verificationStatus: true }
  })

  if (!post) return null

  const oldStatus = (post.verificationStatus || 'unverified') as VerificationStatus

  // Skip if no change
  if (oldStatus === newStatus) return null

  // Update post
  await prisma.post.update({
    where: { id: postId },
    data: {
      verificationStatus: newStatus,
      verificationNote: note,
      updatedAt: new Date(),
    }
  })

  // Record in post_updates (for history/timeline)
  await prisma.postUpdate.create({
    data: {
      postId: postId,
      oldStatus: oldStatus,
      newStatus: newStatus,
      note: note,
    }
  })

  return {
    postId,
    oldStatus,
    newStatus,
    note,
  }
}

export async function getPostVerificationHistory(postId: string) {
  const data = await prisma.postUpdate.findMany({
    where: { postId: postId },
    orderBy: { createdAt: 'desc' }
  })

  return data
}

// Auto-update posts that have been unverified for too long
export async function reviewStaleUnverifiedPosts() {
  const STALE_HOURS = 24
  const staleDate = new Date(Date.now() - STALE_HOURS * 60 * 60 * 1000)

  const stalePosts = await prisma.post.findMany({
    where: {
      verificationStatus: 'unverified',
      createdAt: { lt: staleDate }
    },
    select: { id: true, createdAt: true }
  })

  if (!stalePosts || stalePosts.length === 0) return

  for (const post of stalePosts) {
    // Mark as partial if still unverified after 24h
    await updatePostStatus(
      post.id,
      'partial',
      'Không tìm được nguồn xác nhận thêm sau 24 giờ. Đọc với cẩn trọng.'
    )
  }
}
