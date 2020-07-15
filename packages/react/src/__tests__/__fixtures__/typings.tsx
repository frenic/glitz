// tslint:disable no-unused-expression max-classes-per-file

import * as React from 'react';
import { applyClassName, GlitzProvider, styled, StyledElementProps } from '../..';
import { GlitzClient, GlitzServer } from '../../../../core/src';

const client = new GlitzClient();
<GlitzProvider glitz={client} />;

const server: GlitzServer = new GlitzServer();
<GlitzProvider glitz={server} />;

const StyledButton = styled.button({});

<StyledButton
  type="submit"
  onClick={e => {
    const el: HTMLButtonElement = e.currentTarget;
    el;
  }}
  css={{}}
  ref={React.createRef<HTMLButtonElement>()}
/>;

<styled.Button
  type="submit"
  onClick={e => {
    const el: HTMLButtonElement = e.currentTarget;
    el;
  }}
  css={{}}
  ref={React.createRef<HTMLButtonElement>()}
/>;

const StyledFunctionComponentWithoutStyle = styled(() => <styled.Div css={{}} />);
<StyledFunctionComponentWithoutStyle css={{}} />;

const StyledStyledFunctionComponentWithoutStyle = styled(() => <StyledFunctionComponentWithoutStyle css={{}} />);
<StyledStyledFunctionComponentWithoutStyle css={{}} />;

const StyledFunctionComponentWithStyle = styled(() => <styled.Div css={{}} />, {});
<StyledFunctionComponentWithStyle css={{}} />;

const StyledFunctionComponentWithProps = styled(({}: { x: string }) => <styled.Div css={{}} />);
<StyledFunctionComponentWithProps x="" css={{}} />;

const StyledStyledFunctionComponentWithProps = styled(StyledFunctionComponentWithProps);
<StyledStyledFunctionComponentWithProps x="" css={{}} />;

class ClassComponentWithoutProps extends React.Component {
  public render() {
    return <styled.Div css={{}} />;
  }
}
const StyledClassComponentWithoutProps = styled(ClassComponentWithoutProps);
<StyledClassComponentWithoutProps
  css={{}}
  ref={ref => {
    const instance: ClassComponentWithoutProps | null = ref;
    instance;
  }}
/>;

class ClassComponentStyledClassComponent extends React.Component {
  public render() {
    return <StyledClassComponentWithoutProps css={{}} />;
  }
}
const StyledClassComponentStyledClassComponent = styled(ClassComponentStyledClassComponent);
<StyledClassComponentStyledClassComponent
  css={{}}
  ref={ref => {
    const instance: ClassComponentStyledClassComponent | null = ref;
    instance;
  }}
/>;

const StyledClassComponentWithoutPropsWithStyle = styled(ClassComponentWithoutProps, {});
<StyledClassComponentWithoutPropsWithStyle
  css={{}}
  ref={ref => {
    const instance: ClassComponentStyledClassComponent | null = ref;
    instance;
  }}
/>;

class ClassComponentWithProps extends React.Component<{ x: string }> {
  public render() {
    return <styled.Div css={{}} />;
  }
}
const StyledClassComponentWithProps = styled(ClassComponentWithProps);
<StyledClassComponentWithProps
  x=""
  css={{}}
  ref={ref => {
    const instance: ClassComponentWithProps | null = ref;
    instance;
  }}
/>;

const StyledStyledClassComponentWithProps = styled(StyledClassComponentWithProps);
<StyledStyledClassComponentWithProps
  x=""
  css={{}}
  ref={ref => {
    const instance: ClassComponentWithProps | null = ref;
    instance;
  }}
/>;

const styledDecoratorA = styled({});
const styledDecoratorB = styled({});
const styledDecoratorAB = styledDecoratorA(styledDecoratorB({}));
const StyledFunctionComponentWithDecorator = styledDecoratorAB(() => <styled.Div css={{}} />);
<StyledFunctionComponentWithDecorator css={{}} />;

const StyledClassComponentWithDecorator = styledDecoratorAB(ClassComponentWithoutProps);
<StyledClassComponentWithDecorator
  css={{}}
  ref={ref => {
    const instance: ClassComponentWithoutProps | null = ref;
    instance;
  }}
/>;

const StyledElementLikeFunctionComponentWithoutProps = styled(
  applyClassName(props => <div className={props.className} />),
);
<StyledElementLikeFunctionComponentWithoutProps className="" css={{}} />;

const StyledElementLikeFunctionComponentWithProps = styled(
  applyClassName((props: { x: string } & StyledElementProps) => <div className={props.className} />),
);
<StyledElementLikeFunctionComponentWithProps x="" className="" css={{}} />;

class ElementLikeClassComponentWithoutProps extends React.Component<StyledElementProps> {
  public render() {
    return <div className={this.props.className} />;
  }
}
const StyledElementLikeClassComponentWithoutProps = styled(applyClassName(ElementLikeClassComponentWithoutProps));
<StyledElementLikeClassComponentWithoutProps
  className=""
  css={{}}
  ref={ref => {
    const instance: ElementLikeClassComponentWithoutProps | null = ref;
    instance;
  }}
/>;

class ElementLikeClassComponentWithProps extends React.Component<{ x: string } & StyledElementProps> {
  public render() {
    return <div className={this.props.className} />;
  }
}
const StyledElementLikeClassComponentWithProps = styled(applyClassName(ElementLikeClassComponentWithProps));
<StyledElementLikeClassComponentWithProps
  x=""
  className=""
  css={{}}
  ref={ref => {
    const instance: ElementLikeClassComponentWithProps | null = ref;
    instance;
  }}
/>;

function connect<TProps>(Component: React.ComponentType<TProps>): React.FunctionComponent<TProps> {
  return props => <Component {...props} />;
}

const R = connect(StyledFunctionComponentWithoutStyle);
<R css={{}} />;

styled(() => <styled.Div css={styledDecoratorA} />);
styled(() => <styled.Div css={styledDecoratorA({})} />);
<styled.Div css={styledDecoratorA} />;
<styled.Div css={styledDecoratorA({})} />;

const StyledForwardRefComponent = styled(
  React.forwardRef(({}, ref: React.Ref<HTMLButtonElement>) => <styled.Button css={{}} ref={ref} />),
);
<StyledForwardRefComponent
  css={{}}
  ref={ref => {
    const element: HTMLButtonElement | null = ref;
    element;
  }}
/>;

const StyledFunctionComponentWithUnionProps = styled((props: { a: boolean; b?: never } | { a?: never; b: boolean }) => {
  if ('a' in props && props.a === true) {
    return null;
  }
  if ('b' in props && props.b === true) {
    return null;
  }

  return null;
});

<StyledFunctionComponentWithUnionProps a />;
<StyledFunctionComponentWithUnionProps b />;
<StyledFunctionComponentWithUnionProps a b />;

<styled.Div css={{ color: '', unknownProperty: 0 }} />;

<styled.Div css={{ color: 0 }} />;

styled.div({ color: '', unknownProperty: 0 });

styled.div({ color: 0 });

styled({ color: '', unknownProperty: 0 });

styled({ color: 0 });

styled(() => <styled.Div css={{ color: '', unknownProperty: 0 }} />);

styled(() => <styled.Div css={{ color: 0 }} />);

styled(() => <styled.Div css={{}} />, { color: '', unknownProperty: 0 });

styled(() => <styled.Div css={{}} />, { color: 0 });

styled(() => new Promise(r => r()), { color: '', unknownProperty: 0 });

styled(() => new Promise(r => r()), { color: 0 });

<styled.button />;

styled.Button({});
