import React, { useState } from 'react';
import { Box, Button, TextareaAutosize, Typography, Select, MenuItem, Grid } from '@mui/material';

const FeedbackForm = () => {
  const [message, setMessage] = useState('');
  const [courseUnit, setCourseUnit] = useState('');
  const [courseUnits, setCourseUnits] = useState([
    'INFORMATION SECURITY AND RISK MANAGEMENT',
    'APPLIED BUSINESS STATISTICS',
  ]);

  const handleFeedbackSubmit = async () => {
    const accessToken = localStorage.getItem('accessToken');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/feedback/create/', {
        method: 'POST',
        headers: {
           Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, courseUnit }),
      });

      if (response.ok) {
        // Handle successful feedback submission
        console.log('Feedback submitted successfully');
        // Clear the form
        setMessage('');
        setCourseUnit('');
      } else {
        console.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontSize="1.5rem">Submit Feedback</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}> {/* Adjust xs value to control width */}
          <Select
            value={courseUnit}
            onChange={(e) => setCourseUnit(e.target.value)}
            fullWidth
          >
            {courseUnits.map((unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={6}> {/* Adjust xs value to control width */}
          <TextareaAutosize
            rows={4}
            placeholder="Enter your feedback message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}> {/* Adjust xs value to control width */}
          <Button variant="contained" onClick={handleFeedbackSubmit} fullWidth>
            Submit Feedback
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FeedbackForm;
