import React, { useEffect, useState } from 'react'
import firebase from '../../util/firebase';
import Geocode from "react-geocode";
import { useAuth } from '../../contexts/AuthContext'
import { Avatar, Grid, makeStyles, Paper, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    paper: {
        textAlign: 'center',
        padding: theme.spacing(2),

    },
    paperdata: {
        textAlign: 'center',
        padding: theme.spacing(1),

    }
}));


export default function Residents(props) {
    const classes = useStyles();
    const [resCount, setResCount] = useState(0)
    const [emCount, setEmCount] = useState(0)
    const [locality, setLocality] = useState(null)
    const dbRef = firebase.database();
    const { currentUser } = useAuth()

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
        dbRef.ref('/administrators').orderByChild('email').equalTo(currentUser.email).once('value').then((snapshot) => {
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
                            dbRef.ref('/Users').orderByChild("locality").equalTo(city).once('value').then((snapshot) => {
                                if (snapshot.exists()) {
                                    setResCount(resCount + 1)
                                }
                            })
                            dbRef.ref('/Markers').orderByChild("locality").equalTo(city).once('value').then((snapshot) => {
                                if (snapshot.exists()) {
                                    setEmCount(Object.keys(snapshot.val()).length)

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
        <div style={{ flexGrow: 1, borderRadius: '20px'}}>
            {/* {JSON.stringify(props.locality, null, 2)}
            {Object.values(props.locality)[0]} */}

            <Grid
                container
                spacing={0}

            >
                <Grid item xs={12}>
                    <Paper className={classes.paper} style={{ backgroundColor: '#b0bec5', color: '#222',borderRadius: '20px 20px 0px 0px' }} >

                        <Typography variant="caption">
                            as of {new Date().toLocaleString()}
                        </Typography>
                        <Typography variant='h1'>
                            {/* {resCount} */}
                            {emCount}
                        </Typography>
                        <Typography variant='caption'>
                            Current emergencies in {locality}
                        </Typography>

                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper style={{ backgroundColor: '#cfd8dc', color: '#222' }} className={classes.paper}>
                        <Typography variant='h4'>
                            {resCount}
                        </Typography>
                        <Typography variant='caption'>
                            Active Registered Residents
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12}>
                    <Paper style={{ backgroundColor: '#eceff1', color: '#222' }} className={classes.paperdata}>
                        <Typography variant="caption">Flood Related Emergencies</Typography>
                    </Paper>

                    <Paper style={{ backgroundColor: '#eceff1', color: '#222' }} className={classes.paperdata}>
                        <Typography variant="caption">Fire Related Emergencies</Typography>
                    </Paper>

                    <Paper style={{ backgroundColor: '#eceff1', color: '#222' }} className={classes.paperdata}>
                        <Typography variant="caption">Accident Emergencies</Typography>
                    </Paper>

                    <Paper style={{ backgroundColor: '#eceff1', color: '#222' }} className={classes.paperdata}>
                        <Typography variant="caption">Crime Related Emergencies</Typography>
                    </Paper>
                    <Paper style={{ backgroundColor: '#eceff1', color: '#222', borderRadius: '0px 0px 20px 20px'}} className={classes.paperdata}>
                        <Typography variant="caption">Other Emergencies</Typography>
                    </Paper>
                </Grid>

            </Grid>
        </div>
    )
}
