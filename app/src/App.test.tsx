import React from 'react'
import { render } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('should show device information', (): void => {
    const { getByText } = render(<App />)
    getByText('Welcome to jet-edit with Typescript')
  })
})
