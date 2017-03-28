/* eslint-disable class-methods-use-this */
// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Map as ImmutableMap } from 'immutable';
import NotificationSystem from 'react-notification-system';

// import all the css
import 'normalize.css/normalize.css';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/dialog/dialog.css';
import 'nteract-assets/fonts/source-sans-pro/source-sans-pro.css';
import 'nteract-assets/fonts/source-code-pro/source-code-pro.css';
import 'nteract-assets/fonts/octicons/octicons.css';

// once we bring theme support to the JS side, these will all go away
import '../assets/styles/main.css';
import '../assets/styles/theme-christmas.css';
import '../assets/styles/theme-classic.css';
import '../assets/styles/theme-dark.css';
import '../assets/styles/theme-halloween.css';
import '../assets/styles/theme-light.css';
import '../assets/styles/theme-nteract.css';
import '../assets/styles/theme-undefined.css';

import configureStore from './store';
import { reducers } from './reducers';
import Notebook from './components/notebook';

import {
  setNotificationSystem,
} from './actions';

import { initMenuHandlers } from './menu';
import { initNativeHandlers } from './native-window';
import { initGlobalHandlers } from './global-events';

import {
  AppRecord,
  DocumentRecord,
  MetadataRecord,
  CommsRecord,
} from './records';

const store = configureStore({
  app: AppRecord(),
  metadata: MetadataRecord(),
  document: DocumentRecord(),
  comms: CommsRecord(),
  config: ImmutableMap({
    theme: 'light',
  }),
}, reducers);

// Register for debugging
window.store = store;

initNativeHandlers(store);
initMenuHandlers(store);
initGlobalHandlers(store);

class App extends React.PureComponent {
  props: Object;
  state: Object;
  notificationSystem: NotificationSystem;

  componentDidMount(): void {
    store.dispatch(setNotificationSystem(this.notificationSystem));

    this.initializeMathJax();
  }

  initializeMathJax(): void {
    window.MathJax.Hub.Config({
      jax: ['input/TeX', 'output/SVG'],
      extensions: ['tex2jax.js'],
      messageStyle: 'none',
      showMathMenu: false,
      tex2jax: {
        inlineMath: [
          ['$', '$'],
          ['\\(', '\\)']
        ],
        displayMath: [
          ['$$', '$$'],
          ['\\[', '\\]']
        ],
        processEscapes: true,
        processEnvironments: true,
        preview: 'none'
      },
      TeX: {
        extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js']
      },
      SVG: {
        font: 'STIX-Web'
      }
    });
    window.MathJax.Hub.Configured();
  }

  render(): ?React.Element<any> { // eslint-disable-line class-methods-use-this
    return (
      <Provider store={store}>
        <div>
          <Notebook />
          <NotificationSystem
            ref={(notificationSystem) => { this.notificationSystem = notificationSystem; }}
          />
        </div>
      </Provider>
    );
  }
}

ReactDOM.render(
  <App />,
  document.querySelector('#app')
);
