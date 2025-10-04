import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function BasicTextField({...props}) {
  return (
    <Box
      sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
      noValidate
      autoComplete="off"
    >
      <TextField id="standard-basic" label = "Name" variant="standard" {...props}/>
    </Box>
  );
}
