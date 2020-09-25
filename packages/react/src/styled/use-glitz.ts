import { Style, StyleArray, StyleOrStyleArray } from '@glitz/type';
import { useContext, useRef } from 'react';
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

  const finalStyles = styleToArray(inputStyles);
  const hasWarnedCacheInvalidationsRef = useRef(false);
  const totalCacheInvalidationsRef = useRef(0);
  const lastGlitzRef = useRef(glitz);
  const lastThemeRef = useRef(theme);
  const lastFinalStylesRef = useRef<Style[]>(finalStyles);
  const lastClassNamesRef = useRef<string>();

  const applyRef = useRef<() => string | undefined>();

  const isValidGlitz = lastGlitzRef.current === glitz;
  const isValidTheme = lastThemeRef.current === theme;
  const isValidStyle = shallowEquals(lastFinalStylesRef.current, finalStyles);

  lastGlitzRef.current = glitz;
  lastThemeRef.current = theme;
  lastFinalStylesRef.current = finalStyles;

  if (!applyRef.current || !isValidGlitz || !isValidTheme || !isValidStyle) {
    applyRef.current = () => {
      if (!finalStyles) {
        return;
      }

      if (isValidGlitz && isValidTheme && isValidStyle && typeof lastClassNamesRef.current === 'string') {
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

      return (lastClassNamesRef.current = glitz.injectStyle(finalStyles, theme)) || void 0;
    };
  }

  const composeRef = useRef<(defaults?: Style | Style[] | StyledDecorator) => Style[]>();

  if (!composeRef.current || !isValidStyle) {
    composeRef.current = (defaults?: Style | Style[] | StyledDecorator): Style[] => styleToArray(defaults, finalStyles);
  }

  return [applyRef.current, composeRef.current] as const;
}

export function styleToArray(...dirtyStyles: Array<Style | Style[] | StyledDecorator | undefined>): Style[] {
  const styles: Style[] = [];

  for (let style of dirtyStyles) {
    if (!style) {
      continue;
    }
    if (typeof style === 'function') {
      style = style();
    }
    if (Array.isArray(style)) {
      for (const entry of style) {
        styles.push(entry);
      }
    } else {
      styles.push(style);
    }
  }

  return styles;
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
