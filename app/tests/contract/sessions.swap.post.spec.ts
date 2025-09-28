import { describe, it, expect } from 'vitest'
import { createApp, toNodeListener } from 'h3'
import request from 'supertest'

// Import the handler directly
const swapHandler = (await import('../../server/api/sessions/[sessionId]/swap.post')).default

describe('POST /sessions/:id/swap', () => {
  it('returns updated session plan (minimal contract shape)', async () => {
    const app = createApp()
    app.use('/sessions/11111111-1111-1111-1111-111111111111/swap', swapHandler)

    const payload = {
      fromExerciseId: '00000000-0000-0000-0000-000000000010',
      intent: 'core stability',
    }

    const res = await request(toNodeListener(app))
      .post('/sessions/11111111-1111-1111-1111-111111111111/swap')
      .send(payload)
      .expect(200)

    expect(res.body).toMatchObject({
      id: expect.any(String),
      planId: expect.any(String),
      date: expect.any(String),
      exercises: expect.any(Array),
    })
    expect(res.body.exercises[0]).toMatchObject({
      name: 'Hanging Leg Raise',
      targetSets: 3,
    })
  })
})
