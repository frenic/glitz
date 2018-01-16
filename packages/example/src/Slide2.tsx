import { Style } from '@glitz/core';
import { styled } from '@glitz/react';
import * as React from 'react';

export default function Slide1() {
  return <Text>@media</Text>;
}

const Text = styled.h1({
  // Media styles will be sorted thanks to the `mediaOrder` option
  '@media (min-width: 768px)': {
    color: 'slateblue',
  },
  '@media (min-width: 320px)': {
    color: 'steelblue',
  },
  color: 'teal',
  fontSize: '5vh',
  lineHeight: '15vh',
  textAlign: 'center',
} as Style);
