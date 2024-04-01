import { Static, Type } from '@sinclair/typebox'

const SignUpBody = Type.Object({
  phone: Type.String(),
  password: Type.String(),
})
const SignInBody = Type.Object({
  phone: Type.String(),
  password: Type.String(),
})
const ValidateOptBody = Type.Object({
  otp: Type.String(),
})
const PasswordResetBody = Type.Object({
  phone: Type.String(),
})
const PasswordUpdateBody = Type.Object({
  otp: Type.String(),
  password: Type.String(),
  phone: Type.String(),
})
const UpdateUserBody = Type.Object({
  fname: Type.String(),
  lname: Type.String(),
  email: Type.String(),
  avatar: Type.Object({
    link: Type.String(),
    filename: Type.String(),
    fileType: Type.String(),
  }),
})
export type ISignInBody = Static<typeof SignInBody>
export type ISignUpBody = Static<typeof SignUpBody>
export type IValidateOptBody = Static<typeof ValidateOptBody>
export type IUpdateUserBody = Static<typeof UpdateUserBody>
export type IPasswordResetBody = Static<typeof PasswordResetBody>
export type IPasswordUpdateBody = Static<typeof PasswordUpdateBody>
