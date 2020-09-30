import { Style } from '@glitz/type';
import { useCallback, ReactElement } from 'react';
import { flattenStyle } from '../styled/use-glitz';
import { useAbsorb } from '../styled/compose';
import { Styles } from '../styled/custom';

type PropType = {
  children(compose: (additional?: Styles) => readonly Style[]): ReactElement;
};

export function StyleAbsorber(props: PropType) {
  return useAbsorb(styles => props.children(useCallback(additional => flattenStyle([additional, styles]), [])));
}
