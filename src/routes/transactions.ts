import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function transactionsRoutes(app: FastifyInstance) {

  app.get('/', { preHandler: checkSessionIdExists }, async (req, reply) => {
    const { sessionId } = req.cookies

    const allTransactions = await knex('transactions')
      .where('session_id', sessionId)
      .select()

    return reply.status(200).send({ allTransactions })
  })

  app.get('/:id', { preHandler: checkSessionIdExists }, async (req, reply) => {
    const transactionParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = transactionParamsSchema.parse(req.params)
    const { sessionId } = req.cookies

    const transaction = await knex('transactions')
      .where({ 
        session_id: sessionId, 
        id: id 
      })
      .first()

    return reply.status(200).send({ transaction })
  })

  app.get(
    '/summary',
    { preHandler: checkSessionIdExists },
    async (req, reply) => {
      const { sessionId } = req.cookies
      const summary = await knex('transactions')
        .where('session_id', sessionId)
        .sum('amount', { as: 'amount' })
        .first()

      return reply.status(200).send({ summary })
    },
  )

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
