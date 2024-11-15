"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("@configs/index");
const response_1 = require("@controllers/interface/response");
const UserController_1 = require("@controllers/UserController");
const Auth_1 = require("@hooks/Auth");
const userRoutes = async (fastify, _opts) => {
    fastify.route({
        method: 'POST',
        url: '/signup',
        schema: {
            description: `Signup User to ${index_1.configs.appname}`,
            tags: ['Auth'],
            summary: 'Signup user',
            body: {
                type: 'object',
                required: ['phone', 'password'],
                properties: {
                    phone: { type: 'string' },
                    password: { type: 'string' },
                },
            },
            response: {
                201: {
                    description: 'Successful response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        token: { type: 'string' },
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                phone: { type: 'string' },
                                phoneValidated: { type: 'boolean' },
                                profileId: { type: 'number' },
                                role: { type: 'string' },
                            },
                        },
                    },
                },
                default: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
                ...response_1.ErrorResponses,
            },
        },
        handler: async (req, res) => {
            await new UserController_1.UserController(fastify, req, res).signupCustomer();
        },
    });
    fastify.route({
        method: 'POST',
        url: '/login',
        schema: {
            description: `Login to ${index_1.configs.appname}`,
            summary: 'Login',
            tags: ['Auth'],
            body: {
                type: 'object',
                required: ['phone', 'password'],
                properties: {
                    phone: { type: 'string' },
                    password: { type: 'string' },
                },
            },
            response: {
                200: {
                    description: 'Successful response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        token: { type: 'string' },
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'number' },
                                phone: { type: 'string' },
                                phoneValidated: { type: 'boolean' },
                                profileId: { type: 'number' },
                                role: { type: 'string' },
                            },
                        },
                    },
                },
                default: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
                ...response_1.ErrorResponses,
            },
        },
        handler: async (req, res) => {
            await new UserController_1.UserController(fastify, req, res).loginUser();
        },
    });
    fastify.route({
        method: 'POST',
        url: '/otp',
        preHandler: Auth_1.isAuthorized,
        schema: {
            description: `Request Otp for phone verification`,
            summary: 'Request Phone Otp',
            tags: ['Auth'],
            security: [{ bearerAuth: [] }],
            response: {
                default: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
                200: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
                ...response_1.ErrorResponses,
            },
        },
        handler: async (req, res) => new UserController_1.UserController(fastify, req, res).requestPhoneOtp(),
    });
    fastify.route({
        method: 'POST',
        url: '/verifyUser',
        preHandler: Auth_1.isAuthorized,
        schema: {
            description: 'Verify user phone belongs to user using otp sent to phone',
            summary: 'Verify User Phone',
            tags: ['Auth'],
            body: {
                type: 'object',
                required: ['otp'],
                properties: {
                    otp: { type: 'string' },
                },
            },
            response: {
                default: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
                200: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
                ...response_1.ErrorResponses,
            },
            security: [{ bearerAuth: [] }],
        },
        handler: async (req, res) => new UserController_1.UserController(fastify, req, res).validateOtp(),
    });
    fastify.route({
        method: 'POST',
        url: '/passwordreset',
        schema: {
            description: 'Initiate password reset to get otp to phone',
            summary: 'Initiate Password Reset',
            tags: ['Auth'],
            body: {
                type: 'object',
                required: ['phone'],
                properties: {
                    phone: { type: 'string' },
                },
            },
            response: {
                default: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
                200: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
                ...response_1.ErrorResponses,
            },
        },
        handler: async (req, res) => new UserController_1.UserController(fastify, req, res).requestPasswordReset(),
    });
    fastify.route({
        method: 'PUT',
        url: '/',
        preHandler: Auth_1.isAuthorized,
        schema: {
            description: 'Updates an authenticated  betpoa user profile',
            summary: 'Update User',
            tags: ['User'],
            security: [{ bearerAuth: [] }],
            body: {
                type: 'object',
                properties: {
                    fname: { type: 'string' },
                    lname: { type: 'string' },
                    email: { type: 'string' },
                    avatar: { type: 'object', properties: { link: { type: 'string' }, filename: { type: 'string' }, fileType: { type: 'string' } } },
                },
            },
            response: {
                default: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
                200: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
                ...response_1.ErrorResponses,
            },
        },
        handler: async (req, res) => new UserController_1.UserController(fastify, req, res).updateUser(),
    });
    fastify.route({
        method: 'PUT',
        url: 'passwordupdate',
        schema: {
            summary: 'Update User Password',
            description: 'Update user password given password reset token',
            tags: ['Auth', 'User'],
            body: {
                type: 'object',
                required: ['otp', 'password', 'phone'],
                properties: {
                    otp: { type: 'string', description: 'Password reset otp' },
                    password: { type: 'string', description: 'New Password' },
                    phone: { type: 'string', description: 'User Phone Number' },
                },
            },
            response: {
                default: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
                200: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
                ...response_1.ErrorResponses,
            },
        },
        handler: async (req, res) => new UserController_1.UserController(fastify, req, res).updateUserPassword(),
    });
    fastify.route({
        method: 'POST',
        url: '/deposit',
        preHandler: Auth_1.isAuthorized,
        schema: {
            tags: ['User'],
            summary: 'Mpesa deposit',
            description: 'Customer make mpesa deposit',
            security: [{ bearerAuth: [] }],
            response: {
                default: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
                200: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
                ...response_1.ErrorResponses,
            },
            body: {
                type: 'object',
                required: ['phone', 'amount'],
                properties: {
                    phone: { type: 'string', description: 'Mpesa phone number to deposit from' },
                    amount: { type: 'number', description: 'Amount to deposit. Must be greater than 10' },
                },
            },
        },
        handler: async (req, res) => await new UserController_1.UserController(fastify, req, res).userMpesaDeposit(),
    });
    fastify.route({
        method: 'POST',
        url: '/withdrawal',
        preHandler: Auth_1.isAuthorized,
        schema: {
            tags: ['User'],
            summary: 'Mpesa withdrawal',
            description: 'Customer make mpesa withdrawal',
            security: [{ bearerAuth: [] }],
            response: {
                200: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
                default: {
                    description: 'Default response',
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
                ...response_1.ErrorResponses,
            },
            body: {
                type: 'object',
                required: ['amount'],
                properties: {
                    amount: { type: 'number' },
                },
            },
        },
        handler: async (req, res) => await new UserController_1.UserController(fastify, req, res).userMpesaDeposit(),
    });
};
exports.default = userRoutes;
//# sourceMappingURL=index.js.map