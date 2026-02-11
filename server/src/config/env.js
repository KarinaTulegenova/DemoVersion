const Joi = require("joi");

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
  PORT: Joi.number().default(5000),
  MONGODB_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().min(8).required(),
  ADMIN_EMAIL: Joi.string().email().optional(),
  ADMIN_PASSWORD: Joi.string().min(6).optional(),
}).unknown(true);

function validateEnv() {
  const { error, value } = envSchema.validate(process.env, { abortEarly: false });
  if (error) {
    throw new Error(`Env validation error: ${error.details.map((d) => d.message).join(", ")}`);
  }
  return value;
}

module.exports = { validateEnv };
