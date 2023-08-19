import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
import CategoryList from './CategoryList';
import httpClient from './httpClient';
import './ThreadPage.css';
import ThreadList from './ThreadList';

function Forum() {
  const [categories, setCategories] = useState([]);
  const [Threads, setTThreads] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await httpClient.get("https://grade-x-018e7b77a65e.herokuapp.com/get_threads_ordered_by_most_posts");
        setTThreads(response.data.threads);
        console.log(response.data);
      } catch (error) {
        console.log("Error fetching threads");
      }
    })();
  }, []);
    

  useEffect(() => {
    (async () => {
      try {
        
        const response = await httpClient.get("https://grade-x-018e7b77a65e.herokuapp.com/get_categories");
        setCategories(response.data);
      } catch (error) {
        console.log("Not authenticated");
      }
    })();
  }, []);

  return (
    <div className="forum-layout">

      {/* <Forum /> */}
      <div className="categories">
        {/* Your CategoryList component */}
        <CategoryList categories={categories}/>
      </div>
      <div className="threads">
        <ThreadList Threads={Threads} />
      </div>
    </div>
    
    
    
  );

  

  
}

export default Forum;
