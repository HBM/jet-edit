import classnames from 'classnames'
import React, { useState, useContext, useEffect } from 'react'
import { JetContext } from './contexts/Jet'
import { Close } from './SVG-Icons'
import { Link } from 'react-router-dom'

interface MethodProps {
  backUrl: string
  path: string
}

const Method = (props: MethodProps): JSX.Element => {
  const [args, setArgs] = useState<string>('')
  const [connectionFailure, setConnectionFailure] = useState(false)
  const ctx = useContext(JetContext)

  useEffect(() => {
    setConnectionFailure(!ctx.peer)
  }, [ctx.peer])

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (ctx.peer) {
      ctx.peer.call(props.path, `[${args}]`)
    }
  }

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setArgs(event.target.value)
  }

  const isValid = () => {
    try {
      const parseArgs = JSON.parse(`[${args}]`)
      return Array.isArray(parseArgs)
    } catch (_) {
      return false
    }
  }

  return (
    <div className="card sticky-top bg-light bg-gradient border-warning Split-right--show">
      <div className="card-header text-warning bg-dark bg-gradient">
        <span>{props.path}</span>
        <Link
          to={props.backUrl}
          className="float-end d-lg-none"
          aria-label="Close"
        >
          <Close style={{ fill: 'white' }} width={30} height={30} />
        </Link>
      </div>
      <div className="card-body">
        <form
          onSubmit={onSubmit}
          className={classnames({ 'is-invalid': !isValid() })}
        >
          <label htmlFor="inputArguments" className="form-label">
            Arguments
          </label>
          <div className="input-group mb-2">
            <span className="input-group-text">[</span>
            <input
              type="text"
              className="form-control"
              placeholder="Arguments1, Arguments1, ..."
              aria-label="Call arguments"
              aria-describedby="button-arguments"
              id="inputArguments"
              onChange={onChange}
              value={args}
              disabled={connectionFailure}
            />
            <span className="input-group-text">]</span>
            <button
              className="btn btn-outline-secondary"
              type="submit"
              id="button-arguments"
              disabled={connectionFailure || !isValid()}
            >
              Call
            </button>
            <div className="invalid-feedback">Not a JSON Array.</div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Method
