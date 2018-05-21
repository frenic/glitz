import { GlitzClient, GlitzServer } from '@glitz/core';
import * as React from 'react';

type Default = {
  glitz: null;
};

export type Context = {
  glitz: GlitzClient | GlitzServer;
};

export const { Provider, Consumer } = React.createContext<Default | Context>({ glitz: null });
