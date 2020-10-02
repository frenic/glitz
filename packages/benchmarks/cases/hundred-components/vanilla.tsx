import * as React from 'react';

export default function () {
  const Components: any[] = [];
  for (let i = 0; i < 100; i++) {
    Components.push(() => <div className="a" />);
  }

  return Components.map((Component, i) => <Component key={i} />);
}
