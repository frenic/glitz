// tslint:disable

import { GlitzClient, GlitzServer } from '@glitz/core';
import * as React from 'react';
import { GlitzProvider, styled, StyledProps, applyClassName, StyledElementProps } from './';

const client = new GlitzClient();
<GlitzProvider glitz={client} />;

const server: GlitzServer = new GlitzServer();
<GlitzProvider glitz={server} />;

const A = styled.button({});
<A type="submit" onClick={e => e.currentTarget.type} css={{}} ref={el => el} />;

<styled.Button type="submit" onClick={e => e.currentTarget.type} css={{}} ref={el => el} />;

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

const G = styled(
  class extends React.Component<StyledProps> {
    render() {
      return <styled.Div css={this.props.compose({})} />;
    }
  },
);
<G css={{}} ref={c => c} />;

const H = styled(
  class extends React.Component<StyledProps> {
    render() {
      return <G css={this.props.compose({})} />;
    }
  },
);
<H css={{}} ref={c => c} />;

const I = styled(
  class extends React.Component<StyledProps> {
    render() {
      return <styled.Div css={this.props.compose({})} />;
    }
  },
  {},
);
<I css={{}} ref={c => c} />;

const J = styled(
  class extends React.Component<{ x: string } & StyledProps> {
    render() {
      return <styled.Div css={this.props.compose({})} />;
    }
  },
);
<J x="" css={{}} ref={c => c} />;

const K = styled(J);
<K x="" css={{}} ref={c => c} />;

const l0 = styled({});
const l1 = styled({});
const l2 = l0(l1({}));
const L = l2(props => <styled.Div css={props.compose({})} />);
<L css={{}} />;

const m0 = styled({});
const m1 = styled({});
const m2 = m0(m1({}));
const M = m2(
  class extends React.Component<StyledProps> {
    render() {
      return <styled.Div css={this.props.compose({})} />;
    }
  },
);
<M css={{}} ref={c => c} />;

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

const P = styled(
  applyClassName(
    class extends React.Component<StyledElementProps> {
      render() {
        return <div className={this.props.className} />;
      }
    },
  ),
);
<P className="" css={{}} ref={c => c} />;

const Q = styled(
  applyClassName(
    class extends React.Component<{ x: string } & StyledElementProps> {
      render() {
        return <div className={this.props.className} />;
      }
    },
  ),
);
<Q x="" className="" css={{}} ref={c => c} />;

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
