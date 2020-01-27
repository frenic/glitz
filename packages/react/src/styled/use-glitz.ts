import { GlitzClient, GlitzServer } from '@glitz/core';
import { StyleArray, StyleOrStyleArray, Theme } from '@glitz/type';
import { useCallback, useContext, useRef } from 'react';
import { GlitzContext, ThemeContext } from '../components/context';
import { StyledDecorator } from './decorator';

export default function useGlitz(inputStyles?: StyleOrStyleArray | StyledDecorator) {
  const glitz = useContext(GlitzContext);

  if (!glitz) {
    throw new Error(
      "The `<GlitzProvider>` doesn't seem to be used correctly because the core instance couldn't be found",
    );
  }

  const theme = useContext(ThemeContext);

  const hasWarnedCacheInvalidationsRef = useRef<boolean>(false);
  const totalCacheInvalidationsRef = useRef<number>(0);
  const lastGlitzRef = useRef<GlitzClient | GlitzServer>(glitz);
  const lastThemeRef = useRef<Theme | undefined>(theme);
  const lastFinalStylesRef = useRef<StyleArray>([]);
  const lastClassNamesRef = useRef<string | null>(null);

  const finalStyles = styleToArray(inputStyles);

  const apply = useCallback(() => {
    if (!finalStyles) {
      return;
    }

    if (
      lastGlitzRef.current === glitz &&
      lastThemeRef.current === theme &&
      shallowEquals(lastFinalStylesRef.current, finalStyles) &&
      typeof lastClassNamesRef.current === 'string'
    ) {
      return lastClassNamesRef.current;
    }

    if (process.env.NODE_ENV !== 'production') {
      if (typeof requestAnimationFrame === 'function' && !hasWarnedCacheInvalidationsRef.current) {
        totalCacheInvalidationsRef.current++;
        const currentCacheInvalidations = totalCacheInvalidationsRef.current;

        // Jump two frames to reset counter if there hasn't been any more renders with cache invalidation
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (totalCacheInvalidationsRef.current === currentCacheInvalidations) {
              if (currentCacheInvalidations > 3) {
                console.warn(
                  "Multiple re-renders of a styled component with invalidated cache was detected. Either make sure it doesn't re-render or make sure the cache is intact. More info: https://git.io/fxYyd",
                );

                hasWarnedCacheInvalidationsRef.current = true;
              }

              totalCacheInvalidationsRef.current = 0;
            }
          });
        });
      }
    }

    lastGlitzRef.current = glitz;
    lastThemeRef.current = theme;
    lastFinalStylesRef.current = finalStyles;

    return (lastClassNamesRef.current = glitz.injectStyle(finalStyles, theme));
  }, [...finalStyles, glitz, theme]);

  const compose = useCallback(
    (defaults?: StyleOrStyleArray | StyledDecorator): StyleArray => styleToArray(defaults, finalStyles),
    finalStyles,
  );

  return [apply, compose] as const;
}

export function styleToArray(...styles: Array<StyleOrStyleArray | StyledDecorator | undefined>): StyleArray {
  return ([] as StyleArray).concat(...styles.map(style => (typeof style === 'function' ? style() : style || [])));
}

function shallowEquals(a: StyleArray, b: StyleArray) {
  if (a.length !== b.length) {
    return false;
  }

  for (const i in a) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}
