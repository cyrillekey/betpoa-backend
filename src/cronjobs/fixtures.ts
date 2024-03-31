import { MATCHSTATUS } from '@prisma/client'
import { getFixtures, getUpcomingFixtures } from '@rapidapi/index'
import dayjs from 'dayjs'
import { FastifyInstance } from 'fastify'

export const getUpcomingFixturesCronjobs = async (app: FastifyInstance) => {
  const checkInId = app.Sentry.captureCheckIn(
    {
      monitorSlug: 'upcoming_fixtures',
      status: 'in_progress',
    },
    {
      schedule: {
        // Specify your schedule options here
        type: 'crontab',
        value: '* * * * *',
      },
      checkinMargin: 1,
      maxRuntime: 1,
      timezone: 'America/Los_Angeles',
    },
  )
  try {
    for (let index = 0; index < 3; index++) {
      const fixtures = await getUpcomingFixtures(dayjs().add(index, 'day').toDate())
      const allTeams = fixtures
        .map((a) => {
          if (a?.teams?.home && a?.teams?.away) return [a?.teams?.away, a?.teams.home]
          return []
        })
        .flat()
      const teamIds = [...new Set(allTeams?.map((a) => a?.id))]
      const teams = teamIds.map((a) => allTeams.find((b) => b?.id == a))
      await app.prisma.team.createMany({
        skipDuplicates: true,
        data: teams?.map((a) => ({
          teamId: a!.id,
          code: a!.name,
          logo: a!.logo,
          name: a!.name,
          venue: '',
        })),
      })
      await app.prisma.fixture.createMany({
        data: fixtures
          .filter((a) => a?.teams?.away && a?.teams?.home)
          .map((a) => ({
            fixtureId: a?.fixture?.id,
            awayTeamId: a?.teams?.away?.id,
            homeTeamId: a?.teams?.home?.id,
            date: a?.fixture?.date,
            leagueId: a?.league?.id,
            referee: a?.fixture?.referee,
            shortStatus: a?.fixture?.status?.short,
            status: getFixtureStatus(a!.fixture!.status!.short!),
          })),
      })
    }
    app.Sentry.captureCheckIn({ checkInId, monitorSlug: 'upcoming_fixtures', status: 'ok' })
  } catch (error) {
    app.Sentry.captureException(error)
    app.Sentry.captureCheckIn({ checkInId, monitorSlug: 'upcoming_fixtures', status: 'error' })
  }
}

export const getFixturesResults = async (app: FastifyInstance) => {
  try {
    const fixtures = await app.prisma.fixture.findMany({
      select: {
        fixtureId: true,
      },
      where: {
        status: 'INPLAY',
      },
    })
    const pages = Math.floor(fixtures?.length / 2)
    for (let index = 0; index < pages; index++) {
      const ids = fixtures.slice(index * 20 + index * 20 + 20).map((a) => a?.fixtureId.toString())
      const results = await getFixtures(ids)
      const transactions = results.map((a) =>
        app.prisma.fixtureResult.upsert({
          where: {
            fixtureId: a?.fixture?.id,
          },
          create: {
            awayGoals: a?.score?.fulltime?.away,
            homeGoals: a?.score?.fulltime?.home,
            extraAwayGoals: a?.score?.extratime?.away,
            extraHomeGoals: a?.score?.extratime?.home,
            htAwayGoals: a?.score?.halftime?.away,
            htHomeGoals: a?.score?.halftime?.home,
            fixtureId: a?.fixture?.id,
          },
          update: {
            awayGoals: a?.score?.fulltime?.away,
            homeGoals: a?.score?.fulltime?.home,
            extraAwayGoals: a?.score?.extratime?.away,
            extraHomeGoals: a?.score?.extratime?.home,
            htAwayGoals: a?.score?.halftime?.away,
            htHomeGoals: a?.score?.halftime?.home,
          },
        }),
      )
      await app.prisma.$transaction(transactions)
    }
  } catch (error) {
    app.Sentry.captureException(error)
  }
}

const getFixtureStatus = (status: string): MATCHSTATUS => {
  switch (status) {
    case 'TBD':
    case 'NS':
      return 'UPCOMMING'
    case '1H':
    case 'HT':
    case '2H':
    case 'ET':
    case 'BT':
    case 'P':
    case 'INT':
    case 'LIVE':
      return 'INPLAY'
    case 'FT':
    case 'AET':
    case 'PEN':
      return 'FINISHED'
    case 'SUSP':
    case 'PST':
    case 'CANC':
    case 'ABD':
    case 'WO':
    case 'AWD':
      return 'ABANDONED'
    default:
      return 'CANCELLED'
  }
}
