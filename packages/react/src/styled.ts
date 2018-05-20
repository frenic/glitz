// @ts-ignore
import { Style } from '@glitz/type';
// @ts-ignore
import * as React from 'react';
// @ts-ignore
import { customStyled, StyledDecorator } from './styled/custom';
import { assignPredefined } from './styled/predefined';
// @ts-ignore
import { StyledElementComponents, StyledElementFunctions } from './styled/types';

export * from './styled/types';

export const styled = assignPredefined(customStyled);
