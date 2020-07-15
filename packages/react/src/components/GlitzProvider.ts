import { GlitzClient, GlitzServer } from '@glitz/core';
import { PropsWithChildren, createElement } from 'react';
import { GlitzContext } from './context';

export type PropType = {
  glitz: GlitzClient | GlitzServer;
};

export function GlitzProvider(props: PropsWithChildren<PropType>) {
  return createElement(GlitzContext.Provider, { value: props.glitz }, props.children);
}
