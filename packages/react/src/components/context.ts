import { createContext } from 'react';
import { GlitzClient, GlitzServer } from '@glitz/core';
import { Style, Theme } from '@glitz/type';

export const GlitzContext = createContext<GlitzClient | GlitzServer | undefined>(void 0);

export const ThemeContext = createContext<Theme | undefined>(void 0);

export type ElementPreStyle = { [tag: string]: Style[] };
export const StyleContext = createContext<ElementPreStyle | undefined>(void 0);
