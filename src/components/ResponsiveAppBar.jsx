import * as React from 'react';
import AppBar from '@mui/material/AppBar'; //AppBar used
import Toolbar from '@mui/material/Toolbar';  //Toolbar used
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Link as RouterLink } from 'react-router-dom';

const pages = [
  { label: 'Home', to: '/' },
  { label: 'Employee Management', to: '/employeemanagement' },
];

export default function ResponsiveAppBar() {
  return (
    <AppBar position="static" id="appbar" sx={{ backgroundColor: '#CC5500' }}>                                
      <Toolbar sx={{ justifyContent: 'center' }}>
  <Box sx={{ display: 'flex', gap: 2 }}>
    {pages.map(({ label, to }) => (
      <Button
        key={to}
        component={RouterLink}
        to={to}
        sx={{ color: 'white' }}
      >
        {label}
      </Button>
    ))}
  </Box>
</Toolbar>
    </AppBar>
  );
}
