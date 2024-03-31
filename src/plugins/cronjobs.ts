import { getFixturesResults, getUpcomingFixturesCronjobs } from '@cronjobs/fixtures'
import { createLeaguesCronjob } from '@cronjobs/leagues'
import { CronJob } from 'cron'
import fp from 'fastify-plugin'

export default fp(async (fastify, _opts) => {
  const getLeaguesJob = new CronJob('15 00 1 * *', async () => await createLeaguesCronjob(fastify))
  const upcomingFixturesJob = new CronJob('30 00 * * *', async () => await getUpcomingFixturesCronjobs(fastify))
  const getFixtureResultsJob = new CronJob('40 * * * *', async () => await getFixturesResults(fastify))

  getLeaguesJob.start()
  upcomingFixturesJob.start()
  getFixtureResultsJob.start()
  console.log('Cron Jobs Started')
  fastify.decorate('cronjobs', undefined)
})
