import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';
import { queryClient } from './api/query-client';
import { ensureConstellationInit } from './hooks/useConstellation';
import { router } from './router';
import './app.css';
import './common.css';

// Start Pega SDK auth + bootstrap eagerly on initial page load.
// This ensures loginIfNecessary runs during the browser's initial load
// rather than being deferred to SPA navigation (which can fail).
ensureConstellationInit();

const outletElement = document.getElementById('outlet');

if (outletElement) {
  createRoot(outletElement).render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
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
