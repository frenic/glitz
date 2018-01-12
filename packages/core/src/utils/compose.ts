export type Function<T> = (arg: T) => T;

export function compose<T>(...fns: Array<Function<T>>) {
  return fns.reduceRight((prevFn, nextFn) => value => nextFn(prevFn(value)), value => value);
}
