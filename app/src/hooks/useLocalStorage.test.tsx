import React from 'react'
import useLocalStorage from './useLocalStorage'
import { render, fireEvent } from '@testing-library/react'

describe('useLocalStorage hook', (): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = ({ lsVal }: { lsVal: any }): JSX.Element => {
    const [test] = useLocalStorage('storageKey', lsVal)

    return <div>{typeof test === 'object' ? JSON.stringify(test) : test}</div>
  }

  it('should return a string', (): void => {
    const testVal = 'TEST'
    const { getByText } = render(<Component lsVal={testVal} />)
    getByText(testVal)

    // cleanup
    localStorage.clear()
  })

  it('should return a parsed JSON-Object', async (): Promise<void> => {
    const testVal = { id: 12345, name: 'BlaBlub' }
    const { getByText } = render(<Component lsVal={testVal} />)
    getByText('{"id":12345,"name":"BlaBlub"}')

    // cleanup
    localStorage.clear()
  })

  it('should return null string on initial null value', async (): Promise<
    void
  > => {
    const testVal = null
    const { getByText } = render(<Component lsVal={testVal} />)
    getByText('null')

    // cleanup
    localStorage.clear()
  })

  it('should log the error when setting an item fails', async (done): Promise<
    void
  > => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).console.log = (): void => {
      done()
    }

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (): string => {
          return 'foo'
        },
        setItem: (): void => {
          throw new Error('oh noe')
        }
      }
    })

    const Component = (): JSX.Element => {
      const [stuff, setStuff] = useLocalStorage('stuff', 'foo')
      return (
        <div>
          {stuff}
          <button onClick={(): void => setStuff('bar')}>click</button>
        </div>
      )
    }
    const { getByText } = render(<Component />)
    getByText('foo')
    fireEvent.click(getByText('click'))
  })
})
