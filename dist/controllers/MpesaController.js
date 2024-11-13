"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dayjs_1 = __importDefault(require("dayjs"));
const BaseController_1 = require("./BaseController");
class MpesaController extends BaseController_1.BaseController {
    async handleMpesaDepositCallback() {
        try {
            const body = this.body;
            const transaction = await this.app.prisma.transaction.findUnique({
                where: {
                    checkoutRequestId_merchantRequestId: {
                        checkoutRequestId: body.Body.stkCallback.CheckoutRequestID,
                        merchantRequestId: body.Body.stkCallback.MerchantRequestID,
                    },
                },
            });
            if (transaction && transaction.status == 'PENDING') {
                if (body.Body.stkCallback.ResultCode == 0) {
                    const amount = Number(body.Body.stkCallback.CallbackMetadata.Item.find((a) => a?.Name == 'Amount')?.Value ?? '0');
                    const transId = body.Body.stkCallback.CallbackMetadata.Item.find((a) => a?.Name == 'MpesaReceiptNumber')?.Value?.toString();
                    const phone = body.Body.stkCallback.CallbackMetadata.Item.find((a) => a?.Name == 'PhoneNumber')?.Value?.toString();
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
                            date: (0, dayjs_1.default)().toDate(),
                            user: {
                                update: {
                                    accountBalance: {
                                        increment: amount,
                                    },
                                },
                            },
                        },
                    });
                }
                else {
                    await this.app.prisma.transaction.update({
                        where: {
                            id: transaction.id,
                        },
                        data: {
                            status: 'FAILED',
                        },
                    });
                }
            }
            else {
                return { success: true, message: 'Success! Callback received' };
            }
        }
        catch (error) {
            this.app.Sentry.captureException(error);
            return this.res.status(500).send({
                success: false,
                message: 'Failed! Something went wrong',
            });
        }
    }
}
exports.default = MpesaController;
//# sourceMappingURL=MpesaController.js.map