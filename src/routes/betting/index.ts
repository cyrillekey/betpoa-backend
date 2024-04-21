import BettingController from '@controllers/BettingController'
import { BetMarketOddsReponse, BetResponseBody, ErrorResponses, IPlaceBetInput, ISuccessResponse } from '@controllers/interface/response'
import { isAuthorized } from '@hooks/Auth'
import { BETSTATUS } from '@prisma/client'
import { FastifyPluginAsync } from 'fastify'

const bettingRoute: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.route({
    method: 'POST',
    url: '/',
    preHandler: isAuthorized,
    schema: {
      summary: 'Place Bet',
      description: 'Customer place bet for the currently logged in user',
      tags: ['Bet'],
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['data', 'amount'],
        properties: {
          amount: { type: 'number' },
          data: {
            type: 'array',

            items: { properties: IPlaceBetInput, type: 'object', required: ['fixtureId', 'oddsId', 'pick'] },
          },
        },
      },
      response: {
        200: {
          type: 'object',
          description: 'SuccessReponse',
          properties: ISuccessResponse,
        },
        default: {
          type: 'object',
          description: 'SuccessReponse',
          properties: ISuccessResponse,
        },
        ...ErrorResponses,
      },
    },
    handler: async (req, res) => await new BettingController(fastify, req, res).placeBet(),
  })
  fastify.route({
    method: 'DELETE',
    url: '/:id',
    preHandler: isAuthorized,
    schema: {
      summary: 'Cancel Bet',
      description: 'Cancel customer placed bet if bet is within the allowed cancellation window for the currently logged in user',
      tags: ['Bet'],
      params: {
        id: { type: 'number' },
      },
      response: {
        200: {
          type: 'object',
          description: 'SuccessReponse',
          properties: ISuccessResponse,
        },
        default: {
          type: 'object',
          description: 'SuccessReponse',
          properties: ISuccessResponse,
        },
        ...ErrorResponses,
      },
    },
    handler: async (req, res) => await new BettingController(fastify, req, res).cancelBet(),
  })
  fastify.route({
    method: 'GET',
    url: '/',
    preHandler: isAuthorized,
    schema: {
      summary: 'Customer bets',
      description: 'Get all placed bet for the currently logged in user',
      tags: ['Bet'],
      querystring: {
        from: { type: 'string' },
        to: { type: 'string' },
        status: { type: 'array', items: { type: 'string', enum: ['WON', 'LOST', 'VOID', 'PENDING', 'CANCELLED'] satisfies BETSTATUS[] } },
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          description: 'SuccessReponse',
          properties: { ...ISuccessResponse, data: { type: 'array', items: { type: 'object', properties: BetResponseBody } } },
        },
        default: {
          type: 'object',
          description: 'SuccessReponse',
          properties: { ...ISuccessResponse, data: { type: 'array', items: { type: 'object', properties: BetResponseBody } } },
        },
        ...ErrorResponses,
      },
    },
    handler: async (req, res) => await new BettingController(fastify, req, res).getGets(),
  })
  fastify.route({
    method: 'GET',
    url: '/:id',
    preHandler: isAuthorized,
    schema: {
      summary: 'Customer single bet',
      description: 'Get single customer bet by bet id',
      tags: ['Bet'],
      params: {
        id: { type: 'number' },
      },
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          description: 'SuccessReponse',
          properties: { ...ISuccessResponse, data: { type: 'object', properties: BetResponseBody } },
        },
        default: {
          type: 'object',
          description: 'SuccessReponse',
          properties: { ...ISuccessResponse, data: { type: 'object', properties: BetResponseBody } },
        },
        ...ErrorResponses,
      },
    },
    handler: async (req, res) => await new BettingController(fastify, req, res).getBet(),
  })
  fastify.route({
    method: 'GET',
    url: '/:id/items',
    preHandler: isAuthorized,
    schema: {
      tags: ['Bet'],
      summary: 'Bet Items',
      description: 'Get all items in a placed bet',
      security: [{ bearerAuth: [] }],
      params: {
        id: { type: 'number' },
      },
      response: {
        200: {
          type: 'object',
          description: 'SuccessReponse',
          properties: { ...ISuccessResponse, data: { type: 'array', items: { type: 'object', properties: BetMarketOddsReponse } } },
        },
        default: {
          type: 'object',
          description: 'SuccessReponse',
          properties: { ...ISuccessResponse, data: { type: 'array', items: { type: 'object', properties: BetMarketOddsReponse } } },
        },
        ...ErrorResponses,
      },
    },
    handler: async (req, res) => await new BettingController(fastify, req, res).getBetItems(),
  })
}
export default bettingRoute
