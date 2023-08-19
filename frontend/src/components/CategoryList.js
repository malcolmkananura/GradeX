import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryList.css'; // Import your CSS file

function CategoryList({ categories }) {
  return (
    <div className="category-list">
      <h2  sx={{fontSize:"30px"}}>Categories</h2>
      <ul  sx={{fontSize:"30px"}} className='cat-comp'>
        {categories.map((category, index) => (
          <li key={category.id} sx={{fontSize:"30px"}} className='cat-unit'>
            <Link to={`category/${category.id}`}  sx={{fontSize:"30px"}} className={`category-card color-${index % 4}`}>
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryList;
