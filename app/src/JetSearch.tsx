import React, { useEffect, useContext, useState, useRef } from 'react'
import jet from 'node-jet'
import classnames from 'classnames'
import useLocalStorage from './hooks/useLocalStorage'
import { storeFavorites, adaptValue, matchSearch } from './FetchBrowser'
import { JetData, JetContext } from './contexts/Jet'
import { Search, Favorite, FavoriteBorder } from './SVG-Icons'
import { Link, NavLink, useLocation, Route } from 'react-router-dom'
import { Details } from './Details'

interface treeFetchItems {
  [key: string]: JetData
}

interface FaviretesRowsProps {
  data: treeFetchItems
  showFavorites: boolean
  filterTerm?: string
}

const SearchRows = (props: FaviretesRowsProps): JSX.Element => {
  const location = useLocation()
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
  return (
    <>
      {Object.values(props.data).map((item) => {
        const isFavorite = favorites.indexOf(item.path) !== -1
        const isMethod = typeof item.value === 'undefined'
        let isVisible =
          !props.filterTerm ||
          (isFilterTerm &&
            (matchSearch(item.path, props.filterTerm) ||
              matchSearch(`${item.value}`, props.filterTerm)))

        if (props.showFavorites) {
          isVisible = isFavorite && isVisible
        }
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
    </>
  )
}

export const JetSearch = (): JSX.Element => {
  const [treeData, setTreeData] = useState<treeFetchItems>(Object)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const fetcher = useRef<jet.Fetcher>(null)
  const [containsAllOf] = useState<string[]>([])
  const [filterTerm, setSearchTerm] = useState('')
  const [showFavorites, setShowFavorites] = useLocalStorage<boolean>(
    'showFavorites',
    false
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
        .path('containsAllOf', containsAllOf)
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
  }, [context.peer, containsAllOf])

  const onFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.currentTarget.value)
  }

  const toggleShowFavorites = () => {
    setShowFavorites(!showFavorites)
  }

  const dataCount = Object.keys(treeData).length
  const renderContent = () => {
    if (dataCount > 0) {
      return (
        <SearchRows
          data={treeData}
          filterTerm={filterTerm}
          showFavorites={showFavorites}
        />
      )
    } else if (containsAllOf.length === 0) {
      return (
        <div className="Info">
          <h3>Your search list is empty</h3>
        </div>
      )
    } else {
      return (
        <div className="Info">
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
            <h5 className="card-header">Filter</h5>
            <div className="card-body sticky-top bg-white border-bottom d-flex">
              <form>
                <Search width={36} height={36} />
                {/* <ChipInput
                  onChange={(chip) => console.log(chip)}
                  placeholder={
                    containsAllOf.length === 0 ? 'Enter path fragments' : ''
                  }
                  value={containsAllOf}
                /> */}
              </form>
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
                  disabled={dataCount === 0}
                />
              </div>
              <button
                className="btn btn-outline-secondary text-nowrap ml-2"
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
        path="/search/:path"
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
                  backUrl="/search"
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
