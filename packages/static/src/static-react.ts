// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useMemo = <T>(creator: () => T, _?: any) => {
  return creator();
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const forwardRef = <T, P = {}>(Component: any, _?: any, __?: T | P) => {
  return Component;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const memo = <T>(Component: T, _?: any) => {
  return Component;
};

const React = {
  useMemo,
  forwardRef,
  memo,
};

export default React;
