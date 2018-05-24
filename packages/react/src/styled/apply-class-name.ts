import { APPLY_CLASS_NAME_PROPERTY } from './create';
import { StyledElementProps } from './types';

export type ClassNameComponent<
  TInner extends React.ComponentType<TProps>,
  TProps extends StyledElementProps
> = TInner & {
  [APPLY_CLASS_NAME_PROPERTY]: true;
};

export function applyClassName<
  TComponent extends React.ComponentType<TProps>,
  TProps extends StyledElementProps = StyledElementProps
>(component: TComponent): ClassNameComponent<TComponent, TProps> {
  (component as ClassNameComponent<TComponent, TProps>)[APPLY_CLASS_NAME_PROPERTY] = true;
  return component as ClassNameComponent<TComponent, TProps>;
}
