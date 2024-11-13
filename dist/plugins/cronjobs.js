"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fixtures_1 = require("@cronjobs/fixtures");
const leagues_1 = require("@cronjobs/leagues");
const odds_1 = require("@cronjobs/odds");
const cron_1 = require("cron");
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
exports.default = (0, fastify_plugin_1.default)(async (fastify, _opts) => {
    const LeagueCron = fastify.Sentry.cron.instrumentCron(cron_1.CronJob, 'get_leagues_cron');
    const UpcomingFixtureCron = fastify.Sentry.cron.instrumentCron(cron_1.CronJob, 'upcoming_fixtures_cron');
    const FixturesResultsCron = fastify.Sentry.cron.instrumentCron(cron_1.CronJob, 'fixtures_result_cron');
    const GetOddsCronJob = fastify.Sentry.cron.instrumentCron(cron_1.CronJob, 'fixture_odds_cron');
    const getLeaguesJob = new LeagueCron('15 00 1 * *', async () => await (0, leagues_1.createLeaguesCronjob)(fastify), null, null, 'Africa/Nairobi');
    const upcomingFixturesJob = new UpcomingFixtureCron('30 03 * * *', async () => await (0, fixtures_1.getUpcomingFixturesCronjobs)(fastify), null, null, 'Africa/Nairobi');
    const getFixtureResultsJob = new FixturesResultsCron('*/20 * * * *', async () => await (0, fixtures_1.getFixturesResults)(fastify), null, null, 'Africa/Nairobi');
    const getOddsJob = new GetOddsCronJob('16 22 * * *', async () => await (0, odds_1.getFixturesOdds)(fastify), null, null, 'Africa/Nairobi');
    getLeaguesJob.start();
    upcomingFixturesJob.start();
    getFixtureResultsJob.start();
    getOddsJob.start();
    console.log('Cron Jobs Started');
    fastify.decorate('cronjobs', undefined);
});
//# sourceMappingURL=cronjobs.js.map