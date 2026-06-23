import type { Request, Response, NextFunction } from "express";
import type { CustomError } from "./errorHandler.ts";
import { runWithRequestContext } from "./requestContext.ts";

const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Creates a middleware that fails a request if it isn't handled within `ms`.
 * Pass a custom duration to override the default per route/request.
 *
 * On timeout (or client disconnect) the request's abort signal is triggered,
 * allowing downstream work (e.g. DB queries) to cancel via the request context
 * instead of running to completion.
 */
export const timeout =
  (ms: number = DEFAULT_TIMEOUT_MS) =>
  (_req: Request, res: Response, next: NextFunction) => {
    const controller = new AbortController();

    const timer = setTimeout(() => {
      controller.abort();

      // Response already on its way out - nothing to do.
      if (res.headersSent) return;

      const error = new Error(`Request timed out after ${ms}ms`) as CustomError;
      error.status = 503;
      error.code = "REQUEST_TIMEOUT";
      next(error);
    }, ms);

    const cleanup = () => clearTimeout(timer);

    // Always clear the timer once the response is done, regardless of outcome.
    res.on("finish", cleanup);
    // Client hung up before we finished - cancel in-flight work too.
    res.on("close", () => {
      cleanup();
      if (!res.writableEnded) controller.abort();
    });

    runWithRequestContext({ abortSignal: controller.signal }, () => next());
  };
