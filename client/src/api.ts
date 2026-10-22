import { useCallback, useEffect, useState } from 'react';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly issues: { field: string; message: string }[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(payload?.error ?? `Request failed with status ${res.status}`, payload?.issues ?? []);
  return payload as T;
}

export const apiGet = <T,>(path: string) => request<T>('GET', path);
export const apiPost = <T,>(path: string, body: unknown) => request<T>('POST', path, body);
export const apiPatch = <T,>(path: string, body: unknown) => request<T>('PATCH', path, body);

export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(path !== null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (path === null) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiGet<T>(path)
      .then((result) => !cancelled && setData(result))
      .catch((err: Error) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [path, version]);

  const refetch = useCallback(() => setVersion((v) => v + 1), []);
  return { data, error, loading, refetch };
}

export function issuesByField(err: unknown): Record<string, string> {
  if (!(err instanceof ApiError)) return {};
  return Object.fromEntries(err.issues.map((i) => [i.field, i.message]));
}

export const formatDate = (iso: string, opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' }) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('en-US', opts);
