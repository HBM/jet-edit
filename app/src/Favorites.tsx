import React, { useEffect, useContext, useState, useRef } from 'react'
import jet from 'node-jet'
import classnames from 'classnames'
import useLocalStorage from './hooks/useLocalStorage'
import { storeFavorites, adaptValue, matchSearch } from './FetchBrowser'
import { JetData, JetContext } from './contexts/Jet'
import { Search, Favorite } from './SVG-Icons'
import { Link, NavLink, useLocation, Route } from 'react-router-dom'
import { Details } from './Details'

interface treeFetchItems {
  [key: string]: JetData
}

interface FaviretesRowsProps {
  toggleFavorite: (path: string) => void
  favorites: string[]
  data: treeFetchItems
  filterTerm?: string
}

const FavoritesRows = (props: FaviretesRowsProps): JSX.Element => {
  const location = useLocation()
  const isSearch = !!props.filterTerm

  return (
    <>
      {Object.values(props.data).map((item) => {
        const isMethod = typeof item.value === 'undefined'
        const isVisible =
          !props.filterTerm ||
          (isSearch &&
            (matchSearch(item.path, props.filterTerm) ||
              matchSearch(`${item.value}`, props.filterTerm)))
        return (
          <React.Fragment key={item.path}>
            {isVisible ? (
              <NavLink
                to={{ pathname: `/favorites/${encodeURIComponent(item.path)}` }}
                replace={
                  `/favorites/${encodeURIComponent(item.path)}` ===
                  location.pathname
                }
                role="button"
                className={classnames(
                  'list-group-item d-flex justify-content-between align-items-center'
                )}
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
                      props.toggleFavorite(item.path)
                    }}
                  >
                    <Favorite style={{ fill: 'var(--bs-red)' }} />
                  </span>
                </div>
              </NavLink>
            ) : null}
          </React.Fragment>
        )
      })}
    </>
  )
}

export const Favorites = (): JSX.Element => {
  const [treeData, setTreeData] = useState<treeFetchItems>(Object)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const fetcher = useRef<jet.Fetcher>(null)
  const [filterTerm, setSearchTerm] = useState('')
  const [favorites, setFavorites] = useLocalStorage<string[]>(
    storeFavorites,
    []
  )
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

  const toggleFavorite = (path: string) => {
    if (favorites.indexOf(path) === -1) {
      setFavorites([...favorites, path].sort())
    } else {
      setFavorites(favorites.filter((item) => item !== path))
    }
  }

  const onFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.currentTarget.value)
  }

  const renderContent = () => {
    if (Object.keys(treeData).length > 0) {
      return (
        <FavoritesRows
          data={treeData}
          filterTerm={filterTerm}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
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
        path="/favorites/:path"
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
                  backUrl="/favorites"
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
