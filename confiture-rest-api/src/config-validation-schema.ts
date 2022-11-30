import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  DATABASE_URL: Joi.string()
    .uri({
      scheme: 'postgres',
    })
    .required(),
  MAILER_USER: Joi.string().email().required(),
  MAILER_PASSWORD: Joi.string().required(),
  MAILER_SMTP_HOST: Joi.string().hostname().required(),
  MAILER_SMTP_PORT: Joi.number().integer().positive().required(),
  MAILER_SMTP_SECURE: Joi.boolean().required(),
  FRONT_BASE_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .default('http://localhost:3000'),
  AIRTABLE_BASE_ID: Joi.string().required(),
  AIRTABLE_TABLE_ID: Joi.string().required(),
  AIRTABLE_ACCESS_TOKEN: Joi.string().required(),
});
