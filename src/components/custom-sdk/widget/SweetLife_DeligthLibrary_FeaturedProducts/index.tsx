/* eslint-disable @typescript-eslint/no-unused-vars */
import { PConnProps } from '@pega/react-sdk-components/lib/types/PConnProps';
import StyledSweetLifeDeligthLibraryFeaturedProductsWrapper from './styles';
import { IProduct } from '../../../../types/types';
import { useCallback, useEffect, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../../../design-system/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '../../../../design-system/ui/button';

interface SweetLifeDeligthLibraryFeaturedProductsProps extends PConnProps {
  // If any, enter additional props that only exist on this component
  header: string;
  description?: string;
  dataPage?: string;
  getPConnect: any;
}

// Duplicated runtime code from React SDK

// Page Widget example is the "App Announcment"

// props passed in combination of props from property panel (config.json) and run time props from Constellation
export default function SweetLifeDeligthLibraryFeaturedProducts(props: SweetLifeDeligthLibraryFeaturedProductsProps) {
  const { header = '', description, dataPage = '', getPConnect } = props;
  const [products, setProducts] = useState<IProduct[]>([]);

  const loadProducts = useCallback(() => {
    if (dataPage) {
      const pConn = getPConnect();

      const payload = {
        dataViewParameters: [{}]
      };
      (window as any).PCore.getDataApiUtils()
        .getData(dataPage, payload, pConn.getContextName())
        .then((response: any) => {
          if (response.data.data !== null) {
            setProducts(response.data.data);
          }
        })
        .catch(() => {});
    }
  }, [dataPage, getPConnect]);

  useEffect(() => {
    loadProducts();
  }, [dataPage, getPConnect, loadProducts]);

  if (products?.length === 0) return null;

  return (
    <StyledSweetLifeDeligthLibraryFeaturedProductsWrapper>
      <div>
        <h1 className='mb-4 text-3xl lg:text-4xl font-bold lg:font-extrabold lg:tracking-tight  tracking-tighter leading-none text-gray-900 dark:text-white'>
          Check out our featured products!
        </h1>
        <p className='mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400'> {description}</p>
        <Carousel
          className=''
          plugins={[
            Autoplay({
              delay: 7000,
              jump: true
            })
          ]}
          opts={{
            align: 'start',
            loop: true
          }}
        >
          <CarouselContent>
            {products.length > 0 &&
              products.map(product => {
                const theKey = `product-${product.SKU}`;
                return (
                  <CarouselItem key={theKey} className='md:basis-1/2 lg:basis-1/3'>
                    <div key={product.Name} className='block rounded-xl bg-white shadow-lg dark:bg-gray-600 text-center'>
                      <div className='flex my-4 flex-col items-center align-middle center'>
                        <img className='mt-4 rounded-t-xl w-32 h-32' src={`assets/img/prod_${Math.floor(Math.random() * 13) + 1}.svg`} alt='' />
                      </div>
                      <div className='p-6'>
                        <h5 className='mb-2 text-xl font-bold tracking-wide text-neutral-800 dark:text-neutral-50'>{product.Name}</h5>
                        <div className='px-6 py-4 dark:border-neutral-500'>
                          <h5 className='flex items-center justify-center text-neutral-500 dark:text-neutral-300'>
                            <span className='inline-block whitespace-nowrap rounded-[0.27rem] bg-gray-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-lg font-bold leading-none text-gray-700'>
                              ${product.Cost}
                            </span>
                          </h5>
                        </div>
                        <p className='mb-2 text-base text-neutral-500 dark:text-neutral-300'>
                          SKU: <span className='font-semibold'>{product.SKU}</span> / Category:{' '}
                          <span className='font-semibold'>{product.CategoryName}</span>
                        </p>

                        <Button variant='accent' size='lg'>
                          Show details
                        </Button>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </StyledSweetLifeDeligthLibraryFeaturedProductsWrapper>
  );
}
