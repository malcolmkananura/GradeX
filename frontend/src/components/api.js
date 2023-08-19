import axios from "axios";
import httpClient from "./httpClient";

const BASE_URL = "http://127.0.0.1:5000";

const performOperation = async (operation, accessToken, ...args) => {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  const fileuploadheaders = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "multipart/form-data",
  };

  try {
    let response;
    switch (operation) {
      case "generateQuestion":
        response = await httpClient.post(
          `${BASE_URL}/generate_question`,
          { course_unit: args[0], topic: args[1] }
        );
        return response.data.question_text;
      case "gradeAnswer":
        response = await axios.post(
          `${BASE_URL}/questions/grade_answer/`,
          { answer: args[0], question: args[1] },
          { headers }
        );
        return {
          comment: response.data.comment,
          score: response.data.score,
        };
      case "generateQuizQuestion":
        response = await axios.post(
          `${BASE_URL}/questions/generate_quiz_question/`,
          { course_unit: args[0], topic: args[1] },
          { headers }
        );
        return {
          question: response.data.question_text,
          options: response.data.options,
        };
      case "gradeQuizAnswer":
        response = await axios.post(
          `${BASE_URL}/questions/grade_quiz_answer/`,
          { question: args[0], options: args[1], answer: args[2] },
          { headers }
        );
        return {
          score: response.data.score,
          comment: response.data.comment,
        };
      case "uploadFile":
        const formData = new FormData();
        formData.append("course_unit", args[0]);
        formData.append("topic", args[1]);
        formData.append("file", args[2]);

        response = await axios.post(
          `${BASE_URL}/course_units/upload_file/`,
          formData,
          { fileuploadheaders }
        );
        return "File uploaded successfully!";
      default:
        throw new Error("Invalid operation.");
    }
  } catch (error) {
    console.error("API request failed.", error);
    throw error;
  }
};



export default performOperation ;
