import React, { useState, useEffect } from "react";
import { Box, Typography, Paper } from "@mui/material";
import axios from "axios"; // Import Axios for making API requests

const FeedbackPage = () => {
  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    // Make a request to the backend view to fetch feedback data
    axios.get("http://127.0.0.1:8000/api/feedback/get-feedback/")
      .then(response => {
        setFeedbackList(response.data);
      })
      .catch(error => {
        console.error("Error fetching feedback:", error);
      });
  }, []);

  return (
    <Box m={2}>
      <Typography variant="h4">Feedback</Typography>
      {feedbackList.map(feedback => (
        <Paper
          key={feedback.id}
          sx={{
            p: 2,
            my: 1,
            borderRadius: "16px",
            backgroundColor: "#f5f5f5",
            maxWidth: "70%",
            alignSelf: feedback.is_student ? "flex-start" : "flex-end", // Align left for student, right for others
          }}
        >
          <Typography variant="body1">{feedback.message}</Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default FeedbackPage;
