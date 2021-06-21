import React, { useEffect, useState, useRef } from 'react'
import { fade, makeStyles, withStyles } from '@material-ui/core/styles';
import { CssBaseline, useMediaQuery, Accordion, AccordionDetails, AccordionSummary, AppBar, Badge, Box, Button, Container, Dialog, DialogContent, DialogTitle, Divider, Drawer, FormControl, FormHelperText, Grid, IconButton, InputBase, InputLabel, List, ListItem, ListItemIcon, ListItemText, Menu, MenuItem, NativeSelect, Paper, Select, SwipeableDrawer, Toolbar, Typography, Snackbar, Avatar } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SearchIcon from '@material-ui/icons/Search';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext'
import { useHistory, Link } from 'react-router-dom'
import { Skeleton } from '@material-ui/lab';
import LiveMap from './Dashboard/LiveMap';
import Residents from './Dashboard/Residents';
import firebase from '../util/firebase';
import Geocode from "react-geocode";
import { ExpandMore } from '@material-ui/icons';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import MuiAlert from '@material-ui/lab/Alert';
import { amber, grey } from '@material-ui/core/colors';
import Reports from './Dashboard/Reports'

import LockIcon from '@material-ui/icons/Lock';
import EditIcon from '@material-ui/icons/Edit';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ArchiveRoundedIcon from '@material-ui/icons/ArchiveRounded';
import AssignmentRoundedIcon from '@material-ui/icons/AssignmentRounded';
import PeopleAltRoundedIcon from '@material-ui/icons/PeopleAltRounded';
import ReactWeather, { useOpenWeather } from 'react-open-weather';
import AnnouncementRoundedIcon from '@material-ui/icons/AnnouncementRounded';
import DirectionsRunRoundedIcon from '@material-ui/icons/DirectionsRunRounded';
import zIndex from '@material-ui/core/styles/zIndex';



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

const weatherStyle = {
    fontFamily: 'Montserrat',
    gradientStart: 'rgba(0,0,0,0)',
    gradientMid: 'rgba(0,0,0,0)',
    gradientEnd: 'rgba(0,0,0,0)',
    locationFontColor: '#222',
    todayTempFontColor: '#222',
    todayDateFontColor: '#222',
    todayRangeFontColor: '#222',
    todayDescFontColor: '#222',
    todayInfoFontColor: '#222',
    todayIconColor: '#212121',
    forecastBackgroundColor: '#ECEFF1',
    forecastSeparatorColor: '#DDD',
    forecastDateColor: '#777',
    forecastDescColor: '#777',
    forecastRangeColor: '#777',
    forecastIconColor: '#4BC4F7',
};


function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function Dashboard() {

    const classes = useStyles();
    const { currentUser, logout } = useAuth()
    const history = useHistory()
    const iOS = process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent); // swipeable on ios devices
    const dbRef = firebase.database();
    const MINUTE_MS = 10000;
    const [adminName, setAdminName] = useState('')

    const [severity, setSeverity] = useState('error')
    const [snackMessage, setSnackMessage] = useState('')
    const [snack, setSnack] = useState(false)
    const handleSnackClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnack(false);
    };
    Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
    Geocode.setLanguage("en");
    Geocode.setRegion("ph");
    Geocode.setLocationType("ROOFTOP");

    const reportsRef = useRef(null)

    const scrollToReports = () => reportsRef.current.scrollIntoView()
    // run this function from an event handler or an effect to execute scroll 


    // Functions ######################
    async function handleLogout() {
        try {
            await logout()
            history.push('/login')
        } catch (error) {
            alert("Failed to Logout")
        }
    }


    useEffect(() => {
        const interval = setInterval(() => {
            setAdminName('')
            // Main algorithm --------------------------------------------------------------------------------------------
            // (1) Get all users with timestamp
            // (2) Get the difference of the current timestamp and the user's last timestamp
            // (3) Convert the difference into minutes
            // (4) If the minutes is greater than 5 (minutes) and the location is toggled,
            // (5) declare it as an emergency, send the coordinates as emergency markers and change user's state to emergency

            // const checkOnlineStatus = async () => {
            //     try {
            //         const online = await fetch("/1pixel.png");
            //         return online.status >= 200 && online.status < 300; // either true or false
            //     } catch (err) {
            //         return false; // definitely offline
            //     }
            // };

            // setInterval(async () => {
            //     const result = await checkOnlineStatus();
            //     const statusDisplay = document.getElementById("status");
            //     statusDisplay.textContent = result ? "Online" : "OFFline";
            // }, 3000); // probably too often, try 30000 for every 30 seconds

            dbRef.ref('/Users').orderByChild('/info/timestamp').once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    Object.values(snapshot.val()).map((v) => {
                        if (v.info.timestamp !== undefined) {
                            if (v.info.state !== "Emergency") {
                                var difference = new Date().getTime() - v.info.timestamp // (2)
                                var identifier = difference / 60000 // (3)
                                if (identifier > 5) { // (4)
                                    if (v.info.toggled) {
                                        // (5)
                                        dbRef.ref('/Users/' + v.info.number + '/info/state').set('Emergency').catch((error) => {
                                            console.log('Connection Lost');
                                        })
                                        dbRef.ref('/Users/' + v.info.number + '/info/toggled').set(false).catch((error) => {
                                            console.log('Connection Lost');
                                            if (error) {

                                            }
                                        })
                                        console.log(v.info.fullname + " toggled " + v.info.toggled);
                                        dbRef.ref('/Markers/' + v.info.number).set({
                                            lat: v.info.lat,
                                            lng: v.info.lng,
                                            fullname: v.info.fullname,
                                            mobile: v.info.number,
                                            locality: v.info.locality,
                                            state: "Emergency",
                                            details: "ELS Generated",
                                            toggled: v.info.toggled,
                                            message: "Resident Location has been inactive for 5 Minutes"

                                        }).catch((error) => {
                                            console.log('Connection Lost');
                                        })
                                    }
                                }
                            }
                        }
                    })
                } else {
                    console.log('not exist');
                }
            })


            // Main algorithm --------------------------------------------------------------------------------------------
        }, MINUTE_MS);


        dbRef.ref('/administrators').orderByChild('email').equalTo(currentUser.email).once('value').then((snapshot) => {
            if (snapshot.exists()) {
                Object.values(snapshot.val()).map((val) => {
                    setLocality(val.barangay)
                })
            }
        })

        return () => clearInterval(interval);
    }, [])
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
            {anchor === 'left' && (
                <div>
                    <div className={classes.toolbar} />
                    <Divider />
                    <List>
                        {/* {['Reports', 'Archive', 'Administrators'].map((text, index) => ( */}
                        <ListItem button key="Reports" onClick={scrollToReports}>
                            <ListItemIcon><AssignmentRoundedIcon /></ListItemIcon>
                            <ListItemText primary="Reports" />
                        </ListItem>

                        <ListItem button key="Administrator">
                            <ListItemIcon><PeopleAltRoundedIcon /></ListItemIcon>
                            <ListItemText primary="Administrators" />
                        </ListItem>
                        <ListItem button key="Response Team">
                            <ListItemIcon><DirectionsRunRoundedIcon /></ListItemIcon>
                            <ListItemText primary="Response Team" />
                        </ListItem>
                        <ListItem button key="Announcements">
                            <ListItemIcon><AnnouncementRoundedIcon /></ListItemIcon>
                            <ListItemText primary="Announcements" />
                        </ListItem>
                    </List>
                    <List className={classes.bottomPush}>
                        {/* {['Reports', 'Archive', 'Administrators'].map((text, index) => ( */}
                        <ListItem button key="Archive">
                            <ListItemIcon><ArchiveRoundedIcon /></ListItemIcon>
                            <ListItemText primary="Archive" />
                        </ListItem>
                    </List>
                </div>


            )}
        </div>
    );
    // Toggles #######################


    // Generate Center Location ######
    const [lat, setLat] = useState(0.0)
    const [lng, setLng] = useState(0.0)
    const [locality, setLocality] = useState(null)
    const center = {
        lat: lat,
        lng: lng
    };
    Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
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

    const [avatar, setAvatar] = useState('?')

    currentUser.email && dbRef.ref('/administrators').orderByChild('email').equalTo(currentUser.email).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            Object.values(snapshot.val()).map((val) => {
                setAvatar(val.firstname.charAt(0).toUpperCase())
            })
        }
    });

    // Search By 
    const [searchBy, setSearchBy] = useState('lastname')
    const [searchPlaceholder, setSearchPlaceholder] = useState('Search...')
    const [searchTerm, setSearchTerm] = useState('')
    const [openResultDialog, setResultDialog] = useState(false)
    const [searchResult, setSearchResult] = useState(null)
    const [expanded, setExpanded] = React.useState(false);

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const handleSearchBy = (e) => {
        setSearchBy(e.target.value)

        switch (e.target.value) {
            case 'number':
                setSearchPlaceholder('+63...')
                break
            case 'firstname':
                setSearchPlaceholder('Search by first name...')
                break
            case 'lastname':
                setSearchPlaceholder('Search by last name...')
                break
            case 'fullname':
                setSearchPlaceholder('Search by full name...')
                break
            default:
                setSearchPlaceholder('Search...')
        }
    }

    const handleSearchterm = (e) => {
        setSearchTerm(e.target.value)
    }

    const closeResultDialog = () => {
        setResultDialog(false)
    }

    const search = () => {
        searchTerm &&
            dbRef.ref('/Users').orderByChild('info/' + searchBy).equalTo(searchTerm).once('value').then((snapshot) => {
                if (snapshot.exists()) {

                    setSearchResult([Object.values(snapshot.val())[0].info])
                    setResultDialog(true)
                } else {
                    setSearchResult(null)
                    setSnack(true)
                    setSeverity('error')
                    setSnackMessage('Resident not found.')
                }
            })
    }
    const fixedHeightMap = clsx(classes.paper, classes.fixedHeightMap);
    const fixedHeightRes = clsx(classes.paper, classes.fixedHeightRes);

    const { data, isLoading, errorMessage } = useOpenWeather({
        key: process.env.REACT_APP_OPENWEATHER_KEY,
        lat: lat,
        lon: lng,
        lang: 'en',
        unit: 'metric', // values are (metric, standard, imperial)
    });


    return (
        <div >
            {/* SnackBar ##################### */}
            <Snackbar open={snack} autoHideDuration={4000} onClose={handleSnackClose}>
                <Alert onClose={handleSnackClose} severity={severity}>
                    {snackMessage}
                </Alert>
            </Snackbar>
            {/* SnackBar ##################### */}

            {/* Main ##################### */}
            <div className={classes.root}>
                <CssBaseline />

                <AppBar position="absolute" style={{backgroundColor: 'rgba(207, 216, 220, 1)'}} elevation={0} >
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


                            <div className={classes.search} >
                                <Button
                                    onClick={search}
                                    className={classes.searchIcon}
                                    style={{ borderRadius: '5px 0px 0px 5px', minWidth: '40px' }}
                                >
                                    <SearchIcon />
                                </Button>

                                <InputBase
                                    placeholder={searchPlaceholder}
                                    classes={{
                                        root: classes.inputRoot,
                                        input: classes.inputInput,
                                    }}
                                    inputProps={{ 'aria-label': 'search' }}
                                    onChange={handleSearchterm}
                                    value={searchTerm}
                                />

                                <FormControl className={classes.margin} >
                                    <Select

                                        value={searchBy}
                                        onChange={handleSearchBy}
                                        input={<BootstrapInput />}
                                        defaultValue={searchBy}
                                    >
                                        <MenuItem value={'fullname'}>Full Name</MenuItem>
                                        <MenuItem value={'firstname'}>First Name</MenuItem>
                                        <MenuItem value={'lastname'}>Last Name</MenuItem>
                                        <MenuItem value={'number'}>Mobile</MenuItem>
                                    </Select>
                                </FormControl>

                            </div>
                            <div className={classes.grow} />

                            <Typography>{adminName}</Typography>
                            <IconButton
                                edge="end"
                                aria-label="account of current user"
                                aria-haspopup="true"
                                color="inherit"
                                onClick={handleClick}
                                aria-controls="account-menu"
                                aria-haspopup="true"
                            >
                                <Avatar style={{ backgroundColor: '#fcbc20', color: '#222222' }}>{avatar}</Avatar>
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
                    <Container className={classes.containerAlt} style={{ backgroundColor: 'rgba(0,0,0,0)' }}>
                        <Grid container spacing={2} >
                            <Grid item xs={12} md={8} lg={9}>
                                <Paper className={fixedHeightMap} elevation={1} style={{ backgroundColor: 'rgba(0,0,0,0)', borderRadius: '20px' }}>
                                    <LiveMap center={center} />
                                </Paper>
                            </Grid>
                            <Grid item xs={12} md={4} lg={3} >
                                <Paper className={fixedHeightRes} elevation={1} style={{ backgroundColor: 'rgba(0,0,0,0)', borderRadius: '20px 20px 20px 20px' }}>
                                    <Residents lat={lat} lng={lng} />
                                </Paper>
                            </Grid>
                        </Grid>
                    </Container>
                    <Container className={classes.container} style={{ backgroundColor: 'rgba(0,0,0,0)' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={8} lg={8}>
                                <div ref={reportsRef} >
                                    <Reports />
                                </div>
                            </Grid>
                            <Grid item xs={12} md={4} lg={4}>
                                <div style={{
                                    backdropFilter: 'blur(50px)',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    boxShadow: '0px 0px 2px #222',
                                }}>
                                    <ReactWeather
                                        style={{ borderRadius: '20px', }}
                                        theme={weatherStyle}
                                        isLoading={isLoading}
                                        errorMessage={errorMessage}
                                        data={data}
                                        lang="en"
                                        locationLabel={locality && locality.toLowerCase().charAt(0).toUpperCase() + locality.toLowerCase().slice(1)}
                                        unitsLabels={{ temperature: 'C', windSpeed: 'Km/h' }}
                                        showForecast
                                    /></div>
                            </Grid>

                        </Grid>

                    </Container>
                </main>

            </div>
            {/* Main ##################### */}

            {/* Dialog ##################### */}
            <Dialog
                fullWidth
                open={openResultDialog}
                onClose={closeResultDialog}

            >
                <DialogTitle style={{ backgroundColor: '#eceff1' }}>
                    {searchResult && searchResult.length + ` matching result${searchResult.length > 1 ? 's' : ''}...`}
                </DialogTitle>
                <DialogContent style={{ backgroundColor: '#eceff1' }}>

                    {searchResult && searchResult.map((val) =>
                        <Accordion
                            key={val.number}
                            style={{ backgroundColor: '##cfd8dc' }}
                            expanded={expanded === val.number}
                            onChange={handleAccordionChange(val.number)}
                        >
                            <AccordionSummary elevation={0} expandIcon={<ExpandMore />}>
                                <div style={{ alignItems: 'center', display: 'flex' }}>
                                    {val.state === "Safe" ? <FiberManualRecordIcon style={{ color: 'limegreen' }} /> : <FiberManualRecordIcon style={{ color: 'red' }} />}

                                    <Typography variant="caption">&nbsp;&nbsp;{val.firstname + " " + val.lastname}</Typography>
                                    <Typography variant="caption">&nbsp;&nbsp;({val.number})</Typography>
                                </div>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Grid>
                                    <Typography variant="subtitle2" component="p">
                                        Last Location Sent: {val.timestamp ? new Date(val.timestamp).toLocaleString() : 'Not known'}
                                    </Typography>
                                    <br />
                                    <Typography variant="caption" component="p">
                                        Sex: {val.sex}
                                        <br />
                                        Age: {val.age}
                                        <br />
                                        Height: {val.height}
                                        <br />
                                        Weight: {val.weight}
                                        <br />
                                        Blood Type: {val.bloodtype}
                                    </Typography>
                                    <br />
                                    <Typography variant="body2">
                                        Medical Conditions:
                                    </Typography>
                                    <Typography variant="caption">
                                        {val.conditions}
                                    </Typography>
                                    <br />
                                    <br />
                                    <Typography variant="body2">
                                        Allergies:
                                    </Typography>
                                    <Typography variant="caption">
                                        {val.allergies}
                                    </Typography>
                                    <br />
                                    <br />
                                    <Typography variant="body2">
                                        Medical Notes:
                                    </Typography>
                                    <Typography variant="caption">
                                        {val.mednotes}
                                    </Typography>
                                </Grid>
                            </AccordionDetails>
                        </Accordion >
                    )}
                </DialogContent>
            </Dialog>
            {/* Dialog ##################### */}

        </div>
    )
}

export default Dashboard
