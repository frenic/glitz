import { createContext, useContext, createElement, ReactNode, useMemo, ReactElement } from 'react';
import { DirtyStyle } from './use-glitz';

const ComposeContext = createContext<DirtyStyle[] | undefined>(void 0);

const empty = { value: void 0 };

export function useAbsorb(factory: (dynamics: DirtyStyle[] | undefined) => ReactElement) {
  const absorbed = useContext(ComposeContext);
  return createElement(ComposeContext.Provider, empty, factory(absorbed));
}

export function useForward(statics: DirtyStyle, dynamic: DirtyStyle, children: ReactNode): ReactElement {
  const forwarded = useContext(ComposeContext);
  const context = useMemo(() => ({ value: [statics, forwarded, dynamic] }), [statics, forwarded, dynamic]);
  return createElement(ComposeContext.Provider, context, children);
}
