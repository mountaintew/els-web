import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { useHistory, Link } from 'react-router-dom'
import { Button, Checkbox, CssBaseline, FormControlLabel, Grid, InputAdornment, Paper, Snackbar, TextField, Typography } from '@material-ui/core'
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}
  
  
const useStyles = makeStyles((theme) => ({
    root: {
      height: '100vh',
    },
    image: {
      backgroundImage: '',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#b0bec5',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
    paper: {
      margin: theme.spacing(8, 4),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(1),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
    forgot: {
        color: "#424242"
    },
    login: {
        color: "#212121"
    }
  }));

export default function AdminInfo() {
    const [values, setValues] = React.useState({
        mobilenumber: '',
        firstname: '',
        lastname: '',
        employeeid: ''
      });
    
    const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value });
    };

    const [numErr,setNumErr] = useState(false)
    const [fnameErr,setFnameErr] = useState(false)
    const [lnameErr,setLnameErr] = useState(false)
    const [idErr,setIdErr] = useState(false)

    const [snack,setSnack] = useState(false)
    const [severity,setSeverity] = useState('')
    const [snackMessage,setSnackMessage] = useState('')


    const handleSnackClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        } 
        setSnack(false)
      }
      
    function handleSubmit(e){

    }

    return (
        <div>
        <div className={useStyles.paper}>
            <Snackbar open={snack}  autoHideDuration={6000} onClose={handleSnackClose}>
              <Alert onClose={handleSnackClose} severity={severity}>
                {snackMessage}
              </Alert>
            </Snackbar>
            <form className={useStyles.form} noValidate autoComplete="off" onSubmit={handleSubmit}>
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Mobile Number"
                name="mobilenumber"
                type="tel"
                value = {values.mobilenumber}
                onChange = {handleChange('mobilenumber')}
                error = {numErr}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+63</InputAdornment>,
                }}
            />
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Firstname"
                name="firstname"
                type="text"
                value = {values.firstname}
                onChange = {handleChange('firstname')}
                error = {fnameErr}
            />
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Lastname"
                name="lastname"
                type="text"
                value = {values.lastname}
                onChange = {handleChange('lastname')}
                error = {lnameErr}
            />
            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Employee ID"
                name="employeeid"
                type="text"
                value = {values.employeeid}
                onChange = {handleChange('employeeid')}
                error = {idErr}
            />
            </form>
        </div>
        </div>
    )
}
