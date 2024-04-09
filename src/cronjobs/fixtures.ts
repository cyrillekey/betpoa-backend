import { MATCHSTATUS } from '@prisma/client'
import { getFixtures, getUpcomingFixtures } from '@rapidapi/index'
import dayjs from 'dayjs'
import { FastifyInstance } from 'fastify'

export const getUpcomingFixturesCronjobs = async (app: FastifyInstance) => {
  const checkInId = app.Sentry.captureCheckIn(
    {
      monitorSlug: 'upcoming_fixtures_cron',
      status: 'in_progress',
    },
    {
      schedule: {
        // Specify your schedule options here
        type: 'crontab',
        value: '30 00 * * *',
      },
      checkinMargin: 1,
      maxRuntime: 10,
      timezone: 'Africa/Nairobi',
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
          id: a?.id,
        })),
      })
      const fixturesTransaction: any[] = []
      fixtures
        .filter((a) => a?.teams?.away && a?.teams?.home)
        .forEach((a) =>
          fixturesTransaction.push(
            app.prisma.fixture.create({
              data: {
                fixtureId: a?.fixture?.id,
                awayTeamId: a?.teams?.away?.id,
                homeTeamId: a?.teams?.home?.id,
                date: a?.fixture?.date,
                leagueId: a?.league?.id,
                referee: a?.fixture?.referee ?? 'N/A',
                shortStatus: a?.fixture?.status?.short,
                status: getFixtureStatus(a!.fixture!.status!.short!),
                result: {
                  create: {
                    awayGoals: a?.score?.fulltime?.away,
                    homeGoals: a?.score?.fulltime?.home,
                    htAwayGoals: a?.score?.halftime?.away,
                    htHomeGoals: a?.score?.halftime?.home,
                    extraAwayGoals: a?.score?.extratime?.away,
                    extraHomeGoals: a?.score?.extratime?.home,
                  },
                },
              },
            }),
          ),
        )
      await app.prisma.$transaction(fixturesTransaction)
    }
    app.Sentry.captureCheckIn({ checkInId, monitorSlug: 'upcoming_fixtures_cron', status: 'ok' })
  } catch (error) {
    app.Sentry.captureException(error, { level: 'fatal' })
    console.log(error)
    app.Sentry.captureCheckIn({ checkInId, monitorSlug: 'upcoming_fixtures_cron', status: 'error' })
  }
}

export const getFixturesResults = async (app: FastifyInstance) => {
  const checkInId = app.Sentry.captureCheckIn(
    {
      monitorSlug: 'fixtures_result_cron',
      status: 'in_progress',
    },
    {
      schedule: {
        // Specify your schedule options here
        type: 'crontab',
        value: '40 * * * *',
      },
      checkinMargin: 1,
      maxRuntime: 10,
      timezone: 'Africa/Nairobi',
    },
  )
  try {
    const fixtures = await app.prisma.fixture.findMany({
      select: {
        fixtureId: true,
      },
      where: {
        status: {
          notIn: ['ABANDONED', 'CANCELLED', 'FINISHED'],
        },
        date: {
          lte: dayjs().add(10, 'minutes').toDate(),
        },
      },
    })
    const pages = Math.floor(fixtures?.length / 2)
    for (let index = 0; index < pages; index++) {
      const ids = fixtures.slice(index * 20 + index * 20 + 20).map((a) => a?.fixtureId.toString())
      const results = await getFixtures(ids)
      const transactions = results.map((a) =>
        app.prisma.fixtureResult.update({
          where: {
            fixtureId: a?.fixture?.id,
          },
          data: {
            awayGoals: a?.score?.fulltime?.away,
            homeGoals: a?.score?.fulltime?.home,
            extraAwayGoals: a?.score?.extratime?.away,
            extraHomeGoals: a?.score?.extratime?.home,
            htAwayGoals: a?.score?.halftime?.away,
            htHomeGoals: a?.score?.halftime?.home,
            fixture: {
              update: {
                status: getFixtureStatus(a.fixture?.status?.short),
                shortStatus: a?.fixture?.status?.short,
              },
            },
          },
        }),
      )
      await app.prisma.$transaction(transactions)
    }
    app.Sentry.captureCheckIn({ checkInId, monitorSlug: 'fixtures_result_cron', status: 'ok' })
  } catch (error) {
    app.Sentry.captureException(error)
    console.log(error)
    app.Sentry.captureCheckIn({ checkInId, monitorSlug: 'fixtures_result_cron', status: 'error' })
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
