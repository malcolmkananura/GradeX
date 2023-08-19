import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Select,
  MenuItem,
} from "@mui/material";
import httpClient from "./httpClient";

const Quiz = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");
  const [courseUnit, setCourseUnit] = useState("");
  const [topic, setTopic] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [user, setUser] = useState('');
  const [showCard, setShowCard] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const kresponse = await httpClient.get("http://127.0.0.1:5000/@me");
        setUser(kresponse.data);
        const response = await httpClient.get(
          `http://127.0.0.1:5000/enrolled_courses/${user.id}`
        );
        setEnrolledCourses(response.data.enrolled_courses);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
      }
    };

    fetchEnrolledCourses();
  }, [user.id]);

  const handleSubmitForm = async () => {
    try {
      const response = await httpClient.post(
        "http://127.0.0.1:5000/generate_quiz_question",
        {
          courseUnit,
          topic,
        }
      );

      const { question_text, options } = response.data;
      setQuestion(question_text);
      setOptions(options);
      setSelectedOption("");
      setScore("");
      setComment("");
      setShowCard(false);
    } catch (error) {
      console.error("Error generating quiz question:", error);
    }
  };

  const handleSubmitAnswer = async () => {
    try {
      const response = await httpClient.post(
        "http://127.0.0.1:5000/grade_quiz_answer",
        {
          question: question,
          topic: topic,
          options: options,
          answer: selectedOption,
          courseUnit: courseUnit,
        }
      );

      setScore(response.data.score);
      setComment(response.data.comment);
    } catch (error) {
      console.error("Error grading answer:", error);
    }
  };

  return (
    <>  <Typography variant="h4"sx={{alignSelf: "center", fontSize:"40px"}}>Quiz</Typography>
    <Box p={2} sx={{
      backgroundColor: '#DAE0E6',
      display: "flex",
      alignItems: "center",
      height: "150vh"
      
      
      }}>
      
      <Box   sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      
      
      }}>



      <Box mt={2} sx={{marginTop: "-700px"}}>
        <FormControl>
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
        </FormControl>
        {courseUnit && (
          <FormControl>
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
          </FormControl>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmitForm}
          fontSize="15px"
        >
          Submit
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
            <div>
              <Typography variant="h5" sx={{fontSize:"25px"}}>Question:</Typography>
              <Typography sx={{fontSize:"25px", marginBottom: "20px"}}>{question}</Typography>
            </div>
          
          <form>
            <FormControl component="fieldset">
              <RadioGroup
                aria-label="quiz-options"
                name="quiz-options"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                sx={{fontSize:"30px"}}
              >
                {options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={option}
                    // sx={{fontSize:"30px"}}
                  />
                ))}
              </RadioGroup>
            </FormControl>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitAnswer}
            >
              Submit Answer
            </Button>
          </form>
        </Box>
      )}

      {showCard && ( // Show the card if showCard is true
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
        <Typography variant="h5" sx={{fontSize:"25px"}}><h1>Hello,</h1>

              Welcome to our question and answer platform! To get started, please complete the initial form as it helps us
                  tailor questions to your interests. As you begin answering questions, our system will grade your responses and
                  provide feedback on each one. Our aim is to offer you a personalized learning journey. We're excited to have you
                  on board and look forward to seeing your progress!

Best regards,</Typography>
        </Box>
        )}
      </Box>
      
      

     {/* {showCard && ( // Show the card if showCard is true
      <Box mt={2} sx={{
        backgroundColor: 'white',
        fontSize:"60px",
        padding:"10px 20px",
        borderRadius:"15px",
        width:"50%",
        display:"flex",
        flexDirection: "column",
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Add shadow
      }}>
        <Typography variant="h5" sx={{fontSize:"30px"}}>Select course unit and topic to get question.</Typography>
      </Box>
     )} */}
     {score !== "" && comment && (
        <Box mt={2}  sx={{alignSelf: "flex-start",
        justifySelf: "flex-start",
        background: "#024846",
        width: "30%",
         color:"#ffffff",
         borderRadius: "10px",
         padding: "20px",
         marginTop: "80px",
        //  marginRight: "40px"
         marginLeft: "10px"
        }}>
          <Typography variant="h6"  sx={{fontSize:"30px"}}>Score: {score}</Typography>
          <Typography variant="h6"  sx={{fontSize:"30px"}}>Comment: {comment}</Typography>
        </Box>
      )}
    </Box></>
  );
};

export default Quiz;
