import * as React from 'react';
import { GlitzClient } from '@glitz/core';
import { GlitzProvider, styled } from '@glitz/react';

const glitz = new GlitzClient();

export default function () {
  const Component = styled(() => <styled.Div />, {
    color: 'red',
  });

  return (
    <GlitzProvider glitz={glitz}>
      <Component />
    </GlitzProvider>
  );
}
