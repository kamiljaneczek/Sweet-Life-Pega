/* eslint-disable no-console */

import { SelectTrigger } from '@radix-ui/react-select';
import Header from './components/header';
import { Label } from '../design-system/ui/label';
import { Select, SelectContent, SelectItem, SelectValue } from '../design-system/ui/select';
import useConstellation from '../hooks/useConstellation';
import { useEffect, useState } from 'react';
import { IProduct } from '../types';
import Footer from './components/footer';

/* interface IconComponentProps {
  iconName: keyof typeof productIcon;
}

const productIcon = {
  Cookie,
  CandyCane,
  Lollipop,
  Dessert,
  Donut,
  Croissant
};

function IconComponent({ iconName }: IconComponentProps) {
  const Icon = productIcon[iconName];

  return <Icon />;
}
 */
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
    <div className='w-full'>
      <div id='pega-root' />
      <Header />
      <main className='py-12 px-6'>
        <div className='container mx-auto'>
          <div className='flex items-center justify-between mb-8'>
            <h1 className='text-3xl font-bold text-[#333] dark:text-white'>Explore our Sweet Treats</h1>
            <div className='flex items-center space-x-4'>
              <Label className='text-[#666] dark:text-gray-400' htmlFor='price-range'>
                Price Range
              </Label>
              <Select>
                <SelectTrigger className='w-40 text-[#666] dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700' id='price-range'>
                  <SelectValue placeholder='Select price range' />
                </SelectTrigger>{' '}
                <SelectContent>
                  <SelectItem value='all'>all</SelectItem>
                  <SelectItem value='0-10'>$0 - $10</SelectItem>
                  <SelectItem value='10-20'>$20 - $30</SelectItem>
                </SelectContent>
              </Select>
              <Label className='text-[#666] dark:text-gray-400' htmlFor='category'>
                Category
              </Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder='Select category' />
                </SelectTrigger>{' '}
                <SelectContent>
                  <SelectItem value='Chocolates'>Chocolates</SelectItem>
                  <SelectItem value='Bonbons'>Bonbons</SelectItem>
                  <SelectItem value='Candies'>Candies</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3 lg:grid-cols-4 gap-8'>
            {products.map(product => (
              <div key={product.Name} className='hover:scale-105 block rounded-xl bg-white shadow-lg dark:bg-neutral-700 text-center'>
                <div className='flex my-4 flex-col items-center align-middle center'>
                  <img className='rounded-t-xl w-32 h-32' src={`assets/img/prod_${Math.floor(Math.random() * 13) + 1}.svg`} alt='' />
                </div>
                <div className='p-6'>
                  <h5 className='mb-2 text-xl font-bold tracking-wide text-neutral-800 dark:text-neutral-50'>{product.Name}</h5>

                  <p className='mb-2 text-base text-neutral-500 dark:text-neutral-300'>
                    SKU: <span className='font-semibold'>{product.SKU}</span> / Category:{' '}
                    <span className='font-semibold'>{product.CategoryName}</span>
                  </p>

                  <a
                    href='#'
                    className='mt-3 inline-block rounded bg-blue-500 px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-blue-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-blue-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-blue-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]'
                  >
                    Show details
                  </a>
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
      </main>
      <Footer />
    </div>
  );
};

export default Products;
