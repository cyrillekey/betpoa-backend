import { MATCHSTATUS } from '@prisma/client'
export interface PlaceBetInputBody {
  oddsId: number
  pick: string
}
export interface IPlaceBetBody {
  amount: number
  data: PlaceBetInputBody[]
}
export interface IDefaultResponse {
  success: boolean
  message: string
  id: number | null
}
export interface IDefaultQueryResponse {
  success: boolean
  message: string
  id: number | null
  data: any[] | null | Record<string, any>
}
export interface LeaguesQueryParams {
  pageSize?: number
  page?: number
  year?: string
  country?: string
  featured?: boolean
}
export interface FixturesQueryParams {
  fromDate?: string
  toDate?: string
  pageSize?: number
  page?: number
  leagueIds?: string
  country?: string
  teamsIds?: string
  status?: MATCHSTATUS
}
export const ISuccessResponse = {
  id: { type: 'number' },
  success: { type: 'boolean' },
  message: { type: 'string' },
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
  league: { type: 'object', properties: ILeagueResponseBody },
  status: { type: 'string', enum: ['FINISHED', 'UPCOMMING', 'ABANDONED', 'INPLAY', 'CANCELLED'] },
  leagueId: { type: 'number' },
  homeTeam: { type: 'object', properties: ITeamResponse },
  homeTeamId: { type: 'number' },
  awayTeam: { type: 'object', properties: ITeamResponse },
  awayTeamId: { type: 'number' },
  fixtureResult: { type: 'string', enum: ['HOME', 'AWAY', 'DRAW', 'NP'], default: 'NP' },
  odds: { type: 'array', items: { properties: IOdds } },
  result: IFixtureResults,
}

export const IPlaceBetInput = {
  oddsId: { type: 'number' },
  pick: { type: 'string' },
}
