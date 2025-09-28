# Feature Specification: AI-based Personal Training Companion

**Feature Branch**: `001-ai-based-personal`  
**Created**: 2025-09-27  
**Status**: Draft  
**Input**: User description: "AI-based personal training companion that generates, manages, and tracks strength-training plans and sessions tailored to user's fitness level and goals, it should also provide time-based analytics for the user to see their progress and after each training session is finished, the ai should provide the user with a quick summary of the session. The UI should be mobile-first and extremely simple (only show what the user needs to see at the time of interaction) since a lot of the use case involves user being in the gym working out."

---

## User Scenarios & Testing

### Primary User Story

As a gym-goer, I want an AI-powered training companion that creates personalized strength training workouts and tracks my progress, so I can effectively achieve my fitness goals with minimal interface interactions while at the gym.

### Acceptance Scenarios

1. **Given** a new user, **When** they first access the system, **Then** they should be prompted to provide their fitness goals and training preferences
2. **Given** a user ready to work out, **When** they start a session, **Then** they should see a clear, tailored workout plan for the day
3. **Given** a user during a workout, **When** they complete an exercise, **Then** they should be able to quickly log their performance with minimal interaction
4. **Given** a completed workout session, **When** the user finishes their last exercise, **Then** they should receive an AI-generated summary of their performance

- What happens when the user needs to skip or modify an exercise during a workout?
- How does the system handle incomplete workout sessions?
 - How does the system adapt if a user consistently underperforms or overperforms?
 - What happens when the user wants to switch their fitness goals mid-program?

 ## Clarifications
 
 ### Session 2025-09-27
 - Q: How should the app behave with poor/no connectivity during a workout? → A: De-prioritized for MVP; online connectivity required
 - Scope Note: Offline capabilities are out of scope for MVP. Treat as a post-MVP enhancement. Analytics and logging flows assume online availability.
 - Q: How should users provide feedback that drives AI adjustments after a session? → A: 5-point effort scale with optional free-text comment
 - Decision Impact: Capture rating after each session; AI uses rating plus logged performance to adjust subsequent sessions.
 - Q: Which analytics/KPIs should be prioritized for MVP? → A: Session cadence, Volume load, Strength progression
 - Decision Impact: Provide (1) session cadence: sessions in last 7/28/90 days, average duration, adherence/streaks; (2) volume load: total weekly volume per exercise/muscle group; (3) strength progression: estimated 1RM trend for key lifts.
 - Q: What is the data retention and export policy for MVP? → A: No special retention policy; keep records in database; no export features
 - Decision Impact: Retain training data indefinitely (until user-initiated deletion if offered later). Exclude CSV/JSON export from MVP scope.

## Requirements

 ### Functional Requirements
 
 - **FR-001**: System MUST create personalized training plans based on user's fitness level, goals, and preferences
 - **FR-002**: System MUST provide a mobile-first, extremely minimalist interface optimized for gym use
 - **FR-003**: System MUST track and record user training sessions (exercise, sets, reps, weights, optional notes)
 - **FR-004**: At the end of a user training session, System MUST present a concise summary highlighting key achievements and areas for improvement
 - **FR-005**: System MUST provide analytics for:
   • Session cadence (sessions in last 7/28/90 days, average session duration, adherence/streaks)
   • Volume load (total weekly volume per exercise/muscle group)
   • Strength progression (estimated 1RM trend for key lifts)
 - **FR-006**: System MUST allow users to quickly log exercise completion with minimal interaction
 - **FR-007**: System MUST intelligently update training plans based on logged performance and feedback signals
 - **FR-008**: System MUST allow users to swap exercises in the current planned session
 - **FR-009**: System MUST provide real-time exercise guidance (description before starting and a YouTube video link)
 - **FR-010**: System MUST store user's training history and performance data with no automatic retention limit (no export features in MVP)
 - **FR-011**: After each session, System MUST capture a 5-point effort rating with an optional free-text comment; AI MUST use this rating to adjust upcoming sessions

### Key Entities

- **User**: Represents the gym-goer, including their profile, fitness goals (e.g. rehab, strength, fat loss, cardio), fitness level (e.g. max 1 rep for bench, deadlift and squats, cardio capabilities), preferred training days (e.g. Mon, Tues, Wed), preferred training methodology (e.g. progressive overload)
- **GeneratedTrainingPlan**: AI-generated high-level training plans for users to review and commit to. The plan includes total length (weeks), start and end dates, and a structured weekly `schedule` of exactly 7 `DaySchedule` entries (Mon–Sun). Each `DaySchedule` specifies `planned` (boolean), `purpose` (string), and a concise `summary` describing the type of work expected that day. Users should be able to re-commit to previously finished training plan.
 - **GeneratedTrainingSessionPlan**: A specific day’s planned session derived from a training plan, including exercises with `name`, `description`, `videoUrl`, targets (sets/reps/load), and optional `restSeconds`. This is what powers “Today’s session” and can be updated by a swap action.
 - **Exercise**: Individual training exercise with associated performance metrics
 - **UserTrainingSession**: Records of completed training sessions including actual user performance data (sets, reps, duration etc)
 - **Feedback**: System-generated insights, recommendations, and session summaries
 - **ProgressMetrics**: Time-based analytics of user's performance across various exercises

### Requirement Completeness

- [ ] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Scope is clearly bounded

Note: Clarifications captured for offline (out of scope for MVP), feedback (5-point scale + comment), analytics (session cadence, volume load, strength progression), and data retention/export (no export in MVP). Ready to proceed to planning.
