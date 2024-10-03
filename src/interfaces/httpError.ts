export interface HttpError extends Error {
  status?: number;
  code?: string;
  details?: string | string[];
}
