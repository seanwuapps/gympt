import { randomUUID } from 'node:crypto'

export type ExercisePrescription = {
  exerciseId: string
  name: string
  description?: string | null
  videoUrl?: string | null
  targetSets: number
  targetReps: number[] | number
  targetLoad: string | number | null
  restSeconds?: number | null
}

export type GeneratedTrainingSessionPlan = {
  id: string
  planId: string
  date: string
  exercises: ExercisePrescription[]
}

export type SetLog = {
  exerciseId?: string
  setIndex: number
  weight: number
  reps: number
  rpe?: number
}

export type SessionFeedback = {
  effortRating: number
  comment?: string
}

export type SessionSummary = {
  totalVolume: number
  prs: Array<{ type: 'weight' | 'reps' | 'volume'; exerciseId: string; value: number }>
}

type SessionPlanRecord = GeneratedTrainingSessionPlan & { userId: string }

const sessionPlansCache = new Map<string, SessionPlanRecord>()
const userDayIndex = new Map<string, string>() // key: `${userId}:${date}` -> sessionId
const sessionLogsCache = new Map<string, SetLog[]>()
const sessionFeedbackCache = new Map<string, SessionFeedback>()

const DEFAULT_EXERCISES: ExercisePrescription[] = [
  {
    exerciseId: '00000000-0000-0000-0000-000000000010',
    name: 'Bench Press',
    description: 'Barbell bench press',
    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
    targetSets: 3,
    targetReps: [5, 5, 5],
    targetLoad: '75% 1RM',
    restSeconds: 120,
  },
  {
    exerciseId: '00000000-0000-0000-0000-000000000011',
    name: 'Barbell Row',
    description: 'Barbell bent-over row',
    videoUrl: 'https://www.youtube.com/watch?v=7z4mL2B9mY4',
    targetSets: 3,
    targetReps: [8, 8, 8],
    targetLoad: '70% 1RM',
    restSeconds: 90,
  },
]

function cloneExercises(): ExercisePrescription[] {
  return DEFAULT_EXERCISES.map(cloneExercise)
}

function ensureSessionRecord(sessionId: string): SessionPlanRecord {
  const existing = sessionPlansCache.get(sessionId)
  if (existing) {
    return existing
  }
  const fallback: SessionPlanRecord = {
    id: sessionId,
    planId: 'placeholder-plan',
    date: new Date().toISOString().slice(0, 10),
    exercises: cloneExercises(),
    userId: 'unknown-user',
  }
  sessionPlansCache.set(sessionId, fallback)
  return fallback
}

export async function generateSessionPlan(input: { userId: string; planId: string; date?: string }): Promise<GeneratedTrainingSessionPlan> {
  const { userId, planId } = input
  const date = input.date || new Date().toISOString().slice(0, 10)
  const session: SessionPlanRecord = {
    id: randomUUID(),
    planId,
    date,
    exercises: cloneExercises(),
    userId,
  }
  sessionPlansCache.set(session.id, session)
  userDayIndex.set(`${userId}:${date}`, session.id)
  return {
    id: session.id,
    planId: session.planId,
    date: session.date,
    exercises: cloneExercisesFrom(session.exercises),
  }
}

export async function getTodaySession(input: { userId: string; date?: string }): Promise<GeneratedTrainingSessionPlan> {
  const date = input.date || new Date().toISOString().slice(0, 10)
  const cacheKey = `${input.userId}:${date}`
  let sessionId = userDayIndex.get(cacheKey)
  if (!sessionId) {
    const generated = await generateSessionPlan({ userId: input.userId, planId: randomUUID(), date })
    sessionId = generated.id
  }
  const record = ensureSessionRecord(sessionId)
  return {
    id: record.id,
    planId: record.planId,
    date: record.date,
    exercises: cloneExercisesFrom(record.exercises),
  }
}

function cloneExercisesFrom(exercises: ExercisePrescription[]): ExercisePrescription[] {
  return exercises.map(cloneExercise)
}

function cloneExercise(ex: ExercisePrescription): ExercisePrescription {
  return {
    ...ex,
    targetReps: Array.isArray(ex.targetReps) ? [...ex.targetReps] : ex.targetReps,
  }
}

export async function appendSetLog(sessionId: string, log: SetLog): Promise<void> {
  ensureSessionRecord(sessionId)
  const logs = sessionLogsCache.get(sessionId) ?? []
  logs.push({ ...log, exerciseId: log.exerciseId ?? 'unknown' })
  sessionLogsCache.set(sessionId, logs)
}

export async function completeSession(sessionId: string, feedback: SessionFeedback): Promise<SessionSummary> {
  sessionFeedbackCache.set(sessionId, { ...feedback })
  const logs = sessionLogsCache.get(sessionId) ?? []
  const totalVolume = logs.reduce((acc, entry) => acc + entry.weight * entry.reps, 0)
  const prs: SessionSummary['prs'] = []
  return {
    totalVolume,
    prs,
  }
}

export async function swapExercise(
  sessionId: string,
  input: { fromExerciseId: string; intent?: string },
): Promise<GeneratedTrainingSessionPlan> {
  const record = ensureSessionRecord(sessionId)
  const original = record.exercises.find((ex) => ex.exerciseId === input.fromExerciseId)
  const suggestion = suggestAlternativeExercise(original, input.intent)

  let replaced = false
  const updatedExercises = record.exercises.map((ex) => {
    if (ex.exerciseId === input.fromExerciseId) {
      replaced = true
      return suggestion
    }
    return ex
  })
  if (!replaced) {
    if (updatedExercises.length > 0) {
      updatedExercises[0] = suggestion
    } else {
      updatedExercises.push(suggestion)
    }
  }
  record.exercises = updatedExercises
  sessionPlansCache.set(sessionId, record)
  return {
    id: record.id,
    planId: record.planId,
    date: record.date,
    exercises: cloneExercisesFrom(record.exercises),
  }
}

function suggestAlternativeExercise(original?: ExercisePrescription, intent?: string): ExercisePrescription {
  const normalizedIntent = intent?.toLowerCase() ?? ''
  if (normalizedIntent.includes('cardio')) {
    return cloneExerciseTemplate({
      exerciseId: randomUUID(),
      name: 'Assault Bike Intervals',
      description: 'High-intensity bike intervals for conditioning',
      videoUrl: 'https://www.youtube.com/watch?v=Fi2sD0bRbP8',
      targetSets: 6,
      targetReps: [45, 45, 45, 45, 45, 45],
      targetLoad: null,
      restSeconds: 60,
    })
  }
  if (normalizedIntent.includes('mobility') || normalizedIntent.includes('stretch')) {
    return cloneExerciseTemplate({
      exerciseId: randomUUID(),
      name: 'Worlds Greatest Stretch',
      description: 'Full-body mobility flow',
      videoUrl: 'https://www.youtube.com/watch?v=yXGFOxs0Dgk',
      targetSets: 3,
      targetReps: [8, 8, 8],
      targetLoad: null,
      restSeconds: 30,
    })
  }
  if (normalizedIntent.includes('core')) {
    return cloneExerciseTemplate({
      exerciseId: randomUUID(),
      name: 'Hanging Leg Raise',
      description: 'Core stability focus',
      videoUrl: 'https://www.youtube.com/watch?v=0tIy3FZL3fo',
      targetSets: 3,
      targetReps: [12, 10, 8],
      targetLoad: null,
      restSeconds: 45,
    })
  }

  if (original) {
    const alt = lookupAlternativeByName(original.name)
    if (alt) {
      return cloneExerciseTemplate({ ...alt, exerciseId: randomUUID() })
    }
  }

  return cloneExerciseTemplate({
    exerciseId: randomUUID(),
    name: 'Dumbbell Push Press',
    description: 'Full-body power movement',
    videoUrl: 'https://www.youtube.com/watch?v=iaBVSJm78ko',
    targetSets: 4,
    targetReps: [5, 5, 5, 5],
    targetLoad: 'RPE 8',
    restSeconds: 120,
  })
}

function lookupAlternativeByName(name: string): Omit<ExercisePrescription, 'exerciseId'> | undefined {
  const key = name.toLowerCase()
  const catalog: Record<string, Omit<ExercisePrescription, 'exerciseId'>> = {
    'bench press': {
      name: 'Incline Dumbbell Press',
      description: 'Upper-chest emphasis pressing variation',
      videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
      targetSets: 3,
      targetReps: [10, 8, 8],
      targetLoad: 'RPE 8',
      restSeconds: 90,
    },
    'back squat': {
      name: 'Front Squat',
      description: 'Quadriceps-dominant squat pattern',
      videoUrl: 'https://www.youtube.com/watch?v=tlfahNdNPPI',
      targetSets: 4,
      targetReps: [6, 6, 6, 6],
      targetLoad: '70% 1RM',
      restSeconds: 150,
    },
    deadlift: {
      name: 'Romanian Deadlift',
      description: 'Posterior chain hinge variation',
      videoUrl: 'https://www.youtube.com/watch?v=DJp8YHKpF1Q',
      targetSets: 3,
      targetReps: [10, 10, 10],
      targetLoad: '65% 1RM',
      restSeconds: 120,
    },
    'barbell row': {
      name: 'Chest-Supported Row',
      description: 'Upper-back hypertrophy focus',
      videoUrl: 'https://www.youtube.com/watch?v=ck1ZbT4Y7gk',
      targetSets: 3,
      targetReps: [12, 12, 12],
      targetLoad: 'RPE 9',
      restSeconds: 75,
    },
  }
  return catalog[key]
}

function cloneExerciseTemplate(template: ExercisePrescription): ExercisePrescription {
  return cloneExercise(template)
}

export function getSessionsForUser(userId: string): SessionPlanRecord[] {
  return Array.from(sessionPlansCache.values()).filter((session) => session.userId === userId)
}

export function getSessionLogs(sessionId: string): SetLog[] {
  return [...(sessionLogsCache.get(sessionId) ?? [])]
}

export function getSessionFeedback(sessionId: string): SessionFeedback | undefined {
  return sessionFeedbackCache.get(sessionId)
}
