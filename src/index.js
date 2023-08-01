import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { createBrowserHistory } from 'history';

import ScrollToTop from './pages/components/ScrollToTop';
import configureStore from './library/redux/store';
import { unregister } from './library/registerServiceWorker';
import { initFocusState } from './library/registerFocus';

import App from './pages/App';

const history = createBrowserHistory();
const store = configureStore({

}, history);

render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <ScrollToTop>
        <App />
      </ScrollToTop>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);
unregister();
initFocusState();
