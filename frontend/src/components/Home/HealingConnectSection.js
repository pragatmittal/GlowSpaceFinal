import React from 'react';
import { fallbackImage } from '../../assets/images/placeholder';
import healingImage from '../../assets/images/Healing.jpg';

const HealingConnectSection = () => {
  const handleImageError = (e) => {
    e.currentTarget.src = fallbackImage(600, 400);
  };

  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Healing Connect</h2>
        
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 to-purple-500 rounded-xl blur-lg opacity-40 group-hover:opacity-75 transition duration-300"></div>
              <div className="relative">
                <img 
                  src={healingImage}
                  alt="Person meditating with wellness icons" 
                  className="rounded-xl shadow-lg w-full h-[400px] object-cover transform group-hover:scale-[1.02] transition duration-300"
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-xl"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="ml-1 text-sm">Mental Wellness</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span className="ml-1 text-sm">Self Care</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <h3 className="text-2xl font-semibold mb-4">Schedule Your Healing Session</h3>
            <p className="text-gray-600 mb-6">
              Take the first step towards better mental health by scheduling a one-on-one session with our certified counselors.
            </p>
            
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="session" className="block text-sm font-medium text-gray-700 mb-1">Session Type</label>
                <select 
                  id="session" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select session type</option>
                  <option value="individual">Individual Counseling</option>
                  <option value="group">Group Therapy</option>
                  <option value="assessment">Mental Health Assessment</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Your Concerns (Optional)</label>
                <textarea 
                  id="message" 
                  rows="4" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Tell us briefly about your concerns..."
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition duration-300"
              >
                Schedule Session
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HealingConnectSection;

