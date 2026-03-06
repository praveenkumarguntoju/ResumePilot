'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

interface SkillData {
  skill: string
  strongPercentage: number
  weakPercentage: number
  totalStudents: number
  trend: 'up' | 'down' | 'stable'
}

interface EmployabilityHeatmapProps {
  data: SkillData[]
}

export function EmployabilityHeatmap({ data }: EmployabilityHeatmapProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getHeatmapColor = (strongPercentage: number) => {
    if (strongPercentage >= 70) return 'bg-green-500'
    if (strongPercentage >= 50) return 'bg-yellow-500'
    if (strongPercentage >= 30) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getTextColor = (strongPercentage: number) => {
    if (strongPercentage >= 70) return 'text-green-700'
    if (strongPercentage >= 50) return 'text-yellow-700'
    if (strongPercentage >= 30) return 'text-orange-700'
    return 'text-red-700'
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">🔥</span>
          </div>
          Employability Heatmap
        </CardTitle>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Strategic insight into curriculum alignment with market demand
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Strong (70%+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span>Moderate (50-69%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Weak (30-49%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Critical (&lt;30%)</span>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div className="grid gap-3">
            {data.map((skillData) => (
              <div key={skillData.skill} className="flex items-center gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                {/* Skill Name */}
                <div className="w-32 flex-shrink-0">
                  <div className="font-medium text-sm">{skillData.skill}</div>
                  <div className="text-xs text-zinc-500">{skillData.totalStudents} students</div>
                </div>

                {/* Visual Heatmap Bar */}
                <div className="flex-1">
                  <div className="relative h-8 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full ${getHeatmapColor(skillData.strongPercentage)} transition-all duration-500`}
                      style={{ width: `${skillData.strongPercentage}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-between px-3">
                      <span className="text-xs font-medium text-white drop-shadow-sm">
                        {skillData.strongPercentage}% Strong
                      </span>
                      <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        {skillData.weakPercentage}% Need Help
                      </span>
                    </div>
                  </div>
                </div>

                {/* Trend Indicator */}
                <div className="flex items-center gap-2 w-16 justify-end">
                  {getTrendIcon(skillData.trend)}
                  {skillData.strongPercentage < 30 && (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Strategic Insights */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">📊 Strategic Insights</h4>
            <div className="space-y-1 text-xs text-blue-800 dark:text-blue-200">
              {data.filter(d => d.strongPercentage < 30).length > 0 && (
                <div>• {data.filter(d => d.strongPercentage < 30).length} skills need immediate curriculum attention</div>
              )}
              {data.filter(d => d.strongPercentage >= 70).length > 0 && (
                <div>• {data.filter(d => d.strongPercentage >= 70).length} skills are market-ready strengths</div>
              )}
              <div>• Average employability: {Math.round(data.reduce((acc, d) => acc + d.strongPercentage, 0) / data.length)}%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
