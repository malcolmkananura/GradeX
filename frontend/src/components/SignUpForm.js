import React, { useState } from "react";
// import axios from "axios";
import { Box, TextField, Button, Typography, Link } from "@mui/material";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import httpClient from "./httpClient";
import { useNavigate } from 'react-router-dom';


const SignUpForm = () => {
  const [user_type, setUserType] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate()

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await httpClient.post(
        "http://127.0.0.1:5000/register",
        {
          user_type,
          name,
          email,
          password
        }
      );

      console.log(response.data); // Handle the response accordingly
      // Redirect to another page or show a success message
      navigate('/login');
    } catch (error) {
      console.error(error?.response?.data || error.message); // Handle error responses
      // Display an error message to the user
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor={colors.background}
    >
      <Box
        component="form"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        onSubmit={handleSubmit}
        width="35%"
        border="1px solid"
        borderRadius={8}
        p={4}
      >
        <Typography variant="h4" gutterBottom>
          Sign Up
        </Typography>
        <TextField
          label="User Type"
          variant="outlined"
          margin="normal"
          value={user_type}
          onChange={(e) => setUserType(e.target.value)}
        />
        <TextField
          label="Name"
          variant="outlined"
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          type="email"
          label="Email"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          type="password"
          label="Password"
          variant="outlined"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <TextField
          type="password"
          label="Confirm Password"
          variant="outlined"
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          marginY={2}
        >
          Sign Up
        </Button>
        <Link href="/login" variant="body2">
          I already have an account
        </Link>
      </Box>
    </Box>
  );
};

export default SignUpForm;
