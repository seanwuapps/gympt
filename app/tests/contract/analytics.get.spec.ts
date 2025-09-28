import { describe, it, expect } from 'vitest'
import { createApp, toNodeListener } from 'h3'
import request from 'supertest'

const analyticsHandler = (await import('../../server/api/analytics.get')).default

describe('GET /analytics', () => {
  it('returns analytics payload (minimal shape)', async () => {
    const app = createApp()
    app.use('/analytics', analyticsHandler)

    const res = await request(toNodeListener(app))
      .get('/analytics')
      .query({ userId: '11111111-1111-1111-1111-111111111111' })
      .expect(200)

    expect(res.body).toMatchObject({
      sessionCadence: expect.any(Object),
      volumeLoad: expect.any(Array),
      strengthProgression: expect.any(Array),
    })
  })
})
