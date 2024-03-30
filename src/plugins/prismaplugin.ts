import { PrismaClient } from '@prisma/client'
import fp from 'fastify-plugin'

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<PrismaClient>(async (fastify) => {
  const prisma = new PrismaClient({ errorFormat: 'pretty' })
  await prisma
    .$connect()
    .then(() => console.log('🚀 Prisma connected'))
    .catch(console.error)
  fastify.decorate('prisma', prisma)
})

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    prisma: PrismaClient
  }
}
