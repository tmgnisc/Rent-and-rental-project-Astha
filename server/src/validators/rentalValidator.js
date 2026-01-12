const Joi = require('joi');

const rentalSchema = Joi.object({
  productId: Joi.string().trim().required(),
  startDate: Joi.date().iso().required(),
  days: Joi.number().integer().min(1).max(60).required(),
  deliveryAddress: Joi.string().trim().min(5).max(255).required(),
  contactPhone: Joi.string().trim().min(6).max(20).required(),
  deliveryLatitude: Joi.number().min(-90).max(90).allow(null),
  deliveryLongitude: Joi.number().min(-180).max(180).allow(null),
  deliveryLocationAddress: Joi.string().trim().max(500).allow('', null),
  notes: Joi.string().trim().max(500).allow('', null),
});

const formatValidationError = (error) =>
  error.details.map((detail) => detail.message.replace(/"/g, ''));

module.exports = {
  rentalSchema,
  formatValidationError,
};

