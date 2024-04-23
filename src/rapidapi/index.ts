import { configs } from '@configs/index'
import axios, { AxiosRequestConfig } from 'axios'
import dayjs from 'dayjs'

import { OddsApiResponse } from './odd'
import { IFixture, ILeague } from './types'

export const getLeagues = async (): Promise<ILeague[]> => {
  try {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: 'https://api-football-v1.p.rapidapi.com/v3/leagues',
      params: {
        current: true,
      },
      headers: {
        'X-RapidAPI-Key': configs.rapidApiKey,
        'X-RapidAPI-Host': configs.rapidApiHost,
      },
    }
    const response = await axios(config)
      .then((resp) => resp?.data?.response)
      .catch(() => [])

    return response
  } catch (error) {
    return []
  }
}
export async function getUpcomingFixtures(date: Date): Promise<IFixture[]> {
  try {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
      headers: {
        'X-RapidAPI-Key': configs.rapidApiKey,
        'X-RapidAPI-Host': configs.rapidApiHost,
      },
      params: {
        date: dayjs(date).format('YYYY-MM-DD'),
      },
    }
    const response = await axios(config)
      .then((resp) => {
        return resp?.data?.response
      })
      .catch(() => [])
    return response
  } catch (error) {
    return []
  }
}
export async function getFixtures(fixturesId: string[]): Promise<IFixture[]> {
  try {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures',
      headers: {
        'X-RapidAPI-Key': configs.rapidApiKey,
        'X-RapidAPI-Host': configs.rapidApiHost,
      },
      params: {
        ids: fixturesId.join('-'),
      },
    }
    const response = await axios(config)
      .then((resp) => resp?.data?.response)
      .catch(() => [])
    return response
  } catch (error) {
    return []
  }
}

export async function getDateOdds(date: Date, page: number = 1, bookmaker: number): Promise<OddsApiResponse> {
  try {
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: 'https://api-football-v1.p.rapidapi.com/v3/odds',
      headers: {
        'X-RapidAPI-Key': configs.rapidApiKey,
        'X-RapidAPI-Host': configs.rapidApiHost,
      },
      params: { date: dayjs(date).format('YYYY-MM-DD'), bookmaker, page },
    }
    const odds = await axios(config)
      .then((resp) => {
        return <OddsApiResponse>{
          odds: resp?.data?.response,
          hasNext: resp?.data?.paging?.current == resp?.data?.paging?.total,
          page: resp?.data?.paging?.current,
          total: resp?.data?.paging?.total,
        }
      })
      ?.catch(() => <OddsApiResponse>{ hasNext: false, page: 1, odds: [], total: 0 })
    return odds
  } catch (error) {
    return {
      hasNext: false,
      page: 1,
      odds: [],
      total: 0,
    }
  }
}
