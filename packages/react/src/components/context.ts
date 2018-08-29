import { GlitzClient, GlitzServer } from '@glitz/core';
import { Theme } from '@glitz/type';
import * as React from 'react';

type GlitzDefault = {
  glitz: null;
};

export type GlitzContext = {
  glitz: GlitzClient | GlitzServer;
};

export const { Provider: GlitzContextProvider, Consumer: GlitzContextConsumer } = React.createContext<
  GlitzDefault | GlitzContext
>({ glitz: null });

type ThemeDefault = {
  theme: undefined;
};

export type ThemeContext = {
  theme: Theme;
};

export const { Provider: ThemeContextProvider, Consumer: ThemeContextConsumer } = React.createContext<
  ThemeDefault | ThemeContext
>({ theme: undefined });
