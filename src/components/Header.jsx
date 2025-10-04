import React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import ResponsiveAppBar from './ResponsiveAppBar.jsx'
import {useName} from '../context/NameContext.jsx'

export default function Header(){
    const {name} = useName();
    return( 
    <>
    <header>
    <h1>{`Welcome ${name} to The CodeCraft Intranet`}</h1>
        <ResponsiveAppBar />
    </header>
    </>
);
}