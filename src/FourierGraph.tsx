import React, { FC, useRef, useEffect } from 'react';
import styled from 'styled-components';

const FourierGraph: FC = (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let finished = false;
    const canvas = canvasRef.current!;
    let i = 0;
    const tick = () => {
      if (finished) return;
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 15 * Math.sin(i++ / 10) + 16;
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => {
      finished = true;
    };
  }, []);

  return (
    <StyledDiv>
      <div>Description.</div>
      <canvas ref={canvasRef}></canvas>
    </StyledDiv>
  );
};

const StyledDiv = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  canvas {
    width: 100%;
    flex: 1 1 10px;
    background: #ffeeee;
  }
`;

export default FourierGraph;
