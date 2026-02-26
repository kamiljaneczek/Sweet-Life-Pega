import { render } from 'react-dom';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import './common.css';

const outletElement = document.getElementById('outlet');

if (outletElement) {
  render(<RouterProvider router={router} />, outletElement);
}

document.addEventListener('SdkLoggedOut', () => {
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
