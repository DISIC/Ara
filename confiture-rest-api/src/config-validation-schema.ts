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

  S3_ENDPOINT: Joi.string()
    .uri({ scheme: ['https'] })
    .required(),
  S3_REGION: Joi.string().required(),
  S3_BUCKET: Joi.string().required(),
  S3_VIRTUAL_HOST: Joi.string()
    .uri({ scheme: ['https'] })
    .required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  ACCOUNT_VERIFICATION_SECRET: Joi.string().required(),
  AUTHENTICATION_SECRET: Joi.string().required(),
});
