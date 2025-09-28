import { randomUUID } from 'node:crypto'

export type GeneratedTrainingPlan = {
  id: string
  userId: string
  startDate: string
  endDate: string
  weeks: number
  schedule: DaySchedule[]
  rationale: string
  status: 'proposed' | 'active' | 'completed' | 'archived'
  recommitable: boolean
}

export type DaySchedule = {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  planned: boolean
  purpose: string
  summary: string
}

export function generatePlan(userId: string): GeneratedTrainingPlan {
  // For MVP, keep deterministic defaults without DB access [SF, DM]
  const start = new Date()
  const end = new Date(start.getTime() + 7 * 24 * 3600 * 1000)
  return {
    id: randomUUID(),
    userId,
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    weeks: 1,
    schedule: makeDefaultWeek(),
    rationale: 'Initial proposal based on default 3-day split',
    status: 'proposed',
    recommitable: false,
  }
}

function makeDefaultWeek(): DaySchedule[] {
  const days: DaySchedule['day'][] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const plannedDays = new Set<DaySchedule['day']>(['Mon', 'Wed', 'Fri'])
  const purposes: Record<DaySchedule['day'], string> = {
    Mon: 'upper',
    Tue: 'rest',
    Wed: 'lower',
    Thu: 'rest',
    Fri: 'full',
    Sat: 'rest',
    Sun: 'rest',
  }
  return days.map((d) => ({
    day: d,
    planned: plannedDays.has(d),
    purpose: purposes[d],
    summary: plannedDays.has(d)
      ? d === 'Wed'
        ? 'Lower body strength focus'
        : d === 'Fri'
          ? 'Full body pull emphasis'
          : 'Upper body push work'
      : 'Rest or light mobility',
  }))
}
