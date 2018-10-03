// tslint:disable

import { Properties, UntransformedProperties } from '@glitz/type';
import { GlitzClient, GlitzServer, Options, compose, pseudo, media } from './index';

const transformer: (input: UntransformedProperties) => Properties = input => ({ display: input.display });
const transformers = compose(
  transformer,
  transformer,
);

const options: Options = {
  transformer,
};

new GlitzServer(options);

const server = new GlitzServer(options);
const a: string = server.injectStyle({});
const b: string = server.getStyleMarkup();

new GlitzClient(options);

const client = new GlitzClient(options);
const c: string = client.injectStyle({});

const d: string = client.injectStyle({
  ...pseudo('', {}),
  ...media({}, {}),
});

// Avoid unread variables type error
transformers;
a;
b;
c;
d;
