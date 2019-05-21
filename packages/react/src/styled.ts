import { customStyled } from './styled/custom';
import { assignPredefined } from './styled/predefined';

export { default as useStyle } from './styled/use-style';
export * from './styled/apply-class-name';
export * from './styled/types';

export const styled = assignPredefined(customStyled);
