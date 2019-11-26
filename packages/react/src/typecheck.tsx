// tslint:disable

import { GlitzClient, GlitzServer } from '@glitz/core';
import * as React from 'react';
import { GlitzProvider, styled, StyledProps, applyClassName, StyledElementProps } from './';

const client = new GlitzClient();
<GlitzProvider glitz={client} />;

const server: GlitzServer = new GlitzServer();
<GlitzProvider glitz={server} />;

const A = styled.button({});
<A type="submit" onClick={e => e.currentTarget.type} css={{}} ref={React.createRef<HTMLButtonElement>()} />;

<styled.Button type="submit" onClick={e => e.currentTarget.type} css={{}} ref={React.createRef<HTMLButtonElement>()} />;

const B = styled(props => <styled.Div css={props.compose({})} />);
<B css={{}} />;

const C = styled(props => <B css={props.compose({})} />);
<C css={{}} />;

const D = styled(props => <styled.Div css={props.compose({})} />, {});
<D css={{}} />;

const E = styled((props: { x: string } & StyledProps) => <styled.Div css={props.compose({})} />);
<E x="" css={{}} />;

const F = styled(E);
<F x="" css={{}} />;

class G0 extends React.Component<StyledProps> {
  render() {
    return <styled.Div css={this.props.compose({})} />;
  }
}
const G1 = styled(G0);
<G1 css={{}} ref={React.createRef<G0>()} />;

class H0 extends React.Component<StyledProps> {
  render() {
    return <G1 css={this.props.compose({})} />;
  }
}
const H1 = styled(H0);
<H1 css={{}} ref={React.createRef<H0>()} />;

class I0 extends React.Component<StyledProps> {
  render() {
    return <styled.Div css={this.props.compose({})} />;
  }
}
const I1 = styled(I0, {});
<I1 css={{}} ref={React.createRef<I0>()} />;

class J0 extends React.Component<{ x: string } & StyledProps> {
  render() {
    return <styled.Div css={this.props.compose({})} />;
  }
}
const J1 = styled(J0);
<J1 x="" css={{}} ref={React.createRef<J0>()} />;

const K = styled(J1);
<K x="" css={{}} ref={React.createRef<J0>()} />;

const l0 = styled({});
const l1 = styled({});
const l2 = l0(l1({}));
const L = l2(props => <styled.Div css={props.compose({})} />);
<L css={{}} />;

const m0 = styled({});
const m1 = styled({});
const m2 = m0(m1({}));
class M0 extends React.Component<StyledProps> {
  render() {
    return <styled.Div css={this.props.compose({})} />;
  }
}
const M1 = m2(M0);
<M1 css={{}} ref={React.createRef<M0>()} />;

function factory() {
  return styled(
    class extends React.Component<StyledProps> {
      x = styled(({ compose }: StyledProps) => <styled.Div css={compose(this.props.compose({}))} />);
    },
  );
}
const N = styled(applyClassName(props => <div className={props.className} />));
<N className="" css={{}} />;

const O = styled(applyClassName((props: { x: string } & StyledElementProps) => <div className={props.className} />));
<O x="" className="" css={{}} />;

class P0 extends React.Component<StyledElementProps> {
  render() {
    return <div className={this.props.className} />;
  }
}
const P1 = styled(applyClassName(P0));
<P1 className="" css={{}} ref={React.createRef<P0>()} />;

class Q0 extends React.Component<{ x: string } & StyledElementProps> {
  render() {
    return <div className={this.props.className} />;
  }
}
const Q1 = styled(applyClassName(Q0));
<Q1 x="" className="" css={{}} ref={React.createRef<Q0>()} />;

function connect<TProps>(Component: React.ComponentType<TProps>): React.FunctionComponent<TProps> {
  return props => <Component {...props} />;
}

const R = connect(B);
<R css={{}} />;

const s = styled({});
styled(props => <styled.Div css={props.compose(s)} />);
styled(props => <styled.Div css={props.compose(s({}))} />);
<styled.Div css={s} />;
<styled.Div css={s({})} />;

const T = styled(
  class extends React.Component<StyledProps> {
    render() {
      return <styled.Div css={this.props.compose({})}>{this.props.children}</styled.Div>;
    }
  },
);
<T css={{}}>Text</T>;

const U = styled(
  React.forwardRef((props: StyledProps, ref: React.Ref<HTMLButtonElement>) => (
    <styled.Button css={props.compose()} ref={ref} />
  )),
);
<U css={{}} ref={React.createRef<HTMLButtonElement>()} />;

const V = styled((props: ({ a: boolean; b?: never } | { a?: never; b: boolean }) & StyledProps) => {
  if ('a' in props && props.a === true) {
    return null;
  }
  if ('b' in props && props.b === true) {
    return null;
  }

  return null;
});

<V a />;
<V b />;

// Using `styled` as a decorator is not possible at the moment
// due to: https://github.com/Microsoft/TypeScript/issues/4881
// @styled({})
// class L extends React.Component<StyledProps> {
//   render() {
//     return <div className={this.props.apply()} />
//   }
// };
// <L css={{}} ref={c => c} />;

// @styled
// class M extends React.Component<StyledProps> {
//   render() {
//     return <div className={this.props.apply()} />
//   }
// };
// <M css={{}} ref={c => c} />;

// Avoid unread variables type error
factory;
