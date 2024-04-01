import { configs } from '@configs/index'
import africastalking from 'africastalking'
import axios, { AxiosRequestConfig } from 'axios'
import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
interface ICommunication {
  sendSms(phone: string, message: string): Promise<boolean>
}
const sendSmsAfrikasTalking = async (fastify: FastifyInstance, phone: string, message: string) => {
  const atClient = africastalking({ apiKey: configs.afrikasTalking.apiKey, username: configs.afrikasTalking.username })
  const smsClient = atClient.SMS
  try {
    const response = await smsClient.send({
      to: [fastify.helpers.formatPhoneNumber(phone)],
      message,
      from: configs.afrikasTalking.senderId,
    })
    if (!response) return false
    return true
  } catch (error) {
    fastify.Sentry.captureException(error)
    return false
  }
}

const sendSmsLeopardSms = async (fastify: FastifyInstance, phone: string, message: string) => {
  try {
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: 'https://api.smsleopard.com/v1/sms/send',
      auth: {
        username: configs.smsLeopard.apiKey,
        password: configs.smsLeopard.apiSecret,
      },
      data: {
        source: 'sms_test',
        message: message,
        destination: [
          {
            number: fastify.helpers.formatPhoneNumber(phone),
          },
        ],
      },
    }
    const response = await axios(config)
      .then((resp) => {
        fastify.log.info(resp?.data)
        return true
      })
      .catch((err) => {
        fastify.log.info(err?.response?.data)
        fastify.Sentry.captureException(err?.response?.data)
        return false
      })
    return response
  } catch (error) {
    return false
  }
}
export default fp<ICommunication>(async (fastify) => {
  const sendSms = async (phone: string, message: string): Promise<boolean> => {
    try {
      switch (configs.smsPlatform) {
        case 'smsleopard': {
          const response = await sendSmsAfrikasTalking(fastify, phone, message)
          return response
        }
        case 'africastalking': {
          const response = await sendSmsLeopardSms(fastify, phone, message)
          return response
        }
      }
    } catch (error) {
      return false
    }
  }
  fastify.decorate('messaging', { sendSms })
})

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    messaging: ICommunication
  }
}
