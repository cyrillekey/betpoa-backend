import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'

import { IDefaultQueryResponse, IDefaultResponse, IPlaceBetBody } from './interface/fixtures'
import { BaseController } from './BaseController'

export default class BettingController extends BaseController {
  async placeBet() {
    try {
      // TODO ADD RESTRICTION TO PREVENT BETTING ON ONGOING MATCHES
      const body: IPlaceBetBody = this.body
      const accountBalance = await this.app.prisma.user.findUnique({
        where: {
          id: this.req.user.id,
        },
        select: {
          accountBalance: true,
          id: true,
        },
      })
      if (body.amount > accountBalance!.accountBalance) {
        return this.res.status(400).send(<IDefaultQueryResponse>{
          success: false,
          id: null,
          message: 'Failed! Bet amount exceeds account balance',
        })
      }

      const odds = await this.app.prisma.odds.findMany({
        where: {
          id: {
            in: body.data.map((a) => a?.oddsId),
          },
          fixture: {
            date: {
              gt: dayjs().toDate(),
            },
          },
        },
      })
      if (!odds?.length) {
        return this.res.status(400).send(<IDefaultResponse>{
          id: null,
          success: false,
          message: 'Failed! No markets to bet on',
        })
      }
      let totalOdds = 1.0
      const transaction = odds.reduce((transactions: Prisma.BetMarketOddsCreateManyBetInput[], current) => {
        const pick = body.data.find((a) => a?.oddsId == current?.id)
        if (!pick) {
          return transactions
        }
        totalOdds = totalOdds * current.odd
        transactions.push({
          oddId: current.id,
          pick: pick?.pick,
          betOdd: current.odd,
          status: 'PENDING',
        })
        return transactions
      }, [])
      const bet = await this.app.prisma.$transaction([
        this.app.prisma.bet.create({
          data: {
            amountPlaced: body.amount,
            date: dayjs().toDate(),
            totalOdds: totalOdds,
            possibleWin: totalOdds * body.amount,
            status: 'PENDING',
            userId: accountBalance!.id,
            totalMarkets: transaction.length,
            markets: {
              createMany: {
                data: transaction,
              },
            },
          },
        }),
        this.app.prisma.user.update({
          data: {
            accountBalance: {
              decrement: body.amount,
            },
          },
          where: {
            id: accountBalance?.id,
          },
        }),
      ])
      if (!bet) {
        return this.res.status(400).send(<IDefaultResponse>{
          id: null,
          success: false,
          message: 'Failed! Something went wrong please try again',
        })
      }
      return this.res.send(<IDefaultResponse>{
        id: bet[0].id,
        message: 'Success! Bet placed',
        success: true,
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
  async cancelBet() {
    try {
      const betId = Number((this.req.params as any).id)
      const bet = await this.app.prisma.bet.findUnique({
        where: {
          id: betId,
          userId: this.user.id,
        },
        include: {
          markets: {
            where: {
              odd: {
                fixture: {
                  date: {
                    lte: dayjs().toDate(),
                  },
                },
              },
            },
          },
        },
      })
      if (!bet) {
        return this.res.status(400).send(<IDefaultResponse>{
          id: null,
          success: false,
          message: 'Failed! Bet not found please try again',
        })
      }
      if (bet?.markets?.length > 0) {
        return this.res.status(400).send(<IDefaultResponse>{
          id: bet?.id,
          success: false,
          message: 'Failed! Bet has matches which have already begun',
        })
      }
      await this.app.prisma.bet.update({
        where: {
          id: bet.id,
        },
        data: {
          status: 'CANCELLED',
          user: {
            update: {
              accountBalance: bet.amountPlaced,
            },
          },
        },
      })
      return this.res.status(200).send(<IDefaultResponse>{
        id: bet?.id,
        success: true,
        message: 'Success! Bet placed successfuly',
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
  async getGets() {
    try {
      const bets = await this.app.prisma.bet.findMany({
        where: {
          userId: this.user.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
      return <IDefaultQueryResponse>{
        id: null,
        success: true,
        data: bets,
        message: 'Success! Bets found',
      }
    } catch (error) {
      this.app.Sentry.captureException(error)
      return this.res.status(500).send(<IDefaultQueryResponse>{
        id: null,
        data: [],
        success: false,
        message: 'Error! Something went wrong please try again',
      })
    }
  }
  async getBet() {}
  async getBetItems() {}
}
