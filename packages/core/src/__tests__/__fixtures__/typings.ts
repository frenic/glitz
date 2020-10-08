import { ResolvedDeclarations } from '@glitz/type';
import { compose, GlitzClient, GlitzServer, media, Options, selector } from '../..';

const transformer: (input: ResolvedDeclarations) => ResolvedDeclarations = input => ({
  anyProperty: input.anyProperty,
  width: 0,
  color: ['', 0],
});

const transformers = compose(transformer, transformer);

const options: Options = {
  transformer,
};

const server = new GlitzServer(options);

const a: string = server.injectStyle({});

const b: string = server.getStyleMarkup();

const client = new GlitzClient(options);

const c: string = client.injectStyle({});

const d: string = client.injectStyle({
  ...selector('', {}),
  ...media('', {}),
  ...media({}, {}),
});

// Avoid unread variables type error
transformers;
a;
b;
c;
d;
