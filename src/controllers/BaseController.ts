import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export abstract class BaseController {
  /**
   * Fastify application instance
   *
   * @protected
   * @type {FastifyInstance}
   * @memberof Controller
   */
  protected app: FastifyInstance

  /**
   * Incoming request body object
   *
   * @protected
   * @type {any}
   * @memberof Controller
   */
  protected body: any

  /**
   * Incoming request object
   *
   * @protected
   * @type {FastifyRequest}
   * @memberof Controller
   */
  protected req: FastifyRequest

  /**
   * Outgoing response object
   *
   * @protected
   * @type {FastifyReply}
   * @memberof Controller
   */
  protected res: FastifyReply

  constructor(app: FastifyInstance, req: FastifyRequest, res: FastifyReply) {
    this.app = app
    this.body = req.body
    this.req = req
    this.res = res
  }
}
