import jet from 'node-jet'
import classnames from 'classnames'
import React, { useContext, useEffect, useState } from 'react'
import { JetContext } from './contexts/Jet'
import flatten from 'flat'
import { NavLink } from 'react-router-dom'
import { Search, AddCircle, RemoveCircle } from './SVG-Icons'

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

type treeItem = {
  path: string
  label: string
  value?: number | string
  isOpen: boolean
  items: treeItems
}

type treeItems = Array<treeItem>

interface AddListRowProps {
  data: treeItems
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

const AddListRow = (props: AddListRowProps): JSX.Element => {
  const [treeData, setTreeData] = useState<treeItems>([])

  useEffect(() => {
    setTreeData(props.data)
  }, [props.data])

  return (
    <div
      className={classnames('list-group', {
        'pl-4': props.show
      })}
    >
      {treeData.map((item) => {
        const count = item.items.length
        const hasChild = count > 0
        const path = item.path
        const isSearch = !!props.searchTerm
        const isOpen = item.isOpen || isSearch
        const isMethod = !hasChild && typeof item.value === 'undefined'
        const isVisible =
          !props.searchTerm ||
          (isSearch && matchSearch(item.label, props.searchTerm))
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
                  <span
                    className="text-muted font-monospace font-weight-lighter text-truncate d-inline"
                    style={{ fontSize: '0.8rem' }}
                  >
                    {item.value && adaptValue(item.value)}
                  </span>
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
                </div>
              </NavLink>
            ) : null}
            {isOpen ? (
              <AddListRow
                key={`${path}-${count}`}
                data={item.items}
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
  _data: { path: string; value: string | number }
): treeItems => {
  let currPath = _parentPath
  const depth = _parts.length
  const part = _parts.shift()
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
        isOpen: false,
        items: []
      })
    } else {
      _last.push({
        path: currPath,
        label: part,
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
): boolean => {
  const parts = path.split('/')
  const it = parts.filter((_, i) => i <= index)
  const findItem = treeData.find((item) => item.path === it.join('/'))
  if (findItem && path === findItem.path && findItem.items.length === 0) {
    console.log(path, findItem.path)
    return true
  }
  if (findItem) {
    return findPath(path, index + 1, findItem.items)
  }
  return false
}

export const FetchBrowser = (): JSX.Element => {
  const [treeData, setTreeData] = useState<treeItems>([])
  const [searchTerm, setSearchTerm] = useState('')
  const context = useContext(JetContext)
  const fetcher = new jet.Fetcher()
    .path('containsAllOf', [''])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .on('data', (data: { path: string; value: string | number }) => {
      setTreeData((items) => {
        return addData(items, '', data.path.split('/'), data)
      })
    })

  useEffect(() => {
    if (context.peer) {
      context.peer
        .fetch(fetcher)
        .catch(() => context.connectionFailure(context.conID))
    }
    return () => {
      if (context.peer) {
        context.peer.unfetch(fetcher)
      }
    }
  }, [context.peer])

  const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.currentTarget.value)
  }

  return (
    <>
      <div className="Split-left">
        <div className="input-group mb-3">
          <span className="input-group-text">
            <Search />
          </span>
          <input
            type="search"
            className="form-control"
            aria-label="Type and search"
            placeholder="Type and search"
            onChange={onSearch}
            value={searchTerm}
          />
        </div>
        <AddListRow data={treeData} searchTerm={searchTerm} />
      </div>
      {/* <Route
        path="/browser/:path"
        children={({ match }) => {
          if (
            match &&
            match.params.path &&
            findPath(decodeURIComponent(match.params.path), 0, treeData)
          ) {
            return <div className="Split-right">{match.params.path}</div>
          }
          return <></>
        }}
      /> */}
    </>
  )
}
