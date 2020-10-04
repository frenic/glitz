import type { GlitzClient, GlitzServer } from '@glitz/core';
import { PropsWithChildren, createElement } from 'react';
import { GlitzContext, StreamContext } from './context';

export type PropType = {
  glitz: GlitzClient | GlitzServer;
  stream?: boolean;
};

export function GlitzProvider(props: PropsWithChildren<PropType>) {
  return createElement(
    GlitzContext.Provider,
    { value: props.glitz },
    createElement(StreamContext.Provider, { value: !!props.stream }, props.children),
  );
}
