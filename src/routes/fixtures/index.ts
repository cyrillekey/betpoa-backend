import { isAuthorized } from '@hooks/Auth'
import { FastifyPluginAsync } from 'fastify'

const fixturesQueries: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get(
    '/',
    {
      schema: {
        summary: 'Get All Fixtures',
        tags: ['Fixtures'],
        description: 'Get all fixtures',
        security: [{ bearerAuth: [] }],
        querystring: {
          fromDate: { type: 'string' },
          toDate: { type: 'string' },
          pageSize: { type: 'number' },
          page: { type: 'number' },
          leagueIds: { type: 'string', description: 'League ids separated by dash. E.g 1-2-3-4' },
          country: { type: 'string' },
          teamsId: { type: 'string', description: 'Team ids separated by dash. E.g 1-2-3-4' },
          status: { type: 'string', enum: ['FINISHED', 'UPCOMMING', 'ABANDONED', 'INPLAY', 'CANCELLED'] },
        },
      },
      preHandler: isAuthorized,
    },
    async function (_request, _reply) {
      //
    },
  )
}

export default fixturesQueries
