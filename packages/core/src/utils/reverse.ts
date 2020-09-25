export function reverse(object: any) {
  const reversed: any = {};
  const properties = Object.keys(object);
  for (let i = properties.length; i > 0; i--) {
    reversed[properties[i - 1]] = object[properties[i - 1]];
  }
  return reversed;
}
