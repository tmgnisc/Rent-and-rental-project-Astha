const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).max(128).required(),
  newPassword: Joi.string().min(6).max(128).required(),
});

const formatValidationError = (error) =>
  error.details.map((detail) => detail.message.replace(/"/g, ''));

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  formatValidationError,
};
