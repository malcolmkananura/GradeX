import React from 'react';
import './ThreadPage'; // Import the CSS file for styling

function Post({ post }) {
  return (
    <div
      className={`post-card ${post.user === 'Current User' ? 'sent-by-user' : 'sent-by-others'}`}
    >
      <div className='user-image-container'>
        {post.userProfileImageURL ? (
          <img src={post.userProfileImageURL} alt={`${post.user}'s Profile`} className="user-image" />
        ) : (
          <div className="user-initials-placeholder">
            {post.user && post.user.split(' ').map((namePart, index) => (
              <span key={index} className="initial">{namePart.charAt(0)}</span>
            ))}
          </div>
        )}
      </div>
      <div className="post-content-container">
        <div className='user-name'>{post.user}</div>
        <div className='post-content'>
          <p>{post.content}</p>
          <p className='timestamp'>{post.timestamp}</p>
        </div>
      </div>
    </div>
  );
}

export default Post;