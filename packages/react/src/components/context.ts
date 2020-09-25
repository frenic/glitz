import { GlitzClient, GlitzServer } from '@glitz/core';
import { Theme } from '@glitz/type';
import * as React from 'react';

export const GlitzContext = React.createContext<GlitzClient | GlitzServer | undefined>(undefined);

export const ThemeContext = React.createContext<Theme | undefined>(undefined);
