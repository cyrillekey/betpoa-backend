"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const BaseController_1 = require("./BaseController");
class BettingController extends BaseController_1.BaseController {
    async placeBet() {
        try {
            const body = this.body;
            const accountBalance = await this.app.prisma.user.findUnique({
                where: {
                    id: this.req.user.id,
                },
                select: {
                    accountBalance: true,
                    id: true,
                },
            });
            if (body.amount > accountBalance.accountBalance) {
                return this.res.status(400).send({
                    success: false,
                    id: null,
                    message: 'Failed! Bet amount exceeds account balance',
                });
            }
            const odds = await this.app.prisma.odds.findMany({
                where: {
                    id: {
                        in: body.data.map((a) => a?.oddsId),
                    },
                    fixture: {
                        date: {
                            gt: (0, dayjs_1.default)().toDate(),
                        },
                    },
                },
            });
            if (!odds?.length) {
                return this.res.status(400).send({
                    id: null,
                    success: false,
                    message: 'Failed! No markets to bet on',
                });
            }
            let totalOdds = 1.0;
            const transaction = odds.reduce((transactions, current) => {
                const pick = body.data.find((a) => a?.oddsId == current?.id);
                if (!pick) {
                    return transactions;
                }
                totalOdds = totalOdds * current.odd;
                transactions.push({
                    oddId: current.id,
                    pick: pick?.pick,
                    betOdd: current.odd,
                    status: 'PENDING',
                });
                return transactions;
            }, []);
            const bet = await this.app.prisma.$transaction([
                this.app.prisma.bet.create({
                    data: {
                        amountPlaced: body.amount,
                        date: (0, dayjs_1.default)().toDate(),
                        totalOdds: totalOdds,
                        possibleWin: totalOdds * body.amount,
                        status: 'PENDING',
                        userId: accountBalance.id,
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
            ]);
            if (!bet) {
                return this.res.status(400).send({
                    id: null,
                    success: false,
                    message: 'Failed! Something went wrong please try again',
                });
            }
            return this.res.send({
                id: bet[0].id,
                message: 'Success! Bet placed',
                success: true,
            });
        }
        catch (error) {
            this.app.Sentry.captureException(error);
            return this.res.status(500).send({
                id: null,
                success: false,
                message: 'Error! Something went wrong please try again',
                data: null,
            });
        }
    }
    async cancelBet() {
        try {
            const betId = Number(this.req.params.id);
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
                                        lte: (0, dayjs_1.default)().toDate(),
                                    },
                                },
                            },
                        },
                    },
                },
            });
            if (!bet) {
                return this.res.status(400).send({
                    id: null,
                    success: false,
                    message: 'Failed! Bet not found please try again',
                });
            }
            if (bet?.markets?.length > 0) {
                return this.res.status(400).send({
                    id: bet?.id,
                    success: false,
                    message: 'Failed! Bet has matches which have already begun',
                });
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
            });
            return this.res.status(200).send({
                id: bet?.id,
                success: true,
                message: 'Success! Bet placed successfuly',
            });
        }
        catch (error) {
            this.app.Sentry.captureException(error);
            return this.res.status(500).send({
                id: null,
                success: false,
                message: 'Error! Something went wrong please try again',
                data: null,
            });
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
            });
            return {
                id: null,
                success: true,
                data: bets,
                message: 'Success! Bets found',
            };
        }
        catch (error) {
            this.app.Sentry.captureException(error);
            return this.res.status(500).send({
                id: null,
                data: [],
                success: false,
                message: 'Error! Something went wrong please try again',
            });
        }
    }
    async getBet() { }
    async getBetItems() { }
}
exports.default = BettingController;
//# sourceMappingURL=BettingController.js.map