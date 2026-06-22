import express, { Request, Response } from "express";
import "dotenv/config";
import { errorHandler } from "./middlewares/error-handler.middleware";
import routes from "./routes";

const PORT = process.env.PORT || 8001;

const app = express();

app.use(express.json());
app.use(errorHandler);
app.use("/api", routes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Hello, world!",
  });
});

if (process.env.NODE_ENV === "development") {
  app.listen(PORT, () => {
    console.log(`[⚡APP] Application is running on port: ${PORT}`);
  });
}

export default app;
