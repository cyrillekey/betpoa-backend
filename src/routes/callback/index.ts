import MpesaController from '@controllers/MpesaController'
import { FastifyPluginAsync } from 'fastify'

const callbackRoutes: FastifyPluginAsync = async (fastity, _opts): Promise<void> => {
  fastity.route({
    method: 'POST',
    url: '/mobile/deposit',
    schema: {
      hide: true,
    },
    handler: async (req, res) => await new MpesaController(fastity, req, res).handleMpesaDepositCallback(),
  })
}
export default callbackRoutes
