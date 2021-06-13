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
        width: '100%',
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
        backdropFilter: 'blur(5px)',
        backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.4), rgba(255,255,255,0.1))'
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

export default function ForgotPassword() {
    const classes = useStyles();
    const { watch, register, formState: { errors, isValid }, } = useForm({ mode: "all" });

    const [severity, setSeverity] = useState('')
    const [snackMessage, setSnackMessage] = useState('')
    const [snack, setSnack] = useState(false)

    const { resetpassword } = useAuth()

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            await resetpassword(watch('email'))
            setSnack(false)
            setSnack(true)
            setSnackMessage("Check your email for further instructions")
            setSeverity("success")
        } catch (error) {
            setSnack(true)
            setSnackMessage(error.code)
            setSeverity("error")
            switch (error.code) {
                case "auth/too-many-requests":
                    setSnack(false)
                    setSnack(true)
                    setSnackMessage("Too many login attempts, try again later.")
                    setSeverity("error")
                    break;
                case "auth/user-not-found":
                    setSnack(false)
                    setSnack(true)
                    setSnackMessage("Account doesn't exist.")
                    setSeverity("error")
                    break;
                default:
                    setSnack(false)
                    setSnack(true)
                    setSnackMessage("Connection Lost.")
                    setSeverity("error")
            }

        }
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnack(false);
    };

    return (
        <div style={{
            background: 'url(/Wave.svg)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover'
        }}>
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
                    <Card className={classes.cardbg} elevation={3}>
                        <CardContent>
                            <div className={classes.paper}>
                                <Avatar className={classes.avatar}>
                                    <LocationOnIcon />
                                </Avatar>
                                <Typography component="h1" variant="h5">
                                    Password Recovery
                                </Typography>
                                <form className={classes.form} noValidate autoComplete="off" onSubmit={handleSubmit}>
                                    {/* onSubmit={handleFormSubmit} */}
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Typography variant="caption" display="block" align="center" gutterBottom>
                                                Enter your email address and we'll send you a link to reset your password.
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
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
                                                helperText={errors.email && 'Please enter a valid email address.'}
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
                                            Reset Password
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                    <Box mt={1} className={classes.cardbg}>
                        <Link to="/login" variant="body2" align="center" className={classes.link} style={{ textDecoration: 'none' }}>
                            <Button variant="outlined" size="medium" fullWidth className={classes.link}>
                                Login
                            </Button>
                        </Link>
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
