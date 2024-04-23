import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'

import { IDefaultQueryResponse, LeaguesQueryParams } from './interface/fixtures'
import { BaseController } from './BaseController'

class LeagueController extends BaseController {
  async getAllLeagues() {
    try {
      const queryParams: LeaguesQueryParams = this.req.query as LeaguesQueryParams
      const where: Prisma.LeagueWhereInput = {
        AND: [],
      }
      if (queryParams?.country) {
        where.AND = [
          ...(where.AND as []),
          {
            country: queryParams.country,
          },
        ]
      }
      if (queryParams?.year) {
        where.AND = [
          ...(where.AND as []),
          {
            season: queryParams.year,
          },
        ]
      }
      if (queryParams?.featured) {
        where.AND = [
          ...(where.AND as []),
          {
            featured: queryParams.featured,
          },
        ]
      }
      const take: number = isNaN(Number(queryParams?.pageSize)) ? 100 : Number(queryParams?.pageSize)

      const skip: number = isNaN((Number(queryParams?.page) ?? 0) * take) ? 0 : (Number(queryParams?.page) ?? 0) * take

      const leagues = await this.app.prisma.league.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: {
              fixtures: {
                where: {
                  date: {
                    gte: dayjs().toDate(),
                  },
                },
              },
            },
          },
        },
      })
      return this.res.status(200).send(<IDefaultQueryResponse>{
        id: null,
        success: true,
        message: 'Success',
        data: leagues.map((a) => ({ ...a, matches: a?._count?.fixtures })),
      })
    } catch (error) {
      this.app.log.error(error)
      this.app.Sentry.captureException(error)
      return this.res.status(500).send(<IDefaultQueryResponse>{
        id: null,
        success: false,
        message: 'Error! Something went wrong please try again',
        data: [],
      })
    }
  }
  async getleague() {
    try {
      const id = Number((this.req.params as Record<string, any>)?.id)
      const league = await this.app.prisma.league.findUnique({
        where: {
          id,
        },
      })

      return this.res.status(200).send(<IDefaultQueryResponse>{
        id: null,
        success: true,
        message: 'Success',
        data: league,
      })
    } catch (error) {
      this.app.Sentry.captureException(error)
      this.app.log.error(error)
      return this.res.status(500).send(<IDefaultQueryResponse>{
        id: null,
        success: false,
        message: 'Error! Something went wrong please try again',
        data: null,
      })
    }
  }
}
export default LeagueController
