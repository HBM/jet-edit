import React from 'react'
import Method from './Method'
import State from './State'

interface DetailsProps {
  jetPath: string
  value?: string | number
  fetchOnly?: boolean
  backUrl: string
}

export const Details = ({
  jetPath,
  value,
  fetchOnly,
  backUrl
}: DetailsProps): JSX.Element => (
  <div className="Split-right">
    {typeof value === 'undefined' ? (
      <Method path={jetPath} backUrl={backUrl} />
    ) : (
      <State
        path={jetPath}
        value={value}
        fetchOnly={fetchOnly}
        backUrl={backUrl}
      />
    )}
  </div>
)
