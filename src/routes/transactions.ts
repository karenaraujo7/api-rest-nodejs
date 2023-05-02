import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async (req, reply) => {
    const allTransactions = await knex('transactions').select()

    return reply.status(200).send({ allTransactions })
  })

  app.get('/:id', async (req, reply) => {
    const transactionParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = transactionParamsSchema.parse(req.params)

    const transaction = await knex('transactions').where('id', id).first()

    return reply.status(200).send({ transaction })
  })

  app.get('/summary', async (req, reply) => {
    const summary = await knex('transactions')
      .sum('amount', { as: 'amount' })
      .first()

    return reply.status(200).send({ summary })
  })

  app.post('/', async (req, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(req.body)

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
