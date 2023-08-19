import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Snackbar,
} from '@mui/material';
import httpClient from './httpClient';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { width } from '@mui/system';
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined';

const StudentCoursePage = () => {
  const [courseUnits, setCourseUnits] = useState([]);
  const [selectedCourseUnit, setSelectedCourseUnit] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedTopicResources, setSelectedTopicResources] = useState([]);
  const [user, setUser] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const fetchCourseUnits = async () => {
      try {
        const kresponse = await httpClient.get("https://grade-x-018e7b77a65e.herokuapp.com/@me");
        setUser(kresponse.data);
        const response = await httpClient.get(`https://grade-x-018e7b77a65e.herokuapp.com/get_all_course_units`);
        setCourseUnits(response.data);
      } catch (error) {
        console.error('Error fetching course units:', error);
      }
    };

    fetchCourseUnits();
  }, []);

  const handleCourseUnitChange = async (courseUnitId) => {
    setSelectedCourseUnit(courseUnitId);
    try {
      const response = await httpClient.get(`https://grade-x-018e7b77a65e.herokuapp.com/course/${courseUnitId}/topics`);
      setTopics(response.data.topics);
      setSelectedTopic(null);
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const handleTopicClick = async (topic) => {
    setSelectedTopic(topic);
    try {
      const response = await httpClient.get(`https://grade-x-018e7b77a65e.herokuapp.com/view_resources/${topic.id}`);
      setSelectedTopicResources(response.data.resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await httpClient.post(`https://grade-x-018e7b77a65e.herokuapp.com/enroll`, {
        student_id: user.id,
        course_id: courseId,
      });

      setSnackbarMessage('Enrolled successfully');
      handleCourseUnitChange(selectedCourseUnit);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      setSnackbarMessage('Error enrolling in course');
    }
  };

  return (
    <Box p={2} sx={{ height: "150vh"}}>
      <Typography sx={{alignSelf: "center", fontSize:"40px", backgroundColor: ""}}>Available Course Units</Typography>
      <List sx={{ 
        // backgroundColor: 'green',
        display: "flex",
        background: "#ffffff"
     }}>
        {courseUnits.map((course) => (
          <ListItem key={course.id} sx={{display: "flex", flexDirection: "column", alignItems: "flex-start", borderRight: "solid 1px", background: "#ffffff"}}>
            <ListItemText sx={{fontSize: "20px", background: "#ffffff"}} primary={course.name} onClick={() => handleCourseUnitChange(course.id)}  />
            {selectedCourseUnit === course.id && (
              <Button variant="contained" color="primary" sx={{background:"#4E525D"}}  onClick={() => handleEnroll(course.id)}>
                Enroll
              </Button>
            )}
          </ListItem>
        ))}
      </List>
      {selectedCourseUnit && (
        <Box mt={2} sx={{  borderRadius: '8px', padding: '16px', background: "#ffffff" }}>
          {topics.map((topic) => (
            <Box key={topic.id} mt={2}  sx={{border: "solid 1px", padding: "20px", fontSize: "20px", width: "50%"}}>
              <Typography variant="h5" sx={{ marginBottom: '8px', fontSize: "30px" }}>{topic.name}</Typography>
              <List>
                {selectedTopic === topic ? (
                  <>
                    {selectedTopicResources.map((resource) => (
                      <ListItem key={resource.id}>
                        <ListItemText primary={resource.fileName} />
                        <Button
                          variant="contained"
                          color="primary"
                          sx={{ marginLeft: '8px', width: "100px", alignItems: "space-between", background: "#02BA70"}}
                          onClick={() =>
                            window.open(
                              `https://grade-x-018e7b77a65e.herokuapp.com/download_resource/${resource.id}`,
                              '_blank'
                            )
                          }
                        >
                          <DownloadOutlinedIcon/> Download
                        </Button>
                      </ListItem>
                    ))}
                  </>
                ) : null}
                <ListItem>
                  <Button variant="contained" sx={{background: "#024846"}} onClick={() => handleTopicClick(topic)}>
                    <PreviewOutlinedIcon/>
                    resources
                  </Button>
                </ListItem>
              </List>
            </Box>
          ))}
          {/* Snackbar for messages */}
          <Snackbar
            open={snackbarMessage !== ''}
            autoHideDuration={4000}
            onClose={() => setSnackbarMessage('')}
            message={snackbarMessage}
          />
        </Box>
      )}
    </Box>
  );
};

export default StudentCoursePage;
