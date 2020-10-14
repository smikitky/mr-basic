import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Slider from '@material-ui/core/Slider';
import Switch from '@material-ui/core/Switch';
import PauseIcon from '@material-ui/icons/Pause';
import SyncIcon from '@material-ui/icons/Sync';
import React, { FC, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

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

  return (
    <StyledDiv>
      <canvas className="canvas" ref={canvasRef} width={600} height={600} />
      <Slider
        className="gradientX"
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
        className="gradientY"
        min={-10}
        max={10}
        value={gradientY}
        onChange={(ev, value) => setGradientY(value as number)}
        onChangeCommitted={() => setGradientY(0)}
        valueLabelDisplay="auto"
        marks
      />
      <div className="menu">
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
          onClick={() => setPause(p => !p)}
          startIcon={<PauseIcon />}
        >
          Pause
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
      </div>
    </StyledDiv>
  );
};

const StyledDiv = styled.div`
  display: grid;
  margin: 0 auto;
  grid-template:
    'v c m'
    'b h m'
    / 30px 600px 250px;
  grid-gap: 10px;
  .canvas {
    grid-area: c;
  }
  .gradientX {
    grid-area: h;
  }
  .gradientY {
    grid-area: v;
  }
  .menu {
    grid-area: m;
    display: flex;
    flex-direction: column;
    > * {
      margin-bottom: 5px;
    }
  }
`;

export default Wave2D;
