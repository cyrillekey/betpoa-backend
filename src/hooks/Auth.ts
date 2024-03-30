import { FastifyInstance, FastifyRequest } from 'fastify'

export async function isAuthorized(app: FastifyInstance, req: FastifyRequest) {
  try {
    const auth = req.headers.authorization
    if (!auth) {
      return false
    }
    // const token = auth.split(' ')[0] === 'Bearer' ? auth.split(' ')[1] : auth;
  } catch (error) {
    return false
  }
}
