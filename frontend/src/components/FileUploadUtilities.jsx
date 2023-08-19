import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/course_units"; // Update the base URL as needed

const uploadFile = async (accessToken, courseUnit, topic, file) => {
  const formData = new FormData();
  formData.append("course_unit", courseUnit);
  formData.append("topic", topic);
  formData.append("file", file);

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "multipart/form-data",
  };

  try {
    const response = await axios.post(`${BASE_URL}/upload_file/`, formData, { headers });
    return response.data.message;
  } catch (error) {
    console.error("File upload request failed.", error);
    throw error;
  }
};

export { uploadFile };
