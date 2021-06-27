import React from 'react';
import './App.css';
import { createMuiTheme, ThemeProvider } from '@material-ui/core'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { amber } from '@material-ui/core/colors';
import Login from './components/Login'
import Create from './components/CreateAccount'
import PrivateRoute from './components/PrivateRoute'
import { AuthProvider } from './contexts/AuthContext'
import Dashboard from './components/Dashboard'
import ForgotPassword from './components/ForgotPassword'
import ResponseTeam from './components/Dashboard/Team'
import TeamCreateAccount from './components/TeamCreateAccount';
const theme = createMuiTheme({

  palette: {
    primary: amber,

  },
  typography: {
    fontFamily: 'Montserrat',
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    fontWeightBold: 700
  }
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <AuthProvider>
          <Switch>
            <PrivateRoute exact path="/" component={Dashboard} />
            <Route path="/new" component={Create} />
            <Route path="/login" component={Login} />
            <PrivateRoute path="/team" component={ResponseTeam}/>
            <Route path="/forgot" component={ForgotPassword}/>
            <Route path="/teamcreate" component={TeamCreateAccount}/>
          </Switch>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
