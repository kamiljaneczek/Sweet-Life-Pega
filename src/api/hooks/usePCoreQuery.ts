import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { type Product, ProductSchema } from '../generated/pega';
import { customFetch } from '../mutator/custom-fetch';

export type { Product };

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
  return queryOptions<Product[]>({
    queryKey: ['pcore', 'dataPage', 'D_ProductList'],
    queryFn: async () => {
      const response = await (PCore.getDataPageUtils().getDataAsync(
        'D_ProductList',
        'root',
        {},
        { pageNumber: 1, pageSize: 30 },
        {
          distinctResultsOnly: true,
          select: [{ field: 'pyGUID' }, { field: 'Name' }, { field: 'Category' }, { field: 'SKU' }, { field: 'Cost' }, { field: 'CategoryName' }]
        }
      ) as Promise<any>);
      const rawData = response?.data?.data ?? response?.data ?? response;
      return z.array(ProductSchema).parse(rawData);
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

export type CreateProductPayload = Pick<Product, 'Name' | 'SKU' | 'Category' | 'CategoryName' | 'Cost'> & {
  ShortDesc: string;
};

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: CreateProductPayload) =>
      customFetch('/data/D_ProductSavable', {
        method: 'POST',
        apiPrefix: '/api/application/v2',
        body: {
          data: { Name: product.Name, SKU: product.SKU, Category: product.Category },
          pageInstructions: []
        }
      }),
    onSuccess: () => {
      PCore.getDataPageUtils().clearDataPage?.('D_ProductList');
      queryClient.invalidateQueries({ queryKey: ['pcore', 'dataPage', 'D_ProductList'] });
    }
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { pyGUID: string; product: CreateProductPayload }) =>
      customFetch('/data/D_ProductSavable', {
        method: 'PUT',
        apiPrefix: '/api/application/v2',
        body: {
          data: { pyGUID: params.pyGUID, Name: params.product.Name, SKU: params.product.SKU, Category: params.product.Category },
          pageInstructions: []
        }
      }),
    onSuccess: () => {
      PCore.getDataPageUtils().clearDataPage?.('D_ProductList');
      queryClient.invalidateQueries({ queryKey: ['pcore', 'dataPage', 'D_ProductList'] });
    }
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pyGUID: string) => {
      const params = encodeURIComponent(JSON.stringify({ pyGUID }));
      return customFetch(`/data/D_ProductSavable?dataViewParameters=${params}`, {
        method: 'DELETE',
        apiPrefix: '/api/application/v2'
      });
    },
    onSuccess: () => {
      PCore.getDataPageUtils().clearDataPage?.('D_ProductList');
      queryClient.invalidateQueries({ queryKey: ['pcore', 'dataPage', 'D_ProductList'] });
    }
  });
}
