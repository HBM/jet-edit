import React, { useContext } from 'react'
import { Connection } from './Connection'
import {
  useRouteMatch,
  useHistory,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'
import { JetContext } from './contexts/Jet'
import { AddCircle, RemoveCircle } from './SVG-Icons'

export const isValidWebSocketUrl = (urlString: string): boolean => {
  try {
    new URL(urlString)
  } catch {
    return false
  }
  return true
}

const TableRow = (): JSX.Element => {
  const ctx = useContext(JetContext)
  const history = useHistory()
  const match = useRouteMatch<{ id: string }>({
    path: '/connections/:id(\\d+)',
    exact: true
  })

  let selectedIndex = 0
  if (match && match.params) {
    selectedIndex = parseInt(match.params.id) - 1
  }

  return (
    <tbody>
      {ctx.connections.map((item, index) => {
        const displayIndex = index + 1
        const url = `${item.ws.scheme}://${item.ws.url}`
        let status = 'Not configured'
        let isConnected = false
        let connectClassname = 'text-secondary'
        if (isValidWebSocketUrl(url)) {
          connectClassname = 'alert-warning'
          if (ctx.peer && ctx.peer.connected && index === ctx.conID) {
            isConnected = true
            connectClassname = 'alert-success'
          }
          status = isConnected ? 'Connected' : 'Disconnected'
        }
        return (
          <tr
            key={displayIndex}
            className={
              index === selectedIndex
                ? `${connectClassname} table-active`
                : `${connectClassname}`
            }
            onClick={() => {
              history.push(`/connections/${displayIndex}`)
            }}
            style={{ cursor: 'pointer' }}
          >
            <th scope="row">{displayIndex}</th>
            <td>{url}</td>
            <td>{item.name}</td>
            <td>{status}</td>
            <td>
              <button
                type="button"
                className="btn btn-sm float-end"
                title="remove connection"
                onClick={(
                  event: React.MouseEvent<HTMLButtonElement, MouseEvent>
                ) => {
                  event.preventDefault()
                  ctx.connectionRemove(index)
                }}
              >
                <RemoveCircle style={{ fill: 'var(--bs-red)' }} />
              </button>
            </td>
          </tr>
        )
      })}
    </tbody>
  )
}

export const Connections = (): JSX.Element => {
  const ctx = useContext(JetContext)

  const addConnection = () => {
    ctx.connectionPush({
      ws: {
        scheme: 'ws',
        url: ''
      }
    })
  }

  let title = 'No connections configured'

  const connLength = ctx.connections.length
  if (connLength > 0) {
    title = `Connection${connLength > 1 ? 's' : ''} #${connLength}`
  }

  return (
    <>
      <div className="Split-left">
        <div className="card-group">
          <div className="card">
            <div className="card-body sticky-top bg-white">
              <h5 className="d-inline-block">{title}</h5>
              <button
                type="button"
                className="btn btn-sm float-end"
                title="add new connection"
                onClick={addConnection}
              >
                <AddCircle style={{ fill: 'var(--bs-success)' }} />
              </button>
            </div>
            <div className="card-body">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">URL</th>
                    <th scope="col">Name</th>
                    <th scope="col">Status</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <TableRow />
              </table>
            </div>
          </div>
        </div>
      </div>
      <Switch>
        <Route
          path="/connections/:id"
          exact
          render={({ match }) => {
            if (match && match.params.id) {
              const currentID = parseInt(match.params.id) - 1
              if (ctx.connections[currentID]) {
                return <Connection index={currentID} />
              }
            }
            return null
          }}
        />
        <Route
          path="/connections"
          exact
          render={({ match }) => {
            if (match) {
              const lastConId = ctx.conID > -1 ? ctx.conID : 0
              return <Redirect to={`/connections/${lastConId + 1}`} />
            }
            return null
          }}
        />
      </Switch>
    </>
  )
}
