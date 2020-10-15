import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Slider from '@material-ui/core/Slider';
import { makeStyles } from '@material-ui/core/styles';
import SyncIcon from '@material-ui/icons/Sync';
import React, { FC, useEffect, useRef, useState } from 'react';

const useStyles = makeStyles(theme => ({
  menu: { padding: '10px' },
  canvas: {
    width: '100%',
    height: '500px',
    marginTop: '10px',
    marginBottom: '35px'
  }
}));

const N = 30;

const Wave1D: FC = props => {
  const classes = useStyles();
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

      phases.forEach((phase, i) => {
        phases[i] += (elapsed + ((i - N / 2) * gradient) / 10) / 500;
      });

      ctx.fillStyle = '#ffffff';
      if (gradient !== 0) {
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        const luminance = 100 - Math.abs(gradient) * 5;
        grad.addColorStop(gradient > 0 ? 0 : 1, `hsl(220, 50%, ${luminance}%)`);
        grad.addColorStop(0.5, '#ffffff');
        grad.addColorStop(gradient > 0 ? 1 : 0, `hsl(30, 50%, ${luminance}%)`);
        ctx.fillStyle = grad;
      }
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#00aaff';
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
  }, [gradient, phases]);

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
    <div>
      <Card className={classes.menu}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleRephaseClick}
          startIcon={<SyncIcon />}
        >
          Rephase
        </Button>
      </Card>
      <canvas
        ref={canvasRef}
        className={classes.canvas}
        width={1000}
        height={500}
      />
      <Slider
        min={-10}
        max={10}
        value={gradient}
        onChange={handleSliderChange}
        onChangeCommitted={handleSliderComitted}
        valueLabelDisplay="on"
        marks
      />
    </div>
  );
};

export default Wave1D;
