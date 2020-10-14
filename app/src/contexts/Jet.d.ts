import React from 'react';
export interface JetData {
    path: string;
    value: string | number;
    fetchOnly?: boolean;
    event: 'change' | 'add' | 'remove';
}
export interface JetPeerInterface {
    close: () => Promise<void>;
    call: <T>(path: string, value: T) => Promise<void>;
    fetch: (fetcher: Record<string, unknown>, asNotification?: boolean) => Promise<void>;
    set: <T>(path: string, value: T) => Promise<void>;
    unfetch: (fetcher: Record<string, unknown>) => Promise<void>;
    connected: boolean;
}
export interface InterfaceJetContext {
    connections: jetConnections;
    conID: number | -1;
    peer: JetPeerInterface | undefined;
    connectionRemove: (id: number) => void;
    connectionPush: (newConnection: jetConnection) => void;
    connectionFailure: (id: number) => void;
    connect: (id: number, protocol: wsSheme, url: string, name: string, user: string, password: string) => void;
    disConnect: (id: number) => void;
}
export declare const JetContext: React.Context<InterfaceJetContext>;
export declare type wsSheme = 'ws' | 'wss';
export interface jetConnection {
    name?: string;
    ws: {
        scheme: wsSheme;
        url: string;
    };
    user?: string;
    password?: string;
}
export declare type jetConnections = jetConnection[];
interface JetProviderProps {
    children: React.ReactNode;
}
export declare const JetProvider: (props: JetProviderProps) => JSX.Element;
export {};
