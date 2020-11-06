import * as React from 'react';
import { GlitzClient } from '@glitz/core-stable';
import { GlitzProvider, styled } from '@glitz/react-stable';

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
    <GlitzProvider glitz={glitz as any}>
      {components.map((Component, i) => (
        <Component key={i} />
      ))}
    </GlitzProvider>
  );
}
