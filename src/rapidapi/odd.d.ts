export interface Odds {
  league: League
  fixture: Fixture
  update: Date
  bookmakers: Bookmaker[]
}
export interface OddsApiResponse {
  page: number
  hasNext: boolean
  odds: Odds[]
  total: number
}
interface Bookmaker {
  id: number
  name: string
  bets: Bet[]
}

interface Bet {
  id: number
  name: string
  values: ValueElement[]
}

interface ValueElement {
  value: number | string
  odd: string
}

interface Fixture {
  id: number
  timezone: string
  date: Date
  timestamp: number
}

interface League {
  id: number
  name: string
  country: string
  logo: string
  flag: string
  season: number
}
