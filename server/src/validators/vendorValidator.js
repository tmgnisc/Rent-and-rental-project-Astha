const Joi = require('joi');

const vendorRegisterSchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

module.exports = {
  vendorRegisterSchema,
};
