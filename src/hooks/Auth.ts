import { User } from '@prisma/client'
import { FastifyReply, FastifyRequest } from 'fastify'

export async function isAuthorized(req: FastifyRequest, res: FastifyReply) {
  try {
    const auth = req.headers.authorization

    if (!auth) {
      return res.status(401).send({
        id: null,
        success: false,
        message: 'Not Authorized',
      })
    }
    const token = auth.split(' ')[0] === 'Bearer' ? auth.split(' ')[1] : auth
    const userJwt = req.server.helpers.jwt.verify(token)
    if (!userJwt)
      return res.status(401).send({
        id: null,
        success: false,
        message: 'Not Authorized',
      })
    if (userJwt) {
      const user = await req.server.prisma.user.findUnique({
        where: {
          id: userJwt?.id,
        },
      })
      if (!user) {
        return res.status(401).send({
          id: null,
          success: false,
          message: 'Not Authorized',
        })
      }
      if (user) req.user = user
      return true
    }

    return false
  } catch (error) {
    req.server.Sentry.captureException(error)
    return res.status(401).send({
      id: null,
      success: false,
      message: 'Not Authorized',
    })
  }
}
export async function isAdmin(req: FastifyRequest, res: FastifyReply) {
  try {
    const auth = req.headers.authorization

    if (!auth) {
      return res.status(401).send({
        id: null,
        success: false,
        message: 'Not Authorized',
      })
    }
    const token = auth.split(' ')[0] === 'Bearer' ? auth.split(' ')[1] : auth
    const userJwt = req.server.helpers.jwt.verify(token)
    if (!userJwt)
      return res.status(401).send({
        id: null,
        success: false,
        message: 'Not Authorized',
      })
    if (userJwt) {
      const user = await req.server.prisma.user.findUnique({
        where: {
          id: userJwt?.id,
        },
      })
      if (!user || user.role != 'ADMIN') {
        return res.status(401).send({
          id: null,
          success: false,
          message: 'Not Authorized',
        })
      }

      if (user) req.user = user
      return true
    }

    return false
  } catch (error) {
    req.server.Sentry.captureException(error)
    return res.status(401).send({
      id: null,
      success: false,
      message: 'Not Authorized',
    })
  }
}

declare module 'fastify' {
  export interface FastifyRequest {
    user: User
  }
}
