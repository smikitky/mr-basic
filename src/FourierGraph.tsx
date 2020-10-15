import React, {
  FC,
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback
} from 'react';
import { useImmer } from 'use-immer';
import { fft } from 'fft-js';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/Button';
import ZeroIcon from '@material-ui/icons/ExposureZero';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { makeStyles } from '@material-ui/core/styles';

const N = 512;

const FourierGraph: FC = props => {
  const classes = useStyles();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [input, setInput] = useImmer<number[]>(() => new Array(N).fill(0));
  const fftResults = useMemo(() => fft(input), [input]);
  const [prevPos, setPrevPos] = useState<{ x: number; y: number } | undefined>(
    undefined
  );
  const [maxLines, setMaxLines] = useState(10);
  const [drawMain, setDrawMain] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [showAmps, setShowAmps] = useState(true);

  const draw = useCallback(() => {
    const canvas = canvasRef.current!;
    const { width, height } = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, width, height);
    const sum = new Array(N).fill(0);

    const rawToLocal = (x: number, y: number) => {
      return { x: (x * width) / N, y: height / 2 - y };
    };

    // base line
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#888888';
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // sin waves
    ctx.strokeStyle = '#00aaff';
    ctx.lineWidth = 1;
    for (let k = 0; k < maxLines; k++) {
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      for (let x = 0; x < N; x++) {
        const w = (2 * Math.PI * k) / N;
        const w2 = (2 * Math.PI * (N - k)) / N;
        let y =
          Math.cos(w * x) * fftResults[k][0] -
          Math.sin(w * x) * fftResults[k][1];
        if (k > 0)
          y +=
            Math.cos(w2 * x) * fftResults[N - k][0] -
            Math.sin(w2 * x) * fftResults[N - k][1];
        y /= N;
        sum[x] += y;
        const pos = rawToLocal(x, y);
        ctx.lineTo(pos.x, pos.y);
      }
      ctx.stroke();
    }

    // sum wave
    ctx.strokeStyle = '#0000ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    for (let x = 0; x < N; x++) {
      const pos = rawToLocal(x, sum[x]);
      ctx.lineTo(pos.x, pos.y);
    }
    ctx.stroke();

    // main wave
    if (drawMain) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ff0000';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      for (let x = 0; x < N; x++) {
        const pos = rawToLocal(x, input[x]);
        ctx.lineTo(pos.x, pos.y);
      }
      ctx.stroke();
    }
  }, [drawMain, fftResults, input, maxLines]);

  const handlePointerDown = () => {
    setDragging(true);
  };

  const handlePointerUp = () => {
    setDragging(false);
    setPrevPos(undefined);
  };

  const handlePointerMove = (ev: React.MouseEvent) => {
    if (!dragging) return;
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const clickX = ev.clientX - rect.left;
    const clickY = ev.clientY - rect.top;
    const x = Math.floor((clickX / rect.width) * N); // 0 - (N-1)
    const y = rect.height / 2 - clickY;
    if (x === 0 || x === N - 1) return;
    setInput(input => {
      if (!prevPos) {
        input[x] = y;
        return;
      }
      const min = Math.min(prevPos.x, x);
      const max = Math.max(prevPos.x, x);
      let xx = min;
      while (xx < max) {
        input[xx] =
          (x * prevPos.y - prevPos.x * y + (y - prevPos.y) * xx) /
          (x - prevPos.x);
        xx++;
      }
      input[x] = y;
    });
    setPrevPos({ x, y });
  };

  const handleMaxLinesChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(ev.target.value);
    setMaxLines(Math.min(Math.max(0, value), N));
  };

  useEffect(() => {
    draw();
  }, [draw, input, fftResults, maxLines, drawMain]);

  useEffect(() => {
    let finished = false;
    const canvas = canvasRef.current!;
    const tick = () => {
      if (finished) return;
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        draw();
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => {
      finished = true;
    };
  }, [draw]);

  return (
    <div className={classes.root}>
      <Card className={classes.menu}>
        <IconButton variant="outlined" onClick={() => setMaxLines(0)}>
          <ZeroIcon />
        </IconButton>
        <TextField
          label="Draw lines"
          type="number"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={maxLines}
          onChange={handleMaxLinesChange}
        />
        <FormControlLabel
          control={
            <Switch
              color="primary"
              onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                setDrawMain(ev.target.checked)
              }
              checked={drawMain}
            />
          }
          label="Draw main"
        />
        <FormControlLabel
          control={
            <Switch
              color="primary"
              onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                setShowAmps(ev.target.checked)
              }
              checked={showAmps}
            />
          }
          label="Amplitudes"
        />
      </Card>
      <canvas
        ref={canvasRef}
        className={classes.canvas}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={handlePointerUp}
        onPointerMove={handlePointerMove}
      />
      {showAmps && (
        <Card className={classes.amplitudesCard}>
          <Typography variant="h5">Amplitudes</Typography>
          <AmpDisplay fftResults={fftResults} />
        </Card>
      )}
    </div>
  );
};

const AmpDisplay: FC<{
  max?: number;
  fftResults: [number, number][];
}> = React.memo(props => {
  const classes = useStyles();
  const { max = 15, fftResults } = props;
  const items = fftResults
    .slice(0, max)
    .map(f => [f[0], f[1], Math.sqrt(f[0] * f[0] + f[1] * f[1])]);
  const maxF = Math.max(...items.map(i => i[2]));
  return (
    <ul className={classes.amps}>
      {items.map((item, i) => {
        return (
          <li key={i} className="amp">
            <div
              className="bar"
              style={{ right: `${100 - (item[2] / maxF) * 100}%` }}
            />
            <div>
              {i}: {item[2].toFixed(2)}
            </div>
          </li>
        );
      })}
    </ul>
  );
});

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    height: '100%',
    display: 'grid',
    gridTemplate: `
      'm m' auto
      'c a' 1fr
      / 1fr auto`,
    gap: '10px'
  },

  menu: {
    padding: '10px',
    gridArea: 'm',
    display: 'flex',
    flexFlow: 'row wrap',
    gap: '15px',
    alignItems: 'center'
  },

  canvas: {
    width: '100%',
    height: '100%',
    gridArea: 'c',
    cursor: 'crosshair',
    background: '#eeeeee',
    touchAction: 'none'
  },

  amplitudesCard: {
    gridArea: 'a',
    padding: '10px',
    width: '150px',
    userSelect: 'none'
  },

  amps: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
    '& li': {
      backgroundRepeat: 'no-repeat',
      marginBottom: '3px',
      position: 'relative',
      zIndex: 0,
      '& .bar': {
        background: '#ccccff',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: -1
      }
    }
  }
}));

export default FourierGraph;
