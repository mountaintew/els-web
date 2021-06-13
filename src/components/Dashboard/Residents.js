import React, { useEffect, useState } from 'react'
import firebase from '../../util/firebase';
import Geocode from "react-geocode";
import { useAuth } from '../../contexts/AuthContext'
import { Avatar, Box, Grid, IconButton, makeStyles, Paper, Typography } from '@material-ui/core';
import { BorderColor } from '@material-ui/icons';


const useStyles = makeStyles((theme) => ({
    paper: {
        textAlign: 'center',
        padding: theme.spacing(2),
        borderRadius: '20px',
        backgroundColor: 'rgba(0,0,0,0)',

    },
    paperdata: {
        textAlign: 'center',
        padding: theme.spacing(1),
        borderRadius: '0px',
        textAlign: 'center',
        color: '#222',
        backgroundColor: 'rgba(0,0,0,0)',
        boxShadow: 'none'

    },
    glass: {
        backdropFilter: 'blur(50px)',
        backgroundColor: 'rgba(255,255,255,0.1)'
    }
}));


export default function Residents(props) {
    const classes = useStyles();
    const [resCount, setResCount] = useState(0)
    const [emCount, setEmCount] = useState(0)
    const [locality, setLocality] = useState(null)
    const dbRef = firebase.database();
    const { currentUser } = useAuth()

    //counters
    const [floodem, setFloodem] = useState(0)
    const [fireem, setFireem] = useState(0)
    const [accdem, setAccdem] = useState(0)
    const [crimeem, setCrimeem] = useState(0)
    const [medem, setMedem] = useState(0)
    const [otherem, setOtherem] = useState(0)

    // useEffect(() => {
    //     locality &&
    //     dbRef.ref('/Users').orderByChild("locality").equalTo(props.locality).once('value').then((snapshot) => {
    //         if (snapshot.exists) {
    //             setResCount(res => res + 1)
    //             console.log(props.locality);
    //         }
    //     })
    // }, [])
    Geocode.setApiKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
    Geocode.setLanguage("en");
    Geocode.setRegion("ph");
    Geocode.setLocationType("ROOFTOP");

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
                            dbRef.ref('/Users').orderByChild("locality").equalTo(city).on('value', (snapshot) => {
                                if (snapshot.exists()) {
                                    setResCount(resCount + 1)
                                } else {
                                    if (city === "Quezon City") {
                                        dbRef.ref('/Users').orderByChild("locality").equalTo("Lungsod Quezon").on('value', (snapshot) => {
                                            if (snapshot.exists()) {
                                                setResCount(resCount + 1)
                                            } else {
                                                setResCount(0)
                                            }
                                        })
                                    }
                                }
                            })
                            dbRef.ref('/Markers').orderByChild("locality").equalTo(city).on('value', (snapshot) => {
                                if (snapshot.exists()) {
                                    setEmCount(Object.keys(snapshot.val()).length)
                                } else {
                                    if (city === "Quezon City") {
                                        dbRef.ref('/Markers').orderByChild("locality").equalTo("Lungsod Quezon").on('value', (snapshot) => {
                                            if (snapshot.exists()) {
                                                setEmCount(Object.keys(snapshot.val()).length)
                                            } else {
                                                setEmCount(0)
                                            }
                                        })
                                    } else {
                                        setEmCount(0)
                                    }
                                }
                            })
                            dbRef.ref('/Markers').orderByChild("locality").equalTo(city).on('value', (snapshot) => {
                                if (snapshot.exists()) {
                                    let flood = 0, fire = 0, accd = 0, crime = 0, med = 0, others = 0
                                    Object.values(snapshot.val()).map((val) => {
                                        switch (val.details) {
                                            case 'Flood':
                                                flood = flood + 1
                                                break
                                            case 'Fire':
                                                fire = fire + 1
                                                break
                                            case 'Accident':
                                                accd = accd + 1
                                                break
                                            case 'Crime':
                                                crime = crime + 1
                                                break
                                            case 'Medical':
                                                med = med + 1
                                                break
                                            default:
                                                others = others + 1
                                        }
                                    })
                                    setFloodem(flood)
                                    setFireem(fire)
                                    setAccdem(accd)
                                    setCrimeem(crime)
                                    setMedem(med)
                                    setOtherem(others)
                                } else {
                                    if (city === "Quezon City") {
                                        dbRef.ref('/Markers').orderByChild("locality").equalTo("Lungsod Quezon").on('value', (snapshot) => {
                                            if (snapshot.exists()) {
                                                let flood = 0, fire = 0, accd = 0, crime = 0, med = 0, others = 0
                                                Object.values(snapshot.val()).map((val) => {
                                                    switch (val.details) {
                                                        case 'Flood':
                                                            flood = flood + 1
                                                            break
                                                        case 'Fire':
                                                            fire = fire + 1
                                                            break
                                                        case 'Accident':
                                                            accd = accd + 1
                                                            break
                                                        case 'Crime':
                                                            crime = crime + 1
                                                            break
                                                        case 'Medical':
                                                            med = med + 1
                                                            break
                                                        default:
                                                            others = others + 1
                                                    }
                                                })
                                                setFloodem(flood)
                                                setFireem(fire)
                                                setAccdem(accd)
                                                setCrimeem(crime)
                                                setMedem(med)
                                                setOtherem(others)
                                            } else {
                                                setFloodem(0)
                                                setFireem(0)
                                                setAccdem(0)
                                                setCrimeem(0)
                                                setMedem(0)
                                                setOtherem(0)
                                            }
                                        })
                                    } else {
                                        setFloodem(0)
                                        setFireem(0)
                                        setAccdem(0)
                                        setCrimeem(0)
                                        setMedem(0)
                                        setOtherem(0)
                                    }

                                }
                            })

                            setLocality(city)
                        },
                        (error) => {
                            console.error(error);
                        }
                    );
                })
            }
        })






    }, [])


    return (
        <div style={{ flexGrow: 1 }}>
            {/* {JSON.stringify(props.locality, null, 2)}
            {Object.values(props.locality)[0]} */}

            <Grid
                container
                spacing={0}
                style={{ minHeight: '500px', backgroundColor: 'rgba(0,0,0,0)' }}
            >
                <Grid item xs={12} className={classes.glass} style={{ borderRadius: '20px 20px 0px 0px' }}>
                    <Paper className={classes.paper} style={{ backgroundColor: 'rgba(0,0,0,0)', color: '#222', borderRadius: '20px 20px 0px 0px' }} >

                        <Typography variant="caption">
                            as of {new Date().toLocaleString()}
                        </Typography>
                        <Typography variant='h1' style={{ color: '#ef5350'}}>
                            {/* {resCount} */}
                            {emCount}
                        </Typography>
                        <Typography variant='caption'>
                            Current Emergencies in {locality}
                        </Typography>

                    </Paper>
                </Grid>
                {/* <Grid item xs={12}>
                    <Paper style={{ backgroundColor: '#cfd8dc', color: '#222' }} className={classes.paper}>
                        <Typography variant='h4'>
                            {resCount}
                        </Typography>
                        <Typography variant='caption'>
                            Active Registered Residents
                        </Typography>
                    </Paper>
                </Grid> */}


                <Grid item xs={6} className={classes.glass}>
                    <Paper className={classes.paperdata}>
                        <Box>
                            <IconButton size='small'>
                                <Avatar src='/iconpack/flood.svg' style={{ padding: '5px', width: '30px', height: '30px', fontSize: '15px' }}></Avatar>
                            </IconButton>
                        </Box>
                        <Typography variant="h6">{floodem}</Typography>
                        <Typography variant="caption">Flood Related</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={6} className={classes.glass}>
                    <Paper className={classes.paperdata}>
                        <Box>
                            <IconButton size='small'>
                                <Avatar src='/iconpack/fire.svg' style={{ padding: '5px', width: '30px', height: '30px', fontSize: '15px' }}></Avatar>
                            </IconButton>
                        </Box>
                        <Typography variant="h6">{fireem}</Typography>
                        <Typography variant="caption">Fire Related</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={6} className={classes.glass}>
                    <Paper className={classes.paperdata}>
                        <Box>
                            <IconButton size='small'>
                                <Avatar src='/iconpack/accident.svg' style={{ padding: '2px', width: '30px', height: '30px', fontSize: '15px' }}>{accdem}</Avatar>
                            </IconButton>
                        </Box>
                        <Typography variant="h6">{accdem}</Typography>
                        <Typography variant="caption">Accidents</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={6} className={classes.glass}>
                    <Paper className={classes.paperdata}>
                        <Box>
                            <IconButton size='small'>
                                <Avatar src='/iconpack/crime.svg' style={{ padding: '3px', width: '30px', height: '30px', fontSize: '15px' }}>{crimeem}</Avatar>
                            </IconButton>
                        </Box>
                        <Typography variant="h6">{crimeem}</Typography>
                        <Typography variant="caption">Crime Related</Typography>
                    </Paper>

                </Grid>
                <Grid item xs={6} className={classes.glass} style={{ borderRadius: '0px 0px 0px 20px' }}>
                    <Paper className={classes.paperdata} style={{ borderRadius: '0px 0px 0px 20px' }}>
                        <Box>
                            <IconButton size='small'>
                                <Avatar src='/iconpack/medical.svg' style={{ padding: '6px', width: '30px', height: '30px', fontSize: '15px' }}>{otherem}</Avatar>
                            </IconButton>
                        </Box>
                        <Typography variant="h6">{medem}</Typography>
                        <Typography variant="caption">Medical Related</Typography>
                    </Paper>
                </Grid>
                <Grid item xs={6} className={classes.glass} style={{ borderRadius: '0px 0px 20px 0px' }}>
                    <Paper style={{ borderRadius: '0px 0px 20px 0px' }} className={classes.paperdata}  >
                        <Box>
                            <IconButton size='small'>
                                <Avatar src='/iconpack/others.svg' style={{ padding: '6px', width: '30px', height: '30px', fontSize: '15px' }}>{otherem}</Avatar>
                            </IconButton>
                        </Box>
                        <Typography variant="h6">{otherem}</Typography>
                        <Typography variant="caption">Others</Typography>
                    </Paper>
                </Grid>

            </Grid>
        </div>
    )
}
