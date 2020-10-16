import * as React from 'react';
import { GlitzClient } from '../../../core/src';
import { GlitzProvider, styled, forwardStyle } from '../../../react/src';

const glitz = new GlitzClient();

const components: any[] = [];
for (let i = 0; i < 100; i++) {
  components.push(
    styled(
      forwardStyle(({ compose }) => <styled.Div css={compose()} />),
      {
        backgroundColor: `rgb(${i}, ${i}, ${i})`,
        color: `rgb(${i}, ${i}, ${i})`,
        marginTop: `${i}px`,
      },
    ),
  );
}

export default function () {
  return (
    <GlitzProvider glitz={glitz}>
      {components.map((Component, i) => (
        <Component key={i} />
      ))}
    </GlitzProvider>
  );
}
