import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { Header } from './Header'
import { Connections } from './Connections'
import { JetProvider } from './contexts/Jet'
import { ToastProvider } from './contexts/Toast'

const Index = (): JSX.Element => {
  return (
    <>
      <Header />
      <div className="main" role="main">
        <Switch>
          <Route exact path="/" component={Connections} />
          <Route path="/connections" component={Connections} />
        </Switch>
      </div>
    </>
  )
}

const App = (): JSX.Element => (
  <ToastProvider timeout={5000}>
    <JetProvider>
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    </JetProvider>
  </ToastProvider>
)

export default App
