import { ReactElement, useContext, createElement, Fragment } from 'react';
import { GlitzServer } from '@glitz/core';
import { GlitzContext, StreamContext } from '../components/context';

export function useStream(node: ReactElement) {
  const stream = useContext(StreamContext);
  const glitz = useContext(GlitzContext);

  if (stream && glitz instanceof GlitzServer) {
    const styles = glitz.getStyleStreamDetails();

    if (styles.length > 0) {
      return createElement(
        Fragment,
        null,
        // tslint:disable-next-line: variable-name
        ...styles.map(([tag, props, __html]) =>
          createElement(tag, {
            ...props,
            dangerouslySetInnerHTML: { __html },
          }),
        ),
        node,
      );
    }
  }

  return node;
}
