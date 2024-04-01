import { getLeagues } from '@rapidapi/index'
import { FastifyInstance } from 'fastify'

export const createLeaguesCronjob = async (app: FastifyInstance) => {
  const checkInId = app.Sentry.captureCheckIn(
    {
      monitorSlug: 'get_leagues',
      status: 'in_progress',
    },
    {
      schedule: {
        // Specify your schedule options here
        type: 'crontab',
        value: '30 00 * * *',
      },
      checkinMargin: 1,
      maxRuntime: 1,
      timezone: 'Africa/Nairobi',
    },
  )
  try {
    const leagues = await getLeagues()
    await app.prisma.league.createMany({
      data: leagues.map((a) => ({
        country: a?.country?.name,
        leagueId: a?.league?.id,
        logo: a?.league?.logo,
        name: a?.league?.name,
        type: a?.league?.type,
        season: a?.seasons?.at(0)?.year?.toString() ?? '',
      })),
      skipDuplicates: true,
    })
    app.Sentry.captureCheckIn({ checkInId, monitorSlug: 'get_leagues', status: 'ok' })
  } catch (error) {
    app.Sentry.captureException(error)
    app.Sentry.captureCheckIn({ checkInId, monitorSlug: 'get_leagues', status: 'error' })
  }
}
