// from react_root.js
import { render } from 'react-dom';
import {} from 'react-router-dom';
import './common.css';
import { Switch, Route, BrowserRouter } from 'react-router-dom';

import Home from './app/home';
import Company from './app/company';
import Products from './app/products';
import Contact from './app/contact';
import Support from './app/support';
import DesingSystem from './app/desingsystem';

const baseURL = '/';

const outletElement = document.getElementById('outlet');

if (outletElement) {
  render(
    <BrowserRouter>
      <Switch>
        <Route exact path={`${baseURL}`} component={Home} />
        <Route path={`${baseURL}index.html`} component={Home} />
        <Route path={`${baseURL}company`} component={Company} />
        <Route path={`${baseURL}company.html`} component={Company} />
        <Route path={`${baseURL}products`} component={Products} />
        <Route path={`${baseURL}products.html`} component={Products} />
        <Route path={`${baseURL}support`} component={Support} />
        <Route path={`${baseURL}support.html`} component={Support} />
        <Route path={`${baseURL}contact`} component={Contact} />
        <Route path={`${baseURL}contact.html`} component={Contact} />
        <Route path={`${baseURL}desingsystem`} component={DesingSystem} />
        <Route path={`${baseURL}desingsystem.html`} component={DesingSystem} />
        <Route path='*' component={Home} />
      </Switch>
    </BrowserRouter>,
    document.getElementById('outlet')
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
