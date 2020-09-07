import { createContext } from 'react';
import { GlitzClient, GlitzServer } from '@glitz/core';
import { Theme } from '@glitz/type';

export const GlitzContext = createContext<GlitzClient | GlitzServer | undefined>(void 0);

export const StreamContext = createContext<boolean>(false);

export const ThemeContext = createContext<Theme | undefined>(void 0);
