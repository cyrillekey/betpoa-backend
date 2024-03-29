import fp from 'fastify-plugin'
interface IFormatCurreny {
  currency: 'CAD' | 'KSH' | 'USD'
  amount: number
}
export interface SupportPluginOptions {
  formatPhoneNumber(phone: string): string
  formatCurrency(params: IFormatCurreny): string
  validateEmailAddress(email: string): boolean
  validatePhoneNumber(phone:string): boolean

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
const validatePhoneNumber = (phone:string): boolean => {
  
  return /^\d{12}$/.test(formatPhoneNumber(phone))

}
// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(async (fastify, opts) => {
  fastify.decorate('helpers', { formatPhoneNumber, formatCurrency, validateEmailAddress,validatePhoneNumber })
})

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    helpers: SupportPluginOptions;
  }
}
