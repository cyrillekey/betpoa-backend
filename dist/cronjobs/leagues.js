"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLeaguesCronjob = void 0;
const index_1 = require("@rapidapi/index");
const createLeaguesCronjob = async (app) => {
    const checkInId = app.Sentry.captureCheckIn({
        monitorSlug: 'get_leagues_cron',
        status: 'in_progress',
    }, {
        schedule: {
            type: 'crontab',
            value: '15 00 1 * *',
        },
        checkinMargin: 1,
        maxRuntime: 10,
        timezone: 'Africa/Nairobi',
    });
    try {
        const leagues = await (0, index_1.getLeagues)();
        await app.prisma.league.createMany({
            data: leagues.map((a) => ({
                country: a?.country?.name,
                leagueId: a?.league?.id,
                logo: a?.league?.logo,
                name: a?.league?.name,
                type: a?.league?.type,
                season: a?.seasons?.at(0)?.year?.toString() ?? '',
                id: a?.league?.id,
            })),
            skipDuplicates: true,
        });
        app.Sentry.captureCheckIn({ checkInId, monitorSlug: 'get_leagues_cron', status: 'ok' });
    }
    catch (error) {
        app.Sentry.captureException(error);
        app.log.error(error);
        app.Sentry.captureCheckIn({ checkInId, monitorSlug: 'get_leagues_cron', status: 'error' });
    }
};
exports.createLeaguesCronjob = createLeaguesCronjob;
//# sourceMappingURL=leagues.js.map