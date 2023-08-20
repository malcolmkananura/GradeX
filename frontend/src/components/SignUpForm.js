import React, { useState } from "react";
import { Box, Button, FormControl, InputLabel, Link, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { tokens } from "../theme";
import httpClient from "./httpClient";
import { useTheme } from "@mui/material";

const SignUpForm = () => {
  const [user_type, setUserType] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await httpClient.post(
        "https://grade-x-018e7b77a65e.herokuapp.com/register",
        {
          user_type,
          name,
          email,
          password
        }
      );

      console.log(response.data); // Handle the response accordingly
      navigate('/login');
    } catch (error) {
      console.error(error?.response?.data || error.message);
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
        <FormControl variant="outlined" margin="normal" sx={{ minWidth: 200 }}>
          <InputLabel>User Type</InputLabel>
          <Select
            label="User Type"
            value={user_type}
            onChange={(e) => setUserType(e.target.value)}
          >
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="lecturer">Lecturer</MenuItem>
          </Select>
        </FormControl>
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
