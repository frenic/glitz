// tslint:disable

import { Properties } from '@glitz/type';
import GlitzClient, { Options, compose, pseudo, media } from './index';
import GlitzServer from './server';

const transformer: (input: Properties) => Properties = input => input;
const transformers: (input: Properties) => Properties = compose(transformer, transformer);

const options: Options = {
  transformer,
};

new GlitzServer(options);

const server = new GlitzServer(options);
const a: string = server.injectStyle({});
const b: string = server.getStyleMarkup();
const c: string = server.getStyleMarkup('');

new GlitzClient(document.getElementsByClassName(''), options);
new GlitzClient(document.querySelectorAll(''), options);
new GlitzClient([], options);
new GlitzClient('auto', options);

const client = new GlitzClient(null, options);
const d: string = client.injectStyle({});

const e: string = client.injectStyle({
  ...pseudo('', {}),
  ...media({}, {}),
});

// Avoid unread variables type error
transformers;
a;
b;
c;
d;
e;
