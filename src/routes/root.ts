import { configs } from '@configs/index'
import { getFixturesOdds } from '@cronjobs/odds'
import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get('/', { schema: { hide: true } }, async function (_request, _reply) {
    await getFixturesOdds(fastify)
    return { root: true, status: `${configs.appname} server is healthy` }
  })
}

export default root
