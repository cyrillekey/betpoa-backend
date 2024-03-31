import { configs } from '@configs/index'
import { ISignUpBody } from '@controllers/interface/user'
import { UserController } from '@controllers/UserController'
import { isAuthorized } from '@hooks/Auth'
import { FastifyPluginAsync } from 'fastify'

const userRoutes: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.route<{
    Body: ISignUpBody
  }>({
    method: 'POST',
    url: '/signup',
    schema: {
      description: `Signup User to ${configs.appname}`,
      tags: ['Auth'],
      summary: 'Signup user',
      body: {
        type: 'object',
        required: ['phone', 'password'],
        properties: {
          phone: { type: 'string' },
          password: { type: 'string' },
        },
      },
    },
    handler: async (req, res) => {
      await new UserController(fastify, req, res).signupCustomer()
    },
  })
  fastify.route({
    method: 'POST',
    url: '/login',
    schema: {
      description: `Login to ${configs.appname}`,
      summary: 'Login',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['phone', 'password'],
        properties: {
          phone: { type: 'string' },
          password: { type: 'string' },
        },
      },
    },
    handler: async (req, res) => {
      await new UserController(fastify, req, res).loginUser()
    },
  })
  fastify.route({
    method: 'POST',
    url: '/otp',
    preHandler: isAuthorized,

    schema: {
      description: `Request Otp for phone verification`,
      summary: 'Request Phone Otp',
      tags: ['Auth'],
      security: [{ bearerAuth: [] }],
    },
    handler: async (req, res) => new UserController(fastify, req, res).requestPhoneOtp(),
  })
}

export default userRoutes
