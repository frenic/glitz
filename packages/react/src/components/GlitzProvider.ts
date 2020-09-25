import { GlitzClient, GlitzServer } from '@glitz/core';
import * as React from 'react';
import { GlitzContext } from './context';

export type PropType = {
  glitz: GlitzClient | GlitzServer;
};

const Export: React.FunctionComponent<PropType> = function GlitzProvider(props) {
  return React.createElement(GlitzContext.Provider, { value: props.glitz }, props.children);
};

export default Export;
