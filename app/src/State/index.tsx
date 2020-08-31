import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import {
  flatObject,
  unflatObject,
  flatToNameValue,
  toHex,
  isInt
} from './helpers'
import TypedInput, { TypeInpudValue } from './TypedInput'
import { JetContext } from '../contexts/Jet'
import { Close } from '../SVG-Icons'

const createInput = (
  onChange: (name: string, value: TypeInpudValue) => void,
  onError: (name: string, hasError: boolean) => void,
  disabled?: boolean
) => (nvp) => {
  switch (typeof nvp.value) {
    case 'string':
    case 'boolean': {
      return (
        <TypedInput
          className="mb-3 row"
          disabled={disabled}
          name={nvp.name}
          value={nvp.value}
          label={nvp.name}
          onChange={onChange}
          key={nvp.name}
          onError={onError}
        />
      )
    }
    case 'number': {
      return (
        <div className="mb-3 row" key={nvp.name}>
          <TypedInput
            className="col-auto"
            disabled={disabled}
            name={nvp.name}
            value={nvp.value}
            label={nvp.name}
            onChange={onChange}
            key={nvp.name + '_dec'}
            onError={onError}
          />
          {isInt(nvp.value) && (
            <div key={nvp.name + '_hex'} className="col form-text">
              <label htmlFor={nvp.name} className="form-label">
                {nvp.name ? 'As HEX' : null}
              </label>
              <input
                className="form-control"
                name={nvp.name}
                id={nvp.name + '_hex'}
                value={toHex(nvp.value)}
                disabled
              />
            </div>
          )}
        </div>
      )
    }
    default:
      return <div>unsported type {typeof nvp.value}</div>
  }
}

interface StateProps {
  path: string
  backUrl: string
  value: any
  fetchOnly?: boolean
}

const State = (props: StateProps): JSX.Element => {
  const [formData, setFormData] = useState(props.value)
  const [formDataBak, setFormDataBak] = useState(props.value)
  const [error, setError] = useState({})
  const [connectionFailure, setConnectionFailure] = useState(false)
  const ctx = useContext(JetContext)

  useEffect(() => {
    setConnectionFailure(!ctx.peer)
  }, [ctx.peer])

  useEffect(() => {
    if (!hasChanges()) {
      setFormData(flatObject(props.value))
      setError({})
    }
    setFormDataBak(flatObject(props.value))
  }, [props.value])

  const hasChanges = () =>
    JSON.stringify(formData) !== JSON.stringify(formDataBak)
  const cancel = () => setFormData(flatObject(unflatObject(formDataBak)))

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // set formDataBak = formData so that hasChanges() => false
    // and UNSAFE_componentWillReceiveProps updates formData and formDataBak
    setFormDataBak(formData)
    if (ctx.peer) {
      ctx.peer.set(props.path, unflatObject(formData))
    }
  }

  const assignToFormData = (name: string, value: any) => {
    setFormData({ ...formData, [name]: value })
  }

  const onError = (name: string, hasError: boolean) => {
    setError({ ...error, [name]: hasError })
  }

  const hasError = () =>
    Object.keys(error).reduce((prev, name) => prev || error[name], false)

  const nvps = flatToNameValue(formData)
  return (
    <div className="card sticky-top bg-light bg-gradient border-info Split-right--show">
      <div className="card-header text-info bg-light bg-gradient">
        <span>{props.path}</span>
        <Link
          to={props.backUrl}
          className="float-right d-lg-none"
          aria-label="Close"
        >
          <Close width={30} height={30} />
        </Link>
      </div>
      <div className="card-body">
        <form onSubmit={onSubmit}>
          {nvps.map(createInput(assignToFormData, onError, props.fetchOnly))}
          <hr />
          <div className="d-flex justify-content-between">
          <button
            className="btn btn-outline-primary"
            type="submit"
            disabled={!(hasChanges() && !hasError())}
          >
            Set
          </button>
          <button
            className="btn btn-outline-secondary"
            type="button"
            disabled={!hasChanges() && !hasError()}
            onClick={cancel}
          >
            Cancel
          </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default State
