import { getLeagues } from '@rapidapi/index'
import { FastifyInstance } from 'fastify'

export const createLeaguesCronjob = async (app: FastifyInstance) => {
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
  } catch (error) {
    app.Sentry.captureException(error)
  }
}
