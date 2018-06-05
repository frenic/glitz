export const STYLED_TYPE_PROPERTY = '$$GLITZ_STYLED_TYPE';

export enum Type {
  Element,
  ElementLike,
}

export interface StyledType {
  [STYLED_TYPE_PROPERTY]: Type;
}

export function isType(type: any): type is StyledType {
  return STYLED_TYPE_PROPERTY in type;
}
