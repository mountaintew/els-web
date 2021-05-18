import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Button, Container, Paper, Step, StepContent, StepLabel, Stepper, Typography } from '@material-ui/core';
import LoginCredentials from './LoginComponents/LoginCredentials'
import AdminInfo from './LoginComponents/AdminInfo'
const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  button: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  actionsContainer: {
    marginBottom: theme.spacing(2),
  },
  resetContainer: {
    padding: theme.spacing(3),
  },
}));

function getSteps() {
  return ['Login Credentials', 'Administrator Info', 'Administrator Scope'];
}

function getStepContent(step) {
  switch (step) {
    case 0:
      return <LoginCredentials/>
    case 1:
      return <AdminInfo/>
    case 2:
      return `Set Location Here`;
    default:
      return 'Unknown step';
  }
}

export default function VerticalLinearStepper() {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    if (activeStep == 0){
        setActiveStep((prevActiveStep) => prevActiveStep)
        
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <>
    <Container component="main" maxWidth="md">
        <Box m={2} >
            <Typography variant="h5" >Create Account</Typography>
        </Box>
        <div className={classes.root}>
        <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((label, index) => (
            <Step key={label}>
                <StepLabel>{label}</StepLabel>
                <StepContent>
                <Typography component={'span'}>{getStepContent(index)}</Typography>
                <div className={classes.actionsContainer}>
                    <div>
                    <Button
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        className={classes.button}
                    >
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNext}
                        className={classes.button}
                    >
                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                    </div>
                </div>
                </StepContent>
            </Step>
            ))}
        </Stepper>
        {activeStep === steps.length && (
            <Paper square elevation={0} className={classes.resetContainer}>
            <Typography component={'span'}>All steps completed - you&apos;re finished</Typography>
            <Button onClick={handleReset} className={classes.button}>
                Reset
            </Button>
            </Paper>
        )}
        </div>
    </Container>
    </>
  );
}