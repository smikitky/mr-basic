import React, { FC, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import styled from 'styled-components';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import FourierGraph from './FourierGraph';
import Wave1D from './Wave1D';
import Wave2D from './Wave2D';
import Help from './Help';
import HelpIcon from '@material-ui/icons/HelpOutline';
import Toolbar from '@material-ui/core/Toolbar';
import {
  BrowserRouter,
  Switch,
  Route,
  Link,
  useLocation
} from 'react-router-dom';

const LinkTab: FC<{ to: string; label: string }> = props => {
  return <Tab component={Link} {...props} />;
};

const App: FC = props => {
  return (
    <BrowserRouter>
      <StyledDiv>
        <MainNav />
        <div className="content">
          <Switch>
            <Route path="/fourier-graph">
              <FourierGraph />
            </Route>
            <Route path="/wave-1d">
              <Wave1D />
            </Route>
            <Route path="/wave-2d">
              <Wave2D />
            </Route>
            <Route path="/fourier-image">
              <div>Stay tuned</div>
            </Route>
          </Switch>
        </div>
      </StyledDiv>
    </BrowserRouter>
  );
};

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  }
}));

const MainNav: FC = props => {
  const classes = useStyles();
  const location = useLocation();

  const paths = ['/fourier-graph', '/wave-1d', '/wave-2d', '/fourier-image'];
  const active = paths.indexOf(location.pathname);

  return (
    <AppBar position="static">
      <Toolbar>
        <Tabs value={active} aria-label="simple tabs example">
          <LinkTab label="1D Fourier" to="/fourier-graph" />
          <LinkTab label="Wave" to="/wave-1d" />
          <LinkTab label="Wave 2D" to="/wave-2d" />
          <LinkTab label="2D Fourier" to="/fourier-image" />
        </Tabs>
        <div className={classes.grow} />
        <div>
          <HelpIcon />
        </div>
      </Toolbar>
    </AppBar>
  );
};

const StyledDiv = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  .content {
    flex-grow: 1;
    padding: 15px;
    background-color: #dddddd;
  }
`;

export default App;
