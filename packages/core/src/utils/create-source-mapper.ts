import { createHashCounter } from './hash';

export type SourceMapper = (stackIndex: number, stackInfo: {}) => string;

export function createSourceMapper(prefix: string): SourceMapper {
  const blob = new Blob([`importScripts("https://unpkg.com/css-to-js-sourcemap-worker@2.0.4/worker.js")`], {
    type: 'application/javascript',
  });

  const worker = new Worker(URL.createObjectURL(blob));

  worker.postMessage({
    id: 'init_wasm',
    url: 'https://unpkg.com/css-to-js-sourcemap-worker@2.0.4/mappings.wasm',
  });

  worker.postMessage({
    id: 'set_render_interval',
    interval: 120,
  });

  // if (module && (module as any).hot && (module as any).hot.addStatusHandler) {
  //   (module as any).hot.addStatusHandler((status: string) => {
  //     if (status === 'dispose') {
  //       worker.postMessage({ id: 'invalidate' });
  //     }
  //   });
  // }

  worker.onmessage = msg => {
    const { id, css } = msg.data;
    if (id === 'render_css' && css) {
      const style = document.createElement('style');
      style.appendChild(document.createTextNode(css));
      (document.head as HTMLHeadElement).appendChild(style);
    }
  };

  const debugClassName = createDebugClassName(prefix);

  return (stackIndex, stackInfo) => {
    const className = debugClassName();

    worker.postMessage({
      id: 'add_mapped_class',
      className,
      stackInfo,
      stackIndex,
    });

    return className;
  };
}

export function createDebugClassName(prefix: string) {
  const debugHasher = createHashCounter(prefix);

  return () => {
    return `${prefix}debug-${debugHasher()}`;
  };
}
