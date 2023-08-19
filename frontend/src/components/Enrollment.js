import React, { useState, useEffect } from 'react';
import axios from 'axios';
import httpClient from './httpClient';

function EnrollmentPage() {
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [user, setUser] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const response = await httpClient.get("https://grade-x-018e7b77a65e.herokuapp.com/@me");
        setUser(response.data);
      } catch (error) {
        console.log("Not authenticated");
      }
    })();
  }, []);


  const studentId = user.id;

  useEffect(() => {
    fetchAvailableCourses();
  }, []);

  const fetchAvailableCourses = async () => {
    try {
      const kresponse = await httpClient.get("https://grade-x-018e7b77a65e.herokuapp.com/@me");
      setUser(kresponse.data);
      const response = await httpClient.get(`https://grade-x-018e7b77a65e.herokuapp.com/available_courses/${kresponse.data.id}`);
      setAvailableCourses(response.data);
    } catch (error) {
      console.error('Error fetching available courses:', error);
    }
  };


  const enrollInCourse = async () => {
    try {
      const response = await axios.post(`https://grade-x-018e7b77a65e.herokuapp.com/enroll`, {
        student_id: studentId,
        course_id: selectedCourse
      });

      console.log(response.data.message);
      fetchAvailableCourses();
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  return (
    <div>
      <h2>Enrollment Page</h2>
      <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
        <option value="">Select a course</option>
        {availableCourses.map((course) => (
          <option key={course.id} value={course.id}>{course.name}</option>
        ))}
      </select>
      <button onClick={enrollInCourse}>Enroll</button>
    </div>
  );
}

export default EnrollmentPage;
