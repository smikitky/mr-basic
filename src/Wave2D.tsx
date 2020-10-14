import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Slider from '@material-ui/core/Slider';
import Card from '@material-ui/core/Card';
import Switch from '@material-ui/core/Switch';
import PauseIcon from '@material-ui/icons/Pause';
import PlayIcon from '@material-ui/icons/PlayArrow';
import SyncIcon from '@material-ui/icons/Sync';
import React, { FC, useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

const N = 32;

const useStyles = makeStyles(theme => ({
  root: {},
  waveArea: {
    display: 'grid',
    width: 'auto',
    gridTemplateAreas: `'v c' 'a h'`,
    gridTemplateRows: '1100px auto',
    gridTemplateColumns: 'auto 1100px',
    margin: '0 auto',
    justifyContent: 'center',
    [theme.breakpoints.down('md')]: {
      gridTemplateRows: '800px auto',
      gridTemplateColumns: 'auto 800px'
    },
    [theme.breakpoints.down('sm')]: {
      gridTemplateRows: '550px auto',
      gridTemplateColumns: 'auto 550px'
    }
  },
  canvas: { gridArea: 'c', width: '100%', height: '100%' },
  gradientX: { gridArea: 'h' },
  gradientY: { gridArea: 'v' },
  menu: {
    padding: '15px',
    gridArea: 'm',
    display: 'flex',
    flexFlow: 'row',
    gap: '5px',
    marginBottom: '10px'
  }
}));

const phaseToColor = (phase: number) => {
  const hex = (
    Math.floor(Math.max(0, -Math.sin(phase)) * 256) * 256 * 256 +
    Math.floor(Math.max(0, Math.sin(phase) * 256))
  )
    .toString(16)
    .padStart(6, '0');
  return '#' + hex;
};

const drawCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  phase: number
) => {
  ctx.save();
  const radius = size / 2 - 0.5;
  try {
    ctx.beginPath();
    ctx.fillStyle = phaseToColor(phase);
    ctx.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + radius * Math.cos(phase), y - radius * Math.sin(phase));
    ctx.stroke();
  } finally {
    ctx.restore();
  }
};

const drawSquare = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  phase: number
) => {
  ctx.save();
  const radius = (size / 2) * (0.5 + 0.4 * Math.sin(phase));
  try {
    ctx.beginPath();
    ctx.fillStyle = '#000000';
    ctx.rect(x - radius, y - radius, radius * 2, radius * 2);
    ctx.fill();
  } finally {
    ctx.restore();
  }
};

const Wave2D: FC = props => {
  const classes = useStyles();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gradientX, setGradientX] = useState(0);
  const [gradientY, setGradientY] = useState(0);
  const [pause, setPause] = useState(false);
  const [protonType, setProtonType] = useState<'circle' | 'square'>('circle');
  const phasesRef = useRef<number[][]>();
  if (!phasesRef.current) {
    phasesRef.current = new Array(N).fill(0).map(_ => new Array(N).fill(0));
  }
  const phases = phasesRef.current;
  const lastRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current!;
    let finished = false;
    const tick = (now: DOMHighResTimeStamp) => {
      if (finished || pause) return;
      const ctx = canvas.getContext('2d')!;
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const elapsed = lastRef.current ? now - lastRef.current : 0;
      lastRef.current = now;

      for (let x = 0; x < N; x++) {
        for (let y = 0; y < N; y++) {
          phases[x][y] +=
            (elapsed +
              ((x - N / 2) * gradientX) / 10 -
              ((y - N / 2) * gradientY) / 10) /
            300;
        }
      }

      ctx.clearRect(0, 0, width, height);
      const cellSize = width / N;
      ctx.strokeStyle = '#ffffff';
      for (let x = 0; x < N; x++) {
        for (let y = 0; y < N; y++) {
          const phase = phases[x][y];
          const cx = cellSize * x + cellSize / 2;
          const cy = cellSize * y + cellSize / 2;
          if (protonType === 'circle') {
            drawCircle(ctx, cx, cy, width / N, phase);
          } else {
            drawSquare(ctx, cx, cy, width / N, phase);
          }
        }
      }

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => {
      finished = true;
    };
  }, [gradientX, gradientY, pause, protonType]);

  const handleRephaseClick = () => {
    phases.forEach((_, i) => (phases[i] = new Array(N).fill(0)));
  };

  const handleProtonTypeChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setProtonType(ev.target.checked ? 'square' : 'circle');
  };

  const handlePauseClick = () => {
    if (pause) {
      setPause(false);
      lastRef.current = performance.now();
    } else {
      setPause(true);
    }
  };

  return (
    <div className={classes.root}>
      <Card className={classes.menu}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRephaseClick}
          startIcon={<SyncIcon />}
        >
          Rephase
        </Button>
        <Button
          variant="contained"
          color={pause ? 'secondary' : 'primary'}
          onClick={handlePauseClick}
          startIcon={pause ? <PlayIcon /> : <PauseIcon />}
        >
          {pause ? 'Resume' : 'Pause'}
        </Button>
        <FormControlLabel
          label="Square"
          control={
            <Switch
              color="primary"
              checked={protonType === 'square'}
              onChange={handleProtonTypeChange}
            />
          }
        />
      </Card>
      <div className={classes.waveArea}>
        <canvas
          className={classes.canvas}
          ref={canvasRef}
          width={600}
          height={600}
        />
        <Slider
          className={classes.gradientX}
          min={-10}
          max={10}
          value={gradientX}
          onChange={(ev, value) => setGradientX(value as number)}
          onChangeCommitted={() => setGradientX(0)}
          valueLabelDisplay="auto"
          marks
        />
        <Slider
          orientation="vertical"
          className={classes.gradientY}
          min={-10}
          max={10}
          value={gradientY}
          onChange={(ev, value) => setGradientY(value as number)}
          onChangeCommitted={() => setGradientY(0)}
          valueLabelDisplay="auto"
          marks
        />
      </div>
    </div>
  );
};

export default Wave2D;
