import React, { useState, useEffect } from 'react'
import Geocode from "react-geocode";
import { GoogleMap, InfoWindow, useLoadScript, LoadScript, Marker, DistanceMatrixService } from '@react-google-maps/api';
import mapStyle from './mapStyle';
import { TrafficLayer, Polygon } from '@react-google-maps/api';
import firebase from '../../util/firebase';
import useSound from 'use-sound';
import alerton from './Sfx/alertsound.wav'
import alertoff from './Sfx/alertoff.wav'
import clsx from 'clsx';
import anim from './Sfx/anim.svg'
import { Slider, Select, MenuItem, IconButton, Accordion, AccordionDetails, AccordionSummary, Avatar, Button, Card, CardActionArea, CardActions, CardContent, Container, Grid, SwipeableDrawer, Typography, Slide, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Paper, TextField, Snackbar } from '@material-ui/core';
import { fade, makeStyles, withStyles } from '@material-ui/core/styles';
import { ExpandMore, TrafficIcon } from '@material-ui/icons';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import warningicon from './warning.svg'
import MuiAlert from '@material-ui/lab/Alert';
import { useForm } from 'react-hook-form'
import replies from './replies'
import { Autocomplete } from '@material-ui/lab';
import { createMuiTheme, ThemeProvider } from '@material-ui/core'
import { amber } from '@material-ui/core/colors';
import { useAuth } from '../../contexts/AuthContext'

const customfont = createMuiTheme({
    palette: {
        primary: amber,
    },
    typography: {
        fontFamily: 'Lato',
    },
});

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}
const containerStyle = {
    width: '100',
    height: '500px'
};

const libraries = ["places"];

const gmapoptions = {
    zoomControl: true,
    styles: [{
        "featureType": "poi.business",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },]
}

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
    root: {

        flexGrow: 1,
        minWidth: 250,
        maxWidth: 250,
        padding: '5px'
    },
    pos: {
        marginBottom: 12,
    },
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
    }
}));
function LiveMap(props) {
    const { handleSubmit, clearErrors, setError, watch, register, unregister, formState: { errors, isValid }, } = useForm({ mode: "all" });
    const classes = useStyles();
    const [selectedMarker, setSelectedMarker] = useState(null)
    const [floodpaths, setFloodpaths] = useState([])
    const center = props.center
    const dbRef = firebase.database();
    const [markers, setMarkers] = useState([]);
    const [resident, setResident] = useState(null);
    const [response, setResponse] = useState(null);
    const [respondOpen, setRespondOpen] = useState(false)
    const MINUTE_MS = 5000;
    const [appState, setAppState] = useState(null)
    const [message, setMessage] = useState('')
    const { currentUser } = useAuth()
    const [severity, setSeverity] = useState('error')
    const [snackMessage, setSnackMessage] = useState('')
    const [snack, setSnack] = useState(false)
    const [barangayId, setBarangayId] = useState()

    const handleSnackClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnack(false);
    };

    let city;
    Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
    Geocode.setLanguage("en");
    Geocode.setRegion("ph");
    Geocode.setLocationType("ROOFTOP");
    const [alarm] = useSound(
        alerton,
        { volume: 0.80 }
    );
    const [alarmoff] = useSound(
        alertoff,
        { volume: 0.80 }
    );
    const polyoptions = {
        fillColor: "",
        fillOpacity: 0,
        strokeColor: "blue",
        strokeOpacity: 1,
        strokeWeight: 2,
        clickable: false,
        draggable: false,
        editable: false,
        geodesic: false,
        zIndex: 1
    }
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries
    })
    const handleRespondClose = () => {
        setRespondOpen(false);
        setResponse(null)
        unregister("message")
    };

    useEffect(() => {

    }, [appState])


    useEffect(() => {
        dbRef.ref('/administrators').orderByChild('email').equalTo(currentUser.email).on('value', (snapshot) => {
            if (snapshot.exists()) {
                Object.values(snapshot.val()).map((val) => {
                    Geocode.fromAddress(val.municipality).then(
                        (response) => {
                            const address = response.results[0].formatted_address;
                            let city;
                            for (let i = 0; i < response.results[0].address_components.length; i++) {
                                for (let j = 0; j < response.results[0].address_components[i].types.length; j++) {
                                    switch (response.results[0].address_components[i].types[j]) {
                                        case "locality":
                                            city = response.results[0].address_components[i].long_name;
                                            break;
                                    }
                                }
                            }
                            if (city === 'Quezon City') {
                                console.log(city);
                                const ref = dbRef.ref('/Markers').orderByChild('locality').equalTo('Quezon City');
                                ref.on('value', (snapshot) => {
                                    if (snapshot.exists()) {
                                        const perMark = snapshot.val();
                                        const markList = []
                                        for (let id in perMark) {
                                            markList.push(perMark[id].state === "Emergency" ? { id, ...perMark[id] } : {});
                                        }
                                        setMarkers(markList)
                                    } else {
                                        const ref = dbRef.ref('/Markers').orderByChild('locality').equalTo('Lungsod Quezon');
                                        ref.on('value', (snapshot) => {
                                            if (snapshot.exists()) {
                                                const perMark = snapshot.val();
                                                const markList = []
                                                for (let id in perMark) {
                                                    markList.push(perMark[id].state === "Emergency" ? { id, ...perMark[id] } : {});
                                                }
                                                setMarkers(markList)
                                            } else {
                                                setMarkers([])
                                            }
                                        });
                                    }
                                });

                            } else {
                                const ref = dbRef.ref('/Markers').orderByChild('locality').equalTo(city);
                                ref.on('value', (snapshot) => {
                                    if (snapshot.exists()) {
                                        const perMark = snapshot.val();
                                        const markList = []
                                        for (let id in perMark) {
                                            markList.push(perMark[id].state === "Emergency" ? { id, ...perMark[id] } : {});
                                        }
                                        setMarkers(markList)
                                    } else {
                                        setMarkers([])
                                    }
                                });
                            }


                        },
                        (error) => {
                            console.error(error);
                        }
                    );
                })
            }
        })

        dbRef.ref('/administrators').orderByChild('email').equalTo(currentUser.email).once('value').then((snapshot) => {
            if (snapshot.exists()) {
                let scope

                Object.values(snapshot.val()).map((val) => {
                    scope = val.barangay + "-" + val.municipality
                    setBarangayId(val.barangay_id)
                })
                var connectedRef = dbRef.ref(".info/connected");
                var presenceRef = dbRef.ref("/WebStates/" + scope);

                connectedRef.on("value", (snap) => {
                    if (snap.val() === true) {
                        setSnack(false);
                        setSnack(true)
                        setSeverity('success')
                        setSnackMessage('Connected.')
                        setAppState('Connected')
                        presenceRef.set('Connected')
                    } else {
                        console.log(scope);
                        setSnack(true)
                        setSeverity('error')
                        setSnackMessage('Connection Lost.')
                        setAppState('Disconnected')
                        presenceRef.onDisconnect().set("Disconnected");
                    }
                });
            } else {
                console.log('cant find');
            }
        })

    }, [])

    useEffect(() => {
        if (selectedMarker) {
            dbRef.ref('/Users/' + selectedMarker.id + '/info').get().then((snapshot) => {
                if (snapshot.exists) {
                    setResident(snapshot.val())
                }
            })
        }
    }, [selectedMarker])

    useEffect(() => {
        response !== null && setRespondOpen(true)
    }, [response])

    useEffect(() => {

        props.center && Geocode.fromLatLng(center.lat, center.lng).then(
            (response) => {
                const address = response.results[0].formatted_address;
                for (let i = 0; i < response.results[0].address_components.length; i++) {
                    for (let j = 0; j < response.results[0].address_components[i].types.length; j++) {
                        switch (response.results[0].address_components[i].types[j]) {
                            case "locality":
                                city = response.results[0].address_components[i].long_name;
                                break;
                        }
                    }
                }
                markers.map((val) => {
                    if (val.details === "Flood") {
                        if (val.locality === city) {
                            setFloodpaths(prev => [...prev, {
                                lat: parseFloat(val.lat),
                                lng: parseFloat(val.lng)
                            }])
                        }
                    }
                })
            },
            (error) => {
                console.error(error);
            }
        );
    }, [markers])

    if (loadError) return "Error loading map";
    if (!isLoaded) return "Loading Map...";
    const getMs = markers ? (<pre>{JSON.stringify(markers, null, 2)}</pre>) : 'NaN'

    const options = replies.map((option) => {
        return {
            ...option,
        };
    });

    const onSubmit = (data) => {


        dbRef.ref('/Markers').orderByChild('mobile').equalTo(selectedMarker.id).once('value').then((snap) => {
            if (snap.exists()) {
                let db_fname, db_mobile, db_togg, db_details, db_message, db_lat, db_lng, db_locl, db_ts, timenow

                Object.values(snap.val()).map((v) => {
                    db_fname = v.fullname
                    db_mobile = v.mobile
                    db_togg = v.toggled
                    db_details = v.details
                    db_message = v.message
                    db_lat = v.lat
                    db_lng = v.lng
                    db_locl = v.locality
                    db_ts = v.timestamp
                })
                timenow = Date.now()
                
                
                try {
                    dbRef.ref('/Markers/' + selectedMarker.id).set({
                        "fullname": db_fname,
                        "details": db_details,
                        "lat": db_lat,
                        "lng": db_lng,
                        "locality": db_locl,
                        "message": db_message,
                        "mobile": db_mobile,
                        "toggled": db_togg,
                        "state": "Reported",
                        "barangay_id": barangayId,
                        "dept": watch('dept'),
                        "reportedOn": timenow,
                        "timestamp": db_ts,
                        "triage" : watch('triage')
                    }, (err) => {
                        if (err) {
                            setSnack(true)
                            setSnackMessage('Report Failed.')
                            setSeverity('error')
                        } else {
                            dbRef.ref('/administrators').orderByChild('email').equalTo(currentUser.email).once('value').then((ss) => {
                                if (ss.exists()) {
                                    let fullname, firstname, lastname;
                                    Object.values(ss.val()).map((val) => {
                                        fullname = val.firstname + " " + val.lastname
                                        firstname = val.firstname
                                        lastname = val.lastname
                                    })
                                    dbRef.ref('/Markers/' + selectedMarker.id + '/reportedBy').set(fullname, (error) => {
                                        if (error) {
                                            setSnack(true)
                                            setSnackMessage('Report Failed.')
                                            setSeverity('error')
                                        } else {
                                            // Data saved successfully
                                            dbRef.ref('/Users/' + selectedMarker.id + '/services').set({
                                                "message": data.message,
                                                "reporter": firstname.charAt(0).toUpperCase() + ". " + lastname,
                                            }, (error) => {
                                                if (error) {
                                                    // The write failed...
                                                    setSnack(true)
                                                    setSnackMessage('Report Failed.')
                                                    setSeverity('error')
                                                } else {
                                                    // Data saved successfully
                                                    handleRespondClose()
                                                    setSnack(true)
                                                    setSnackMessage('Report Successful')
                                                    setSeverity('success')
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })    
                } catch (error) {
                    setSnack(true)
                    setSeverity('warning')
                    setSnackMessage('Report cannot processed right now.')
                }                
            }
        })
    }



    return (
        <div style={{
            display: 'inline - block',
            borderRadius: '20px',
            overflow: 'hidden'
        }}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                zoom={15}
                center={props.center}
                options={gmapoptions}
                onClick={() => {
                    setSelectedMarker(null)
                }}

            >
                <TrafficLayer />
                {
                    floodpaths && <Polygon
                        paths={floodpaths}
                        options={polyoptions}
                    />
                }
                {
                    markers.map((marker) =>
                        <Marker
                            icon={{
                                //url: marker.state === "Emergency" ? '/marker.svg': '/warning.svg',
                                url: '/marker.svg',
                                scaledSize: new window.google.maps.Size(30, 30)
                            }}
                            key={marker.id}
                            position={{
                                lat: parseFloat(marker.lat),
                                lng: parseFloat(marker.lng)
                            }}
                            title={marker.id}
                            onUnmount={alarmoff}
                            onLoad={alarm}
                            onClick={() => {
                                setSelectedMarker(marker)
                            }}


                        >
                            {(selectedMarker === marker) &&
                                <InfoWindow
                                    position={{
                                        lat: parseFloat(selectedMarker.lat),
                                        lng: parseFloat(selectedMarker.lng)
                                    }}
                                    onCloseClick={() => {
                                        setSelectedMarker(null);
                                        setResident(null)
                                    }}
                                >
                                    <div className={classes.root}>
                                        <Typography className={classes.title} gutterBottom>
                                            {resident && resident.firstname + ' ' + resident.lastname}
                                            &nbsp;
                                            <Typography variant="caption" className={classes.pos} color="textSecondary" gutterBottom>
                                                {marker.id}
                                            </Typography>
                                        </Typography>


                                        <Accordion>
                                            <AccordionSummary elevation={0} expandIcon={<ExpandMore />}>
                                                <Typography variant="caption">View Resident Info</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Grid>
                                                    <Typography variant="caption" component="p">
                                                        Age: {resident && resident.age}
                                                        <br />
                                                        Sex: {resident && resident.sex}
                                                        <br />
                                                        Height: {resident && resident.height}
                                                        <br />
                                                        Weight: {resident && resident.weight}
                                                        <br />
                                                        Blood Type: {resident && resident.bloodtype}
                                                    </Typography>
                                                    <br />
                                                    <Typography variant="body2">
                                                        Medical Conditions:
                                                    </Typography>
                                                    <Typography variant="caption">
                                                        {resident && resident.conditions}
                                                    </Typography>
                                                    <br />
                                                    <br />
                                                    <Typography variant="body2">
                                                        Allergies:
                                                    </Typography>
                                                    <Typography variant="caption">
                                                        {resident && resident.allergies}
                                                    </Typography>
                                                    <br />
                                                    <br />
                                                    <Typography variant="body2">
                                                        Medical Notes:
                                                    </Typography>
                                                    <Typography variant="caption">
                                                        {resident && resident.mednotes}
                                                    </Typography>
                                                </Grid>
                                            </AccordionDetails>
                                        </Accordion >
                                        <Accordion>
                                            <AccordionSummary elevation={0} expandIcon={<ExpandMore />}>
                                                <Typography variant="caption">Emergency Details</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Grid>

                                                    <Typography variant="caption" component="p">
                                                        Sent On: {resident && new Date(resident.timestamp).toLocaleString()}
                                                        <br />
                                                        Emergency: {selectedMarker.details}
                                                    </Typography>

                                                </Grid>
                                            </AccordionDetails>
                                        </Accordion >
                                        <br />
                                        <Button
                                            onClick={() => {
                                                setResponse(resident && resident);
                                            }} color="primary" variant="contained" size="small" disableElevation fullWidth>Report</Button>
                                    </div>
                                </InfoWindow>
                            }
                        </Marker>
                    )
                }
            </GoogleMap>
            {/* stop sound after removed  */}
            {/* {getMs} */}


            {response &&
                <Dialog
                    fullWidth
                    open={respondOpen}
                    TransitionComponent={Transition}
                    onClose={handleRespondClose}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <form noValidate autoComplete="off" onSubmit={e => { e.preventDefault(); handleSubmit(onSubmit) }}>
                        <DialogTitle id="alert-dialog-slide-title">
                            <Typography style={{ fontWeight: 'bold', textAlign: 'center' }}>Create Report</Typography>
                        </DialogTitle>

                        <DialogContent>
                            <Grid
                                container
                                direction="row"
                                spacing={2}
                            >
                                <Grid item xs={4} >
                                    <Typography variant="caption" color="textSecondary" gutterBottom>Resident:</Typography>
                                    <Typography variant="body2" gutterBottom style={{ fontWeight: 'bold' }}>{response.firstname + " " + response.lastname + " "}</Typography>
                                </Grid>
                                <Grid
                                    item
                                    xs={4}
                                >
                                    <Typography variant="caption" color="textSecondary" gutterBottom>Sent On:</Typography>
                                    <Typography variant="body2" style={{ fontWeight: 'bold' }}>{response.timestamp && new Date(response.timestamp).toLocaleString()}</Typography>
                                </Grid>
                                <Grid
                                    item
                                    xs={4}
                                >
                                    <Typography variant="caption" color="textSecondary" gutterBottom>Details:</Typography>
                                    <Typography variant="body2" style={{ fontWeight: 'bold' }}>{selectedMarker && selectedMarker.details}</Typography>


                                </Grid>
                                <Grid
                                    item
                                    xs={6}
                                    style={{ textAlign: 'start' }}
                                >
                                    <Typography variant="caption" color="textSecondary">Reporting to:</Typography> <br />

                                    <Select
                                        labelId="report-dept"
                                        id="report-dept"
                                        defaultValue=""
                                        displayEmpty
                                        variant="outlined"
                                        {...register("dept", { required: true })}
                                        style={{ width: '100%' }}
                                    >
                                        <MenuItem value="">
                                            <em>Select Department</em>
                                        </MenuItem>
                                        <MenuItem value="bsf_dept">
                                            Barangay Security Force
                                        </MenuItem>
                                        <MenuItem value="fire_dept">
                                            Fire Department
                                        </MenuItem>
                                        <MenuItem value="health_dept">
                                            Health Department
                                        </MenuItem>
                                        <MenuItem value="rrd_dept">
                                            Risk Reduction Department
                                        </MenuItem>
                                    </Select>
                                </Grid>
                                <Grid
                                    item
                                    xs={6}
                                    style={{ textAlign: 'start' }}
                                >
                                    <Typography variant="caption" color="textSecondary">Triage:</Typography> <br />

                                    <Select
                                        labelId="report-triage"
                                        id="report-triage"
                                        defaultValue=""
                                        displayEmpty
                                        variant="outlined"
                                        {...register("triage", { required: true })}
                                        style={{ width: '100%' }}
                                    >
                                        <MenuItem value="">
                                            <em>Set Triage</em>
                                        </MenuItem>
                                        <MenuItem value="nurg" style={{ color: '#4CAF50' }}>
                                            Non-Urgent
                                        </MenuItem>
                                        <MenuItem value="prio" style={{ color: '#FFC107' }}>
                                            Priority
                                        </MenuItem>
                                        <MenuItem value="emer" style={{ color: '#E53935' }}>
                                            Emergency
                                        </MenuItem>
                                    </Select>
                                </Grid>
                                <Grid
                                    item
                                    xs={12}>
                                    <Typography variant="caption" color="textSecondary">Resident Message:</Typography> <br />
                                    <Typography variant="caption">{selectedMarker && selectedMarker.message}</Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <ThemeProvider theme={customfont}>
                                        <Autocomplete
                                            options={options}
                                            groupBy={(option) => option.group}
                                            getOptionLabel={(option) => option.message}
                                            freeSolo
                                            renderInput={(params) => <TextField
                                                {...params}
                                                style={{ fontFamily: 'Lato', fontWeight: 'lighter' }}
                                                variant="outlined"
                                                label="Send a reply"
                                                name="message"
                                                id="message"
                                                {...register('message',
                                                    { required: true }
                                                )}
                                                fullWidth
                                                error={errors.message}
                                                helperText={errors.message && 'Message is required.'}
                                                required
                                            />}
                                        />
                                    </ThemeProvider>
                                </Grid>
                                <Grid item xs={12} style={{ marginBottom: '15px' }}>
                                    <Button onClick={handleSubmit(onSubmit)} color="primary" fullWidth variant="contained" disabled={!isValid}>
                                        Send Report
                                    </Button>
                                </Grid>
                            </Grid>
                        </DialogContent>
                    </form>
                </Dialog>
            }
            {/* SnackBar ##################### */}
            <Snackbar open={snack} autoHideDuration={4000} onClose={handleSnackClose}>
                <Alert onClose={handleSnackClose} severity={severity}>
                    {snackMessage}
                </Alert>
            </Snackbar>
            {/* SnackBar ##################### */}
        </div >
    )
}

export default LiveMap