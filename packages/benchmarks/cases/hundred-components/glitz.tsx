import * as React from 'react';
import { GlitzClient } from '../../../core/src';
import { GlitzProvider } from '../../../react/src';
import { styled } from '../../../react/src';

const glitz = new GlitzClient();

const Components: any[] = [];
for (let i = 0; i < 100; i++) {
  Components.push(
    styled.div({
      backgroundColor: 'red',
    }),
  );
}

export default function () {
  return (
    <GlitzProvider glitz={glitz}>
      {Components.map((Component, i) => (
        <Component key={i} />
      ))}
    </GlitzProvider>
  );
}
