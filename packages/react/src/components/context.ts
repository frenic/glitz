import GlitzClient from '@glitz/core';
import GlitzServer from '@glitz/core/server';
import * as React from 'react';

type Default = {
  glitz: null;
};

export type Context = {
  glitz: GlitzClient | GlitzServer;
};

export const { Provider, Consumer } = React.createContext<Default | Context>({ glitz: null });
