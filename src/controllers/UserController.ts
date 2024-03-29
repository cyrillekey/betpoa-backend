import { BaseController } from "./BaseController";
import { ISignUpBody } from "./interface/user";
import {  genSaltSync, hash } from 'bcrypt'
export class UserController extends BaseController {
    async signupCustomer() {
        const body: ISignUpBody = this.req.body as ISignUpBody
        const phone = this.app.helpers.formatPhoneNumber(body.phone)
        if (!this.app.helpers.validatePhoneNumber(phone)) {
            return this.res.status(400).send({
                success: false,
                id: null,
                message: "Invalid Phone number provided"
            })
        }
        const exists = await this.app.prisma.user.findFirstOrThrow({
            where: {
                phone: phone
            },
            select: {
                id: true
            }
        }).then((response) => response?.id).catch(() => null)
        if (exists)
            return this.res.status(400).send({
                success: false,
                id: null,
                message: "Failed! Phone number already used"
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
                        lname: 'Customer'
                    }
                }

            }
        })
        return this.res.status(201).send({
            id: user?.id,
            success: true,
            message: "Success! User Created"
        })

    }
}