/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable react/no-unescaped-entities */

import Header from './components/header';
import Footer from './components/footer';
import { Button } from '../design-system/ui/button';
import Loading from './components/loading';
import useConstellation from '../hooks/useConstellation';
import { useEffect, useState } from 'react';
import classNames from 'classnames';

export default function Home() {
  const [showPega, setShowPega] = useState('Info'); // Info, Pega, Confirmation
  const isPegaReady = useConstellation();

  useEffect(() => {
    if (isPegaReady) {
      (PCore.getMashupApi().openPage('FeaturedProducts_1', 'SL-TellUsMoreRef-UIPages') as any).then(() => {});
      setShowPega('Pega');
    }
  }, [isPegaReady]);

  return (
    <>
      <Header />

      <div className='flex-grow bg-white text-black'>
        <section className='bg-white dark:bg-gray-900'>
          <div className='py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12'>
            <a
              href='#'
              className='inline-flex justify-between items-center py-1 px-1 pr-4 mb-7 text-sm text-gray-700 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
            >
              <span className='text-xs bg-primary rounded-full text-white px-4 py-1.5 mr-3'>New</span>{' '}
              <span className='text-sm font-medium'>Brand new cookies is out! See what's new</span>
              <svg className='ml-2 w-5 h-5' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
                <path
                  fillRule='evenodd'
                  d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                  clipRule='evenodd'
                />
              </svg>
            </a>
            <h1 className='mb-4 text-3xl lg:text-4xl font-bold lg:font-extrabold lg:tracking-tight  tracking-tighter leading-none text-gray-900 dark:text-white'>
              Indulge in the Sweet Life: Where Every Treat is a Moment of Bliss!
            </h1>
            <p className='mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400'>
              Experience the Sweetest Moments with Our Delectable Creations. Discover a World of Flavor and Delight That Will Leave Your Taste Buds
              Begging for More.
            </p>
            <div className='flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4'>
              <Button variant='default'>
                Learn more
                <svg className='ml-2 -mr-1 w-5 h-5' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    fillRule='evenodd'
                    d='M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </Button>
              <Button
                variant='secondary'
                className='inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800'
              >
                <svg className='mr-2 -ml-1 w-5 h-5' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
                  <path d='M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z' />
                </svg>
                Watch video
              </Button>
            </div>
          </div>
        </section>
        <section className='w-full py-12 lg:py-18 bg-gray-100 dark:bg-gray-800'>
          <div className='container px-4 md:px-6'>
            <div className='space-y-4 mb-4 text-center'>
              <div className='mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400'>
                Our offer includes various types of chocolates, candy bars, cookies, jellies.
              </div>
              <h1 className='mb-4 text-3xl lg:text-4xl font-bold lg:font-extrabold lg:tracking-tight  tracking-tighter leading-none text-gray-900 dark:text-white'>
                What we do, we do with passion
              </h1>
            </div>
            <div className='grid gap-10 sm:px-10 md:gap-16 md:grid-cols-3 pt-6'>
              <div className='space-y-4'>
                <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800'>
                  <img src='assets/img/cookie.svg' className='w-16 h-16' />
                </div>
                <h2 className='mb-4 text-2xl font-semibold tracking-tight leading-none text-gray-900 dark:text-white'>Delicious Homemade Cookies</h2>
                <p className='text-gray-500 dark:text-gray-400 text-lg'>
                  Our cookies are baked fresh daily using the finest ingredients. Enjoy the perfect balance of sweetness and crunch in every bite.
                </p>
                <Button variant='outline' size='sm'>
                  Read more
                </Button>
              </div>
              <div className='space-y-4'>
                <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800'>
                  <img src='assets/img/icecream.svg' className='w-16 h-16' />
                </div>
                <h2 className='mb-4 text-2xl font-semibold tracking-tight leading-none text-gray-900 dark:text-white'>Handcrafted Ice Creams</h2>
                <p className='text-gray-500 dark:text-gray-400 text-lg'>
                  Our ice creams are made with the freshest ingredients and churned to perfection. Indulge in a variety of classic and unique flavors.
                </p>
                <Button variant='outline' size='sm'>
                  Read more
                </Button>
              </div>
              <div className='space-y-4'>
                <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800'>
                  {' '}
                  <img src='assets/img/lollipop.svg' className='w-16 h-16' />
                </div>
                <h2 className='mb-4 text-2xl font-semibold tracking-tight leading-none text-gray-900 dark:text-white'>Artisanal Lollipops</h2>
                <p className='text-gray-500 dark:text-gray-400 text-lg'>
                  Our lollipops are handcrafted with care, using only the finest ingredients. Enjoy a variety of unique and delightful flavors.
                </p>
                <Button variant='outline' size='sm'>
                  Read more
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className='bg-white dark:bg-gray-900'>
          <div className='py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12'>
            {isPegaReady ? <div id='pega-root' className={classNames('', { hidden: showPega !== 'Pega' })} /> : <Loading />}
          </div>
        </section>
        <section
          className='bg-gray-100 dark:bg-gray-800
'
        >
          <div className='max-w-screen-xl px-4 py-8 mx-auto text-center lg:py-16 lg:px-6'>
            <div className='mx-auto max-w-screen-sm'>
              <h2 className='mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white'>Sweet Life in numbers</h2>
              <p className='mb-8 font-light text-gray-500 lg:mb-16 text-xl dark:text-gray-400'>
                Sweet words, sweet life: hear what our customers have to say.
              </p>
            </div>
            <dl className='grid max-w-screen-md gap-8 mx-auto text-gray-900 sm:grid-cols-3 dark:text-white'>
              <div className='flex flex-col items-center justify-center'>
                <dt className='mb-2 text-3xl md:text-4xl font-extrabold'>100+</dt>
                <dd className='font-light text-gray-500 dark:text-gray-400'>products</dd>
              </div>
              <div className='flex flex-col items-center justify-center'>
                <dt className='mb-2 text-3xl md:text-4xl font-extrabold'>45</dt>
                <dd className='font-light text-gray-500 dark:text-gray-400'>years of tradition</dd>
              </div>
              <div className='flex flex-col items-center justify-center'>
                <dt className='mb-2 text-3xl md:text-4xl font-extrabold'>3</dt>
                <dd className='font-light text-gray-500 dark:text-gray-400'>factories</dd>
              </div>
              <div className='flex flex-col items-center justify-center'>
                <dt className='mb-2 text-3xl md:text-4xl font-extrabold'>650</dt>
                <dd className='font-light text-gray-500 dark:text-gray-400'>employees</dd>
              </div>
              <div className='flex flex-col items-center justify-center'>
                <dt className='mb-2 text-3xl md:text-4xl font-extrabold'>25</dt>
                <dd className='font-light text-gray-500 dark:text-gray-400'>countries</dd>
              </div>
              <div className='flex flex-col items-center justify-center'>
                <dt className='mb-2 text-3xl md:text-4xl font-extrabold'>100%</dt>
                <dd className='font-light text-gray-500 dark:text-gray-400'>happy customers</dd>
              </div>
            </dl>
          </div>
        </section>
        <section className='bg-white dark:bg-gray-900'>
          <div className='py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-6'>
            <div className='mx-auto max-w-screen-sm'>
              <h2 className='mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white'>Testimonials</h2>
              <p className='mb-8 font-light text-gray-500 lg:mb-16 text-xl dark:text-gray-400'>
                Sweet words, sweet life: hear what our customers have to say.
              </p>
            </div>
            <div className='grid mb-8 lg:mb-12 lg:grid-cols-2 gap-8'>
              <figure className='flex flex-col justify-center items-center p-8 rounded-lg text-center bg-gray-50 border-b border-gray-200 md:p-12 lg:border-r dark:bg-gray-800 dark:border-gray-700'>
                <blockquote className='mx-auto mb-8 max-w-2xl text-gray-500 dark:text-gray-400'>
                  <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>Speechless how tasty it is</h3>
                  <p className='my-4 text-lg'>
                    "I've never tasted sweets quite like those from Sweet Life. From the moment you take your first bite, you're transported to a
                    world of pure bliss. Each confection is meticulously crafted with the finest ingredients, and the attention to detail is evident
                    in every mouthful
                  </p>
                  <p className='my-4  text-lg'>
                    Whether it's their decadent chocolate truffles or their delicate pastries, every treat from Sweet Life is a masterpiece. It's no
                    wonder I find myself coming back for more, time and time again. Thank you, Sweet Life, for bringing such joy to my taste buds!"
                  </p>
                </blockquote>
                <figcaption className='flex justify-center items-center space-x-3'>
                  <img
                    className='w-9 h-9 rounded-full'
                    src='https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/karen-nelson.png'
                    alt='profile picture'
                  />
                  <div className='space-y-0.5 font-medium dark:text-white text-left'>
                    <div>Bonnie Green</div>
                    <div className='text-sm font-light text-gray-500 dark:text-gray-400'>New client</div>
                  </div>
                </figcaption>
              </figure>
              <figure className='flex flex-col justify-center items-center p-8 rounded-lg  text-center bg-gray-50 border-b border-gray-200 md:p-12 dark:bg-gray-800 dark:border-gray-700'>
                <blockquote className='mx-auto mb-8 max-w-2xl text-gray-500 dark:text-gray-400'>
                  <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>Solid foundation for any project</h3>
                  <p className='my-4 text-lg'>
                    "Sweet Life's sweets are a true indulgence. From the first glance at their beautifully decorated pastries to the last bite of
                    their heavenly chocolates, every experience with Sweet Life is unforgettable. Their treats have become my go-to for every special
                    occasion, from birthdays to anniversaries and everything in between. What sets Sweet Life apart is not only the exceptional taste
                    of their sweets but also the passion and dedication that goes into each creation.
                  </p>
                  <p className='my-4 text-lg'>
                    It's evident that every dessert is made with love, and that's what makes Sweet Life truly special. Thank you for making every
                    moment sweeter!"
                  </p>
                </blockquote>
                <figcaption className='flex justify-center items-center space-x-3'>
                  <img
                    className='w-9 h-9 rounded-full'
                    src='https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/roberta-casas.png'
                    alt='profile picture'
                  />
                  <div className='space-y-0.5 font-medium dark:text-white text-left'>
                    <div>Roberta Casas</div>
                    <div className='text-sm font-light text-gray-500 dark:text-gray-400'>Happy client</div>
                  </div>
                </figcaption>
              </figure>
              <figure className='flex flex-col justify-center items-center p-8 rounded-lg  text-center bg-gray-50 border-b border-gray-200 lg:border-b-0 md:p-12 lg:border-r dark:bg-gray-800 dark:border-gray-700'>
                <blockquote className='mx-auto mb-8 max-w-2xl text-gray-500 dark:text-gray-400'>
                  <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>Mindblowing workflow and variants</h3>
                  <p className='my-4 text-lg'>
                    "Absolutely delightful! From the moment you step into Sweet Life's shop, you're greeted with the irresistible aroma of freshly
                    baked goodies.
                  </p>
                  <p className='my-4 text-lg'>
                    The flavors are so rich and decadent, it's like a party in your mouth with every bite. Each sweet is expertly crafted with care
                    and precision, ensuring that every aspect of the dessert is perfection. Whether you're a chocolate lover or a fan of fruity
                    delights, there's something for everyone at Sweet Life. Their treats have become a staple in my life, and I can't imagine
                    celebrating any special occasion without them! 🤯..
                  </p>
                  <p className='my-4 text-lg'>
                    Aesthetically, the well designed components are beautiful and will undoubtedly level up your next application."
                  </p>
                </blockquote>
                <figcaption className='flex justify-center items-center space-x-3'>
                  <img
                    className='w-9 h-9 rounded-full'
                    src='https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/jese-leos.png'
                    alt='profile picture'
                  />
                  <div className='space-y-0.5 font-medium dark:text-white text-left'>
                    <div>Jese Leos</div>
                    <div className='text-sm font-light text-gray-500 dark:text-gray-400'>Enterprise client</div>
                  </div>
                </figcaption>
              </figure>
              <figure className='flex flex-col justify-center items-center p-8 rounded-lg  text-center bg-gray-50 border-gray-200 md:p-12 dark:bg-gray-800 dark:border-gray-700'>
                <blockquote className='mx-auto mb-8 max-w-2xl text-gray-500 dark:text-gray-400'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Efficient Collaborating</h3>
                  <p className='my-4 text-lg'>
                    "As a self-proclaimed dessert aficionado, I've had my fair share of sweets from all around the world. But none have quite captured
                    my heart like those from Sweet Life. From the moment I discovered their shop, I knew I had stumbled upon something extraordinary.
                    Every dessert feels like a work of art, meticulously crafted to perfection. Whether it's their delicate macarons or their
                    indulgent cheesecakes, each sweet is a testament to Sweet Life's dedication to excellence.
                  </p>
                  <p className='my-4 text-lg'>
                    I find myself constantly craving their treats, and I'm always excited to see what new creations they come up with. Thank you,
                    Sweet Life, for continually delighting my taste buds and bringing sweetness into my life!"
                  </p>
                </blockquote>
                <figcaption className='flex justify-center items-center space-x-3'>
                  <img
                    className='w-9 h-9 rounded-full'
                    src='https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/joseph-mcfall.png'
                    alt='profile picture'
                  />
                  <div className='space-y-0.5 font-medium dark:text-white text-left'>
                    <div>Joseph McFall</div>
                    <div className='text-sm font-light text-gray-500 dark:text-gray-400'>Longtime client</div>
                  </div>
                </figcaption>
              </figure>
            </div>
            <div className='text-center'>
              <Button variant='outline' size='default'>
                Read more
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
