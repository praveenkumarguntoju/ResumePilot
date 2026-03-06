'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Calendar, Target } from 'lucide-react'

interface TrendData {
  month: string
  score: number
  assessments: number
  improvement?: number
}

interface CareerReadinessTrendProps {
  data: TrendData[]
  currentScore?: number
}

export function CareerReadinessTrend({ data, currentScore }: CareerReadinessTrendProps) {
  const getTrendIcon = (improvement?: number) => {
    if (!improvement) return null
    if (improvement > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (improvement < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return null
  }

  const getTrendColor = (improvement?: number) => {
    if (!improvement) return 'text-zinc-600'
    if (improvement > 0) return 'text-green-600'
    if (improvement < 0) return 'text-red-600'
    return 'text-zinc-600'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-blue-500'
    if (score >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  // Calculate improvements
  const trendData = data.map((item, index) => {
    const previousScore = index > 0 ? data[index - 1].score : item.score
    const improvement = index > 0 ? item.score - previousScore : 0
    return { ...item, improvement }
  })

  const totalImprovement = trendData.length > 1 
    ? trendData[trendData.length - 1].score - trendData[0].score
    : 0

  const averageMonthlyImprovement = trendData.length > 1
    ? totalImprovement / (trendData.length - 1)
    : 0

  const maxScore = Math.max(...trendData.map(d => d.score))
  const minScore = Math.min(...trendData.map(d => d.score))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-green-600" />
          Career Readiness Trend Over Time
        </CardTitle>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Track student progress month by month - universities love improvement metrics
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {totalImprovement > 0 ? '+' : ''}{totalImprovement}%
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">
                    Total Improvement
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {currentScore || trendData[trendData.length - 1]?.score || 0}%
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    Current Score
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {Math.abs(averageMonthlyImprovement).toFixed(1)}%
                  </div>
                  <div className="text-xs text-purple-700 dark:text-purple-300">
                    Avg Monthly Change
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Progress Timeline:</h4>
            <div className="relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-zinc-500">
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              {/* Chart area */}
              <div className="ml-12 space-y-3">
                {trendData.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    {/* Month label */}
                    <div className="w-16 text-xs text-zinc-600 dark:text-zinc-400 text-right">
                      {item.month}
                    </div>

                    {/* Progress bar */}
                    <div className="flex-1 relative">
                      <div className="h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getScoreColor(item.score)} transition-all duration-700 rounded-full`}
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                      
                      {/* Score label on bar */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white drop-shadow-sm">
                          {item.score}%
                        </span>
                      </div>
                    </div>

                    {/* Trend indicator */}
                    <div className="w-20 flex items-center justify-end gap-1">
                      {getTrendIcon(item.improvement)}
                      <span className={`text-xs font-medium ${getTrendColor(item.improvement)}`}>
                        {item.improvement && item.improvement !== 0 && (
                          <>
                            {item.improvement > 0 ? '+' : ''}{item.improvement}%
                          </>
                        )}
                      </span>
                    </div>

                    {/* Assessment count */}
                    <div className="w-16 text-xs text-zinc-500 text-right">
                      ({item.assessments})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">📈 Strategic Insights</h4>
            <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
              {totalImprovement > 0 && (
                <div>• Average readiness improved by {Math.abs(totalImprovement)}% during pilot period</div>
              )}
              {averageMonthlyImprovement > 0 && (
                <div>• Consistent monthly improvement of {averageMonthlyImprovement.toFixed(1)}% shows effective guidance</div>
              )}
              {currentScore && currentScore >= 70 && (
                <div>• {Math.round((data.filter(d => d.score >= 70).length / data.length) * 100)}% of students reached career-ready threshold</div>
              )}
              {maxScore - minScore > 20 && (
                <div>• Score range of {maxScore - minScore}% indicates need for targeted interventions</div>
              )}
              <div>• {trendData[trendData.length - 1]?.assessments || 0} assessments completed in latest period</div>
            </div>
          </div>

          {/* Board-Level Reporting Summary */}
          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <div className="text-xs text-zinc-600 dark:text-zinc-400 text-center">
              <strong>Board-Level Impact:</strong> Career readiness tracking demonstrates measurable ROI on career services investment
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
