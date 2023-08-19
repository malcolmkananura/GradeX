import React from 'react';
import { BrowserRouter as Router, Route, Routes, BrowserRouter } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import { CssBaseline, Switch, ThemeProvider } from '@mui/material';
import { ColorModeContext, useMode } from './theme';
import LecAppLayout from './global/LecAppLayout';
import StuSidebar from './pages/Student/Studentsidebar';
import LecSidebar from './pages/Lecturer/Lecturersidebar';
import StuAppLayout from './global/StuAppLayout';
import PageRoutes from './global/Routes';
import PageContent from './global/PageContent';

function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <main className="content">
            {/* <BrowserRouter> */}
            {/* <StuAppLayout/> */}
              <Routes>
                <Route path="/" element={<LoginForm />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/signup" element={<SignUpForm />} />
                <Route exact path="/student-layout/*" element={<StuAppLayout />}>
                <Route path="student-sidebar" element={<StuSidebar />} />
                <Route path="page-content" element={<PageContent />}>
                <Route path="routes" element ={<PageRoutes/>}/>
                </Route>
                  </Route> 
                <Route exact path="/lecturer-layout/*" element={<LecAppLayout />} >
                <Route path="lecturer-sidebar" element={<LecSidebar />} />
                <Route path="lec-page-content" element={<PageContent />}>
                <Route path="routes" element ={<PageRoutes/>}/>
                </Route>
                </Route>
              </Routes>
              {/* </BrowserRouter> */}
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
