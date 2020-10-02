import { Style } from '@glitz/type';
import { useCallback, ReactElement, useContext, createElement } from 'react';
import { pureStyle } from '../styled/use-glitz';
import { Styles } from '../styled/custom';
import { ComposeContext, emptyComposeContext } from './context';

type PropType = {
  children(compose: (additional?: Styles) => readonly Style[]): ReactElement;
};

export function StyleAbsorber(props: PropType) {
  const composed = useContext(ComposeContext);

  let node = props.children(useCallback(additional => pureStyle([additional, composed]), [composed]));

  if (composed) {
    // Reset ComposeContext
    node = createElement(ComposeContext.Provider, emptyComposeContext, node);
  }

  return node;
}
