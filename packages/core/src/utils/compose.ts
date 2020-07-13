export function compose<T, U extends T>(...fns: ((arg: T) => U)[]): (arg: T) => U {
  return fns.reduceRight((prevFn, nextFn) => arg => nextFn(prevFn(arg)));
}
