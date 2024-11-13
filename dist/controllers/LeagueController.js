"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const BaseController_1 = require("./BaseController");
class LeagueController extends BaseController_1.BaseController {
    async getAllLeagues() {
        try {
            const queryParams = this.req.query;
            const where = {
                AND: [],
            };
            if (queryParams?.country) {
                where.AND = [
                    ...where.AND,
                    {
                        country: queryParams.country,
                    },
                ];
            }
            if (queryParams?.year) {
                where.AND = [
                    ...where.AND,
                    {
                        season: queryParams.year,
                    },
                ];
            }
            if (queryParams?.featured) {
                where.AND = [
                    ...where.AND,
                    {
                        featured: queryParams.featured,
                    },
                ];
            }
            const take = isNaN(Number(queryParams?.pageSize)) ? 100 : Number(queryParams?.pageSize);
            const skip = isNaN((Number(queryParams?.page) ?? 0) * take) ? 0 : (Number(queryParams?.page) ?? 0) * take;
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
                                        gte: (0, dayjs_1.default)().toDate(),
                                    },
                                },
                            },
                        },
                    },
                },
            });
            return this.res.status(200).send({
                id: null,
                success: true,
                message: 'Success',
                data: leagues.map((a) => ({ ...a, matches: a?._count?.fixtures })),
            });
        }
        catch (error) {
            this.app.log.error(error);
            this.app.Sentry.captureException(error);
            return this.res.status(500).send({
                id: null,
                success: false,
                message: 'Error! Something went wrong please try again',
                data: [],
            });
        }
    }
    async getleague() {
        try {
            const id = Number(this.req.params?.id);
            const league = await this.app.prisma.league.findUnique({
                where: {
                    id,
                },
            });
            return this.res.status(200).send({
                id: null,
                success: true,
                message: 'Success',
                data: league,
            });
        }
        catch (error) {
            this.app.Sentry.captureException(error);
            this.app.log.error(error);
            return this.res.status(500).send({
                id: null,
                success: false,
                message: 'Error! Something went wrong please try again',
                data: null,
            });
        }
    }
}
exports.default = LeagueController;
//# sourceMappingURL=LeagueController.js.map