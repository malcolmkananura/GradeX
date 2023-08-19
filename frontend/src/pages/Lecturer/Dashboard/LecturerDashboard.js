import React, { useState, useEffect } from 'react';
import httpClient from '../../../components/httpClient';
import Header from "../../../components/Header";
import { Autocomplete, Box, TextField } from "@mui/material";
import { useNavigate } from 'react-router-dom';

function LecturerDashboard() {
  const [performanceData, setPerformanceData] = useState([]); // Overall performance data
  const [studentPerformanceData, setStudentPerformanceData] = useState([]); // Student performance data
  const [user, setUser] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentSuggestions, setStudentSuggestions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const userResponse = await httpClient.get("http://127.0.0.1:5000/@me");
        setUser(userResponse.data);

        const performanceResponse = await httpClient.get(`http://127.0.0.1:5000/get_topics_performance/1`);
        console.log("Performance Response:", performanceResponse.data);
        setPerformanceData(performanceResponse.data);

        // Fetch student names and ids for suggestions
        const studentsResponse = await httpClient.get("http://127.0.0.1:5000/get_student_names_ids");
        console.log("Student Suggestions:", studentsResponse.data);
        setStudentSuggestions(studentsResponse.data);

      } catch (error) {
        console.log("Error:", error);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      (async () => {
        try {
          const studentPerformanceResponse = await httpClient.get(`http://127.0.0.1:5000/get_performance/${selectedStudentId}`);
          console.log("Student Performance Response:", studentPerformanceResponse.data);
          setStudentPerformanceData(studentPerformanceResponse.data);
        } catch (error) {
          console.log("Error:", error);
        }
      })();
    }
  }, [selectedStudentId]);

  // Function to calculate average performance
  const calculateAverage = (performances, attribute) => {
    const total = performances.reduce((sum, performance) => sum + performance[attribute], 0);
    return performances.length > 0 ? (total / performances.length).toFixed(2) : 0;
  };

  const navigate = useNavigate();

  return (
    
    <div style={{backgroundColor: "#DAE0E6", height: "150vh"}}>
      <Header title="LECTURER DASHBOARD" subtitle="Welcome to your dashboard" />
      <h2>Academic Performance</h2>

      <h3>Overall Performance Summary</h3>
      <div className="dashboard-container">
        {performanceData.map((topicPerformance, index) => (
          <div className="rounded-card" style={{ boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', padding: '16px', marginBottom: '16px' }} key={index}>
            <h2>Topic: {topicPerformance.topic_name}</h2>
            <p>Course: {topicPerformance.course_unit}</p>
            <p>Average Quiz Performance: {calculateAverage(topicPerformance.performances, 'average_quiz_performance')}</p>
            <p>Average Essay Performance: {calculateAverage(topicPerformance.performances, 'average_essay_performance')}</p>
          </div>
        ))}
      </div>

      <h3>Student Performance</h3>
      <Autocomplete
        options={studentSuggestions}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search for a student by name"
            variant="outlined"
          />
        )}
        onChange={(event, newValue) => {
          if (newValue) {
            setSelectedStudentId(newValue.id);
          } else {
            setSelectedStudentId(null);
          }
        }}
      />

      <div className="dashboard-container">
        {studentPerformanceData.map((performance, index) => (
          <div className="rounded-card" style={{ boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', padding: '16px', marginBottom: '16px' }} key={index}>
            <h2>Student Performance for {performance.course_unit_name}</h2>
            <p>Topic: {performance.topic_name}</p>
            <p>Average Quiz Performance: {performance.average_quiz_performance}</p>
            <p>Average Essay Performance: {performance.average_essay_performance}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LecturerDashboard;
