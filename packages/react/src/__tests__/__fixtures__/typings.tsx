// tslint:disable no-unused-expression max-classes-per-file

import * as React from 'react';
import { applyClassName, GlitzProvider, styled, StyledElementProps, StyledProps } from '../..';
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

const StyledFunctionComponentWithoutStyle = styled(props => <styled.Div css={props.compose({})} />);
<StyledFunctionComponentWithoutStyle css={{}} />;

const StyledStyledFunctionComponentWithoutStyle = styled(props => (
  <StyledFunctionComponentWithoutStyle css={props.compose({})} />
));
<StyledStyledFunctionComponentWithoutStyle css={{}} />;

const StyledFunctionComponentWithStyle = styled(props => <styled.Div css={props.compose({})} />, {});
<StyledFunctionComponentWithStyle css={{}} />;

const StyledFunctionComponentWithProps = styled((props: { x: string } & StyledProps) => (
  <styled.Div css={props.compose({})} />
));
<StyledFunctionComponentWithProps x="" css={{}} />;

const StyledStyledFunctionComponentWithProps = styled(StyledFunctionComponentWithProps);
<StyledStyledFunctionComponentWithProps x="" css={{}} />;

class ClassComponentWithoutProps extends React.Component<StyledProps> {
  public render() {
    return <styled.Div css={this.props.compose({})} />;
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

class ClassComponentStyledClassComponent extends React.Component<StyledProps> {
  public render() {
    return <StyledClassComponentWithoutProps css={this.props.compose({})} />;
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

class ClassComponentWithProps extends React.Component<{ x: string } & StyledProps> {
  public render() {
    return <styled.Div css={this.props.compose({})} />;
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
const StyledFunctionComponentWithDecorator = styledDecoratorAB(props => <styled.Div css={props.compose({})} />);
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

styled(props => <styled.Div css={props.compose(styledDecoratorA)} />);
styled(props => <styled.Div css={props.compose(styledDecoratorA({}))} />);
<styled.Div css={styledDecoratorA} />;
<styled.Div css={styledDecoratorA({})} />;

const StyledForwardRefComponent = styled(
  React.forwardRef((props: StyledProps, ref: React.Ref<HTMLButtonElement>) => (
    <styled.Button css={props.compose()} ref={ref} />
  )),
);
<StyledForwardRefComponent
  css={{}}
  ref={ref => {
    const element: HTMLButtonElement | null = ref;
    element;
  }}
/>;

const StyledFunctionComponentWithUnionProps = styled(
  (props: ({ a: boolean; b?: never } | { a?: never; b: boolean }) & StyledProps) => {
    if ('a' in props && props.a === true) {
      return null;
    }
    if ('b' in props && props.b === true) {
      return null;
    }

    return null;
  },
);

<StyledFunctionComponentWithUnionProps a />;
<StyledFunctionComponentWithUnionProps b />;
<StyledFunctionComponentWithUnionProps a b />;

<styled.Div css={{ color: '', unknownProperty: 0 }} />;

<styled.Div css={{ color: 0 }} />;

styled.div({ color: '', unknownProperty: 0 });

styled.div({ color: 0 });

styled({ color: '', unknownProperty: 0 });

styled({ color: 0 });

styled(props => <styled.Div css={props.compose({ color: '', unknownProperty: 0 })} />);

styled(props => <styled.Div css={props.compose({ color: 0 })} />);

styled(props => <styled.Div css={props.compose()} />, { color: '', unknownProperty: 0 });

styled(props => <styled.Div css={props.compose()} />, { color: 0 });

styled(() => new Promise(r => r()), { color: '', unknownProperty: 0 });

styled(() => new Promise(r => r()), { color: 0 });

<styled.button />;

styled.Button({});
