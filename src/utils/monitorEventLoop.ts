import { monitorEventLoopDelay } from "node:perf_hooks";
import type { Logger } from "pino";

export function startEventLoopMonitor(logger: Logger, intervalMs = 10_000) {
  const loop = monitorEventLoopDelay({ resolution: 20 });
  loop.enable();

  const interval = setInterval(() => {
    const p99ms = loop.percentile(99) / 1e6; // nanoseconds → ms

    logger.info({ eventLoopP99Ms: Number(p99ms.toFixed(1)) }, "saturation");
    loop.reset();
  }, intervalMs);

  interval.unref(); // Allow the process to exit if this is the only thing left

  return () => {
    clearInterval(interval);
    loop.disable();
  };
}
