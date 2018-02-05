import 'babel-polyfill'
import 'whatwg-fetch'
import Raven from 'raven-js'
import { initProviders } from 'actions/providers'
import Decimal from 'decimal.js'
import React from 'react'
import { ConnectedRouter } from 'react-router-redux'

import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { AppContainer } from 'react-hot-loader'
import 'less/style.less'
import AppRouter from 'routes'
import initGoogleAnalytics from 'utils/analytics/init'
import BackdropProvider from 'containers/BackdropProvider'
import store, { history } from 'store'
import { setMomentRelativeTime } from './setup'

setMomentRelativeTime()

// load data from localstorage
store.dispatch({ type: 'INIT' })
store.dispatch(initProviders())

Decimal.set({ toExpPos: 9999, precision: 50 })

initGoogleAnalytics()

/* global document */
const rootElement = document.getElementById('root')

const render = (App) => {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <BackdropProvider>
            <App />
          </BackdropProvider>
        </ConnectedRouter>
      </Provider>
    </AppContainer>,
    rootElement,
  )
}

Raven.context(() => render(AppRouter))

if (module.hot) {
  module.hot.accept('./routes', () => Raven.context(() => render(require('./routes').default)))
}
