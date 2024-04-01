import { MATCHSTATUS } from '@prisma/client'

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
