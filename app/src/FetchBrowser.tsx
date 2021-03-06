import jet from 'node-jet'
import classnames from 'classnames'
import flatten from 'flat'
import React, { useContext, useEffect, useState } from 'react'
import { NavLink, Route, Link, useLocation } from 'react-router-dom'
import { JetContext, JetData } from './contexts/Jet'
import {
  Search,
  AddCircle,
  RemoveCircle,
  Favorite,
  FavoriteBorder
} from './SVG-Icons'
import { Details } from './Details'
import useLocalStorage from './hooks/useLocalStorage'

const processString = (text: string): string => text.trim().toLowerCase()
export const matchSearch = (label: string, searchTerm: string): boolean => {
  return processString(label).includes(processString(searchTerm))
}

const toggleTreeOpen = (data: treeItems, itemPath: string) => {
  const findItem = data.find((it) => it.path === itemPath)
  if (findItem) {
    findItem.isOpen = !findItem.isOpen
  }
  return data
}

type treeItem = {
  path: string
  label: string
  value?: number | string
  fetchOnly?: boolean
  isOpen: boolean
  items: treeItems
  originalPath: string
}

export type treeItems = Array<treeItem>

interface AddFetchRowProps {
  data: treeItems
  showFavorites: boolean
  show?: boolean
  filterTerm?: string
}

export const adaptValue = (
  value: string | number | Record<string, unknown>
): JSX.Element => {
  let content
  let contentEmpty
  let fields: Array<string> = []
  if (typeof value === 'object') {
    const flat: Record<string, unknown> = flatten(value)
    if (fields.length === 0 && flat) {
      fields = Object.keys(flat).slice(0, 3)
    }
    content = fields.map((field) => {
      return flat && flat[field] !== undefined ? (
        <span className="State-field me-1" key={field}>
          {field}:{JSON.stringify(flat[field])}
        </span>
      ) : null
    })
    contentEmpty = content.find((child) => child !== null) === undefined
  } else {
    content = <span className="State-field">{JSON.stringify(value)}</span>
    contentEmpty = false
  }
  return <div>{contentEmpty ? 'No matching fields' : content}</div>
}

export const storeFavorites = 'favorites'
const FetchRows = (props: AddFetchRowProps): JSX.Element => {
  const [treeData, setTreeData] = useState<treeItems>([])
  const [favorites, setFavorites] = useLocalStorage<string[]>(
    storeFavorites,
    []
  )
  const location = useLocation()

  useEffect(() => {
    setTreeData(props.data)
  }, [props.data])

  const toggleFavorite = (path: string) => {
    if (favorites.indexOf(path) === -1) {
      setFavorites([...favorites, path].sort())
    } else {
      setFavorites(favorites.filter((item) => item !== path))
    }
  }

  return (
    <div
      className={classnames('list-group list-group-flush', {
        'pl-4': props.show
      })}
    >
      {treeData.map((item) => {
        const count = item.items ? item.items.length : 0
        const hasChild = count > 0
        const path = item.path
        const isFavorite = favorites.indexOf(item.path) !== -1
        const isFilterTerm = !!props.filterTerm
        const isOpen = item.isOpen || isFilterTerm || props.showFavorites
        const isValue = typeof item.value !== 'undefined'
        const isStateMethod = path === item.originalPath

        let isVisible =
          !props.filterTerm ||
          (isFilterTerm &&
            (matchSearch(item.label, props.filterTerm) ||
              matchSearch(item.path, props.filterTerm) ||
              matchSearch(`${item.value}`, props.filterTerm)))

        if (props.showFavorites) {
          isVisible = isFavorite && isVisible
        }

        return (
          <React.Fragment key={path}>
            {isVisible ? (
              <NavLink
                to={{ pathname: `/browser/${encodeURIComponent(path)}` }}
                replace={
                  `/browser/${encodeURIComponent(path)}` === location.pathname
                }
                role="button"
                className={classnames(
                  'list-group-item d-flex justify-content-between align-items-center',
                  {
                    'list-group-item-action': hasChild
                  }
                )}
              >
                <div className="col-auto" style={{ minWidth: 38 }}>
                  {hasChild && !isFilterTerm ? (
                    <span
                      className="badge bg-bg-transparent text-secondary me-1"
                      style={{ minWidth: 24 }}
                      onClick={(): void => {
                        setTreeData((items) => toggleTreeOpen(items, path))
                      }}
                    >
                      {item.isOpen ? <RemoveCircle /> : <AddCircle />}
                    </span>
                  ) : null}
                </div>
                <div className="col">
                  <div className="font-weight-bold d-inline">{item.path}</div>
                  <samp
                    className="font-monospace font-weight-lighter text-wrap d-block"
                    style={{ fontSize: '0.8rem' }}
                  >
                    {item.value && adaptValue(item.value)}
                  </samp>
                </div>
                <div className="col-auto">
                  {isStateMethod ? (
                    isValue ? (
                      <span
                        className="badge bg-info bg-gradient"
                        style={{ minWidth: 24 }}
                        title="State"
                      >
                        S
                      </span>
                    ) : (
                      <span
                        className="badge bg-warning bg-gradient"
                        style={{ minWidth: 24 }}
                        title="Method"
                      >
                        M
                      </span>
                    )
                  ) : null}
                  {hasChild ? (
                    <span className="ms-1 badge bg-secondary rounded-pill">
                      {count}
                    </span>
                  ) : null}
                  {hasChild ? null : (
                    <span
                      className="ms-1"
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
                  )}
                </div>
              </NavLink>
            ) : null}
            {isOpen && item.items ? (
              <FetchRows
                key={`${path}-${count}`}
                data={item.items}
                showFavorites={props.showFavorites}
                show={item.isOpen}
                filterTerm={props.filterTerm}
              />
            ) : null}
          </React.Fragment>
        )
      })}
    </div>
  )
}

const removeData = (_last: treeItems, _path: string): boolean => {
  let findRemove = false
  for (let index = 0; index < _last.length; index++) {
    const element = _last[index]
    if (_path === element.path) {
      _last.splice(index, 1)
      return true
    } else if (_path.startsWith(element.path)) {
      findRemove = removeData(element.items, _path)
      if (findRemove) {
        if (element.items.length === 0) {
          _last.splice(index, 1)
        }
        return true
      }
    }
  }
  return false
}

const addData = (
  _last: treeItems,
  _parentPath: string,
  _parts: Array<string>,
  _data: JetData
): treeItems => {
  let currPath = _parentPath
  const depth = _parts.length
  let part = _parts.shift()
  if (part === '') {
    const nextPart = _parts.shift() || ''
    part = `/${nextPart}`
  }
  if (part !== undefined) {
    currPath += `${currPath.length > 0 ? '/' : ''}${part}`
    const iFind = _last.findIndex((item) => item.path === currPath)
    if (iFind !== -1) {
      if (depth === 1) {
        _last[iFind].value = _data.value
      } else {
        addData(_last[iFind].items, currPath, _parts, _data)
      }
    } else {
      if (depth === 1) {
        _last.push({
          path: currPath,
          originalPath: _data.path,
          label: part,
          value: _data.value,
          fetchOnly: _data.fetchOnly,
          isOpen: false,
          items: []
        })
      } else {
        _last.push({
          path: currPath,
          originalPath: _data.path,
          label: part,
          value: currPath === _data.path ? _data.value : undefined,
          fetchOnly: _data.fetchOnly,
          isOpen: false,
          items: []
        })
        addData(_last[_last.length - 1].items, currPath, _parts, _data)
      }
    }
  }
  return _last
}

const findPath = (path: string, treeData: treeItems): treeItem | null => {
  const findItem = treeData.find((item) => item.path === path)
  if (findItem && path === findItem.originalPath) {
    return findItem
  }
  for (let index = 0; index < treeData.length; index++) {
    const element = treeData[index]
    const find = findPath(path, element.items)
    if (find) {
      return find
    }
  }
  return null
}

export const FetchBrowser = (): JSX.Element => {
  const [treeData, setTreeData] = useState<treeItems>([])
  const [filterTerm, setSearchTerm] = useState('')
  const [showFavorites, setShowFavorites] = useLocalStorage<boolean>(
    'showFavorites',
    false
  )
  const context = useContext(JetContext)
  const fetcher = new jet.Fetcher()
    .path('containsAllOf', [''])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .on('data', (data: JetData) => {
      if (data.event !== 'remove') {
        setTreeData((items) => {
          const updateData = addData(items, '', data.path.split('/'), data)
          return [...updateData]
        })
      } else {
        setTreeData((items) => {
          removeData(items, data.path)
          return [...items]
        })
      }
    })

  useEffect(() => {
    if (context.peer) {
      context.peer
        .fetch(fetcher, true)
        .catch(() => context.connectionFailure(context.conID))
    }
    return () => {
      if (context.peer) {
        context.peer
          .unfetch(fetcher)
          .catch(() => context.connectionFailure(context.conID))
      }
    }
  }, [context.peer])

  const onFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.currentTarget.value)
  }

  const toggleShowFavorites = () => {
    setShowFavorites(!showFavorites)
  }

  const renderContent = () => {
    if (treeData.length > 0) {
      return (
        <FetchRows
          data={treeData}
          filterTerm={filterTerm}
          showFavorites={showFavorites}
        />
      )
    } else {
      return (
        <div className="p-3">
          <h3>No data available</h3>
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
                  disabled={treeData.length === 0}
                />
              </div>
              <button
                className="btn btn-outline-secondary text-nowrap ms-2"
                type="button"
                onClick={toggleShowFavorites}
                disabled={treeData.length === 0}
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
        path="/browser/:path"
        render={({ match }) => {
          if (match && match.params.path) {
            const stateOrMethod = findPath(
              decodeURIComponent(match.params.path),
              treeData
            )
            if (stateOrMethod) {
              return (
                <Details
                  jetPath={stateOrMethod.path}
                  value={stateOrMethod.value}
                  fetchOnly={stateOrMethod.fetchOnly}
                  backUrl="/browser"
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
