import { ILeagueResponseBody } from '@controllers/interface/fixtures'
import LeagueController from '@controllers/LeagueController'
import { isAuthorized } from '@hooks/Auth'
import { FastifyPluginAsync } from 'fastify'

const leaguesQueries: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.route({
    url: '/',
    method: 'GET',
    schema: {
      summary: 'Get Leagues',
      description: 'Get all active leagues',
      tags: ['League'],
      params: {
        pageSize: { type: 'number' },
        page: { type: 'number' },
        year: { type: 'string' },
        country: { type: 'string' },
      },
      security: [{ bearerAuth: [] }],
      response: {
        default: {
          description: 'Default response',
          type: 'object',
          properties: {
            id: { type: 'number' },
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'array',
              items: {
                properties: ILeagueResponseBody,
              },
            },
          },
        },
      },
    },
    preHandler: isAuthorized,
    handler: async (req, res) => await new LeagueController(fastify, req, res).getAllLeagues(),
  })
  fastify.route({
    url: '/:id',
    method: 'GET',
    schema: {
      security: [{ bearerAuth: [] }],
      description: 'Get Single League by league id',
      tags: ['League'],
      summary: 'Get League',
      params: {
        id: { type: 'number' },
      },
      response: {
        default: {
          description: 'Default response',
          type: 'object',
          properties: {
            id: { type: 'number' },
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: ILeagueResponseBody,
            },
          },
        },
      },
    },
    preHandler: isAuthorized,
    handler: async (req, res) => await new LeagueController(fastify, req, res).getleague(),
  })
}
export default leaguesQueries
