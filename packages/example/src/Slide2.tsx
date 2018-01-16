import { Rule, Style } from '@glitz/core';
import { styled } from '@glitz/react';
import * as React from 'react';

interface MyStyle extends Style {
  '@media (min-width: 320px)': Rule;
  '@media (min-width: 768px)': Rule;
}

export default function Slide2() {
  return <Text>This is</Text>;
}

const Text = styled.h1({
  // Media styles will be sorted thanks to the `mediaOrder` option
  '@media (min-width: 768px)': {
    color: 'slateblue',
    '::after': {
      content: '" slateblue"',
    },
  },
  '@media (min-width: 320px)': {
    color: 'steelblue',
    '::after': {
      content: '" steelblue"',
    },
  },
  fontSize: '5vh',
  lineHeight: '15vh',
  textAlign: 'center',
  color: 'teal',
  '::after': {
    content: '" teal"',
  },
} as MyStyle);
