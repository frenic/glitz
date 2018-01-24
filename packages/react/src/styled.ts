// @ts-ignore
import { Style } from '@glitz/type';
// @ts-ignore
import * as React from 'react';
// @ts-ignore
import { StyledComponent } from './styled/create';
// @ts-ignore
import { customStyled, StyledDecorator } from './styled/custom';
// @ts-ignore
import { assignPredefined, PredefinedStyled } from './styled/predefined';

export * from './styled/create';

export const styled = assignPredefined(customStyled);
