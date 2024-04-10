import 'module-alias/register'

import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import swagger from '@fastify/swagger'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import Sentry from '@immobiliarelabs/fastify-sentry'
// @ts-ignore
import scalarDocumentation from '@scalar/fastify-api-reference'
import { nodeProfilingIntegration } from '@sentry/profiling-node'
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify'
import { join } from 'path'

import { configs } from './configs'

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {}

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
  // Place here your custom code!
  fastify.withTypeProvider<TypeBoxTypeProvider>()
  // Do not touch the following lines
  fastify.register(Sentry, {
    dsn: 'https://921097d6a76bab89051f3a2d7433fa20@o4507057833902080.ingest.us.sentry.io/4507057837506560',
    integrations: [nodeProfilingIntegration()],
    enabled: process.env.NODE_ENV == 'production',
    tracesSampleRate: 0.3,
    enableTracing: true,
    release: '1.0.0',
  })
  // fastify.register(fastifyHtml)

  fastify.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Betpoa Documentation',
        description: 'Betpoa Betting Rest Api Documentation',
        version: '1.0.0',
        contact: { email: 'cyrilleotieno7@gmail.com' },
        summary: 'Betpoa backend rest api',
      },
      tags: [
        {
          name: 'Auth',
          description: 'Betpoa authentication methods covering signup to password reset',
        },
        {
          name: 'User',
          description: 'Betpoa methods that interact with the user object',
        },
        {
          name: 'League',
          description: 'Betpoa leagues for for different seasons and competitions which fixtures and odds are available',
        },
        {
          name: 'Fixture',
          description:
            'Betpoa match fixtures for past and upcoming fixtures as well as fixture results and fixture odds.\n All fixtures and odds are updated everyday at midnight and future fixtures are available upto 3 days',
        },
      ],
      servers: [
        {
          url: configs.apiurl,
          description: 'Production server',
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
  fastify.register(scalarDocumentation, {
    routePrefix: '/api/documentation',
    configuration: {
      spec: {
        content: () => fastify.swagger(),
      },
    },
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
