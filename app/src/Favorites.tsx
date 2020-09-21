import React, { useEffect, useContext, useState, useRef } from 'react'
import jet from 'node-jet'
import useLocalStorage from './hooks/useLocalStorage'
import { storeFavorites } from './FetchBrowser'
import { JetData, JetContext } from './contexts/Jet'
import { Search } from './SVG-Icons'
import { Link, Route } from 'react-router-dom'
import { Details } from './Details'
import { Rowsfetch, TreeFetchItems } from './JetSearch'

const URL = '/favorites'

export const Favorites = (): JSX.Element => {
  const [treeData, setTreeData] = useState<TreeFetchItems>(Object)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const fetcher = useRef<jet.Fetcher>(null)
  const [filterTerm, setSearchTerm] = useState('')
  const [favorites] = useLocalStorage<string[]>(storeFavorites, [])
  const context = useContext(JetContext)
  const fetch = async () => {
    if (context.peer) {
      const peer = context.peer
      setTreeData({})
      if (fetcher.current) {
        peer
          .unfetch(fetcher.current)
          .catch(() => context.connectionFailure(context.conID))
        // delete fetcher.current
      }
      fetcher.current = new jet.Fetcher()
        .path('equalsOneOf', favorites)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .on('data', (data: JetData) => {
          setTreeData((items) => ({
            ...items,
            [data.path]: {
              path: data.path,
              value: data.value,
              fetchOnly: data.fetchOnly
            }
          }))
        })

      peer
        .fetch(fetcher.current, true)
        .catch(() => context.connectionFailure(context.conID))
    }
  }

  useEffect(() => {
    fetch()
    return () => {
      if (context.peer) {
        context.peer.unfetch(fetcher.current)
      }
    }
  }, [context.peer, favorites])

  const onFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.currentTarget.value)
  }

  const renderContent = () => {
    if (Object.keys(treeData).length > 0) {
      return (
        <Rowsfetch
          data={treeData}
          filterTerm={filterTerm}
          urlPart={URL}
          showFavorites={true}
        />
      )
    } else if (favorites.length === 0) {
      return (
        <div className="Info">
          <h3>Your favorites list is empty</h3>
          <span>
            You can add favorites from the <Link to="/search">search</Link>{' '}
            view.
          </span>
        </div>
      )
    } else {
      return (
        <div className="Info">
          <h3>None of your favorites is available</h3>
          <span>There are your favorites:</span>
          <ul>
            {favorites.sort().map((fav) => (
              <li key={fav}>{fav}</li>
            ))}
          </ul>
        </div>
      )
    }
  }

  return (
    <>
      <div className="Split-left">
        {context.peer && context.peer.connected ? (
          <div className="card">
            <h5 className="card-header">Filter</h5>
            <div className="card-body sticky-top bg-white border-bottom d-flex">
              <div className="input-group">
                <span className="input-group-text">
                  <Search />
                </span>
                <input
                  type="search"
                  className="form-control"
                  aria-label="Type and filter"
                  placeholder="Type and filter"
                  onChange={onFilter}
                  value={filterTerm}
                  disabled={favorites.length === 0}
                />
              </div>
            </div>
            {renderContent()}
          </div>
        ) : (
          <div className="alert alert-info">
            <h3>Not connected</h3>
            <span>
              Please setup a{' '}
              <Link to="/connections" replace>
                connection
              </Link>{' '}
              first.
            </span>
          </div>
        )}
      </div>
      <Route
        path={`${URL}:path`}
        render={({ match }) => {
          if (match && match.params.path) {
            const decodePath = decodeURIComponent(match.params.path)
            const pathFound = treeData[decodePath]
            if (pathFound) {
              return (
                <Details
                  jetPath={pathFound.path}
                  value={pathFound.value}
                  fetchOnly={pathFound.fetchOnly}
                  backUrl={URL}
                />
              )
            }
          }
          return null
        }}
      />
    </>
  )
}
