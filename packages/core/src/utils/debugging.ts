type AnyObject = { [property: string]: any };
export let issueFormatter: (
  message: string,
  object: AnyObject,
  highlight?: AnyObject,
  replacer?: ((key: string, value: any) => any) | null,
  transform?: (issueObject: AnyObject) => AnyObject,
) => string[] = () => {
  return [];
};

if (process.env.NODE_ENV !== 'production') {
  const issueValue = '%o';

  issueFormatter = (message, object, highlight = {}, replacer = null, transform) => {
    const issueArgs = [];
    let issueObject: any = {};

    for (const key in object) {
      const isIssue = key in highlight;

      issueObject[isIssue ? `%c${key}%c` : key] = isIssue ? issueValue : object[key];

      if (isIssue) {
        issueArgs.push(
          'font-weight: bold; text-decoration: underline',
          'font-weight: normal; text-decoration: none',
          object[key],
        );
      }
    }

    if (transform) {
      issueObject = transform(issueObject);
    }

    let block = JSON.stringify(issueObject, replacer as any, 2);

    for (const key in highlight) {
      block = block.replace(`  "%c${key}%c": "${issueValue}"`, `  %c"${key}"%c: ${issueValue}`);
    }

    return [`${message}\n\n${block}`, ...issueArgs];
  };
}
