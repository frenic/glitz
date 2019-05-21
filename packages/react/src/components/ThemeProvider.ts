import { Theme } from '@glitz/type';
import * as React from 'react';
import { ThemeContext } from './context';

type PropType = {
  theme: Theme;
};

const Export: React.FunctionComponent<PropType> = function ThemeProvider(props) {
  return React.createElement(ThemeContext.Provider, { value: props.theme }, props.children);
};

export default Export;
