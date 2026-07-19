import "dotenv/config";

export const NODE_ENV = process.env.NODE_ENV;
export const PORT = parseInt(process.env.PORT as string) || 8001;
export const API_PREFIX = process.env.API_PREFIX;
export const WHITE_LIST = (process.env.WHITE_LIST ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
export const CLOUDINARY_CLOUD_NAME = process.env
  .CLOUDINARY_CLOUD_NAME as string;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY as string;
export const CLOUDINARY_API_SECRET = process.env
  .CLOUDINARY_API_SECRET as string;
export const NODEMAILER_GOOGLE_APP_PASSWORD =
  process.env.NODEMAILER_GOOGLE_APP_PASSWORD;

export const NODEMAILER_GOOGLE_APP_USER_EMAIL =
  process.env.NODEMAILER_GOOGLE_APP_USER_EMAIL;
