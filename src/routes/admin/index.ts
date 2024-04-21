import { configs } from '@configs/index'
import { isAdmin } from '@hooks/Auth'
import { FastifyInstance, FastifyPluginAsync } from 'fastify'

const adminRoute: FastifyPluginAsync = async (fastify: FastifyInstance): Promise<void> => {
  fastify.get(
    '/users',
    {
      preHandler: isAdmin,
      schema: {
        summary: 'Users',
        description: `Get app ${configs.appname} users and user status`,
        security: [{ bearerAuth: [] }],
        tags: ['Admin'],
      },
    },
    (_req, _res) => {},
  )
  fastify.post(
    '/user/:id',
    {
      preHandler: isAdmin,
      schema: {
        summary: 'Get user',
        security: [{ bearerAuth: [] }],
        tags: ['Admin'],
        description: `Get single ${configs.appname} user`,
      },
    },
    (_req, _res) => {},
  )
  fastify.put('/user/:id', {}, (_req, _res) => {})
  fastify.delete('/user/:id', {}, (_req, _res) => {})
}
export default adminRoute
