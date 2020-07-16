import React, { useState } from 'react'
import { Toast } from 'react-bootstrap'

const MessageType = {
  success: 'Success',
  warning: 'warning',
  danger: 'Error',
  info: 'Info'
}

export type ToastTypes = 'success' | 'warning' | 'danger' | 'info'

export interface ToastContext {
  show: (type: ToastTypes, text: string) => void
}

export const ToastContext = React.createContext<ToastContext>({
  show: (): void => undefined
})

interface ToastProviderPropsTypes {
  children: React.ReactNode
  timeout: number
}

export const ToastProvider = (props: ToastProviderPropsTypes): JSX.Element => {
  const [items, setItems] = useState<Array<{ text: string; type: ToastTypes }>>(
    []
  )

  const context = {
    show: (type: ToastTypes, value: string): void => {
      setItems((it) => [{ text: value, type }, ...it])
    }
  }
  console.log('render', items)
  return (
    <ToastContext.Provider value={context}>
      {props.children}
      {items.length > 0 ? (
        <div
          style={{
            position: 'fixed',
            minHeight: 200,
            right: 20,
            top: 20,
            zIndex: 1060
          }}
        >
          {items.map((it, index) => (
            <Toast
              key={index}
              onClose={() =>
                setItems((it) => {
                  const newItems = it.slice()
                  newItems.pop()
                  return newItems
                })
              }
              delay={props.timeout}
              autohide
            >
              <Toast.Header>
                <strong className={`mr-auto text-${it.type}`}>
                  {MessageType[it.type]}
                </strong>
                <small>{Date.now()}</small>
              </Toast.Header>
              <Toast.Body>{it.text}</Toast.Body>
            </Toast>
          ))}
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}
