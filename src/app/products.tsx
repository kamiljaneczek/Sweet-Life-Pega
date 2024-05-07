/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { SelectTrigger } from '@radix-ui/react-select';
import Header from './components/header';
import { Button } from '../design-system/ui/button';
import { Label } from '../design-system/ui/label';
import { Select, SelectContent, SelectItem, SelectValue } from '../design-system/ui/select';
import useConstellation from '../hooks/useConstellation';
import { useEffect, useState } from 'react';
import { IProduct } from '../types';
import { Cookie, CandyCane, Lollipop, Dessert, Donut, Croissant } from 'lucide-react';

interface IconComponentProps {
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
      <header className='bg-[#f8f8f8] py-4 px-6 dark:bg-gray-900'>
        <div className='container mx-auto flex items-center justify-between'>
          <a className='text-2xl font-bold text-[#333] dark:text-white' href='#'>
            Sweet Life
          </a>
          <nav className='hidden md:flex items-center space-x-6'>
            <a className='text-[#666] hover:text-[#333] dark:text-gray-400 dark:hover:text-white' href='#'>
              Chocolates
            </a>
            <a className='text-[#666] hover:text-[#333] dark:text-gray-400 dark:hover:text-white' href='#'>
              Bonbons
            </a>
            <a className='text-[#666] hover:text-[#333] dark:text-gray-400 dark:hover:text-white' href='#'>
              Candies
            </a>
            <a className='text-[#666] hover:text-[#333] dark:text-gray-400 dark:hover:text-white' href='#'>
              About
            </a>
          </nav>
          <div className='flex items-center space-x-4'>
            <Button className='text-[#666] hover:text-[#333] dark:text-gray-400 dark:hover:text-white' variant='outline'>
              <SearchIcon className='h-5 w-5' />
            </Button>
            <Button className='text-[#666] hover:text-[#333] dark:text-gray-400 dark:hover:text-white' variant='outline'>
              <ShoppingCartIcon className='h-5 w-5' />
            </Button>
          </div>
        </div>
      </header>
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
                  <SelectValue placeholder='Theme' />
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
                <SelectTrigger className='w-40 text-[#666] dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700' id='price-range'>
                  <SelectValue placeholder='Theme' />
                </SelectTrigger>{' '}
                <SelectContent>
                  <SelectItem value='Chocolates'>Chocolates</SelectItem>
                  <SelectItem value='Bonbons'>Bonbons</SelectItem>
                  <SelectItem value='Candies'>Candies</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
            {products.map(product => (
              <div key={product.Name} className='bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-800'>
                {/*  <IconComponent iconName={product.Icon} /> */}
                <Cookie />
                <div className='p-4'>
                  <h3 className='text-xl font-bold text-[#333] dark:text-white mb-2'>{product.Name}</h3>
                  <p className='text-[#666] dark:text-gray-400 mb-4'>{product.ShortDesc}</p>
                  <div className='flex items-center justify-between'>
                    <span className='text-[#333] font-bold dark:text-white'>${product.Cost}</span>
                    <Button className='text-white bg-[#333] hover:bg-[#444] dark:bg-gray-700 dark:hover:bg-gray-600' variant='default'>
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer className='bg-[#f8f8f8] py-6 px-6 dark:bg-gray-900'>
        <div className='container mx-auto flex items-center justify-between'>
          <p className='text-[#666] dark:text-gray-400'>© 2024 Sweet Life. All rights reserved.</p>
          <div className='flex items-center space-x-4'>
            <a className='text-[#666] hover:text-[#333] dark:text-gray-400 dark:hover:text-white' href='#'>
              Privacy Policy
            </a>
            <a className='text-[#666] hover:text-[#333] dark:text-gray-400 dark:hover:text-white' href='#'>
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Products;

function SearchIcon(props) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <circle cx='11' cy='11' r='8' />
      <path d='m21 21-4.3-4.3' />
    </svg>
  );
}

function ShoppingCartIcon(props) {
  return (
    <svg
      {...props}
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <circle cx='8' cy='21' r='1' />
      <circle cx='19' cy='21' r='1' />
      <path d='M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12' />
    </svg>
  );
}
