import FixturesController from '@controllers/FixturesController'
import { FixtureResponse, IFixtureResults } from '@controllers/interface/fixtures'
import { isAuthorized } from '@hooks/Auth'
import { FastifyPluginAsync } from 'fastify'

const fixturesQueries: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get(
    '/',
    {
      schema: {
        summary: 'Get all fixtures',
        tags: ['Fixture'],
        description: 'Get all fixtures',
        security: [{ bearerAuth: [] }],
        response: {
          default: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              success: { type: 'boolean' },
              message: { type: 'string' },
              data: {
                type: 'array',
                items: {
                  properties: FixtureResponse,
                },
              },
            },
          },
        },
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
    async (request, reply) => {
      return await new FixturesController(fastify, request, reply).getAllFixtures()
    },
  )
  fastify.route({
    method: 'GET',
    url: '/:id',
    preHandler: isAuthorized,
    handler: (req, res) => new FixturesController(fastify, req, res).getFixtureById(),
    schema: {
      summary: 'Get fixture by Id',
      tags: ['Fixture'],
      description: 'Get Fixture by fixture id as well as teams,leagues and all associated odds',
      params: {
        id: { type: 'number' },
      },
      security: [{ bearerAuth: [] }],
      response: {
        default: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: FixtureResponse,
            },
          },
        },
      },
    },
  })
  fastify.route({
    method: 'GET',
    url: '/result/:id',
    schema: {
      tags: ['Fixture'],
      summary: 'Get fixture results',
      description: 'Get Fixture results by fixtureId',
      params: {
        id: { type: 'number', description: 'Fixture id' },
      },
      security: [{ bearerAuth: [] }],
      response: {
        default: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: IFixtureResults,
            },
          },
        },
      },
    },
    preHandler: isAuthorized,
    handler: async (req, res) => new FixturesController(fastify, req, res).getFixtureResultByFixtureId(),
  })
  fastify.route({
    method: 'GET',
    url: '/odds/:id',
    preHandler: isAuthorized,
    schema: {
      tags: ['Fixture'],
      security: [{ bearerAuth: [] }],
      summary: 'Get fixture odds',
      description: 'Get odds for a specific fixture by fixture id',
      params: {
        id: { type: 'number', description: 'fixture id' },
      },
      response: {
        default: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'array',
              items: { properties: IFixtureResults },
            },
          },
        },
      },
    },
    handler: async (req, res) => new FixturesController(fastify, req, res).getFixtureoddsById(),
  })
}

export default fixturesQueries
