import { Button } from '../../design-system/ui/button';
import { useState } from 'react';
import ThemeSwitch from '../../design-system/theme';

const Header = () => {
  const [isMobleMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <header>
      <nav className='bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800'>
        <div className='flex flex-wrap justify-between items-center mx-auto max-w-screen-xl'>
          <a href='/' className='flex items-center'>
            <h1 className='text-2xl lg:text-4xl font-bold lg:font-extrabold tracking-tight leading-none text-gray-900 dark:text-white'>Sweet Life</h1>
          </a>
          <div className='flex items-center gap-4 lg:order-2'>
            <ThemeSwitch />

            <Button className='hidden lg:block' variant='accent'>
              Log in
            </Button>
            <Button
              data-collapse-toggle='mobile-menu-2'
              type='button'
              variant='default'
              className='lg:hidden'
              aria-controls='mobile-menu-2'
              onClick={() => setIsMobileMenuOpen(!isMobleMenuOpen)}
              aria-expanded='false'
            >
              <span className='sr-only'>Open main menu</span>
              {isMobleMenuOpen ? (
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    fillRule='evenodd'
                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              ) : (
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    fillRule='evenodd'
                    d='M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z'
                    clipRule='evenodd'
                  />
                </svg>
              )}
            </Button>
          </div>
          <div className='hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1' id='mobile-menu-2'>
            <ul className='flex flex-col mt-4 font-bold text-lg lg:flex-row lg:space-x-8 lg:mt-0'>
              <li>
                <a
                  href='/'
                  className='block py-2 pr-4 pl-3 text-primary rounded bg-primary lg:bg-transparent lg:text-primary-700 lg:p-0 dark:text-white'
                  aria-current='page'
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href='/company'
                  className='block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-100 lg:hover:bg-transparent lg:border-0 lg:hover:text-accent- lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700'
                >
                  Company
                </a>
              </li>
              <li>
                <a
                  href='/products'
                  className='block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-100 lg:hover:bg-transparent lg:border-0 lg:hover:text-accent- lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700'
                >
                  Products
                </a>
              </li>
              <li>
                <a
                  href='/support'
                  className='block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-100 lg:hover:bg-transparent lg:border-0 lg:hover:text-accent- lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700'
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  href='/contact'
                  className='block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-10 lg:hover:bg-transparent lg:border-0 lg:hover:text-accent- lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700'
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {isMobleMenuOpen ? (
            <div className='justify-between items-center w-full lg:hidden lg:w-auto lg:order-1' id='mobile-menu-2'>
              <ul className='flex flex-col mt-4 text-lg font-mendium lg:flex-row lg:space-x-8 lg:mt-0'>
                <li>
                  <a
                    href='/'
                    className='block py-2 pr-4 pl-3 text-white rounded bg-primary lg:bg-transparent lg:text-primary-700 lg:p-0 dark:text-white'
                    aria-current='page'
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href='/company'
                    className='block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-accent- lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700'
                  >
                    Company
                  </a>
                </li>
                <li>
                  <a
                    href='/products'
                    className='block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-accent- lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700'
                  >
                    Products
                  </a>
                </li>
                <li>
                  <a
                    href='/support'
                    className='block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-accent- lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700'
                  >
                    Support
                  </a>
                </li>
                <li>
                  <a
                    href='/contact'
                    className='block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-accent- lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700'
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href='#'
                    className='block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-accent- lg:p-0 dark:text-gray-400 lg:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white lg:dark:hover:bg-transparent dark:border-gray-700'
                  >
                    Log in
                  </a>
                </li>
              </ul>
            </div>
          ) : null}
        </div>
      </nav>
    </header>
  );
};

export default Header;
