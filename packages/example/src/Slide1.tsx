import { styled } from '@glitz/react';
import * as React from 'react';

export default function Slide1() {
  return (
    <ShiftingColors>
      <Gradient />
      <Text>Glitz</Text>
    </ShiftingColors>
  );
}

const ShiftingColors = styled.div({
  position: 'relative',
  height: '50vh',
  overflow: 'hidden',
});

const Text = styled.h1({
  position: 'absolute',
  top: '50%',
  left: '50%',
  lineHeight: '15vh',
  font: {
    family: '"Paytone One", sans-serif',
    size: '15vh',
  },
  color: 'white',
  willChange: 'transform',
  transform: 'translate(-50%, -50%)',
});

const Gradient = styled.div({
  height: '250vh',
  backgroundImage: 'linear-gradient(to bottom, slateblue, steelblue, teal, slateblue, steelblue)',
  animation: {
    name: {
      from: {
        transform: 'translateY(-80%)',
      },
      to: {
        transform: 'translateY(0)',
      },
    },
    timingFunction: 'linear',
    duration: '8s',
    iterationCount: 'infinite',
  },
});
