import { makeStyles } from '@material-ui/core/styles';
import React, { FC, useRef, useEffect } from 'react';
import beans from './images/beans.jpg';
import cherry from './images/cherry.jpg';
import lenna from './images/lenna.jpg';
import snow from './images/snow.jpg';
import starstripe from './images/starstripe.jpg';
import zebra from './images/zebra.jpg';

const images = { beans, cherry, lenna, snow, starstripe, zebra };

const FourierImage: FC = props => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {Object.values(images).map(image => (
        <ImageSet url={image} />
      ))}
    </div>
  );
};

const ImageSet: FC<{ url: string }> = props => {
  const { url } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const { width, height } = canvas;
    const ctx = canvas.getContext('2d')!;
    const image = new Image();
    image.src = url;
    image.addEventListener('load', () => {
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0);
    });
  }, []);

  return <canvas ref={canvasRef} width={256} height={256} />;
};

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    display: 'flex',
    flexFlow: 'row wrap',
    gap: '10px',
    alignItems: 'start',
    alignContent: 'start'
  }
}));

export default FourierImage;
