import { configs } from '@configs/index'
import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get('/', { schema: { hide: true } }, async function (_request, _reply) {
    await fastify.messaging.sendSms('0708073370', 'helpa')
    return { root: true, status: `${configs.appname} server is healthy` }
  })
}

export default root
