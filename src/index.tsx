// from react_root.js
import { createRoot } from 'react-dom/client';
import './common.css';
import { BrowserRouter, Routes, Route } from 'react-router';

import Home from './app/home';
import Company from './app/company';
import Products from './app/products';
import Contact from './app/contact';
import Support from './app/support';
import DesingSystem from './app/desingsystem';

const baseURL = '/';

const outletElement = document.getElementById('outlet');

if (outletElement) {
  const root = createRoot(outletElement);
  root.render(
    <BrowserRouter>
      <Routes>
        <Route path={`${baseURL}`} element={<Home />} />
        <Route path={`${baseURL}company`} element={<Company />} />
        <Route path={`${baseURL}products`} element={<Products />} />
        <Route path={`${baseURL}support`} element={<Support />} />
        <Route path={`${baseURL}contact`} element={<Contact />} />
        <Route path={`${baseURL}desingsystem`} element={<DesingSystem />} />
        <Route path='*' element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
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
