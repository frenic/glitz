// tslint:disable max-classes-per-file

import { GlitzClient } from '@glitz/core';
import { mount } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';
import GlitzProvider from './components/GlitzProvider';
import { styled, StyledProps } from './styled';

describe('react styled', () => {
  it('creates custom styled component', () => {
    const StyledComponent = styled(
      props => {
        expect(props.apply()).toBe('a');
        expect(props.compose()).toEqual([{ color: 'red' }]);
        return React.createElement('div');
      },
      { color: 'red' },
    );

    renderer.create(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(StyledComponent),
      ),
    );
  });
  it('creates embedded styled component', () => {
    const embeddedStyle = styled({ color: 'red' });

    const StyledComponent1 = embeddedStyle(props => {
      expect(props.apply()).toBe('a');
      expect(props.compose()).toEqual([{ color: 'red' }]);
      return React.createElement('div');
    });
    const StyledComponent2 = embeddedStyle(
      props => {
        expect(props.apply()).toBe('b');
        expect(props.compose()).toEqual([{ color: 'red' }, { color: 'green' }]);
        return React.createElement('div');
      },
      { color: 'green' },
    );

    renderer.create(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(StyledComponent1),
        React.createElement(StyledComponent2),
      ),
    );
  });
  it('creates predefined styled component', () => {
    const StyledComponent = styled.div({ color: 'red' });

    const tree = renderer.create(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(StyledComponent),
      ),
    );

    expect(tree).toMatchSnapshot();
  });
  it('renders predefined styled component', () => {
    const Component = () =>
      React.createElement(styled.Div, {
        css: { color: 'red' },
      });

    const tree = renderer.create(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(Component),
      ),
    );

    expect(tree).toMatchSnapshot();
  });
  it('assigns styled component', () => {
    const DeepComponentA = styled(
      props => {
        expect(props.compose()).toEqual([
          { fontSize: '18px', ':hover': { color: 'red' } },
          { fontSize: '24px', ':hover': { backgroundColor: 'green' } },
        ]);
        expect(props.apply()).toBe('a b c');
        return React.createElement('div');
      },
      { fontSize: '18px', ':hover': { color: 'red' } },
    );

    const DeepComponentB = styled(DeepComponentA, { fontSize: '24px', ':hover': { backgroundColor: 'green' } });

    renderer.create(
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

    const ComposedComponent1 = styled(props => {
      return React.createElement(StyledComponent, {
        css: props.compose({ color: 'green' }),
      });
    });

    const tree1 = mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(ComposedComponent1),
      ),
    );

    const declaration1 = getComputedStyle(tree1.getDOMNode());

    expect(declaration1.getPropertyValue('color')).toBe('green');

    const ComposedComponent2 = styled(
      props => {
        return React.createElement(StyledComponent, {
          css: props.compose({ color: 'green' }),
        });
      },
      { color: 'blue' },
    );

    const tree2 = mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(ComposedComponent2),
      ),
    );

    const declaration2 = getComputedStyle(tree2.getDOMNode());

    expect(declaration2.getPropertyValue('color')).toBe('blue');

    const ComposedComponent3 = styled(
      props => {
        return React.createElement(StyledComponent, {
          css: props.compose({ color: 'green' }),
        });
      },
      { color: 'blue' },
    );

    const root3 = mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(ComposedComponent3, {
          css: { color: 'white' },
        }),
      ),
    );

    const declaration3 = getComputedStyle(root3.getDOMNode());

    expect(declaration3.getPropertyValue('color')).toBe('white');
  });
  it('caches pure style', () => {
    let count = 0;
    let renders = 0;

    const StyledComponentCount = styled(
      class extends React.Component<StyledProps> {
        public componentDidMount() {
          this.forceUpdate();
        }
        public render() {
          renders++;
          return React.createElement('div', { className: this.props.apply() });
        }
      },
      {
        get color() {
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
        React.createElement(StyledComponentCount),
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
            innerRef: (el: HTMLDivElement) => expect(el.className).toBe('a'),
          }),
          React.createElement(StyledComponentB, {
            innerRef: (el: HTMLDivElement) => expect(el.className).toBe('b'),
          }),
        ),
        React.createElement(
          GlitzProvider,
          {
            glitz: new GlitzClient(),
          },
          React.createElement(StyledComponentB, {
            innerRef: (el: HTMLDivElement) => expect(el.className).toBe('a'),
          }),
          React.createElement(StyledComponentA, {
            innerRef: (el: HTMLDivElement) => expect(el.className).toBe('b'),
          }),
        ),
      ),
    );
  });
  it('passes innerRef prop', () => {
    class Spy extends React.Component<StyledProps> {
      public render() {
        return React.createElement('div');
      }
    }

    const StyledComponent = styled(Spy);

    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(StyledComponent, {
          innerRef: (el: Spy) => {
            expect(el).toBeInstanceOf(Spy);
          },
        }),
      ),
    );
    mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(styled.Div, {
          innerRef: (el: HTMLDivElement) => {
            expect(el).toBeInstanceOf(HTMLDivElement);
          },
        }),
      ),
    );
  });
});
