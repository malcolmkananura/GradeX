import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Calendar from '../pages/Calendar';
import FAQ from '../pages/Faq';
import Analysis from '../pages/Lecturer/Analysis';
import ConsultationHandler from '../pages/Lecturer/Consultation';
import Course from '../pages/Lecturer/Course';
import LecturerDashboard from '../pages/Lecturer/Dashboard/LecturerDashboard';
import Progress from '../pages/Lecturer/Progress';
import Consultation from '../pages/Student/Consultation';
import CourseUnits from '../pages/Student/CourseUnits';
import Deadlines from '../pages/Student/Deadlines';
import QuestionBank from '../components/QuestionBank';
import Quiz from '../components/Quiz';
import StudentDashboard from '../pages/Student/Dashboard/StudentDashboard';
import StuAppLayout from './StuAppLayout';
import FileUpload from '../components/FileUpload';
import FeedbackForm from '../components/Feedback';
import FeedbackPage from '../components/StudentFeedback';
import Forum from '../components/Forum';
import ThreadPage from '../components/ThreadPage';
import CategoryPage from '../components/CategoryPage';
import EnrollmentPage from '../components/Enrollment';
import ManageCourse from '../components/ManageCourse';
import StudentCoursePage from '../components/StudentCoursePage';

const PageContent = () => {
  return (
    <div>
      <Routes>
        <Route path="/student-layout/*" element={<StuAppLayout />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/consultation-handler" element={<ConsultationHandler />} />
        <Route path="/course" element={<ManageCourse />} />
        <Route path="/lecturer-dashboard" element={<LecturerDashboard />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/consultation" element={<FeedbackForm />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/course-units" element={<CourseUnits />} />
        <Route path="/deadlines" element={<Deadlines />} />
        <Route path="/question-bank" element={<QuestionBank />} />
        <Route path="/quick-quiz" element={<Quiz />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/course-unit" element={<StudentCoursePage />} />
        {/* Add the CategoryPage and ThreadPage routes directly */}
        
        <Route path="/forum" element={<Forum />} />
        <Route path="/forum/category/:categoryId" element={<CategoryPage />} />
        <Route path="/forum/category/:categoryId/thread/:threadId" element={<ThreadPage />} />
        <Route path="/enroll" element={<EnrollmentPage />} />

      </Routes>

    </div>
  );
};

export default PageContent;
