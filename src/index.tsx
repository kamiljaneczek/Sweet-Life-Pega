// from react_root.js
import { render } from 'react-dom';
import {} from 'react-router-dom';
import './common.css';
import { Switch, Route, BrowserRouter } from 'react-router-dom';

import Main from './app/main';
import About from './app/About';
import Products from './app/Products';
import Contact from './app/contact';
import Incidents from './app/Incidents';

const baseURL = '/';

const outletElement = document.getElementById('outlet');

if (outletElement) {
  render(
    <BrowserRouter>
      <Switch>
        <Route exact path={`${baseURL}`} component={Main} />
        <Route path={`${baseURL}index.html`} component={Main} />
        <Route path={`${baseURL}about`} component={About} />
        <Route path={`${baseURL}about.html`} component={About} />
        <Route path={`${baseURL}products`} component={Products} />
        <Route path={`${baseURL}products.html`} component={Products} />
        <Route path={`${baseURL}incidents`} component={Incidents} />
        <Route path={`${baseURL}incidents.html`} component={Incidents} />
        <Route path={`${baseURL}contact`} component={Contact} />
        <Route path={`${baseURL}contact.html`} component={Contact} />
        <Route path='*' component={Main} />
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
