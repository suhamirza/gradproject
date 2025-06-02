/// <reference types="vite/client" />

// Add React 19 JSX support
declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
  export default any;
}

declare module 'react' {
  export function useState<T>(initialState: T | (() => T)): [T, (value: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useRef<T>(initialValue: T): { current: T };
  export function useContext<T>(context: any): T;
  export function createContext<T>(defaultValue: T): any;
  export const Fragment: any;
  
  const React: any;
  export default React;
}

// Add React 19 hooks modules
declare module 'react/useState' {
  const useState: <T>(initialState: T) => [T, (value: T | ((prevState: T) => T)) => void];
  export default useState;
}

// Add JSX namespace with IntrinsicElements
declare namespace JSX {
  interface IntrinsicElements {
    // HTML elements
    div: any;
    header: any;
    nav: any;
    a: any;
    button: any;
    span: any;
    section: any;
    h1: any;
    h2: any;
    h3: any;
    p: any;
    img: any;
    footer: any;
    ul: any;
    li: any;
    svg: any;
    path: any;
    // Add any other HTML elements you need
    [elemName: string]: any; // This allows for any HTML element
  }
}
