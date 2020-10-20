import React from 'react';
import FourierGraph from './FourierGraph';
import Wave1D from './Wave1D';
import Wave2D from './Wave2D';
import FourierImage from './FourierImage';
import Home from './Home';

const routes: { path: string; title: string; comp: React.ReactElement }[] = [
  { path: '/', title: 'Home', comp: <Home /> },
  { path: '/wave-1d', title: 'Wave 1D', comp: <Wave1D /> },
  { path: '/wave-2d', title: 'Wave 2D', comp: <Wave2D /> },
  { path: '/fourier-graph', title: '1D Fourier', comp: <FourierGraph /> },
  { path: '/fourier-iamge', title: '2D Fourier', comp: <FourierImage /> }
];

export default routes;
