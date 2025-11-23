import Joi from "joi";

export const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('ADMIN', 'USER').default('USER'),
    phoneNumber: Joi.string().min(10).max(15).optional(),
    address: Joi.string().min(5).max(200).optional()
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});