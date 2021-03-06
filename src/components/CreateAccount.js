import { Avatar, Box, Button, Card, CardContent, CircularProgress, Container, CssBaseline, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, Snackbar, Step, StepLabel, Stepper, TextField, Typography } from '@material-ui/core'
import React, { useState } from 'react'
import locations from '../locationlittle.json'
import { makeStyles } from '@material-ui/core/styles';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import { amber } from '@material-ui/core/colors';
import MuiAlert from '@material-ui/lab/Alert';
import { useForm } from 'react-hook-form'

import { useAuth } from '../contexts/AuthContext'
import { useHistory, Link } from 'react-router-dom'

import firebase from '../util/firebase';
import Login from './Login';
import { SportsRugbySharp } from '@material-ui/icons';


function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}


const useStyles = makeStyles((theme) => ({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: '#fcbc20',
    },
    form: {

        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(3),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    wrapper: {
        position: 'relative',
    },
    buttonProgress: {
        color: amber,
        position: 'absolute',
        right: '5%',
        bottom: '30%',
    },
    link: {
        textTransform: 'capitalize',
        color: '#222',
    },
    root: {
        width: '100%',
    },
    cardbg: {
        backdropFilter: 'blur(5px)',
        backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.4), rgba(255,255,255,0.1))'
    }
}));

function getSteps() {
    return ['Login Credentials', 'Admin Information', 'Admin Locality'];
}

function CreateAccount() {
    const classes = useStyles();
    const { clearErrors, setError, watch, register, unregister, formState: { errors, isValid }, } = useForm({ mode: "all" });

    const [severity, setSeverity] = useState('')
    const [snackMessage, setSnackMessage] = useState('')
    const [snack, setSnack] = useState(false)
    const [checkMail, setCheckMail] = useState(false)
    const [checkMobile, setCheckMobile] = useState(false)
    const [formStep, setFormStep] = useState(0)

    const { signup } = useAuth()
    const history = useHistory()
    const dbRef = firebase.database();

    const steps = getSteps();

    const renderButton = () => {
        if (formStep > 2) {
            return undefined
        } else if (formStep === 0 || formStep === 1) {
            return (
                <div className={classes.wrapper}>
                    <Button
                        disabled={!isValid}
                        type="button"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={completeFormStep}
                    >
                        Next
                    </Button>
                </div>
            )
        } else if (formStep === 2) {
            return (
                <div className={classes.wrapper}>
                    <Button
                        disabled={!isValid}
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={completeFormStep}
                    >
                        Create Account
                    </Button>
                </div>
            )
        }
    }


    const completeFormStep = () => {
        if (formStep === 0) {
            setCheckMail(true)
            dbRef.ref('/administrators').orderByChild("email").equalTo(watch('email')).once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    clearErrors("email")
                    setError("email", {
                        type: "manual",
                        message: "Email already exists."
                    });
                    setCheckMail(false)
                } else {
                    setCheckMail(false)
                    setFormStep(cur => cur + 1)
                }
            }).catch((error) => {
                setSnack(true)
                setSeverity('error')
                setSnackMessage('Connection Lost')
                setCheckMail(false)
            });
        }

        if (formStep === 1) {
            setCheckMobile(true)
            dbRef.ref('/administrators').orderByChild("mobileNumber").equalTo(watch('mobileNumber')).once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    clearErrors("mobileNumber")
                    setError("mobileNumber", {
                        type: "manual",
                        message: "Mobile number already in use."
                    });
                    setCheckMobile(false)
                } else {
                    setFormStep(cur => cur + 1)
                    setCheckMobile(false)
                }
            }).catch((error) => {
                setSnack(true)
                setSeverity('error')
                setSnackMessage('Connection Lost')
                setCheckMobile(false)
            });
        }
    }

    // Select Location ################################################
    const [region, setRegion] = useState('')
    const [province, setProvince] = useState('')
    const [muni, setMuni] = useState('')
    const [barangay, setBarangay] = useState('')

    const regionOnChange = (e) => {
        setRegion(e.target.value)
        unregister('province')
        unregister("municipality")
        unregister("barangay")

        setProvince('')
        setMuni('')
        setBarangay('')
    }
    const provinceOnChange = (e) => {
        setProvince(e.target.value)
        setMuni('')
        setBarangay('')
    }
    const muniOnChange = (e) => {
        setMuni(e.target.value)
        setBarangay('')
    }
    const barangayOnChange = (e) => {
        setBarangay(e.target.value)
    }

    const regionOptions = Object.values(Object.keys(locations)).map((reg) =>
        <MenuItem value={reg}>{reg}</MenuItem>
    );

    const provinceOptions = region !== '' ?
        Object.keys(locations[region].province_list).map((reg) =>
            <MenuItem value={reg}>{reg}</MenuItem>
        ) : null
    const muniOptions = province !== '' && region !== '' ?
        Object.keys(locations[region].province_list[province].municipality_list).map((reg) =>
            <MenuItem value={reg}>{reg}</MenuItem>
        ) : null

    const barangayOptions = province !== '' && region !== '' && muni !== '' ?
        Object.values(locations[region].province_list[province].municipality_list[muni].barangay_list).map((reg) =>
            <MenuItem value={reg}>{reg}</MenuItem>
        ) : null
    // Select Location ################################################


    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnack(false);
    };

    const emailErr = () => {
        if (errors.email && errors.email.message === '') {
            return 'Please enter a valid email address.'
        }
        if (errors.email && errors.email.message !== '') {
            return errors.email.message
        }
    }

    const numErr = () => {
        if (errors.mobileNumber && errors.mobileNumber.message === '') {
            return 'Please enter a valid mobile number.'
        }
        if (errors.mobileNumber && errors.mobileNumber.message !== '') {
            return errors.mobileNumber.message
        }
    }

    function randomString(length, chars) {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }
    var rString = randomString(5, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') + "-" +  randomString(5, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

    async function handleFormSubmit(e) {
        e.preventDefault()
        if (formStep === 2) {
            try {
                await dbRef.ref("administrators/+63" + watch('mobileNumber')).set({
                    "email": watch('email'),
                    "password": watch('password'),
                    "mobileNumber": watch('mobileNumber'),
                    "firstname": watch('firstname'),
                    "lastname": watch('lastname'),
                    "eid": watch('eid'),
                    "region": watch('region'),
                    "province": watch('province'),
                    "municipality": watch('municipality'),
                    "barangay": watch('barangay'),
                    "barangay_id" : rString
                }, (error) => {
                    if (error) {
                        alert('Error saving.')
                    } else {
                        dbRef.ref('/Barangays/' + watch('barangay') + "/barangay_id").once('value').then((ss) => {
                            if (!ss.exists()){
                                dbRef.ref('/Barangays/' + watch('barangay') + "/barangay_id").set(rString, (error) => {
                                    if (error) {
                                        alert('Error saving.')
                                    } else {
                                        signup(watch('email'), watch('password'))
                                        history.push("/login")
                                    }
                                })
                            }else{
                                signup(watch('email'), watch('password'))
                                history.push("/login")
                            }
                        })
                    }
                });
            } catch (error) {
                setSnack(true)
                setSeverity('error')
                setSnackMessage('Connection Lost')
                console.log("error" + error)
            }
        }
    }
    return (
        <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="center"
            style={{
                minHeight: '100vh', background: 'url(/Wave.svg)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover'
            }}
        >

            <Container component="main" maxWidth="xs"  >
                <CssBaseline />
                <Box mt={5} mb={5} style={{ backgroundColor: 'rgba(0,0,0,0)' }}>
                    <Card className={classes.cardbg} elevation={5} style={{ backdropFilter: 'blur(5px)', backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.4), rgba(255,255,255,0.1))' }}>
                        <CardContent >
                            <div className={classes.paper}>
                                <Avatar className={classes.avatar}>
                                    <LocationOnIcon />
                                </Avatar>
                                <Typography component="h1" variant="h5">
                                    Create Account
                                </Typography>
                                <div className={classes.root}>
                                    <Stepper alternativeLabel activeStep={formStep} style={{ backgroundColor: 'rgba(0,0,0,0)' }}>
                                        {steps.map((label) => (
                                            <Step key={label}>
                                                <StepLabel>{label}</StepLabel>
                                            </Step>
                                        ))}
                                    </Stepper>
                                </div>
                                <form className={classes.form} noValidate autoComplete="off" onSubmit={handleFormSubmit}>
                                    {/* ########### Section 0 ########### */}
                                    {formStep === 0 && (
                                        <section>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <div className={classes.wrapper}>
                                                        <TextField
                                                            id="email"
                                                            required
                                                            variant="outlined"
                                                            label="Email"
                                                            fullWidth
                                                            error={errors.email ? true : false}
                                                            name="email"
                                                            defaultValue={watch('email') ? watch('email') : ''}
                                                            {...register('email',
                                                                { required: true, pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ }
                                                            )}
                                                            helperText={emailErr()}
                                                        />
                                                        {checkMail && <CircularProgress size={24} className={classes.buttonProgress} />}
                                                    </div>

                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        name="password"
                                                        id="password"
                                                        required
                                                        variant="outlined"
                                                        label="Password"
                                                        fullWidth
                                                        type="password"
                                                        defaultValue={watch('password') ? watch('password') : ''}

                                                        error={errors.password ? true : false}
                                                        {...register('password', { required: true, minLength: 6 })}
                                                        helperText={errors.password && 'Password must be at least 6 characters long'}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </section>
                                    )}
                                    {/* ########### Section 0 ########### */}

                                    {/* ########### Section 1 ########### */}
                                    {formStep === 1 && (
                                        <section>
                                            <Grid container spacing={2} mt={2}>
                                                <Grid item xs={12}>
                                                    <div className={classes.wrapper}>
                                                        <TextField
                                                            name="mobile"
                                                            id="mobile"
                                                            required
                                                            variant="outlined"
                                                            label="Mobile Number"
                                                            fullWidth
                                                            defaultValue={watch('mobileNumber') ? watch('mobileNumber') : ''}
                                                            {...register('mobileNumber', {
                                                                required: true,
                                                                maxLength: 10,
                                                                minLength: 10,
                                                                pattern: /\d+/
                                                            }
                                                            )}
                                                            error={errors.mobileNumber}
                                                            InputProps={{
                                                                startAdornment: <InputAdornment position="start">+63</InputAdornment>,
                                                            }}
                                                            helperText={numErr()}
                                                        />
                                                        {checkMobile && <CircularProgress size={24} className={classes.buttonProgress} />}
                                                    </div>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        name="firstname"
                                                        id="firstname"
                                                        required
                                                        variant="outlined"
                                                        fullWidth
                                                        label="First Name"
                                                        defaultValue={watch('firstname') ? watch('firstname') : ''}
                                                        {...register('firstname', { required: true, pattern: /^[a-zA-Z????]{2,30}$/ })}
                                                        error={errors.firstname}
                                                        helperText={errors.firstname && 'First Name is required.'}
                                                        InputProps={{ style: { textTransform: 'capitalize' } }}
                                                    />
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        name="lastname"
                                                        id="lastname"
                                                        required
                                                        variant="outlined"
                                                        fullWidth
                                                        label="Last Name"
                                                        defaultValue={watch('lastname') ? watch('lastname') : ''}
                                                        {...register('lastname', { required: true, pattern: /^[a-zA-Z????]{2,30}$/ })}
                                                        error={errors.lastname}
                                                        helperText={errors.lastname && 'Last Name is required.'}

                                                    />
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        name="eid"
                                                        id="eid"
                                                        required
                                                        variant="outlined"
                                                        fullWidth
                                                        defaultValue={watch('eid') ? watch('eid') : ''}
                                                        label="Employee ID"
                                                        {...register('eid', { required: true })}
                                                        error={errors.eid}
                                                        helperText={errors.eid && 'Employee ID is required.'}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </section>
                                    )}
                                    {/* ########### Section 1 ########### */}

                                    {/* ########### Section 2 ########### */}
                                    {formStep === 2 && (
                                        <section>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <FormControl variant="outlined"
                                                        fullWidth
                                                        error={errors.region}>
                                                        <InputLabel id="select-region-label">Select Region</InputLabel>
                                                        <Select
                                                            {...register('region', { required: true })}
                                                            labelId="select-region"
                                                            id="select-region"
                                                            value={region}
                                                            onChange={regionOnChange}
                                                            label="Select Region"
                                                        >
                                                            <MenuItem value="">
                                                                <em>Select Region</em>
                                                            </MenuItem>
                                                            {regionOptions}
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={2} >
                                                <Grid item xs={12}>
                                                    <Box display={region === '' ? 'none' : 'block'}>
                                                        <FormControl variant="outlined"
                                                            fullWidth
                                                            error={errors.province}
                                                        >
                                                            <InputLabel id="select-province-label">Select {region === "NCR" ? 'District' : 'Province'}</InputLabel>
                                                            <Select
                                                                {...register('province', { required: true })}
                                                                labelId="select-province"
                                                                id="select-province"
                                                                value={province}
                                                                onChange={provinceOnChange}
                                                                label="Select Province"
                                                            >
                                                                <MenuItem value="">
                                                                    <em>Select {region === "NCR" ? 'District' : 'Province'}</em>
                                                                </MenuItem>
                                                                {provinceOptions}
                                                            </Select>
                                                        </FormControl>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <Box display={province === '' ? 'none' : 'block'}>
                                                        <FormControl variant="outlined"
                                                            fullWidth
                                                            error={errors.municipality}>
                                                            <InputLabel id="select-muni-label">Select Municipality</InputLabel>
                                                            <Select
                                                                labelId="select-muni"
                                                                id="select-muni"
                                                                {...register('municipality', { required: true })}
                                                                value={muni}
                                                                onChange={muniOnChange}
                                                                label="Select Municipality"
                                                            >
                                                                <MenuItem value="">
                                                                    <em>Select Municipality</em>
                                                                </MenuItem>
                                                                {muniOptions}
                                                            </Select>
                                                        </FormControl>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <Box display={muni === '' ? 'none' : 'block'}>
                                                        <FormControl variant="outlined"
                                                            fullWidth
                                                            error={errors.barangay}>
                                                            <InputLabel id="select-barangay-label">Select Barangay</InputLabel>
                                                            <Select
                                                                labelId="select-barangay"
                                                                id="select-barangay"
                                                                {...register('barangay', { required: true })}
                                                                value={barangay}
                                                                onChange={barangayOnChange}
                                                                label="Select Barangay"

                                                            >
                                                                <MenuItem value="">
                                                                    <em>Select Barangay</em>
                                                                </MenuItem>
                                                                {barangayOptions}
                                                            </Select>
                                                        </FormControl>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </section>
                                    )}
                                    {/* ########### Section 2 ########### */}


                                    <Snackbar open={snack} autoHideDuration={6000} onClose={handleClose}>
                                        <Alert onClose={handleClose} severity={severity}>
                                            {snackMessage}
                                        </Alert>
                                    </Snackbar>
                                    {renderButton()}
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                </Box>
                {
                    formStep < 1 ?
                        <div>
                            <Box mt={1} className={classes.cardbg}>
                                <Button variant="outlined" size="medium" fullWidth className={classes.link}>
                                    Already have an account?&nbsp;
                                    <Link to="/login" variant="body2" align="center" className={classes.link}>
                                        Login
                                    </Link>
                                </Button>
                            </Box>
                        </div>

                        : ''
                }

            </Container>
        </Grid>
    )
}

export default CreateAccount
