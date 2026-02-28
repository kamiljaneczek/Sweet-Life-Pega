import { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet, redirect } from '@tanstack/react-router';
import Footer from '../app/components/footer';
import Header from '../app/components/header';

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
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: ({ location }) => {
    if (location.pathname.endsWith('.html')) {
      throw redirect({
        to: location.pathname.replace(/\.html$/, '') || '/'
      });
    }
  },
  component: RootComponent
});
