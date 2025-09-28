# Data Model: AI-based Personal Training Companion (Phase 1)

Date: 2025-09-27
Spec: C:/dev/gympt/specs/001-ai-based-personal/spec.md

## Entities & Relationships

### User
- id (UUID)
- createdAt (datetime)
- goals (enum: strength | hypertrophy | fat-loss | cardio | rehab)
- experienceLevel (enum: beginner | intermediate | advanced)
- preferredTrainingDays (array<enum: Mon..Sun>)
- methodology (string, e.g., "progressive overload")
- equipment (array<string>)
- prBench1RM (number, kg) [optional]
- prSquat1RM (number, kg) [optional]
- prDeadlift1RM (number, kg) [optional]
- cardioCapabilities (string) [optional]

Relationships:
- 1..* GeneratedTrainingPlan (via userId)
- 1..* UserTrainingSession (via userId)

---

### GeneratedTrainingPlan
- id (UUID)
- userId (UUID FK → User.id)
- startDate (date)
- endDate (date)
- weeks (integer)
- schedule (array<DaySchedule>[7])  # structured Mon–Sun schedule
- rationale (string)  # why this plan suits the user
- status (enum: proposed | active | completed | archived)
- recommitable (boolean)  # allow re-commit later

Relationships:
- 1..* GeneratedTrainingSessionPlan (via planId)

---

DaySchedule:
- day (enum: Mon | Tue | Wed | Thu | Fri | Sat | Sun)
- planned (boolean)
- purpose (string)
- summary (string)  # high-level description of work type

### GeneratedTrainingSessionPlan
- id (UUID)
- planId (UUID FK → GeneratedTrainingPlan.id)
- date (date)
- exercises (array<ExercisePrescription>)

ExercisePrescription:
- exerciseId (UUID or catalog slug)
- name (string)
- description (string)
- videoUrl (url)
- targetSets (integer)
- targetReps (integer | array<int>)
- targetLoad (number | formula | null)  # optional target weight or % of 1RM
- restSeconds (integer) [optional]

---

### Exercise (catalog)
- id (UUID)
- name (string)
- description (string)
- primaryMuscles (array<string>)
- videoUrl (url)

---

### UserTrainingSession
- id (UUID)
- userId (UUID FK → User.id)
- planId (UUID FK → GeneratedTrainingPlan.id) [optional]
- sessionPlanId (UUID FK → GeneratedTrainingSessionPlan.id) [optional]
- date (datetime)
- durationSeconds (integer) [optional]
- logs (array<ExerciseLog>)
- summary (SessionSummary) [optional]
- feedback (SessionFeedback) [optional]

ExerciseLog:
- exerciseId (UUID)
- name (string)
- sets (array<SetLog>)
- notes (string) [optional]

SetLog:
- setIndex (integer)
- weight (number)
- reps (integer)
- rpe (integer 1..10) [optional]

SessionSummary:
- totalVolume (number, kg)
- prs (array<PR>)
- notes (string) [optional]

PR:
- type (enum: weight | reps | volume)
- exerciseId (UUID)
- value (number)

SessionFeedback:
- effortRating (integer 1..5)
- comment (string) [optional]

---

### ProgressMetrics (derived views)
- snapshotDate (date)
- metric (enum: sessionCadence | volumeLoad | strengthProgression)
- value (number | object)
- details (object) [optional]

Notes:
- These may be computed on read (aggregation queries) rather than stored.

## Integrity & Validation
- Foreign keys must be valid.
- Numeric fields must be non-negative.
- Dates must be ISO 8601.
- effortRating must be 1..5.

## Glossary
- 1RM: One-repetition maximum; estimation formula TBD (choose simple formula for MVP).
