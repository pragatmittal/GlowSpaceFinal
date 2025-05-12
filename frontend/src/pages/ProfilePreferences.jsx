import React, { useEffect, useState } from 'react';

const ProfilePreferences = () => {
  const [preferences, setPreferences] = useState({ darkMode: false, notificationOptIn: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchPreferences = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/profile/preferences', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch preferences');
        const data = await res.json();
        setPreferences(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
  }, []);

  const handleToggle = async (key) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const updated = { ...preferences, [key]: !preferences[key] };
      const res = await fetch('/api/profile/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [key]: updated[key] }),
      });
      if (!res.ok) throw new Error('Failed to update preferences');
      setPreferences(updated);
      setSuccess('Preferences updated!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Profile Preferences</h2>
        {loading && <div className="text-blue-500 mb-2">Loading...</div>}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-500 mb-2">{success}</div>}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="font-medium">🌙 Dark Mode</span>
            <button
              className={`w-14 h-8 flex items-center bg-gray-300 rounded-full p-1 duration-300 focus:outline-none ${preferences.darkMode ? 'bg-blue-500' : ''}`}
              onClick={() => handleToggle('darkMode')}
              aria-pressed={preferences.darkMode}
            >
              <span
                className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ${preferences.darkMode ? 'translate-x-6' : ''}`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">🔔 Notification Opt-in</span>
            <button
              className={`w-14 h-8 flex items-center bg-gray-300 rounded-full p-1 duration-300 focus:outline-none ${preferences.notificationOptIn ? 'bg-blue-500' : ''}`}
              onClick={() => handleToggle('notificationOptIn')}
              aria-pressed={preferences.notificationOptIn}
            >
              <span
                className={`bg-white w-6 h-6 rounded-full shadow-md transform duration-300 ${preferences.notificationOptIn ? 'translate-x-6' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePreferences; 