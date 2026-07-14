import { AxiosError } from "axios";

interface XeroSdkProblem {
  title?: string;
  detail?: string;
  status?: number;
}

interface XeroSdkError {
  response: {
    statusCode: number;
    body?: {
      httpStatusCode?: string;
      problem?: XeroSdkProblem;
      Detail?: string;
      Elements?: Array<{
        ValidationErrors?: Array<{
          Message?: string;
        }>;
      }>;
    };
  };
}

interface StringifiedAxiosError {
  response?: {
    status?: number;
    statusText?: string;
    data?: unknown;
  };
}

function isXeroSdkError(error: unknown): error is XeroSdkError {
  if (typeof error !== "object" || error === null) return false;
  const response = (error as { response?: unknown }).response;
  if (typeof response !== "object" || response === null) return false;
  return typeof (response as { statusCode?: unknown }).statusCode === "number";
}

function isStringifiedAxiosError(error: unknown): error is StringifiedAxiosError {
  if (typeof error !== "object" || error === null) return false;
  const response = (error as { response?: unknown }).response;
  if (typeof response !== "object" || response === null) return false;
  return typeof (response as { status?: unknown }).status === "number";
}

function formatHttpStatus(status: number): string {
  switch (status) {
    case 401:
      return "Authentication failed. Please check your Xero credentials.";
    case 403:
      return "You don't have permission to access this resource in Xero.";
    case 404:
      return "The requested resource was not found in Xero.";
    case 429:
      return "Too many requests to Xero. Please try again in a moment.";
    default:
      return "";
  }
}

function collectMessages(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (typeof value === "string") return [value];
  if (typeof value !== "object") return [];

  const objectValue = value as Record<string, unknown>;
  const directMessages = [
    objectValue.Detail,
    objectValue.detail,
    objectValue.Message,
    objectValue.message,
    objectValue.Error,
    objectValue.error,
  ].filter((message): message is string => typeof message === "string");

  const nestedMessages = Object.entries(objectValue)
    .filter(([key]) => !["request", "config", "headers"].includes(key.toLowerCase()))
    .flatMap(([, nestedValue]) => collectMessages(nestedValue));

  return [...directMessages, ...nestedMessages];
}

function formatStringifiedAxiosError(error: StringifiedAxiosError): string {
  const status = error.response?.status;
  if (status === undefined) {
    return "An error occurred while communicating with Xero.";
  }

  const mapped = formatHttpStatus(status);
  if (mapped) return mapped;

  const title = error.response?.statusText || "HTTP error";
  const details = [...new Set(collectMessages(error.response?.data))];
  return details.length > 0 ? `${status} ${title}: ${details.join("; ")}` : `${status} ${title}`;
}

function parseJsonStringError(error: string): unknown {
  try {
    return JSON.parse(error);
  } catch {
    return null;
  }
}

function formatXeroSdkError(error: XeroSdkError): string {
  const status = error.response.statusCode;
  const mapped = formatHttpStatus(status);
  if (mapped) return mapped;

  const body = error.response.body;
  const problem = body?.problem;
  const title = problem?.title ?? body?.httpStatusCode ?? "HTTP error";
  const detail = problem?.detail ?? body?.Detail;
  const validationMessages =
    body?.Elements?.flatMap((element) =>
      element.ValidationErrors?.map((validationError) => validationError.Message).filter(Boolean) ?? [],
    ) ?? [];

  const details = [detail, ...validationMessages].filter(Boolean);
  return details.length > 0 ? `${status} ${title}: ${details.join("; ")}` : `${status} ${title}`;
}

/**
 * Format error messages for return to the LLM.
 *
 * Never stringify unknown error objects — the xero-node SDK rejects with a
 * plain object whose `request.headers.authorization` field contains the
 * caller's Bearer token. Whitelist the fields we extract so secrets never
 * reach the response.
 */
export function formatError(error: unknown): string {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const detail = error.response?.data?.Detail;

    if (status !== undefined) {
      const mapped = formatHttpStatus(status);
      if (mapped) return mapped;
    }
    return detail || "An error occurred while communicating with Xero.";
  }

  if (isXeroSdkError(error)) {
    return formatXeroSdkError(error);
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    const parsed = parseJsonStringError(error);
    if (isXeroSdkError(parsed)) {
      return formatXeroSdkError(parsed);
    }
    if (isStringifiedAxiosError(parsed)) {
      return formatStringifiedAxiosError(parsed);
    }
  }

  return "An unexpected error occurred while communicating with Xero.";
}
