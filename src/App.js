import React from 'react';
import './App.css';
import { createMuiTheme, ThemeProvider }  from '@material-ui/core'  
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { amber } from '@material-ui/core/colors';
import Create from './components/CreateAccount'

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
            <Route path="/new" component={Create}/>
          </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
