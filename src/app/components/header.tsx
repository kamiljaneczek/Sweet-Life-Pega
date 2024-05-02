import { Button } from '../../design-system/ui/button';

const Header = () => {
  return (
    <header className='bg-white py-6'>
      <div className='container mx-auto px-4 flex justify-between items-center'>
        <h1 className='text-3xl font-bold'>Sweet Life</h1>
        <nav className='space-x-6'>
          <a className='text-base font-medium hover:text-gray-600' href='#'>
            Home
          </a>
          <a className='text-base font-medium hover:text-gray-600' href='/about'>
            About
          </a>
          <a className='text-base font-medium hover:text-gray-600' href='/products'>
            Products
          </a>
          <a className='text-base font-medium hover:text-gray-600' href='/incidents'>
            Incidents
          </a>
          <a className='text-base font-medium hover:text-gray-600' href='/contact'>
            Contact
            <Button className='bg-[#bd1e59] text-white px-6 py-2 rounded-md hover:bg-[#a1194f]'>Contact Us</Button>
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
