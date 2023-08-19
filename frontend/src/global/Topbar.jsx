import React, { useState } from 'react';
import {
  Box,
  IconButton,
  useTheme,
  Autocomplete,
  TextField,
} from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../theme";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
  Menu,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import httpClient from '../components/httpClient';

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  // State for managing the menu
  const [anchorEl, setAnchorEl] = useState(null);

  // Function to handle the menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Function to handle the menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const navigate = useNavigate();
  // Function to handle the logout action
  const handleLogout = async () => {
    // clearing the user's authentication token or session
    const response = await httpClient.post("https://grade-x-018e7b77a65e.herokuapp.com/logout");
    console.log(response.data);
    // and redirecting them to the login page.
    navigate('/login');
    console.log('Logging out...');
    handleMenuClose(); // Close the menu after logout
  };

  // Sample suggestions for autocomplete
  const suggestions = [
    { label: 'Quiz', link: 'quick-quiz' },
    { label: 'Question bank', link: 'question-bank' },
    { label: 'Dashboard', link: 'student-dashboard' },
    { label: 'Forum', link: 'forum' },
    { label: 'General Discussion/forum', link: 'forum/category/1' },
    { label: 'Assignment and homework', link: 'forum/category/2' },
    // Add more suggestions here
  ];

  return (
    <Box display="flex" justifyContent="space-between" sx={{background: colors.primary[400] }} p={1}>
      {/* SEARCH BAR */}
            <Autocomplete
        freeSolo
        options={suggestions.map((option) => option.label)}
        filterOptions={(options, state) => {
          return options.filter((option) =>
            option.toLowerCase().startsWith(state.inputValue.toLowerCase())
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search"
            sx={{ width: 300 }} // Adjust the width here (e.g., 300px)
          />
        )}
        onInputChange={(event, value) => {
          // Navigate to the selected suggestion
          const selectedSuggestion = suggestions.find(
            (suggestion) => suggestion.label === value
          );
          if (selectedSuggestion) {
            navigate(selectedSuggestion.link);
          }
        }}
      />

      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === 'dark' ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton>
          <NotificationsOutlinedIcon />
        </IconButton>
        <IconButton>
          <SettingsOutlinedIcon />
        </IconButton>
        <IconButton onClick={handleMenuOpen}>
          <PersonOutlinedIcon />
        </IconButton>

        {/* Logout Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Topbar;
