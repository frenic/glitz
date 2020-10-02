import * as React from 'react';
import { GlitzClient } from '@glitz/core';
import { GlitzProvider, styled } from '@glitz/react';

const glitz = new GlitzClient();

function randomRGB() {
  const random = () => Math.round(Math.random() * 255);
  return `rgb(${random()}, ${random()}, ${random()})`;
}

export default function () {
  const components: any[] = [];
  for (let i = 0; i < 100; i++) {
    components.push(
      styled.div({
        backgroundColor: randomRGB(),
        color: randomRGB(),
        marginTop: `${Math.random()}px`,
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
