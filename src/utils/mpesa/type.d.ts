export interface IntitateMpesaStkResponse {
  success: boolean
  message: string
  CheckoutRequestID?: string
  MerchantRequestID?: string
}
export interface MpesaTransactionStatus {
  ResponseCode: string
  ResponseDescription: string
  MerchantRequestID: string
  CheckoutRequestID: string
  ResultCode: string
  ResultDesc: string
}

export interface MpesaTransactionStatusResponse {
  /**
   * Status of mpesa stk push
   */
  stkPushSuccess: boolean
  /**
   * Status of mpesa final transaction
   */
  callbackSuccess: boolean
  /**
   * STK PUSH RESPONSE CODE
   */
  ResponseCode?: string | null
  /**
   * STK PUSH RESPONSE DESCRIPTION
   */
  ResponseDescription?: string | null
  /**
   * MPESA TRANSACTION RESPONSE CODE
   */
  ResultCode?: string | null
  /**
   * MPESA TRANSACTION RESULT DESC
   */
  ResultDesc?: string | null
  /**
   * Merchant request id for the transaction
   */
  MerchantRequestID?: string | null
  /**
   * CHECKOUT REQUEST ID FOR TRANSACTION
   */
  CheckoutRequestID?: string
}
export interface StkResponse {
  MerchantRequestID?: string | null
  CheckoutRequestID?: string | null
  ResponseCode: string | null
  ResponseDescription?: string | null
  CustomerMessage?: string | null
}

export interface MpesaAuth {
  password: string
  timestamp: string
}
export interface MpesaExpressResponse {
  ResponseCode?: string
  ResponseDescription?: string
  MerchantRequestID?: string
  CheckoutRequestID?: string
  ResultCode?: string
  ResultDesc?: string
}
export interface MpesaB2BResponse {
  OriginatorConversationID?: string | null
  ConversationID?: string | null
  ResponseCode?: string
  ResponseDescription?: string
}

export interface MpesaCallbackResponse {
  Body: CallBackBody
}

export interface CallBackBody {
  stkCallback: StkCallback
}

export interface StkCallback {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResultCode: number
  ResultDesc: string
  CallbackMetadata: CallbackMetadata
}

export interface CallbackMetadata {
  Item: Item[]
}

export interface Item {
  Name: string
  Value: number | string
}

export interface MpesaConfirmResponse {
  TransactionType: string
  TransID: string
  TransTime: string
  TransAmount: string
  BusinessShortCode: string
  BillRefNumber: string
  InvoiceNumber: string
  OrgAccountBalance: string
  ThirdPartyTransID: string
  MSISDN: string
  FirstName: string
  MiddleName: string
  LastName: string
}
export interface MPesaB2CResultResponse {
  Result: B2CResult
}

export interface B2CResult {
  ResultType: number
  ResultCode: number
  ResultDesc: string
  OriginatorConversationID: string
  ConversationID: string
  TransactionID: string
  ResultParameters: ResultParameters
  ReferenceData: ReferenceData
}
export interface ReferenceData {
  ReferenceItem: ReferenceItem
}

export interface ReferenceItem {
  Key: string
  Value: string
}

export interface ResultParameters {
  ResultParameter: ResultParameter[]
}

export interface ResultParameter {
  Key: string
  Value: number | string
}
