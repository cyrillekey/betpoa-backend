import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'

import { BaseController } from './BaseController'
import { FixturesQueryParams, IDefaultQueryResponse } from './interface'

class FixturesController extends BaseController {
  async getAllFixtures() {
    try {
      const body = this.body as FixturesQueryParams
      const where: Prisma.FixtureWhereInput = {
        AND: [],
      }
      if (body?.fromDate) {
        where.AND = [
          ...(where.AND as []),
          {
            date: {
              gte: dayjs(body?.fromDate).toDate(),
            },
          },
        ]
      }
      if (body?.toDate) {
        where.AND = [
          ...(where.AND as []),
          {
            date: {
              lte: dayjs(body?.fromDate).toDate(),
            },
          },
        ]
      }
      if (body?.country)
        where.AND = [
          ...(where.AND as []),
          {
            league: {
              country: {
                equals: body.country,
                mode: 'insensitive',
              },
            },
          },
        ]
      if (body?.status) {
        where.AND = [
          ...(where.AND as []),
          {
            status: body.status,
          },
        ]
      }
      if (body?.leagueIds) {
        const ids = body.leagueIds.split('-').reduce((total, a) => {
          try {
            const number = Number(a)
            if (isNaN(number)) {
              return total
            } else {
              total.push(number)
              return total
            }
          } catch (error) {
            return total
          }
        }, [] as number[])
        if (ids?.length > 0) {
          where.AND = [
            ...(where.AND as []),
            {
              leagueId: {
                in: ids,
              },
            },
          ]
        }
      }
      if (body?.teamsIds) {
        const ids = body.teamsIds.split('-').reduce((total, a) => {
          try {
            const number = Number(a)
            if (isNaN(number)) {
              return total
            } else {
              total.push(number)
              return total
            }
          } catch (error) {
            return total
          }
        }, [] as number[])
        if (ids?.length > 0) {
          where.AND = [
            ...(where.AND as []),
            {
              OR: [
                {
                  homeTeamId: {
                    in: ids,
                  },
                },
                {
                  awayTeamId: {
                    in: ids,
                  },
                },
              ],
            },
          ]
        }
      }
      const fixtures = await this.app.prisma.fixture.findMany({
        where: where,
        include: {
          homeTeam: true,
          awayTeam: true,
          odds: {
            where: {
              type: 'WINNER_FT',
            },
          },
        },
      })
      return this.res.send(<IDefaultQueryResponse>{
        id: null,
        success: true,
        message: 'Success',
        data: fixtures,
      })
    } catch (error) {
      this.app.Sentry.captureException(error)
      return this.res.status(500).send(<IDefaultQueryResponse>{
        id: null,
        success: false,
        message: 'Error! Something went wrong please try again',
        data: [],
      })
    }
  }
  async getFixtureById() {
    try {
    } catch (error) {
      this.app.Sentry.captureException(error)
      return this.res.status(500).send(<IDefaultQueryResponse>{
        id: null,
        success: false,
        message: 'Error! Something went wrong please try again',
        data: null,
      })
    }
  }
  async getFixtureResultByFixture() {
    try {
    } catch (error) {
      this.app.Sentry.captureException(error)
      return this.res.status(500).send(<IDefaultQueryResponse>{
        id: null,
        success: false,
        message: 'Error! Something went wrong please try again',
        data: null,
      })
    }
  }
  async getFixtureoddsById() {
    try {
    } catch (error) {
      this.app.Sentry.captureException(error)
      return this.res.status(500).send(<IDefaultQueryResponse>{
        id: null,
        success: false,
        message: 'Error! Something went wrong please try again',
        data: null,
      })
    }
  }
}
export default FixturesController
