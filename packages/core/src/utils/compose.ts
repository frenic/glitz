export function compose<T>(...fns: Array<(arg: T) => T>) {
  return fns.reduceRight((prevFn, nextFn) => arg => nextFn(prevFn(arg)));
}
