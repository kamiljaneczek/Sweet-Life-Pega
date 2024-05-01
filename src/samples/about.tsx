import React from 'react';
import { Header } from '../design-system/header';

const About = () => {
  return (
    <>
      <Header />
      <section className='w-full py-12 md:py-24 lg:py-32'>
        <div className='container px-4 md:px-6'>
          <div className='grid gap-6 lg:grid-cols-2 lg:gap-12'>
            <div className='space-y-4'>
              <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800'>Our Story</div>
              <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>The Origin of Sweet Life</h2>
              <p className='max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400'>
                Kate and Blake, two sisters, started Sweet Life with a passion for creating high-quality, delicious sweets. They drew inspiration from
                their family's long-standing tradition of baking and their childhood memories of making treats together.
              </p>
            </div>
            <img
              alt='Sweet Life Founders'
              className='mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full'
              height={310}
              src='/placeholder.svg'
              width={550}
            />
          </div>
        </div>
      </section>
      <section className='w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800'>
        <div className='container px-4 md:px-6'>
          <div className='grid gap-6 lg:grid-cols-2 lg:gap-12'>
            <img
              alt='Sweet Life Factory'
              className='mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full'
              height={310}
              src='/placeholder.svg'
              width={550}
            />
            <div className='space-y-4'>
              <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800'>Our Growth</div>
              <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>Scaling Sweet Life</h2>
              <p className='max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400'>
                Sweet Life now operates 3 state-of-the-art factories, allowing them to scale production and meet the growing demand for their
                products. The factories are equipped with the latest technology and staffed by a team of skilled confectioners.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className='w-full py-12 md:py-24 lg:py-32'>
        <div className='container px-4 md:px-6'>
          <div className='grid gap-6 lg:grid-cols-2 lg:gap-12'>
            <div className='space-y-4'>
              <div className='inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800'>Our Vision</div>
              <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>Bringing Joy Through Sweets</h2>
              <p className='max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400'>
                Sweet Life is committed to using only the finest, freshest ingredients in their products. They believe in sustainable and ethical
                business practices, supporting local communities, and bringing joy to their customers through their creations. The company's vision is
                to become a leading provider of premium, handcrafted sweets that are enjoyed by people around the world.
              </p>
            </div>
            <img
              alt='Sweet Life Products'
              className='mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full'
              height={310}
              src='/placeholder.svg'
              width={550}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
