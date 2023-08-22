import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
} from "@mui/material";
import httpClient from "./httpClient";

const QuestionBank = () => {
  const [courseUnit, setCourseUnit] = useState("");
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [user, setUser] = useState('');
  const [showCard, setShowCard] = useState(true); // State to control the card display

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const kresponse = await httpClient.get("https://gradex-6c6911643a2a.herokuapp.com/@me");
        setUser(kresponse.data);
        const response = await httpClient.get(
          
          `https://gradex-6c6911643a2a.herokuapp.com/enrolled_courses/${user.id}`
        );
        setEnrolledCourses(response.data.enrolled_courses);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
      }
    };

    fetchEnrolledCourses();
  }, [user.id]);

  const handleGenerateQuestion = async () => {
    try {
      setShowCard(false); // Hide the card when Generate Question is clicked
      const response = await httpClient.post(
        "https://gradex-6c6911643a2a.herokuapp.com/generate_question",
        {
          courseUnit,
          topic,
        }
      );

      setQuestion(response.data.question_text);
      setAnswer("");
      setScore("");
      setComment("");
    } catch (error) {
      console.error(error?.response?.data || error.message);
    }
  };

  const handleSubmitAnswer = async () => {
    try {
      const response = await httpClient.post(
        "https://gradex-6c6911643a2a.herokuapp.com/grade_answer",
        {
          question: question,
          answer: answer,
          courseUnit: courseUnit,
          topic: topic,
        }
      );

      setScore(response.data.score);
      setComment(response.data.comment);
    } catch (error) {
      console.error(error?.response?.data || error.message);
    }
  };

// ... (rest of the code)

return (
  <>
  <Typography variant="h4"sx={{alignSelf: "center", fontSize:"45px"}}>Question Bank</Typography>
  
  <Box sx={{
    backgroundColor: '#DAE0E6',
    display: "flex",
    height: "100vh"
    
    
  }}>
    <Box   p={2} sx={{
    
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    
  }}>
    
    <Box mt={2}>
      <Select
        label="Course Unit"
        value={courseUnit}
        onChange={(e) => setCourseUnit(e.target.value)}
      >
        {enrolledCourses.map((course) => (
          <MenuItem key={course.id} value={course.name}>
            {course.name}
          </MenuItem>
        ))}
      </Select>
      {courseUnit && (
        <Select
          label="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          {enrolledCourses
            .find((course) => course.name === courseUnit)
            .topics.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
        </Select>
      )}
      <Button variant="contained" color="primary" onClick={handleGenerateQuestion}>
        Generate Question
      </Button>
    </Box>
    {question && (
      <Box mt={2} sx={{
        backgroundColor: '#ffffff',
        fontSize:"60px",
        padding:"10px 20px",
        borderRadius:"10px",
        width:"100%",
        display:"flex",
        flexDirection: "column",
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Add shadow
      }}>
        <Typography variant="h5" sx={{fontSize:"30px"}}>Question:</Typography>
        <Typography  sx={{fontSize:"30px", marginBottom: "20px"}}>{question}</Typography>
        <TextField
          label="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          inputProps={{ style: { fontSize: "30px" } }} // Specify the color here
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmitAnswer}
          fontSize="25px"
        >
          Submit Answer
        </Button>
      </Box>
    )}
      {showCard && ( // Show the card if showCard is true
      <Box mt={2} sx={{
        backgroundColor: '#ffffff',
        fontSize:"60px",
        padding:"25px",
        borderRadius:"10px",
        width:"100%",
        display:"flex",
        flexDirection: "column",
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Add shadow
      }}>
        <Typography variant="h5" sx={{fontSize:"25px"}}><h1>Hello,</h1>

        Welcome to our question and answer platform! To get started, please complete the initial form as it helps us
            tailor questions to your interests. As you begin answering questions, our system will grade your responses and
            provide feedback on each one. Our aim is to offer you a personalized learning journey. We're excited to have you
            on board and look forward to seeing your progress!

        Best regards,
      </Typography>
      </Box>
    )}
    </Box>
    
    {score !== "" && (
      <Box mt={2} sx={{alignSelf: "flex-start",
       justifySelf: "flex-start",
       background: "#024846",
       width: "30%",
        color:"#ffffff",
        borderRadius: "10px",
        padding: "20px",
        marginTop: "100px",
        marginRight: "40px"
       }}>
        <Typography variant="h6" sx={{fontSize:"30px"}}>Score: {score}</Typography>
        <Typography sx={{fontSize:"30px"}}>Comment: {comment}</Typography>
      </Box>
    )}
    
  </Box></>
);

// ... (rest of the code)


};

export default QuestionBank;
