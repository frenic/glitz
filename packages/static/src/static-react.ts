// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useMemo = <T>(creator: () => T, deps: []) => {
  return creator();
};

const React = {
  useMemo,
};

export default React;
