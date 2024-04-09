import { configs } from '@configs/index'
import { Prisma } from '@prisma/client'
import MpesaLibrary from '@utils/mpesa'
import { compare, genSaltSync, hash } from 'bcrypt'
import dayjs from 'dayjs'
import { v4 } from 'uuid'

import { IDefaultResponse } from './interface/fixtures'
import { IPasswordResetBody, IPasswordUpdateBody, ISignInBody, ISignUpBody, IUpdateUserBody, IValidateOptBody } from './interface/user'
import { BaseController } from './BaseController'
export class UserController extends BaseController {
  private generateOtp = (length = 4) => {
    let otp = ''

    for (let i = 0; i < length; i++) {
      otp += Math.floor(Math.random() * 10)
    }

    return otp
  }
  async signupCustomer() {
    try {
      const body: ISignUpBody = this.req.body as ISignUpBody
      const phone = this.app.helpers.formatPhoneNumber(body.phone)
      if (!this.app.helpers.validatePhoneNumber(phone)) {
        return this.res.status(400).send({
          success: false,
          id: null,
          message: 'Invalid Phone number provided',
        })
      }
      const exists = await this.app.prisma.user
        .findFirstOrThrow({
          where: {
            phone: phone,
          },
          select: {
            id: true,
          },
        })
        .then((response) => response?.id)
        .catch(() => null)
      if (exists)
        return this.res.status(400).send(<IDefaultResponse>{
          success: false,
          id: null,
          message: 'Failed! Phone number already used',
        })
      const salt = genSaltSync(10)
      const password = await hash(body.password, salt)
      const user = await this.app.prisma.user.create({
        data: {
          password,
          phone,
          phoneValidated: false,
          profile: {
            create: {
              fname: 'Customer',
              lname: 'Customer',
            },
          },
        },
      })
      const jwtUser = {
        id: user?.id,
        phone: user?.phone,
        phoneValidated: user?.phoneValidated,
        profileId: user?.profileId,
        role: user?.role,
      }
      const token = this.app.helpers.jwt.sign(jwtUser)

      return this.res.status(201).send(<IDefaultResponse>{
        id: user?.id,
        success: true,
        message: 'Success! User Created',
        token: token,
        user: jwtUser,
      })
    } catch (error) {
      this.app.Sentry.captureException(error)
      return this.res.status(500).send(<IDefaultResponse>{
        id: null,
        success: false,
        message: 'Failed! Something went wrong please try again',
      })
    }
  }
  async loginUser() {
    try {
      const body = this.req.body as ISignInBody
      const user = await this.app.prisma.user.findUnique({
        where: {
          phone: this.app.helpers.formatPhoneNumber(body.phone),
        },
      })
      if (!user) {
        return this.res.status(400).send(<IDefaultResponse>{
          id: null,
          success: false,
          message: 'Failed! Invalid credentials provided',
        })
      }
      const password = await compare(body.password, user.password)
      if (!password) {
        return this.res.status(403).send(<IDefaultResponse>{
          id: null,
          success: false,
          message: 'Failed! Invalid credentials provided',
        })
      }
      const jwtUser = {
        id: user?.id,
        phone: user?.phone,
        phoneValidated: user?.phoneValidated,
        profileId: user?.profileId,
        role: user?.role,
      }
      const token = this.app.helpers.jwt.sign(jwtUser)
      return this.res.status(200).send({
        id: user?.id,
        sucess: true,
        token: token,
        user: jwtUser,
      })
    } catch (error) {
      this.app.Sentry.captureException(error)
      return this.res.status(500).send(<IDefaultResponse>{
        id: null,
        success: false,
        message: 'Failed! Something went wrong please try again',
      })
    }
  }
  async requestPhoneOtp() {
    try {
      const user = await this.app.prisma.user.findUnique({
        where: {
          id: this.req.user.id,
        },
      })
      if (!user) {
        return this.res.status(404).send(<IDefaultResponse>{
          id: null,
          success: false,
          message: 'Error! User Not Found Please try again',
        })
      }
      if (user?.phoneValidated) {
        return this.res.status(400).send(<IDefaultResponse>{
          id: null,
          success: false,
          message: 'Error! User Phone already verified',
        })
      }
      const token = this.generateOtp(6)
      await this.app.prisma.otpToken.create({
        data: {
          userId: user?.id,
          expiryDate: dayjs().add(10, 'minutes').toDate(),
          token,
        },
      })
      await this.app.messaging.sendSms(user.phone, `Your ${configs.appname} OTP is ${token}. This token is valid for the next 10 minutes`)
      return this.res.status(200).send(<IDefaultResponse>{
        id: null,
        success: true,
        message: `Success! OTP sent to ${user.phone}`,
      })
    } catch (error) {
      this.app.Sentry.captureException(error)
      return this.res.status(500).send(<IDefaultResponse>{
        id: null,
        success: false,
        message: 'Error! Something went wrong please try again',
      })
    }
  }
  async validateOtp() {
    try {
      const body: IValidateOptBody = this.req.body as IValidateOptBody
      const phoneOtp = await this.app.prisma.otpToken
        .findFirstOrThrow({
          where: {
            userId: this.req.user.id,
            token: body.otp,
            expiryDate: {
              gte: dayjs().toDate(),
            },
          },
        })
        .then((resp) => resp?.id)
        .catch(() => null)
      if (!phoneOtp)
        return this.res.status(400).send(<IDefaultResponse>{
          id: null,
          success: false,
          message: 'Failed! Invalid token provided',
        })
      await this.app.prisma.user.update({
        where: {
          id: this.req.user.id,
        },
        data: {
          phoneValidated: true,
        },
      })
      await this.app.prisma.otpToken.delete({
        where: {
          id: phoneOtp,
        },
      })
      return this.res.status(200).send(<IDefaultResponse>{
        id: this.req.user.id,
        success: true,
        message: 'Success! User Verified',
      })
    } catch (error) {
      this.app.Sentry.captureException(error)
      return this.res.status(500).send(<IDefaultResponse>{
        id: null,
        success: false,
        message: 'Error! Something went wrong please try again',
      })
    }
  }
  async updateUser() {
    try {
      const body: IUpdateUserBody = this.req.body as IUpdateUserBody

      const update: Prisma.UserProfileUpdateInput = {
        fname: body?.fname,
        lname: body?.lname,
        email: body?.email,
      }
      if (body?.avatar) {
        update.avatar = {
          create: {
            filename: body.avatar.filename,
            link: body.avatar.link,
            fileType: body.avatar.fileType,
          },
        }
      }
      const user = await this.app.prisma.userProfile.update({
        where: {
          id: this.req.user.profileId,
        },
        data: update,
      })
      if (!user?.id)
        return this.res.status(500).send(<IDefaultResponse>{
          id: null,
          success: false,
          message: 'Failed! Could not update profile please try again',
        })
      return this.res.send({
        id: user?.id,
        success: true,
        message: 'Success! User Updated successfully',
      })
    } catch (error) {
      this.app.Sentry.captureException(error)
      return this.res.status(500).send(<IDefaultResponse>{
        id: null,
        success: false,
        message: 'Error! Something went wrong please try again',
      })
    }
  }
  async requestPasswordReset() {
    try {
      const body: IPasswordResetBody = this.req.body as IPasswordResetBody
      const isValid = this.app.helpers.validatePhoneNumber(body.phone)
      if (!isValid)
        return this.res.status(500).send(<IDefaultResponse>{
          id: null,
          success: false,
          message: 'Error! Invalid phone number provided',
        })
      const exists = await this.app.prisma.user.findUnique({
        where: {
          phone: this.app.helpers.formatPhoneNumber(body.phone),
        },
      })
      if (!exists) {
        return this.res.status(500).send(<IDefaultResponse>{
          id: null,
          success: false,
          message: 'Error! Account does not exist',
        })
      }
      const token = this.generateOtp(6)
      await this.app.prisma.otpToken.create({
        data: {
          userId: exists.id,
          expiryDate: dayjs().add(10, 'minutes').toDate(),
          token,
        },
      })
      await this.app.messaging.sendSms(exists.phone, `Your ${configs.appname} OTP is ${token}. This token is valid for the next 10 minutes`)
      return this.res.status(200).send(<IDefaultResponse>{
        id: null,
        success: true,
        message: `Success! Password reset OTP sent to mobile`,
      })
    } catch (error) {
      this.app.Sentry.captureException(error)
      return this.res.status(500).send(<IDefaultResponse>{
        id: null,
        success: false,
        message: 'Error! Something went wrong please try again',
      })
    }
  }
  async updateUserPassword() {
    try {
      const body = this.req.body as IPasswordUpdateBody
      const user = await this.app.prisma.user.findUnique({
        where: {
          phone: this.app.helpers.formatPhoneNumber(body.phone),
        },
      })
      if (!user) {
        return this.res.status(404).send(<IDefaultResponse>{
          id: null,
          success: false,
          message: 'Error! User Not Found',
        })
      }
      const phoneOtp = await this.app.prisma.otpToken
        .findFirstOrThrow({
          where: {
            userId: user?.id,
            token: body.otp,
            expiryDate: {
              gte: dayjs().toDate(),
            },
          },
        })
        .then((resp) => resp?.id)
        .catch(() => null)

      if (!phoneOtp)
        return this.res.status(400).send(<IDefaultResponse>{
          id: null,
          success: false,
          message: 'Failed! Invalid token provided',
        })
      const salt = genSaltSync(10)
      const password = await hash(body.password, salt)
      await this.app.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          password,
        },
      })
      const jwtUser = {
        id: user?.id,
        phone: user?.phone,
        phoneValidated: user?.phoneValidated,
        profileId: user?.profileId,
        role: user?.role,
      }
      await this.app.prisma.otpToken.delete({
        where: {
          id: phoneOtp,
        },
      })
      const token = this.app.helpers.jwt.sign(jwtUser)
      return this.res.status(200).send({
        id: user?.id,
        success: true,
        message: 'Success! Password updated',
        token: token,
        user: jwtUser,
      })
    } catch (error) {
      this.app.Sentry.captureException(error)
      this.app.log.error(error)
      return this.res.status(500).send(<IDefaultResponse>{
        id: null,
        success: false,
        message: 'Error! Something went wrong please try again',
      })
    }
  }
  async userMpesaDeposit() {
    try {
      const isPhoneValid = this.app.helpers.validatePhoneNumber(this.body.phone)
      if (!isPhoneValid) {
        return this.res.status(400).send(<IDefaultResponse>{
          id: null,
          success: false,
          message: 'Error! Invalid phone number provided',
        })
      }
      if (Number(this.body.amount) < 10) {
        return this.res.status(400).send(<IDefaultResponse>{
          id: null,
          success: false,
          message: 'Error! Amount should be greater or equal to 10',
        })
      }
      const amount = Number(this.body.amount)
      const phone = this.app.helpers.formatPhoneNumber(this.body.phone)
      const mpesa = await MpesaLibrary.initiateMpesaStkPush({ phone, amount, uniqueId: `${configs.appname}` })
      if (mpesa.success) {
        await this.app.prisma.transaction.create({
          data: {
            userId: this.req.user.id,
            amount: 0.0,
            date: new Date(),
            transactionId: '',
            type: 'DEPOSIT',
            status: 'PENDING',
            checkoutRequestId: mpesa.CheckoutRequestID,
            merchantRequestId: mpesa.MerchantRequestID,
          },
        })
        return this.res.send(<IDefaultResponse>{
          success: true,
          id: null,
          message: mpesa?.message,
        })
      } else {
        return this.res.status(400).send(<IDefaultResponse>{
          success: false,
          id: null,
          message: mpesa?.message,
        })
      }
    } catch (error) {
      this.app.Sentry.captureException(error)
      this.app.log.error(error)
      return this.res.status(500).send(<IDefaultResponse>{
        id: null,
        success: false,
        message: 'Error! Something went wrong please try again',
      })
    }
  }
  async mpesaWithdraw() {
    try {
      const amount = Number(this.body.amount?.phone.toString())
      const user = await this.app.prisma.user.findUnique({
        where: {
          id: this.req.user.id,
        },
        select: {
          id: true,
          accountBalance: true,
          phone: true,
        },
      })
      const hasBalance = user!.accountBalance - amount
      if (hasBalance < 0) {
        return this.res.status(400).send(<IDefaultResponse>{
          id: null,
          success: false,
          message: 'Failed! Amount exceeds account balance',
        })
      }
      const mpesa = await MpesaLibrary.payoutToMobileNumber({ phone: user!.phone, amount, reference: v4(), remarks: 'Bepoa Payout' })
      if (!mpesa?.ConversationID)
        return this.res.status(400).send(<IDefaultResponse>{
          id: null,
          success: false,
          message: mpesa?.ResponseDescription,
        })
      await this.app.prisma.transaction.create({
        data: {
          amount,
          phone: user?.phone,
          date: dayjs().toDate(),
          checkoutRequestId: mpesa.ConversationID,
          merchantRequestId: mpesa.OriginatorConversationID,
          status: 'PENDING',
          type: 'WITHDRAWAL',
          transactionId: '',
          userId: user!.id,
        },
      })
      return <IDefaultResponse>{
        id: null,
        success: true,
        message: 'Success! Mpesa withdrawal initiated',
      }
    } catch (error) {
      this.app.Sentry.captureException(error)
      this.app.log.error(error)
      return this.res.status(500).send(<IDefaultResponse>{
        id: null,
        success: false,
        message: 'Error! Something went wrong please try again',
      })
    }
  }
}
