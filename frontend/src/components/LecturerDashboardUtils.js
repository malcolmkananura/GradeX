import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api";

const fetchStudentData = async (accessToken) => {
    try {
      const response = await axios.get(`${BASE_URL}/students/dashboard/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error("Failed to fetch student data");
      }
    } catch (error) {
      throw new Error(`Error fetching student data: ${error.message}`);
    }
  };

  export default fetchStudentData;