import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { Header } from './Header'
import { JetProvider } from './contexts/Jet'
import { ToastProvider } from './contexts/Toast'
import { Connections } from './Connections'
import { Search } from './Search'

const Index = (): JSX.Element => {
  return (
    <>
      <Header />
      <div className="main" role="main">
        <Switch>
          <Route exact path="/" component={Connections} />
          <Route path="/connections" component={Connections} />
          <Route path="/search" component={Search} />
        </Switch>
      </div>
    </>
  )
}

const App = (): JSX.Element => (
  <ToastProvider timeout={8000}>
    <JetProvider>
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    </JetProvider>
  </ToastProvider>
)

export default App
