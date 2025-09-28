import { describe, it, expect } from 'vitest'
import { createApp, toNodeListener } from 'h3'
import request from 'supertest'

const generateSessionHandler = (
  await import('../../server/api/sessions/generate.post.ts')
).default

describe('POST /sessions/generate', () => {
  it('returns a GeneratedTrainingSessionPlan (minimal contract shape)', async () => {
    const app = createApp()
    app.use('/sessions/generate', generateSessionHandler)

    const payload = {
      userId: '11111111-1111-1111-1111-111111111111',
      planId: '22222222-2222-2222-2222-222222222222',
      date: '2025-10-01',
    }

    const res = await request(toNodeListener(app))
      .post('/sessions/generate')
      .send(payload)
      .expect(200)

    expect(res.body).toMatchObject({
      id: expect.any(String),
      planId: payload.planId,
      date: expect.any(String),
      exercises: expect.any(Array),
    })
    const ex = res.body.exercises[0]
    expect(ex).toMatchObject({
      exerciseId: expect.any(String),
      name: expect.any(String),
      targetSets: expect.any(Number),
    })
  })
})
