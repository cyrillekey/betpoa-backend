export interface ILeague {
  league: League
  country: Country
  seasons: Season[]
}

export interface Country {
  name: string
  code: null
  flag: null
}

export interface League {
  id: number
  name: string
  type: string
  logo: string
}

export interface Season {
  year: number
  start: Date
  end: Date
  current: boolean
}
export interface IFixture {
  fixture: Fixture
  league: League
  teams: TeamsClass
  goals: TeamsClass
  score: Score
  events: Event[]
  lineups: Lineup[]
  statistics: IFixtureStatistic[]
  players: IFixturePlayer[]
}

export interface Event {
  time: Time
  team: Team
  player: Assist
  assist: Assist
  type: Type
  detail: string
  comments: null
}

export interface Assist {
  id: number | null
  name: null | string
}

export interface Team {
  id: number
  name: Name
  logo: string
  colors?: null
  update?: Date
  winner?: boolean
}

export enum Name {
  Aldosivi = 'Aldosivi',
  DefensaYJusticia = 'Defensa Y Justicia',
}

export interface Time {
  elapsed: number
  extra: null
}

export enum Type {
  Card = 'Card',
  Goal = 'Goal',
  Subst = 'subst',
}

export interface Fixture {
  id: number
  referee: string
  timezone: string
  date: Date
  timestamp: number
  periods: Periods
  venue: Venue
  status: Status
}

export interface Periods {
  first: number
  second: number
}

export interface Status {
  long: string
  short: string
  elapsed: number
}

export interface Venue {
  id: number
  name: string
  city: string
}

export interface TeamsClass {
  home: Team
  away: Team
}

export interface Lineup {
  team: Team
  coach: Coach
  formation: string
  startXI: StartXi[]
  substitutes: StartXi[]
}

export interface Coach {
  id: number
  name: string
  photo: string
}

export interface StartXi {
  player: StartXIPlayer
}

export interface StartXIPlayer {
  id: number
  name: string
  number: number
  pos: Pos | null
  grid: null | string
}

export enum Pos {
  D = 'D',
  F = 'F',
  G = 'G',
  M = 'M',
}

export interface IFixturePlayer {
  team: Team
  players: PlayerPlayer[]
}

export interface PlayerPlayer {
  player: Coach
  statistics: PlayerStatistic[]
}

export interface PlayerStatistic {
  games: Games
  offsides: null
  shots: Shots
  goals: StatisticGoals
  passes: Passes
  tackles: Tackles
  duels: Duels
  dribbles: Dribbles
  fouls: Fouls
  cards: Cards
  penalty: Penalty
}

export interface Cards {
  yellow: number
  red: number
}

export interface Dribbles {
  attempts: number
  success: number
  past: number | null
}

export interface Duels {
  total: null
  won: null
}

export interface Fouls {
  drawn: number
  committed: number
}

export interface Games {
  minutes: number
  number: number
  position: Pos
  rating: string
  captain: boolean
  substitute: boolean
}

export interface StatisticGoals {
  total: number | null
  conceded: number
  assists: null
  saves: number | null
}

export interface Passes {
  total: number
  key: number
  accuracy: string
}

export interface Penalty {
  won: null
  commited: null
  scored: number
  missed: number
  saved: number | null
}

export interface Shots {
  total: number
  on: number
}

export interface Tackles {
  total: number | null
  blocks: number
  interceptions: number
}

export interface Score {
  halftime: TeamsClass
  fulltime: TeamsClass
  extratime: TeamsClass
  penalty: TeamsClass
}

export interface IFixtureStatistic {
  team: Team
  statistics: StatisticStatistic[]
}

export interface StatisticStatistic {
  type: string
  value: number | string
}
