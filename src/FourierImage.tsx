import Card from '@material-ui/core/Card';
import { makeStyles } from '@material-ui/core/styles';
import { fft } from 'fft-js';
import { debounce } from 'lodash';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import beans from './images/beans.jpg';
import black from './images/black.jpg';
import brain from './images/brain.jpg';
import cherry from './images/cherry.jpg';
import kanji_omo from './images/kanji_omo.jpg';
import kanji_river from './images/kanji_river.jpg';
import lenna from './images/lenna.jpg';
import snow from './images/snow.jpg';
import starstripe from './images/starstripe.jpg';
import zebra from './images/zebra.jpg';

const N = 256;
const images = {
  black,
  brain,
  beans,
  cherry,
  lenna,
  snow,
  starstripe,
  zebra,
  kanji_omo,
  kanji_river
};

const fft2d = (data: number[]) => {
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
  const max = Math.max(...amps);
  const normalized = amps.map(a => (a * 0xff) / max);
  return normalized;
};

const swapQuadrants = (data: number[]) => {
  const result = new Array(N * N);
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

const toCanvas = (ctx: CanvasRenderingContext2D, data: number[]) => {
  const imageData = new ImageData(N, N);
  for (let i = 0; i < N * N; i++) {
    const val = Math.min(Math.max(0, data[i]), 255);
    imageData.data[i * 4] = val;
    imageData.data[i * 4 + 1] = val;
    imageData.data[i * 4 + 2] = val;
    imageData.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
};

const fromCanvas = (ctx: CanvasRenderingContext2D): number[] => {
  const result = new Array(N * N);
  const imageData = ctx.getImageData(0, 0, N, N);
  for (let i = 0; i < N * N; i++) {
    result[i] =
      (imageData.data[i * 4] +
        imageData.data[i * 4 + 1] +
        imageData.data[i * 4 + 2]) /
      3;
  }
  return result;
};

const FourierImage: FC = props => {
  const classes = useStyles();
  const oCanvasRef = useRef<HTMLCanvasElement>(null);
  const kCanvasRef = useRef<HTMLCanvasElement>(null);
  const [down, setDown] = useState(false);

  const convert = useMemo(
    () =>
      debounce(() => {
        const canvas = oCanvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        const data = fromCanvas(ctx);
        const fftResult = swapQuadrants(normalize(fft2d(data)));
        toCanvas(kCanvasRef.current!.getContext('2d')!, fftResult);
      }, 100),
    []
  );

  useEffect(() => {
    const handlePaste = (ev: ClipboardEvent) => {
      const items = Array.from(ev.clipboardData?.items ?? []);
      const item = items.find(i => i.type.startsWith('image'));
      if (!item) return;
      ev.preventDefault();
      const url = URL.createObjectURL(item.getAsFile());
      const image = new Image();
      image.src = url;
      image.addEventListener('load', () => {
        const ctx = oCanvasRef.current!.getContext('2d')!;
        ctx.drawImage(image, 0, 0, N, N);
        toCanvas(ctx, fromCanvas(ctx)); // discards color and alpha
        convert();
      });
    };
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [convert]);

  const handleImageSelect = (ev: React.MouseEvent) => {
    const image = ev.target as HTMLImageElement;
    const canvas = oCanvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, 0, 0);
    convert();
  };

  const handlePaint = (ev: React.MouseEvent) => {
    if (!down) return;
    const canvas = oCanvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const x = ev.clientX - rect.x;
    const y = ev.clientY - rect.y;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x, y, 10, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    convert();
  };

  useEffect(() => {
    const ctx = oCanvasRef.current!.getContext('2d')!;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, N, N);
    convert();
  }, [convert]);

  return (
    <div className={classes.root}>
      <Card className={classes.thumbs}>
        {Object.values(images).map(url => (
          <img
            key={url}
            className={classes.thumb}
            src={url}
            onClick={handleImageSelect}
          />
        ))}
      </Card>
      <Card className={classes.editor}>
        <div>
          <div className={classes.box + ' o'}>
            <div>Original:</div>
            <canvas
              ref={oCanvasRef}
              width={N}
              height={N}
              onMouseMove={handlePaint}
              onMouseDown={() => setDown(true)}
              onMouseUp={() => setDown(false)}
              onMouseLeave={() => setDown(false)}
            />
          </div>
          {' = '}
          <div className={classes.box + ' k'}>
            <div>K-space image:</div>
            <canvas ref={kCanvasRef} width={N} height={N} />
          </div>
        </div>
        <ul>
          <li>Press Ctrl + V to paste from clipboard.</li>
          <li>Drag to paint.</li>
        </ul>
      </Card>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%'
  },
  thumbs: {
    overflowX: 'auto',
    display: 'flex',
    padding: '10px',
    marginBottom: '10px'
  },
  thumb: {
    cursor: 'pointer',
    width: '80px',
    height: '80px',
    boxShadow: '3px 3px 3px silver',
    marginRight: '10px',
    transition: 'all 0.3s',
    '&:hover': {
      boxShadow: '3px 3px 3px gray',
      transform: 'scale(1.1)'
    }
  },
  editor: {
    padding: '10px'
  },
  box: {
    '&.o canvas': { border: '3px solid blue' },
    '&.k canvas': { border: '3px solid red' },
    display: 'inline-block',
    verticalAlign: 'middle',
    padding: '10px',
    backgroundColor: '#eeeeee',
    borderRadius: '10px'
  }
}));

export default FourierImage;
