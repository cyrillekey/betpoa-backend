"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFixturesResults = exports.getUpcomingFixturesCronjobs = void 0;
const index_1 = require("@rapidapi/index");
const dayjs_1 = __importDefault(require("dayjs"));
const getUpcomingFixturesCronjobs = async (app) => {
    const checkInId = app.Sentry.captureCheckIn({
        monitorSlug: 'upcoming_fixtures_cron',
        status: 'in_progress',
    }, {
        schedule: {
            type: 'crontab',
            value: '30 03 * * *',
        },
        checkinMargin: 1,
        maxRuntime: 10,
        timezone: 'Africa/Nairobi',
    });
    try {
        for (let index = 0; index < 3; index++) {
            app.log.info(`Genetating fixtures for ${(0, dayjs_1.default)().add(index, 'day').toDate()}`);
            try {
                const fixtures = await (0, index_1.getUpcomingFixtures)((0, dayjs_1.default)().add(index, 'day').toDate());
                const leagues = fixtures.map((a) => a?.league);
                await app.prisma.league.createMany({
                    skipDuplicates: true,
                    data: leagues.map((a) => ({
                        country: a?.name,
                        leagueId: a?.id,
                        logo: a?.logo,
                        name: a?.name,
                        type: a?.type ?? a?.name,
                        season: new Date().getFullYear().toString(),
                        id: a?.id,
                    })),
                });
                const allTeams = fixtures
                    .map((a) => {
                    if (a?.teams?.home && a?.teams?.away)
                        return [a?.teams?.away, a?.teams.home];
                    return [];
                })
                    .flat();
                const teamIds = [...new Set(allTeams?.map((a) => a?.id))];
                const teams = teamIds.map((a) => allTeams.find((b) => b?.id == a));
                await app.prisma.team.createMany({
                    skipDuplicates: true,
                    data: teams?.map((a) => ({
                        teamId: a.id,
                        code: a.name,
                        logo: a.logo,
                        name: a.name,
                        venue: '',
                        id: a?.id,
                    })),
                });
                await app.prisma.fixture.createMany({
                    skipDuplicates: true,
                    data: fixtures
                        .filter((a) => a?.teams?.away && a?.teams?.home)
                        .map((a) => ({
                        fixtureId: a?.fixture?.id,
                        awayTeamId: a?.teams?.away?.id,
                        homeTeamId: a?.teams?.home?.id,
                        date: a?.fixture?.date,
                        leagueId: a?.league?.id,
                        referee: a?.fixture?.referee ?? 'N/A',
                        shortStatus: a?.fixture?.status?.short,
                        status: getFixtureStatus(a.fixture.status.short),
                    })),
                });
                const fixturesTransaction = [];
                const fixturesToCreate = fixtures.filter((a) => a?.teams?.away && a?.teams?.home);
                for (let index = 0; index < fixturesToCreate.length; index++) {
                    const fixture = fixturesToCreate[index];
                    const fixtureResult = await app.prisma.fixtureResult
                        .findFirstOrThrow({
                        where: {
                            fixture: {
                                fixtureId: fixture?.fixture?.id,
                            },
                        },
                    })
                        .then((resp) => resp?.id)
                        .catch(() => null);
                    if (fixtureResult == null) {
                        fixturesTransaction.push(app.prisma.fixtureResult.create({
                            data: {
                                awayGoals: fixture?.score?.fulltime?.away,
                                homeGoals: fixture?.score?.fulltime?.home,
                                htAwayGoals: fixture?.score?.halftime?.away,
                                htHomeGoals: fixture?.score?.halftime?.home,
                                extraAwayGoals: fixture?.score?.extratime?.away ?? undefined,
                                extraHomeGoals: fixture?.score?.extratime?.home ?? undefined,
                                fixture: {
                                    connect: {
                                        fixtureId: fixture?.fixture?.id,
                                    },
                                },
                            },
                        }));
                    }
                    else {
                        console.log(fixtureResult);
                        fixturesTransaction.push(app.prisma.fixtureResult.update({
                            where: {
                                id: fixtureResult,
                            },
                            data: {
                                awayGoals: fixture?.score?.fulltime?.away,
                                homeGoals: fixture?.score?.fulltime?.home,
                                htAwayGoals: fixture?.score?.halftime?.away,
                                htHomeGoals: fixture?.score?.halftime?.home,
                                extraAwayGoals: fixture?.score?.extratime?.away,
                                extraHomeGoals: fixture?.score?.extratime?.home,
                            },
                        }));
                    }
                }
                await app.prisma.$transaction(fixturesTransaction);
                app.log.info(`Genetating fixtures for ${(0, dayjs_1.default)().add(index, 'day').toDate()}`);
            }
            catch (error) {
                app.Sentry.captureException(error);
                app.log.error(error);
            }
        }
        app.Sentry.captureCheckIn({ checkInId, monitorSlug: 'upcoming_fixtures_cron', status: 'ok' });
        app.log.info(`Finished generating fixtures `);
    }
    catch (error) {
        app.Sentry.captureException(error, { level: 'fatal' });
        app.log.error(error);
        app.Sentry.captureCheckIn({ checkInId, monitorSlug: 'upcoming_fixtures_cron', status: 'error' });
    }
};
exports.getUpcomingFixturesCronjobs = getUpcomingFixturesCronjobs;
const getFixturesResults = async (app) => {
    const checkInId = app.Sentry.captureCheckIn({
        monitorSlug: 'fixtures_result_cron',
        status: 'in_progress',
    }, {
        schedule: {
            type: 'crontab',
            value: '*/20 * * * *',
        },
        checkinMargin: 1,
        maxRuntime: 10,
        timezone: 'Africa/Nairobi',
    });
    try {
        await generateResults(app, (0, dayjs_1.default)().toDate());
        const endDate = (0, dayjs_1.default)().startOf('day').add(150, 'minutes').toDate();
        if ((0, dayjs_1.default)().isBefore(endDate)) {
            await generateResults(app, (0, dayjs_1.default)().subtract(1, 'day').toDate());
        }
    }
    catch (error) {
        app.Sentry.captureException(error);
        app.Sentry.captureCheckIn({ checkInId, monitorSlug: 'fixtures_result_cron', status: 'error' });
    }
};
exports.getFixturesResults = getFixturesResults;
const getFixtureStatus = (status) => {
    switch (status) {
        case 'TBD':
        case 'NS':
            return 'UPCOMMING';
        case '1H':
        case 'HT':
        case '2H':
        case 'ET':
        case 'BT':
        case 'P':
        case 'INT':
        case 'LIVE':
            return 'INPLAY';
        case 'FT':
        case 'AET':
        case 'PEN':
            return 'FINISHED';
        case 'SUSP':
        case 'PST':
        case 'CANC':
        case 'ABD':
        case 'WO':
        case 'AWD':
            return 'ABANDONED';
        default:
            return 'CANCELLED';
    }
};
async function generateResults(app, date) {
    const resultsToday = await (0, index_1.getUpcomingFixtures)(date);
    const fixtureIds = resultsToday.map((a) => a?.fixture?.id);
    const results = await app.prisma.fixtureResult.findMany({
        where: {
            fixture: {
                fixtureId: {
                    in: fixtureIds,
                },
            },
        },
        select: {
            fixture: {
                select: {
                    fixtureId: true,
                    id: true,
                },
            },
        },
    });
    for (let index = 0; index < results.length; index++) {
        const result = resultsToday.find((a) => a?.fixture?.id == results[index]?.fixture?.fixtureId);
        await app.prisma.fixtureResult.update({
            where: {
                fixtureId: results[index]?.fixture?.id,
            },
            data: {
                awayGoals: result?.score?.fulltime?.away,
                homeGoals: result?.score?.fulltime?.home,
                extraAwayGoals: result?.score?.extratime?.away,
                extraHomeGoals: result?.score?.extratime?.home,
                htAwayGoals: result?.score?.halftime?.away,
                htHomeGoals: result?.score?.halftime?.home,
                fixture: {
                    update: {
                        status: getFixtureStatus(result?.fixture?.status?.short ?? 'NP'),
                        shortStatus: result?.fixture?.status?.short,
                    },
                },
            },
        });
    }
}
//# sourceMappingURL=fixtures.js.map