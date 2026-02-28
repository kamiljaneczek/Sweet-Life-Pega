import { queryOptions, useMutation } from '@tanstack/react-query';
import { IProduct } from '../../types/types';

export function dataPageQueryOptions<T>(name: string, params: Record<string, unknown> = {}, paging = { pageNumber: 1, pageSize: 30 }) {
  return queryOptions<T>({
    queryKey: ['pcore', 'dataPage', name, params, paging],
    queryFn: async () => {
      const response = await (PCore.getDataPageUtils().getDataAsync(name, 'root', params as any, paging) as Promise<any>);
      return response.data as T;
    },
    enabled: typeof PCore !== 'undefined' && !!PCore
  });
}

export function productListQueryOptions() {
  return queryOptions<IProduct[]>({
    queryKey: ['pcore', 'dataPage', 'D_ProductList'],
    queryFn: async () => {
      const response = await (PCore.getDataPageUtils().getDataAsync(
        'D_ProductList',
        'root',
        {},
        { pageNumber: 1, pageSize: 30 },
        {
          distinctResultsOnly: true,
          select: [{ field: 'Name' }, { field: 'Category' }, { field: 'SKU' }, { field: 'Cost' }, { field: 'CategoryName' }]
        }
      ) as Promise<any>);
      return response.data as IProduct[];
    },
    enabled: typeof PCore !== 'undefined' && !!PCore
  });
}

export function useCreateCaseViaPCore() {
  return useMutation({
    mutationFn: async (params: { caseTypeID: string; content: Record<string, unknown> }) => {
      const response = await ((PCore.getMashupApi() as any).createCase(params.caseTypeID, PCore.getConstants().APP.APP, {
        content: params.content
      }) as Promise<any>);
      return response;
    }
  });
}
