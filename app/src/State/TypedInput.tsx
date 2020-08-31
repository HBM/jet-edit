import React, { useEffect, useState } from 'react'
import classnames from 'classnames'

export type TypeInpudValue = string | number | boolean

interface TypedInpudProps {
  className: string
  value: TypeInpudValue
  name: string
  label: string
  disabled?: boolean
  onChange: (name: string, value: TypeInpudValue) => void
  onError: (name: string, value: boolean) => void
}

const TypedInput = (props: TypedInpudProps): JSX.Element => {
  const [bak, setBak] = useState(props.value)
  const [value, setValue] = useState(props.value)
  const [type, setType] = useState(typeof props.value)
  const [, setError] = useState(false)

  useEffect(() => {
    if (bak !== props.value) {
      setBak(props.value)
      setValue(props.value)
      setType(typeof props.value)
      setError(false)
    }
  }, [props.value])

  const onChangeNumber = (target) => {
    if (target.value.endsWith('.')) {
      setError(false)
      props.onError(props.name, false)
    }
    const value = parseFloat(target.value)
    if (!isNaN(value) && target.value.match(/^[-+]?[0-9]*\.?[0-9]+$/)) {
      // regex from here: http://www.regular-expressions.info/floatingpoint.html
      setError(false)
      props.onChange(props.name, value)
      props.onError(props.name, false)
    } else {
      setError(true)
      props.onError(props.name, true)
    }
  }

  const onChange = ({ target }) => {
    setValue(target.value)
    switch (type) {
      case 'boolean':
        props.onChange(props.name, target.checked)
        break
      case 'number':
        onChangeNumber(target)
        break
      default:
        props.onChange(props.name, target.value)
    }
  }
  if (type === 'boolean') {
    return (
      <div className={classnames('form-check', props.className)}>
        <label htmlFor={props.name} className="form-label">
          {props.label}
        </label>
        <input
          className="form-check-input"
          type="checkbox"
          id={props.name}
          onChange={onChange}
          checked={props.value as boolean}
        />
      </div>
    )
  } else {
    return (
      <div className={classnames('form-text', props.className)}>
        <label htmlFor={props.name} className="form-label">
          {props.label}
        </label>
        <input
          className="form-control"
          id={props.name}
          type="string"
          value={value as string | number}
          onChange={onChange}
        />
        <div className="invalid-feedback">Not a number</div>
      </div>
    )
  }
}

export default TypedInput
