import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

export default function BasicButton({...props}) {
  return (
    <Stack spacing={2} direction="row" justifyContent="center">
      <Button variant="contained" {...props}>Submit</Button>
    </Stack>
  );    
}