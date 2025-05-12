import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Lottie from 'lottie-react';

const emojiMap = {
  happy: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f604/lottie.json',
  cry: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f62d/lottie.json',
  sleep: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f971/lottie.json',
  surprised: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f631/lottie.json',
  weary: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f629/lottie.json',
  tired: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1fae9/lottie.json',
  sleepy: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f62a/lottie.json',
  sad: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f614/lottie.json',
  relaxed: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f60c/lottie.json',
};

const MoodHistory = () => {
  const [moods, setMoods] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMood, setSelectedMood] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editNote, setEditNote] = useState('');
  const [editMoodType, setEditMoodType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMoods = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/moods', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch moods');
        const data = await res.json();
        setMoods(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMoods();
  }, []);

  useEffect(() => {
    // Find mood for selected date
    const dateStr = selectedDate.toISOString().slice(0, 10);
    const mood = moods.find(m => m.date && m.date.slice(0, 10) === dateStr);
    setSelectedMood(mood || null);
    setEditMode(false);
    setEditNote(mood?.notes || '');
    setEditMoodType(mood?.moodType || '');
  }, [selectedDate, moods]);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => setEditMode(false);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const dateStr = selectedDate.toISOString().slice(0, 10);
      const res = await fetch(`/api/moods/${dateStr}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          moodType: editMoodType,
          emojiURL: emojiMap[editMoodType],
          notes: editNote,
        }),
      });
      if (!res.ok) throw new Error('Failed to update mood');
      // Refresh moods
      const updated = moods.map(m =>
        m.date.slice(0, 10) === dateStr
          ? { ...m, moodType: editMoodType, emojiURL: emojiMap[editMoodType], notes: editNote }
          : m
      );
      setMoods(updated);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calendar tile content: show emoji if mood exists for that day
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().slice(0, 10);
      const mood = moods.find(m => m.date && m.date.slice(0, 10) === dateStr);
      if (mood) {
        return (
          <span className="block text-xl">
            <img src={`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${parseInt(mood.emojiURL.match(/([a-f0-9]{4,})/)[1], 16).toString(16)}.png`} alt={mood.moodType} style={{ width: 24, height: 24 }} />
          </span>
        );
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-start justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 md:mb-0 md:mr-8 w-full max-w-xs">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={tileContent}
        />
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4 text-center">Mood Details</h3>
        {loading && <div className="text-blue-500 mb-2">Loading...</div>}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {selectedMood ? (
          <>
            <div className="flex flex-col items-center mb-4">
              <div className="w-24 h-24">
                <Lottie animationData={selectedMood.emojiURL} loop={true} />
              </div>
              <div className="mt-2 text-lg font-semibold capitalize">{selectedMood.moodType}</div>
            </div>
            {editMode ? (
              <>
                <select
                  className="w-full p-2 border rounded mb-2"
                  value={editMoodType}
                  onChange={e => setEditMoodType(e.target.value)}
                >
                  {Object.keys(emojiMap).map(mood => (
                    <option key={mood} value={mood}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</option>
                  ))}
                </select>
                <textarea
                  className="w-full p-2 border rounded mb-2"
                  rows={3}
                  value={editNote}
                  onChange={e => setEditNote(e.target.value)}
                />
                <div className="flex gap-2">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSave} disabled={loading}>Save</button>
                  <button className="bg-gray-300 px-4 py-2 rounded" onClick={handleCancel}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-2"><span className="font-semibold">Notes:</span> {selectedMood.notes || 'No notes'}</div>
                <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleEdit}>Edit</button>
              </>
            )}
          </>
        ) : (
          <div className="text-gray-500 text-center">No mood recorded for this day.</div>
        )}
      </div>
    </div>
  );
};

export default MoodHistory; 