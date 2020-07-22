import jet from 'node-jet'
import classnames from 'classnames'
import React, { useContext, useEffect, useState } from 'react'
import { JetContext } from './contexts/Jet'
import flatten from 'flat'
import { NavLink } from 'react-router-dom'

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
  parent: string
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
    <ul
      className={classnames('list-group', {
        'pl-4': props.show,
        container: !props.show
      })}
    >
      {treeData.map((item) => {
        const count = item.items.length
        const hasChild = count > 0
        const path = item.path
        const isMethod = !hasChild && typeof item.value === 'undefined'
        return (
          <React.Fragment key={path}>
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
                if (hasChild) {
                  setTreeData((items) => deepShow(items, path))
                }
              }}
            >
              <div className="col-auto" style={{ minWidth: 38 }}>
                {hasChild ? (
                  <span
                    className="badge bg-bg-transparent text-secondary mr-1"
                    style={{ minWidth: 24 }}
                  >
                    {item.isOpen ? '-' : '+'}
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
            {item.isOpen ? (
              <AddListRow
                key={`${path}-${count}`}
                data={item.items}
                show={item.isOpen}
                parent={path}
              />
            ) : null}
          </React.Fragment>
        )
      })}
    </ul>
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

export const FetchBrowser = (): JSX.Element => {
  const [treeData, setTreeData] = useState<treeItems>([])
  const context = useContext(JetContext)
  const fetcher = new jet.Fetcher()
    .path('containsAllOf', [''])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .on('data', (data: { path: string; value: string | number }) => {
      console.log('fetch data')
      setTreeData((items) => {
        return addData([...items], '', data.path.split('/'), data)
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

  return (
    <div className="h-auto">
      <AddListRow data={treeData} parent="" />
    </div>
  )
}

const deepShow = (data: treeItems, itemPath: string) => {
  const findItem = data.find((it) => it.path === itemPath)
  if (findItem) {
    findItem.isOpen = !findItem.isOpen
  } else {
    const parts = itemPath.split('/')
    if (parts.length > 1) {
      for (let index = 0; index < parts.length; index++) {
        const part = parts[index]
        const findItem = data.find((it) => it.path === part)
        if (findItem) {
          findItem.isOpen = !findItem.isOpen
          break
        }
      }
    }
  }
  return data
}
