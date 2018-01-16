import GlitzClient from '@glitz/core';
import prefixerTransformer from '@glitz/prefixer-transformer';
import { GlitzProvider } from '@glitz/react';
import * as React from 'react';
import { render } from 'react-dom';
import App from './App';

const mediaQueryOrder = ['(min-width: 320px)', '(min-width: 768px)'];

function mediaQuerySorter(a: string, b: string) {
  const indexA = mediaQueryOrder.indexOf(a);
  const indexB = mediaQueryOrder.indexOf(b);
  return indexA - indexB;
}

const glitz = new GlitzClient(null, { transformer: prefixerTransformer, mediaOrder: mediaQuerySorter });

render(
  <GlitzProvider glitz={glitz}>
    <App />
  </GlitzProvider>,
  document.getElementById('container'),
);
