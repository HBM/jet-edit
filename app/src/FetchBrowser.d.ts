/// <reference types="react" />
export declare const matchSearch: (label: string, searchTerm: string) => boolean;
declare type treeItem = {
    path: string;
    label: string;
    value?: number | string;
    fetchOnly?: boolean;
    isOpen: boolean;
    items: treeItems;
};
export declare type treeItems = Array<treeItem>;
export declare const adaptValue: (value: string | number | Record<string, unknown>) => JSX.Element;
export declare const storeFavorites = "favorites";
export declare const FetchBrowser: () => JSX.Element;
export {};
