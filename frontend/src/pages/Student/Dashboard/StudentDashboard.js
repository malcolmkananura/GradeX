import React, { useState, useEffect } from 'react';
import './StudentDashboard.css';
import httpClient from '../../../components/httpClient';
import Header from "../../../components/Header";

function StudentDashboard() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [performanceData, setPerformanceData] = useState([]); // Student performance data
  // const [studentData, setStudentData] = useState({
  //   number_of_attempted_quiz_questions: 0,
  //   number_of_attempted_essay_questions: 0,
  //   average_quiz_performance: 0,
  //   average_essay_performance: 0,
  //   number_of_correctly_attempted_essay_questions: 0,
  //   number_of_correctly_attempted_quiz_questions: 0,
  //   total_quiz_points: 0,
  // });

  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const userResponse = await httpClient.get("https://grade-x-018e7b77a65e.herokuapp.com/@me");
        setUser(userResponse.data);

        if (userResponse.data.id) {
          const performanceResponse = await httpClient.get(`https://grade-x-018e7b77a65e.herokuapp.com/get_performance/${userResponse.data.id}`);
          console.log("Performance Response:", performanceResponse.data);
          setPerformanceData(performanceResponse.data);

          // const studentResponse = await httpClient.get(`http://127.0.0.1:5000/get_student_data/${userResponse.data.id}`);
          // console.log("Student Response:", studentResponse.data);
          // setStudentData(studentResponse.data);
        }
      } catch (error) {
        console.log("Error:", error);
      }
    })();
  }, []);

  useEffect(() => {

      const fetchEnrolledCourses = async () => {
    try {
      const userResponse = await httpClient.get("https://grade-x-018e7b77a65e.herokuapp.com/@me");
        setUser(userResponse.data);
      const response = await httpClient.get(`https://grade-x-018e7b77a65e.herokuapp.com/enrolled_courses/${userResponse.data.id}`);
      setEnrolledCourses(response.data);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };
    
  }, []);



  return (
    <div style={{backgroundColor: "#DAE0E6", height: "150vh"}}>
      <Header  style={{backgroundColor: "#ffffff"}}   title="STUDENT DASHBOARD" subtitle="Welcome to your dashboard" />
      <h2>Academic Performance</h2>
      
      <div className="dashboard-container">
        {performanceData.map((performance, index) => (
          <div className="rounded-card" key={index}>
            <h2>{performance.topic_name}</h2>
            <p>Course: {performance.course_unit_name}</p>
            <p>Average Quiz Performance: {performance.average_quiz_performance}</p>
            <p>Average Essay Performance: {performance.average_essay_performance}</p>
          </div>
        ))}
      </div>
      {/* <h3>Enrolled Courses:</h3> */}
      <ul>
        {enrolledCourses.map((course) => (
          <li key={course.id}>{course.name}</li>
        ))}
      </ul>

      
    </div>
  );
}

export default StudentDashboard;
