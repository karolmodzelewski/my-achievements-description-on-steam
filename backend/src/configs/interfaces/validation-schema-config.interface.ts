import Joi from 'joi';

export interface ValidationSchemaConfig {
    STAGE: Joi.SchemaLike;
    DB_HOST: Joi.SchemaLike;
    DB_PORT: Joi.SchemaLike;
    DB_USERNAME: Joi.SchemaLike;
    DB_PASSWORD: Joi.SchemaLike;
    DB_DATABASE: Joi.SchemaLike;
}
