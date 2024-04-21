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
