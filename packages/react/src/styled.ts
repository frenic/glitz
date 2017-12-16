// @ts-ignore
import { Style } from '@glitz/core';
// @ts-ignore
import * as React from 'react';
// @ts-ignore
import { StyledComponent } from './styled/create';
import { customStyled } from './styled/custom';
// @ts-ignore
import { assignPredefined, PredefinedStyled } from './styled/predefined';

export * from './styled/create';

export const styled = assignPredefined(customStyled);
