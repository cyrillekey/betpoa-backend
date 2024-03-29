
import { ISignUpBody } from "@controllers/interface/user"
import { UserController } from "@controllers/UserController"
import { FastifyPluginAsync } from "fastify"


const userRoutes:FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.route<{
        Body:ISignUpBody
    }>({
        method:'POST',
        url: '/',
        schema:{
            body:{
                type: 'object',
                required: ['phone','password'],
                properties: {
                    phone: {type:'string'},
                    password: {type: 'string'}
                }
            }
        },
        handler: async (req,res) => {
            await new UserController(fastify,req,res).signupCustomer()
        }
    })
}

export default userRoutes