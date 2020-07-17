import React, { useState } from 'react'
import { Toast } from 'react-bootstrap'

const MessageType = {
  success: 'Success',
  warning: 'warning',
  danger: 'Error',
  info: 'Info'
}

export type ToastTypes = keyof typeof MessageType

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
  const [toastItems, setToastItems] = useState<
    Array<{ id: number; text: string; type: ToastTypes }>
  >([])

  const context = {
    show: (type: ToastTypes, message: string): void =>
      setToastItems((it) => [
        { id: performance.now(), text: message, type },
        ...it
      ])
  }
  return (
    <ToastContext.Provider value={context}>
      {props.children}
      {toastItems.length > 0 ? (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 20,
            transform: 'translate(-50%, 0%)',
            zIndex: 1060
          }}
        >
          {toastItems.map((it) => (
            <Toast
              key={it.id}
              onClose={() =>
                setToastItems((parts) =>
                  parts.filter((partItem) => partItem.id !== it.id)
                )
              }
              delay={props.timeout}
              autohide
            >
              <Toast.Header>
                <strong className={`mr-auto text-${it.type}`}>
                  {MessageType[it.type]}
                </strong>
              </Toast.Header>
              <Toast.Body>{it.text}</Toast.Body>
            </Toast>
          ))}
        </div>
      ) : null}
    </ToastContext.Provider>
  )
}
