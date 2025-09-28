import { describe, it, expect, vi } from 'vitest'
import { createApp, toNodeListener } from 'h3'
import request from 'supertest'

// Mock the DB client to avoid real database operations
vi.mock('../../server/db/client', () => {
  return {
    db: {
      insert: () => ({
        values: () => ({
          onConflictDoUpdate: () => ({
            returning: async () => [
              {
                id: '00000000-0000-0000-0000-000000000111',
                goals: 'strength',
                experienceLevel: 'beginner',
                preferredTrainingDays: ['Mon', 'Wed', 'Fri'],
                methodology: 'progressive overload',
                equipment: ['barbell']
              },
            ],
          }),
        }),
      }),
    },
  }
})

// Import after mocking so the handler picks up the mocked client
const usersHandler = (await import('../../server/api/users.post.ts')).default

describe('POST /users', () => {
  it('validates and returns user profile (contract shape)', async () => {
    const app = createApp()
    app.use('/users', usersHandler)

    const payload = {
      goals: 'strength',
      experienceLevel: 'beginner',
      preferredTrainingDays: ['Mon', 'Wed', 'Fri'],
      methodology: 'progressive overload',
      equipment: ['barbell'],
      prBench1RM: 100,
      prSquat1RM: 140,
      prDeadlift1RM: 180,
    }

    const res = await request(toNodeListener(app))
      .post('/users')
      .send(payload)
      .expect(200)

    expect(res.body).toMatchObject({
      id: expect.any(String),
      goals: 'strength',
      experienceLevel: 'beginner',
    })
  })
})
