import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { app } from '../src/app'
import request from 'supertest'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  test('User can create a new transaction', async () => {
    const response = await request(app.server).post('/transactions').send({
      title: 'New Transactions',
      amount: 200,
      type: 'credit',
    })

    expect(response.statusCode).toEqual(201)
  })
})
