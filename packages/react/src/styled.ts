// @ts-ignore
import { Style } from '@glitz/type';
// @ts-ignore
import * as React from 'react';
// @ts-ignore
import { customStyled, StyledDecorator } from './styled/custom';
import { assignPredefined } from './styled/predefined';
// @ts-ignore
import { StyledElementComponents, StyledElementFunctions } from './styled/types';

export { default as StyledSuper } from './styled/Super';
export { default as createRenderer } from './styled/renderer';
export * from './styled/apply-class-name';
export * from './styled/Super';
export * from './styled/types';

export const styled = assignPredefined(customStyled);
