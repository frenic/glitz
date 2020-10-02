import * as React from 'react';

export default function () {
  const components: any[] = [];
  for (let i = 0; i < 100; i++) {
    components.push(() => <div className="a b c" />);
  }

  return components.map((Component, i) => <Component key={i} />);
}
