import React from 'react'
import { useParams } from 'react-router-dom'
import { treeItem } from './FetchBrowser'
import Method from './Method'
import State from './State'

interface DetailsProps {
  stateOrMethod: treeItem
  backUrl: string
}

export const Details = ({
  stateOrMethod,
  backUrl
}: DetailsProps): JSX.Element => {
  const { path } = useParams<{ path: string }>()

  if (decodeURIComponent(path) !== stateOrMethod.path) {
    return <></>
  }
  return (
    <div className="Split-right">
      {typeof stateOrMethod.value === 'undefined' ? (
        <Method path={stateOrMethod.path} backUrl={backUrl} />
      ) : (
        <State
          path={stateOrMethod.path}
          value={stateOrMethod.value}
          backUrl={backUrl}
        />
      )}
    </div>
  )
}
