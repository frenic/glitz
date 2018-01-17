import GlitzClient from '@glitz/core';
import { mount } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';
import GlitzProvider from './GlitzProvider';
import { styled, StyledProps } from './styled';

describe('react styled', () => {
  it('creates custom styled component', () => {
    const StyledComponent = styled(
      props => {
        expect(props.apply()).toBe('a');
        expect(props.compose()).toMatchObject({ color: 'red' });
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
      expect(props.compose()).toMatchObject({ color: 'red' });
      return React.createElement('div');
    });
    const StyledComponent2 = embeddedStyle(
      props => {
        expect(props.apply()).toBe('b');
        expect(props.compose()).toMatchObject({ color: 'green' });
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

    const component = renderer.create(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(StyledComponent),
      ),
    );

    const tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
  it('renders predefined styled component', () => {
    const Component = () =>
      React.createElement(styled.Div, {
        css: { color: 'red' },
      });

    const component = renderer.create(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(Component),
      ),
    );

    const tree = component.toJSON();

    expect(tree).toMatchSnapshot();
  });
  it('composes style', () => {
    const StyledComponent = styled.div({ color: 'red', background: 'green' });

    const ComposedComponent = styled(
      props => {
        return React.createElement(StyledComponent, {
          css: props.compose(),
        });
      },
      { color: 'black' },
    );

    const root = mount(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(ComposedComponent, {
          css: { background: 'white' },
        }),
      ),
    );

    const declaration = getComputedStyle(root.getDOMNode());

    expect(declaration.getPropertyValue('color')).toBe('black');
    expect(declaration.getPropertyValue('background')).toBe('white');
  });
  it('passes innerRef prop', () => {
    class Spy extends React.Component<StyledProps> {
      public render() {
        return React.createElement('div');
      }
    }

    const StyledComponent = styled<{}>(Spy);

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
