// Read the .env file.
import 'module-alias/register'

import * as dotenv from 'dotenv'

import fastifyApp from './app'
dotenv.config()

// Require the framework
// Require library to exit fastify process, gracefully (if possible)
import closeWithGrace from 'close-with-grace'
import Fastify from 'fastify'

// Instantiate Fastify with some config
const app = Fastify({
  logger: true,
})

// Register your application as a normal plugin.
app.register(fastifyApp)

// delay is the number of milliseconds for the graceful close to finish
closeWithGrace({ delay: parseInt(process.env.FASTIFY_CLOSE_GRACE_DELAY!) || 500 }, async function ({ err }) {
  if (err) {
    app.log.error(err)
  }
  await app.close()
} as closeWithGrace.CloseWithGraceAsyncCallback)

// Start listening.
app.listen({ port: parseInt(process.env.PORT!) || 3000 }, (err: any) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
