import { ApiException } from "./api-service";

export function handleGlobalApiError(err: unknown) {
  if (typeof window === "undefined") return;
  if (!(err instanceof ApiException)) return;

  if (err.data?.type === "PRISMA_ERROR") {
    switch (err.data.code) {
      case "P1000":
      case "P1001":
      case "P1003":
      case "P1013":
        window.dispatchEvent(
          new CustomEvent("global-api-error", {
            detail: {
              message: err.message,
              error: err,
            },
          })
        );
        return;
    }
  }
}
