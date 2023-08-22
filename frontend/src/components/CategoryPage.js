import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import httpClient from './httpClient';
import './CategoryPage.css'; // Import the CSS for styling
import ThreadList from './ThreadList';

function CategoryPage() {
  const { categoryId } = useParams();
  const [category, setCategory] = useState(null);
  const [threads, setThreads] = useState([]);
  const [Threads, setTThreads] = useState([]);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await httpClient.get("https://gradex-6c6911643a2a.herokuapp.com/get_threads_ordered_by_most_posts");
        setTThreads(response.data.threads);
        console.log(response.data);
      } catch (error) {
        console.log("Error fetching threads");
      }
    })();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const categoryResponse = await httpClient.get(`https://gradex-6c6911643a2a.herokuapp.com/get_category_and_threads/${categoryId}`);

        if (!categoryResponse.data) {
          throw new Error('Error fetching category data');
        }

        const categoryData = categoryResponse.data;
        setCategory(categoryData);
        setThreads(categoryData.threads || []);
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    }

    fetchData();
  }, [categoryId]);

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const newThreadData = {
        title: newThreadTitle,
        categoryId: categoryId,
      };

      const response = await httpClient.post('https://gradex-6c6911643a2a.herokuapp.com/add_thread', newThreadData);

      if (response.data) {
        setThreads([...threads, response.data]);
        setNewThreadTitle('');
      } else {
        setError('Error creating thread');
      }
    } catch (error) {
      setError('Error creating thread: ' + error.message);
    }
  };

  return (
    <div className='forum-layout'>

        <div className="categories">
              {category && <h1 className="category-title">Category: {category.name}</h1>}
              {isLoading ? (
                <p>Loading...</p>
              ) : error ? (
                <p>Error: {error}</p>
              ) : (
                <div>
                  <div className="thread-list">
                    {threads.map((thread, index) => (
                      <Link to={`thread/${thread.id}`} key={thread.id} className={`thread-card thread-color-${index % 4}`}>
                        <p className="threaimport './ThreadPage.css';
d-link">{thread.title}</p>
                      </Link>
                    ))}
                  </div>
                  <div className="new-thread-form">
                    <h2 className="new-thread-title">Create New Thread</h2>
                    <form onSubmit={handleSubmit}>
                      <input
                        type="text"
                        value={newThreadTitle}
                        onChange={e => setNewThreadTitle(e.target.value)}
                        placeholder="Enter thread title..."
                        required
                        className="new-thread-input"
                      />
                      <button type="submit" className="new-thread-button">Submit</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
            <div className="threads">
                 <ThreadList Threads={Threads} />
            </div>



    </div>
    
  );
}

export default CategoryPage;
