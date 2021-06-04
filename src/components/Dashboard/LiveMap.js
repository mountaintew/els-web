import React, { useState, useEffect } from 'react'
import Geocode from "react-geocode";
import { GoogleMap, InfoWindow, useLoadScript, LoadScript, Marker, MarkerClusterer } from '@react-google-maps/api';
import mapStyle from './mapStyle';
import { TrafficLayer, Polygon } from '@react-google-maps/api';
import firebase from '../../util/firebase';
import useSound from 'use-sound';
import alerton from './Sfx/alertsound.wav'
import alertoff from './Sfx/alertoff.wav'
import clsx from 'clsx';
import anim from './Sfx/anim.svg'
import { IconButton, Accordion, AccordionDetails, AccordionSummary, Avatar, Button, Card, CardActionArea, CardActions, CardContent, Container, Grid, SwipeableDrawer, Typography } from '@material-ui/core';
import { fade, makeStyles, withStyles } from '@material-ui/core/styles';
import { ExpandMore, PlayArrow } from '@material-ui/icons';
import TrafficIcon from '@material-ui/icons/Traffic';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import warningicon from './warning.svg'
const containerStyle = {
    width: '100',
    height: '500px'
};

const libraries = ["places"];

const options = {
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
const useStyles = makeStyles((theme) => ({
    root: {

        flexGrow: 1,
        minWidth: 275,
        maxWidth: 275,
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
    const classes = useStyles();
    const [selectedMarker, setSelectedMarker] = useState(null)
    const [floodpaths, setFloodpaths] = useState([])
    const center = props.center
    const dbRef = firebase.database();
    const [markers, setMarkers] = useState([]);
    const [resident, setResident] = useState(null);
    const [response, setResponse] = useState(null)
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

    useEffect(() => {
        const ref = dbRef.ref('/Markers');
        ref.on('value', (snapshot) => {
            if (snapshot.exists()) {
                const perMark = snapshot.val();
                const markList = []
                for (let id in perMark) {
                    markList.push({ id, ...perMark[id] });
                }
                setMarkers(markList)
            } else {
                setMarkers([])
            }
        });

    }, [])

    useEffect(() => {
        if (selectedMarker) {
            dbRef.ref('/Users/' + selectedMarker.id).get().then((snapshot) => {
                if (snapshot.exists) {
                    setResident(snapshot.val())
                }
            })
        }
    }, [selectedMarker])

    useEffect(() => {
        dbRef.ref('/Markers/' + response).set(null, (error) => {
            if (error) {
                console.log('ELS Connection Lost')
            } else {
                setResponse(null)
            }
        })
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
    return (
        <div style={{
            display: 'inline - block',
            borderRadius: '20px',
            overflow: 'hidden'
        }}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                zoom={16}
                center={props.center}
                options={options}
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
                            animation={2}

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
                                                        Sex: {resident && resident.sex}
                                                        <br />
                                                                Age: {resident && resident.age}
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
                                                setResponse(resident && resident.number);
                                                console.log(response);
                                            }} color="primary" variant="contained" size="small" disableElevation fullWidth>Respond</Button>
                                    </div>

                                </InfoWindow>
                            }

                        </Marker>
                    )
                }
            </GoogleMap>
            {/* stop sound after removed  */}
            {/* {getMs} */}
        </div >
    )
}

export default LiveMap