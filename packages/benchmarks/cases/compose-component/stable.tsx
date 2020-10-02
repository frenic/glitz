import * as React from 'react';
import { GlitzClient } from '@glitz/core-stable';
import { GlitzProvider, styled } from '@glitz/react-stable';

const glitz = new GlitzClient();

export default function () {
  const Component = styled(props => <styled.Div css={props.compose()} />, {
    color: 'red',
  });

  return (
    <GlitzProvider glitz={glitz}>
      <Component />
    </GlitzProvider>
  );
}
