import GlitzClient from '@glitz/core';
import prefixerTransformer from '@glitz/prefixer-transformer';
import { GlitzProvider } from '@glitz/react';
import * as React from 'react';
import { render } from 'react-dom';
import App from './App';

render(
  <GlitzProvider glitz={new GlitzClient(null, { transformer: prefixerTransformer })}>
    <App />
  </GlitzProvider>,
  document.getElementById('container'),
);
