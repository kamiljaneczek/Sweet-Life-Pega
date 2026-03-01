import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, ArrowUpDown, Info } from 'lucide-react';
import { MOCK_PRODUCTS } from '../api/data/mock-products';
import { type Product, productListQueryOptions } from '../api/hooks/usePCoreQuery';
import { Button } from '../design-system/ui/button';
import { DataTable } from '../design-system/ui/data-table';
import usePegaMashup from '../hooks/usePegaMashup';
import { cn } from '../lib/utils';
import { ProductsListPageSkeleton } from './components/skeletons';

const columns: ColumnDef<Product, unknown>[] = [
  {
    accessorKey: 'Name',
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Name
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => <span className='font-semibold'>{row.getValue('Name')}</span>
  },
  {
    accessorKey: 'SKU',
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        SKU
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => <span className='font-mono text-sm'>{row.getValue('SKU')}</span>
  },
  {
    accessorKey: 'CategoryName',
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Category
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const category = row.getValue('CategoryName') as string;
      const colorMap: Record<string, string> = {
        Cookies: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
        Chocolates: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
        Lollipops: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        Uncategorized: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      };
      const colors = colorMap[category] ?? 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200';
      return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', colors)}>{category}</span>;
    }
  },
  {
    accessorKey: 'Cost',
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Cost
        <ArrowUpDown className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const cost = row.getValue('Cost') as number;
      return <span className='font-semibold'>${cost.toFixed(2)}</span>;
    }
  }
];

const ProductsList = () => {
  const { isReady: isPegaReady, isTimedOut } = usePegaMashup({ renderUI: false });
  const { data: products = [], isPending, isError, error } = useQuery({ ...productListQueryOptions(), enabled: isPegaReady });

  const isLoading = !isPegaReady && !isTimedOut;
  const showMockData = isTimedOut || (isPegaReady && isError);
  const displayProducts = showMockData ? MOCK_PRODUCTS : products;

  return (
    <>
      {(isLoading || (isPegaReady && isPending)) && <ProductsListPageSkeleton />}
      <div className={cn('grow py-12 px-6 dark:bg-gray-900', { hidden: isLoading || (isPegaReady && isPending) })}>
        <div className='container mx-auto'>
          {isTimedOut && (
            <div className='mb-6 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200'>
              <Info className='h-4 w-4 shrink-0' />
              <span>Showing sample products — the Pega server is currently unavailable.</span>
            </div>
          )}

          {isPegaReady && isError && (
            <div className='mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200'>
              <AlertTriangle className='h-4 w-4 shrink-0' />
              <span>Failed to load products{error?.message ? `: ${error.message}` : ''}. Showing sample data instead.</span>
            </div>
          )}

          <h1 className='text-2xl lg:text-3xl font-bold text-[#333] dark:text-white mb-8'>Product Catalog</h1>

          {displayProducts.length === 0 && !isLoading ? (
            <div className='py-20 text-center'>
              <p className='text-lg text-neutral-500 dark:text-neutral-400'>No products found.</p>
            </div>
          ) : (
            <DataTable columns={columns} data={displayProducts} searchPlaceholder='Search products...' />
          )}
        </div>
        <div id='pega-root' className='hidden' />
      </div>
    </>
  );
};

export default ProductsList;
