import { fft } from 'fft-js';

const ctx: Worker = self as any;

const fft2d = (data: number[], N: number) => {
  if (data.length !== N * N) throw new Error('Length error');
  const result: [number, number][] = new Array(N * N);
  // FFT along x-axis
  for (let y = 0; y < N; y++) {
    const line: number[] = new Array(N);
    for (let x = 0; x < N; x++) {
      line[x] = data[x + y * N];
    }
    const fftLine = fft(line);
    for (let x = 0; x < N; x++) {
      result[x + y * N] = fftLine[x];
    }
  }
  // FFT along y-axis
  for (let x = 0; x < N; x++) {
    const line: [number, number][] = new Array(N);
    for (let y = 0; y < N; y++) {
      line[y] = result[x + y * N];
    }
    const fftLine = fft(line);
    for (let y = 0; y < N; y++) {
      result[x + y * N] = fftLine[y];
    }
  }
  return result;
};

const normalize = (data: [number, number][]): number[] => {
  const amps = data.map(c => Math.log(Math.sqrt(c[0] * c[0] + c[1] * c[1])));
  let max = 0;
  amps.forEach(a => {
    if (max < a) max = a;
  });
  const normalized = amps.map(a => (a * 0xff) / max);
  return normalized;
};

const swapQuadrants = (data: number[], N: number) => {
  const result: number[] = new Array(N * N);
  const copyPixels = (from: [number, number], to: [number, number]) => {
    for (let x = 0; x < N / 2; x++) {
      for (let y = 0; y < N / 2; y++) {
        result[to[0] + x + (to[1] + y) * N] =
          data[from[0] + x + (from[1] + y) * N];
      }
    }
  };
  copyPixels([N / 2, 0], [0, N / 2]); // 1 -> 3
  copyPixels([0, 0], [N / 2, N / 2]); // 2 -> 4
  copyPixels([0, N / 2], [N / 2, 0]); // 3 -> 1
  copyPixels([N / 2, N / 2], [0, 0]); // 4 -> 2
  return result;
};

ctx.addEventListener(
  'message',
  (event: MessageEvent<{ data: number[]; N: number }>) => {
    const { data, N } = event.data;
    const result = swapQuadrants(normalize(fft2d(data, N)), N);
    ctx.postMessage(result);
  }
);
