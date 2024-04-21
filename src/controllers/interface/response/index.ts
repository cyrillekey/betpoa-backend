import { BETSTATUS } from '@prisma/client'

export const ISuccessResponse = {
  id: { type: 'number' },
  success: { type: 'boolean' },
  message: { type: 'string' },
}
export const IErrorResponse = {
  id: { type: 'number' },
  success: { type: 'boolean', default: false },
  message: { type: 'string' },
}
export const IUserReponse = {
  id: { type: 'number' },
  phone: { type: 'string' },
  role: { type: 'string', enum: ['CUSTOMER', 'ADMIN'] },
  phoneValidated: { type: 'boolean' },
  accountBalance: { type: 'number' },
  profileId: { type: 'number' },
  createdAt: { type: 'string' },
  updatedAt: { type: 'string' },
}
export const AttachmentResponse = {
  id: { type: 'number' },
  link: { type: 'string' },
  filename: { type: 'string' },
  fileType: { type: 'string' },
  createdAt: { type: 'string' },
  updatedAt: { type: 'string' },
}
export const IUserProfileReponse = {
  id: { type: 'number' },
  fname: { type: 'string' },
  lname: { type: 'string' },
  email: { type: 'string' },
  avatar: { type: 'object', properties: AttachmentResponse },
  avatarId: { type: 'number' },
  createdAt: { type: 'string' },
  updatedAt: { type: 'string' },
}
export const BetMarketOddsReponse = {
  id: { type: 'number' },
  pick: { type: 'string' },
  oddId: { type: 'number' },
  betId: { type: 'number' },
  betOdd: { type: 'number' },
  status: { type: 'string', enum: ['CANCELLED', 'LOST', 'PENDING', 'VOID', 'WON'] satisfies BETSTATUS[] },
  createdAt: { type: 'string' },
  updatedAt: { type: 'string' },
}
export const BetResponseBody = {
  id: { type: 'number' },
  date: { type: 'string' },
  markets: { type: 'object', properties: BetMarketOddsReponse },
  userId: { type: 'string' },
  amountPlaced: { type: 'number' },
  totalMarkets: { type: 'number' },
  totalOdds: { type: 'number' },
  possibleWin: { type: 'number' },
  status: { type: 'string', enum: ['CANCELLED', 'LOST', 'PENDING', 'VOID', 'WON'] satisfies BETSTATUS[] },
  createdAt: { type: 'string' },
  updatedAt: { type: 'string' },
}

export const ILeagueResponseBody = {
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
}
export const ITeamResponse = {
  id: { type: 'number' },
  teamId: { type: 'number' },
  name: { type: 'string' },
  code: { type: 'string' },
  logo: { type: 'string' },
  venue: { type: 'string' },
  createdAt: { type: 'string' },
  updatedAt: { type: 'string' },
}
export const IOdds = {
  id: { type: 'number' },
  name: { type: 'string' },
  value: { type: 'number', default: 1.0 },
  odd: { type: 'number', default: 1.0 },
  type: { type: 'string', enum: [''] },
  fixtureId: { type: 'string' },
}
export const IFixtureResults = {
  id: { type: 'number' },
  homeGoals: { type: ['number', 'null'] },
  awayGoals: { type: ['number', 'null'] },
  htHomeGoals: { type: ['number', 'null'] },
  htAwayGoals: { type: ['number', 'null'] },
  extraHomeGoals: { type: ['null', 'number'] },
  extraAwayGoals: { type: ['null', 'number'] },
  fixtureId: { type: ['number'] },
}
export const FixtureResponse = {
  id: { type: 'number' },
  fixtureId: { type: 'number' },
  date: { type: 'string' },
  referee: { type: 'string' },
  featured: { type: 'boolean' },
  status: { type: 'string', enum: ['FINISHED', 'UPCOMMING', 'ABANDONED', 'INPLAY', 'CANCELLED'] },
  league: { type: 'object', properties: ILeagueResponseBody },
  leagueId: { type: 'number' },
  homeTeam: { type: 'object', properties: ITeamResponse },
  homeTeamId: { type: 'number' },
  awayTeam: { type: 'object', properties: ITeamResponse },
  awayTeamId: { type: 'number' },
  fixtureResult: { type: 'string', enum: ['HOME', 'AWAY', 'DRAW', 'NP'], default: 'NP' },
  result: { type: 'object', properties: IFixtureResults },
  odds: { type: 'array', items: { properties: IOdds } },
  shortStatus: { type: 'string' },
  createdAt: { type: 'string' },
  updatedAt: { type: 'string' },
}

export const IPlaceBetInput = {
  oddsId: { type: 'number' },
  pick: { type: 'string' },
}

export const ErrorResponses = {
  400: {
    description: 'Bad Request',
    type: 'object',
    properties: IErrorResponse,
  },
  401: {
    description: 'Not Authorized',
    type: 'object',
    properties: IErrorResponse,
  },
  403: {
    description: 'Not Authorized',
    type: 'object',
    properties: IErrorResponse,
  },
  404: {
    description: 'Not Authorized',
    type: 'object',
    properties: IErrorResponse,
  },
  500: {
    description: 'Server error',
    type: 'object',
    properties: IErrorResponse,
  },
}
