import React from 'react';
import { Header } from '../design-system/header';
import { Button } from '../design-system/ui/button';
import { Input } from '../design-system/ui/input';
import { Label } from '../design-system/ui/label';
import { Textarea } from '../design-system/ui/textarea';

const Contact = () => {
  return (
    <>
      <Header />
      <section className='w-full py-12 md:py-24 lg:py-32'>
        <div className='container px-4 md:px-6'>
          <div className='grid items-center gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_550px]'>
            <div className='flex flex-col items-center justify-center space-y-4 text-center'>
              <img
                alt='Sweet Life'
                className='mx-auto'
                height='100'
                src='/placeholder.svg'
                style={{
                  aspectRatio: '100/100',
                  objectFit: 'cover'
                }}
                width='100'
              />
              <div className='space-y-2'>
                <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none'>Sweet Life</h1>
                <p className='max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400'>
                  Indulge in the sweetest treats from our family-owned bakery.
                </p>
              </div>
            </div>
            <div className='space-y-4'>
              <h2 className='text-2xl font-bold'>Get in Touch</h2>
              <form className='space-y-4'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>Name</Label>
                    <Input id='name' placeholder='Enter your name' />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email</Label>
                    <Input id='email' placeholder='Enter your email' type='email' />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='message'>Message</Label>
                  <Textarea className='min-h-[100px]' id='message' placeholder='Enter your message' />
                </div>
                <Button className='w-full' type='submit'>
                  Submit
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <section className='w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800'>
        <div className='container px-4 md:px-6'>
          <div className='grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-12'>
            <div className='space-y-4'>
              <h2 className='text-2xl font-bold'>Contact Us</h2>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <MapPinIcon className='h-5 w-5 text-gray-500 dark:text-gray-400' />
                  <p>123 Sweet Street, Candyland, CA 12345</p>
                </div>
                <div className='flex items-center gap-2'>
                  <PhoneIcon className='h-5 w-5 text-gray-500 dark:text-gray-400' />
                  <p>(555) 555-5555</p>
                </div>
                <div className='flex items-center gap-2'>
                  <MailIcon className='h-5 w-5 text-gray-500 dark:text-gray-400' />
                  <p>info@sweetlife.com</p>
                </div>
              </div>
              <div className='flex items-center gap-4'>
                <a className='text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50' href='#'>
                  <FacebookIcon className='h-6 w-6' />
                  <span className='sr-only'>Facebook</span>
                </a>
                <a className='text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50' href='#'>
                  <TwitterIcon className='h-6 w-6' />
                  <span className='sr-only'>Twitter</span>
                </a>
                <a className='text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50' href='#'>
                  <InstagramIcon className='h-6 w-6' />
                  <span className='sr-only'>Instagram</span>
                </a>
              </div>
            </div>
            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950'>
              <img
                alt='Sweet Life Bakery'
                className='mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center'
                height='310'
                src='/placeholder.svg'
                width='550'
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

function FacebookIcon(props) {
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
      <path d='M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' />
    </svg>
  );
}

function InstagramIcon(props) {
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
      <rect width='20' height='20' x='2' y='2' rx='5' ry='5' />
      <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
      <line x1='17.5' x2='17.51' y1='6.5' y2='6.5' />
    </svg>
  );
}

function MailIcon(props) {
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
      <rect width='20' height='16' x='2' y='4' rx='2' />
      <path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' />
    </svg>
  );
}

function MapPinIcon(props) {
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
      <path d='M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' />
      <circle cx='12' cy='10' r='3' />
    </svg>
  );
}

function PhoneIcon(props) {
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
      <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' />
    </svg>
  );
}

function TwitterIcon(props) {
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
      <path d='M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z' />
    </svg>
  );
}

export default Contact;
