import { ReactElement, useContext, createElement, Fragment } from 'react';
import { GlitzServer } from '@glitz/core';
import { GlitzContext, StreamContext } from '../components/context';

export function useStream(node: ReactElement) {
  const stream = useContext(StreamContext);
  const glitz = useContext(GlitzContext);

  if (stream && glitz instanceof GlitzServer) {
    const style = glitz.getStyleStream();

    if (style) {
      // tslint:disable-next-line: variable-name
      const [tag, props, __html] = style;
      return createElement(
        Fragment,
        null,
        createElement(tag, {
          ...props,
          dangerouslySetInnerHTML: { __html },
        }),
        node,
      );
    }
  }

  return node;
}
