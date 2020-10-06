import React, { useEffect, useContext, useState, useRef } from 'react'
import jet from 'node-jet'
import { storeFavorites, adaptValue, matchSearch } from './FetchBrowser'
import { JetData, JetContext } from './contexts/Jet'
import { Search, Favorite, FavoriteBorder } from './SVG-Icons'
import { Link, NavLink, useLocation, Route } from 'react-router-dom'
import { Details } from './Details'
import { InputTags } from './ui/InputTags'
import useLocalStorage from './hooks/useLocalStorage'
import ReactVisibilitySensor from 'react-visibility-sensor'

export interface TreeFetchItems {
  [key: string]: Omit<JetData, 'event'>
}

interface FaviretesRowsProps {
  data: TreeFetchItems
  showFavorites: boolean
  urlPart: string
  filterTerm?: string
}

const URL = '/search'

export const Rowsfetch = (props: FaviretesRowsProps): JSX.Element => {
  const location = useLocation()
  const [to, setTo] = useState(20)
  const [favorites, setFavorites] = useLocalStorage<string[]>(
    storeFavorites,
    []
  )
  const isFilterTerm = !!props.filterTerm

  const toggleFavorite = (path: string) => {
    if (favorites.indexOf(path) === -1) {
      setFavorites([...favorites, path].sort())
    } else {
      setFavorites(favorites.filter((item) => item !== path))
    }
  }
  useEffect(() => {
    if (props.showFavorites) {
      setTo(Object.values(props.data).length)
    } else {
      setTo(20)
    }
  }, [props.showFavorites, Object.values(props.data).length])

  const values = Object.values(props.data)
  return (
    <>
      {values
        .filter((_, index) => index >= 0 && index < to)
        .map((item) => {
          const isFavorite = favorites.indexOf(item.path) !== -1
          const isMethod = typeof item.value === 'undefined'
          let isVisibleSearchFilter =
            !props.filterTerm ||
            (isFilterTerm &&
              (matchSearch(item.path, props.filterTerm) ||
                matchSearch(`${item.value}`, props.filterTerm)))

          if (props.showFavorites) {
            isVisibleSearchFilter = isFavorite && isVisibleSearchFilter
          }
          return (
            <React.Fragment key={item.path}>
              {isVisibleSearchFilter ? (
                <NavLink
                  to={{
                    pathname: `${props.urlPart}/${encodeURIComponent(
                      item.path
                    )}`
                  }}
                  replace={
                    `${props.urlPart}/${encodeURIComponent(item.path)}` ===
                    location.pathname
                  }
                  role="button"
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <div className="col">
                    <div className="font-weight-bold d-inline">{item.path}</div>
                    <samp
                      className="font-monospace font-weight-lighter text-wrap d-inline"
                      style={{ fontSize: '0.8rem' }}
                    >
                      {item.value && adaptValue(item.value)}
                    </samp>
                  </div>
                  <div className="col-auto">
                    {isMethod ? (
                      <span
                        className="badge bg-warning bg-gradient"
                        style={{ minWidth: 24 }}
                        title="Method"
                      >
                        M
                      </span>
                    ) : (
                      <span
                        className="badge bg-info bg-gradient"
                        style={{ minWidth: 24 }}
                        title="State"
                      >
                        S
                      </span>
                    )}
                    <span
                      className="ml-1"
                      onClick={(
                        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
                      ): void => {
                        event.preventDefault()
                        toggleFavorite(item.path)
                      }}
                    >
                      {isFavorite ? (
                        <Favorite style={{ fill: 'var(--bs-red)' }} />
                      ) : (
                        <FavoriteBorder />
                      )}
                    </span>
                  </div>
                </NavLink>
              ) : null}
            </React.Fragment>
          )
        })}
      <ReactVisibilitySensor
        onChange={(isVisible) => {
          if (isVisible && !props.showFavorites) {
            setTo((to) => to + 5)
          }
        }}
      >
        <div>{values.length > to ? 'Show more...' : ''}</div>
      </ReactVisibilitySensor>
    </>
  )
}

export const JetSearch = (): JSX.Element => {
  const [treeData, setTreeData] = useState<TreeFetchItems>(Object)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const fetcher = useRef<jet.Fetcher>(null)
  const [containsAllOf, setContainsAllOf] = useState<string[]>([])
  const [showFavorites, setShowFavorites] = useLocalStorage<boolean>(
    'showFavorites',
    false
  )
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
        .path('containsAllOf', containsAllOf)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .on('data', (data: JetData) => {
          if (data.event !== 'remove') {
            setTreeData((items) => ({
              ...items,
              [data.path]: {
                path: data.path,
                value: data.value,
                fetchOnly: data.fetchOnly
              }
            }))
          } else {
            setTreeData((items) => {
              const cpItems = { ...items }
              delete cpItems[data.path]
              return cpItems
            })
          }
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
        context.peer
          .unfetch(fetcher.current)
          .catch(() => context.connectionFailure(context.conID))
      }
    }
  }, [context.peer, containsAllOf])

  const toggleShowFavorites = () => {
    setShowFavorites(!showFavorites)
  }

  const dataCount = Object.keys(treeData).length
  const renderContent = () => {
    if (dataCount > 0) {
      if (showFavorites && favorites.length === 0) {
        return (
          <div className="p-3">
            <h3>Your favorites list is empty</h3>
            <span>Click on the heart to deactivate it</span>
            <button
              className="btn btn-outline-secondary text-nowrap ml-2 mb-auto"
              type="button"
              onClick={toggleShowFavorites}
              disabled={dataCount === 0}
              title={showFavorites ? 'Hide Favorites' : 'Show Favorites'}
            >
              {showFavorites ? (
                <Favorite style={{ fill: 'var(--bs-red)' }} />
              ) : (
                <FavoriteBorder />
              )}
            </button>
          </div>
        )
      }

      return (
        <Rowsfetch
          data={treeData}
          showFavorites={showFavorites}
          urlPart={URL}
        />
      )
    } else if (containsAllOf.length === 0) {
      return (
        <div className="p-3">
          <h3>Your search list is empty</h3>
        </div>
      )
    } else {
      return (
        <div className="p-3">
          <h3>None of your search is available</h3>
          <span>There are your search list:</span>
          <ul>
            {containsAllOf.sort().map((fav) => (
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
            <h5 className="card-header">Search</h5>
            <div className="card-body sticky-top bg-white border-bottom d-flex">
              <div className="input-group">
                <InputTags
                  icon={<Search />}
                  iconClear="clear"
                  placeholder={
                    containsAllOf.length === 0 ? 'Enter path fragments' : ''
                  }
                  onChange={(values) => setContainsAllOf(values)}
                  values={containsAllOf}
                />
              </div>
              <button
                className="btn btn-outline-secondary text-nowrap ml-2 mb-auto"
                type="button"
                onClick={toggleShowFavorites}
                disabled={dataCount === 0}
                title={showFavorites ? 'Hide Favorites' : 'Show Favorites'}
              >
                {showFavorites ? (
                  <Favorite style={{ fill: 'var(--bs-red)' }} />
                ) : (
                  <FavoriteBorder />
                )}
              </button>
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
        path={`${URL}/:path`}
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
