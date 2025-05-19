import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  // Get password from environment variable
  const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD;

  // Debug logging
  useEffect(() => {
    console.log('Environment variable value:', process.env.REACT_APP_ADMIN_PASSWORD);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted password:', password);
    console.log('Expected password:', ADMIN_PASSWORD);
    console.log('Match:', password === ADMIN_PASSWORD);
    
    if (password === ADMIN_PASSWORD) {
      // Store authentication in sessionStorage
      sessionStorage.setItem('isAuthenticated', 'true');
      navigate('/admin');
    } else {
      setError(true);
      setShowAlert(true);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
          <LockIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            Admin Access
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          Please enter the password to access the admin panel
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            error={error}
            helperText={error ? "Incorrect password" : ""}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ py: 1.5 }}
          >
            Login
          </Button>
        </Box>
      </Paper>

      <Snackbar 
        open={showAlert} 
        autoHideDuration={3000} 
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowAlert(false)} 
          severity="error" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          Incorrect password. Please try again.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login; 