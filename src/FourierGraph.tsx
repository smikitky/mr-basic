import React, { FC, useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useImmer } from 'use-immer';
import { fft } from 'fft-js';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

const N = 512;

const FourierGraph: FC = props => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [input, setInput] = useImmer<number[]>(() => new Array(N).fill(0));
  const [prevPos, setPrevPos] = useState<{ x: number; y: number } | undefined>(
    undefined
  );
  const [maxLines, setMaxLines] = useState(10);
  const [drawMain, setDrawMain] = useState(true);
  const [dragging, setDragging] = useState(false);

  const draw = () => {
    const canvas = canvasRef.current!;
    const { width, height } = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, width, height);
    const amp = fft(input);
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
        let y = Math.cos(w * x) * amp[k][0] - Math.sin(w * x) * amp[k][1];
        if (k > 0)
          y +=
            Math.cos(w2 * x) * amp[N - k][0] - Math.sin(w2 * x) * amp[N - k][1];
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
  };

  const handleMouseDown = () => {
    setDragging(true);
  };

  const handleMouseUp = () => {
    setDragging(false);
    setPrevPos(undefined);
  };

  const handleMouseMove = (ev: React.MouseEvent) => {
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
  }, [input, maxLines, drawMain]);

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
    <StyledDiv>
      <div className="bar">
        <TextField
          label="Draw lines"
          type="number"
          size="small"
          InputLabelProps={{ shrink: true }}
          value={maxLines}
          onChange={handleMaxLinesChange}
        />
        &ensp;
        <FormControlLabel
          control={
            <Switch
              onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                setDrawMain(ev.target.checked)
              }
              checked={drawMain}
            />
          }
          label="Draw main"
        />
      </div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseOut={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
    </StyledDiv>
  );
};

const StyledDiv = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  .bar {
    display: flex;
    align-items: center;
  }
  canvas {
    cursor: crosshair;
    width: 100%;
    flex: 1 1 10px;
    background: #eeeeee;
  }
`;

export default FourierGraph;
