"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const index_1 = require("@configs/index");
const mpesa_1 = __importDefault(require("@utils/mpesa"));
const bcrypt_1 = require("bcrypt");
const dayjs_1 = __importDefault(require("dayjs"));
const uuid_1 = require("uuid");
const BaseController_1 = require("./BaseController");
class UserController extends BaseController_1.BaseController {
    generateOtp = (length = 4) => {
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += Math.floor(Math.random() * 10);
        }
        return otp;
    };
    async signupCustomer() {
        try {
            const body = this.req.body;
            const phone = this.app.helpers.formatPhoneNumber(body.phone);
            if (!this.app.helpers.validatePhoneNumber(phone)) {
                return this.res.status(400).send({
                    success: false,
                    id: null,
                    message: 'Invalid Phone number provided',
                });
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
                .catch(() => null);
            if (exists)
                return this.res.status(400).send({
                    success: false,
                    id: null,
                    message: 'Failed! Phone number already used',
                });
            const salt = (0, bcrypt_1.genSaltSync)(10);
            const password = await (0, bcrypt_1.hash)(body.password, salt);
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
            });
            const jwtUser = {
                id: user?.id,
                phone: user?.phone,
                phoneValidated: user?.phoneValidated,
                profileId: user?.profileId,
                role: user?.role,
            };
            const token = this.app.helpers.jwt.sign(jwtUser);
            return this.res.status(201).send({
                id: user?.id,
                success: true,
                message: 'Success! User Created',
                token: token,
                user: jwtUser,
            });
        }
        catch (error) {
            this.app.Sentry.captureException(error);
            return this.res.status(500).send({
                id: null,
                success: false,
                message: 'Failed! Something went wrong please try again',
            });
        }
    }
    async loginUser() {
        try {
            const body = this.req.body;
            const user = await this.app.prisma.user.findUnique({
                where: {
                    phone: this.app.helpers.formatPhoneNumber(body.phone),
                },
            });
            if (!user) {
                return this.res.status(400).send({
                    id: null,
                    success: false,
                    message: 'Failed! Invalid credentials provided',
                });
            }
            const password = await (0, bcrypt_1.compare)(body.password, user.password);
            if (!password) {
                return this.res.status(403).send({
                    id: null,
                    success: false,
                    message: 'Failed! Invalid credentials provided',
                });
            }
            const jwtUser = {
                id: user?.id,
                phone: user?.phone,
                phoneValidated: user?.phoneValidated,
                profileId: user?.profileId,
                role: user?.role,
            };
            const token = this.app.helpers.jwt.sign(jwtUser);
            return this.res.status(200).send({
                id: user?.id,
                sucess: true,
                token: token,
                user: jwtUser,
            });
        }
        catch (error) {
            this.app.Sentry.captureException(error);
            return this.res.status(500).send({
                id: null,
                success: false,
                message: 'Failed! Something went wrong please try again',
            });
        }
    }
    async requestPhoneOtp() {
        try {
            const user = await this.app.prisma.user.findUnique({
                where: {
                    id: this.req.user.id,
                },
            });
            if (!user) {
                return this.res.status(404).send({
                    id: null,
                    success: false,
                    message: 'Error! User Not Found Please try again',
                });
            }
            if (user?.phoneValidated) {
                return this.res.status(400).send({
                    id: null,
                    success: false,
                    message: 'Error! User Phone already verified',
                });
            }
            const token = this.generateOtp(6);
            await this.app.prisma.otpToken.create({
                data: {
                    userId: user?.id,
                    expiryDate: (0, dayjs_1.default)().add(10, 'minutes').toDate(),
                    token,
                },
            });
            await this.app.messaging.sendSms(user.phone, `Your ${index_1.configs.appname} OTP is ${token}. This token is valid for the next 10 minutes`);
            return this.res.status(200).send({
                id: null,
                success: true,
                message: `Success! OTP sent to ${user.phone}`,
            });
        }
        catch (error) {
            this.app.Sentry.captureException(error);
            return this.res.status(500).send({
                id: null,
                success: false,
                message: 'Error! Something went wrong please try again',
            });
        }
    }
    async validateOtp() {
        try {
            const body = this.req.body;
            const phoneOtp = await this.app.prisma.otpToken
                .findFirstOrThrow({
                where: {
                    userId: this.req.user.id,
                    token: body.otp,
                    expiryDate: {
                        gte: (0, dayjs_1.default)().toDate(),
                    },
                },
            })
                .then((resp) => resp?.id)
                .catch(() => null);
            if (!phoneOtp)
                return this.res.status(400).send({
                    id: null,
                    success: false,
                    message: 'Failed! Invalid token provided',
                });
            await this.app.prisma.user.update({
                where: {
                    id: this.req.user.id,
                },
                data: {
                    phoneValidated: true,
                },
            });
            await this.app.prisma.otpToken.delete({
                where: {
                    id: phoneOtp,
                },
            });
            return this.res.status(200).send({
                id: this.req.user.id,
                success: true,
                message: 'Success! User Verified',
            });
        }
        catch (error) {
            this.app.Sentry.captureException(error);
            return this.res.status(500).send({
                id: null,
                success: false,
                message: 'Error! Something went wrong please try again',
            });
        }
    }
    async updateUser() {
        try {
            const body = this.req.body;
            const update = {
                fname: body?.fname,
                lname: body?.lname,
                email: body?.email,
            };
            if (body?.avatar) {
                update.avatar = {
                    create: {
                        filename: body.avatar.filename,
                        link: body.avatar.link,
                        fileType: body.avatar.fileType,
                    },
                };
            }
            const user = await this.app.prisma.userProfile.update({
                where: {
                    id: this.req.user.profileId,
                },
                data: update,
            });
            if (!user?.id)
                return this.res.status(500).send({
                    id: null,
                    success: false,
                    message: 'Failed! Could not update profile please try again',
                });
            return this.res.send({
                id: user?.id,
                success: true,
                message: 'Success! User Updated successfully',
            });
        }
        catch (error) {
            this.app.Sentry.captureException(error);
            return this.res.status(500).send({
                id: null,
                success: false,
                message: 'Error! Something went wrong please try again',
            });
        }
    }
    async requestPasswordReset() {
        try {
            const body = this.req.body;
            const isValid = this.app.helpers.validatePhoneNumber(body.phone);
            if (!isValid)
                return this.res.status(500).send({
                    id: null,
                    success: false,
                    message: 'Error! Invalid phone number provided',
                });
            const exists = await this.app.prisma.user.findUnique({
                where: {
                    phone: this.app.helpers.formatPhoneNumber(body.phone),
                },
            });
            if (!exists) {
                return this.res.status(500).send({
                    id: null,
                    success: false,
                    message: 'Error! Account does not exist',
                });
            }
            const token = this.generateOtp(6);
            await this.app.prisma.otpToken.create({
                data: {
                    userId: exists.id,
                    expiryDate: (0, dayjs_1.default)().add(10, 'minutes').toDate(),
                    token,
                },
            });
            await this.app.messaging.sendSms(exists.phone, `Your ${index_1.configs.appname} OTP is ${token}. This token is valid for the next 10 minutes`);
            return this.res.status(200).send({
                id: null,
                success: true,
                message: `Success! Password reset OTP sent to mobile`,
            });
        }
        catch (error) {
            this.app.Sentry.captureException(error);
            return this.res.status(500).send({
                id: null,
                success: false,
                message: 'Error! Something went wrong please try again',
            });
        }
    }
    async updateUserPassword() {
        try {
            const body = this.req.body;
            const user = await this.app.prisma.user.findUnique({
                where: {
                    phone: this.app.helpers.formatPhoneNumber(body.phone),
                },
            });
            if (!user) {
                return this.res.status(404).send({
                    id: null,
                    success: false,
                    message: 'Error! User Not Found',
                });
            }
            const phoneOtp = await this.app.prisma.otpToken
                .findFirstOrThrow({
                where: {
                    userId: user?.id,
                    token: body.otp,
                    expiryDate: {
                        gte: (0, dayjs_1.default)().toDate(),
                    },
                },
            })
                .then((resp) => resp?.id)
                .catch(() => null);
            if (!phoneOtp)
                return this.res.status(400).send({
                    id: null,
                    success: false,
                    message: 'Failed! Invalid token provided',
                });
            const salt = (0, bcrypt_1.genSaltSync)(10);
            const password = await (0, bcrypt_1.hash)(body.password, salt);
            await this.app.prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    password,
                },
            });
            const jwtUser = {
                id: user?.id,
                phone: user?.phone,
                phoneValidated: user?.phoneValidated,
                profileId: user?.profileId,
                role: user?.role,
            };
            await this.app.prisma.otpToken.delete({
                where: {
                    id: phoneOtp,
                },
            });
            const token = this.app.helpers.jwt.sign(jwtUser);
            return this.res.status(200).send({
                id: user?.id,
                success: true,
                message: 'Success! Password updated',
                token: token,
                user: jwtUser,
            });
        }
        catch (error) {
            this.app.Sentry.captureException(error);
            this.app.log.error(error);
            return this.res.status(500).send({
                id: null,
                success: false,
                message: 'Error! Something went wrong please try again',
            });
        }
    }
    async userMpesaDeposit() {
        try {
            const isPhoneValid = this.app.helpers.validatePhoneNumber(this.body.phone);
            if (!isPhoneValid) {
                return this.res.status(400).send({
                    id: null,
                    success: false,
                    message: 'Error! Invalid phone number provided',
                });
            }
            if (Number(this.body.amount) < 10) {
                return this.res.status(400).send({
                    id: null,
                    success: false,
                    message: 'Error! Amount should be greater or equal to 10',
                });
            }
            const amount = Number(this.body.amount);
            const phone = this.app.helpers.formatPhoneNumber(this.body.phone);
            const mpesa = await mpesa_1.default.initiateMpesaStkPush({ phone, amount, uniqueId: `${index_1.configs.appname}` });
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
                });
                return this.res.send({
                    success: true,
                    id: null,
                    message: mpesa?.message,
                });
            }
            else {
                return this.res.status(400).send({
                    success: false,
                    id: null,
                    message: mpesa?.message,
                });
            }
        }
        catch (error) {
            this.app.Sentry.captureException(error);
            this.app.log.error(error);
            return this.res.status(500).send({
                id: null,
                success: false,
                message: 'Error! Something went wrong please try again',
            });
        }
    }
    async mpesaWithdraw() {
        try {
            const amount = Number(this.body.amount?.phone.toString());
            const user = await this.app.prisma.user.findUnique({
                where: {
                    id: this.req.user.id,
                },
                select: {
                    id: true,
                    accountBalance: true,
                    phone: true,
                },
            });
            const hasBalance = user.accountBalance - amount;
            if (hasBalance < 0) {
                return this.res.status(400).send({
                    id: null,
                    success: false,
                    message: 'Failed! Amount exceeds account balance',
                });
            }
            const mpesa = await mpesa_1.default.payoutToMobileNumber({ phone: user.phone, amount, reference: (0, uuid_1.v4)(), remarks: 'Bepoa Payout' });
            if (!mpesa?.ConversationID)
                return this.res.status(400).send({
                    id: null,
                    success: false,
                    message: mpesa?.ResponseDescription,
                });
            await this.app.prisma.transaction.create({
                data: {
                    amount,
                    phone: user?.phone,
                    date: (0, dayjs_1.default)().toDate(),
                    checkoutRequestId: mpesa.ConversationID,
                    merchantRequestId: mpesa.OriginatorConversationID,
                    status: 'PENDING',
                    type: 'WITHDRAWAL',
                    transactionId: '',
                    userId: user.id,
                },
            });
            return {
                id: null,
                success: true,
                message: 'Success! Mpesa withdrawal initiated',
            };
        }
        catch (error) {
            this.app.Sentry.captureException(error);
            this.app.log.error(error);
            return this.res.status(500).send({
                id: null,
                success: false,
                message: 'Error! Something went wrong please try again',
            });
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map