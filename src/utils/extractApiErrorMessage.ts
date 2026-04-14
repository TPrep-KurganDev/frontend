import axios from 'axios';

type ApiErrorPayload = {
  detail?: string;
  message?: string;
  error?: string;
};

export function extractApiErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return error.response?.data?.detail ??
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      fallbackMessage;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}
