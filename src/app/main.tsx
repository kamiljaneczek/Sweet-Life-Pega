import { Button } from '../design-system/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../design-system/ui/carousel';
import Header from './components/header';
import Footer from './components/footer';

export default function Main() {
  /**
   * kick off the application's portal that we're trying to serve up
   */

  // One time (initialization) subscriptions and related unsubscribe

  /*
  useEffect(() => {
    if (isPegaReady) {
      setAccessGroup(PCore.getEnvironmentInfo().getAccessGroup());

      const dataViewName = 'D_ObjectList';
      const parameters = {
        Prop1: 'a'
      };
      const paging = {
        pageNumber: 1,
        pageSize: 10
      };
      const query = {
        distinctResultsOnly: true,
        select: [
          {
            field: 'Prop1'
          },
          {
            field: 'Prop2'
          }
        ]
      };

      (PCore.getDataPageUtils().getDataAsync(dataViewName, 'root', parameters, paging, query) as Promise<any>)
        .then(response => {
          // eslint-disable-next-line no-console
          console.log('DataPageUtils.getDataAsync response', response);
        })
        .catch(error => {
          throw new Error('Error', error);
        });
    }
  }, [isPegaReady]); */

  return (
    <div className='min-h-screen bg-white text-black'>
      <Header />
      <main>
        <section className='text-center py-24'>
          <div className='container mx-auto px-4'>
            <h2 className='text-2xl font-bold'>We will make your life sweet!</h2>
            <p className='text-lg text-gray-700 mt-4 mb-8'>Sweet Life company is committed to bring joy and happiness into your life.</p>
            <div className='flex justify-center space-x-4'>
              <Button className='bg-[#bd1e59] text-white px-6 py-2 rounded-md hover:bg-[#a1194f]'>Get started</Button>
              <Button className='bg-transparent text-[#bd1e59] px-6 py-2 rounded-md border border-[#bd1e59] hover:bg-[#bd1e59] hover:text-white'>
                Learn more
              </Button>
            </div>
            <img src='assets/img/cupcake.svg' className='w-32 h-32' />
          </div>
        </section>
        <section className='w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800'>
          <div className='container px-4 md:px-6'>
            <div className='space-y-4 text-center'>
              <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 sm:text-3xl md:text-4xl dark:bg-gray-800'>What we do</div>
              <h2 className='lg:leading-tighter mb-8 text-2xl font-bold tracking-tighter sm:text-2xl md:text-3xl xl:text-[3.4rem] 2xl:text-[3.75rem]'>
                Our offer includes various types of chocolates, candy bars, cookies, jellies.
              </h2>
            </div>
            <div className='grid gap-10 sm:px-10 md:gap-16 md:grid-cols-3'>
              <div className='space-y-4'>
                <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800'>
                  <img src='assets/img/cookie.svg' className='w-16 h-16' />
                </div>
                <h2 className='lg:leading-tighter text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl xl:text-[3.4rem] 2xl:text-[3.75rem]'>
                  Delicious Homemade Cookies
                </h2>
                <p className='text-gray-500 dark:text-gray-400'>
                  Our cookies are baked fresh daily using the finest ingredients. Enjoy the perfect balance of sweetness and crunch in every bite.
                </p>
                <a
                  className='inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300'
                  href='#'
                >
                  Read more
                </a>
              </div>
              <div className='space-y-4'>
                <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800'>
                  <img src='assets/img/icecream.svg' className='w-16 h-16' />
                </div>
                <h2 className='lg:leading-tighter text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl xl:text-[3.4rem] 2xl:text-[3.75rem]'>
                  Handcrafted Ice Creams
                </h2>
                <p className='text-gray-500 dark:text-gray-400'>
                  Our ice creams are made with the freshest ingredients and churned to perfection. Indulge in a variety of classic and unique flavors.
                </p>
                <a
                  className='inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300'
                  href='#'
                >
                  Read more
                </a>
              </div>
              <div className='space-y-4'>
                <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800'>
                  {' '}
                  <img src='assets/img/lollipop.svg' className='w-16 h-16' />
                </div>
                <h2 className='lg:leading-tighter text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl xl:text-[3.4rem] 2xl:text-[3.75rem]'>
                  Artisanal Lollipops
                </h2>
                <p className='text-gray-500 dark:text-gray-400'>
                  Our lollipops are handcrafted with care, using only the finest ingredients. Enjoy a variety of unique and delightful flavors.
                </p>
                <a
                  className='inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300'
                  href='#'
                >
                  Read more
                </a>
              </div>
            </div>
          </div>
        </section>
        <section className='w-full py-12 md:py-24 lg:py-32'>
          <div className='container grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10'>
            <div className='space-y-3'>
              <h2 className='text-3xl font-bold tracking-tighter sm:text-2xl md:text-3xl'>What our customers have to say</h2>
              <p className='mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400'>
                Hear from the people who love using our product.
              </p>
            </div>
            <Carousel className='w-full max-w-3xl'>
              <CarouselContent>
                <CarouselItem>
                  <div className='p-6 md:p-8'>
                    <blockquote className='text-lg font-semibold leading-snug lg:text-xl lg:leading-normal xl:text-2xl'>
                      “The customer service I received was exceptional. The support team went above and beyond to address my concerns.“
                    </blockquote>
                    <div className='mt-4 font-semibold'>Jules Winnfield</div>
                    <div className='text-sm text-gray-500 dark:text-gray-400'>CEO, Acme Inc</div>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className='p-6 md:p-8'>
                    <blockquote className='text-lg font-semibold leading-snug lg:text-xl lg:leading-normal xl:text-2xl'>
                      “I was hesitant at first, but after using the product, I was blown away by how easy it was to set up and use. Highly
                      recommended!“
                    </blockquote>
                    <div className='mt-4 font-semibold'>Mia Wallace</div>
                    <div className='text-sm text-gray-500 dark:text-gray-400'>Marketing Manager, Big Corp</div>
                  </div>
                </CarouselItem>
                <CarouselItem>
                  <div className='p-6 md:p-8'>
                    <blockquote className='text-lg font-semibold leading-snug lg:text-xl lg:leading-normal xl:text-2xl'>
                      “This product has completely transformed the way our team collaborates. The built-in tools make our workflow so much more
                      efficient.“
                    </blockquote>
                    <div className='mt-4 font-semibold'>Vincent Vega</div>
                    <div className='text-sm text-gray-500 dark:text-gray-400'>CTO, Acme Inc</div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
}
