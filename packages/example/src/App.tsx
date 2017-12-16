import { styled } from '@glitz/react';
import * as React from 'react';
import Slide1 from './Slide1';

export default function App() {
  return (
    <Main>
      <Slide1 />
    </Main>
  );
}

const Main = styled.main({
  backgroundColor: 'ghostwhite',
  fontFamily: 'sans-serif',
  fontWeight: 'lighter',
});
