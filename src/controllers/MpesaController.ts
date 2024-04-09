import { MpesaCallbackResponse } from '@utils/mpesa/type'
import dayjs from 'dayjs'

import { BaseController } from './BaseController'

export default class MpesaController extends BaseController {
  async handleMpesaDepositCallback() {
    try {
      const body = this.body as MpesaCallbackResponse
      // check if transaction exist
      const transaction = await this.app.prisma.transaction.findUnique({
        where: {
          checkoutRequestId_merchantRequestId: {
            checkoutRequestId: body.Body.stkCallback.CheckoutRequestID,
            merchantRequestId: body.Body.stkCallback.MerchantRequestID,
          },
        },
      })

      if (transaction && transaction.status == 'PENDING') {
        if (body.Body.stkCallback.ResultCode == 0) {
          // transaction was a success
          const amount = Number(body.Body.stkCallback.CallbackMetadata.Item.find((a) => a?.Name == 'Amount')?.Value ?? '0')
          const transId = body.Body.stkCallback.CallbackMetadata.Item.find((a) => a?.Name == 'MpesaReceiptNumber')?.Value?.toString()
          const phone = body.Body.stkCallback.CallbackMetadata.Item.find((a) => a?.Name == 'PhoneNumber')?.Value?.toString()
          await this.app.prisma.transaction.update({
            where: {
              id: transaction.id,
            },
            data: {
              status: 'SUCCESS',
              amount,
              transactionId: transId,
              type: 'DEPOSIT',
              phone,
              date: dayjs().toDate(),
              user: {
                update: {
                  accountBalance: {
                    increment: amount,
                  },
                },
              },
            },
          })
        } else {
          // mark transaction as a failure
          await this.app.prisma.transaction.update({
            where: {
              id: transaction.id,
            },
            data: {
              status: 'FAILED',
            },
          })
        }
      } else {
        return { success: true, message: 'Success! Callback received' }
      }
    } catch (error) {
      this.app.Sentry.captureException(error)
      return this.res.status(500).send({
        success: false,
        message: 'Failed! Something went wrong',
      })
    }
  }
}
