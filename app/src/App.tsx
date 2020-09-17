import React from 'react'
import { Switch, Route, Redirect, HashRouter } from 'react-router-dom'
import { Header } from './Header'
import { JetProvider } from './contexts/Jet'
import { ToastProvider } from './contexts/Toast'
import { Connections } from './Connections'
import { FetchBrowser } from './FetchBrowser'
import { Favorites } from './Favorites'
// import { JetSearch } from './JetSearch'

const Index = (): JSX.Element => {
  return (
    <>
      <Header />
      <div className="main" role="main">
        <Switch>
          <Redirect exact from="/" to="/connections" />
          <Route path="/connections" component={Connections} />
          <Route path="/browser" component={FetchBrowser} />
          {/* <Route path="/search" component={JetSearch} /> */}
          <Route path="/favorites" component={Favorites} />
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
