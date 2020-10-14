import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Toolbar from '@material-ui/core/Toolbar';
import HelpIcon from '@material-ui/icons/HelpOutline';
import Typography from '@material-ui/core/Typography';
import React, { FC } from 'react';
import {
  BrowserRouter,
  Link,
  Route,
  Switch,
  useLocation
} from 'react-router-dom';
import FourierGraph from './FourierGraph';
import Wave1D from './Wave1D';
import Wave2D from './Wave2D';

const LinkTab: FC<{ to: string; label: string }> = props => {
  return <Tab component={Link} {...props} />;
};

const routes: { path: string; title: string; comp: React.ReactElement }[] = [
  { path: '/fourier-graph', title: '1D Fourier', comp: <FourierGraph /> },
  { path: '/wave-1d', title: 'Wave 1D', comp: <Wave1D /> },
  { path: '/wave-2d', title: 'Wave 2D', comp: <Wave2D /> },
  {
    path: '/fourier-iamge',
    title: 'Fourier Image',
    comp: <div>Stay Tuned.</div>
  }
];

const App: FC = props => {
  const classes = useStyles();
  return (
    <BrowserRouter>
      <div className={classes.root}>
        <MainNav />
        <div className={classes.content}>
          <Switch>
            {routes.map(route => (
              <Route key={route.path} path={route.path}>
                {route.comp}
              </Route>
            ))}
            <Route exact path="/">
              <Home />
            </Route>
          </Switch>
        </div>
      </div>
    </BrowserRouter>
  );
};

const MainNav: FC = props => {
  const classes = useStyles();
  const location = useLocation();

  const active = routes.findIndex(route => route.path === location.pathname);

  return (
    <AppBar position="static">
      <Toolbar>
        <Tabs value={active} aria-label="simple tabs example">
          {routes.map(route => (
            <LinkTab key={route.path} label={route.title} to={route.path} />
          ))}
        </Tabs>
        <div className={classes.grow} />
        <div>
          <HelpIcon />
        </div>
      </Toolbar>
    </AppBar>
  );
};

const Home = () => {
  const classes = useStyles();
  return (
    <>
      <Typography variant="h1">MRI Basics</Typography>
      <div className={classes.homeMenu}>
        {routes.map(route => (
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to={route.path}
            size="large"
          >
            {route.title}
          </Button>
        ))}
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  content: {
    flexGrow: 1,
    padding: '15px',
    backgroundColor: '#dddddd'
  },
  grow: {
    flexGrow: 1
  },
  homeMenu: {
    maxWidth: '300px',
    display: 'flex',
    gap: '10px',
    flexDirection: 'column'
  }
}));

export default App;
