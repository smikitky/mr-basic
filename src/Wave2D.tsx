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
  const [k, setK] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
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
      setK({
        x: (phases[N - 1][0] - phases[0][0]) / (2 * Math.PI),
        y: (phases[0][0] - phases[0][N - 1]) / (2 * Math.PI)
      });

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
  }, [gradientX, gradientY, pause, phases, protonType]);

  const rephase = (kx: number, ky: number) => {
    for (let x = 0; x < N; x++) {
      for (let y = 0; y < N; y++) {
        phases[x][y] =
          (x * kx * 2 * Math.PI) / (N - 1) - (y * ky * 2 * Math.PI) / (N - 1);
      }
    }
  };

  const handleRephaseClick = () => {
    rephase(0, 0);
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
          className={classes.rephase}
          variant="contained"
          color="primary"
          onClick={handleRephaseClick}
          startIcon={<SyncIcon />}
        >
          Rephase
        </Button>
        <Button
          className={classes.pause}
          variant="contained"
          color={pause ? 'secondary' : 'primary'}
          onClick={handlePauseClick}
          startIcon={pause ? <PlayIcon /> : <PauseIcon />}
        >
          {pause ? 'Resume' : 'Pause'}
        </Button>
        <FormControlLabel
          className={classes.square}
          label="Square"
          control={
            <Switch
              color="primary"
              checked={protonType === 'square'}
              onChange={handleProtonTypeChange}
            />
          }
        />
        <div className={classes.grow} />
        <KSpace x={k.x} y={k.y} onKSpaceChange={rephase} />
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
          track={false}
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
          track={false}
          marks
        />
      </div>
    </div>
  );
};

const KSpace: FC<{
  x: number;
  y: number;
  onKSpaceChange: (x: number, y: number) => void;
}> = props => {
  const classes = useStyles();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [down, setDown] = useState(false);
  const { x = 0, y = 0, onKSpaceChange } = props;

  useEffect(() => {
    const canvas = canvasRef.current!;
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.ellipse(
      x * 5 + width / 2,
      -y * 5 + height / 2,
      5,
      5,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, [x, y]);

  const handlePointerMove = (ev: React.PointerEvent) => {
    if (!down) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const clickX = ev.clientX - rect.x;
    const clickY = ev.clientY - rect.y;
    const kx = Math.round((clickX - rect.width / 2) / 5);
    const ky = Math.round(-(clickY - rect.height / 2) / 5);
    onKSpaceChange(kx, ky);
  };

  return (
    <canvas
      ref={canvasRef}
      className={classes.kSpace}
      width={100}
      height={100}
      onPointerDown={() => setDown(true)}
      onPointerMove={handlePointerMove}
      onPointerUp={() => setDown(false)}
    />
  );
};

const useStyles = makeStyles(theme => ({
  root: {},
  waveArea: {
    display: 'grid',
    width: 'auto',
    gridTemplateAreas: `'v c' 'a h'`,
    gridTemplateRows: 'min(80vw, 80vh) auto',
    gridTemplateColumns: 'auto min(80vw, 80vh)',
    margin: '0 auto',
    justifyContent: 'center'
  },
  grow: {
    flexGrow: 1
  },
  canvas: {
    cursor: 'pointer',
    gridArea: 'c',
    width: 'min(80vw, 80vh)',
    height: 'min(80vw, 80vh)'
  },
  gradientX: { gridArea: 'h' },
  gradientY: { gridArea: 'v' },
  menu: {
    gridArea: 'm',
    padding: '15px',
    display: 'grid',
    gridTemplate: '"r p s k"',
    gridTemplateColumns: 'auto auto 1fr auto',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
    [theme.breakpoints.down('xs')]: {
      gridTemplate: `
        "r k"
        "p k"
        "s k"
      `,
      gridTemplateColumns: 'auto max-content',
      justifyItems: 'space-between'
    }
  },
  rephase: {
    gridArea: 'r',
    width: '120px'
  },
  pause: {
    gridArea: 'p',
    width: '120px'
  },
  square: {
    gridArea: 's'
  },
  kSpace: {
    gridArea: 'k',
    boxShadow: '0 0 8px 2px silver',
    touchAction: 'none'
  }
}));

export default Wave2D;
