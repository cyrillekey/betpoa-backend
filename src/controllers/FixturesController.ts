import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'

import { FixturesQueryParams, IDefaultQueryResponse } from './interface/fixtures'
import { BaseController } from './BaseController'

class FixturesController extends BaseController {
  async getAllFixtures() {
    try {
      const body = this.req.query as FixturesQueryParams

      const where: Prisma.FixtureWhereInput = {
        AND: [
          {
            date: {
              gte: dayjs().subtract(90, 'minutes').toDate(),
            },
          },
        ],
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
      const take: number = isNaN(Number(body?.pageSize)) ? 100 : Number(body?.pageSize)
      const skip: number = isNaN((Number(body?.page) ?? 0) * take) ? 0 : (Number(body?.page) ?? 0) * take
      const fixtures = await this.app.prisma.fixture.findMany({
        where: where,
        take,
        skip,
        include: {
          homeTeam: true,
          awayTeam: true,
          league: true,
          result: true,
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
      this.app.log.error(error)
      return this.res.status(500).send(<IDefaultQueryResponse>{
        id: null,
        success: false,
        message: 'Error! Something went wrong please try again',
        data: [],
      })
    }
  }

  async getAllBettingFixtures() {
    try {
      const body = this.req.query as FixturesQueryParams

      const where: Prisma.FixtureWhereInput = {
        AND: [
          {
            odds: {
              some: {},
            },
          },
        ],
      }
      if (body?.status && body.status == 'FINISHED') {
        where.AND = [
          ...(where.AND as []),
          {
            status: body?.status,
          },
        ]
      } else {
        where.AND = [
          ...(where.AND as []),
          {
            date: {
              gte: dayjs().subtract(90, 'minutes').toDate(),
            },
          },
        ]
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
            status: body?.status,
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
      console.log(where)
      const take: number = isNaN(Number(body?.pageSize)) ? 100 : Number(body?.pageSize)
      const skip: number = isNaN((Number(body?.page) ?? 0) * take) ? 0 : (Number(body?.page) ?? 0) * take
      const fixtures = await this.app.prisma.fixture.findMany({
        where: where,
        take,
        skip,
        include: {
          homeTeam: true,
          awayTeam: true,
          league: true,
          result: true,
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
      this.app.log.error(error)
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
  async getFeaturedMatch() {
    try {
      const fixture = await this.app.prisma.fixture.findFirst({
        include: {
          odds: {
            where: {
              type: 'WINNER_FT',
            },
          },
          league: true,
          awayTeam: true,
          homeTeam: true,
          result: true,
        },
        where: {
          odds: {
            some: {},
          },
          featured: true,
          date: {
            gte: dayjs().toDate(),
          },
        },
      })

      return this.res.send(<IDefaultQueryResponse>{
        id: null,
        data: fixture,
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
