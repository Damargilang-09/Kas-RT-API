import express, { Request, Response } from "express";
import "dotenv/config";
import routes from "./routes";
import { errorHandler } from "./middlewares/error-handler.middleware";

const PORT = process.env.PORT || 8000;

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "RTku API is running",
  });
});

app.use("/api", routes);

// error handler harus paling akhir
app.use(errorHandler);

if (process.env.NODE_ENV === "development") {
  app.listen(PORT, () => {
    console.log(`[😃 APP] Application is running on port: ${PORT}`);
  });
}

export default app;
