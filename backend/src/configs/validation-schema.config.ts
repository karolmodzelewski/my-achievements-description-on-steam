import Joi from 'joi';

import { ValidationSchemaConfig } from './interfaces/validation-schema-config.interface';

export const validationSchemaConfig: Joi.ObjectSchema<ValidationSchemaConfig> = Joi.object({
    STAGE: Joi.string().required(),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5432).required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
});
