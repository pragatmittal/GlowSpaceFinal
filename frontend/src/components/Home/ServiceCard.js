import React from 'react';
import { useNavigate } from 'react-router-dom';

const ServiceCard = ({ icon, title, description, path }) => {
  const navigate = useNavigate();
  
  const handleServiceClick = () => {
    navigate(path);
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
      <div className="mb-4 text-primary-600 text-3xl">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <button
        onClick={handleServiceClick}
        className="mt-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md flex items-center justify-center group hover:scale-105 transform"
      >
        <span>Open {title}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
};

export default ServiceCard; 