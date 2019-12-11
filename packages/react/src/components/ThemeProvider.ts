import { Theme } from '@glitz/type';
import * as React from 'react';
import { ThemeContext } from './context';

type PropType = {
  theme: Theme;
};

export function ThemeProvider(props: React.PropsWithChildren<PropType>) {
  return React.createElement(ThemeContext.Provider, { value: props.theme }, props.children);
}
