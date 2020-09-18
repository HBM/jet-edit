import { useState, Dispatch, useEffect, useRef } from 'react'

interface CustomEventDetail<S> {
  key: string
  value: S
}

const CUSOTMEVENTKEY = 'hbk-onstore'

const useLocalStorage = <S>(key: string, initialValue: S): [S, Dispatch<S>] => {
  const customEvent = useRef(
    new CustomEvent<CustomEventDetail<S>>(CUSOTMEVENTKEY)
  )
  const [storedValue, setStoredValue] = useState<S>(() => {
    const lsValue = localStorage.getItem(key)
    try {
      return typeof lsValue === 'string' ? JSON.parse(lsValue) : initialValue
    } catch (error) {
      return lsValue
    }
  })

  useEffect(() => {
    const value =
      typeof storedValue === 'string'
        ? storedValue
        : JSON.stringify(storedValue)
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.log(error)
    }
  }, [storedValue])

  const setItem = (value: S) => {
    customEvent.current.initCustomEvent(CUSOTMEVENTKEY, true, false, {
      key,
      value
    } as CustomEventDetail<S>)
    window.dispatchEvent(customEvent.current)
  }

  const onStore = (event: Event) => {
    if (event.type === CUSOTMEVENTKEY) {
      const detail = (event as CustomEvent<CustomEventDetail<S>>).detail
      if (detail && detail.key === key) {
        if (JSON.stringify(setStoredValue) !== JSON.stringify(detail.value)) {
          setStoredValue(detail.value)
        }
      }
    }
  }

  useEffect(() => {
    window.addEventListener('hbk-onstore', onStore as EventListener)
    return () => {
      window.removeEventListener('hbk-onstore', onStore as EventListener)
    }
  }, [])

  return [storedValue, setItem]
}

export default useLocalStorage
