import { Style } from '@glitz/type';
import { useContext, createElement, PropsWithChildren } from 'react';
import { StyledElementFunctions } from '../styled/types';
import { ElementPreStyle, StyleContext } from './context';

type PreStyleKeys = keyof StyledElementFunctions | 'universal';

export type PreStyleProps = { [tag in PreStyleKeys]?: Style };

type StyleProviderProps = PreStyleProps & { include?: PreStyleProps };

export function StyleProvider({ children, include, ...restProps }: PropsWithChildren<StyleProviderProps>) {
  const pre: ElementPreStyle = useContext(StyleContext) ?? {};

  for (const map of [include, restProps]) {
    if (map) {
      let tag: PreStyleKeys;
      for (tag in map) {
        pre[tag] = tag in pre ? [...pre[tag], map[tag]!] : [map[tag]!];
      }
    }
  }

  return createElement(StyleContext.Provider, { value: pre }, children);
}
