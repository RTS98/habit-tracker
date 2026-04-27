import express, { type Request, type Response } from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";
import habitRoutes from "./routes/habitRoutes.ts";
import tagRoutes from "./routes/tagRoutes.ts";
import env from "../env.ts";

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Habit tracker API",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/tags", tagRoutes);

export default app;
