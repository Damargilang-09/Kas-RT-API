import "dotenv/config";

export const PORT = parseInt(process.env.PORT as string) || 8000;
export const API_PREFIX = process.env.API_PREFIX || "/api";
export const WHITE_LIST = process.env.WHITE_LIST?.split(",") || [];

export const DATABASE_URL = process.env.DATABASE_URL;
export const DIRECT_URL = process.env.DIRECT_URL;

export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const NODEMAILER_GOOGLE_APP_PASSWORD =
  process.env.NODEMAILER_GOOGLE_APP_PASSWORD;

export const NODEMAILER_GOOGLE_APP_USER_EMAIL =
  process.env.NODEMAILER_GOOGLE_APP_USER_EMAIL;

// export const REDIS_DB = process.env.REDIS_DB;
// export const REDIS_HOST = process.env.REDIS_HOST;
// export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
// export const REDIS_PORT = process.env.REDIS_PORT;
