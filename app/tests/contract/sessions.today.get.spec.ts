import { describe, it, expect } from 'vitest'
import { createApp, toNodeListener } from 'h3'
import request from 'supertest'

const todayHandler = (await import('../../server/api/sessions/today.get')).default

describe('GET /sessions/today', () => {
  it("returns today's session plan (minimal contract shape)", async () => {
    const app = createApp()
    app.use('/sessions/today', todayHandler)

    const res = await request(toNodeListener(app))
      .get('/sessions/today')
      .query({ userId: '11111111-1111-1111-1111-111111111111' })
      .expect(200)

    expect(res.body).toMatchObject({
      id: expect.any(String),
      planId: expect.any(String),
      date: expect.any(String),
      exercises: expect.any(Array),
    })
  })
})
