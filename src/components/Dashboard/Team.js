import { List, ListItem, Divider, AppBar, Avatar, Button, Container, CssBaseline, FormControl, IconButton, InputBase, ListItemIcon, Menu, MenuItem, Select, SwipeableDrawer, Toolbar, Typography, ListItemText, Grid, Paper, Box } from '@material-ui/core'
import React, { useState } from 'react'
import { fade, makeStyles, withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext'
import { useHistory, Link } from 'react-router-dom'

import MenuIcon from '@material-ui/icons/Menu';
import LockIcon from '@material-ui/icons/Lock';
import EditIcon from '@material-ui/icons/Edit';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PeopleAltRoundedIcon from '@material-ui/icons/PeopleAltRounded';
import AnnouncementRoundedIcon from '@material-ui/icons/AnnouncementRounded';
import ArchiveRoundedIcon from '@material-ui/icons/ArchiveRounded';
import DashboardRoundedIcon from '@material-ui/icons/DashboardRounded';
import SupervisedUserCircleRoundedIcon from '@material-ui/icons/SupervisedUserCircleRounded';

const BootstrapInput = withStyles((theme) => ({
    root: {
        'label + &': {
            marginTop: theme.spacing(3),
        },
    },
    input: {
        borderRadius: 4,
        position: 'relative',
        fontSize: 16,
        padding: '10px 26px 10px 12px',
        // Use the system font instead of the default Roboto font.
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        '&:focus': {
            borderRadius: 4,
        },
    },
}))(InputBase);

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        height: '100vh',
        background: 'url(/Wave.svg)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',

    },
    toolbar: theme.mixins.toolbar,
    grow: {
        flexGrow: 1,
        display: 'flex'
    },

    content: {
        flexGrow: 1,
        overflow: 'auto',
    },
    appBarSpacer: theme.mixins.toolbar,
    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    },
    containerAlt: {
        paddingBottom: theme.spacing(4),
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
        borderRadius: theme.shape.borderRadius,
        backgroundColor: 'rgba(255,255,255,0.4)',
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
        display: 'flex',
        alignItems: 'center'
    },
    searchIcon: {
        height: '100%',
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
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },

    },
    bottomPush: {
        position: "fixed",
        bottom: 0,
        textAlign: "center",
        width: '250px',

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
        height: 500,
    },
    fixedHeightMap: {
        height: 500,
    },
    formControl: {
        minWidth: 80,
    },
    bordered: {
        borderRadius: '5px',
    },
    debug: {
        border: '1px solid red'
    }
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


function Team() {

    const iOS = process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent); // swipeable on ios devices
    const { currentUser, logout } = useAuth()
    const history = useHistory()

    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const classes = useStyles();

    const [state, setState] = useState({
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
            {anchor === 'left' && (
                <div>
                    <div className={classes.toolbar} />
                    <Divider />
                    <List>
                        {/* {['Reports', 'Archive', 'Administrators'].map((text, index) => ( */}
                        <ListItem button key="Dashboard" onClick={() => { history.push('/') }}>
                            <ListItemIcon><DashboardRoundedIcon /></ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItem>
                        <ListItem button key="Departments">
                            <ListItemIcon><SupervisedUserCircleRoundedIcon /></ListItemIcon>
                            <ListItemText primary="Departments" />
                        </ListItem>
                        <ListItem button key="Announcements">
                            <ListItemIcon><AnnouncementRoundedIcon /></ListItemIcon>
                            <ListItemText primary="Announcements" />
                        </ListItem>
                    </List>
                </div>


            )}
        </div>
    );
    // Toggles #######################

    // Functions ######################
    async function handleLogout() {
        try {
            await logout()
            history.push('/login')
        } catch (error) {
            alert("Failed to Logout")
        }
    }



    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar position="absolute" style={{ backgroundColor: 'rgba(207, 216, 220, 1)' }} elevation={0} >
                <Container>
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
                            <Avatar style={{ backgroundColor: '#fcbc20', color: '#222222' }}>L</Avatar>
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
                            <React.Fragment key="left">
                                <SwipeableDrawer
                                    anchor="left"
                                    open={state["left"]}
                                    onClose={toggleDrawer("left", false)}
                                    onOpen={toggleDrawer("left", true)}
                                    disableBackdropTransition={!iOS}
                                    disableDiscovery={iOS}
                                >
                                    {list("left")}
                                </SwipeableDrawer>
                            </React.Fragment>
                        </div>
                    </Toolbar>
                </Container>
            </AppBar>
            <main className={classes.content} style={{ flexGrow: '1' }}>
                <div className={classes.appBarSpacer} />
                <Container className={classes.container}>
                    <Grid
                        container
                        spacing={2}

                    >
                        <Grid item xs={12} md={6} lg={3} >

                            <Button
                                fullWidth
                                size="small"
                                className={classes.bordered}
                                style={{
                                    backgroundImage: 'linear-gradient(to bottom right,#e57373, #FFB74D)',
                                    textAlign: 'left',
                                    textTransform: 'capitalize'
                                }}
                            >
                                <Box display="flex" flexDirection="row" >
                                    <Box flexGrow={1} display="flex" flexDirection="column" justifyContent="center">
                                        <Typography variant="body1" style={{ marginLeft: '30px', fontWeight: 'bold', color: '#FAFAFA' }}>Fire Department</Typography>
                                    </Box>
                                    <Box style={{ margin: '18px'  }}>
                                        <Avatar src='/deptIcons/fire.svg' variant='circle' style={{ opacity: '1' }}></Avatar>
                                    </Box>
                                </Box>
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={6} lg={3} >
                            <Button
                                fullWidth
                                size="small"
                                className={classes.bordered}
                                style={{
                                    backgroundImage: 'linear-gradient(to bottom right,#009688, #90CAF9)',
                                    textAlign: 'left',
                                    textTransform: 'capitalize'
                                }}
                            >
                                <Box display="flex" flexDirection="row" >
                                    <Box flexGrow={1} display="flex" flexDirection="column" justifyContent="center">
                                        <Typography variant="body1" style={{ marginLeft: '30px', fontWeight: 'bold', color: '#FAFAFA' }}>Barangay Security Force</Typography>
                                    </Box>
                                    <Box style={{ margin: '18px'  }}>
                                        <Avatar src='/deptIcons/security.svg' variant='circle' style={{ opacity: '1' }}></Avatar>
                                    </Box>
                                </Box>
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={6} lg={3} >
                            <Button
                                fullWidth
                                size="small"
                                className={classes.bordered}
                                style={{
                                    backgroundImage: 'linear-gradient(to bottom right,#43A047, #9CCC65)',
                                    textAlign: 'left',
                                    textTransform: 'capitalize'
                                }}
                            >
                                <Box display="flex" flexDirection="row" >
                                    <Box flexGrow={1} display="flex" flexDirection="column" justifyContent="center">
                                        <Typography variant="body1" style={{ marginLeft: '30px', fontWeight: 'bold', color: '#FAFAFA' }}>Health Department</Typography>
                                    </Box>
                                    <Box style={{ margin: '18px'  }}>
                                        <Avatar src='/deptIcons/health.svg' variant='circle' style={{ opacity: '1' }}></Avatar>
                                    </Box>
                                </Box>
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={6} lg={3} >
                    
                            <Button
                                fullWidth
                                size="small"
                                className={classes.bordered}
                                style={{
                                    backgroundImage: 'linear-gradient(to bottom right,#00897B, #9FA8DA)',
                                    textAlign: 'left',
                                    textTransform: 'capitalize'
                                }}
                            >
                                <Box display="flex" flexDirection="row" >
                                    <Box flexGrow={1} display="flex" flexDirection="column" justifyContent="center">
                                        <Typography variant="body1" style={{ marginLeft: '30px', fontWeight: 'bold', color: '#FAFAFA' }}>Risk Reduction Department</Typography>
                                    </Box>
                                    <Box style={{ margin: '18px'  }}>
                                        <Avatar src='/deptIcons/risk.svg' variant='circle' style={{ opacity: '1' }}></Avatar>
                                    </Box>
                                </Box>
                            </Button>




                        </Grid>








                    </Grid>
                </Container>

            </main>
        </div>
    )
}

export default Team
