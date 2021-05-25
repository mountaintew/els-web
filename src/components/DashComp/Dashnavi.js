import React from 'react'
import {makeStyles,fade} from '@material-ui/core/styles';
import {Container,AppBar,Toolbar,Typography,InputBase} from '@material-ui/core';
import {SearchIcon} from '@material-ui/icons/Search';
import MoreIcon from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import {Menu,MenuItem} from '@material-ui/core';
import {Link,useHistory} from 'react-router-dom';


const useStyles = makeStyles((theme) => ({
  root:{
    flexGrow: 1,
  }, 
  title: {
    flexGrow: 1,
    padding: theme.spacing(1,1,1,1),
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',},
  },
  inputRoot: {
    color: 'inherit',
  },
  inInput: {
    padding: theme.spacing(1, 1, 1, 1),
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
      width: '20ch',},},
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
    backgroundColor: fade(theme.palette.common.white, 0.25),},
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',},
  },
  IconButton: {
    arialabel:'display more actions', 
    color:'inherit',
    position: 'relative',  
  },

    
}));

export default function Navi () {
  const classes=useStyles();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const history=useHistory ();
  function Logout() {
  localStorage.clear();
  history.push('/login');
  }

  return (
      <div className={classes.root}>
        <AppBar
        position="static"
        color="primary">
          <Toolbar>
            <Typography className={classes.title} variant="h5" noWrap>
              Emergency Location Dashboard
            </Typography>

            <div className={classes.search}>
            {/*dito dapat yung icon*/}
            {/*<div className={classes.searchIcon}><SearchIcon/></div>*/}
              <InputBase
              placeholder="Search"
              classes={{
                root: classes.inputRoot,
                input: classes.inInput,}}
                inputProps={{'aria-label': 'search'}}>
              </InputBase>
            </div>

            <div>
              <IconButton
                className={classes.IconButton}
                onClick={handleMenu}
                color="inherit"> <MoreIcon/> 
              </IconButton>

              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',}}
                open={open}
                onClose={handleClose}>
                <MenuItem onClick={handleClose}>My Account</MenuItem>
                <MenuItem onClick={handleClose}>Notifications</MenuItem>
                <MenuItem onClick={Logout}>Logout</MenuItem>
              </Menu>
            </div>
          </Toolbar>
        </AppBar>
      </div>
  )

}
