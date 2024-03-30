import { configs } from '@configs/index'
import { User } from '@prisma/client'
import fp from 'fastify-plugin'
import jwt from 'jsonwebtoken'
interface IFormatCurreny {
  currency: 'CAD' | 'KSH' | 'USD'
  amount: number
}
interface IJWTToken {
  sign: (options: User) => string
  verify: (token: string) => User | null
}
export interface SupportPluginOptions {
  formatPhoneNumber(phone: string): string
  formatCurrency(params: IFormatCurreny): string
  validateEmailAddress(email: string): boolean
  validatePhoneNumber(phone: string): boolean
  jwt: IJWTToken
}
export const token = {
  /**
   * Use JWT to sign a token
   */
  sign: (options: User) => {
    if (!options?.id || !options?.role) {
      throw new Error('Expects email, account type and id in payload.')
    }

    return jwt.sign(options, configs.jwtsecret)
  },
  /**
   * Verify token, and get passed in variables
   */
  verify: (tokenValue: string): User | null => {
    try {
      return jwt.verify(tokenValue, configs.jwtsecret) as User
    } catch (error) {
      return null
    }
  },
}

const formatPhoneNumber = (phone: string): string => {
  if (phone.startsWith('0')) {
    phone = phone.replace('0', '254')
  } else if (phone.startsWith('+')) {
    phone = phone.substring(1)
  } else if (phone.startsWith('0110') || phone.startsWith('0111')) {
    phone = phone.replace('0', '254')
  } else if (phone.startsWith('7')) {
    phone = '254' + phone
  }

  return phone
}

const formatCurrency = ({ currency, amount }: IFormatCurreny) => {
  return Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0)
}

const validateEmailAddress = (email = ''): boolean => {
  email = email.replace(/\s/g, '').toLowerCase()
  if (!email) {
    return false
  }
  return /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email)
}
const validatePhoneNumber = (phone: string): boolean => {
  return /^\d{12}$/.test(formatPhoneNumber(phone))
}
// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(async (fastify, _opts) => {
  fastify.decorate('helpers', { formatPhoneNumber, formatCurrency, validateEmailAddress, validatePhoneNumber, jwt: token })
})

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    helpers: SupportPluginOptions
  }
}
