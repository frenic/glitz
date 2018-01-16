import { styled } from '@glitz/react';
import * as React from 'react';

export default function Slide2() {
  return (
    <div>
      <ButtonTeal>Teal</ButtonTeal>
      <ButtonSlateblue>Slateblue</ButtonSlateblue>
      <ButtonSteelblue>Steelblue</ButtonSteelblue>
    </div>
  );
}

const buttonStyled = styled({
  border: 'none',
  width: 'auto',
  overflow: 'visible',
  color: 'white',
  font: 'inherit',
  lineHeight: 'normal',
  paddingTop: 10,
  paddingBottom: 10,
  paddingRight: 20,
  paddingLeft: 20,
});

const ButtonTeal = buttonStyled(props => (
  <styled.Button css={props.compose({ backgroundColor: 'teal' })}>{props.children}</styled.Button>
));

const ButtonSlateblue = buttonStyled(props => (
  <styled.Button css={props.compose({ backgroundColor: 'slateblue' })}>{props.children}</styled.Button>
));

const ButtonSteelblue = buttonStyled(props => (
  <styled.Button css={props.compose({ backgroundColor: 'steelblue' })}>{props.children}</styled.Button>
));
