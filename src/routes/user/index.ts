import { configs } from '@configs/index'
import { IDefaultResponse } from '@controllers/interface'
import { ISignUpBody, IValidateOptBody } from '@controllers/interface/user'
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
      response: {
        201: {
          description: 'Successful response',
          type: 'object',
          properties: {
            id: { type: 'number' },
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        default: {
          description: 'Default response',
          type: 'object',
          properties: {
            id: { type: 'number' },
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
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
      response: {
        200: {
          description: 'Successful response',
          type: 'object',
          properties: {
            id: { type: 'number' },
            success: { type: 'boolean' },
            message: { type: 'string' },
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                phone: { type: 'string' },
                phoneValidated: { type: 'boolean' },
                profileId: { type: 'number' },
                role: { type: 'string' },
              },
            },
          },
        },
        default: {
          description: 'Default response',
          type: 'object',
          properties: {
            id: { type: 'number' },
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
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
  fastify.route<{ Body: IValidateOptBody; Response: IDefaultResponse }>({
    method: 'POST',
    url: '/verifyUser',
    preHandler: isAuthorized,
    schema: {
      description: 'Verify user phone belongs to user using otp sent to phone',
      summary: 'Verify User Phone',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['otp'],
        properties: {
          otp: { type: 'string' },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    handler: async (req, res) => new UserController(fastify, req, res).validateOtp(),
  })
  fastify.route({
    method: 'POST',
    url: '/passwordreset',
    schema: {
      description: 'Initiate password reset to get otp to phone',
      summary: 'Initiate Password Reset',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['phone'],
        properties: {
          phone: { type: 'string' },
        },
      },
    },
    handler: async (req, res) => new UserController(fastify, req, res).requestPasswordReset(),
  })
  fastify.route({
    method: 'PUT',
    url: '/',
    preHandler: isAuthorized,
    schema: {
      description: 'Updates an authenticated  betpoa user profile',
      summary: 'Update User',
      tags: ['User'],
      security: [{ bearerAuth: [] }],

      body: {
        type: 'object',
        properties: {
          fname: { type: 'string' },
          lname: { type: 'string' },
          email: { type: 'string' },
          avatar: { type: 'object', properties: { link: { type: 'string' }, filename: { type: 'string' }, fileType: { type: 'string' } } },
        },
      },
    },
    handler: async (req, res) => new UserController(fastify, req, res).updateUser(),
  })
  fastify.route({
    method: 'PUT',
    url: 'passwordupdate',
    schema: {
      summary: 'Update User Password',
      description: 'Update user password given password reset token',
      tags: ['Auth', 'User'],
      body: {
        type: 'object',
        required: ['otp', 'password', 'phone'],
        properties: {
          otp: { type: 'string', description: 'Password reset otp' },
          password: { type: 'string', description: 'New Password' },
          phone: { type: 'string', description: 'User Phone Number' },
        },
      },
    },
    handler: async (req, res) => new UserController(fastify, req, res).updateUserPassword(),
  })
}

export default userRoutes
