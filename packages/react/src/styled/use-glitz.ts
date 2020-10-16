import { Style } from '@glitz/type';
import { useContext, useRef, useEffect } from 'react';
import { GlitzContext } from '../components/context';
import { StyledDecorator } from './decorator';
import useTheme from './use-theme';

export type DirtyStyle = Style | readonly DirtyStyle[] | StyledDecorator | false | undefined;

export default function useGlitz(dirtyStyle: DirtyStyle) {
  const glitz = useContext(GlitzContext);

  if (!glitz) {
    throw new Error(
      "The `<GlitzProvider>` doesn't seem to be used correctly because the core instance wasn't provided",
    );
  }

  const theme = useTheme();

  const previousRef = useRef<[typeof glitz, typeof theme, typeof dirtyStyle?, (readonly Style[])?, string?]>([
    glitz,
    theme,
  ]);

  const isCached = previousRef.current[0] === glitz && previousRef.current[1] === theme;
  let isValid = isCached && previousRef.current[2] === dirtyStyle;

  previousRef.current[0] = glitz;
  previousRef.current[1] = theme;
  previousRef.current[2] = dirtyStyle;

  let finalStyles: readonly Style[];

  if (!isValid) {
    finalStyles = sanitizeStyle(dirtyStyle);

    if (previousRef.current[3]) {
      isValid = isCached && shallowEquals(previousRef.current[3], finalStyles);
    }

    previousRef.current[3] = finalStyles;
  }

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
    return previousRef.current[4];
  }

  if (finalStyles!.length === 0) {
    return void 0;
  }

  return (previousRef.current[4] = glitz.injectStyle(finalStyles!, theme)) || void 0;
}

export function sanitizeStyle(dirtyStyle: DirtyStyle): readonly Style[] {
  if (typeof dirtyStyle === 'function') {
    return dirtyStyle();
  }

  // TODO: Remove hack in TS4.1 (https://github.com/microsoft/TypeScript/pull/39258)
  if ((Array.isArray as (arg: any) => arg is readonly any[])(dirtyStyle)) {
    return flattenStyle(dirtyStyle);
  }

  if (dirtyStyle) {
    return [dirtyStyle];
  }

  return [];
}

function flattenStyle(dirtyStyles: readonly DirtyStyle[]): readonly Style[] {
  const styles: Style[] = [];

  for (const style of dirtyStyles) {
    styles.push(...sanitizeStyle(style));
  }

  return styles;
}

function shallowEquals(a: readonly Style[], b: readonly Style[]) {
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
