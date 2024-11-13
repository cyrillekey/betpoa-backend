"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const BaseController_1 = require("./BaseController");
class FixturesController extends BaseController_1.BaseController {
    async getAllFixtures() {
        try {
            const body = this.req.query;
            const where = {
                AND: [
                    {
                        date: {
                            gte: (0, dayjs_1.default)().subtract(90, 'minutes').toDate(),
                        },
                    },
                ],
            };
            if (body?.fromDate) {
                where.AND = [
                    ...where.AND,
                    {
                        date: {
                            gte: (0, dayjs_1.default)(body?.fromDate).toDate(),
                        },
                    },
                ];
            }
            if (body?.toDate) {
                where.AND = [
                    ...where.AND,
                    {
                        date: {
                            lte: (0, dayjs_1.default)(body?.fromDate).toDate(),
                        },
                    },
                ];
            }
            if (body?.country)
                where.AND = [
                    ...where.AND,
                    {
                        league: {
                            country: {
                                equals: body.country,
                                mode: 'insensitive',
                            },
                        },
                    },
                ];
            if (body?.status) {
                where.AND = [
                    ...where.AND,
                    {
                        status: body.status,
                    },
                ];
            }
            if (body?.leagueIds) {
                const ids = body.leagueIds.split('-').reduce((total, a) => {
                    try {
                        const number = Number(a);
                        if (isNaN(number)) {
                            return total;
                        }
                        else {
                            total.push(number);
                            return total;
                        }
                    }
                    catch (error) {
                        return total;
                    }
                }, []);
                if (ids?.length > 0) {
                    where.AND = [
                        ...where.AND,
                        {
                            leagueId: {
                                in: ids,
                            },
                        },
                    ];
                }
            }
            if (body?.teamsIds) {
                const ids = body.teamsIds.split('-').reduce((total, a) => {
                    try {
                        const number = Number(a);
                        if (isNaN(number)) {
                            return total;
                        }
                        else {
                            total.push(number);
                            return total;
                        }
                    }
                    catch (error) {
                        return total;
                    }
                }, []);
                if (ids?.length > 0) {
                    where.AND = [
                        ...where.AND,
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
                    ];
                }
            }
            const take = isNaN(Number(body?.pageSize)) ? 100 : Number(body?.pageSize);
            const skip = isNaN((Number(body?.page) ?? 0) * take) ? 0 : (Number(body?.page) ?? 0) * take;
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
            });
            return this.res.send({
                id: null,
                success: true,
                message: 'Success',
                data: fixtures,
            });
        }
        catch (error) {
            this.app.Sentry.captureException(error);
            this.app.log.error(error);
            return this.res.status(500).send({
                id: null,
                success: false,
                message: 'Error! Something went wrong please try again',
                data: [],
            });
        }
    }
    async getAllBettingFixtures() {
        try {
            const body = this.req.query;
            const where = {
                AND: [
                    {
                        odds: {
                            some: {},
                        },
                    },
                ],
            };
            if (body?.status && body.status == 'FINISHED') {
                where.AND = [
                    ...where.AND,
                    {
                        status: body?.status,
                    },
                ];
            }
            else {
                where.AND = [
                    ...where.AND,
                    {
                        date: {
                            gte: (0, dayjs_1.default)().subtract(90, 'minutes').toDate(),
                        },
                    },
                ];
            }
            if (body?.fromDate) {
                where.AND = [
                    ...where.AND,
                    {
                        date: {
                            gte: (0, dayjs_1.default)(body?.fromDate).toDate(),
                        },
                    },
                ];
            }
            if (body?.toDate) {
                where.AND = [
                    ...where.AND,
                    {
                        date: {
                            lte: (0, dayjs_1.default)(body?.fromDate).toDate(),
                        },
                    },
                ];
            }
            if (body?.country)
                where.AND = [
                    ...where.AND,
                    {
                        league: {
                            country: {
                                equals: body.country,
                                mode: 'insensitive',
                            },
                        },
                    },
                ];
            if (body?.status) {
                where.AND = [
                    ...where.AND,
                    {
                        status: body?.status,
                    },
                ];
            }
            if (body?.leagueIds) {
                const ids = body.leagueIds.split('-').reduce((total, a) => {
                    try {
                        const number = Number(a);
                        if (isNaN(number)) {
                            return total;
                        }
                        else {
                            total.push(number);
                            return total;
                        }
                    }
                    catch (error) {
                        return total;
                    }
                }, []);
                if (ids?.length > 0) {
                    where.AND = [
                        ...where.AND,
                        {
                            leagueId: {
                                in: ids,
                            },
                        },
                    ];
                }
            }
            if (body?.teamsIds) {
                const ids = body.teamsIds.split('-').reduce((total, a) => {
                    try {
                        const number = Number(a);
                        if (isNaN(number)) {
                            return total;
                        }
                        else {
                            total.push(number);
                            return total;
                        }
                    }
                    catch (error) {
                        return total;
                    }
                }, []);
                if (ids?.length > 0) {
                    where.AND = [
                        ...where.AND,
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
                    ];
                }
            }
            console.log(where);
            const take = isNaN(Number(body?.pageSize)) ? 100 : Number(body?.pageSize);
            const skip = isNaN((Number(body?.page) ?? 0) * take) ? 0 : (Number(body?.page) ?? 0) * take;
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
            });
            return this.res.send({
                id: null,
                success: true,
                message: 'Success',
                data: fixtures,
            });
        }
        catch (error) {
            this.app.Sentry.captureException(error);
            this.app.log.error(error);
            return this.res.status(500).send({
                id: null,
                success: false,
                message: 'Error! Something went wrong please try again',
                data: [],
            });
        }
    }
    async getFixtureById() {
        try {
            const id = Number(this.req.params?.id);
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
            });
            return this.res.send({
                id: null,
                success: true,
                message: 'Success!',
                data: fixture,
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
    async getFixtureResultByFixtureId() {
        try {
            const id = Number(this.req.params?.id);
            const fixture = await this.app.prisma.fixtureResult.findUnique({
                where: {
                    id: id,
                },
            });
            return this.res.send({
                id: fixture?.id,
                success: true,
                message: 'Success!',
                data: fixture,
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
    async getFixtureoddsById() {
        try {
            const id = Number(this.req.params?.id);
            const odds = await this.app.prisma.odds.findMany({
                where: {
                    fixtureId: id,
                },
            });
            return this.res.send({
                id: null,
                data: odds,
                success: true,
                message: 'Success',
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
                        gte: (0, dayjs_1.default)().toDate(),
                    },
                },
            });
            return this.res.send({
                id: null,
                data: fixture,
                success: true,
                message: 'Success',
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
}
exports.default = FixturesController;
//# sourceMappingURL=FixturesController.js.map