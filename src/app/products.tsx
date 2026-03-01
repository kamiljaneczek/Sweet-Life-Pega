import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { useMemo, useState } from 'react';
import { MOCK_PRODUCTS } from '../api/data/mock-products';
import { productListQueryOptions } from '../api/hooks/usePCoreQuery';
import { Button } from '../design-system/ui/button';
import usePegaMashup from '../hooks/usePegaMashup';
import { cn } from '../lib/utils';
import CreateProductDialog from './components/CreateProductDialog';
import ProductDetailsDialog from './components/ProductDetailsDialog';
import { ProductsPageSkeleton } from './components/skeletons';

const PAGE_SIZE = 12;

const Products = () => {
  const { isReady: isPegaReady, isTimedOut } = usePegaMashup({ renderUI: false });
  const { data: products = [], isPending, isError, error } = useQuery({ ...productListQueryOptions(), enabled: isPegaReady });
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(0);

  const isLoading = !isPegaReady && !isTimedOut;
  const showMockData = isTimedOut || (isPegaReady && isError);
  const displayProducts = showMockData ? MOCK_PRODUCTS : products;

  const categories = useMemo(() => {
    const unique = [...new Set(displayProducts.map((p) => p.CategoryName))].sort();
    return ['All', ...unique];
  }, [displayProducts]);

  const filteredProducts = selectedCategory === 'All' ? displayProducts : displayProducts.filter((p) => p.CategoryName === selectedCategory);

  const pageCount = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const paginatedProducts = filteredProducts.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const canPreviousPage = currentPage > 0;
  const canNextPage = currentPage < pageCount - 1;

  return (
    <>
      {(isLoading || (isPegaReady && isPending)) && <ProductsPageSkeleton />}
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

          <div className='mb-8'>
            <div className='flex items-center justify-between mb-4'>
              <h1 className='text-2xl lg:text-3xl font-bold text-[#333] dark:text-white'>Explore our Sweet Treats</h1>
              {!showMockData && <CreateProductDialog />}
            </div>
            <div className='flex flex-wrap gap-2'>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'accent' : 'outline'}
                  size='sm'
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentPage(0);
                  }}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {displayProducts.length === 0 && !isLoading && (
            <div className='py-20 text-center'>
              <p className='text-lg text-neutral-500 dark:text-neutral-400'>No products found.</p>
            </div>
          )}

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
            {paginatedProducts.map((product) => (
              <div key={product.Name} className='hover:scale-105 block rounded-xl bg-white shadow-lg dark:bg-gray-600 text-center'>
                <div className='flex my-4 flex-col items-center align-middle center'>
                  <img className='rounded-t-xl w-32 h-32' src={`assets/img/prod_${Math.floor(Math.random() * 13) + 1}.svg`} alt='' />
                </div>
                <div className='p-6'>
                  <h5 className='mb-2 text-xl font-bold tracking-wide text-neutral-800 dark:text-neutral-50'>{product.Name}</h5>

                  <p className='mb-2 text-base text-neutral-500 dark:text-neutral-300'>
                    SKU: <span className='font-semibold'>{product.SKU}</span> / Category:{' '}
                    <span className='font-semibold'>{product.CategoryName}</span>
                  </p>

                  {!showMockData && <ProductDetailsDialog product={product} />}
                </div>

                <div className='border-t-2 border-neutral-100 px-6 py-4 dark:border-neutral-500'>
                  <h5 className='flex items-center justify-center text-neutral-500 dark:text-neutral-300'>
                    <span className='inline-block whitespace-nowrap rounded-[0.27rem] bg-gray-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-lg font-bold leading-none text-gray-700'>
                      ${product.Cost}
                    </span>
                  </h5>
                </div>
              </div>
            ))}
          </div>

          {pageCount > 1 && (
            <div className='flex items-center justify-between mt-10'>
              <p className='text-sm text-neutral-500 dark:text-neutral-300'>
                Page {currentPage + 1} of {pageCount} ({filteredProducts.length} products)
              </p>
              <div className='flex items-center gap-2'>
                <Button variant='outline' size='sm' onClick={() => setCurrentPage(0)} disabled={!canPreviousPage}>
                  <ChevronFirst className='h-4 w-4' />
                </Button>
                <Button variant='outline' size='sm' onClick={() => setCurrentPage((p) => p - 1)} disabled={!canPreviousPage}>
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <Button variant='outline' size='sm' onClick={() => setCurrentPage((p) => p + 1)} disabled={!canNextPage}>
                  <ChevronRight className='h-4 w-4' />
                </Button>
                <Button variant='outline' size='sm' onClick={() => setCurrentPage(pageCount - 1)} disabled={!canNextPage}>
                  <ChevronLast className='h-4 w-4' />
                </Button>
              </div>
            </div>
          )}
        </div>
        <div id='pega-root' className='hidden' />
      </div>
    </>
  );
};

export default Products;
