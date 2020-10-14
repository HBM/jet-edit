/// <reference types="react" />
interface DetailsProps {
    jetPath: string;
    value?: string | number;
    fetchOnly?: boolean;
    backUrl: string;
}
export declare const Details: ({ jetPath, value, fetchOnly, backUrl }: DetailsProps) => JSX.Element;
export {};
