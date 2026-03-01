import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';

interface CustomFetchOptions {
  method?: string;
  body?: object;
  headers?: Record<string, string>;
  apiPrefix?: string;
}

export const customFetch = async <T>(url: string, options?: CustomFetchOptions): Promise<T> => {
  const sdkConfig = await getSdkConfig();
  const serverUrl = (sdkConfig as any).serverConfig?.infinityRestServerUrl ?? '';
  const appAlias = (sdkConfig as any).serverConfig?.appAlias ?? '';
  const baseUrl = appAlias ? `${serverUrl}/app/${appAlias}` : serverUrl;

  const apiPrefix = options?.apiPrefix ?? '/api/v1';
  const endpointUrl = `${baseUrl}${apiPrefix}${url}`;

  const { invokeCustomRestApi } = PCore.getRestClient();

  const response = (await invokeCustomRestApi(
    endpointUrl,
    {
      method: options?.method ?? 'GET',
      body: options?.body ?? {},
      headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
      withoutDefaultHeaders: false
    },
    'root'
  )) as any;

  return (response?.data ?? response) as T;
};

export default customFetch;
