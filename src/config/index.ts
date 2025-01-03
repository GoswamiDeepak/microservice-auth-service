import { config } from 'dotenv';
import path from 'path';

config({ path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`) });

const {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    REFRESH_TOKEN_SECRET,
    TOKEN_DOMAIN,
    TOKEN_ISSUER,
    ACCESS_TOKEN_EXPIRESIN,
    REFRESH_TOKEN_EXPIRESIN,
    JWKS_URI,
    PRIVATE_KEY,
    FRONTEND_URL,
} = process.env;

export const Config = {
    PORT,
    NODE_ENV,
    DB_HOST,
    DB_PORT,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    REFRESH_TOKEN_SECRET,
    TOKEN_DOMAIN,
    TOKEN_ISSUER,
    ACCESS_TOKEN_EXPIRESIN,
    REFRESH_TOKEN_EXPIRESIN,
    JWKS_URI,
    PRIVATE_KEY,
    FRONTEND_URL,
};
