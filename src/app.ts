import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { ErrorMiddleware } from "./middlewares/error.middleware";
import { API_PREFIX, NODE_ENV, PORT, WHITE_LIST } from "./configs/env.config";
import cors from "cors";
import path from "path";
import { startBillOverdueCron } from "./modules/bill/bill.cron";
import { MorganMiddleware } from "./middlewares/morgan.middleware";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || WHITE_LIST.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());

app.use(cookieParser());

app.use(
  `${API_PREFIX}/src/uploads`,
  express.static(path.join(__dirname, "uploads")),
);

app.use(MorganMiddleware.handler());

app.use(`${API_PREFIX}/api`, routes);

app.use(ErrorMiddleware);

const isRunningOnVercel = process.env.VERCEL === "1";

if (
  (NODE_ENV === "development" || NODE_ENV === "production") &&
  !isRunningOnVercel
) {
  startBillOverdueCron();
}

// if (NODE_ENV === "development") {
//   app.listen(PORT, () => {
//     console.log(`[⚡APP] Application is running on port: ${PORT}`);
//   });
// }

export default app;
