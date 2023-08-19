import React from 'react';
import { Link } from 'react-router-dom';
// import './ThreadList.css'; // Import your CSS file

function ThreadList({ Threads }) {
  return (
    <div className="thread-list">
      <h2>Top Threads</h2>
      <ul>
        {Threads.map((thread) => (
          <li key={thread.id}>
            <Link to={`category/:categoryID/thread/${thread.id}`} className="thread-card">
              <div className="thread-title">{thread.title}</div>
              <div className="post-count">{thread.post_count} posts</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ThreadList; // Make sure to use "export default"
