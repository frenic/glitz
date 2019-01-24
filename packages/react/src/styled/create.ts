import { StyleArray } from '@glitz/type';
import * as React from 'react';
import { isElementLikeType, StyledElementLike } from './apply-class-name';
import { isElementType, StyledElement } from './predefined';
import createRenderer from './renderer';
import StyledSuper, { ExternalProps, isStyledComponent, StyledComponent } from './Super';

export default function create<TProps>(
  type:
    | StyledElement
    | StyledElementLike<React.ComponentType<TProps>>
    | StyledComponent<TProps>
    | React.ComponentType<TProps>,
  statics: StyleArray,
  debugInfo?: { stack: any; stacktrace: any; message: any },
): StyledComponent<TProps> {
  return isStyledComponent<TProps>(type)
    ? type.compose(
        statics,
        debugInfo,
      )
    : factory(type, statics, debugInfo);
}

export function factory<TProps>(
  type: StyledElement | StyledElementLike<React.ComponentType<TProps>> | React.ComponentType<TProps>,
  statics: StyleArray,
  debugInfo?: { stack: any; stacktrace: any; message: any },
): StyledComponent<TProps> {
  class Styled extends StyledSuper<TProps> {
    public static displayName: string;
    public static compose(additionals?: StyleArray, composedDebugInfo?: { stack: any; stacktrace: any; message: any }) {
      return factory(type, additionals ? statics.concat(additionals) : statics, composedDebugInfo);
    }
    constructor(props: ExternalProps<TProps>) {
      super(props);
      const renderWithProps = createRenderer(type, statics, debugInfo);
      this.render = () => renderWithProps(this.props);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    const inner = isElementType(type) || isElementLikeType<TProps>(type) ? type.value : type;
    Styled.displayName = `Styled(${typeof inner === 'string' ? inner : inner.displayName || inner.name || 'Unknown'})`;
  }

  return Styled;
}
