/// <reference types="react" />
interface StateProps {
    path: string;
    backUrl: string;
    value: any;
    fetchOnly?: boolean;
}
declare const State: (props: StateProps) => JSX.Element;
export default State;
