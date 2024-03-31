import { getUpcomingFixturesCronjobs } from '@cronjobs/fixtures'
import { createLeaguesCronjob } from '@cronjobs/leagues'
import { CronJob } from 'cron'
import fp from 'fastify-plugin'

export default fp(async (fastify, _opts) => {
  const getLeaguesJob = new CronJob('15 00 1 * *', async () => await createLeaguesCronjob(fastify))
  const upcomingFixtures = new CronJob('30 00 * * *', async () => await getUpcomingFixturesCronjobs(fastify))
  getLeaguesJob.start()
  upcomingFixtures.start()
  console.log('Cron Jobs Started')
  fastify.decorate('cronjobs', undefined)
})
