import { StyleArray, StyleOrStyleArray } from '@glitz/type';
import * as React from 'react';
import { Consumer, Context } from '../components/context';
import { isElementLikeType, StyledElementLike } from '../styled/apply-class-name';
import { isElementType, StyledElement } from '../styled/predefined';
import { ExternalProps, isStyledComponent, StyledElementProps, StyledProps } from './Super';

type ApplyFunction = (additionals?: StyleOrStyleArray) => string | undefined;
type ComposeFunction = (additionals?: StyleOrStyleArray) => StyleOrStyleArray | undefined;

export default function createRenderer(
  type: StyledElement | StyledElementLike<React.ComponentType<any>> | React.ComponentType<any>,
  statics?: StyleArray,
) {
  let lastDynamics: StyleOrStyleArray | undefined;
  let lastComposer: ComposeFunction | undefined;

  const createComposer = (dynamics?: StyleOrStyleArray) => {
    if (lastDynamics === dynamics && lastComposer) {
      return lastComposer;
    }

    lastDynamics = dynamics;

    let lastStyles: StyleOrStyleArray | undefined;
    let lastAdditionals: StyleOrStyleArray | undefined;

    return (lastComposer = additionals => {
      const isPure = lastAdditionals === additionals;

      if (isPure && lastStyles) {
        return lastStyles;
      }

      lastAdditionals = additionals;

      if (!dynamics && !additionals) {
        return (lastStyles = statics);
      }

      return (lastStyles = ([] as StyleArray).concat(additionals || [], statics || [], dynamics || []));
    });
  };

  let lastContext: Context | undefined;
  let lastApplier: ApplyFunction | undefined;
  let lastApplierComposer: ComposeFunction | undefined;

  const createApplier = (context: Context, compose: ComposeFunction): ApplyFunction => {
    if (lastContext === context && lastApplierComposer === compose && lastApplier) {
      return lastApplier;
    }

    lastContext = context;
    lastApplierComposer = compose;

    let lastStyles: StyleOrStyleArray | undefined;
    let lastClassName: string | null;

    return (lastApplier = additionals => {
      const styles: StyleOrStyleArray | undefined = compose(additionals);

      const isPure = styles === lastStyles;
      lastStyles = styles;

      if (!styles) {
        return;
      }

      if (isPure && lastClassName) {
        return lastClassName;
      }

      return (lastClassName = context.glitz.injectStyle(styles));
    });
  };

  const createElement: (
    currentProps: ExternalProps<any>,
    apply: ApplyFunction,
    compose: ComposeFunction,
  ) => React.ReactElement<any> =
    isElementType(type) || isElementLikeType<any>(type)
      ? (currentProps, apply) =>
          React.createElement(
            type.value,
            passingProps<StyledElementProps>(
              { className: combineClassNames(currentProps.className, apply()) },
              currentProps,
            ),
          )
      : isStyledComponent(type)
        ? (currentProps, {}, compose) =>
            React.createElement(type, passingProps<StyledProps>({ css: compose() }, currentProps))
        : (currentProps, apply, compose) =>
            React.createElement(type, passingProps<StyledProps>({ apply, compose }, currentProps));

  return (currentProps: ExternalProps<any>) => {
    return React.createElement(Consumer, null, (context: Context) => {
      if (process.env.NODE_ENV !== 'production') {
        if (!(context && context.glitz && context.glitz)) {
          throw new Error(
            "The `<GlitzProvider>` doesn't seem to be used correctly because the core instance couldn't be found",
          );
        }
      }

      const compose = createComposer(currentProps.css);
      return createElement(currentProps, createApplier(context, compose), compose);
    });
  };
}

function combineClassNames(a: string | undefined, b: string | undefined) {
  return a && b ? `${a} ${b}` : a ? a : b;
}

function passingProps<T>(destination: any, props: any): T {
  for (let name in props) {
    const value = props[name];
    if (name !== 'css') {
      if (name === 'innerRef') {
        name = 'ref';
      }
      // Don't override preexisting props
      destination[name] = destination[name] || value;
    }
  }
  return destination;
}
