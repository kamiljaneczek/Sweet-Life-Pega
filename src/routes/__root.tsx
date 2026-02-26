import { createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import Header from '../app/components/header';
import Footer from '../app/components/footer';

function RootComponent() {
  return (
    <div className='flex flex-col min-h-screen bg-white dark:bg-gray-800'>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

// eslint-disable-next-line import/prefer-default-export
export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    if (location.pathname.endsWith('.html')) {
      throw redirect({
        to: location.pathname.replace(/\.html$/, '') || '/'
      });
    }
  },
  component: RootComponent
});
