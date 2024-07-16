/* eslint-disable */

import * as React from 'react';
import {
  applyClassName,
  GlitzProvider,
  styled,
  StyledElementProps,
  StyledComponent,
  forwardStyle,
  ForwardStyleProps,
} from '../..';
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

const StyledFunctionComponentWithRequiredProps = styled(({ }: { x: string }) => <styled.Div css={{}} />, {});
<StyledFunctionComponentWithRequiredProps x="" css={{}} />;

const StyledStyledFunctionComponentWithRequiredProps = styled(StyledFunctionComponentWithRequiredProps);
<StyledStyledFunctionComponentWithRequiredProps x="" css={{}} />;

const StyledFunctionComponentWithOptionalProps = styled(({ }: { x?: string }) => <styled.Div css={{}} />, {});
<StyledFunctionComponentWithOptionalProps x="" css={{}} />;

const StyledStyledFunctionComponentWithOptionalProps = styled(StyledFunctionComponentWithOptionalProps);
<StyledStyledFunctionComponentWithOptionalProps x="" css={{}} />;

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

class ClassComponentWithRequiredProps extends React.Component<{ x: string }> {
  public render() {
    return <styled.Div css={{}} />;
  }
}
const StyledClassComponentWithRequiredProps = styled(ClassComponentWithRequiredProps);
<StyledClassComponentWithRequiredProps
  x=""
  css={{}}
  ref={ref => {
    const instance: ClassComponentWithRequiredProps | null = ref;
    instance;
  }}
/>;

const StyledStyledClassComponentWithRequiredProps = styled(StyledClassComponentWithRequiredProps);
<StyledStyledClassComponentWithRequiredProps
  x=""
  css={{}}
  ref={ref => {
    const instance: ClassComponentWithRequiredProps | null = ref;
    instance;
  }}
/>;

const aDecorator = styled({});
const bDecorator = styled({});
const cDecorator = styled(aDecorator(), bDecorator(), {});
const StyledFunctionComponentWithDecorator = styled(() => <styled.Div css={{}} />, cDecorator());
<StyledFunctionComponentWithDecorator css={{}} />;

const StyledClassComponentWithDecorator = styled(ClassComponentWithoutProps, cDecorator());
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

const StyledElementLikeFunctionComponentWithRequiredProps = styled(
  applyClassName((props: { x: string } & StyledElementProps) => <div className={props.className} />),
);
<StyledElementLikeFunctionComponentWithRequiredProps x="" className="" css={{}} />;

const StyledElementLikeFunctionComponentWithOptionalProps = styled(
  applyClassName((props: { x?: string } & StyledElementProps) => <div className={props.className} />),
);
<StyledElementLikeFunctionComponentWithOptionalProps x="" className="" css={{}} />;

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

class ElementLikeClassComponentWithReqruiedProps extends React.Component<{ x: string } & StyledElementProps> {
  public render() {
    return <div className={this.props.className} />;
  }
}
const StyledElementLikeClassComponentWithProps = styled(applyClassName(ElementLikeClassComponentWithReqruiedProps));
<StyledElementLikeClassComponentWithProps
  x=""
  className=""
  css={{}}
  ref={ref => {
    const instance: ElementLikeClassComponentWithReqruiedProps | null = ref;
    instance;
  }}
/>;

function connect<TProps>(Component: React.ComponentType<TProps>): React.FunctionComponent<TProps> {
  return props => <Component {...props} />;
}

const R = connect(StyledFunctionComponentWithoutStyle);
<R css={{}} />;

styled(() => <styled.Div css={aDecorator()} />);
styled(() => <styled.Div css={[aDecorator(), {}]} />);
<styled.Div css={aDecorator()} />;
<styled.Div css={[aDecorator(), {}]} />;

const StyledForwardRefComponentWithRequiredProps = styled(
  ({ ref }: { x: string; ref: React.Ref<HTMLButtonElement> }) => <styled.Button css={{}} ref={ref} />,
);

<StyledForwardRefComponentWithRequiredProps
  x=""
  css={{}}
  ref={ref => {
    const element: HTMLButtonElement | null = ref;
    element;
  }}
/>;

const StyledForwardRefComponentWithOptionalProps = styled(
  ({ ref }: { x?: string; ref: React.Ref<HTMLButtonElement> }) => <styled.Button css={{}} ref={ref} />,
);
<StyledForwardRefComponentWithOptionalProps
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

<styled.Div css={false && {}} />;

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

styled(() => new Promise<void>(r => r()), { color: '', unknownProperty: 0 });

styled(() => new Promise<void>(r => r()), { color: 0 });

<styled.button />;

const NotAStyledComponent = styled.Button({});
<NotAStyledComponent />;

const StyledComponentWithInheritedRef = styled(styled.button({}));
<StyledComponentWithInheritedRef
  css={{}}
  ref={ref => {
    const element: HTMLButtonElement | null = ref;
    element;
  }}
/>;

const StyledComponentFunctionWithoutRef = styled(({ }: { ref?: React.Ref<HTMLButtonElement> }) => <styled.Button />);
<StyledComponentFunctionWithoutRef css={{}} ref={React.createRef()} />;

export function createStyledComponent<TProps>(Component: StyledComponent<TProps>) {
  // Just to ping whenever this is fixed
  // Related (I think): https://github.com/microsoft/TypeScript/issues/28884
  // @ts-expect-error
  ({ x, ...restProps }: TProps & { x: string }) => <Component {...restProps} />;
  // @ts-expect-error
  styled(({ x, ...restProps }: TProps & { x: string }) => <Component {...restProps} />);
  styled(({ x, ...restProps }: TProps & { x: string }) => <Component {...(restProps as unknown as TProps)} />);
}

// styled({})(props => <div />);
// cDecorator(props => <div />);
// cDecorator({});

const WithRefWithApplyClassName = styled(
  applyClassName(({ ref }: React.HTMLAttributes<HTMLDivElement> & { ref: React.Ref<HTMLDivElement> }) => (
    <div ref={ref} />
  )),
);
<WithRefWithApplyClassName ref={React.createRef<HTMLDivElement>()} />;

const WithoutRefWithApplyClassName = styled(
  applyClassName(({ }: React.HtmlHTMLAttributes<HTMLButtonElement>) => <div />),
);
<WithoutRefWithApplyClassName ref={React.createRef<HTMLDivElement>()} />;

const WithRefWithForwardStyle = styled(
  forwardStyle(({ ref }: { ref: React.Ref<HTMLDivElement> } & ForwardStyleProps) => <div ref={ref} />),
);
<WithRefWithForwardStyle ref={React.createRef<HTMLDivElement>()} />;

const WithoutRefWithForwardStyle = styled(forwardStyle(({ }: ForwardStyleProps) => <div />));
<WithoutRefWithForwardStyle ref={React.createRef<HTMLDivElement>()} />;
