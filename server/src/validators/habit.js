const Joi = require("joi");

const habitSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow("").optional(),
  frequency: Joi.string().valid("daily", "weekly", "custom").required(),
  startDate: Joi.date().optional(),
  isActive: Joi.boolean().optional(),
});

module.exports = { habitSchema };
