import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';
import { queryClient } from './api/query-client';
import { router } from './router';
import './app.css';
import './common.css';

const outletElement = document.getElementById('outlet');

if (outletElement) {
  createRoot(outletElement).render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

document.addEventListener('SdkLoggedOut', () => {
  queryClient.clear();

  const thePegaRoot = document.getElementById('pega-root');
  if (thePegaRoot) {
    // Clear any prior Pega content within pega root
    thePegaRoot.innerHTML = '';
    const theLogoutMsgDiv = document.createElement('div');
    theLogoutMsgDiv.setAttribute('style', 'margin: 5px;');
    theLogoutMsgDiv.innerHTML = `You are logged out. Refresh the page to log in again.`;
    thePegaRoot.appendChild(theLogoutMsgDiv);
  }
  sessionStorage.removeItem('rsdk_portalName');
});
