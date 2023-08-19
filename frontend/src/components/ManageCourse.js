import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Snackbar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import httpClient from './httpClient';

const ManageCourse = () => {
  const [courseUnits, setCourseUnits] = useState([]);
  const [selectedCourseUnit, setSelectedCourseUnit] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedTopicResources, setSelectedTopicResources] = useState([]);
  const [newResource, setNewResource] = useState(null);
  const [user, setUser] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const fetchCourseUnits = async () => {
      try {
        const kresponse = await httpClient.get("https://grade-x-018e7b77a65e.herokuapp.com/@me");
        setUser(kresponse.data);
        const response = await httpClient.get(`https://grade-x-018e7b77a65e.herokuapp.com/lecturer/${user.id}/courses`);
        setCourseUnits(response.data.courses);
      } catch (error) {
        console.error('Error fetching course units:', error);
      }
    };

    fetchCourseUnits();
  }, [user.id]);

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

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopic) return;

    try {
      await httpClient.post('https://grade-x-018e7b77a65e.herokuapp.com/create_topic', {
        course_unit_id: selectedCourseUnit,
        topic_name: newTopic,
      });

      setNewTopic('');
      handleCourseUnitChange(selectedCourseUnit);
    } catch (error) {
      console.error('Error adding topic:', error);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      await httpClient.delete(`https://grade-x-018e7b77a65e.herokuapp.com/delete_topic/${topicId}`);
      handleCourseUnitChange(selectedCourseUnit);
    } catch (error) {
      console.error('Error deleting topic:', error);
    }
  };

  const handleDeleteCourseUnit = async (courseUnitId) => {
    try {
      await httpClient.delete(`https://grade-x-018e7b77a65e.herokuapp.com/delete_course_unit/${courseUnitId}`);
      setSelectedCourseUnit('');
      setTopics([]);
      setSelectedTopic(null);
      setSelectedTopicResources([]);
      const response = await httpClient.get(`https://grade-x-018e7b77a65e.herokuapp.com/lecturer/${user.id}/courses`);
      setCourseUnits(response.data.courses);
    } catch (error) {
      console.error('Error deleting course unit:', error);
    }
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    if (!selectedTopic || !newResource) return;

    try {
      const formData = new FormData();
      formData.append('file', newResource);

      await httpClient.post(`https://grade-x-018e7b77a65e.herokuapp.com/add_resource/${selectedTopic.id}`, formData);

      setNewResource(null);
      handleTopicClick(selectedTopic);
      setSnackbarMessage('Resource uploaded successfully');
    } catch (error) {
      console.error('Error uploading resource:', error);
      setSnackbarMessage('Error uploading resource');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    try {
      await httpClient.delete(`https://grade-x-018e7b77a65e.herokuapp.com/delete_resource/${resourceId}`);
      handleTopicClick(selectedTopic);
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h4">Manage Course</Typography>
      <List sx={{
            fontFamily: "roboto",
            fontSize: "25px",
            width: "700px"
          }}>
        {courseUnits.map((course) => (
          <ListItem key={course.id} >
            <ListItemText     primary={course.name} onClick={() => handleCourseUnitChange(course.id)} />
            {/* <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteCourseUnit(course.id)}>
              <DeleteIcon />
            </IconButton> */}
          </ListItem>
        ))}
      </List>
      {selectedCourseUnit && (
        <Box mt={2}  sx={{
          backgroundColor: "#ffffff",
          padding: "10px",
          width: "50%",
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: "10px"
        }}>
          {topics.map((topic) => (
            <Box key={topic.id} mt={2}>
              <Typography variant="h5">{topic.name}</Typography>
              <List>
                {selectedTopic === topic ? (
                  <>
                    {selectedTopicResources.map((resource) => (
                      <ListItem key={resource.id}>
                        <ListItemText primary={resource.fileName} />
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteResource(resource.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                    ))}
                    <ListItem>
                      <form onSubmit={handleUploadResource}>
                        <input
                          type="file"
                          accept=".pdf, .doc, .docx, .ppt, .pptx, .zip, .rar"
                          onChange={(e) => setNewResource(e.target.files[0])}
                        />
                        <Button type="submit" variant="contained" color="primary">
                          Upload
                        </Button>
                      </form>
                    </ListItem>
                  </>
                ) : null}
                <ListItem>
                  <Button variant="contained" onClick={() => handleTopicClick(topic)}>
                    Show Resources
                  </Button>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTopic(topic.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              </List>
            </Box>
          ))}
          <Box mt={2}>
            <Typography variant="h6">Add Topic:</Typography>
            <form onSubmit={handleAddTopic}>
              <TextField
                label="Topic Name"
                variant="outlined"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
              />
              <Button type="submit" variant="contained" color="primary">
                Add Topic
              </Button>
            </form>
          </Box>
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

export default ManageCourse;
