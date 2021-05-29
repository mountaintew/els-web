import React, { useState } from 'react'
import { fade, makeStyles, withStyles } from '@material-ui/core/styles';
import { AppBar, Badge, Box, Button, Container, Divider, Drawer, Grid, IconButton, InputBase, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, Paper, SwipeableDrawer, Toolbar, Typography } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SearchIcon from '@material-ui/icons/Search';
import clsx from 'clsx';
import LockIcon from '@material-ui/icons/Lock';
import EditIcon from '@material-ui/icons/Edit';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import { useAuth } from '../contexts/AuthContext'
import { useHistory, Link } from 'react-router-dom'
import { Skeleton } from '@material-ui/lab';
import LiveMap from './Dashboard/LiveMap';
import Residents from './Dashboard/Residents';
import firebase from '../util/firebase';
import Geocode from "react-geocode";


const useStyles = makeStyles((theme) => ({
    grow: {
        flexGrow: 1,
        display: 'flex'
    },
    content: {
    },
    container: {
    },

    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },

    },
    search: {
        position: 'relative',
        borderRadius: '10px',
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginRight: theme.spacing(2),
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(3),
            width: 'auto',
        },
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },

    },
    sectionDesktop: {
        display: 'none',
        [theme.breakpoints.up('md')]: {
            display: 'flex',
        },

    },
    list: {
        width: 250,
    },
    fullList: {
        width: 'auto',
    },
    fixedHeightRes: {
        height: 240,
    },
    fixedHeightMap: {
        height: 500,
    },
}));

const StyledMenu = withStyles({
    paper: {
        border: '1px solid #d3d4d5',
    },
})((props) => (
    <Menu
        color='secondary'
        elevation={0}
        getContentAnchorEl={null}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
        }}
        {...props}
    />
));

const StyledMenuItem = withStyles((theme) => ({
    root: {
        '&:focus': {
            backgroundColor: theme.palette.primary.secondary,
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                color: '#222',
            },
        },
    },
}))(MenuItem);

function Dashboard() {
    const classes = useStyles();
    const { currentUser, logout } = useAuth()
    const history = useHistory()
    const iOS = process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent); // swipeable on ios devices
    const dbRef = firebase.database();

    // Functions ######################
    async function handleLogout() {
        try {
            await logout()
            history.push('/login')
        } catch (error) {
            alert("Failed to Logout")
        }
    }
    // Functions ######################

    // Toggles #######################
    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const [state, setState] = React.useState({
        top: false,
        left: false,
        bottom: false,
        right: false,
    });
    const toggleDrawer = (anchor, open) => (event) => {
        if (event && event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setState({ ...state, [anchor]: open });
    };
    const list = (anchor) => (
        <div
            className={clsx(classes.list, {
                [classes.fullList]: anchor === 'top' || anchor === 'bottom',
            })}
            role="presentation"
            onClick={toggleDrawer(anchor, false)}
            onKeyDown={toggleDrawer(anchor, false)}
        >
            {anchor === 'left' ? (
                //left panel
                <Typography>left</Typography>
            ) : (
                //right panel
                <Typography>right</Typography>
            )}
        </div>
    );
    // Toggles #######################


    // Generate Center Location ######
    const [lat, setLat] = useState(0.0)
    const [lng, setLng] = useState(0.0)
    const center = {
        lat: lat,
        lng: lng
    };
    Geocode.setApiKey("AIzaSyCdj9kwcKpn_7zjZov_wk5-RvsnlMmFVOw");
    Geocode.setLanguage("en");
    Geocode.setRegion("ph");
    Geocode.setLocationType("ROOFTOP");
    dbRef.ref('/administrators').orderByChild("email").equalTo(currentUser.email).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const email = Object.keys(snapshot.val())[0]
            const accountRef = dbRef.ref('administrators/' + email);
            accountRef.on('value', (snapshot) => {
                const data = snapshot.val();
                const loc = data.barangay + " " + data.municipality + " " + data.region
                Geocode.fromAddress(loc).then(
                    (response) => {
                        const { lat, lng } = response.results[0].geometry.location;
                        setLat(lat)
                        setLng(lng)
                    },
                    (error) => {
                        console.error(error);
                    }
                );
            });
        }
    }).catch((error) => {
    })
    // Generate Center Location ######

    

    const fixedHeightMap = clsx(classes.paper, classes.fixedHeightMap);
    const fixedHeightRes = clsx(classes.paper, classes.fixedHeightRes);
    return (
        <div>
            <div className={classes.grow}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            edge="start"
                            className={classes.menuButton}
                            color="inherit"
                            aria-label="open drawer"
                            onClick={toggleDrawer('left', true)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography className={classes.title} variant="h6" noWrap>
                            ELS
                        </Typography>
                        <div className={classes.search}>
                            <div className={classes.searchIcon}>
                                <SearchIcon />
                            </div>
                            <InputBase
                                placeholder="Search…"
                                classes={{
                                    root: classes.inputRoot,
                                    input: classes.inputInput,
                                }}
                                inputProps={{ 'aria-label': 'search' }}
                            />
                        </div>
                        <div className={classes.grow} />
                        <IconButton
                            edge="end"
                            aria-label="account of current user"
                            aria-haspopup="true"
                            color="inherit"
                            onClick={handleClick}
                            aria-controls="account-menu"
                            aria-haspopup="true"
                        >
                            <AccountCircleIcon />
                        </IconButton>
                        <StyledMenu
                            id="account-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <StyledMenuItem>
                                <ListItemIcon>
                                    <EditIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Edit Account" />
                            </StyledMenuItem>
                            <StyledMenuItem>
                                <ListItemIcon>
                                    <LockIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Change Password" />
                            </StyledMenuItem>
                            <StyledMenuItem button key='logout' onClick={handleLogout}>
                                <ListItemIcon>
                                    <ExitToAppIcon color='error' fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary="Logout" />
                            </StyledMenuItem>
                        </StyledMenu>
                        <div>
                            {['left', 'right', 'top', 'bottom'].map((anchor) => (
                                <React.Fragment key={anchor}>
                                    <SwipeableDrawer
                                        anchor={anchor}
                                        open={state[anchor]}
                                        onClose={toggleDrawer(anchor, false)}
                                        onOpen={toggleDrawer(anchor, true)}
                                        disableBackdropTransition={!iOS}
                                        disableDiscovery={iOS}
                                    >
                                        {list(anchor)}
                                    </SwipeableDrawer>
                                </React.Fragment>
                            ))}
                        </div>
                    </Toolbar>
                </AppBar>
            </div>
            <main className={classes.content} style={{ height: '100'}}>
                <div className={classes.appBarSpacer} />
                    <Grid container  spacing={2}>
                        {/* Live Map */}
                        <Grid item xs={12} md={8} lg={9}>
                            <Paper className={fixedHeightMap}>
                                {/* {
                                    allMarkerLocations.length === 0 ? 
                                    'Loading' : 
                                } */}
                                <LiveMap center={center}  />
                            </Paper>
                        </Grid>
                        {/* Residents Count */}
                        <Grid item xs={12} md={4} lg={3}>
                            <Paper className={fixedHeightRes}>
                                <Residents />
                            </Paper>
                        </Grid>


                        {/* <Grid item xs={12}>
                            <Paper className={classes.paper}>
                                <Orders />
                            </Paper>
                        </Grid> */}
                    </Grid>
            </main>

        </div>
    )
}

export default Dashboard
