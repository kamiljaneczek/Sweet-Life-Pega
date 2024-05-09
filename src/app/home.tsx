/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable react/no-unescaped-entities */

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../design-system/ui/carousel';
import Header from './components/header';
import Footer from './components/footer';

export default function Home() {
  return (
    <div className='min-h-screen bg-white text-black'>
      <Header />
      <main>
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
            <h1 className='mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white'>
              Indulge in the Sweet Life: Where Every Treat is a Moment of Bliss!
            </h1>
            <p className='mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400'>
              Experience the Sweetest Moments with Our Delectable Creations. Discover a World of Flavor and Delight That Will Leave Your Taste Buds
              Begging for More.
            </p>
            <div className='flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4'>
              <a
                href='#'
                className='inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-primary hover:bg-primary focus:ring-4 focus:ring-primary dark:focus:ring-primary'
              >
                Learn more
                <svg className='ml-2 -mr-1 w-5 h-5' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    fillRule='evenodd'
                    d='M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </a>
              <a
                href='#'
                className='inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800'
              >
                <svg className='mr-2 -ml-1 w-5 h-5' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
                  <path d='M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z' />
                </svg>
                Watch video
              </a>
            </div>
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
        <section className='bg-white dark:bg-gray-900'>
          <div className='max-w-screen-xl px-4 py-8 mx-auto text-center lg:py-16 lg:px-6'>
            <div className='mx-auto max-w-screen-sm'>
              <h2 className='mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white'>Sweet Life in numbers</h2>
              <p className='mb-8 font-light text-gray-500 lg:mb-16 sm:text-xl dark:text-gray-400'>
                Sweet words, sweet life: hear what our customers have to say.
              </p>
            </div>
            <dl className='grid max-w-screen-md gap-8 mx-auto text-gray-900 sm:grid-cols-3 dark:text-white'>
              <div className='flex flex-col items-center justify-center'>
                <dt className='mb-2 text-3xl md:text-4xl font-extrabold'>100+</dt>
                <dd className='font-light text-gray-500 dark:text-gray-400'>products</dd>
              </div>
              <div className='flex flex-col items-center justify-center'>
                <dt className='mb-2 text-3xl md:text-4xl font-extrabold'>3</dt>
                <dd className='font-light text-gray-500 dark:text-gray-400'>factories</dd>
              </div>
              <div className='flex flex-col items-center justify-center'>
                <dt className='mb-2 text-3xl md:text-4xl font-extrabold'>25</dt>
                <dd className='font-light text-gray-500 dark:text-gray-400'>countries</dd>
              </div>
              <div className='flex flex-col items-center justify-center'>
                <dt className='mb-2 text-3xl md:text-4xl font-extrabold'>100%</dt>
                <dd className='font-light text-gray-500 dark:text-gray-400'>happy customer</dd>
              </div>
            </dl>
          </div>
        </section>
        <section className='bg-white dark:bg-gray-900'>
          <div className='py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-6'>
            <div className='mx-auto max-w-screen-sm'>
              <h2 className='mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white'>Testimonials</h2>
              <p className='mb-8 font-light text-gray-500 lg:mb-16 sm:text-xl dark:text-gray-400'>
                Sweet words, sweet life: hear what our customers have to say.
              </p>
            </div>
            <div className='grid mb-8 lg:mb-12 lg:grid-cols-2'>
              <figure className='flex flex-col justify-center items-center p-8 text-center bg-gray-50 border-b border-gray-200 md:p-12 lg:border-r dark:bg-gray-800 dark:border-gray-700'>
                <blockquote className='mx-auto mb-8 max-w-2xl text-gray-500 dark:text-gray-400'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Speechless how tasty it is</h3>
                  <p className='my-4'>
                    "I've never tasted sweets quite like those from Sweet Life. From the moment you take your first bite, you're transported to a
                    world of pure bliss. Each confection is meticulously crafted with the finest ingredients, and the attention to detail is evident
                    in every mouthful
                  </p>
                  <p className='my-4'>
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
                    <div className='text-sm font-light text-gray-500 dark:text-gray-400'>Developer at Open AI</div>
                  </div>
                </figcaption>
              </figure>
              <figure className='flex flex-col justify-center items-center p-8 text-center bg-gray-50 border-b border-gray-200 md:p-12 dark:bg-gray-800 dark:border-gray-700'>
                <blockquote className='mx-auto mb-8 max-w-2xl text-gray-500 dark:text-gray-400'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Solid foundation for any project</h3>
                  <p className='my-4'>
                    "Sweet Life's sweets are a true indulgence. From the first glance at their beautifully decorated pastries to the last bite of
                    their heavenly chocolates, every experience with Sweet Life is unforgettable. Their treats have become my go-to for every special
                    occasion, from birthdays to anniversaries and everything in between. What sets Sweet Life apart is not only the exceptional taste
                    of their sweets but also the passion and dedication that goes into each creation.
                  </p>
                  <p className='my-4'>
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
                    <div className='text-sm font-light text-gray-500 dark:text-gray-400'>Lead designer at Dropbox</div>
                  </div>
                </figcaption>
              </figure>
              <figure className='flex flex-col justify-center items-center p-8 text-center bg-gray-50 border-b border-gray-200 lg:border-b-0 md:p-12 lg:border-r dark:bg-gray-800 dark:border-gray-700'>
                <blockquote className='mx-auto mb-8 max-w-2xl text-gray-500 dark:text-gray-400'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Mindblowing workflow and variants</h3>
                  <p className='my-4'>
                    "Absolutely delightful! From the moment you step into Sweet Life's shop, you're greeted with the irresistible aroma of freshly
                    baked goodies.
                  </p>
                  <p className='my-4'>
                    The flavors are so rich and decadent, it's like a party in your mouth with every bite. Each sweet is expertly crafted with care
                    and precision, ensuring that every aspect of the dessert is perfection. Whether you're a chocolate lover or a fan of fruity
                    delights, there's something for everyone at Sweet Life. Their treats have become a staple in my life, and I can't imagine
                    celebrating any special occasion without them! 🤯..
                  </p>
                  <p className='my-4'>
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
                    <div className='text-sm font-light text-gray-500 dark:text-gray-400'>Software Engineer at Facebook</div>
                  </div>
                </figcaption>
              </figure>
              <figure className='flex flex-col justify-center items-center p-8 text-center bg-gray-50 border-gray-200 md:p-12 dark:bg-gray-800 dark:border-gray-700'>
                <blockquote className='mx-auto mb-8 max-w-2xl text-gray-500 dark:text-gray-400'>
                  <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Efficient Collaborating</h3>
                  <p className='my-4'>
                    "As a self-proclaimed dessert aficionado, I've had my fair share of sweets from all around the world. But none have quite captured
                    my heart like those from Sweet Life. From the moment I discovered their shop, I knew I had stumbled upon something extraordinary.
                    Every dessert feels like a work of art, meticulously crafted to perfection. Whether it's their delicate macarons or their
                    indulgent cheesecakes, each sweet is a testament to Sweet Life's dedication to excellence.
                  </p>
                  <p className='my-4'>
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
                    <div className='text-sm font-light text-gray-500 dark:text-gray-400'>CTO at Google</div>
                  </div>
                </figcaption>
              </figure>
            </div>
            <div className='text-center'>
              <a
                href='#'
                className='py-2.5 px-5 mr-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700'
              >
                Show more...
              </a>
            </div>
          </div>
        </section>

        <section className='bg-white dark:bg-gray-900'>
          <div className='py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6'>
            <div className='max-w-screen-lg text-gray-500 sm:text-lg dark:text-gray-400'>
              <h2 className='mb-4 text-4xl tracking-tight font-bold text-gray-900 dark:text-white'>
                Powering innovation at <span className='font-extrabold'>200,000+</span> companies worldwide
              </h2>
              <p className='mb-4 font-light'>
                Track work across the enterprise through an open, collaborative platform. Link issues across Jira and ingest data from other software
                development tools, so your IT support and operations teams have richer contextual information to rapidly respond to requests,
                incidents, and changes.
              </p>
              <p className='mb-4 font-medium'>
                Deliver great service experiences fast - without the complexity of traditional ITSM solutions.Accelerate critical development work,
                eliminate toil, and deploy changes with ease.
              </p>
              <a
                href='#'
                className='inline-flex items-center font-medium text-primary-600 hover:text-primary-hover dark:text-primary dark:hover:text-primary-hover'
              >
                Learn more
                <svg className='ml-1 w-6 h-6' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    fillRule='evenodd'
                    d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              </a>
            </div>
          </div>
        </section>

        <section className='bg-white dark:bg-gray-900'>
          <div className='py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6'>
            <div className='max-w-screen-md'>
              <h2 className='mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white'>Let's find more that brings us together.</h2>
              <p className='mb-8 font-light text-gray-500 sm:text-xl dark:text-gray-400'>
                Flowbite helps you connect with friends, family and communities of people who share your interests. Connecting with your friends and
                family as well as discovering new ones is easy with features like Groups, Watch and Marketplace.
              </p>
              <div className='flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4'>
                <a
                  href='#'
                  className='inline-flex items-center justify-center px-4 py-2.5 text-base font-medium text-center text-white bg-primary rounded-lg hover:bg-primary-hover focus:ring-4 focus:ring-primary-hover dark:focus:ring-primary-hover'
                >
                  Get started
                </a>
                <a
                  href='#'
                  className='inline-flex items-center justify-center px-4 py-2.5 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-600'
                >
                  <svg className='mr-2 -ml-1 w-5 h-5' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z' />
                  </svg>
                  View more
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
