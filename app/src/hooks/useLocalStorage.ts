import { useState, Dispatch, SetStateAction, useEffect } from 'react'

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
    try {
      localStorage.setItem(
        key,
        typeof storedValue === 'string'
          ? storedValue
          : JSON.stringify(storedValue)
      )
    } catch (error) {
      console.log(error)
    }
  }, [storedValue])

  return [storedValue, setStoredValue]
}

export default useLocalStorage
