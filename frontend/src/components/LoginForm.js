import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Link } from '@mui/material';
import { useTheme } from '@mui/material';
import { tokens } from "../theme";
import { useNavigate } from 'react-router-dom';
import httpClient from './httpClient';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault();

    const loginData = {
      email,
      password,
    };

    try {
      const response = await httpClient.post('https://grade-x-018e7b77a65e.herokuapp.com/login_user', loginData);

      if (response.status === 200) {
        const user = response.data;
        
        if (user.user_type === 'student') {
          navigate('/student-layout/student-dashboard'); // Navigate to student layout
        } else if (user.user_type === 'lecturer') {
          navigate('/lecturer-layout/lecturer-dashboard'); // Navigate to lecturer layout
        } else {
          setError('Invalid user type.');
        }
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
    }
  };

  // Helper function to parse user_type from the access token
  const parseUserTypeFromToken = (accessToken) => {
    const tokenParts = accessToken.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(atob(tokenParts[1]));
      return payload.user_type || null;
    }
    return null;
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor={colors.background} // Use the theme context to set the background color
    >
      <Box
        component="form"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        onSubmit={handleLogin}
        width="35%" // Set the card width to 35% of the screen width
        border="1px solid" // Add border to the card
        borderRadius={8} // Optional: Add border radius to the card
        p={4} // Add some padding around the card
      >
        <Typography variant="h4" gutterBottom>
          Login
        </Typography>
        <TextField
          label="Email"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            style: { border: 0 } // Remove the border from the input field
          }}
        />
        <TextField
          type="password"
          label="Password"
          variant="outlined"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            style: { border: 0 } // Remove the border from the input field
          }}
        />
        <Button type="submit" variant="contained" color="primary" size="large" marginY={2}>
          Login
        </Button>
        <Typography variant="body2">
          <Link href="/signup">
            I don't have an account
          </Link>
        </Typography>

      </Box>
    </Box>
  );
};

export default LoginForm;