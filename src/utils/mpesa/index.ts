import { configs } from '@configs/index'
import * as Sentry from '@sentry/node'
import axios from 'axios'
import { constants, publicEncrypt } from 'crypto'
import dayjs from 'dayjs'
import { readFileSync } from 'fs'
import { join, resolve } from 'path'
import { v4 as uuidv4 } from 'uuid'

import {
  IntitateMpesaStkResponse,
  MpesaB2BResponse,
  MpesaExpressResponse,
  MpesaTransactionStatus,
  MpesaTransactionStatusResponse,
  StkResponse,
} from './type'

Sentry.init({
  dsn: process?.env?.production
    ? 'https://97cf720cc266f26eee9d8df64310e4bb@events.ifunza.com/4'
    : 'https://67ec6114283691cc0666e3ca620840b0@events.ifunza.com/5',
})
class MpesaLibrary {
  private static baseUrl: string = process.env.NODE_ENV == 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke'

  private static certPath: string =
    process.env.NODE_ENV == 'production'
      ? join(process.cwd(), 'conf', 'ProductionCertificate.cer')
      : join(process.cwd(), 'conf', 'SandboxCertificate.cer')
  // GET MPESA API CREDENTIALS

  private static async authenticate(): Promise<string | null> {
    try {
      const token: string = btoa(`${configs.mpesa.consumerKey}:${configs.mpesa.consumerSecret}`)
      const config = {
        method: 'get',
        url: `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        headers: {
          Authorization: `Basic ${token}`,
        },
      }
      const authToken = await axios(config)
        .then((result) => {
          return result?.data['access_token']
        })
        ?.catch((err) => {
          Sentry.captureException(err)
          return null
        })
      return authToken
    } catch (err) {
      Sentry.captureException(err)
      return null
    }
  }

  // GENERATES SECURITY CREDENTIALS FOR ENDPOINTS THAT REQUIRE securityCredentials
  private static generateSecurityCredentials(): string | null {
    try {
      const bufferToEncrypt = Buffer.from(configs.mpesa.initiatorPassword, 'utf-8')
      const data = readFileSync(resolve(this.certPath), 'utf-8')
      const privateKey = String(data)
      const encrypted = publicEncrypt(
        {
          key: privateKey,
          padding: constants.RSA_PKCS1_PADDING,
        },
        bufferToEncrypt,
      )
      return encrypted.toString('base64')
    } catch (error) {
      Sentry.captureException(error)
      return null
    }
  }

  // GENERATE MPESA BASE64 KEY
  private static generateMpesaPassword(): { password: string; timestamp: string } {
    const timestamp: string = dayjs().format('YYYYMMDDhhmmss').toString()
    const password: string = btoa(`${configs.mpesa.shortCode}${configs.mpesa.passKey}${timestamp}`)
    return {
      timestamp,
      password,
    }
  }

  // FORMAT PHONE NUMBER TO CONFIRM TO MPESA FORMAT
  private static formatPhoneNumber(phone: string): number {
    if (phone.startsWith('0')) {
      phone = phone.replace('0', '254')
    } else if (phone.startsWith('+')) {
      phone = phone.substring(1)
    } else if (phone.startsWith('0110') || phone.startsWith('0111')) {
      phone = phone.replace('0', '254')
    } else if (phone.startsWith('7')) {
      phone = '254' + phone
    }
    return parseInt(phone.trim())
  }

  /**
   * Intiates an stk push
   * @param phone Phone Number to deliver the stk push to
   * @param amount Amount To Initate The Stk Push For
   * @param 13 letter uniqueIdentifier for this transaction
   * @returns @IntitateMpesaStkResponse
   */
  static async initiateMpesaStkPush({
    phone,
    amount,
    uniqueId,
    callbackUrl,
  }: {
    phone: string
    amount: number
    uniqueId: string
    callbackUrl?: string
  }): Promise<IntitateMpesaStkResponse> {
    try {
      const authToken = await this.authenticate()
      const authentication = this.generateMpesaPassword()
      const body = JSON.stringify({
        BusinessShortCode: Number(configs.mpesa.shortCode),
        Password: authentication.password,
        Timestamp: authentication.timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Number(amount),
        PartyA: this.formatPhoneNumber(phone),
        PartyB: configs.mpesa.shortCode,
        PhoneNumber: this.formatPhoneNumber(phone),
        CallBackURL: `${configs.stkCallbackUrl}${callbackUrl ?? '/api/c2b/stk-callback'}`,
        AccountReference: 'iFunza',
        TransactionDesc: uniqueId,
      })

      const response = await axios
        .post(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, body, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        })
        ?.then((resp) => {
          return resp?.data as StkResponse
        })
        ?.catch((err) => {
          Sentry.captureException(err, {
            extra: {
              data: err?.response?.data,
            },
          })

          return <StkResponse>{ ResponseCode: '1', CustomerMessage: err?.response?.data?.errorMessage ?? 'Failed! Something went wrong' }
        })
      if (response?.ResponseCode == '0') {
        return {
          success: true,
          message: response?.CustomerMessage ?? 'Success! Mpesa initiated',
          CheckoutRequestID: `${response?.CheckoutRequestID}`,
          MerchantRequestID: `${response?.MerchantRequestID}`,
        }
      } else {
        return {
          success: false,
          message: response?.CustomerMessage ?? 'Failed! Something went wrong please try again',
        }
      }
    } catch (error) {
      Sentry.captureException(error)
      return {
        success: false,
        message: 'Failed! Could Not Intiate Mpesa Transaction',
      }
    }
  }

  /**
   * Checks The Status Of an stk push if the transaction was completed successfully
   *
   * @param checkoutRequestID Checkout Request ID Of the transaction to check the status
   */
  static async checkLipaNaMpesaStatus(checkoutRequestID: string): Promise<MpesaTransactionStatusResponse> {
    try {
      const authToken = await this.authenticate()
      const authentication = this.generateMpesaPassword()
      const response: MpesaExpressResponse = await axios
        .post(
          `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
          {
            BusinessShortCode: configs.mpesa.shortCode,
            Password: authentication.password,
            Timestamp: authentication.timestamp,
            CheckoutRequestID: checkoutRequestID,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${authToken}`,
            },
          },
        )
        ?.then((resp) => {
          return resp?.data as MpesaTransactionStatus
        })
        ?.catch((err) => {
          Sentry.captureException(err)
          return <MpesaTransactionStatus>{
            ResultCode: '1',
            ResponseCode: '1',
            ResultDesc: err?.response?.data?.errorMessage ?? 'Failed! Something went wrong',
          }
        })
      if (response?.ResponseCode == '0') {
        if (response?.ResultCode == '0') {
          return {
            stkPushSuccess: true,
            callbackSuccess: true,
            CheckoutRequestID: `${response?.CheckoutRequestID}`,
            MerchantRequestID: `${response?.MerchantRequestID}`,
            ResponseCode: response?.ResponseCode,
            ResponseDescription: `${response?.ResponseDescription}`,
            ResultCode: response?.ResultCode,
            ResultDesc: `${response?.ResultDesc}`,
          }
        } else {
          return {
            stkPushSuccess: true,
            callbackSuccess: false,
            CheckoutRequestID: response?.CheckoutRequestID,
            MerchantRequestID: response?.MerchantRequestID,
            ResponseCode: response?.ResponseCode,
            ResponseDescription: response?.ResponseDescription,
            ResultCode: response?.ResultCode,
            ResultDesc: response?.ResultDesc,
          }
        }
      } else {
        return {
          stkPushSuccess: false,
          callbackSuccess: false,
          CheckoutRequestID: response?.CheckoutRequestID,
          MerchantRequestID: response?.MerchantRequestID,
          ResponseCode: response?.ResponseCode,
          ResponseDescription: response?.ResponseDescription,
          ResultCode: response?.ResultCode,
          ResultDesc: response?.ResultDesc,
        }
      }
    } catch (error) {
      Sentry.captureException(error)
      return {
        stkPushSuccess: false,
        callbackSuccess: false,
        ResponseDescription: 'Failed! Could Not Verify Transaction',
        ResultDesc: 'Failed! Could Not Verify Transaction',
        CheckoutRequestID: checkoutRequestID,
        MerchantRequestID: null,
        ResponseCode: '1032',
        ResultCode: '1032',
      }
    }
  }

  /**
   * Make Payouts to a specific paybill or bank account through paybill
   * @param amount Amount to transfer
   * @param receiverPaybill Paybill to receive the funds
   * @param accountName Account Name of the paybill receiving the funds
   * @returns
   */
  static async payoutToPayBill({
    amount,
    receiverPaybill,
    accountName,
  }: {
    amount: number
    receiverPaybill: string
    accountName: string
  }): Promise<MpesaB2BResponse> {
    try {
      const config = {
        OriginatorConversationID: uuidv4(),
        Initiator: configs.mpesa.initiatorName,
        SecurityCredential: this.generateSecurityCredentials(),
        CommandID: 'BusinessPayBill',
        SenderIdentifierType: '4',
        RecieverIdentifierType: '4',
        Amount: amount,
        PartyA: configs.mpesa.shortCode,
        PartyB: receiverPaybill,
        AccountReference: accountName,
        Remarks: 'ok',
        QueueTimeOutURL: `${configs.stkCallbackUrl}/api/mpesa/paybilltimeout`,
        ResultURL: `${configs.stkCallbackUrl}/api/mpesa/payouttotaybill`,
      }
      const authToken = await this.authenticate()

      const response = await axios
        .post(`${this.baseUrl}/mpesa/b2b/v1/paymentrequest`, config, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        })
        ?.then((resp) => resp?.data as MpesaB2BResponse)
        ?.catch((err) => {
          Sentry.captureException(err)
          return <MpesaB2BResponse>{
            ConversationID: null,
            ResponseCode: '1',
            ResponseDescription: err?.response?.data?.errorMessage ?? 'Failed! Something went wrong',
          }
        })
      return response
    } catch (error) {
      Sentry.captureException(error)
      return {
        ConversationID: null,
        ResponseCode: '1',
        OriginatorConversationID: null,
        ResponseDescription: 'Failed! Something went wrong',
      }
    }
  }

  /**
   * Make Payouts to user buygoods account.
   * @param param0
   * @returns
   */
  static async payoutToBuyGoods({ amount, receiverBuyGoods }: { amount: number; receiverBuyGoods: string }): Promise<MpesaB2BResponse> {
    try {
      const data = {
        OriginatorConversationID: uuidv4(),
        Initiator: configs.mpesa.initiatorName,
        SecurityCredential: this.generateSecurityCredentials(),
        CommandID: 'BusinessBuyGoods',
        SenderIdentifierType: '4',
        RecieverIdentifierType: '4',
        Amount: amount,
        PartyA: configs.mpesa.shortCode,
        PartyB: receiverBuyGoods,
        Remarks: 'ok',
        QueueTimeOutURL: `${configs.stkCallbackUrl}/api/mpesa/buygoodstimeout`,
        ResultURL: `${configs.stkCallbackUrl}/api/mpesa/payoutbuygoods`,
      }
      const authToken = await this.authenticate()

      const response = await axios
        .post(`${this.baseUrl}/mpesa/b2b/v1/paymentrequest`, data, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        })
        ?.then((resp) => resp?.data as MpesaB2BResponse)
        ?.catch((err) => {
          Sentry.captureException(err, {
            extra: {
              data: err?.response?.data,
            },
          })
          return <MpesaB2BResponse>{
            ConversationID: null,
            ResponseCode: '1',
            ResponseDescription: err?.response?.data?.errorMessage ?? 'Error! Something went wrong please try again',
          }
        })
      return response
    } catch (error) {
      Sentry.captureException(error)
      return {
        ConversationID: null,
        ResponseCode: '1',
        OriginatorConversationID: null,
        ResponseDescription: 'Failed! Something went wrong',
      }
    }
  }

  static async payoutToMobileNumber({
    phone,
    amount,
    reference,
    remarks,
  }: {
    phone: string
    amount: number
    reference?: string
    remarks?: string
  }): Promise<MpesaB2BResponse> {
    try {
      const authentication = await this.authenticate()
      const body = {
        OriginatorConversationID: reference ?? uuidv4(),
        InitiatorName: configs.mpesa.initiatorName,
        SecurityCredential: this.generateSecurityCredentials(),
        CommandID: 'BusinessPayment',
        Amount: amount,
        PartyA: configs.mpesa.shortCode,
        PartyB: this.formatPhoneNumber(phone),
        Remarks: remarks ?? 'Test remarks',
        QueueTimeOutURL: `${configs.stkCallbackUrl}/api/mpesa/mobiletimeout`,
        ResultURL: `${configs.stkCallbackUrl}/api/mpesa/mobileResult`,
        occasion: 'null',
      }
      const response = await axios
        .post(`${this.baseUrl}/mpesa/b2c/v3/paymentrequest`, body, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authentication}`,
          },
        })
        ?.then((resp) => resp?.data as MpesaB2BResponse)
        .catch((err) => {
          Sentry.captureException(err, {
            extra: {
              response: err?.response?.data,
            },
          })
          return <MpesaB2BResponse>{
            ConversationID: null,
            OriginatorConversationID: null,
            ResponseCode: '1',
            ResponseDescription: err?.response?.data?.errorMessage ?? 'Failed! Something went wrong please try again',
          }
        })
      return response
    } catch (error) {
      Sentry.captureException(error)
      return {
        ConversationID: null,
        OriginatorConversationID: null,
        ResponseCode: '1',
        ResponseDescription: 'Failed! Something went wrong please try again',
      }
    }
  }
}
export default MpesaLibrary
