import * as React from 'react';

const Components: any[] = [];
for (let i = 0; i < 100; i++) {
  Components.push(() => <div className="a" />);
}

export default function () {
  return Components.map((Component, i) => <Component key={i} />);
}
