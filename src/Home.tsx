import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import routes from './routes';

const Home: FC = () => {
  const classes = useStyles();
  return (
    <>
      <Typography variant="h2">MRI Basics</Typography>
      <div className={classes.homeMenu}>
        {routes.slice(1).map(route => (
          <Button
            key={route.path}
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
      <hr />
      <p>Author: Soichiro Miki</p>
      <ul>
        <li>
          <a href="https://github.com/smikitky/mr-basic">GitHub</a>
        </li>
      </ul>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  homeMenu: {
    maxWidth: '300px',
    display: 'flex',
    gap: '10px',
    flexDirection: 'column'
  }
}));

export default Home;
