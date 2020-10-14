import React, { FC, useRef, useState, useEffect } from 'react';
import Slider from '@material-ui/core/Slider';
import Button from '@material-ui/core/Button';

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
      const ctx = canvas.getContext('2d')!;
      const { width, height } = canvas.getBoundingClientRect();
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

  const handleSliderMouseUp = () => {
    setGradient(0);
  };

  const handleRephaseClick = () => {
    phases.fill(0);
  };

  return (
    <div>
      <canvas ref={canvasRef} width={1000} height={500} />
      <Slider
        min={-10}
        max={10}
        value={gradient}
        onChange={handleSliderChange}
        onChangeCommitted={handleSliderMouseUp}
        valueLabelDisplay="auto"
        marks
      />
      <div>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRephaseClick}
        >
          Rephase
        </Button>
      </div>
    </div>
  );
};

export default Wave1D;