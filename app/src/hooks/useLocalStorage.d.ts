import { Dispatch } from 'react';
declare const useLocalStorage: <S>(key: string, initialValue: S) => [S, Dispatch<S>];
export default useLocalStorage;
