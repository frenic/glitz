import * as React from 'react';
import { GlitzClient } from '../../../core/src';
import { GlitzProvider } from '../../../react/src';
import { styled } from '../../../react/src';

const glitz = new GlitzClient();

export default function () {
  const Components: any[] = [];
  for (let i = 0; i < 100; i++) {
    Components.push(
      styled.div({
        backgroundColor: 'red' + Math.random(),
        color: 'red' + Math.random(),
        marginTop: Math.random() + 'px',
      }),
    );
  }

  return (
    <GlitzProvider glitz={glitz}>
      {Components.map((Component, i) => (
        <Component key={i} />
      ))}
    </GlitzProvider>
  );
}
