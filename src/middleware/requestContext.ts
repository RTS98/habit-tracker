import { AsyncLocalStorage } from "node:async_hooks";

interface RequestContext {
  abortSignal: AbortSignal;
}

const storage = new AsyncLocalStorage<RequestContext>();

export const runWithRequestContext = <T>(
  context: RequestContext,
  fn: () => T,
): T => storage.run(context, fn);

/** Returns the current request's abort signal, if running inside a request. */
export const getRequestSignal = (): AbortSignal | undefined =>
  storage.getStore()?.abortSignal;
