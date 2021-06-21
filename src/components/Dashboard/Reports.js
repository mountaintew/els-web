import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import firebase from '../../util/firebase';
import { Divider, Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Slide, Typography, Link } from '@material-ui/core';
import Geocode from "react-geocode";
import { useAuth } from '../../contexts/AuthContext'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  list: {
    '&::-webkit-scrollbar': {
      width: '0.4em'
    },
    '&::-webkit-scrollbar-track': {
      boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
      webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,.1)',
      outline: '1px solid slategrey'
    }
  }
});


export default function Reports() {
  const classes = useStyles();
  const dbRef = firebase.database();
  const storage = firebase.storage();
  const storageRef = storage.ref('/images');
  const { currentUser } = useAuth()
  const [tableData, setTableData] = useState([])
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState(null)
  const [info, setInfo] = useState(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [emergencyInfo, setEmergencyInfo] = useState(null)
  const handleClose = () => {
    setOpen(false);
    setAddress(null)
    setInfo(null)
    setImageUrl('/profile-user.svg');
  };

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
              let city, state, country;
              for (let i = 0; i < response.results[0].address_components.length; i++) {
                for (let j = 0; j < response.results[0].address_components[i].types.length; j++) {
                  switch (response.results[0].address_components[i].types[j]) {
                    case "locality":
                      city = response.results[0].address_components[i].long_name;
                      break;
                    case "administrative_area_level_1":
                      state = response.results[0].address_components[i].long_name;
                      break;
                    case "country":
                      country = response.results[0].address_components[i].long_name;
                      break;
                  }
                }
              }

              dbRef.ref('/Markers').orderByChild('locality').equalTo(city).on('value', (snapshot) => {
                if (snapshot.exists()) {
                  const x = []
                  Object.values(snapshot.val()).map((val) => {
                    if (val.state === "Reported") {
                      x.push(val)
                    }
                  })
                  setTableData(x)
                } else {
                  if (city === "Lungsod Quezon") {
                    dbRef.ref('/Markers').orderByChild('locality').equalTo("Lungsod Quezon").on('value', (snapshot) => {
                      if (snapshot.exists()) {
                        const x = []
                        Object.values(snapshot.val()).map((val) => {
                          if (val.state === "Reported") {
                            x.push(val)
                          }
                        })
                        setTableData(x)
                      }
                    })
                  }
                }
              })


            },
            (error) => {
              console.error(error);
            }
          );
        })
      }
    })


  }, [])

  const seeDetails = (val) => {
    Geocode.fromLatLng(parseFloat(val.lat), parseFloat(val.lng)).then(
      (response) => {
        const address = response.results[0].formatted_address;
        setAddress(address)
        dbRef.ref('/Users/' + val.mobile + '/info').on('value', (snapshot) => {
          if (snapshot.exists()) {
            setInfo([snapshot.val()])
            setEmergencyInfo(val)
            storageRef.child(val.mobile).getDownloadURL()
              .then((url) => {
                // `url` is the download URL for 'images/stars.jpg'

                // This can be downloaded directly:
                var xhr = new XMLHttpRequest();
                xhr.responseType = 'blob';
                xhr.onload = (event) => {
                  var blob = xhr.response;
                };
                xhr.open('GET', url);
                xhr.send();

                setImageUrl(url);
              })
              .catch((error) => {
                setImageUrl('/profile-user.svg');
              });
          }
        })
        setOpen(true)

      },
      (error) => {
        console.error(error);
      }
    );

  }

  return (
    <div>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">

          <TableHead>
            <TableRow>
              <TableCell>Details</TableCell>
              <TableCell align="center">Resident</TableCell>
              <TableCell align="center">Emergency</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Reported On</TableCell>

            </TableRow>
          </TableHead>
          <TableBody className={classes.list}>
            {
              tableData.length === 0 ?
                <TableRow key='nv'>
                  <TableCell component="th" scope="row">
                    No reports yet.
                  </TableCell>
                </TableRow>
                :
                tableData && tableData.map((val) =>
                  <TableRow key={val.fullname}>
                    <TableCell component="th" scope="row">
                      <Button size="small" variant="outlined" onClick={() => { seeDetails(val) }}>See Details</Button>
                    </TableCell>
                    <TableCell align="center">
                      {val.fullname}&nbsp;<Typography variant="caption" >({val.mobile})</Typography>
                    </TableCell>
                    <TableCell align="center">
                      {val.details}
                    </TableCell>
                    <TableCell align="center">{val.state}</TableCell>
                    <TableCell align="center">
                      {new Date(val.reportedOn).toLocaleString()}
                    </TableCell>
                  </TableRow>
                )
            }
          </TableBody>
        </Table>
      </TableContainer>
      {/* <pre>
        {JSON.stringify(tableData, null, 2)}
      </pre> */}
      <Dialog
        open={open}
        TransitionComponent={Transition}
        onClose={handleClose}
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle id="alert-dialog-slide-title">Details</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">

            {info && info.map((val) =>
              <div style={{ textAlign: 'center' }}>
                <Avatar src={imageUrl && imageUrl} style={{
                  margin: 'auto',
                  width: '70px',
                  height: '70px',
                }}></Avatar>


                <Typography fullWidth variant="h6" style={{ color: '#222' }}>{val.fullname}</Typography>
                <Typography variant="caption" style={{ color: '#222', marginTop: '0px' }} gutterBottom>{val.number}</Typography>

                <br />
                <Grid
                  container
                  spacing={2}
                >

                  <Grid item xs={12}>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => {
                        console.info("I'm a button.");
                      }}
                    >
                      View Location
                    </Link>
                  </Grid>
                  <Grid item xs={12}>

                    <Typography variant="caption" style={{ color: '#546E7A' }}>Possible Address:</Typography>
                    <Typography variant="subtitle2" style={{ color: '#222' }} gutterBottom>{address}</Typography>
                  </Grid>
                  <Grid item xs={12} style={{ textAlign: 'center' }}>
                    <Typography variant="caption" style={{ color: '#546E7A' }}>Emergency:</Typography>
                    <Typography variant="subtitle2" style={{ color: '#222' }} >{emergencyInfo && emergencyInfo.details}</Typography>
                  </Grid>
                  <Grid item xs={4} style={{ textAlign: 'center' }}>
                    <Typography variant="caption" style={{ color: '#546E7A' }}>Birthdate:</Typography>
                    <Typography variant="subtitle2" style={{ color: '#222' }} gutterBottom>{val.birthdate}</Typography>
                  </Grid>
                  <Grid item xs={4} style={{ textAlign: 'center' }}>
                    <Typography variant="caption" style={{ color: '#546E7A' }}>Age:</Typography>
                    <Typography variant="subtitle2" style={{ color: '#222' }} gutterBottom>{val.age}</Typography>
                  </Grid>
                  <Grid item xs={4} style={{ textAlign: 'center' }}>
                    <Typography variant="caption" style={{ color: '#546E7A' }}>Sex:</Typography>
                    <Typography variant="subtitle2" style={{ color: '#222' }} gutterBottom>{val.sex}</Typography>
                  </Grid>
                  <Grid item xs={4} style={{ textAlign: 'center' }}>
                    <Typography variant="caption" style={{ color: '#546E7A' }}>Bloodtype:</Typography>
                    <Typography variant="subtitle2" style={{ color: '#222' }} gutterBottom>{val.bloodtype}</Typography>
                  </Grid>
                  <Grid item xs={4} style={{ textAlign: 'center' }}>
                    <Typography variant="caption" style={{ color: '#546E7A' }}>Height:</Typography>
                    <Typography variant="subtitle2" style={{ color: '#222' }} gutterBottom>{val.height}</Typography>
                  </Grid>
                  <Grid item xs={4} style={{ textAlign: 'center' }}>
                    <Typography variant="caption" style={{ color: '#546E7A' }}>Weight:</Typography>
                    <Typography variant="subtitle2" style={{ color: '#222' }} gutterBottom>{val.weight}</Typography>
                  </Grid>


                  {val.allergies === "n/a" ? "" :
                    <Grid item xs={6} style={{ textAlign: 'center' }}>
                      <Typography variant="caption" style={{ color: '#546E7A' }}>Allergy:</Typography>
                      <Typography variant="subtitle2" style={{ color: '#222' }} gutterBottom>{val.allergies}</Typography>
                    </Grid>
                  }

                  {val.conditions === "n/a" ? "" :
                    <Grid item xs={6} style={{ textAlign: 'center' }}>
                      <Typography variant="caption" style={{ color: '#546E7A' }}>Medical Conditions:</Typography>
                      <Typography variant="subtitle2" style={{ color: '#222' }} gutterBottom>{val.conditions}</Typography>
                    </Grid>
                  }

                  {val.mednotes === "n/a" ? "" :
                    <Grid item xs={12} style={{ textAlign: 'center' }}>
                      <Typography variant="caption" style={{ color: '#546E7A' }}>Medical Notes:</Typography>
                      <Typography variant="subtitle2" style={{ color: '#222' }} gutterBottom>{val.mednotes}</Typography>
                    </Grid>
                  }



                  {emergencyInfo && emergencyInfo.message === "" ? '' :
                    <Grid item xs={12} style={{ textAlign: 'center' }}>
                      <Typography variant="caption" style={{ color: '#546E7A' }}>Resident message:</Typography>
                      <Typography variant="subtitle2" style={{ color: '#222' }} gutterBottom>{emergencyInfo && emergencyInfo.message}</Typography>
                    </Grid>
                  }

                </Grid>

                <Typography variant="caption">Reported By:</Typography>
                <Typography variant="subtitle2" style={{ color: '#222' }}>{emergencyInfo && emergencyInfo.reportedBy}</Typography>
              </div>
            )}
            {/* <pre>

              {JSON.stringify(info, null, 2)}
            </pre> */}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="textSecondary" fullWidth>
            Dismiss
          </Button>
          <Button onClick={handleClose} color="primary" fullWidth>
            Responded
          </Button>
        </DialogActions>
      </Dialog>
    </div>

  );
}