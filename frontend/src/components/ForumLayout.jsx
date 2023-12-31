import React, { useState, useEffect } from 'react';
import ThreadList from './ThreadList';
import httpClient from './httpClient';
// import './ForumLayout.css';
// import Forum from './Forum';
import './ThreadPage.css';


const ForumLayout = () => {
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await httpClient.get("https://gradex-6c6911643a2a.herokuapp.com/get_threads_ordered_by_most_posts");
        setThreads(response.data.threads);
        console.log(response.data);
      } catch (error) {
        console.log("Error fetching threads");
      }
    })();
  }, []);

  return (
    <div className="forum-layout">
        <div className='forum-space'>

      </div>
      <div className="threads">
        <ThreadList threads={threads} />
      </div>
    </div>
  );
}

export default ForumLayout;
