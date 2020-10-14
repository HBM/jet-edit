/// <reference types="react" />
export declare type TypeInpudValue = string | number | boolean;
interface TypedInpudProps {
    className: string;
    value: TypeInpudValue;
    name: string;
    label: string;
    disabled?: boolean;
    onChange: (name: string, value: TypeInpudValue) => void;
    onError: (name: string, value: boolean) => void;
}
declare const TypedInput: (props: TypedInpudProps) => JSX.Element;
export default TypedInput;
