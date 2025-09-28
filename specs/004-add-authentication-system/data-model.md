# Phase 1 — Data Model

## Entities

### User
- id (UUID) — unique identity
- email (string)
- emailVerified (boolean)
- displayName (string)
- createdAt (datetime)
- status (enum: active|blocked)
- consents (object/list)

### AuthSession
- userId (UUID, FK → User.id)
- issuedAt (datetime)
- expiresAt (datetime)
- lastActiveAt (datetime)
- deviceInfo (string/object)
- state (enum: active|expired)

## Relationships
- User 1 — n AuthSession

## Identity & Uniqueness
- User.id unique
- Sessions uniquely identified per provider/session token; app references by userId + timestamps

## Lifecycle / State Transitions
- AuthSession: active → expired (time-based); terminated on sign out
- User: active ↔ blocked (administrative control; out of scope for this feature)

## Notes
- Persistence for auth artifacts is provider-managed; app references read-only identities and session state via SDK.
