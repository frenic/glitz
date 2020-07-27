import { Style } from '@glitz/type';
import { useContext, useRef, useEffect } from 'react';
import { GlitzContext, ThemeContext } from '../components/context';
import { StyledDecorator } from './decorator';

export type DirtyStyle = Style | StyledDecorator | DirtyStyle[] | undefined;

export default function useGlitz(dirtyStyle: DirtyStyle) {
  const glitz = useContext(GlitzContext);

  if (!glitz) {
    throw new Error(
      "The `<GlitzProvider>` doesn't seem to be used correctly because the core instance couldn't be found",
    );
  }

  const theme = useContext(ThemeContext);

  const finalStyles = flattenStyle([dirtyStyle]);
  const lastGlitzRef = useRef(glitz);
  const lastThemeRef = useRef(theme);
  const lastFinalStylesRef = useRef<Style[]>(finalStyles);
  const lastClassNamesRef = useRef<string>();
  const isValid =
    lastGlitzRef.current === glitz &&
    lastThemeRef.current === theme &&
    shallowEquals(lastFinalStylesRef.current, finalStyles) &&
    typeof lastClassNamesRef.current === 'string';

  if (process.env.NODE_ENV !== 'production') {
    const hasWarnedCacheInvalidationsRef = useRef(false);
    const totalCacheInvalidationsRef = useRef(0);

    useEffect(() => {
      if (
        finalStyles.length > 0 &&
        !isValid &&
        typeof requestAnimationFrame === 'function' &&
        !hasWarnedCacheInvalidationsRef.current
      ) {
        totalCacheInvalidationsRef.current++;
        const currentCacheInvalidations = totalCacheInvalidationsRef.current;

        // Jump two frames to reset counter if there hasn't been any more renders with cache invalidation
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (totalCacheInvalidationsRef.current === currentCacheInvalidations) {
              if (currentCacheInvalidations > 5) {
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
    });
  }

  if (finalStyles.length === 0) {
    return void 0;
  }

  if (isValid) {
    return lastClassNamesRef.current || void 0;
  }

  lastGlitzRef.current = glitz;
  lastThemeRef.current = theme;
  lastFinalStylesRef.current = finalStyles;

  return (lastClassNamesRef.current = glitz.injectStyle(finalStyles, theme)) || void 0;
}

export function flattenStyle(dirtyStyles: DirtyStyle[]): Style[] {
  const styles: Style[] = [];

  for (const style of dirtyStyles) {
    if (!style) {
      continue;
    }
    if (typeof style === 'function') {
      styles.push(...style());
    } else if (Array.isArray(style)) {
      styles.push(...flattenStyle(style));
    } else {
      styles.push(style);
    }
  }

  return styles;
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
