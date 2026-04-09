'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Trophy, TrendingUp, Target } from 'lucide-react'
import { getProgressToNextLevel } from '@/lib/gamification/points'
import { useUserStats } from '@/hooks/useUserStats'
import { StreakBadge } from '@/components/streak/StreakBadge'

interface UserStatsProps {
  userId?: string
}

const RARITY_COLORS = {
  common: 'border-gray-200 bg-gray-50',
  uncommon: 'border-green-200 bg-green-50',
  rare: 'border-blue-200 bg-blue-50',
  epic: 'border-purple-200 bg-purple-50',
  legendary: 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50',
}

export function UserStats({ userId }: UserStatsProps) {
  const { stats, achievements, loading } = useUserStats(userId)

  if (loading) {
    return <div className="animate-pulse h-64 bg-secondary rounded-lg" />
  }

  if (!stats) return null

  const levelProgress = getProgressToNextLevel(stats.totalPoints)

  return (
    <div className="space-y-4">
      {/* Level Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{levelProgress.current.icon}</div>
              <div>
                <h3 className="font-bold text-lg">
                  Level {levelProgress.current.level}
                </h3>
                <p className="text-sm text-muted-foreground">{levelProgress.current.name}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-[#2D6A4F]">
                {stats.totalPoints.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">diem</div>
            </div>
          </div>

          {levelProgress.next && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>{levelProgress.current.name}</span>
                <span>{levelProgress.next.name}</span>
              </div>
              <Progress value={levelProgress.progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Con {levelProgress.pointsNeeded.toLocaleString()} diem de len level
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <StreakBadge streak={stats.currentStreak} showLabel={false} />
            <div className="text-lg font-bold mt-1">{stats.currentStreak}</div>
            <div className="text-[10px] text-muted-foreground">Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Trophy className="h-5 w-5 mx-auto text-yellow-500" />
            <div className="text-lg font-bold mt-1">{achievements?.unlocked.length || 0}</div>
            <div className="text-[10px] text-muted-foreground">Badges</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <Target className="h-5 w-5 mx-auto text-green-500" />
            <div className="text-lg font-bold mt-1">{stats.predictionsCorrect}</div>
            <div className="text-[10px] text-muted-foreground">Dung</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-blue-500" />
            <div className="text-lg font-bold mt-1">#{stats.rank}</div>
            <div className="text-[10px] text-muted-foreground">Rank</div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      {achievements && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              Achievements ({achievements.unlocked.length}/{achievements.unlocked.length + achievements.locked.length})
            </h3>

            <Tabs defaultValue="unlocked">
              <TabsList className="w-full">
                <TabsTrigger value="unlocked" className="flex-1 text-xs">
                  Da mo ({achievements.unlocked.length})
                </TabsTrigger>
                <TabsTrigger value="locked" className="flex-1 text-xs">
                  Chua mo ({achievements.locked.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="unlocked" className="mt-3">
                <div className="grid grid-cols-2 gap-2">
                  {achievements.unlocked.map(a => (
                    <div
                      key={a.id}
                      className={`p-2.5 rounded-lg border ${RARITY_COLORS[a.rarity]}`}
                    >
                      <div className="text-xl mb-0.5">{a.icon}</div>
                      <div className="font-medium text-xs">{a.name}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1">{a.description}</div>
                      <Badge variant="outline" className="mt-1.5 text-[10px] h-4 px-1">
                        +{a.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="locked" className="mt-3">
                <div className="grid grid-cols-2 gap-2">
                  {achievements.locked.map(a => (
                    <div
                      key={a.id}
                      className="p-2.5 rounded-lg border border-border bg-secondary/30 opacity-60"
                    >
                      <div className="text-xl mb-0.5 grayscale">{a.icon}</div>
                      <div className="font-medium text-xs">{a.name}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1">{a.description}</div>
                      {achievements.progress[a.id] !== undefined && (
                        <Progress value={achievements.progress[a.id]} className="h-1 mt-1.5" />
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
