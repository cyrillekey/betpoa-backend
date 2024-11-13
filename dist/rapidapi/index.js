"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDateOdds = exports.getFixtures = exports.getUpcomingFixtures = exports.getLeagues = void 0;
const index_1 = require("@configs/index");
const axios_1 = __importDefault(require("axios"));
const dayjs_1 = __importDefault(require("dayjs"));
const getLeagues = async () => {
    try {
        const config = {
            method: 'GET',
            url: 'https://api-football-v1.p.rapidapi.com/v3/leagues',
            params: {
                current: true,
            },
            headers: {
                'X-RapidAPI-Key': index_1.configs.rapidApiKey,
                'X-RapidAPI-Host': index_1.configs.rapidApiHost,
            },
        };
        const response = await (0, axios_1.default)(config)
            .then((resp) => resp?.data?.response)
            .catch(() => []);
        return response;
    }
    catch (error) {
        return [];
    }
};
exports.getLeagues = getLeagues;
async function getUpcomingFixtures(date) {
    try {
        const config = {
            method: 'GET',
            url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
            headers: {
                'X-RapidAPI-Key': index_1.configs.rapidApiKey,
                'X-RapidAPI-Host': index_1.configs.rapidApiHost,
            },
            params: {
                date: (0, dayjs_1.default)(date).format('YYYY-MM-DD'),
            },
        };
        const response = await (0, axios_1.default)(config)
            .then((resp) => {
            return resp?.data?.response;
        })
            .catch(() => []);
        return response;
    }
    catch (error) {
        return [];
    }
}
exports.getUpcomingFixtures = getUpcomingFixtures;
async function getFixtures(fixturesId) {
    try {
        const config = {
            method: 'GET',
            url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
            headers: {
                'X-RapidAPI-Key': index_1.configs.rapidApiKey,
                'X-RapidAPI-Host': index_1.configs.rapidApiHost,
            },
            params: {
                ids: fixturesId.join('-'),
            },
        };
        const response = await (0, axios_1.default)(config)
            .then((resp) => resp?.data?.response)
            .catch(() => []);
        return response;
    }
    catch (error) {
        return [];
    }
}
exports.getFixtures = getFixtures;
async function getDateOdds(date, page = 1, bookmaker) {
    try {
        const config = {
            method: 'GET',
            url: 'https://api-football-v1.p.rapidapi.com/v3/odds',
            headers: {
                'X-RapidAPI-Key': index_1.configs.rapidApiKey,
                'X-RapidAPI-Host': index_1.configs.rapidApiHost,
            },
            params: { date: (0, dayjs_1.default)(date).format('YYYY-MM-DD'), bookmaker, page },
        };
        const odds = await (0, axios_1.default)(config)
            .then((resp) => {
            return {
                odds: resp?.data?.response,
                hasNext: resp?.data?.paging?.current == resp?.data?.paging?.total,
                page: resp?.data?.paging?.current,
                total: resp?.data?.paging?.total,
            };
        })
            ?.catch(() => ({ hasNext: false, page: 1, odds: [], total: 0 }));
        return odds;
    }
    catch (error) {
        return {
            hasNext: false,
            page: 1,
            odds: [],
            total: 0,
        };
    }
}
exports.getDateOdds = getDateOdds;
//# sourceMappingURL=index.js.map