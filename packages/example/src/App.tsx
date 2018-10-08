import { styled } from '@glitz/react';
import * as React from 'react';
import Slide1 from './Slide1';
import Slide2 from './Slide2';

export default function App() {
  return (
    <Main>
      <Slide1 />
      <Slide2 />
    </Main>
  );
}

const Main = styled.main({
  height: '100vh',
  backgroundColor: 'ghostwhite',
  font: {
    family: 'sans-serif',
    weight: 'lighter',
  },
});
