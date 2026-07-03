import { Fetcher, type Middleware } from "openapi-typescript-fetch";
import type { OpenapiPaths } from "openapi-typescript-fetch/types";

export const newFetcher = <Paths extends OpenapiPaths<Paths>>(
  endpoint: string,
  middlewares?: Middleware[],
) => {
  const fetcher = Fetcher.for<Paths>();

  fetcher.configure({
    baseUrl: endpoint,
    use: middlewares,
  });

  return fetcher;
};
