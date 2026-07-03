import nodemailer from "nodemailer";

import {
  NODEMAILER_GOOGLE_APP_PASSWORD,
  NODEMAILER_GOOGLE_APP_USER_EMAIL,
} from "./env.config";

console.log("EMAIL_USER:", NODEMAILER_GOOGLE_APP_USER_EMAIL);
console.log("EMAIL_PASS length:", NODEMAILER_GOOGLE_APP_PASSWORD?.length);
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: NODEMAILER_GOOGLE_APP_USER_EMAIL,
    pass: NODEMAILER_GOOGLE_APP_PASSWORD,
  },
});

export default transporter;
