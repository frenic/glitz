import { GlitzClient } from '@glitz/core';
import { GlitzProvider } from '@glitz/react';
import transformers from '@glitz/transformers';
import * as React from 'react';
import { render } from 'react-dom';
import App from './App';
import { minDesktop, minTablet } from './queries';

const mediaQueryOrder = [minTablet, minDesktop];

function mediaQuerySorter(a: string, b: string) {
  const indexA = mediaQueryOrder.indexOf(a);
  const indexB = mediaQueryOrder.indexOf(b);
  return indexA - indexB;
}

const glitz = new GlitzClient({ transformer: transformers(), mediaOrder: mediaQuerySorter });

render(
  <GlitzProvider glitz={glitz}>
    <App />
  </GlitzProvider>,
  document.getElementById('container'),
);
