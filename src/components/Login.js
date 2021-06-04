import { Avatar, Box, Button, Card, CardContent, Container, CssBaseline, Grid, Snackbar, TextField, Typography } from '@material-ui/core'
import React, { useState } from 'react'
import MuiAlert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import { amber } from '@material-ui/core/colors';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import { useForm } from 'react-hook-form'

import { useAuth } from '../contexts/AuthContext'
import { useHistory, Link } from 'react-router-dom'

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
        position: 'relative',
        top: '50%',
        left: '45%',
        right: '50%'
    },
    cardbg: {
    },
    forgot: {
        color: "#424242"

    },
    login: {
        color: "#212121"
    },
    link: {
        textTransform: 'capitalize',
        color: '#222',
    },
}));

export default function Login(props) {
    const classes = useStyles();
    const { watch, register, unregister, formState: { errors, isValid }, } = useForm({ mode: "all" });
    
    const [severity, setSeverity] = useState('')
    const [snackMessage, setSnackMessage] = useState('')
    const [snack, setSnack] = useState(false)
    const [tfDisabled, setTfDisabled] = useState(false)
    
    const { currentUser, login } = useAuth()
    const history = useHistory()

    const [submitBtn,setSubmitBtn] = useState(false)

    if (props.register === 'success'){
        setSnack(true)
        setSnackMessage('Account created successfully. You may now log in.')
        setSeverity('success')
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            await login(watch('email'), watch('password'))
            history.push("/")
        } catch(error) {
            switch(error.code){
                case "auth/wrong-password":
                    setSnack(false)
                    setSnack(true)
                    setSnackMessage("Invalid Username or Password.")
                    setSeverity("error")
                    break;
                case "auth/too-many-requests":
                    setSnack(false)
                    setSnack(true)
                    setSnackMessage("Too many login attempts, try again later.")
                    setSeverity("error")
                    unregister("email",  { keepDefaultValue: false })
                    unregister("password",  { keepDefaultValue: false })
                    setTfDisabled(true)
                    break;
                case "auth/user-not-found":
                    setSnack(false)
                    setSnack(true)
                    setSnackMessage("Account doesn't exist.")
                    setSeverity("error")
                    break;
                default:

            }

        }
    }

    const checkValue = () => {
        if (!isValid){
            setSubmitBtn(true)
        }
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnack(false);
    };

   

    return (
        <div>
            <Grid
                container
                spacing={0}
                direction="column"
                alignItems="center"
                justify="center"
                style={{ minHeight: '100vh' }}
            >
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <Card className={classes.cardbg}  elevation={3}>
                        <CardContent>
                            <div className={classes.paper}>
                                <Avatar className={classes.avatar}>
                                    <LocationOnIcon />
                                </Avatar>
                                <Typography component="h1" variant="h5">
                                    Login
                                </Typography>
                                <form className={classes.form} noValidate autoComplete="off" onSubmit={handleSubmit}>
                                    {/* onSubmit={handleFormSubmit} */}
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <TextField
                                                disabled={tfDisabled}
                                                id="email"
                                                required
                                                variant="outlined"
                                                label="Email"
                                                fullWidth
                                                error={errors.email ? true : false}
                                                name="email"
                                                value={watch('email') ? watch('email') : ''}
                                                {...register('email',
                                                    { required: true, pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ }
                                                )}
                                                helperText={errors.email && 'Please enter a valid email address.'}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <TextField
                                                disabled={tfDisabled}
                                                name="password"
                                                id="password"
                                                required
                                                variant="outlined"
                                                label="Password"
                                                fullWidth
                                                type="password"
                                                value={watch('password') ? watch('password') : ''}
                                                error={errors.password ? true : false}
                                                {...register('password', { required: true })}
                                                
                                            />
                                        </Grid>
                                    </Grid>
                                    <div className={classes.wrapper}>
                                        <Button
                                            disabled={!isValid}
                                            type="submit"
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            className={classes.submit}
                                        >
                                            Login
                                        </Button>
                                    </div>

                                    <Box display="flex" flexDirection="row-reverse">
                                        <Link to="/forgot" variant="body2" className={classes.forgot}>
                                            Forgot password?
                                        </Link>
                                    </Box>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                    <Box mt={1} className={classes.cardbg}>
                        <Button variant="outlined" size="medium" fullWidth className={classes.link}>
                            No account?&nbsp;
                            <Link to="/new" variant="body2" align="center" className={classes.link}>
                                Create one!
                            </Link>
                        </Button>
                    </Box>
                </Container>
            </Grid>
            <Snackbar open={snack} autoHideDuration={4000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={severity}>
                    {snackMessage}
                </Alert>
            </Snackbar>
        </div>
    )
}
