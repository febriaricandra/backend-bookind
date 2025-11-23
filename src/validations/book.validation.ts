import Joi from 'joi';

export const createBookSchema = Joi.object({
    title: Joi.string().min(2).max(100).required(),
    author: Joi.string().min(2).max(100).required(),
    price: Joi.number().min(0).required(),
    condition: Joi.string().min(2).max(50).required(),
    category: Joi.string().min(2).max(50).required(),
    story: Joi.string().min(2).max(1000).required(),
    accessible: Joi.boolean().required(),
    img: Joi.string().optional(),
    ownerId: Joi.string().required(),
});

export const updateBookSchema = Joi.object({
    title: Joi.string().min(2).max(100).optional(),
    author: Joi.string().min(2).max(100).optional(),
    price: Joi.number().min(0).optional(),
    condition: Joi.string().min(2).max(50).optional(),
    category: Joi.string().min(2).max(50).optional(),
    story: Joi.string().min(2).max(1000).optional(),
    accessible: Joi.boolean().optional(),
    img: Joi.string().optional(),
});
