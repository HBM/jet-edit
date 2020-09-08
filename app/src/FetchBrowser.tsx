import jet from 'node-jet'
import classnames from 'classnames'
import flatten from 'flat'
import React, { useContext, useEffect, useState } from 'react'
import { NavLink, Route, Link } from 'react-router-dom'
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
const matchSearch = (label: string, searchTerm: string): boolean => {
  return processString(label).includes(processString(searchTerm))
}

const toggleTreeOpen = (data: treeItems, itemPath: string) => {
  const findItem = data.find((it) => it.path === itemPath)
  if (findItem) {
    findItem.isOpen = !findItem.isOpen
  }
  return data
}

export type treeItem = {
  path: string
  label: string
  value?: number | string
  fetchOnly?: boolean
  isOpen: boolean
  items: treeItems
}

export type treeItems = Array<treeItem>

interface AddListRowProps {
  data: treeItems
  showFavorites: boolean
  show?: boolean
  searchTerm?: string
}

const adaptValue = (
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
        <span className="State-field mr-1" key={field}>
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

const storeFavorites = 'favorites'
const AddListRow = (props: AddListRowProps): JSX.Element => {
  const [treeData, setTreeData] = useState<treeItems>([])
  const [favorites, setFavorites] = useLocalStorage<string[]>(
    storeFavorites,
    []
  )

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
        const count = item.items.length
        const hasChild = count > 0
        const path = item.path
        const isFavorite = favorites.indexOf(item.path) !== -1
        const isSearch = !!props.searchTerm
        const isOpen = item.isOpen || isSearch || props.showFavorites
        const isMethod = !hasChild && typeof item.value === 'undefined'
        let isVisible =
          !props.searchTerm ||
          (isSearch && matchSearch(item.label, props.searchTerm))

        if (props.showFavorites) {
          isVisible = isFavorite && isVisible
        }

        return (
          <React.Fragment key={path}>
            {isVisible ? (
              <NavLink
                to={{ pathname: `/browser/${encodeURIComponent(path)}` }}
                role="button"
                className={classnames(
                  'list-group-item d-flex justify-content-between align-items-center',
                  {
                    'list-group-item-action': hasChild
                  }
                )}
                onClick={() => {
                  if (hasChild && !isSearch) {
                    setTreeData((items) => toggleTreeOpen(items, path))
                  }
                }}
              >
                <div className="col-auto" style={{ minWidth: 38 }}>
                  {hasChild && !isSearch ? (
                    <span
                      className="badge bg-bg-transparent text-secondary mr-1"
                      style={{ minWidth: 24 }}
                    >
                      {item.isOpen ? <RemoveCircle /> : <AddCircle />}
                    </span>
                  ) : null}
                </div>
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
                  {hasChild ? (
                    <span className="badge bg-secondary rounded-pill">
                      {count}
                    </span>
                  ) : isMethod ? (
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
                  {hasChild ? null : (
                    <a
                      className="ml-1"
                      onClick={() => toggleFavorite(item.path)}
                    >
                      {isFavorite ? <Favorite /> : <FavoriteBorder />}
                    </a>
                  )}
                </div>
              </NavLink>
            ) : null}
            {isOpen ? (
              <AddListRow
                key={`${path}-${count}`}
                data={item.items}
                showFavorites={props.showFavorites}
                show={item.isOpen}
                searchTerm={props.searchTerm}
              />
            ) : null}
          </React.Fragment>
        )
      })}
    </div>
  )
}

const addData = (
  _last: treeItems,
  _parentPath: string,
  _parts: Array<string>,
  _data: JetData
): treeItems => {
  let currPath = _parentPath
  const depth = _parts.length
  const part = _parts.shift() || ''
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
        label: part,
        value: _data.value,
        fetchOnly: _data.fetchOnly,
        isOpen: false,
        items: []
      })
    } else {
      _last.push({
        path: currPath,
        label: part,
        fetchOnly: _data.fetchOnly,
        isOpen: false,
        items: []
      })
      addData(_last[_last.length - 1].items, currPath, _parts, _data)
    }
  }
  return _last
}

const findPath = (
  path: string,
  index: number,
  treeData: treeItems
): treeItem | null => {
  const parts = path.split('/')
  const it = parts.filter((_, i) => i <= index)
  const findItem = treeData.find((item) => item.path === it.join('/'))
  if (findItem && path === findItem.path && findItem.items.length === 0) {
    return findItem
  }
  if (findItem) {
    return findPath(path, index + 1, findItem.items)
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
      setTreeData((items) => {
        const updateData = addData(items, '', data.path.split('/'), data)
        return [...updateData]
      })
    })

  useEffect(() => {
    if (context.peer) {
      context.peer
        .fetch(fetcher, true)
        .catch(() => context.connectionFailure(context.conID))
    }
    return () => {
      if (context.peer) {
        context.peer.unfetch(fetcher)
      }
    }
  }, [context.peer])

  const onFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.currentTarget.value)
  }

  const toggleShowFavorites = () => {
    setShowFavorites(!showFavorites)
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
                />
              </div>
              <button
                className="btn btn-outline-secondary text-nowrap ml-2"
                type="button"
                onClick={toggleShowFavorites}
                title={showFavorites ? 'Hide Favorites' : 'Show Favorites'}
              >
                {showFavorites ? <Favorite /> : <FavoriteBorder />}
              </button>
            </div>
            <AddListRow
              data={treeData}
              searchTerm={filterTerm}
              showFavorites={showFavorites}
            />
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
        children={({ match }) => {
          if (match && match.params.path) {
            const stateOrMethod = findPath(
              decodeURIComponent(match.params.path),
              0,
              treeData
            )
            if (stateOrMethod) {
              return (
                <>
                  <Details stateOrMethod={stateOrMethod} backUrl="/browser" />
                </>
              )
            }
          }
          return <></>
        }}
      />
    </>
  )
}
