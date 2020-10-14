import React, { FC, useState } from 'react';
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

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  }
}));

const App: FC = props => {
  const classes = useStyles();
  const [tab, setTab] = useState(0);

  const handleChange = (event: any, value: number) => {
    setTab(value);
  };

  return (
    <StyledDiv>
      <AppBar position="static">
        <Toolbar>
          <Tabs
            value={tab}
            onChange={handleChange}
            aria-label="simple tabs example"
          >
            <Tab label="1D Fourier" />
            <Tab label="Wave" />
            <Tab label="Wave 2D" />
            <Tab label="2D Fourier" />
          </Tabs>
          <div className={classes.grow} />
          <div>
            <HelpIcon />
          </div>
        </Toolbar>
      </AppBar>
      <div className="content">
        {tab === 0 && <FourierGraph />}
        {tab === 1 && <Wave1D />}
        {tab === 2 && <Wave2D />}
        {tab === 3 && <div>Bar</div>}
      </div>
    </StyledDiv>
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
