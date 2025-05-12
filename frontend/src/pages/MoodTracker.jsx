import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';

const moods = [
  { label: 'Happy', value: 'happy', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f604/lottie.json' },
  { label: 'Cry', value: 'cry', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f62d/lottie.json' },
  { label: 'Sleep', value: 'sleep', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f971/lottie.json' },
  { label: 'Surprised', value: 'surprised', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f631/lottie.json' },
  { label: 'Weary', value: 'weary', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f629/lottie.json' },
  { label: 'Tired', value: 'tired', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1fae9/lottie.json' },
  { label: 'Sleepy', value: 'sleepy', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f62a/lottie.json' },
  { label: 'Sad', value: 'sad', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f614/lottie.json' },
  { label: 'Relaxed', value: 'relaxed', url: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f60c/lottie.json' },
];

const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMood) {
      setError('Please select a mood.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/moods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          moodType: selectedMood.value,
          emojiURL: selectedMood.url,
          notes: note,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit mood');
      }
      navigate('/moodhistory');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Aapka mood kaisa hai?</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {moods.map((mood) => (
              <button
                type="button"
                key={mood.value}
                className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all duration-200 focus:outline-none ${selectedMood?.value === mood.value ? 'border-blue-500 bg-blue-50' : 'border-transparent'}`}
                onClick={() => setSelectedMood(mood)}
              >
                <div className="w-20 h-20 flex items-center justify-center">
                  <Lottie animationData={mood.url} loop={true} />
                </div>
                <span className="mt-2 text-sm font-medium">{mood.label}</span>
              </button>
            ))}
          </div>
          <textarea
            className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-300"
            rows={3}
            placeholder="Kuch likhna chahein toh... (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-all duration-200"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MoodTracker; 