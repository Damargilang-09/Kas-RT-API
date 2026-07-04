import "dotenv/config";

export const NODE_ENV = process.env.NODE_ENV
export const PORT = parseInt(process.env.PORT as string) || 8001;
export const API_PREFIX = process.env.API_PREFIX;
export const WHITE_LIST = process.env.WHITE_LIST
export const JWT_SECRET = process.env.JWT_SECRET
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
