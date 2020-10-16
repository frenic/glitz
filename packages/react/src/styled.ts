import { createStyled } from './styled/custom';
import { assignPredefined } from './styled/predefined';

export type { StyledComponent, StyledComponentWithRef } from './styled/create';
export type { StyledDecorator } from './styled/decorator';
export type { StyledElement, StyledElementProps } from './styled/predefined';
export type { StyledElementLike } from './styled/apply-class-name';
export type { StyledProps, StyledForwardStyle } from './styled/forward-style';
export { default as useStyle } from './styled/use-glitz';
export { default as useTheme } from './styled/use-theme';
export { applyClassName } from './styled/apply-class-name';
export { forwardStyle } from './styled/forward-style';

export const styled = assignPredefined(createStyled);
