import express, { Request, Response } from "express";
import "dotenv/config";
import routes from "./routes";
import { ErrorMiddleware } from "./middlewares/error.middleware";
import cors from "cors"
import { WHITE_LIST } from "./configs/env.config";
import cookieParser from "cookie-parser";


const PORT = process.env.PORT || 8000;

const app = express();


app.use(
  cors({
    origin: WHITE_LIST,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(cookieParser());

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "RTku API is running",
  });
});

app.use("/api", routes);

app.use(ErrorMiddleware);

if (process.env.NODE_ENV === "development") {
  app.listen(PORT, () => {
    console.log(`[APP] Application is running on port: ${PORT}`);
  });
}

export default app;
