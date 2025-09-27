# Quickstart Test Scenarios (Phase 1)

Date: 2025-09-27
Spec: C:/dev/gympt/specs/001-ai-based-personal/spec.md

## Goal
Executable integration scenarios derived from user stories to validate end-to-end behavior.

## Scenarios

1) New User Setup and Plan Generation
- Given a new user provides goals, experience, preferred days, and equipment
- When they request a plan
- Then they receive a multi-week plan with schedule, day purposes, and rationale

2) Start Daily Session (Minimal UI)
- Given a user with an active plan on a training day
- When they open "Today"
- Then they see a focused first exercise with target sets/reps and a video link

3) Log Sets with Minimal Interaction
- Given a user is performing an exercise
- When they log sets (weight + reps) quickly
- Then the system records logs and updates running totals

4) Complete Session and Summary
- Given a user completes all exercises
- When they finish the session
- Then the system shows a concise summary (total volume, PRs) and prompts a 5-point effort rating + optional comment

5) View Analytics
- Given the user has historical sessions
- When they view analytics
- Then they see: session cadence (7/28/90d + adherence/streaks), weekly volume load, estimated 1RM trends

6) Swap Exercise Mid-Session
- Given a user prefers a different movement
- When they swap an exercise from the plan
- Then the session plan updates while preserving logging continuity

7) Out-of-Scope Confirmations (MVP)
- Offline use is not supported
- Export features are not available

## Acceptance Notes
- All inputs validated; logging actions require minimal taps.
- Feedback rating is mandatory at session end; comment optional.
- Analytics values are reproducible from stored logs.
