import { styled } from '@glitz/react';
import * as React from 'react';
import Slide1 from './Slide1';
import Slide2 from './Slide2';
import Slide3 from './Slide3';

export default function App() {
  return (
    <Main>
      <Slide1 />
      <Slide2 />
      <Slide3 />
    </Main>
  );
}

const Main = styled.main({
  height: '100vh',
  backgroundColor: 'ghostwhite',
  fontFamily: 'sans-serif',
  fontWeight: 'lighter',
});
