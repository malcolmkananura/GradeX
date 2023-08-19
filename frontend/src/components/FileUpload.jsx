import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Snackbar,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";
import performOperation from "./api"; // Import the function

const FileUpload = () => {
  const theme = useTheme(); // Theme hook
  const [courseUnit, setCourseUnit] = useState("");
  const [topic, setTopic] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [accessToken, setAccessToken] = useState(""); // Access token state

  const courseUnits = [
    "INFORMATION SECURITY AND RISK MANAGEMENT",
    "APPLIED BUSINESS STATISTICS",
  ];

  const topics = {
    "INFORMATION SECURITY AND RISK MANAGEMENT": [
      "Applied encryption",
      "Network security",
    ],
    "APPLIED BUSINESS STATISTICS": ["Probability", "Hypothesis testing"],
  };

  useEffect(() => {
    // Get the access token from local storage (assuming it's stored as "accessToken")
    const storedAccessToken = localStorage.getItem("accessToken");
    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
    }
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!accessToken || !selectedFile || !courseUnit || !topic) {
      console.error("Access token, file, course unit, or topic not available.");
      return;
    }

    try {
      const message = await performOperation(
        "uploadFile",
        accessToken,
        courseUnit,
        topic,
        selectedFile
      );

      // Handle success
      setSnackbarMessage(message);
      setIsSnackbarOpen(true);
    } catch (error) {
      // Handle error (e.g., show a message to the user)
    }
  };

  const closeSnackbar = () => {
    setIsSnackbarOpen(false);
  };

  return (
    <Box>
      {/* Course Unit Select */}
      <Box mb={2}>
        <Select
          label="Course Unit"
          value={courseUnit}
          onChange={(e) => setCourseUnit(e.target.value)}
        >
          {courseUnits.map((unit) => (
            <MenuItem key={unit} value={unit}>
              {unit}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Topic Select */}
      {courseUnit && (
        <Box mb={2}>
          <Select
            label="Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            {topics[courseUnit].map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </Box>
      )}

      {/* File Input */}
      <Box mb={2}>
        <input type="file" onChange={handleFileChange} />
      </Box>

      {/* Submit Button */}
      <Button
        color="primary"
        onClick={handleUpload}
        style={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.getContrastText(theme.palette.primary.main), // Set text color
        }}
      >
        Upload
      </Button>

      {/* Snackbar for success message */}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        open={isSnackbarOpen}
        autoHideDuration={5000} // Adjust the duration as needed
        onClose={closeSnackbar}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default FileUpload;
