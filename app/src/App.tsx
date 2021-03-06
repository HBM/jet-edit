import React from 'react'
import { Switch, Route, Redirect, HashRouter } from 'react-router-dom'
import { Header } from './Header'
import { JetProvider } from './contexts/Jet'
import { ToastProvider } from './contexts/Toasts'
import { Connections } from './Connections'
import { FetchBrowser } from './FetchBrowser'
import { JetSearch } from './JetSearch'

declare let __WEBPACK_HASH__: string
declare let __WEBPACK_PACKAGEJSON_VERSION: string

const Index = (): JSX.Element => {
  document.title = `jet-edit[v${__WEBPACK_PACKAGEJSON_VERSION}/#${__WEBPACK_HASH__}]`
  return (
    <>
      <Header />
      <div className="main" role="main">
        <Switch>
          <Redirect exact from="/" to="/connections" />
          <Route path="/connections" component={Connections} />
          <Route path="/browser" component={FetchBrowser} />
          <Route path="/search" component={JetSearch} />
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </div>
    </>
  )
}

const App = (): JSX.Element => (
  <ToastProvider timeout={8000}>
    <JetProvider>
      <HashRouter>
        <Index />
      </HashRouter>
    </JetProvider>
  </ToastProvider>
)

export default App
