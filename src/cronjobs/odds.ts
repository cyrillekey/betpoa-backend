import { getDateOdds } from '@rapidapi/index'
import { Odds } from '@rapidapi/odd'
import dayjs from 'dayjs'
import { FastifyInstance } from 'fastify'

export const getFixturesOdds = async (app: FastifyInstance) => {
  const checkInId = app.Sentry.captureCheckIn(
    {
      monitorSlug: 'fixtures_odds_cron',
      status: 'in_progress',
    },
    {
      schedule: {
        // Specify your schedule options here
        type: 'crontab',
        value: '45 0 * * *',
      },
      checkinMargin: 1,
      maxRuntime: 10,
      timezone: 'Africa/Nairobi',
    },
  )
  try {
    // get next three days odds
    app.log.info('Generating odds cronjob starting')
    for (let index = 0; index < 3; index++) {
      app.log.info(`Generating odds for ${dayjs().add(index, 'day').toDate()}`)
      const oddsResponse = await getDateOdds(dayjs().add(index, 'day').toDate())

      await saveOddsToDatabase(app, oddsResponse?.odds)
      if (oddsResponse?.hasNext) {
        // loop through nex pages and get the data
        for (let index = 2; index < oddsResponse.total - 1; index++) {
          const nextOdds = await getDateOdds(dayjs().add(index, 'day').toDate(), index)
          await saveOddsToDatabase(app, nextOdds?.odds)
        }
      }
    }
    app.log.info('Generating odds cronjob finished')
    app.Sentry.captureCheckIn({ checkInId, status: 'ok', monitorSlug: 'fixtures_odds_cron' })
  } catch (error) {
    app.log.error(error)
    app.log.info('Generating odds cronjob crashed')
    app.Sentry.captureCheckIn({ checkInId, status: 'error', monitorSlug: 'fixtures_odds_cron' })
  }
}

const saveOddsToDatabase = async (app: FastifyInstance, odds: Odds[]) => {
  try {
    if (odds.length > 0) {
      const fixtures = await app.prisma.fixture.findMany({
        select: {
          fixtureId: true,
          id: true,
        },
        where: {
          fixtureId: {
            in: odds.map((a) => a?.fixture?.id),
          },
        },
      })
      const transaction: any[] = []
      fixtures.forEach((fixture) => {
        const markets = odds.find((a) => a?.fixture?.id == fixture?.fixtureId)?.bookmakers?.at(0)?.bets
        markets?.forEach((market) => {
          switch (market.name) {
            case 'Match Winner':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      type: 'WINNER_FT',
                    },
                  }),
                ),
              )
              break
            case 'Home/Away':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      type: 'HOME_OR_AWAY',
                    },
                  }),
                ),
              )
              break
            case 'Second Half Winner':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      type: 'WINNER_2HT',
                    },
                  }),
                ),
              )
              break
            case 'Goals Over/Under':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      value: a?.value.toString().slice(-3),
                      type: 'OVER_UNDER_FT',
                    },
                  }),
                ),
              )
              break
            case 'Goals Over/Under First Half':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      value: a?.value.toString().slice(-3),
                      type: 'OVER_UNDER_HT',
                    },
                  }),
                ),
              )
              break
            case 'Goals Over/Under - Second Half':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      type: 'OVER_UNDER_HT',
                    },
                  }),
                ),
              )
              break
            case 'HT/FT Double':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      value: a?.value.toString(),
                      type: 'HALFTIME_FULLTIME',
                    },
                  }),
                ),
              )
              break
            case 'Both Teams Score':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      type: 'BOTH_TEAM_SCORE',
                    },
                  }),
                ),
              )
              break
            case 'Exact Score':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      type: 'EXACT_SCORE_FT',
                    },
                  }),
                ),
              )
              break
            case 'Correct Score - First Half':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      type: 'EXACT_SCORE_HT',
                    },
                  }),
                ),
              )
              break
            case 'Double Chance':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      type: 'DOUBLE_CHANCE',
                    },
                  }),
                ),
              )
              break
            case 'First Half Winner':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      type: 'WINNER_HT',
                    },
                  }),
                ),
              )
              break
            case 'Total - Home':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      type: 'OVER_HOME',
                      value: a?.value.toString().slice(-3),
                    },
                  }),
                ),
              )
              break
            case 'Total - Away':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      type: 'OVER_AWAY',
                      value: a?.value.toString().slice(-3),
                    },
                  }),
                ),
              )
              break
            case 'Double Chance - First Half':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      type: 'OVER_AWAY',
                    },
                  }),
                ),
              )
              break
            case 'Odd/Even':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      type: 'FT_ODD_EVEN',
                    },
                  }),
                ),
              )
              break
            case 'Odd/Even - First Half':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      type: 'HALF_ODD_EVEN',
                    },
                  }),
                ),
              )
              break
            case 'Home Odd/Even':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      type: 'HOME_ODD_EVEN',
                    },
                  }),
                ),
              )
              break
            case 'Away Odd/Even':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      type: 'AWAY_ODD_EVEN',
                    },
                  }),
                ),
              )
              break
            case 'Exact Goals Number':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      type: 'TOTAL_GOALS',
                      value: a?.value?.toString(),
                    },
                  }),
                ),
              )
              break
            case 'Home Team Exact Goals Number':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      type: 'TOTAL_GOALS_HOME',
                      value: a?.value?.toString(),
                    },
                  }),
                ),
              )
              break
            case 'Away Team Exact Goals Number':
              transaction.push(
                ...market.values.map((a) =>
                  app.prisma.odds.create({
                    data: {
                      fixtureId: fixture?.id,
                      name: a?.value.toString(),
                      odd: Number(a?.odd),
                      type: 'TOTAL_GOALS_AWAY',
                      value: a?.value?.toString(),
                    },
                  }),
                ),
              )
              break
            default:
              break
          }
        })
      })
      await app.prisma.$transaction(transaction)
    }
  } catch (error) {
    app.Sentry.captureException(error)
    app.log.error(error)
  }
}
