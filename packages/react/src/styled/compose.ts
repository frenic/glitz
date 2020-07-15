import { createContext, useContext, createElement, ReactNode, useMemo, ReactElement } from 'react';
import { DirtyStyle } from './use-glitz';

const ComposeContext = createContext<DirtyStyle[] | undefined>(void 0);

const empty = { value: void 0 };

export function useAbsorb(factory: (dynamics: DirtyStyle[] | undefined) => ReactElement) {
  const dynamics = useContext(ComposeContext);
  return createElement(ComposeContext.Provider, empty, factory(dynamics));
}

export function useForward(statics: DirtyStyle, dynamic: DirtyStyle, children: ReactNode): ReactElement {
  const dynamics = useContext(ComposeContext);
  const context = useMemo(() => ({ value: [statics, ...(dynamics ?? []), dynamic] }), [statics, dynamics, dynamic]);
  return createElement(ComposeContext.Provider, context, children);
}
