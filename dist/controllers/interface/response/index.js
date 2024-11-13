"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorResponses = exports.IPlaceBetInput = exports.FixtureResponse = exports.IFixtureResults = exports.IOdds = exports.ITeamResponse = exports.ILeagueResponseBody = exports.BetResponseBody = exports.BetMarketOddsReponse = exports.IUserProfileReponse = exports.AttachmentResponse = exports.IUserReponse = exports.IErrorResponse = exports.ISuccessResponse = void 0;
exports.ISuccessResponse = {
    id: { type: 'number' },
    success: { type: 'boolean' },
    message: { type: 'string' },
};
exports.IErrorResponse = {
    id: { type: 'number' },
    success: { type: 'boolean', default: false },
    message: { type: 'string' },
};
exports.IUserReponse = {
    id: { type: 'number' },
    phone: { type: 'string' },
    role: { type: 'string', enum: ['CUSTOMER', 'ADMIN'] },
    phoneValidated: { type: 'boolean' },
    accountBalance: { type: 'number' },
    profileId: { type: 'number' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
};
exports.AttachmentResponse = {
    id: { type: 'number' },
    link: { type: 'string' },
    filename: { type: 'string' },
    fileType: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
};
exports.IUserProfileReponse = {
    id: { type: 'number' },
    fname: { type: 'string' },
    lname: { type: 'string' },
    email: { type: 'string' },
    avatar: { type: 'object', properties: exports.AttachmentResponse },
    avatarId: { type: 'number' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
};
exports.BetMarketOddsReponse = {
    id: { type: 'number' },
    pick: { type: 'string' },
    oddId: { type: 'number' },
    betId: { type: 'number' },
    betOdd: { type: 'number' },
    status: { type: 'string', enum: ['CANCELLED', 'LOST', 'PENDING', 'VOID', 'WON'] },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
};
exports.BetResponseBody = {
    id: { type: 'number' },
    date: { type: 'string' },
    markets: { type: 'object', properties: exports.BetMarketOddsReponse },
    userId: { type: 'string' },
    amountPlaced: { type: 'number' },
    totalMarkets: { type: 'number' },
    totalOdds: { type: 'number' },
    possibleWin: { type: 'number' },
    status: { type: 'string', enum: ['CANCELLED', 'LOST', 'PENDING', 'VOID', 'WON'] },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
};
exports.ILeagueResponseBody = {
    id: { type: 'number' },
    leagueId: { type: 'number' },
    name: { type: 'string' },
    logo: { type: 'string' },
    type: { type: 'string' },
    country: { type: 'string' },
    matches: { type: 'number' },
    season: { type: 'string' },
    featured: { type: 'boolean' },
    marketId: { type: 'number' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
};
exports.ITeamResponse = {
    id: { type: 'number' },
    teamId: { type: 'number' },
    name: { type: 'string' },
    code: { type: 'string' },
    logo: { type: 'string' },
    venue: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
};
exports.IOdds = {
    id: { type: 'number' },
    name: { type: 'string' },
    value: { type: ['number', 'string'] },
    odd: { type: 'number', default: 1.0 },
    type: { type: 'string', enum: [''] },
    fixtureId: { type: 'string' },
};
exports.IFixtureResults = {
    id: { type: 'number' },
    homeGoals: { type: ['number', 'null'] },
    awayGoals: { type: ['number', 'null'] },
    htHomeGoals: { type: ['number', 'null'] },
    htAwayGoals: { type: ['number', 'null'] },
    extraHomeGoals: { type: ['null', 'number'] },
    extraAwayGoals: { type: ['null', 'number'] },
    fixtureId: { type: ['number'] },
};
exports.FixtureResponse = {
    id: { type: 'number' },
    fixtureId: { type: 'number' },
    date: { type: 'string' },
    referee: { type: 'string' },
    featured: { type: 'boolean' },
    status: { type: 'string', enum: ['FINISHED', 'UPCOMMING', 'ABANDONED', 'INPLAY', 'CANCELLED'] },
    league: { type: 'object', properties: exports.ILeagueResponseBody },
    leagueId: { type: 'number' },
    homeTeam: { type: 'object', properties: exports.ITeamResponse },
    homeTeamId: { type: 'number' },
    awayTeam: { type: 'object', properties: exports.ITeamResponse },
    awayTeamId: { type: 'number' },
    fixtureResult: { type: 'string', enum: ['HOME', 'AWAY', 'DRAW', 'NP'], default: 'NP' },
    result: { type: 'object', properties: exports.IFixtureResults },
    odds: { type: 'array', items: { properties: exports.IOdds } },
    shortStatus: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
};
exports.IPlaceBetInput = {
    oddsId: { type: 'number' },
    pick: { type: 'string' },
};
exports.ErrorResponses = {
    400: {
        description: 'Bad Request',
        type: 'object',
        properties: exports.IErrorResponse,
    },
    401: {
        description: 'Not Authorized',
        type: 'object',
        properties: exports.IErrorResponse,
    },
    403: {
        description: 'Not Authorized',
        type: 'object',
        properties: exports.IErrorResponse,
    },
    404: {
        description: 'Not Authorized',
        type: 'object',
        properties: exports.IErrorResponse,
    },
    500: {
        description: 'Server error',
        type: 'object',
        properties: exports.IErrorResponse,
    },
};
//# sourceMappingURL=index.js.map