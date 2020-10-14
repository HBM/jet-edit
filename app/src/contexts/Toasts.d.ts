import React from 'react';
declare const MessageType: {
    success: string;
    warning: string;
    danger: string;
    info: string;
};
export declare type ToastTypes = keyof typeof MessageType;
export interface ToastContext {
    show: (type: ToastTypes, text: string) => void;
}
export declare const ToastContext: React.Context<ToastContext>;
interface ToastProviderPropsTypes {
    children: React.ReactNode;
    timeout: number;
}
export declare const ToastProvider: (props: ToastProviderPropsTypes) => JSX.Element;
export {};
