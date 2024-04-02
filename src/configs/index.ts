import { config } from 'dotenv'

config()

export interface IConfig {
  firebaseAccountJsonFile: string
  apiurl: string
  uiurl: string
  jwtsecret: string
  rapidApiKey: string
  rapidApiHost: string
  email: {
    host: string
    port: number
    address: string
    password: string
  }
  appname: string
  port: number | string

  stkCallbackUrl: string
  defaultUserPassword: string
  afrikasTalking: {
    apiKey: string
    senderId: string
    username: string
  }
  smsLeopard: {
    name: string
    apiKey: string
    apiSecret: string
    accessToken: string
  }
  env: {
    production: boolean
    staging: boolean
    development: boolean
  }
  mpesa: {
    shortCode: number
    initiatorPassword: string
    initiatorName: string
    consumerKey: string
    consumerSecret: string
    passKey: string
  }
  smsPlatform: 'smsleopard' | 'africastalking'
}

const env = {
  staging: process.env.NODE_ENV === `staging`,
  production: process.env.NODE_ENV === `production`,
  development: process.env.NODE_ENV === `development`,
}
export const configs: IConfig = {
  apiurl: (env.production ? process.env.API_PROD_URL : env.staging ? process.env.API_STAGING_URL : process.env.API_LOCAL_URL)!,
  uiurl: env.production ? process.env.UI_PROD_URL! : process.env.UI_LOCAL_URL!,
  jwtsecret: process.env.JWT_SECRET_KEY!,
  email: {
    host: process.env.APP_EMAIL_HOST!,
    port:
      process.env.APP_EMAIL_HOST!.includes('gmail')! ||
      process.env.APP_EMAIL_HOST!.includes('zoho') ||
      process.env.APP_EMAIL_HOST!.includes('mailgun')
        ? 587
        : 25,
    address: process.env.APP_EMAIL_ADDRESS!,
    password: process.env.APP_EMAIL_PASSWORD!,
  },
  appname: process.env.APPLICATION_NAME!,
  firebaseAccountJsonFile: '',
  port: process.env.PORT || 3000,

  stkCallbackUrl: `${process.env.STK_ROOT_DOMAIN}/api/stk-callback`,
  defaultUserPassword: process.env.DEFAULT_USER_PASSOWRD!,
  env,
  rapidApiHost: process.env.XRapidAPIHost!,
  rapidApiKey: process.env.XRapidAPIKey!,
  afrikasTalking: {
    apiKey: process.env.AFRICAS_TALKING_API_KEY!,
    senderId: '',
    username: 'betpoabackned',
  },
  smsLeopard: {
    accessToken: process.env.LEOPARD_ACCESS_TOKEN!,
    apiKey: process.env.LEOPARD_API_KEY!,
    apiSecret: process.env.LEOPARD_API_SECRET!,
    name: process.env.LEOPARD_APP_NAME!,
  },
  smsPlatform: process.env.DEFAULT_SMS_PLATFORM?.toLowerCase().includes('LEOPARD') ? 'smsleopard' : 'africastalking',
  mpesa: {
    initiatorPassword: process.env.INTITIATOR_PASSWORD!,
    initiatorName: process.env.INTITIATOR_NAME!,
    shortCode: parseInt(process.env.MPESA_SHORT_CODE!),
    consumerKey: process.env.CONSUMER_KEY!,
    consumerSecret: process.env.CONSUMER_SECRET!,
    passKey: process.env.PASSKEY!,
  },
}
