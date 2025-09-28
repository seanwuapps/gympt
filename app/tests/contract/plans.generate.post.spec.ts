import { describe, it, expect } from 'vitest'
import { createApp, toNodeListener } from 'h3'
import request from 'supertest'

const generateHandler = (await import('../../server/api/plans/generate.post')).default

describe('POST /plans/generate', () => {
  it('returns a GeneratedTrainingPlan (minimal contract shape)', async () => {
    const app = createApp()
    app.use('/plans/generate', generateHandler)

    const payload = {
      userId: '11111111-1111-1111-1111-111111111111',
    }

    const res = await request(toNodeListener(app))
      .post('/plans/generate')
      .send(payload)
      .expect(200)

    expect(res.body).toMatchObject({
      id: expect.any(String),
      userId: payload.userId,
      startDate: expect.any(String),
      endDate: expect.any(String),
      weeks: expect.any(Number),
      schedule: expect.any(Array),
      rationale: expect.any(String),
      status: expect.any(String),
      recommitable: expect.any(Boolean),
    })
    expect(res.body.schedule).toHaveLength(7)
    const mon = res.body.schedule[0]
    expect(mon).toMatchObject({
      day: expect.any(String),
      planned: expect.any(Boolean),
      purpose: expect.any(String),
      summary: expect.any(String),
    })
  })
})
