import { StyleArray } from '@glitz/type';
import * as React from 'react';
import { isElementLikeType, StyledElementLike } from './apply-class-name';
import { isElementType, StyledElement } from './predefined';
import StyledSuper, { ExternalProps, isStyledComponent, StyledComponent } from './Super';

export default function create<TProps>(
  type:
    | StyledElement
    | StyledElementLike<React.ComponentType<TProps>>
    | StyledComponent<TProps>
    | React.ComponentType<TProps>,
  statics: StyleArray,
): StyledComponent<TProps> {
  return isStyledComponent<TProps>(type) ? type.compose(statics) : factory(type, statics);
}

export function factory<TProps>(
  type: StyledElement | StyledElementLike<React.ComponentType<TProps>> | React.ComponentType<TProps>,
  statics: StyleArray,
): StyledComponent<TProps> {
  class Styled extends StyledSuper<TProps> {
    public static displayName: string;
    public static compose(additionals?: StyleArray) {
      return factory(type, additionals ? statics.concat(additionals) : statics);
    }
    constructor(props: ExternalProps<TProps>) {
      super(type, statics, props);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    const inner = isElementType(type) || isElementLikeType<TProps>(type) ? type.value : type;
    Styled.displayName = `Styled(${typeof inner === 'string' ? inner : inner.displayName || inner.name || 'Unknown'})`;
  }

  return Styled;
}
