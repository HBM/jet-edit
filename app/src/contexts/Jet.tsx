import React, { useState, useContext } from 'react'
import jet from 'node-jet'
import { ToastContext } from './Toast'
import useLocalStorage from '../hooks/useLocalStorage'

export interface JetData {
  path: string
  value: string | number
  fetchOnly?: boolean
}

export interface JetPeerInterface {
  close: () => Promise<void>
  call: <T>(path: string, value: T) => Promise<void>
  fetch: (fetcher: object, asNotification: false) => Promise<void>
  set: <T>(path: string, value: T) => Promise<void>
  unfetch: (fetcher: object) => Promise<void>
  connected: boolean
}

export interface InterfaceJetContext {
  connections: jetConnections
  conID: number | -1
  peer: JetPeerInterface | undefined
  connectionRemove: (id: number) => void
  connectionPush: (newConnection: jetConnection) => void
  connectionFailure: (id: number) => void
  connect: (
    id: number,
    protocol: wsSheme,
    url: string,
    name: string,
    user: string,
    password: string
  ) => void
  disConnect: (id: number) => void
}

export const JetContext = React.createContext<InterfaceJetContext>({
  connections: [],
  conID: -1,
  peer: {
    call: (): Promise<void> => Promise.resolve(),
    fetch: (): Promise<void> => Promise.resolve(),
    set: (): Promise<void> => Promise.resolve(),
    unfetch: (): Promise<void> => Promise.resolve(),
    close: (): Promise<void> => Promise.resolve(),
    connected: false
  },
  connectionFailure: (): void => undefined,
  connectionRemove: (): void => undefined,
  connectionPush: (): void => undefined,
  connect: (): void => undefined,
  disConnect: (): void => undefined
})

export type wsSheme = 'ws' | 'wss'

export interface jetConnection {
  name?: string
  ws: {
    scheme: wsSheme
    url: string
  }
  user?: string
  password?: string
}

export type jetConnections = jetConnection[]

// initialize jet connection
// make it a function so it doesn't simply start during tests when we don't need it
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const NewPeer = (conn: jetConnection): any => {
  return new jet.Peer({
    url: `${conn.ws.scheme}://${conn.ws.url}`,
    user: conn.user,
    password: conn.password
  })
}

interface JetProviderProps {
  children: React.ReactNode
}

export const JetProvider = (props: JetProviderProps): JSX.Element => {
  // const [connections, setConnections] = useState<jetConnections>([])
  const [connections, setConnections] = useLocalStorage<jetConnections>(
    'connections',
    []
  )
  const [currConnID, setCurrConnID] = useLocalStorage('connectionID', -1)
  const [peer, setPeer] = useState<JetPeerInterface>()
  const toastCTX = useContext(ToastContext)

  const connect = async (
    id: number,
    protocol: wsSheme,
    url: string,
    name: string,
    user: string,
    password: string
  ): Promise<JetPeerInterface> => {
    if (id < 0) {
      return Promise.reject()
    }

    if (!connections[id]) {
      return Promise.reject()
    }

    const newConnections = [...connections]

    newConnections[id].ws.scheme = protocol
    newConnections[id].ws.url = url
    newConnections[id].name = name
    newConnections[id].user = user
    newConnections[id].password = password
    setConnections(newConnections)
    setCurrConnID(id)
    // we don't have a peer in the props so create a new one and connect
    try {
      const con = newConnections[id]
      const ownPeer = await NewPeer(con)
      await ownPeer.connect()
      return ownPeer
    } catch (_) {
      return Promise.reject()
    }
  }

  const context: InterfaceJetContext = {
    connections: connections,
    conID: currConnID,
    peer: peer,
    connectionFailure: (id): void => {
      const connection = connections[id]
      const url = `${connection.ws.scheme}://${connection.ws.url}`
      toastCTX.show(
        'danger',
        `Connection to '${url}' failed: Error in connection establishment`
      )
    },
    connectionRemove: async (index) => {
      if (currConnID === index) {
        if (peer) {
          await peer.close()
          setPeer(undefined)
        }
        setCurrConnID(-1)
      }
      setConnections(connections.filter((_, i) => index !== i) || [])
    },
    connectionPush: (newConnection) => {
      setConnections([...connections, newConnection])
    },
    connect: (id, protocol, url, name, user, password) => {
      connect(id, protocol, url, name, user, password)
        .then((ownPeer: JetPeerInterface) => {
          setPeer(ownPeer)
          toastCTX.show('success', 'connected')
          console.log('connected')
        })
        .catch(() => {
          setPeer(undefined)
          toastCTX.show('danger', 'Connection failure')
          console.log('connection failure')
        })
    },
    disConnect: async (id) => {
      if (currConnID === id && peer) {
        await peer.close()
        setPeer(undefined)
      }
    }
  }
  return (
    <JetContext.Provider value={context}>{props.children}</JetContext.Provider>
  )
}
