import { media } from '@glitz/core';
import { styled } from '@glitz/react';
import * as React from 'react';
import { minDesktop, minTablet } from './queries';

export default function Slide1() {
  return <Text>@media</Text>;
}

const Text = styled.h1({
  // Media styles will be sorted thanks to the `mediaOrder` option
  ...media(minDesktop, {
    color: 'slateblue',
  }),
  ...media(minTablet, {
    color: 'steelblue',
  }),
  color: 'teal',
  fontSize: '5vh',
  lineHeight: '15vh',
  textAlign: 'center',
});
