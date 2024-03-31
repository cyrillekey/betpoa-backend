import { CronJob } from 'cron'
import fp from 'fastify-plugin'

import { createLeaguesCronjob } from '../cronjobs/leagues'
export default fp(async (fastify, _opts) => {
  const getLeaguesJob = new CronJob('45 00 1 * *', async () => await createLeaguesCronjob(fastify))
  getLeaguesJob.start()
  console.log('Cron Jobs Started')
  fastify.decorate('cronjobs', undefined)
})
