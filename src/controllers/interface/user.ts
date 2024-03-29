import { Static, Type } from '@sinclair/typebox'

const SignUpBody = Type.Object({
    phone: Type.String(),
    password: Type.String()
})
export type ISignUpBody = Static<typeof SignUpBody>