const Joi = require("joi");

const categorySchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  color: Joi.string().allow("").optional(),
});

module.exports = { categorySchema };
