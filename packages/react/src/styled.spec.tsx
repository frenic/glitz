/**
 * @jest-environment jsdom
 */

import { GlitzClient } from '@glitz/core';
import { render } from '@testing-library/react';
import * as React from 'react';
import { GlitzProvider } from '.';
import useGlitz, { DirtyStyle } from './styled/use-glitz';
import { styled } from './styled';
import { applyClassName } from './styled/apply-class-name';
import { ThemeProvider } from './components/ThemeProvider';
import { WithRefProp } from './styled/create';
import { StyledElementProps } from './styled/predefined';
import { forwardStyle, ForwardStyleProps } from './styled/forward-style';

describe('react styled', () => {
  const warn = console.warn;
  afterEach(() => {
    console.warn = warn;
  });

  it('returns class names using style hook', () => {
    function Component() {
      const className = useGlitz({ color: 'red' });
      expect(className).toBe('a');
      return null;
    }
    renderWithGlitz(React.createElement(Component)).unmount();
  });
  it("renders styled component with no class names when there's no style", () => {
    const StyledComponent = styled(() =>
      React.createElement(styled.Div, {
        ref(el) {
          if (el) {
            expect(el.getAttribute('class')).toBeNull();
          }
        },
      }),
    );
    renderWithGlitz(React.createElement(StyledComponent)).unmount();
  });
  it('renders styled component with class names with static style', () => {
    const StyledComponent = styled(
      () =>
        React.createElement(styled.Div, {
          ref(el) {
            if (el) {
              expect(el.getAttribute('class')).toBe('a');
            }
          },
        }),
      { color: 'red' },
    );
    renderWithGlitz(React.createElement(StyledComponent)).unmount();
  });
  it('renders styled component with class names with css prop style', () => {
    const StyledComponent = styled(() =>
      React.createElement(styled.Div, {
        ref(el) {
          if (el) {
            expect(el.getAttribute('class')).toBe('a');
          }
        },
      }),
    );
    renderWithGlitz(React.createElement(StyledComponent, { css: { color: 'red' } })).unmount();
  });
  it('renders styled component with no class names on child element', () => {
    const StyledComponent = styled(() =>
      React.createElement(
        styled.Div,
        {
          ref(el) {
            if (el) {
              expect(el.getAttribute('class')).toBe('a');
            }
          },
        },
        React.createElement(styled.Div, {
          ref(el) {
            if (el) {
              expect(el.getAttribute('class')).toBeNull();
            }
          },
        }),
      ),
    );
    renderWithGlitz(React.createElement(StyledComponent, { css: { color: 'red' } })).unmount();
  });
  it('re-renders styled component with memoized class names', async () => {
    let updates = 0;
    let renders = 0;
    const StyledComponent = styled(
      React.memo(() => {
        renders++;
        return React.createElement(styled.Div, {
          ref(el) {
            if (el) {
              expect(el.getAttribute('class')).toBe('a');
            }
          },
        });
      }),
      { color: 'red' },
    );
    const { unmount } = renderWithGlitz(
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
    );
    expect(updates).toBe(2);
    expect(renders).toBe(1);
    unmount();
  });
  it('renders styled component with forwardRef', () => {
    const StyledComponent = styled(
      React.forwardRef(({}: {}, ref: React.Ref<HTMLDivElement>) =>
        React.createElement(styled.Div, {
          ref,
        }),
      ),
      { color: 'red' },
    );
    renderWithGlitz(
      React.createElement(StyledComponent, {
        ref(el) {
          if (el) {
            expect(el.className).toBe('a');
          }
        },
      }),
    ).unmount();
  });
  it('creates decorated styled component', () => {
    const styleDecoratorA = styled({ color: 'red' });
    const styleDecoratorB = styleDecoratorA({ backgroundColor: 'green' });
    const StyledComponentA = styleDecoratorB(() => {
      return React.createElement(styled.Div, {
        ref(el) {
          if (el) {
            expect(el.className).toBe('a b');
          }
        },
      });
    });
    const StyledComponentB = styleDecoratorB(
      () => {
        return React.createElement(styled.Div, {
          ref(el) {
            if (el) {
              expect(el.className).toBe('c a');
            }
          },
        });
      },
      { color: 'green' },
    );
    renderWithGlitz(
      React.createElement(
        React.Fragment,
        null,
        React.createElement(StyledComponentA),
        React.createElement(StyledComponentB),
      ),
    ).unmount();
  });
  it('creates predefined styled component', () => {
    const StyledComponent = styled.div({ color: 'red' });
    renderWithGlitz(
      React.createElement(StyledComponent, {
        ref(el) {
          if (el) {
            expect(el.className).toBe('a');
          }
        },
      }),
    ).unmount();
  });
  it('decorates style', () => {
    const styleDecoratorA = styled({ color: 'red' });
    const styleDecoratorB = styled(styleDecoratorA(), { backgroundColor: 'green' });
    const styleDecoratorC = styled(styleDecoratorB(), { borderLeftColor: 'blue' });
    expect(styleDecoratorC()).toEqual([{ color: 'red' }, { backgroundColor: 'green' }, { borderLeftColor: 'blue' }]);
    const StyledComponentA = styled(() => {
      return React.createElement(StyledTestDiv, {
        css: styleDecoratorC(),
        ref(el) {
          if (el) {
            expect(el.className).toBe('a b c');
            const declaration = getComputedStyle(el);
            expect(declaration.getPropertyValue('color')).toBe('red');
            expect(declaration.getPropertyValue('background-color')).toBe('green');
            expect(declaration.getPropertyValue('border-left-color')).toBe('blue');
          }
        },
      });
    });
    renderWithGlitz(React.createElement(StyledComponentA)).unmount();

    const StyledComponentB = styled(() => {
      return React.createElement(StyledTestDiv, {
        css: styled(styleDecoratorB(), { color: 'blue' }),
        ref(el) {
          if (el) {
            expect(el.className).toBe('a b');
            const declaration = getComputedStyle(el);
            expect(declaration.getPropertyValue('background-color')).toBe('green');
            expect(declaration.getPropertyValue('color')).toBe('blue');
          }
        },
      });
    });
    renderWithGlitz(React.createElement(StyledComponentB)).unmount();

    const declarationA = getComputedStyleFromStyledComponent(styleDecoratorB());
    expect(declarationA.getPropertyValue('color')).toBe('red');
    expect(declarationA.getPropertyValue('background-color')).toBe('green');

    const declarationB = getComputedStyleFromStyledComponent(styled(styleDecoratorB(), { color: 'blue' }));
    expect(declarationB.getPropertyValue('background-color')).toBe('green');
    expect(declarationB.getPropertyValue('color')).toBe('blue');

    const declarationC = getComputedStyleFromStyledComponent(
      undefined,
      styled(StyledTestDiv, styleDecoratorB(), { color: 'blue' }),
    );
    expect(declarationC.getPropertyValue('background-color')).toBe('green');
    expect(declarationC.getPropertyValue('color')).toBe('blue');
  });
  it('applies class names to element-like components', () => {
    const StyledComponent = styled(
      applyClassName(props => {
        expect(props.className).toBe('a');
        return React.createElement('div');
      }),
      { color: 'red' },
    );
    renderWithGlitz(React.createElement(StyledComponent)).unmount();
  });
  it('renders predefined styled component', () => {
    const Component = () =>
      React.createElement(styled.Div, {
        css: { color: 'red' },
        ref(el) {
          if (el) {
            expect(el.className).toBe('a');
          }
        },
      });
    renderWithGlitz(React.createElement(Component)).unmount();
  });
  it('composes style', () => {
    const StyledComponent = styled(StyledTestDiv, { color: 'red' });
    const declarationA = getComputedStyleFromStyledComponent(
      { color: 'green', backgroundColor: 'red' },
      StyledComponent,
    );
    expect(declarationA.getPropertyValue('color')).toBe('green');
    expect(declarationA.getPropertyValue('background-color')).toBe('red');

    const ComposedComponentB = styled(
      props => <StyledComponent {...props} css={{ color: 'green', backgroundColor: 'red' }} />,
      { color: 'blue' },
    );
    const declarationB = getComputedStyleFromStyledComponent(undefined, ComposedComponentB);
    expect(declarationB.getPropertyValue('color')).toBe('blue');
    expect(declarationB.getPropertyValue('background-color')).toBe('red');

    const ComposedComponentC = styled(
      props => <StyledComponent {...props} css={{ color: 'green', backgroundColor: 'red' }} />,
      { color: 'blue' },
    );
    const declarationC = getComputedStyleFromStyledComponent({ color: 'white' }, ComposedComponentC);
    expect(declarationC.getPropertyValue('color')).toBe('white');
    expect(declarationC.getPropertyValue('background-color')).toBe('red');

    const ComposedComponentD = styled(
      props => <StyledTestDiv {...props} css={{ color: 'green', backgroundColor: 'red' }} />,
      { color: 'red' },
    );
    const declarationD = getComputedStyleFromStyledComponent(undefined, ComposedComponentD);
    expect(declarationD.getPropertyValue('color')).toBe('red');
    expect(declarationD.getPropertyValue('background-color')).toBe('red');

    const ComposedComponentE1 = styled(props => <StyledTestDiv {...props} />);
    const ComposedComponentE2 = styled(props => <ComposedComponentE1 {...props} />);
    const declarationE = getComputedStyleFromStyledComponent({ backgroundColor: 'red' }, ComposedComponentE2);
    expect(declarationE.getPropertyValue('color')).toBe('red');
    expect(declarationE.getPropertyValue('background-color')).toBe('red');
  });
  it('caches pure style', () => {
    let parses = 0;
    let renders = 0;
    const StyledComponent = styled(() => {
      const [, setState] = React.useState(0);
      React.useEffect(() => setState(1), []);
      renders++;
      return React.createElement(styled.Div, {
        css: {
          get color() {
            parses++;
            return 'red';
          },
        },
      });
    });
    renderWithGlitz(React.createElement(StyledComponent)).unmount();
    expect(parses).toBe(2);
    expect(renders).toBe(2);

    parses = 0;
    renders = 0;
    const StyledComponentPure = styled(() => {
      const [, setState] = React.useState(0);
      React.useEffect(() => setState(1), []);
      renders++;
      return React.createElement(styled.Div, { css: cssA1 });
    });
    const cssA1 = {
      get color() {
        parses++;
        return 'red';
      },
    };
    const cssA2 = {};
    renderWithGlitz(React.createElement(StyledComponentPure, { css: cssA2 })).unmount();
    expect(parses).toBe(1);
    expect(renders).toBe(2);

    parses = 0;
    renders = 0;
    const StyledComponentMemo = styled(() => {
      const [, setState] = React.useState(0);
      renders++;
      const cssB = React.useMemo(
        () => ({
          get color() {
            parses++;
            return 'red';
          },
        }),
        [],
      );
      React.useEffect(() => setState(1), []);
      return React.createElement(styled.Div, { css: cssB });
    });
    renderWithGlitz(React.createElement(StyledComponentMemo)).unmount();
    expect(parses).toBe(1);
    expect(renders).toBe(2);
  });
  it('renders correctly with new instance', () => {
    const StyledComponentA = styled.div({
      color: 'red',
    });
    const StyledComponentB = styled.div({
      color: 'green',
    });
    render(
      React.createElement(
        'div',
        {},
        React.createElement(
          GlitzProvider,
          {
            glitz: new GlitzClient(),
          },
          React.createElement(StyledComponentA, {
            ref(el) {
              if (el) {
                expect(el.className).toBe('a');
              }
            },
          }),
          React.createElement(StyledComponentB, {
            ref(el) {
              if (el) {
                expect(el.className).toBe('b');
              }
            },
          }),
        ),
        React.createElement(
          GlitzProvider,
          {
            glitz: new GlitzClient(),
          },
          React.createElement(StyledComponentB, {
            ref(el) {
              if (el) {
                expect(el.className).toBe('a');
              }
            },
          }),
          React.createElement(StyledComponentA, {
            ref(el) {
              if (el) {
                expect(el.className).toBe('b');
              }
            },
          }),
        ),
      ),
    );
  });
  it('passes ref prop', () => {
    class Spy extends React.Component<StyledElementProps> {
      public render() {
        return React.createElement('div');
      }
    }
    const StyledComponent = styled(Spy);
    const StyledElementLike = styled(applyClassName(Spy));
    renderWithGlitz(
      React.createElement(
        React.Fragment,
        null,
        React.createElement(StyledComponent, {
          ref(el) {
            if (el) {
              expect(el).toBeInstanceOf(Spy);
            }
          },
        }),
        React.createElement(StyledElementLike, {
          ref(el) {
            if (el) {
              expect(el).toBeInstanceOf(Spy);
            }
          },
        }),
        React.createElement(styled.Div, {
          ref(el) {
            if (el) {
              expect(el).toBeInstanceOf(HTMLDivElement);
            }
          },
        }),
      ),
    ).unmount();
  });
  it('passes className prop', () => {
    renderWithGlitz(
      React.createElement(styled.Div, {
        className: 'some-class',
        css: { color: 'red' },
        ref(el) {
          if (el) {
            expect(el.className).toBe('some-class a');
          }
        },
      }),
    ).unmount();

    const StyledElementLike = styled(
      applyClassName(props => {
        expect(props.className).toBe('some-class a');
        return React.createElement('div');
      }),
      { color: 'red' },
    );
    renderWithGlitz(
      React.createElement(StyledElementLike, {
        className: 'some-class',
      }),
    ).unmount();

    const StyledElement = styled(StyledTestDiv, { color: 'red' });
    renderWithGlitz(
      React.createElement(StyledElement, {
        className: 'some-class',
        ref(el) {
          if (el) {
            expect(el.className).toBe('some-class a');
          }
        },
      }),
    ).unmount();

    const [getElement, { rerender, unmount }] = renderWithTestId(<StyledElement className="some-class" />);

    expect(getElement().className).toBe('some-class a');

    rerender(<StyledElement className="another-class" />);

    expect(getElement().className).toBe('another-class a');

    unmount();
  });
  it('updates when theme changes', () => {
    const StyledComponent = styled(StyledTestDiv, {
      color(theme: any) {
        return theme.color;
      },
    });

    const [getElement, { rerender, unmount }] = renderWithTestId(
      <ThemeProvider theme={{ color: 'red' }}>
        <StyledComponent />
      </ThemeProvider>,
    );

    expect(getElement().className).toBe('a');

    rerender(
      <ThemeProvider theme={{ color: 'green' }}>
        <StyledComponent />
      </ThemeProvider>,
    );

    expect(getElement().className).toBe('b');

    unmount();
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
        ({}: {}) =>
          React.createElement(styled.Div, {
            ref(el) {
              if (el) {
                expect(el.className).toBe('a b');
              }
            },
          }),
        { color: 'red' },
      ),
    );
    renderWithGlitz(React.createElement(ConnectedStyledComponentA, { css: { backgroundColor: 'green' } })).unmount();

    const ConnectedStyledComponentB = hoc(styled.div({ color: 'red' }));
    renderWithGlitz(
      React.createElement(ConnectedStyledComponentB, {
        css: { backgroundColor: 'green' },
        ref(el) {
          if (el) {
            expect(el.className).toBe('a b');
          }
        },
      }),
    ).unmount();
  });
  it('warns of multiple re-renders with invalidated cache', async () => {
    const createAnimationSimulator =
      (count: number, update: (callback?: (() => void) | undefined) => void, resolve: () => void) => () => {
        let updates = 0;
        const frame = () =>
          requestAnimationFrame(() => {
            if (updates < count) {
              updates++;
              update(frame);
            } else {
              requestAnimationFrame(() => resolve());
            }
          });
        frame();
      };

    let renders = 0;
    const logger = (console.warn = jest.fn());
    await new Promise<void>(resolve => {
      const css = {
        color: 'red',
      };
      const CacheValidated = class extends React.Component {
        public componentDidMount = createAnimationSimulator(
          5,
          callback => this.forceUpdate(callback),
          () => {
            unmount();
            resolve();
          },
        );
        public render() {
          renders++;
          return React.createElement(styled.Div, { css });
        }
      };
      const { unmount } = renderWithGlitz(React.createElement(CacheValidated));
    });
    expect(renders).toBe(6);
    expect(logger).toHaveBeenCalledTimes(0);

    renders = 0;
    await new Promise<void>(resolve => {
      const CacheInvalidated = class extends React.Component {
        public componentDidMount = createAnimationSimulator(
          4,
          callback => this.forceUpdate(callback),
          () => {
            unmount();
            resolve();
          },
        );
        public render() {
          renders++;
          return React.createElement(styled.Div, { css: { color: 'red' } });
        }
      };
      const { unmount } = renderWithGlitz(React.createElement(CacheInvalidated));
    });
    expect(renders).toBe(5);
    expect(logger).toHaveBeenCalledTimes(0);

    renders = 0;
    await new Promise<void>(resolve => {
      const CacheInvalidated = class extends React.Component {
        public componentDidMount = createAnimationSimulator(
          5,
          callback => this.forceUpdate(callback),
          () => {
            unmount();
            resolve();
          },
        );
        public render() {
          renders++;
          return React.createElement(styled.Div, { css: { color: 'red' } });
        }
      };
      const { unmount } = renderWithGlitz(React.createElement(CacheInvalidated));
    });
    expect(renders).toBe(6);
    expect(logger).toHaveBeenCalledTimes(1);
  });
  it('inherits default props when composing', () => {
    const StyledComponent = styled(styled.Button);
    StyledComponent.defaultProps = { type: 'button' };

    const ComposedComponent = styled(StyledComponent);
    expect(ComposedComponent.defaultProps).toEqual({ type: 'button' });
  });
  it('inherits display name when composing', () => {
    const StyledComponent = styled(styled.Button);
    expect(StyledComponent.displayName).toBe('Styled(button)');

    StyledComponent.displayName = 'Test';

    const ComposedComponent = styled(StyledComponent);
    expect(ComposedComponent.displayName).toBe('Test');
  });
  it('does not trigger update on child elements when style changes', () => {
    let renders = 0;
    const Child = styled(
      React.memo(() => {
        renders++;
        return React.createElement(styled.Div);
      }),
    );

    const StyledComponent = styled(() => React.createElement(styled.Div, null, React.createElement(Child)));

    const css = { color: 'red' };

    const { rerender, unmount } = renderWithGlitz(<StyledComponent css={css} />);
    expect(renders).toBe(1);

    rerender(<StyledComponent css={css} />);
    expect(renders).toBe(1);

    rerender(<StyledComponent css={{ color: 'red' }} />);
    expect(renders).toBe(1);

    rerender(<StyledComponent css={{ color: 'green' }} />);
    expect(renders).toBe(1);

    unmount();
  });
  it('creates an empty decorator', () => {
    let decorator = styled();

    decorator = decorator({ color: 'red' });
    decorator = decorator({ backgroundColor: 'green' });
    expect(decorator()).toEqual([{ color: 'red' }, { backgroundColor: 'green' }]);
  });
  it('forwards style using hook', () => {
    const Component = styled(forwardStyle(({ compose }: ForwardStyleProps) => <StyledTestDiv css={compose()} />));
    const [getElement, { rerender, unmount }] = renderWithTestId(<Component css={{ color: 'red' }} />);
    expect(getElement().className).toBe('a');
    rerender(<Component css={{ color: 'green' }} />);
    expect(getElement().className).toBe('b');
    unmount();
  });
});

const TEST_ID = 'styled';

const StyledTestDiv = styled.div();
StyledTestDiv.defaultProps = { ['data-testid' as string]: TEST_ID };

function renderWithGlitz(node: React.ReactElement) {
  const glitz = new GlitzClient();
  return render(node, {
    wrapper({ children }) {
      return <GlitzProvider glitz={glitz}>{children}</GlitzProvider>;
    },
  });
}

function renderWithTestId(element: React.ReactElement) {
  const result = renderWithGlitz(element);
  return [() => result.getByTestId(TEST_ID), result] as const;
}

function getComputedStyleFromStyledComponent(css: DirtyStyle, Styled = StyledTestDiv) {
  const [getElement, { unmount }] = renderWithTestId(<Styled css={css} />);
  const declarations = getComputedStyle(getElement());
  unmount();
  return declarations;
}
