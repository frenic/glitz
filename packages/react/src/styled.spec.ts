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
  it('assigns styled component', () => {
    const StyledComponent = styled(
      props => {
        expect(props.apply()).toBe('a b c');
        expect(props.compose()).toEqual([
          { color: 'red', fontSize: '18px' },
          { fontSize: '24px', backgroundColor: 'green' },
        ]);
        return React.createElement('div');
      },
      { color: 'red', fontSize: '18px' },
    );

    const AssignedComponent = styled(StyledComponent, { fontSize: '24px', backgroundColor: 'green' });

    renderer.create(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(AssignedComponent),
      ),
    );
  });
  it('composes style', () => {
    const StyledComponent = styled.div({ color: 'red', backgroundColor: 'green' });

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
          css: { backgroundColor: 'white' },
        }),
      ),
    );

    const declaration = getComputedStyle(root.getDOMNode());

    expect(declaration.getPropertyValue('color')).toBe('black');
    expect(declaration.getPropertyValue('background-color')).toBe('white');
  });
  it('caches pure style', () => {
    let count = 0;

    const StyledComponent = styled.div({
      get color() {
        count++;
        return 'red';
      },
    });

    renderer.create(
      React.createElement(
        GlitzProvider,
        {
          glitz: new GlitzClient(),
        },
        React.createElement(StyledComponent),
        React.createElement(StyledComponent),
      ),
    );

    expect(count).toBe(1);
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
