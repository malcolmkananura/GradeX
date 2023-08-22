import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  Avatar,
} from "@mui/material";
import {
  HomeOutlined as HomeOutlinedIcon,
  SchoolOutlined as SchoolOutlinedIcon,
  QuizOutlined as QuizOutlinedIcon,
  QuestionAnswerOutlined as QuestionAnswerOutlinedIcon,
  CalendarMonthOutlined as CalendarMonthOutlinedIcon,
  HelpOutlineOutlined as HelpOutlineOutlinedIcon,
  CrisisAlertOutlined as CrisisAlertOutlinedIcon,
  MenuOutlined as MenuOutlinedIcon,
} from "@mui/icons-material";
import { tokens } from "../../theme";
import { parseUserTypeFromToken, parseUserNameFromToken } from '../../components/tokenUtils';
import httpClient from "../../components/httpClient";

const Item = ({ title, path, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const itemStyles = {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
    marginBottom: "1.3rem",
    padding: "5px",
    borderRadius: "8px", // Add rounded corners
    backgroundColor:
      selected === title ? colors.primary[800] : "transparent", // Change background color on active link
  };

  return (
    <NavLink
      to={path}
      onClick={() => setSelected(title)}
      className={`link ${selected === title ? "active" : ""}`}
      style={itemStyles}
    >
      <div
        className="icon"
        style={{
          marginRight: "20px",
          marginTop: "5px",
          color: selected === title ? colors.primary[600] : "inherit", // Change icon color on active link
        }}
      >
        {React.cloneElement(icon, { color: "primary" })}
      </div>
      <Typography
        className="link_text"
        style={{ fontSize: "1.2rem" }}
        color={selected === title ? colors.primary[600] : "textPrimary"} // Change text color on active link
        textDecoration="none"
      >
        {title}
      </Typography>
    </NavLink>
  );
};

const StuSidebar = ({ onQuestionBankClick }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const [user, setUser] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const response = await httpClient.get("https://gradex-6c6911643a2a.herokuapp.com/@me");
        setUser(response.data);
      } catch (error) {
        console.log("Not authenticated");
      }
    })();
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: colors.primary[400],
        color: colors.grey[100],
        padding: "10px",
        transition: "width 0.3s",
        width: isCollapsed ? "60px" : "250px",
        overflowX: "hidden",
        height: "200vh"
      }}
    >
      <div className={`background-inner ${isCollapsed ? "collapsed" : ""}`}>
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            margin: "10px 0 20px 0",
          }}
        >
          {!isCollapsed && (
            
            <Box sx={{display:"flex",
            // justifyContent:"space-between",
            alignItems:"center",
            paddingLeft: "0px",
            marginLeft: "0px"
          }}
              
              ml="15px"
            >
              <Box sx={{maxHeight: "116px", maxWidth: "101px", paddingLeft: "0px"}}>
                  <img  src={require('../../assets/Imagegradex-logo.png')}/>
            </Box>
              <Typography variant="h6" sx={{ fontSize: '2rem', color: 'black' }}>GRADEX</Typography>
              
            </Box>
          )}
        </div>

        {!isCollapsed && (
          <Box mb="25px">
            <Box display="flex" justifyContent="center" alignItems="center">
            <div className="user-initials-placeholder-sidebar">
            {user.name && user.name.split(' ').map((namePart, index) => (
              <span key={index} className="initial">{namePart.charAt(0)}</span>
            ))}
          </div> 
            </Box>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight="bold" mb="5px" fontSize="1.6rem">
                {user.name}
              </Typography>
              <Typography variant="subtitle1" color={colors.greenAccent[500]} fontSize="1.2rem">
                {user.user_type}
              </Typography>
            </Box>
          </Box>
        )}

        <Box paddingLeft={isCollapsed ? undefined : "10%"}>
          <Item
            title="Dashboard"
            path="student-dashboard"
            icon={<HomeOutlinedIcon />}
            selected={selected}
            setSelected={setSelected}
          />

          <Typography variant="h6" color={colors.grey[300]} sx={{ m: "15px 0 5px 20px" }}>
            COURSE
          </Typography>
          <Item
            title="Quick Quiz"
            path="quick-quiz"
            icon={<QuizOutlinedIcon />}
            selected={selected}
            setSelected={setSelected}
          />
          <Item
            title="Question Bank"
            path="question-bank"
            onClick={() => onQuestionBankClick()}
            icon={<QuestionAnswerOutlinedIcon />}
            selected={selected}
            setSelected={setSelected}
          />
          {/* <Item
            title="Course Units"
            path="course-units"
            icon={<SchoolOutlinedIcon />}
            selected={selected}
            setSelected={setSelected}
          /> */}
          <Item
            title="Course Units"
            path="course-unit"
            icon={<CrisisAlertOutlinedIcon />}
            selected={selected}
            setSelected={setSelected}
          />
          <Item
            title="Forum"
            path="forum"
            icon={<CrisisAlertOutlinedIcon />}
            selected={selected}
            setSelected={setSelected}
          />

          {/* <Typography variant="h6" color={colors.grey[300]} sx={{ m: "15px 0 5px 20px" }}>
            PAGES
          </Typography>
          <Item
            title="Deadlines"
            path="deadlines"
            icon={<CrisisAlertOutlinedIcon />}
            selected={selected}
            setSelected={setSelected}
          />
          <Item
            title="Calendar"
            path="calendar"
            icon={<CalendarMonthOutlinedIcon />}
            selected={selected}
            setSelected={setSelected}
          />
          <Item
            title="FAQ"
            path="faq"
            icon={<HelpOutlineOutlinedIcon />}
            selected={selected}
            setSelected={setSelected}
          /> */}
        </Box>
      </div>
    </Box>
  );
};

export default StuSidebar;
