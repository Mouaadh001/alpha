export function getErrorMessage(error: unknown, fallback = "Erreur inconnue"): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error.trim()) return error;

  if (error && typeof error === "object") {
    const maybeMessage = "message" in error ? (error as { message?: unknown }).message : undefined;
    if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage;

    const maybeDetails = "details" in error ? (error as { details?: unknown }).details : undefined;
    if (typeof maybeDetails === "string" && maybeDetails.trim()) return maybeDetails;

    try {
      const serialized = JSON.stringify(error);
      if (serialized && serialized !== "{}") return serialized;
    } catch {
      // Keep the friendly fallback below.
    }
  }

  return fallback;
}
