const Footer = () => {
  return (
    <footer className='p-4 mb-auto bg-white md:p-8 lg:p-10 dark:bg-gray-800'>
      <div className='mx-auto max-w-screen-xl text-center'>
        <a href='/' className='flex justify-center items-center text-2xl font-semibold text-gray-900 dark:text-white'>
          Sweet Life Inc.
        </a>
        <p className='my-6 text-gray-500 dark:text-gray-400'>Indulge in the Sweet Life: Where Every Treat is a Moment of Bliss!</p>
        <ul className='flex flex-wrap justify-center items-center mb-6 text-gray-900 dark:text-white'>
          <li>
            <a href='/company' className='mr-4 hover:underline md:mr-6 '>
              Comapny
            </a>
          </li>
          <li>
            <a href='/products' className='mr-4 hover:underline md:mr-6'>
              Products
            </a>
          </li>
          <li>
            <a href='/support' className='mr-4 hover:underline md:mr-6 '>
              Support
            </a>
          </li>
          <li>
            <a href='/' className='mr-4 hover:underline md:mr-6'>
              Blog
            </a>
          </li>
          <li>
            <a href='/' className='mr-4 hover:underline md:mr-6'>
              Affiliate Program
            </a>
          </li>
          <li>
            <a href='/' className='mr-4 hover:underline md:mr-6'>
              FAQs
            </a>
          </li>
          <li>
            <a href='/contact' className='mr-4 hover:underline md:mr-6'>
              Contact
            </a>
          </li>
        </ul>
        <span className='text-sm text-gray-500 sm:text-center dark:text-gray-400'>
          © 2024 Made by{' '}
          <a href='https://www.kjaneczek.pl' className='hover:underline'>
            KJANECZEK.PL
          </a>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
