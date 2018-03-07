// tslint:disable

import GlitzClient from '@glitz/core';
import numberToLength, { createNumberToLengthTransformer } from './';

const a = numberToLength({
  borderSpacing: 1,
  marginLeft: 1,
  width: 1,
});

const glitz1 = new GlitzClient(null, { transformer: numberToLength });

const b: string = glitz1.injectStyle({ width: 1, height: [1, 'max-content'], padding: { left: 1 } });

const glitz2 = new GlitzClient(null, { transformer: createNumberToLengthTransformer({ unit: 'rem' }) });

const c: string = glitz2.injectStyle({ width: 1, height: [1, 'max-content'], padding: { left: 1 } });

// Avoid unread variables type error
a;
b;
c;
