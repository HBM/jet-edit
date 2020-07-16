import React, { useContext } from 'react'
import { Connection } from './Connection'
import {
  Switch,
  Route,
  Redirect,
  useRouteMatch,
  useHistory
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
    path: '/connections/:id',
    exact: true
  })

  let selectedIndex = 0
  if (match && match.params) {
    selectedIndex = parseInt(match.params.id) - 1
  }

  return (
    <tbody>
      {ctx.connections.map((item, index) => {
        const newID = index + 1
        const url = `${item.ws.scheme}://${item.ws.url}`
        let status = 'Not configured'
        let isConnected = false
        let connectClassname = 'text-secondary'
        if (isValidWebSocketUrl(url)) {
          connectClassname = 'alert-warning'
          if (ctx.peer && ctx.peer.connected) {
            isConnected = true
            connectClassname = 'alert-success'
          }
          status = isConnected ? 'Connected' : 'Disconnected'
        }
        return (
          <tr
            key={newID}
            className={
              index === selectedIndex
                ? `${connectClassname} table-active`
                : `${connectClassname}`
            }
            onClick={() => {
              history.push(`/connections/${newID}`)
            }}
            style={{ cursor: 'pointer' }}
          >
            <th scope="row">{newID}</th>
            <td>{url}</td>
            <td>{item.name}</td>
            <td>{status}</td>
            <td>
              <button
                type="button"
                className="btn btn-sm float-right"
                title="remove connection"
                onClick={() => {
                  ctx.connectionRemove(newID - 1)
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
            <div className="card-header">
              <div className="d-inline-block">{title}</div>{' '}
              <button
                type="button"
                className="btn btn-sm float-right"
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
      <div className="Split-right">
        <Switch>
          <Route path="/connections/:id" exact strict>
            <Connection />
          </Route>
          {connLength > 0 ? (
            <Route path="/connections" exact strict>
              <Redirect push to="connections/1" />
            </Route>
          ) : null}
        </Switch>
      </div>
    </>
  )
}
