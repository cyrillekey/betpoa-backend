import { getFixturesResults, getUpcomingFixturesCronjobs } from '@cronjobs/fixtures'
import { createLeaguesCronjob } from '@cronjobs/leagues'
import { CronJob } from 'cron'
import fp from 'fastify-plugin'

export default fp(async (fastify, _opts) => {
  const LeagueCron = fastify.Sentry.cron.instrumentCron(CronJob, 'get_leagues_cron')
  const UpcomingFixtureCron = fastify.Sentry.cron.instrumentCron(CronJob, 'upcoming_fixtures_cron')
  const FixturesResultsCron = fastify.Sentry.cron.instrumentCron(CronJob, 'fixtures_result_cron')
  const getLeaguesJob = new LeagueCron('15 00 1 * *', async () => await createLeaguesCronjob(fastify), null, null, 'Africa/Nairobi')
  const upcomingFixturesJob = new UpcomingFixtureCron(
    '30 00 * * *',
    async () => await getUpcomingFixturesCronjobs(fastify),
    null,
    null,
    'Africa/Nairobi',
  )
  const getFixtureResultsJob = new FixturesResultsCron('40 * * * *', async () => await getFixturesResults(fastify), null, null, 'Africa/Nairobi')

  getLeaguesJob.start()
  upcomingFixturesJob.start()
  getFixtureResultsJob.start()
  console.log('Cron Jobs Started')
  fastify.decorate('cronjobs', undefined)
})
