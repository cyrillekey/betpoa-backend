import { Static, Type } from '@sinclair/typebox'

const SignUpBody = Type.Object({
  phone: Type.String(),
  password: Type.String(),
})
const SignInBody = Type.Object({
  phone: Type.String(),
  password: Type.String(),
})
export type ISignInBody = Static<typeof SignInBody>
export type ISignUpBody = Static<typeof SignUpBody>
