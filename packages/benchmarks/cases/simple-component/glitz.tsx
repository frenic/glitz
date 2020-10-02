import * as React from 'react';
import { GlitzClient } from '../../../core/src';
import { GlitzProvider } from '../../../react/src';
import { styled } from '../../../react/src';

const glitz = new GlitzClient();

export default function () {
  return (
    <GlitzProvider glitz={glitz}>
      <Component />
    </GlitzProvider>
  );
}

const Component = styled.div({
  backgroundColor: 'red',
});
