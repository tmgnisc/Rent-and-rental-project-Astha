const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().trim().min(2).max(160).required(),
  description: Joi.string().trim().max(2000).allow(''),
  category: Joi.string().valid('electronics', 'fashion', 'appliances', 'sports').required(),
  image_url: Joi.string().uri().max(500).allow('', null),
  rental_price_per_day: Joi.number().positive().precision(2).required(),
  refundable_deposit: Joi.number().positive().precision(2).required(),
  status: Joi.string().valid('available', 'rented', 'maintenance').default('available'),
  specifications: Joi.object().pattern(Joi.string(), Joi.string()).allow(null),
});

const formatValidationError = (error) =>
  error.details.map((detail) => detail.message.replace(/"/g, ''));

module.exports = {
  productSchema,
  formatValidationError,
};

