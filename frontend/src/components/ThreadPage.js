import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import httpClient from './httpClient';
import './ThreadPage.css';
import Post from './Post'; // Import the Post component
// import ThreadList from './ThreadList';

function ThreadPage() {
  const { threadId } = useParams();

  const [thread, setThread] = useState({});
  // const [Threads, setTThreads] = useState({});
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  // useEffect(() => {
  //   (async () => {
  //     try {
  //       const response = await httpClient.get("http://127.0.0.1:5000/get_threads_ordered_by_most_posts");
  //       setTThreads(response.data.threads);
  //       console.log(response.data);
  //     } catch (error) {
  //       console.log("Error fetching threads");
  //     }
  //   })();
  // }, []);

  useEffect(() => {
    async function fetchThreadData() {
      try {
        const response = await httpClient.get(`https://grade-x-018e7b77a65e.herokuapp.com/thread/${threadId}`);

        if (response.data) {
          setThread(response.data.thread || {});
          setPosts(response.data.posts || []);
        } else {
          console.error('Error fetching thread data');
        }
      } catch (error) {
        console.error('Error fetching thread data:', error);
      }
    }

    fetchThreadData();
  }, [threadId]);

  const addPost = async () => {
    if (!newPost.trim()) {
      console.error('Post content is empty');
      return;
    }

    const requestData = {
      content: newPost,
    };

    try {
      const response = await httpClient.post(`https://grade-x-018e7b77a65e.herokuapp.com/add_post/${threadId}`, requestData);

      const newPostData = response.data;
      setPosts((prevPosts) => [...prevPosts, newPostData]);
      setNewPost('');
    } catch (error) {
      console.error('Error adding post:', error);
    }
  };

  return (

              <>
    <div className='threadpage'>
      
      <div className='thread-post'>
      <div className='thread-title'>
                <div className="user-initials-placeholder">
            {thread.name && thread.name.split(' ').map((namePart, index) => (
              <span key={index} className="initial">{namePart.charAt(0)}</span>
            ))}
          </div>
          <div className='thread-head'>
      <div className='threader-name'>{thread.name}</div>
      <div className='user-type'>@{thread.user_type}</div>
      </div>
      </div>
      <h2>{thread.title}</h2>
      </div>
      <div className="post-list">
        {posts.map((post) => (
          <Post key={post.id} post={post} /> // Use the Post component
        ))}
      </div>
      <div className="new-post-form">
        <h2>What's on your mind?</h2>
        <div className='new-post'>
        <textarea
        className='post-area'
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Enter your post"
        />
        <button className="post-btn" onClick={addPost} disabled={!newPost.trim()}>Add Post</button>
        </div>
      </div>
    </div>
    {/* <div className="threads">
        <ThreadList Threads={Threads} />
    </div> */}
    </>
  

  );
}

export default ThreadPage;