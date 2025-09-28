import { describe, it, expect } from 'vitest'
import { createApp, toNodeListener } from 'h3'
import request from 'supertest'

const completeHandler = (await import('../../server/api/sessions/[sessionId]/complete.post')).default

describe('POST /sessions/:id/complete', () => {
  it('finalizes a session, captures feedback, and returns summary', async () => {
    const app = createApp()
    app.use('/sessions/11111111-1111-1111-1111-111111111111/complete', completeHandler)

    const payload = {
      feedback: {
        effortRating: 4,
        comment: 'Felt good',
      },
    }

    const res = await request(toNodeListener(app))
      .post('/sessions/11111111-1111-1111-1111-111111111111/complete')
      .send(payload)
      .expect(200)

    expect(res.body).toMatchObject({
      totalVolume: expect.any(Number),
      prs: expect.any(Array),
    })
  })
})
