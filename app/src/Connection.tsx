import classnames from 'classnames'
import React, { useContext, useState, useEffect } from 'react'
import { useRouteMatch, Link } from 'react-router-dom'
import { JetContext, wsSheme } from './contexts/Jet'
import { isValidWebSocketUrl } from './Connections'
import { Close } from './SVG-Icons'

export const Connection = (): JSX.Element => {
  const [name, setName] = useState('')
  const [url, setUrl] = useState({ value: '', error: false })
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [protocol, setProtocol] = useState<wsSheme>('ws')
  const [isConnected, setIsConnected] = useState(false)
  const match = useRouteMatch<{ id: string }>({
    path: '/connections/:id',
    exact: true
  })
  let id = -1
  if (match && match.path && match.params.id) {
    id = !isNaN(parseInt(match.params.id)) ? parseInt(match.params.id) - 1 : -1
  }
  const ctx = useContext(JetContext)

  useEffect(() => {
    if (match && ctx.connections && ctx.connections[id]) {
      const conn = ctx.connections[id]
      conn.name && setName(conn.name)
      setUrl({ value: conn.ws.url, error: false })
      conn.user && setUser(conn.user)
      conn.password && setPassword(conn.password)
      setProtocol(conn.ws.scheme)
    }
  }, [ctx.connections, id])

  useEffect(() => {
    if (id === ctx.conID) {
      if (ctx.peer) {
        setIsConnected(ctx.peer.connected)
      } else {
        setIsConnected(!!ctx.peer)
      }
    }
  }, [JSON.stringify(ctx.peer)])

  const onProtocol = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    setProtocol(ev.currentTarget.value as wsSheme)
  }

  const onConnect = (): void => {
    if (url.error) {
      return
    }
    ctx.connect(id, protocol, url.value, name, user, password)
  }

  const onDisconnect = () => {
    if (id === ctx.conID && ctx.peer) {
      ctx.disConnect(id)
    }
  }

  if (match && ctx.connections && ctx.connections[id]) {
    return (
      <div className="Split-right">
        <div className="card sticky-top bg-light bg-gradient Split-right--show">
          <div className="card-header">
            <span>Connection #{id + 1}</span>
            <Link
              to="/connections"
              className="float-right d-lg-none"
              aria-label="Close"
            >
              <Close width={30} height={30} />
            </Link>
          </div>
          <div className="card-body">
            <form
              onSubmit={(ev: React.FormEvent<HTMLFormElement>): void => {
                ev.preventDefault()
              }}
              noValidate
            >
              <div className="mb-3">
                <label htmlFor="inputName" className="form-label">
                  Name
                </label>
                <input
                  name="name"
                  type="text"
                  className="form-control"
                  id="inputName"
                  aria-describedby="Name"
                  placeholder="Name"
                  onChange={(ev) => {
                    setName(ev.currentTarget.value)
                  }}
                  defaultValue={name}
                  disabled={isConnected}
                />
              </div>
              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="inputWsUrl" className="form-label">
                    WebSocket URL
                  </label>
                  <div
                    className={classnames('input-group', {
                      'is-invalid': url.error
                    })}
                  >
                    <label htmlFor="selectWsWss" className="input-group-text">
                      Protocol
                    </label>
                    <select
                      name="protocol"
                      className="form-select"
                      onChange={onProtocol}
                      defaultValue={protocol}
                      disabled={isConnected}
                    >
                      <option value="ws">ws</option>
                      <option value="wss">wss</option>
                    </select>
                    <input
                      name="url"
                      type="text"
                      className="form-control w-50"
                      id="inputWsUrl"
                      aria-describedby="WebsocketURL"
                      placeholder="jetbus.io:8080"
                      onChange={(ev) => {
                        const value = ev.currentTarget.value
                        const error = !isValidWebSocketUrl(
                          `${protocol}://${value}`
                        )
                        setUrl({
                          value,
                          error
                        })
                      }}
                      defaultValue={url.value}
                      required
                      disabled={isConnected}
                    />
                  </div>
                  <div className="invalid-feedback">Invalid WebSocket URL</div>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col">
                  <label htmlFor="inputUser" className="form-label">
                    User (optional)
                  </label>
                  <input
                    name="user"
                    type="text"
                    className="form-control"
                    id="inputUser"
                    aria-describedby="User"
                    placeholder="admin"
                    onChange={(ev) => {
                      setUser(ev.currentTarget.value)
                    }}
                    defaultValue={user}
                    disabled={isConnected}
                  />
                </div>
                <div className="col">
                  <label htmlFor="inputPW" className="form-label">
                    Password (optional)
                  </label>
                  <input
                    name="password"
                    type="password"
                    className="form-control"
                    id="inputPW"
                    aria-describedby="Password"
                    onChange={(ev) => {
                      setPassword(ev.currentTarget.value)
                    }}
                    defaultValue={password}
                    disabled={isConnected}
                  />
                </div>
              </div>
              {isConnected ? (
                <button
                  className="btn btn-warning float-right"
                  onClick={onDisconnect}
                >
                  Disconnect
                </button>
              ) : (
                <button
                  className="btn btn-primary float-right"
                  disabled={url.error}
                  onClick={onConnect}
                >
                  Connect
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    )
  }
  return <></>
}
