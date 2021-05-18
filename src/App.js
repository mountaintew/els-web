import React from 'react';
import './App.css';
import { createMuiTheme, ThemeProvider, Typography }  from '@material-ui/core'  
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import { amber } from '@material-ui/core/colors';

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
    <div className="App">
      <Typography variant="h4">Hello World</Typography>
    </div>
    </ThemeProvider>
  );
}

export default App;
