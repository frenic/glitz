// tslint:disable max-classes-per-file

import { GlitzClient } from '@glitz/core';
import { mount } from 'enzyme';
import * as React from 'react';
import { GlitzProvider } from './';
import useGlitz from './styled/use-glitz';
import { styled } from './styled';
import { applyClassName } from './styled/apply-class-name';
import { StyledElementProps } from './styled/types';
import { ThemeProvider } from './components/ThemeProvider';
import { WithRefProp } from './styled/create';

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
    mountWithGlitz(React.createElement(Component));
  });
  it("renders styled component with no class names when there's no style", () => {
    const StyledComponent = styled(() =>
      React.createElement(styled.Div, {
        ref: (el: HTMLDivElement) => expect(el.getAttribute('class')).toBeNull(),
      }),
    );
    mountWithGlitz(React.createElement(StyledComponent));
  });
  it('renders styled component with class names with static style', () => {
    const StyledComponent = styled(
      () =>
        React.createElement(styled.Div, {
          ref: (el: HTMLDivElement) => expect(el.getAttribute('class')).toBe('a'),
        }),
      { color: 'red' },
    );
    mountWithGlitz(React.createElement(StyledComponent));
  });
  it('renders styled component with class names with css prop style', () => {
    const StyledComponent = styled(() =>
      React.createElement(styled.Div, {
        ref: (el: HTMLDivElement) => expect(el.getAttribute('class')).toBe('a'),
      }),
    );
    mountWithGlitz(React.createElement(StyledComponent, { css: { color: 'red' } }));
  });
  it('renders styled component with no class names on child element', () => {
    const StyledComponent = styled(() =>
      React.createElement(
        styled.Div,
        {
          ref: (el: HTMLDivElement) => expect(el.getAttribute('class')).toBe('a'),
        },
        React.createElement(styled.Div, {
          ref: (el: HTMLDivElement) => expect(el.getAttribute('class')).toBeNull(),
        }),
      ),
    );
    mountWithGlitz(React.createElement(StyledComponent, { css: { color: 'red' } }));
  });
  it('re-renders styled component with memoized class names', async () => {
    let updates = 0;
    let renders = 0;
    const StyledComponent = styled(
      React.memo(() => {
        renders++;
        return React.createElement(styled.Div, {
          ref: (el: HTMLDivElement) => expect(el.getAttribute('class')).toBe('a'),
        });
      }),
      { color: 'red' },
    );
    mountWithGlitz(
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
    mountWithGlitz(
      React.createElement(StyledComponent, { ref: (el: HTMLDivElement) => expect(el.className).toBe('a') }),
    );
  });
  it('creates decorated styled component', () => {
    const styleDecoratorA = styled({ color: 'red' });
    const styleDecoratorB = styleDecoratorA({ backgroundColor: 'green' });
    const StyledComponentA = styleDecoratorB(() => {
      return React.createElement(styled.Div, {
        ref: (el: HTMLDivElement) => expect(el.className).toBe('a b'),
      });
    });
    const StyledComponentB = styleDecoratorB(
      () => {
        return React.createElement(styled.Div, {
          ref: (el: HTMLDivElement) => expect(el.className).toBe('b c'),
        });
      },
      { color: 'green' },
    );
    mountWithGlitz(
      React.createElement(
        React.Fragment,
        null,
        React.createElement(StyledComponentA),
        React.createElement(StyledComponentB),
      ),
    );
  });
  it('creates predefined styled component', () => {
    const StyledComponent = styled.div({ color: 'red' });
    mountWithGlitz(
      React.createElement(StyledComponent, {
        ref: (el: HTMLDivElement) => expect(el.className).toBe('a'),
      }),
    );
  });
  it('decorates style', () => {
    const styleDecoratorA = styled({ color: 'red' });
    const styleDecoratorB = styleDecoratorA({ backgroundColor: 'green' });
    const styleDecoratorC = styleDecoratorB(styled({ borderLeftColor: 'blue' })());
    expect(styleDecoratorC()).toEqual([{ color: 'red' }, { backgroundColor: 'green' }, { borderLeftColor: 'blue' }]);
    const StyledComponentA = styled(() => {
      return React.createElement(styled.Div, {
        css: styleDecoratorC,
        ref: (el: HTMLDivElement) => {
          expect(el.className).toBe('a b c');
          const declaration = getComputedStyle(el);
          expect(declaration.getPropertyValue('color')).toBe('red');
          expect(declaration.getPropertyValue('background-color')).toBe('green');
          expect(declaration.getPropertyValue('border-left-color')).toBe('blue');
        },
      });
    });
    mountWithGlitz(React.createElement(StyledComponentA));

    const StyledComponentB = styled(() => {
      return React.createElement(styled.Div, {
        css: styleDecoratorB({ color: 'blue' }),
        ref: (el: HTMLDivElement) => {
          expect(el.className).toBe('a b');
          const declaration = getComputedStyle(el);
          expect(declaration.getPropertyValue('background-color')).toBe('green');
          expect(declaration.getPropertyValue('color')).toBe('blue');
        },
      });
    });
    mountWithGlitz(React.createElement(StyledComponentB));

    const treeA = mountWithGlitz(React.createElement(styled.Div, { css: styleDecoratorB }));
    const declarationA = getComputedStyle(treeA.getDOMNode());
    expect(declarationA.getPropertyValue('color')).toBe('red');
    expect(declarationA.getPropertyValue('background-color')).toBe('green');

    const treeB = mountWithGlitz(React.createElement(styled.Div, { css: styleDecoratorB({ color: 'blue' }) }));
    const declarationB = getComputedStyle(treeB.getDOMNode());
    expect(declarationB.getPropertyValue('background-color')).toBe('green');
    expect(declarationB.getPropertyValue('color')).toBe('blue');
  });
  it('applies class names to element-like components', () => {
    const StyledComponent = styled(
      applyClassName(props => {
        expect(props.className).toBe('a');
        return React.createElement('div');
      }),
      { color: 'red' },
    );
    mountWithGlitz(React.createElement(StyledComponent));
  });
  it('renders predefined styled component', () => {
    const Component = () =>
      React.createElement(styled.Div, {
        css: { color: 'red' },
        ref: (el: HTMLDivElement) => expect(el.className).toBe('a'),
      });
    mountWithGlitz(React.createElement(Component));
  });
  it('composes style', () => {
    const StyledComponent = styled.div({ color: 'red' });
    const treeA = mountWithGlitz(
      React.createElement(StyledComponent, {
        css: { color: 'green', backgroundColor: 'red' },
      }),
    );
    const declarationA = getComputedStyle(treeA.getDOMNode());
    expect(declarationA.getPropertyValue('color')).toBe('green');
    expect(declarationA.getPropertyValue('background-color')).toBe('red');

    const ComposedComponentA = styled(
      () =>
        React.createElement(StyledComponent, {
          css: { color: 'green', backgroundColor: 'red' },
        }),
      { color: 'blue' },
    );
    const treeB = mountWithGlitz(React.createElement(ComposedComponentA));
    const declarationB = getComputedStyle(treeB.getDOMNode());
    expect(declarationB.getPropertyValue('color')).toBe('blue');
    expect(declarationB.getPropertyValue('background-color')).toBe('red');

    const ComposedComponentB = styled(
      () =>
        React.createElement(StyledComponent, {
          css: { color: 'green', backgroundColor: 'red' },
        }),
      { color: 'blue' },
    );
    const treeC = mountWithGlitz(
      React.createElement(ComposedComponentB, {
        css: { color: 'white' },
      }),
    );
    const declarationC = getComputedStyle(treeC.getDOMNode());
    expect(declarationC.getPropertyValue('color')).toBe('white');
    expect(declarationC.getPropertyValue('background-color')).toBe('red');

    const ComposedComponentC = styled(
      () =>
        React.createElement(styled.Div, {
          css: { color: 'green', backgroundColor: 'red' },
        }),
      { color: 'red' },
    );
    const treeD = mountWithGlitz(React.createElement(ComposedComponentC));
    const declarationD = getComputedStyle(treeD.getDOMNode());
    expect(declarationD.getPropertyValue('color')).toBe('red');
    expect(declarationD.getPropertyValue('background-color')).toBe('red');
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
    mountWithGlitz(React.createElement(StyledComponent));
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
    mountWithGlitz(React.createElement(StyledComponentPure, { css: cssA2 }));
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
    mountWithGlitz(React.createElement(StyledComponentMemo));
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
    class Spy extends React.Component<StyledElementProps> {
      public render() {
        return React.createElement('div');
      }
    }
    const StyledComponent = styled(Spy);
    const StyledElementLike = styled(applyClassName(Spy));
    mountWithGlitz(
      React.createElement(
        React.Fragment,
        null,
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
    mountWithGlitz(
      React.createElement(styled.Div, {
        className: 'some-class',
        css: { color: 'red' },
        ref: (el: HTMLDivElement) => {
          expect(el.className).toBe('some-class a');
        },
      }),
    );

    const StyledElementLike = styled(
      applyClassName(props => {
        expect(props.className).toBe('some-class a');
        return React.createElement('div');
      }),
      { color: 'red' },
    );
    mountWithGlitz(
      React.createElement(StyledElementLike, {
        className: 'some-class',
      }),
    );

    const StyledElement = styled.div({ color: 'red' });
    mountWithGlitz(
      React.createElement(StyledElement, {
        className: 'some-class',
        ref: (el: HTMLDivElement) => {
          expect(el.className).toBe('some-class a');
        },
      }),
    );

    class ClassNameUpdates extends React.Component {
      public state = {
        className: 'some-class',
      };
      public render() {
        return React.createElement(StyledElement, {
          className: this.state.className,
        });
      }
    }

    const tree = mountWithGlitz(React.createElement(ClassNameUpdates));

    expect(tree.getDOMNode().className).toBe('some-class a');

    tree.setState({ className: 'another-class' });

    expect(tree.getDOMNode().className).toBe('another-class a');
  });
  it('updates when theme changes', () => {
    class Theming extends React.Component {
      public state = {
        color: 'red',
      };
      public render() {
        return React.createElement(ThemeProvider, { theme: this.state }, this.props.children);
      }
    }

    const StyledComponent = styled(styled.Div, {
      color(theme: any) {
        return theme.color;
      },
    });

    const tree = mountWithGlitz(React.createElement(Theming, null, React.createElement(StyledComponent)));

    expect(tree.getDOMNode().className).toBe('a');

    tree.setState({ color: 'green' });

    expect(tree.getDOMNode().className).toBe('b');
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
            ref: (el: HTMLDivElement) => expect(el.className).toBe('a b'),
          }),
        { color: 'red' },
      ),
    );
    mountWithGlitz(React.createElement(ConnectedStyledComponentA, { css: { backgroundColor: 'green' } }));

    const ConnectedStyledComponentB = hoc(styled.div({ color: 'red' }));
    mountWithGlitz(
      React.createElement(ConnectedStyledComponentB, {
        css: { backgroundColor: 'green' },
        ref: (el: HTMLDivElement) => expect(el.className).toBe('a b'),
      }),
    );
  });
  it('warns of multiple re-renders with invalidated cache', async () => {
    const createAnimationSimulator = (
      count: number,
      update: (callback?: (() => void) | undefined) => void,
      resolve: () => void,
    ) => () => {
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
    await new Promise(resolve => {
      const css = {
        color: 'red',
      };
      const CacheValidated = class extends React.Component {
        public componentDidMount = createAnimationSimulator(5, callback => this.forceUpdate(callback), resolve);
        public render() {
          renders++;
          return React.createElement(styled.Div, { css });
        }
      };
      mountWithGlitz(React.createElement(CacheValidated));
    });
    expect(renders).toBe(6);
    expect(logger).toHaveBeenCalledTimes(0);

    renders = 0;
    await new Promise(resolve => {
      const CacheInvalidated = class extends React.Component {
        public componentDidMount = createAnimationSimulator(4, callback => this.forceUpdate(callback), resolve);
        public render() {
          renders++;
          return React.createElement(styled.Div, { css: { color: 'red' } });
        }
      };
      mountWithGlitz(React.createElement(CacheInvalidated));
    });
    expect(renders).toBe(5);
    expect(logger).toHaveBeenCalledTimes(0);

    renders = 0;
    await new Promise(resolve => {
      const CacheInvalidated = class extends React.Component {
        public componentDidMount = createAnimationSimulator(5, callback => this.forceUpdate(callback), resolve);
        public render() {
          renders++;
          return React.createElement(styled.Div, { css: { color: 'red' } });
        }
      };
      mountWithGlitz(React.createElement(CacheInvalidated));
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

    const tree = mountWithGlitz(React.createElement(StyledComponent, { css }));
    expect(renders).toBe(1);

    tree.setProps({ css });
    expect(renders).toBe(1);

    tree.setProps({ css: { color: 'red' } });
    expect(renders).toBe(1);

    tree.setProps({ css: { color: 'green' } });
    expect(renders).toBe(1);
  });
  it('creates an empty decorator', () => {
    let decorator = styled();

    decorator = decorator({ color: 'red' });
    decorator = decorator({ backgroundColor: 'green' });
    expect(decorator()).toEqual([{ color: 'red' }, { backgroundColor: 'green' }]);
  });
});

function mountWithGlitz(node: React.ReactElement) {
  return mount(node, {
    wrappingComponent: GlitzProvider,
    wrappingComponentProps: {
      glitz: new GlitzClient(),
    },
  });
}
