import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./global/Topbar"
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(    
  <React.StrictMode>
      <BrowserRouter>
    <App />
     </BrowserRouter>
  </React.StrictMode>,
  
);