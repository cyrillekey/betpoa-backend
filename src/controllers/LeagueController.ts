import { Prisma } from '@prisma/client'

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
      const take: number = queryParams?.pageSize ?? 100
      const skip: number = (queryParams?.page ?? 0) * take

      const leagues = await this.app.prisma.league.findMany({
        where,
        skip,
        take,
      })
      return this.res.status(200).send(<IDefaultQueryResponse>{
        id: null,
        success: true,
        message: 'Success',
        data: leagues,
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
  async getleague() {
    try {
      const id = Number((this.req.params as Record<string, any>)?.id)
      const league = await this.app.prisma.league.findUnique({
        where: {
          id,
        },
      })
      console.log(league)
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
