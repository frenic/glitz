import * as React from 'react';
import { GlitzClient } from '@glitz/core';
import { GlitzProvider, styled } from '@glitz/react';

const glitz = new GlitzClient();

export default function () {
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

  return (
    <GlitzProvider glitz={glitz}>
      {components.map((Component, i) => (
        <Component key={i} />
      ))}
    </GlitzProvider>
  );
}
