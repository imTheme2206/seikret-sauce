import { newFetcher } from "@/lib/api";
import { type paths } from "@/vendor/openapi";

const newApi = () => {
  return {
    api: newFetcher<paths>("http://localhost:3003").path,
  };
};

export const useApi = () => {
  return newApi();
};
