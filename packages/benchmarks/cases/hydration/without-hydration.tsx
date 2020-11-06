import * as React from 'react';
import { GlitzClient } from '../../../core/src';
import { GlitzProvider, styled } from '../../../react/src';

const components: any[] = [];
for (let i = 0; i < 100; i++) {
  components.push(
    styled.div({
      backgroundColor: `rgb(${i}, ${i}, ${i})`,
      color: `rgb(${i}, ${i}, ${i})`,
      marginTop: `${i}px`,
    }),
  );
}

export default function () {
  const glitz = new GlitzClient();

  return (
    <GlitzProvider glitz={glitz}>
      {components.map((Component, i) => (
        <Component key={i} />
      ))}
    </GlitzProvider>
  );
}
