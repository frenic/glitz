import { StyleArray } from '@glitz/type';
import * as React from 'react';
import GlitzBase, { ExternalProps, isStyledComponent, StyledComponent } from '../components/Base';

export const APPLY_CLASS_NAME_IDENTIFIER = '__b$glitz';

export default function create<TProps>(
  Inner: string | StyledComponent<TProps> | React.ComponentType<TProps>,
  statics: StyleArray,
): StyledComponent<TProps> {
  return isStyledComponent(Inner) ? Inner.compose(statics) : factory(Inner, statics);
}

export function factory<TProps>(
  inner: string | React.ComponentType<TProps>,
  statics: StyleArray,
): StyledComponent<TProps> {
  class GlitzStyled extends GlitzBase<TProps> {
    public static displayName: string;
    public static compose(additionals?: StyleArray) {
      return factory(inner, additionals ? statics.concat(additionals) : statics);
    }
    constructor(props: ExternalProps<TProps>) {
      super(inner, statics, props);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    GlitzStyled.displayName = `Styled(${
      typeof inner === 'string' ? inner : inner.displayName || inner.name || 'Unknown'
    })`;
  }

  return GlitzStyled;
}
