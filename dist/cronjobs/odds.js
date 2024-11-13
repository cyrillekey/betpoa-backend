"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFixturesOdds = void 0;
const index_1 = require("@rapidapi/index");
const dayjs_1 = __importDefault(require("dayjs"));
const getFixturesOdds = async (app) => {
    const checkInId = app.Sentry.captureCheckIn({
        monitorSlug: 'fixtures_odds_cron',
        status: 'in_progress',
    }, {
        schedule: {
            type: 'crontab',
            value: '50 03 * * *',
        },
        checkinMargin: 1,
        maxRuntime: 10,
        timezone: 'Africa/Nairobi',
    });
    try {
        const bookmakers = [8, 11];
        app.log.info('Generating odds cronjob starting');
        for (let x = 0; x < bookmakers.length; x++) {
            for (let index = 0; index < 3; index++) {
                app.log.info(`Generating odds for ${(0, dayjs_1.default)().add(index, 'day').toDate()}`);
                const oddsResponse = await (0, index_1.getDateOdds)((0, dayjs_1.default)().add(index, 'day').toDate(), 1, bookmakers[x]);
                app.log.info(`${(0, dayjs_1.default)().add(index, 'day').toDate()} has ${oddsResponse?.total}`);
                await saveOddsToDatabase(app, oddsResponse?.odds);
                for (let index = 2; index < oddsResponse.total + 1; index++) {
                    app.log.info(`Fetching for page ${index}`);
                    const nextOdds = await (0, index_1.getDateOdds)((0, dayjs_1.default)().add(index, 'day').toDate(), index, bookmakers[x]);
                    app.log.info(`${index} has ${nextOdds?.odds?.length} odds`);
                    await saveOddsToDatabase(app, nextOdds?.odds);
                }
            }
        }
        app.log.info('Generating odds cronjob finished');
        app.Sentry.captureCheckIn({ checkInId, status: 'ok', monitorSlug: 'fixtures_odds_cron' });
    }
    catch (error) {
        app.log.error(error);
        app.log.info('Generating odds cronjob crashed');
        app.Sentry.captureCheckIn({ checkInId, status: 'error', monitorSlug: 'fixtures_odds_cron' });
    }
};
exports.getFixturesOdds = getFixturesOdds;
const saveOddsToDatabase = async (app, odds) => {
    try {
        if (odds.length > 0) {
            const fixtures = (await app.prisma.fixture.findMany({
                select: {
                    fixtureId: true,
                    id: true,
                    _count: {
                        select: {
                            odds: true,
                        },
                    },
                },
                where: {
                    fixtureId: {
                        in: odds.map((a) => a?.fixture?.id),
                    },
                },
            })).filter((a) => a?._count?.odds == 0);
            const transaction = [];
            fixtures.forEach((fixture) => {
                const markets = odds.find((a) => a?.fixture?.id == fixture?.fixtureId)?.bookmakers?.at(0)?.bets;
                markets?.forEach((market) => {
                    switch (market.name) {
                        case 'Match Winner':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                type: 'WINNER_FT',
                            })));
                            break;
                        case 'Home/Away':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                type: 'HOME_OR_AWAY',
                            })));
                            break;
                        case 'Second Half Winner':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                type: 'WINNER_2HT',
                            })));
                            break;
                        case 'Goals Over/Under':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                value: a?.value.toString().slice(-3),
                                type: 'OVER_UNDER_FT',
                            })));
                            break;
                        case 'Goals Over/Under First Half':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                value: a?.value.toString().slice(-3),
                                type: 'OVER_UNDER_HT',
                            })));
                            break;
                        case 'Goals Over/Under - Second Half':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                type: 'OVER_UNDER_HT',
                            })));
                            break;
                        case 'HT/FT Double':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                value: a?.value.toString(),
                                type: 'HALFTIME_FULLTIME',
                            })));
                            break;
                        case 'Both Teams Score':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                type: 'BOTH_TEAM_SCORE',
                            })));
                            break;
                        case 'Exact Score':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                type: 'EXACT_SCORE_FT',
                            })));
                            break;
                        case 'Correct Score - First Half':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                type: 'EXACT_SCORE_HT',
                            })));
                            break;
                        case 'Double Chance':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                type: 'DOUBLE_CHANCE',
                            })));
                            break;
                        case 'First Half Winner':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                type: 'WINNER_HT',
                            })));
                            break;
                        case 'Total - Home':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                type: 'OVER_HOME',
                                value: a?.value.toString().slice(-3),
                            })));
                            break;
                        case 'Total - Away':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                type: 'OVER_AWAY',
                                value: a?.value.toString().slice(-3),
                            })));
                            break;
                        case 'Double Chance - First Half':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                type: 'OVER_AWAY',
                            })));
                            break;
                        case 'Odd/Even':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                type: 'FT_ODD_EVEN',
                            })));
                            break;
                        case 'Odd/Even - First Half':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                type: 'HALF_ODD_EVEN',
                            })));
                            break;
                        case 'Home Odd/Even':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                type: 'HOME_ODD_EVEN',
                            })));
                            break;
                        case 'Away Odd/Even':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                type: 'AWAY_ODD_EVEN',
                            })));
                            break;
                        case 'Exact Goals Number':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                type: 'TOTAL_GOALS',
                                value: a?.value?.toString(),
                            })));
                            break;
                        case 'Home Team Exact Goals Number':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                type: 'TOTAL_GOALS_HOME',
                                value: a?.value?.toString(),
                            })));
                            break;
                        case 'Away Team Exact Goals Number':
                            transaction.push(...market.values.map((a) => ({
                                fixtureId: fixture?.id,
                                name: a?.value.toString(),
                                odd: Number(a?.odd),
                                type: 'TOTAL_GOALS_AWAY',
                                value: a?.value?.toString(),
                            })));
                            break;
                        default:
                            break;
                    }
                });
            });
            await app.prisma.odds.createMany({
                skipDuplicates: true,
                data: transaction,
            });
        }
    }
    catch (error) {
        app.Sentry.captureException(error);
        app.log.error(error);
    }
};
//# sourceMappingURL=odds.js.map