import { GlitzClient, GlitzServer } from '@glitz/core';
import * as React from 'react';
import { GlitzContext } from './context';

export type PropType = {
  glitz: GlitzClient | GlitzServer;
};

export function GlitzProvider(props: React.PropsWithChildren<PropType>) {
  return React.createElement(GlitzContext.Provider, { value: props.glitz }, props.children);
}
