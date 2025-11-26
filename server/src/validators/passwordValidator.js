const Joi = require('joi');

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  token: Joi.string().trim().required(),
  password: Joi.string().min(6).max(128).required(),
});

module.exports = {
  forgotPasswordSchema,
  resetPasswordSchema,
};

