/// <reference types="react" />
import { JetData } from './contexts/Jet';
export interface TreeFetchItems {
    [key: string]: Omit<JetData, 'event'>;
}
interface FaviretesRowsProps {
    data: TreeFetchItems;
    showFavorites: boolean;
    urlPart: string;
    filterTerm?: string;
}
export declare const Rowsfetch: (props: FaviretesRowsProps) => JSX.Element;
export declare const JetSearch: () => JSX.Element;
export {};
