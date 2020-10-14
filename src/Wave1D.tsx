import React, { FC, useRef, useState, useEffect } from 'react';
import Slider from '@material-ui/core/Slider';
import Button from '@material-ui/core/Button';
import SyncIcon from '@material-ui/icons/Sync';
import styled from 'styled-components';

const N = 30;

const Wave1D: FC = props => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gradient, setGradient] = useState(0);
  const phasesRef = useRef<number[]>();
  phasesRef.current = phasesRef.current ?? new Array(N).fill(0);
  const phases = phasesRef.current;
  const lastRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current!;
    let finished = false;
    const tick = (now: DOMHighResTimeStamp) => {
      if (finished) return;
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const ctx = canvas.getContext('2d')!;
      const elapsed = lastRef.current ? now - lastRef.current : 0;
      lastRef.current = now;

      ctx.clearRect(0, 0, width, height);

      phases.forEach((phase, i) => {
        phases[i] += (elapsed + ((i - N / 2) * gradient) / 10) / 500;
      });

      ctx.fillStyle = '#0088ff';
      phases.forEach((phase, i) => {
        ctx.beginPath();
        const h = height * (0.5 + 0.5 * Math.sin(phase));
        ctx.rect((i * width) / N, height - h, width / N - 2, h);
        ctx.fill();
      });

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => {
      finished = true;
    };
  }, [gradient]);

  const handleSliderChange = (ev: any, value: number | number[]) => {
    setGradient(value as number);
  };

  const handleSliderComitted = () => {
    setGradient(0);
  };

  const handleRephaseClick = () => {
    phases.fill(0);
  };

  return (
    <StyledDiv>
      <canvas ref={canvasRef} width={1000} height={500} />
      <Slider
        min={-10}
        max={10}
        value={gradient}
        onChange={handleSliderChange}
        onChangeCommitted={handleSliderComitted}
        valueLabelDisplay="on"
        marks
      />
      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRephaseClick}
          startIcon={<SyncIcon />}
        >
          Rephase
        </Button>
      </div>
    </StyledDiv>
  );
};

const StyledDiv = styled.div`
  canvas {
    width: 100%;
    height: 500px;
    margin-bottom: 35px;
  }
`;

export default Wave1D;
