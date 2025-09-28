import {
  getSessionsForUser,
  getSessionLogs,
  type SetLog,
} from './sessionService'

export type AnalyticsPayload = {
  sessionCadence: {
    '7d': number
    '28d': number
    '90d': number
    adherence: number
    streak: number
  }
  volumeLoad: Array<{ weekStart: string; totalVolume: number }>
  strengthProgression: Array<{ exerciseId: string; est1RM: number; recordedAt: string }>
}

export function getAnalytics(userId: string): AnalyticsPayload {
  const sessions = getSessionsForUser(userId)
  const now = new Date()

  const cadenceCounts = { '7d': 0, '28d': 0, '90d': 0 }
  const perWeek = new Map<string, number>() // ISO week start -> total volume
  const lastPerExercise = new Map<string, { est1RM: number; recordedAt: string }>()

  sessions.forEach((session) => {
    const sessionDate = session.date ? new Date(session.date) : now
    const days = differenceInDays(now, sessionDate)
    if (days <= 6) cadenceCounts['7d'] += 1
    if (days <= 27) cadenceCounts['28d'] += 1
    if (days <= 89) cadenceCounts['90d'] += 1

    const logs = getSessionLogs(session.id)
    const totalVolumeForSession = computeTotalVolume(logs)
    const weekKey = startOfWeekMonday(sessionDate).toISOString().slice(0, 10)
    perWeek.set(weekKey, (perWeek.get(weekKey) ?? 0) + totalVolumeForSession)

    updateExerciseProgression(lastPerExercise, logs, sessionDate)
  })

  const adherence = sessions.length === 0 ? 0 : Math.min(1, cadenceCounts['7d'] / 3)
  const streak = computeStreak(sessions, now)

  return {
    sessionCadence: {
      '7d': cadenceCounts['7d'],
      '28d': cadenceCounts['28d'],
      '90d': cadenceCounts['90d'],
      adherence,
      streak,
    },
    volumeLoad: Array.from(perWeek.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([weekStart, totalVolume]) => ({ weekStart, totalVolume })),
    strengthProgression: Array.from(lastPerExercise.entries()).map(([exerciseId, info]) => ({
      exerciseId,
      est1RM: info.est1RM,
      recordedAt: info.recordedAt,
    })),
  }
}

function computeTotalVolume(logs: SetLog[]): number {
  return logs.reduce((sum, log) => sum + log.weight * log.reps, 0)
}

function updateExerciseProgression(
  store: Map<string, { est1RM: number; recordedAt: string }>,
  logs: SetLog[],
  date: Date,
) {
  logs.forEach((log) => {
    const oneRepMax = estimateOneRepMax(log.weight, log.reps)
    store.set(log.exerciseId ?? 'unknown', {
      est1RM: oneRepMax,
      recordedAt: date.toISOString(),
    })
  })
}

function estimateOneRepMax(weight: number, reps: number): number {
  if (reps <= 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

function computeStreak(sessions: { date: string }[], now: Date): number {
  const sorted = sessions
    .filter((s) => s.date)
    .map((s) => new Date(s.date))
    .sort((a, b) => b.getTime() - a.getTime())
  let streak = 0
  let current = now
  for (const date of sorted) {
    const diff = differenceInDays(current, date)
    if (diff === 0 || diff === 1) {
      streak += 1
      current = date
    } else if (diff > 1) {
      break
    }
  }
  return streak
}

function differenceInDays(later: Date, earlier: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.floor((later.getTime() - earlier.getTime()) / msPerDay)
}

function startOfWeekMonday(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay() || 7 // Sunday -> 7
  if (day !== 1) {
    result.setDate(result.getDate() - (day - 1))
  }
  result.setHours(0, 0, 0, 0)
  return result
}
