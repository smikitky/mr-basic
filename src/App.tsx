import AppBar from '@material-ui/core/AppBar';
import { makeStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import React, { FC } from 'react';
import {
  BrowserRouter,
  Link,
  Route,
  Switch,
  useLocation
} from 'react-router-dom';
import routes from './routes';

const LinkTab: FC<{ to: string; label: string }> = props => {
  return <Tab component={Link} {...props} />;
};

const App: FC = props => {
  const classes = useStyles();
  return (
    <BrowserRouter>
      <div className={classes.root}>
        <MainNav />
        <div className={classes.content}>
          <Switch>
            {routes.map(route => (
              <Route key={route.path} exact path={route.path}>
                {route.comp}
              </Route>
            ))}
          </Switch>
        </div>
      </div>
    </BrowserRouter>
  );
};

const MainNav: FC = props => {
  const location = useLocation();

  const active = routes.findIndex(route => route.path === location.pathname);

  return (
    <AppBar position="static">
      <Tabs
        value={active}
        aria-label="nav"
        variant="scrollable"
        scrollButtons="auto"
      >
        {routes.map(route => (
          <LinkTab key={route.path} label={route.title} to={route.path} />
        ))}
      </Tabs>
    </AppBar>
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
  }
}));

export default App;
