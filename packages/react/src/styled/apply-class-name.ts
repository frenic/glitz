import { APPLY_CLASS_NAME_IDENTIFIER } from './create';
import { StyledElementProps } from './types';

export type ClassNameComponent<
  TInner extends React.ComponentType<TProps>,
  TProps extends StyledElementProps
> = TInner & {
  [APPLY_CLASS_NAME_IDENTIFIER]: 1;
};

export function applyClassName<TProps extends StyledElementProps, TComponent extends React.ComponentClass<TProps>>(
  component: React.ClassType<TProps, React.Component<TProps, React.ComponentState>, TComponent>,
): ClassNameComponent<TComponent, TProps>;

export function applyClassName<TProps extends StyledElementProps>(
  component: React.StatelessComponent<TProps>,
): ClassNameComponent<React.StatelessComponent<TProps>, TProps>;

export function applyClassName<TProps extends StyledElementProps>(
  component: React.ComponentType<TProps>,
): ClassNameComponent<React.ComponentType<TProps>, TProps> {
  (component as ClassNameComponent<typeof component, TProps>)[APPLY_CLASS_NAME_IDENTIFIER] = 1;
  return component as ClassNameComponent<typeof component, TProps>;
}
