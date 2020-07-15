import { Theme } from '@glitz/type';
import { PropsWithChildren, createElement } from 'react';
import { ThemeContext } from './context';

type PropType = {
  theme: Theme;
};

export function ThemeProvider(props: PropsWithChildren<PropType>) {
  return createElement(ThemeContext.Provider, { value: props.theme }, props.children);
}
