const Joi = require("joi");

const logSchema = Joi.object({
  date: Joi.date().required(),
  status: Joi.string().valid("completed", "missed", "partial").required(),
  note: Joi.string().allow("").optional(),
});

module.exports = { logSchema };
