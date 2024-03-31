import 'module-alias/register'

import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import Sentry from '@immobiliarelabs/fastify-sentry'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify'
import { join } from 'path'
export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {}

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
  // Place here your custom code!
  fastify.withTypeProvider<TypeBoxTypeProvider>()
  // Do not touch the following lines
  fastify.register(Sentry, {
    dsn: 'https://17fd5490b09d30a0890df64a9cbbb0c2@o4504167984136192.ingest.us.sentry.io/4507005968711680',
    integrations: [nodeProfilingIntegration()],
  })
  fastify.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Betpoa Documentation',
        description: 'Betpoa Betting Rest Api Documentation',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:5000',
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  })
  fastify.register(swaggerUi, {
    routePrefix: '/api/documentation',
  })

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts,
  })
}

export default app
export { app, options }