import { getLeagueOdds } from '@rapidapi/index'
import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get('/', async function (_request, _reply) {
    const odds = await getLeagueOdds(new Date())
    console.log(JSON.stringify(odds?.at(0)))
    return { root: true }
  })
}

export default root
