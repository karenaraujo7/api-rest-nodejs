import { knex as setupKnex, Knex } from 'knex'
import { env } from './env'

export const config: Knex.Config = {
  client: 'sqlite', // Banco de dados que vamos usar
  connection: {
    filename: env.DATABASE_URL, // nome do arquivo onde vamos salvar nosso banco de dados
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
}

export const knex = setupKnex(config)
