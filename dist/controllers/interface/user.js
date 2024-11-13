"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typebox_1 = require("@sinclair/typebox");
const SignUpBody = typebox_1.Type.Object({
    phone: typebox_1.Type.String(),
    password: typebox_1.Type.String(),
});
const SignInBody = typebox_1.Type.Object({
    phone: typebox_1.Type.String(),
    password: typebox_1.Type.String(),
});
const ValidateOptBody = typebox_1.Type.Object({
    otp: typebox_1.Type.String(),
});
const PasswordResetBody = typebox_1.Type.Object({
    phone: typebox_1.Type.String(),
});
const PasswordUpdateBody = typebox_1.Type.Object({
    otp: typebox_1.Type.String(),
    password: typebox_1.Type.String(),
    phone: typebox_1.Type.String(),
});
const UpdateUserBody = typebox_1.Type.Object({
    fname: typebox_1.Type.String(),
    lname: typebox_1.Type.String(),
    email: typebox_1.Type.String(),
    avatar: typebox_1.Type.Object({
        link: typebox_1.Type.String(),
        filename: typebox_1.Type.String(),
        fileType: typebox_1.Type.String(),
    }),
});
//# sourceMappingURL=user.js.map