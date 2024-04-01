import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'

import { FixturesQueryParams, IDefaultQueryResponse } from './interface/fixtures'
import { BaseController } from './BaseController'

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
          league: true,
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
      const id = Number((this.req.params as Record<string, any>)?.id)
      const fixture = await this.app.prisma.fixture.findUnique({
        where: {
          id: id,
        },
        include: {
          homeTeam: true,
          awayTeam: true,
          odds: true,
          league: true,
        },
      })
      return this.res.send(<IDefaultQueryResponse>{
        id: null,
        success: true,
        message: 'Success!',
        data: fixture,
      })
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
  async getFixtureResultByFixtureId() {
    try {
      const id = Number((this.req.params as Record<string, any>)?.id)
      const fixture = await this.app.prisma.fixtureResult.findUnique({
        where: {
          id: id,
        },
      })
      return this.res.send(<IDefaultQueryResponse>{
        id: fixture?.id,
        success: true,
        message: 'Success!',
        data: fixture,
      })
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
      const id = Number((this.req.params as Record<string, any>)?.id)
      const odds = await this.app.prisma.odds.findMany({
        where: {
          fixtureId: id,
        },
      })
      return this.res.send(<IDefaultQueryResponse>{
        id: null,
        data: odds,
        success: true,
        message: 'Success',
      })
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