import { Style } from '@glitz/type';
import { useCallback, ReactElement } from 'react';
import { flattenStyle } from '../styled/use-glitz';
import { useAbsorb } from '../styled/compose';
import { StyledDecorator } from '../styled/decorator';

type PropType = {
  children(compose: (additional?: Style | StyledDecorator) => Style[]): ReactElement;
};

export function StyleAbsorber(props: PropType) {
  return useAbsorb(styles => props.children(useCallback(additional => flattenStyle([additional, styles]), [])));
}
