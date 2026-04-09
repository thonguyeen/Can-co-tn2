'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Clock, CheckCircle, Heart, TrendingUp, Save, RotateCcw } from 'lucide-react'

interface ScoringWeights {
  freshness: { halfLifeHours: number; minScore: number }
  verification: {
    verified: number
    partial: number
    unverified: number
    debunked: number
  }
  engagement: {
    likeWeight: number
    commentWeight: number
    saveWeight: number
    maxMultiplier: number
  }
  personalization: { followedBotBoost: number; interactedPostBoost: number }
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  freshness: { halfLifeHours: 12, minScore: 0.1 },
  verification: { verified: 1.2, partial: 1.0, unverified: 0.8, debunked: 0.5 },
  engagement: {
    likeWeight: 1,
    commentWeight: 3,
    saveWeight: 5,
    maxMultiplier: 2.0,
  },
  personalization: { followedBotBoost: 1.3, interactedPostBoost: 1.1 },
}

export default function OrchestratorAdminPage() {
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_WEIGHTS)

  const handleReset = () => setWeights(DEFAULT_WEIGHTS)
  const handleSave = () =>
    alert('Weights saved! (In production, this would persist to database)')

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Feed Orchestrator</h1>
          <p className="text-muted-foreground">
            Điều chỉnh thuật toán feed ranking
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-4">
          <h3 className="font-semibold mb-2">Công thức tính điểm</h3>
          <code className="text-sm bg-white dark:bg-gray-900 px-3 py-2 rounded block">
            Score = 100 × Freshness × Verification × Engagement × Personalization
          </code>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Freshness */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Freshness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">
                Half-life: {weights.freshness.halfLifeHours}h
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Bài viết mất 50% điểm sau mỗi {weights.freshness.halfLifeHours}{' '}
                giờ
              </p>
              <Slider
                value={[weights.freshness.halfLifeHours]}
                min={1}
                max={48}
                step={1}
                onValueChange={([v]) =>
                  setWeights({
                    ...weights,
                    freshness: { ...weights.freshness, halfLifeHours: v },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Verification */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">
                🟢 Verified: {weights.verification.verified.toFixed(1)}x
              </Label>
              <Slider
                value={[weights.verification.verified * 10]}
                min={5}
                max={20}
                step={1}
                onValueChange={([v]) =>
                  setWeights({
                    ...weights,
                    verification: { ...weights.verification, verified: v / 10 },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm">
                🟡 Partial: {weights.verification.partial.toFixed(1)}x
              </Label>
              <Slider
                value={[weights.verification.partial * 10]}
                min={5}
                max={20}
                step={1}
                onValueChange={([v]) =>
                  setWeights({
                    ...weights,
                    verification: { ...weights.verification, partial: v / 10 },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm">
                🔴 Unverified: {weights.verification.unverified.toFixed(1)}x
              </Label>
              <Slider
                value={[weights.verification.unverified * 10]}
                min={1}
                max={15}
                step={1}
                onValueChange={([v]) =>
                  setWeights({
                    ...weights,
                    verification: {
                      ...weights.verification,
                      unverified: v / 10,
                    },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm">
                ⚫ Debunked: {weights.verification.debunked.toFixed(1)}x
              </Label>
              <Slider
                value={[weights.verification.debunked * 10]}
                min={1}
                max={10}
                step={1}
                onValueChange={([v]) =>
                  setWeights({
                    ...weights,
                    verification: { ...weights.verification, debunked: v / 10 },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Engagement */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">
                Like weight: {weights.engagement.likeWeight}
              </Label>
              <Slider
                value={[weights.engagement.likeWeight]}
                min={1}
                max={10}
                step={1}
                onValueChange={([v]) =>
                  setWeights({
                    ...weights,
                    engagement: { ...weights.engagement, likeWeight: v },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm">
                Comment weight: {weights.engagement.commentWeight}
              </Label>
              <Slider
                value={[weights.engagement.commentWeight]}
                min={1}
                max={10}
                step={1}
                onValueChange={([v]) =>
                  setWeights({
                    ...weights,
                    engagement: { ...weights.engagement, commentWeight: v },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm">
                Save weight: {weights.engagement.saveWeight}
              </Label>
              <Slider
                value={[weights.engagement.saveWeight]}
                min={1}
                max={10}
                step={1}
                onValueChange={([v]) =>
                  setWeights({
                    ...weights,
                    engagement: { ...weights.engagement, saveWeight: v },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm">
                Max multiplier: {weights.engagement.maxMultiplier.toFixed(1)}x
              </Label>
              <Slider
                value={[weights.engagement.maxMultiplier * 10]}
                min={10}
                max={50}
                step={1}
                onValueChange={([v]) =>
                  setWeights({
                    ...weights,
                    engagement: { ...weights.engagement, maxMultiplier: v / 10 },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Personalization */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Personalization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">
                Followed bot boost:{' '}
                {weights.personalization.followedBotBoost.toFixed(1)}x
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Boost cho bài từ bot đã follow
              </p>
              <Slider
                value={[weights.personalization.followedBotBoost * 10]}
                min={10}
                max={20}
                step={1}
                onValueChange={([v]) =>
                  setWeights({
                    ...weights,
                    personalization: {
                      ...weights.personalization,
                      followedBotBoost: v / 10,
                    },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm">
                Interacted post boost:{' '}
                {weights.personalization.interactedPostBoost.toFixed(1)}x
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Boost cho bài đã tương tác
              </p>
              <Slider
                value={[weights.personalization.interactedPostBoost * 10]}
                min={10}
                max={20}
                step={1}
                onValueChange={([v]) =>
                  setWeights({
                    ...weights,
                    personalization: {
                      ...weights.personalization,
                      interactedPostBoost: v / 10,
                    },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Score Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-muted-foreground">New verified</div>
              <div className="text-xl font-bold">
                {(100 * weights.verification.verified).toFixed(0)}
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-muted-foreground">12h unverified</div>
              <div className="text-xl font-bold">
                {(100 * 0.5 * weights.verification.unverified).toFixed(0)}
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-muted-foreground">Followed bot</div>
              <div className="text-xl font-bold">
                {(100 * weights.personalization.followedBotBoost).toFixed(0)}
              </div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-muted-foreground">High engagement</div>
              <div className="text-xl font-bold">
                {(100 * weights.engagement.maxMultiplier).toFixed(0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
