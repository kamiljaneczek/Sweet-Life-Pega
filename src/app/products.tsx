/* import { SelectTrigger } from '@radix-ui/react-select'; */
import Header from './components/header';
/* import { Label } from '../design-system/ui/label';
import { Select, SelectContent, SelectItem, SelectValue } from '../design-system/ui/select'; */
import useConstellation from '../hooks/useConstellation';
import { useEffect, useState } from 'react';
import { IProduct } from '../types/types';
import Footer from './components/footer';
import Loading from './components/loading';
import { Button } from '../design-system/ui/button';
import classNames from 'classnames';

const Products = () => {
  const isPegaReady = useConstellation();
  const [products, setProducts] = useState<IProduct[]>([]);

  console.log('bIsPegaReady', isPegaReady);

  useEffect(() => {
    if (isPegaReady) {
      const dataViewName = 'D_ProductList';
      const parameters = {};
      const paging = {
        pageNumber: 1,
        pageSize: 30
      };
      const query = {
        distinctResultsOnly: true,
        select: [
          {
            field: 'Name'
          },
          {
            field: 'Category'
          },
          {
            field: 'SKU'
          },
          {
            field: 'Cost'
          },
          {
            field: 'CategoryName'
          }
        ]
      };

      (PCore.getDataPageUtils().getDataAsync(dataViewName, 'root', parameters, paging, query) as Promise<any>)
        .then(response => {
          console.log('DataPageUtils.getDataAsync response', response);
          setProducts(response.data);
        })
        .catch(error => {
          throw new Error('Error', error);
        });
    }
  }, [isPegaReady]);

  return (
    <>
      <Header />
      {!isPegaReady && <Loading />}
      <div className={classNames('flex-grow py-12 px-6 dark:bg-gray-900', { hidden: !isPegaReady })}>
        <div className='container mx-auto'>
          <div className='flex flex-col lg:flex-row items-center gap-y-2 gap-x-2 justify-between mb-8'>
            <h1 className='text-2xl lg:text-3xl font-bold text-[#333] dark:text-white'>Explore our Sweet Treats</h1>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 gap-8'>
            {products.map(product => (
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

                  <Button variant='accent'>Show details</Button>
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
        </div>
        <div id='pega-root' />
      </div>

      <Footer />
    </>
  );
};

export default Products;
