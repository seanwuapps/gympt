import { describe, it } from 'vitest'
import { createApp, toNodeListener } from 'h3'
import request from 'supertest'

const logsHandler = (await import('../../server/api/sessions/[sessionId]/logs.post')).default

describe('POST /sessions/:id/logs', () => {
  it('appends a set log and returns 204', async () => {
    const app = createApp()
    app.use('/sessions/11111111-1111-1111-1111-111111111111/logs', logsHandler)

    const payload = {
      setIndex: 0,
      weight: 100,
      reps: 5,
      rpe: 8,
    }

    await request(toNodeListener(app))
      .post('/sessions/11111111-1111-1111-1111-111111111111/logs')
      .send(payload)
      .expect(204)
  })
})
