const Joi = require("joi");

const profileSchema = Joi.object({
  username: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
});

module.exports = { profileSchema };
