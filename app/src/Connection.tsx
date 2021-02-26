import classnames from 'classnames'
import React, { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { JetContext, wsSheme } from './contexts/Jet'
import { isValidWebSocketUrl } from './Connections'
import { Close } from './SVG-Icons'

interface ConnectionProps {
  index: number
}

export const Connection = (props: ConnectionProps): JSX.Element => {
  const ctx = useContext(JetContext)
  const [name, setName] = useState(ctx.connections[props.index].name || '')
  const [url, setUrl] = useState({
    value: ctx.connections[props.index].ws.url || '',
    error: false
  })
  const [user, setUser] = useState(ctx.connections[props.index].user || '')
  const [password, setPassword] = useState(
    ctx.connections[props.index].password || ''
  )
  const [protocol, setProtocol] = useState<wsSheme>(
    ctx.connections[props.index].ws.scheme || 'ws'
  )
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (ctx.connections && ctx.connections[props.index]) {
      const conn = ctx.connections[props.index]
      conn.name && setName(conn.name)
      setUrl({ value: conn.ws.url, error: false })
      conn.user && setUser(conn.user)
      conn.password && setPassword(conn.password)
      setProtocol(conn.ws.scheme)
    }
  }, [ctx.connections[props.index], props.index])

  useEffect(() => {
    if (props.index === ctx.conID) {
      if (ctx.peer) {
        setIsConnected(ctx.peer.connected)
      } else {
        setIsConnected(!!ctx.peer)
      }
    }
  }, [JSON.stringify(ctx.peer)])

  const onProtocol = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    const scheme = ev.currentTarget.value as wsSheme
    setProtocol(scheme)
  }

  const onConnect = (): void => {
    if (url.error) {
      return
    }
    ctx.connect(props.index, protocol, url.value, name, user, password)
  }

  const onDisconnect = () => {
    if (props.index === ctx.conID && ctx.peer) {
      ctx.disConnect(props.index)
    }
  }
  const displayIndex = props.index + 1

  return (
    <div className="Split-right">
      <div className="card sticky-top bg-light bg-gradient Split-right--show">
        <div className="card-header">
          <span>Connection #{displayIndex}</span>
          <Link
            to="/connections/all"
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
                value={name}
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
                    value={protocol}
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
                    placeholder="jetbus.io:11123/api/jet/"
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
                    value={url.value}
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
                  value={user}
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
                  value={password}
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
