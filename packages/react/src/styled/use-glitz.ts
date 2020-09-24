import { Style } from '@glitz/type';
import { useContext, useRef, useEffect } from 'react';
import { GlitzContext } from '../components/context';
import useTheme from './use-theme';

export type DirtyStyle = Style | DirtyStyle[] | undefined;

export default function useGlitz(dirtyStyle: DirtyStyle) {
  const glitz = useContext(GlitzContext);

  if (!glitz) {
    throw new Error(
      "The `<GlitzProvider>` doesn't seem to be used correctly because the core instance couldn't be found",
    );
  }

  const theme = useTheme();

  const lastGlitzRef = useRef(glitz);
  const lastThemeRef = useRef(theme);
  const lastDirtyStylesRef = useRef<DirtyStyle>(dirtyStyle);
  const lastFinalStylesRef = useRef<Style[]>();
  const lastClassNamesRef = useRef<string>();
  const isCached = lastGlitzRef.current === glitz && lastThemeRef.current === theme && !!lastClassNamesRef.current;

  let isValid = isCached && lastDirtyStylesRef.current === dirtyStyle;
  let finalStyles: Style[];

  if (!isValid) {
    finalStyles = flattenStyle([dirtyStyle]);

    if (lastFinalStylesRef.current) {
      isValid = isCached && shallowEquals(lastFinalStylesRef.current, finalStyles);
    }

    lastFinalStylesRef.current = finalStyles;
  }

  lastGlitzRef.current = glitz;
  lastThemeRef.current = theme;
  lastDirtyStylesRef.current = dirtyStyle;

  if (process.env.NODE_ENV !== 'production') {
    const hasWarnedCacheInvalidationsRef = useRef(false);
    const totalCacheInvalidationsRef = useRef(0);

    useEffect(() => {
      if (!isValid && typeof requestAnimationFrame === 'function' && !hasWarnedCacheInvalidationsRef.current) {
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

  if (isValid) {
    return lastClassNamesRef.current || void 0;
  }

  if (finalStyles!.length === 0) {
    return void 0;
  }

  return (lastClassNamesRef.current = glitz.injectStyle(finalStyles!, theme)) || void 0;
}

export function flattenStyle(dirtyStyles: DirtyStyle[]): Style[] {
  const styles: Style[] = [];

  for (const style of dirtyStyles) {
    if (!style) {
      continue;
    }
    if (Array.isArray(style)) {
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
