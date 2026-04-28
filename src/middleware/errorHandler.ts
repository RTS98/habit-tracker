import type { Request, Response, NextFunction } from "express";
import env, { isProduction } from "../../env.ts";

export interface CustomError extends Error {
  status?: number;
  code?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err.stack);

  // Default error
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  // Handle specific error types
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation Error";
  }

  if (err.name === "UnauthorizedError") {
    status = 401;
    message = "Unauthorized";
  }

  res.status(status).json({
    error: message,
    ...(!isProduction && {
      stack: err.stack,
      details: err.message,
    }),
  });
};
