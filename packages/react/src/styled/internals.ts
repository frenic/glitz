export const SECRET_COMPOSE = '$$GLITZ1';
export const SECRET_TYPE = '$$GLITZ2';

export enum Type {
  Element,
  ElementLike,
}

export interface StyledType {
  [SECRET_TYPE]: Type;
}

export function isType(type: any): type is StyledType {
  return SECRET_TYPE in type;
}
