import { useState, Dispatch, SetStateAction, useEffect } from 'react'

interface CustomEventDetail<S> {
  key: string
  value: S
}

const useLocalStorage = <S>(
  key: string,
  initialValue: S
): [S, Dispatch<SetStateAction<S>>] => {
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

  const setItem = <S>(value: S) => {
    window.dispatchEvent(
      new CustomEvent<CustomEventDetail<S>>('hbk-onstore', {
        detail: { key, value: value }
      })
    )
  }

  const onStore = (event: CustomEventInit<CustomEventDetail<S>>) => {
    if (event.type === 'hbk-onstore') {
      if (event.detail && event.detail.key === key) {
        if (
          JSON.stringify(setStoredValue) !== JSON.stringify(event.detail.value)
        ) {
          setStoredValue(event.detail.value)
        }
      }
    }
  }

  useEffect(() => {
    window.addEventListener('hbk-onstore', onStore)
    return () => {
      window.removeEventListener('hbk-onstore', onStore)
    }
  }, [])

  return [storedValue, setItem]
}

export default useLocalStorage
