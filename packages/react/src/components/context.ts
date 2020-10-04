import { createContext } from 'react';
import type { GlitzClient, GlitzServer } from '@glitz/core';
import type { Theme } from '@glitz/type';
import { DirtyStyle } from '../styled/use-glitz';

export const GlitzContext = createContext<GlitzClient | GlitzServer | undefined>(void 0);

export const StreamContext = createContext<boolean>(false);

export const ThemeContext = createContext<Theme | undefined>(void 0);

export const ComposeContext = createContext<readonly DirtyStyle[] | undefined>(void 0);
export const emptyComposeContext = { value: void 0 };
