import express, { Request, Response } from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { ErrorMiddleware } from "./middlewares/error.middleware";
import { API_PREFIX, NODE_ENV, PORT, WHITE_LIST } from "./configs/env.config";
import cors from "cors";
import path from "path";

const app = express();


app.use(
  cors({
    origin: WHITE_LIST,
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

app.use(`${API_PREFIX}/api`, routes);


app.use(ErrorMiddleware);

if (NODE_ENV === "development") {
  app.listen(PORT, () => {
    console.log(`[⚡APP] Application is running on port: ${PORT}`);
  });
}

export default app;
