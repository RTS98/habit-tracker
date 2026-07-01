import express, { type Request, type Response } from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";
import habitRoutes from "./routes/habitRoutes.ts";
import tagRoutes from "./routes/tagRoutes.ts";
import env, { isProduction } from "../env.ts";
import { notFound } from "./middleware/notFound.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import { timeout } from "./middleware/timeout.ts";
import { pinoHttp } from "pino-http";
import { randomUUID } from "crypto";
import { client } from "./db/connection.ts";
import { startEventLoopMonitor } from "./utils/monitorEventLoop.ts";
import pino from "pino";

// Pretty-print in dev only. In production, leave transport undefined so pino
// emits plain JSON to stdout — no pino-pretty dependency needed at runtime.
const prettyTransport = isProduction
  ? undefined
  : { target: "pino-pretty", options: { colorize: true } };

const logger = pino({
  transport: prettyTransport,
});
const app = express();
startEventLoopMonitor(logger); // Monitor event loop every 10 seconds

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  pinoHttp({
    transport: prettyTransport,
    genReqId: (req, res) => {
      const incoming = req.headers["x-request-id"];
      const id = incoming || randomUUID();
      res.setHeader("x-request-id", id);

      return id;
    },
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 500 || err) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
  }),
);

// Default 5s timeout for all requests; override per route with timeout(ms).
app.use(timeout());

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Habit tracker API",
  });
});

app.get("/health/ready", async (req, res) => {
  try {
    await client.query("SELECT 1");
    res.status(200).json({ status: "ready" });
  } catch (err) {
    req.log.error({ err }, "readiness check failed");
    res.status(503).json({ status: "not_ready" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/tags", tagRoutes);

// 404 handler - MUST be before global error handler
app.use(notFound);

// Global error handler - MUST be last middleware
app.use(errorHandler);

export default app;
