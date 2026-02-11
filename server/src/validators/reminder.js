const Joi = require("joi");

const reminderSchema = Joi.object({
  habitId: Joi.string().required(),
  time: Joi.string().required(),
  daysOfWeek: Joi.array().items(Joi.string()).optional(),
  enabled: Joi.boolean().optional(),
});

module.exports = { reminderSchema };
