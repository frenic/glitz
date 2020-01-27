import { Style } from '@glitz/type';
import { useCallback, useContext, useRef } from 'react';
import { GlitzContext, ThemeContext } from '../components/context';
import { StyledDecorator } from './decorator';

export default function useGlitz(inputStyles?: Style | Style[] | StyledDecorator) {
  const glitz = useContext(GlitzContext);

  if (!glitz) {
    throw new Error(
      "The `<GlitzProvider>` doesn't seem to be used correctly because the core instance couldn't be found",
    );
  }

  const theme = useContext(ThemeContext);

  const hasWarnedCacheInvalidationsRef = useRef(false);
  const totalCacheInvalidationsRef = useRef(0);
  const lastGlitzRef = useRef(glitz);
  const lastThemeRef = useRef(theme);
  const lastFinalStylesRef = useRef<Style[]>([]);
  const lastClassNamesRef = useRef<string>();

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
      return lastClassNamesRef.current || void 0;
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

    return (lastClassNamesRef.current = glitz.injectStyle(finalStyles, theme)) || void 0;
  }, [...finalStyles, glitz, theme]);

  const compose = useCallback(
    (defaults?: Style | Style[] | StyledDecorator): Style[] => styleToArray(defaults, finalStyles),
    finalStyles,
  );

  return [apply, compose] as const;
}

export function styleToArray(...styles: Array<Style | Style[] | StyledDecorator | undefined>): Style[] {
  return ([] as Style[]).concat(...styles.map(style => (typeof style === 'function' ? style() : style || [])));
}

function shallowEquals(a: Style[], b: Style[]) {
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
