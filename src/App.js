import React from 'react';
import './App.css';
import { createMuiTheme, ThemeProvider, Typography }  from '@material-ui/core'  
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { amber } from '@material-ui/core/colors';
import Login from './components/Login'
import DashBoard from './components/DashBoard'



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
          <Switch>
            <Route path="/login" component={Login}/>
          </Switch>
          <Switch>
            <Route path="/DashBoard" component={DashBoard}/> 
          </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
