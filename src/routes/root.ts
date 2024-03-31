import { configs } from '@configs/index'
import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get('/', async function (_request, _reply) {
    return { root: true, status: `${configs.appname} server is healthy` }
  })
}

export default root
