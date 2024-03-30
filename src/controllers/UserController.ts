import { compare, genSaltSync, hash } from 'bcrypt'

import { ISignInBody, ISignUpBody } from './interface/user'
import { BaseController } from './BaseController'
export class UserController extends BaseController {
  async signupCustomer() {
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
      return this.res.status(400).send({
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
    return this.res.status(201).send({
      id: user?.id,
      success: true,
      message: 'Success! User Created',
    })
  }
  async loginUser() {
    try {
      const body = this.req.body as ISignInBody
      const user = await this.app.prisma.user.findUnique({
        where: {
          phone: body.phone,
        },
      })
      if (!user) {
        return this.res.status(400).send({
          id: null,
          success: false,
          message: 'Failed! Invalid credentials provided',
        })
      }
      const password = await compare(body.password, user.password)
      if (!password) {
        return this.res.status(403).send({
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
      return this.res.status(500).send({
        id: null,
        success: false,
        message: 'Failed! Something went wrong please try again',
      })
    }
  }
}
