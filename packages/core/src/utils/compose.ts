export function compose<T, U extends T>(...fns: Array<(arg: T) => U>) {
  return fns.reduceRight((prevFn, nextFn) => arg => nextFn(prevFn(arg)));
}
