# ![Glitz](https://github.com/frenic/glitz/raw/master/glitz.svg?sanitize=true)

A Glitz port of [`Bootstrap Reboot`](https://getbootstrap.com/docs/4.0/content/reboot/).

```tsx
import React from 'react';
import { render } from 'react-dom';
import { GlitzClient } from '@glitz/core';
import { GlitzProvider, StyleProvider } from '@glitz/react';
import transformers from '@glitz/transformers';
import reboot from '@glitz/reboot';
import App from './App';

const glitz = new GlitzClient({ transformer: transformers() });

render(
  <GlitzProvider glitz={glitz}>
    <StyleProvider include={reboot()}>
      <App />
    </StyleProvider>
  </GlitzProvider>,
  document.getElementById('container'),
);
```
