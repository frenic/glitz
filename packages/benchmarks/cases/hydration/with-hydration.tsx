import * as React from 'react';
import { GlitzServer, GlitzClient } from '../../../core/src';
import reboot from '../../../core/src/__fixtures__/reboot';
import { GlitzProvider, styled } from '../../../react/src';

const server = new GlitzServer();
server.injectGlobals(reboot);

const components: any[] = [];
for (let i = 0; i < 100; i++) {
  const style = {
    backgroundColor: `rgb(${i}, ${i}, ${i})`,
    color: `rgb(${i}, ${i}, ${i})`,
    marginTop: `${i}px`,
  } as const;
  server.injectStyle(style);
  components.push(styled.div(style));
}

const statics = server.getStyle();

export default function () {
  const glitz = new GlitzClient();
  glitz.hydrate(statics);

  return (
    <GlitzProvider glitz={glitz}>
      {components.map((Component, i) => (
        <Component key={i} />
      ))}
    </GlitzProvider>
  );
}
