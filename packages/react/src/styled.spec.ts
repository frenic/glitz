// tslint:disable max-classes-per-file

import { GlitzClient } from '@glitz/core';
import { Style } from '@glitz/type';
import { mount } from 'enzyme';
import * as React from 'react';
import { applyClassName, GlitzProvider, styled, ThemeProvider } from './';
import { WithRefProp } from './styled/create';
import { StyledElementProps, StyledProps } from './styled/types';
import useGlitz from './styled/use-glitz';
import useStyle from './styled/use-style';

describe('react styled', () => {
  const warn = console.warn;
  afterEach(() => {
    console.warn = warn;
  });

  it('returns class names using style hook', () => {
    function Component() {
      const [apply] = useGlitz({ color: 'red' });
      expect(apply()).toBe('a');
      return null;
    }
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(Component),
      ),
    );
  });
  it('returns composes using style hook', () => {
    function Component() {
      const [, composeA] = useGlitz({ color: 'red', backgroundColor: 'blue' });
      const [, composeB] = useGlitz(composeA({ color: 'green' }));
      expect(composeB()).toEqual([{ color: 'green' }, { color: 'red', backgroundColor: 'blue' }]);
      return null;
    }
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(Component),
      ),
    );
  });
  it('returns class names using class name hook', () => {
    function Component() {
      const classNames = useStyle({ color: 'red' });
      expect(classNames).toBe('a');
      return null;
    }
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(Component),
      ),
    );
  });
  it('renders styled component with memo', async () => {
    let updates = 0;
    let renders = 0;
    const StyledComponent = styled(
      React.memo((props: StyledProps) => {
        renders++;
        expect(props.compose()).toEqual([{ color: 'red' }]);
        return null;
      }),
      { color: 'red' },
    );
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(
          class extends React.Component {
            public componentDidMount() {
              expect(renders).toBe(1);
              this.forceUpdate();
            }
            public render() {
              updates++;
              return React.createElement(StyledComponent);
            }
          },
        ),
      ),
    );
    expect(updates).toBe(2);
    expect(renders).toBe(1);
  });
  it('renders styled component with forwardRef', () => {
    const StyledComponent = styled(
      React.forwardRef((props: StyledProps, ref: React.Ref<HTMLDivElement>) => {
        expect(props.compose()).toEqual([{ color: 'red' }]);
        return React.createElement(styled.Div, {
          css: props.compose(),
          ref,
        });
      }),
      { color: 'red' },
    );
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(StyledComponent, { ref: (el: HTMLDivElement) => expect(el.className).toBe('a') }),
      ),
    );
  });
  it('creates custom styled component', () => {
    const StyledComponent = styled(
      props => {
        expect(props.compose()).toEqual([{ color: 'red' }]);
        return React.createElement(styled.Div, {
          css: props.compose(),
          ref: (el: HTMLDivElement) => expect(el.className).toBe('a'),
        });
      },
      { color: 'red' },
    );
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(StyledComponent),
      ),
    );
  });
  it('creates decorated styled component', () => {
    const styleDecoratorA = styled({ color: 'red' });
    const styleDecoratorB = styleDecoratorA({ backgroundColor: 'green' });
    const StyledComponentA = styleDecoratorB(props => {
      expect(props.compose()).toEqual([{ color: 'red' }, { backgroundColor: 'green' }]);
      return React.createElement(styled.Div, {
        css: props.compose(),
        ref: (el: HTMLDivElement) => expect(el.className).toBe('a b'),
      });
    });
    const StyledComponentB = styleDecoratorB(
      props => {
        expect(props.compose()).toEqual([{ color: 'red' }, { backgroundColor: 'green' }, { color: 'green' }]);
        return React.createElement(styled.Div, {
          css: props.compose(),
          ref: (el: HTMLDivElement) => expect(el.className).toBe('b c'),
        });
      },
      { color: 'green' },
    );
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(StyledComponentA),
        React.createElement(StyledComponentB),
      ),
    );
  });
  it('creates predefined styled component', () => {
    const StyledComponent = styled.div({ color: 'red' });
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(StyledComponent, {
          ref: (el: HTMLDivElement) => {
            expect(el.className).toBe('a');
          },
        }),
      ),
    );
  });
  it('decorates style', () => {
    const styleDecoratorA = styled({ color: 'red' });
    const styleDecoratorB = styleDecoratorA({ backgroundColor: 'green' });
    const styleDecoratorC = styleDecoratorB(styled({ borderLeftColor: 'blue' }));
    expect(styleDecoratorC()).toEqual([{ color: 'red' }, { backgroundColor: 'green' }, { borderLeftColor: 'blue' }]);
    const StyledComponentA = styled(props => {
      return React.createElement(styled.Div, {
        css: props.compose(styleDecoratorC),
        ref: (el: HTMLDivElement) => {
          expect(el.className).toBe('a b c');
          const declaration = getComputedStyle(el);
          expect(declaration.getPropertyValue('color')).toBe('red');
          expect(declaration.getPropertyValue('background-color')).toBe('green');
          expect(declaration.getPropertyValue('border-left-color')).toBe('blue');
        },
      });
    });
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(StyledComponentA),
      ),
    );
    const StyledComponentB = styled(props => {
      return React.createElement(styled.Div, {
        css: props.compose(styleDecoratorB({ color: 'blue' })),
        ref: (el: HTMLDivElement) => {
          expect(el.className).toBe('a b');
          const declaration = getComputedStyle(el);
          expect(declaration.getPropertyValue('background-color')).toBe('green');
          expect(declaration.getPropertyValue('color')).toBe('blue');
        },
      });
    });
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(StyledComponentB),
      ),
    );
    const treeA = mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(styled.Div, { css: styleDecoratorB }),
      ),
    );
    const declarationA = getComputedStyle(treeA.getDOMNode());
    expect(declarationA.getPropertyValue('color')).toBe('red');
    expect(declarationA.getPropertyValue('background-color')).toBe('green');
    const treeB = mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(styled.Div, { css: styleDecoratorB({ color: 'blue' }) }),
      ),
    );
    const declarationB = getComputedStyle(treeB.getDOMNode());
    expect(declarationB.getPropertyValue('background-color')).toBe('green');
    expect(declarationB.getPropertyValue('color')).toBe('blue');
  });
  it('creates `className` styled component', () => {
    const StyledComponent = styled(
      applyClassName(props => {
        expect(props.className).toBe('a');
        return React.createElement('div');
      }),
      { color: 'red' },
    );
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(StyledComponent),
      ),
    );
  });
  it('renders predefined styled component', () => {
    const Component = () =>
      React.createElement(styled.Div, {
        css: { color: 'red' },
        ref: (el: HTMLDivElement) => expect(el.className).toBe('a'),
      });
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(Component),
      ),
    );
  });
  it('assigns styled component', () => {
    const DeepComponentB = styled(styled.Span, { fontSize: '24px', ':hover': { backgroundColor: 'green' } });
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(DeepComponentB),
      ),
    );
  });
  it('composes style', () => {
    const StyledComponent = styled.div({ color: 'red' });
    const treeA = mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(StyledComponent, {
          css: { color: 'green', backgroundColor: 'red' },
        }),
      ),
    );
    const declarationA = getComputedStyle(treeA.getDOMNode());
    expect(declarationA.getPropertyValue('color')).toBe('green');
    expect(declarationA.getPropertyValue('background-color')).toBe('red');
    const ComposedComponentA = styled(
      props => {
        return React.createElement(StyledComponent, {
          css: props.compose({ color: 'green', backgroundColor: 'red' }),
        });
      },
      { color: 'blue' },
    );
    const treeB = mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(ComposedComponentA),
      ),
    );
    const declarationB = getComputedStyle(treeB.getDOMNode());
    expect(declarationB.getPropertyValue('color')).toBe('blue');
    expect(declarationB.getPropertyValue('background-color')).toBe('red');
    const ComposedComponentB = styled(
      props => {
        return React.createElement(StyledComponent, {
          css: props.compose({ color: 'green', backgroundColor: 'red' }),
        });
      },
      { color: 'blue' },
    );
    const treeC = mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(ComposedComponentB, {
          css: { color: 'white' },
        }),
      ),
    );
    const declarationC = getComputedStyle(treeC.getDOMNode());
    expect(declarationC.getPropertyValue('color')).toBe('white');
    expect(declarationC.getPropertyValue('background-color')).toBe('red');
    const ComposedComponentC = styled(
      props => {
        return React.createElement(styled.Div, {
          css: props.compose({ color: 'green', backgroundColor: 'red' }),
        });
      },
      { color: 'red' },
    );
    const treeD = mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(ComposedComponentC),
      ),
    );
    const declarationD = getComputedStyle(treeD.getDOMNode());
    expect(declarationD.getPropertyValue('color')).toBe('red');
    expect(declarationD.getPropertyValue('background-color')).toBe('red');
  });
  it('caches pure style', () => {
    let count = 0;
    let renders = 0;
    const StyledComponentPure = styled(
      class extends React.Component<StyledProps> {
        private css = {};
        public componentDidMount() {
          this.forceUpdate();
        }
        public render() {
          renders++;
          return React.createElement(styled.Div, { css: this.props.compose(this.css) });
        }
      },
      {
        get color() {
          count++;
          return 'red';
        },
      },
    );
    const css1 = {};
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(StyledComponentPure, { css: css1 }),
      ),
    );
    expect(count).toBe(1);
    expect(renders).toBe(2);
    count = 0;
    renders = 0;
    const StyledComponentMemo = styled(
      props => {
        const [, setState] = React.useState(0);
        renders++;
        const css2 = React.useMemo(() => ({ color: 'green' }), []);
        React.useEffect(() => setState(1), []);
        return React.createElement(styled.Div, { css: props.compose(css2) });
      },
      {
        get backgroundColor() {
          count++;
          return 'red';
        },
      },
    );
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(StyledComponentMemo),
      ),
    );
    expect(count).toBe(1);
    expect(renders).toBe(2);
  });
  it('renders correctly with new instance', () => {
    const StyledComponentA = styled.div({
      color: 'red',
    });
    const StyledComponentB = styled.div({
      color: 'green',
    });
    mount(
      React.createElement(
        'div',
        {},
        React.createElement(
          GlitzProvider,
          {
            glitz: new GlitzClient(),
          },
          React.createElement(StyledComponentA, {
            ref: (el: HTMLDivElement) => expect(el.className).toBe('a'),
          }),
          React.createElement(StyledComponentB, {
            ref: (el: HTMLDivElement) => expect(el.className).toBe('b'),
          }),
        ),
        React.createElement(
          GlitzProvider,
          {
            glitz: new GlitzClient(),
          },
          React.createElement(StyledComponentB, {
            ref: (el: HTMLDivElement) => expect(el.className).toBe('a'),
          }),
          React.createElement(StyledComponentA, {
            ref: (el: HTMLDivElement) => expect(el.className).toBe('b'),
          }),
        ),
      ),
    );
  });
  it('passes ref prop', () => {
    class Spy extends React.Component<StyledProps & StyledElementProps> {
      public render() {
        return React.createElement('div');
      }
    }
    const StyledComponent = styled(Spy);
    const StyledElementLike = styled(applyClassName(Spy));
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(StyledComponent, {
          ref: (el: Spy) => {
            expect(el).toBeInstanceOf(Spy);
          },
        }),
        React.createElement(StyledElementLike, {
          ref: (el: Spy) => {
            expect(el).toBeInstanceOf(Spy);
          },
        }),
        React.createElement(styled.Div, {
          ref: (el: HTMLDivElement) => {
            expect(el).toBeInstanceOf(HTMLDivElement);
          },
        }),
      ),
    );
  });
  it('passes className prop', () => {
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(styled.Div, {
          className: 'some-class',
          css: { color: 'red' },
          ref: (el: HTMLDivElement) => {
            expect(el.className).toBe('some-class a');
          },
        }),
      ),
    );
    const StyledElementLike = styled(
      applyClassName(props => {
        expect(props.className).toBe('some-class a');
        return React.createElement('div');
      }),
      { color: 'red' },
    );
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(StyledElementLike, {
          className: 'some-class',
        }),
      ),
    );
    const StyledElement = styled.div({ color: 'red' });
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(StyledElement, {
          className: 'some-class',
          ref: (el: HTMLDivElement) => {
            expect(el.className).toBe('some-class a');
          },
        }),
      ),
    );
    let renders = 0;
    class ClassNameUpdates extends React.Component {
      public state = {
        className: 'some-class',
      };
      private ref = React.createRef<HTMLDivElement>();
      public componentDidMount() {
        // @ts-ignore
        expect(this.ref.current.className).toBe('some-class a');
        this.setState({ className: 'another-class' });
      }
      public componentDidUpdate() {
        // @ts-ignore
        expect(this.ref.current.className).toBe('another-class a');
      }
      public render() {
        renders++;
        return React.createElement(StyledElement, {
          className: this.state.className,
          ref: this.ref,
        });
      }
    }
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(ClassNameUpdates),
      ),
    );
    expect(renders).toBe(2);
  });
  it('updates when theme changes', () => {
    class Theming extends React.Component {
      public state = {
        text: 'red',
      };
      public componentDidMount() {
        this.setState({ text: 'green' });
      }
      public render() {
        return React.createElement(ThemeProvider, { theme: this.state }, this.props.children);
      }
    }
    let renders = 0;
    const StyledComponent = styled(
      class extends React.Component<StyledProps> {
        private ref = React.createRef<HTMLDivElement>();
        public componentDidMount() {
          // @ts-ignore
          expect(this.ref.current.className).toBe('a');
        }
        public componentDidUpdate() {
          // @ts-ignore
          expect(this.ref.current.className).toBe('b');
        }
        public render() {
          renders++;
          return React.createElement(styled.Div, {
            css: this.props.compose(),
            ref: this.ref,
          });
        }
      },
      {
        color: (theme: any) => {
          return theme.text;
        },
      },
    );
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(Theming, null, React.createElement(StyledComponent)),
      ),
    );
    expect(renders).toBe(2);
  });
  it('styles with HOC in between', () => {
    function hoc<TProps, TInstance>(
      Component: React.ComponentType<WithRefProp<TProps, TInstance>> | React.ComponentType<TProps>,
    ) {
      return React.forwardRef<TInstance, TProps>((props, ref) =>
        React.createElement<any>(Component, { ...props, ref }),
      );
    }
    const ConnectedStyledComponentA = hoc(
      styled(
        props => {
          expect(props.compose()).toEqual([{ color: 'red' }, { backgroundColor: 'green' }]);
          return React.createElement(styled.Div, {
            css: props.compose(),
            ref: (el: HTMLDivElement) => expect(el.className).toBe('a b'),
          });
        },
        { color: 'red' },
      ),
    );
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(ConnectedStyledComponentA, { css: { backgroundColor: 'green' } }),
      ),
    );
    const ConnectedStyledComponentB = hoc(styled.div({ color: 'red' }));
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(ConnectedStyledComponentB, {
          css: { backgroundColor: 'green' },
          ref: (el: HTMLDivElement) => expect(el.className).toBe('a b'),
        }),
      ),
    );
  });
  it('warns of multiple re-renders with invalidated cache', async () => {
    const logger = (console.warn = jest.fn());
    let renders = 0;
    await new Promise(resolve => {
      const css: Style = {
        color: 'red',
      };
      const CacheValidated = class extends React.Component<StyledProps> {
        public componentDidMount() {
          requestAnimationFrame(() =>
            this.forceUpdate(() =>
              requestAnimationFrame(() =>
                this.forceUpdate(() =>
                  requestAnimationFrame(() =>
                    this.forceUpdate(() => requestAnimationFrame(() => requestAnimationFrame(resolve))),
                  ),
                ),
              ),
            ),
          );
        }

        public render() {
          renders++;
          return React.createElement(styled.Div, { css });
        }
      };
      mount(
        React.createElement(
          GlitzProvider,
          {
            glitz: new GlitzClient(),
          },
          React.createElement(CacheValidated),
        ),
      );
    });
    expect(logger).toHaveBeenCalledTimes(0);
    expect(renders).toBe(4);
    renders = 0;
    await new Promise(resolve => {
      const CacheInvalidated = class extends React.Component<StyledProps> {
        public componentDidMount() {
          requestAnimationFrame(() =>
            this.forceUpdate(() =>
              requestAnimationFrame(() =>
                requestAnimationFrame(() =>
                  this.forceUpdate(() =>
                    requestAnimationFrame(() =>
                      this.forceUpdate(() => requestAnimationFrame(() => requestAnimationFrame(resolve))),
                    ),
                  ),
                ),
              ),
            ),
          );
        }
        public render() {
          renders++;
          return React.createElement(styled.Div, { css: { color: 'red' } });
        }
      };
      mount(
        React.createElement(
          GlitzProvider,
          {
            glitz: new GlitzClient(),
          },
          React.createElement(CacheInvalidated),
        ),
      );
    });
    expect(logger).toHaveBeenCalledTimes(0);
    expect(renders).toBe(4);
    renders = 0;
    await new Promise(resolve => {
      const CacheInvalidated = class extends React.Component<StyledProps> {
        public componentDidMount() {
          requestAnimationFrame(() =>
            this.forceUpdate(() =>
              requestAnimationFrame(() =>
                this.forceUpdate(() =>
                  requestAnimationFrame(() =>
                    this.forceUpdate(() => requestAnimationFrame(() => requestAnimationFrame(resolve))),
                  ),
                ),
              ),
            ),
          );
        }
        public render() {
          renders++;
          return React.createElement(styled.Div, { css: { color: 'red' } });
        }
      };
      mount(
        React.createElement(
          GlitzProvider,
          {
            glitz: new GlitzClient(),
          },
          React.createElement(CacheInvalidated),
        ),
      );
    });
    expect(logger).toHaveBeenCalledTimes(1);
    expect(renders).toBe(4);
  });
});
