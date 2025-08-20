import { getUpcomingFixtures } from '@rapidapi/index'
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
        value: '30 03 * * *',
      },
      checkinMargin: 1,
      maxRuntime: 10,
      timezone: 'Africa/Nairobi',
    },
  )

  try {
    for (let index = 0; index < 3; index++) {
      app.log.info(`Genetating fixtures for ${dayjs().add(index, 'day').toDate()}`)
      try {
        const fixtures = await getUpcomingFixtures(dayjs().add(index, 'day').toDate())
        const leagues = fixtures.map((a) => a?.league)
        await app.prisma.league.createMany({
          skipDuplicates: true,
          data: leagues.map((a) => ({
            country: a?.name,
            leagueId: a?.id,
            logo: a?.logo ?? 'https://res.cloudinary.com/ddia14anf/image/upload/v1755687520/football_lqmdwv.png',
            name: a?.name,
            type: 'League',
            id: a.id,
            season: a.season.toString(),
          })),
        })
        const allTeams = fixtures
          .map((a) => {
            return [a?.homeTeam, a.awayTeam]
          })
          .flat()

        const teamIds = [...new Set(allTeams?.map((a) => a?.id))]
        const teams = teamIds.map((a) => allTeams.find((b) => b?.id == a))

        await app.prisma.team.createMany({
          skipDuplicates: true,
          data: teams?.map((a) => ({
            teamId: a!.id,
            code: a!.name,
            logo: a?.logo ?? 'https://res.cloudinary.com/ddia14anf/image/upload/v1755687520/football_lqmdwv.png',
            name: a!.name,
            venue: '',
            id: a?.id,
          })),
        })
        await app.prisma.fixture.createMany({
          skipDuplicates: true,
          data: fixtures.map((a) => ({
            fixtureId: a?.id,
            awayTeamId: a.awayTeam.id,
            homeTeamId: a.homeTeam.id,
            date: a?.date,
            leagueId: a?.league?.id,
            referee: 'N/A',
            shortStatus: '',
            status: 'UPCOMMING',
          })),
        })

        app.log.info(`Genetating fixtures for ${dayjs().add(index, 'day').toDate()}`)
      } catch (error) {
        app.Sentry.captureException(error)
        app.log.error(error)
      }
    }
    app.Sentry.captureCheckIn({ checkInId, monitorSlug: 'upcoming_fixtures_cron', status: 'ok' })
    app.log.info(`Finished generating fixtures `)
  } catch (error) {
    app.Sentry.captureException(error, { level: 'fatal' })
    app.log.error(error)
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
        value: '*/20 * * * *',
      },
      checkinMargin: 1,
      maxRuntime: 10,
      timezone: 'Africa/Nairobi',
    },
  )
  try {
    // get results today
    await generateResults(app, dayjs().toDate())
    // get results for last night if cronjob runs a few minutes past midnight

    const endDate = dayjs().startOf('day').add(150, 'minutes').toDate()
    if (dayjs().isBefore(endDate)) {
      await generateResults(app, dayjs().subtract(1, 'day').toDate())
    } //
  } catch (error) {
    app.Sentry.captureException(error)

    app.Sentry.captureCheckIn({ checkInId, monitorSlug: 'fixtures_result_cron', status: 'error' })
  }
}

// const getFixtureStatus = (status: string): MATCHSTATUS => {
//   switch (status) {
//     case 'TBD':
//     case 'NS':
//       return 'UPCOMMING'
//     case '1H':
//     case 'HT':
//     case '2H':
//     case 'ET':
//     case 'BT':
//     case 'P':
//     case 'INT':
//     case 'LIVE':
//       return 'INPLAY'
//     case 'FT':
//     case 'AET':
//     case 'PEN':
//       return 'FINISHED'
//     case 'SUSP':
//     case 'PST':
//     case 'CANC':
//     case 'ABD':
//     case 'WO':
//     case 'AWD':
//       return 'ABANDONED'
//     default:
//       return 'CANCELLED'
//   }
// }
async function generateResults(_app: FastifyInstance, _date: Date) {
  // const resultsToday = await getUpcomingFixtures(date)
  // const fixtureIds = resultsToday.map((a) => a?.fixture?.id)
  // const results = await app.prisma.fixtureResult.findMany({
  //   where: {
  //     fixture: {
  //       fixtureId: {
  //         in: fixtureIds,
  //       },
  //     },
  //   },
  //   select: {
  //     fixture: {
  //       select: {
  //         fixtureId: true,
  //         id: true,
  //       },
  //     },
  //   },
  // })
  // for (let index = 0; index < results.length; index++) {
  //   const result = resultsToday.find((a) => a?.fixture?.id == results[index]?.fixture?.fixtureId)
  //   await app.prisma.fixtureResult.update({
  //     where: {
  //       fixtureId: results[index]?.fixture?.id,
  //     },
  //     data: {
  //       awayGoals: result?.score?.fulltime?.away,
  //       homeGoals: result?.score?.fulltime?.home,
  //       extraAwayGoals: result?.score?.extratime?.away,
  //       extraHomeGoals: result?.score?.extratime?.home,
  //       htAwayGoals: result?.score?.halftime?.away,
  //       htHomeGoals: result?.score?.halftime?.home,
  //       fixture: {
  //         update: {
  //           status: getFixtureStatus(result?.fixture?.status?.short ?? 'NP'),
  //           shortStatus: result?.fixture?.status?.short,
  //         },
  //       },
  //     },
  //   })
  // }
}
