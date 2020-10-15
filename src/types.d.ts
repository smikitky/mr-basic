declare module 'styled-components';

declare module 'fft-js' {
  export function fft(
    vector: (number | [number, number])[]
  ): [number, number][];
}

declare module '*.jpg' {
  const url: string;
  export default url;
}

declare module 'worker-loader!*' {
  class WebpackWorker extends Worker {
    constructor();
  }
  export default WebpackWorker;
}
