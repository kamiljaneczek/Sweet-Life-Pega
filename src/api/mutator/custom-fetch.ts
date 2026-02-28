import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';

export const customFetch = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const sdkConfig = await getSdkConfig();
  const baseUrl = (sdkConfig as any).serverConfig?.infinityRestServerUrl ?? '';

  const authHeader = typeof PCore !== 'undefined' ? (PCore.getAuthUtils() as any).getAuthHeader() : '';

  const fullUrl = `${baseUrl}/api/v1${url}`;

  const requestHeaders: HeadersInit = {
    ...((options?.headers as Record<string, string>) ?? {}),
    Authorization: authHeader
  };

  if (options?.body) {
    (requestHeaders as Record<string, string>)['Content-Type'] = 'application/json';
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers: requestHeaders
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.errorDetails?.[0]?.message ?? `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export default customFetch;
