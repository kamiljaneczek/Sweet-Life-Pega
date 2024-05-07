import { Button } from '../../design-system/ui/button';

function LocateIcon(props) {
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
      <line x1='2' x2='5' y1='12' y2='12' />
      <line x1='19' x2='22' y1='12' y2='12' />
      <line x1='12' x2='12' y1='2' y2='5' />
      <line x1='12' x2='12' y1='19' y2='22' />
      <circle cx='12' cy='12' r='7' />
    </svg>
  );
}

function MailboxIcon(props) {
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
      <path d='M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z' />
      <polyline points='15,9 18,9 18,11' />
      <path d='M6.5 5C9 5 11 7 11 9.5V17a2 2 0 0 1-2 2v0' />
      <line x1='6' x2='7' y1='10' y2='10' />
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

const Footer = () => {
  return (
    <footer className='bg-gray-900 text-gray-300 py-12 md:py-16'>
      <div className='container px-4 md:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
        <div className='space-y-4'>
          <h4 className='text-lg font-semibold'>Get in Touch</h4>
          <ul className='space-y-2 text-sm'>
            <li>
              <a href='/contact'>Contact Us</a>
            </li>
            <li>
              <a href='/about'>About</a>
            </li>
            <li>
              <a href='/products'>Products</a>
            </li>
          </ul>
        </div>
        <div className='space-y-4'>
          <h4 className='text-lg font-semibold'>Don&apos;t miss new products!</h4>
          <p className='text-sm'>Subscribe to our newsletter to stay up-to-date on the latest releases.</p>
          <form className='flex items-center space-x-2'>
            <input
              className='bg-gray-800 border-gray-700 text-gray-300 placeholder:text-gray-500 focus:border-primary focus:ring-primary'
              placeholder='Enter your email'
              type='email'
            />
            <Button size='sm' variant='default'>
              Subscribe
            </Button>
          </form>
        </div>
        <div className='space-y-4'>
          <h4 className='text-lg font-semibold'>Our Guidelines</h4>
          <ul className='space-y-2 text-sm'>
            <li>
              <a href='#'>Shipping & Returns</a>
            </li>
            <li>
              <a href='#'>Refund Policy</a>
            </li>
            <li>
              <a href='#'>FAQs</a>
            </li>
          </ul>
        </div>
        <div className='space-y-4'>
          <h4 className='text-lg font-semibold'>Legal</h4>
          <ul className='space-y-2 text-sm'>
            <li>
              <a href='#'>Terms of Service</a>
            </li>
            <li>
              <a href='#'>Privacy Policy</a>
            </li>
            <li>
              <a href='#'>Cookie Policy</a>
            </li>
          </ul>
        </div>
      </div>
      <div className='container px-4 md:px-6 mt-8 md:mt-12 flex flex-col md:flex-row items-center md:justify-between space-y-4 md:space-y-0'>
        <div className='flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4'>
          <MailboxIcon className='w-5 h-5 mr-2' />
          <a className='text-sm' href='#'>
            contact@sweetlife.com
          </a>
        </div>
        <div className='flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4'>
          <PhoneIcon className='w-5 h-5 mr-2' />
          <a className='text-sm' href='#'>
            903-179-8309
          </a>
        </div>
        <div className='flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4'>
          <LocateIcon className='w-5 h-5 mr-2' />
          <span className='text-sm'>511 Schiller brucke, Boston</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
