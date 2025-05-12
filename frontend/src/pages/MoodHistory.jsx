import React, { useEffect, useState, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Lottie from 'lottie-react';
import gsap from 'gsap';
import './MoodHistoryCustom.css'; // Custom CSS for calendar

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

const moodColors = {
  happy: 'bg-blue-100',
  cry: 'bg-blue-50',
  sleep: 'bg-gray-100',
  surprised: 'bg-indigo-50',
  weary: 'bg-gray-200',
  tired: 'bg-orange-50',
  sleepy: 'bg-indigo-100',
  sad: 'bg-blue-50',
  relaxed: 'bg-green-50',
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
  const [lottieData, setLottieData] = useState(null);
  const moodBoxRef = useRef(null);
  const editBoxRef = useRef(null);

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

  // Fetch Lottie JSON for selected mood
  useEffect(() => {
    if (selectedMood && selectedMood.emojiURL) {
      fetch(selectedMood.emojiURL)
        .then(res => res.json())
        .then(setLottieData)
        .catch(() => setLottieData(null));
    } else {
      setLottieData(null);
    }
  }, [selectedMood]);

  // GSAP animation for mood details
  useEffect(() => {
    if (moodBoxRef.current) {
      gsap.fromTo(
        moodBoxRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      );
    }
  }, [selectedMood, editMode]);

  // GSAP animation for edit box
  useEffect(() => {
    if (editMode && editBoxRef.current) {
      gsap.fromTo(
        editBoxRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [editMode]);

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
      if (mood && mood.emojiURL) {
        const match = mood.emojiURL.match(/([a-f0-9]{4,})/);
        if (match && match[1]) {
          return (
            <span className="block text-xl">
              <img
                src={`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${parseInt(match[1], 16).toString(16)}.png`}
                alt={mood.moodType}
                style={{ width: 24, height: 24 }}
              />
            </span>
          );
        }
      }
    }
    return null;
  };

  // Custom calendar tile styling
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().slice(0, 10);
      const mood = moods.find(m => m.date && m.date.slice(0, 10) === dateStr);
      if (mood && mood.moodType) {
        return `custom-mood-tile ${moodColors[mood.moodType] || 'bg-gray-100'} text-gray-700`;
      }
      // Highlight selected day
      if (dateStr === selectedDate.toISOString().slice(0, 10)) {
        return 'custom-selected-tile';
      }
    }
    return '';
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-start justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 p-4 font-sans md:items-stretch" style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      {/* Calendar Section */}
      <div className="calendar-glass bg-white/70 rounded-3xl shadow-xl p-8 mb-6 md:mb-0 md:mr-10 w-full max-w-xs border border-gray-200 transition-all duration-300 min-h-[480px] flex flex-col justify-between">
        <h2 className="text-2xl font-extrabold mb-6 text-center text-gray-800 tracking-wide drop-shadow">Your Mood Calendar</h2>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={tileContent}
          tileClassName={tileClassName}
          prev2Label={null}
          next2Label={null}
        />
      </div>
      {/* Mood Details Section */}
      <div
        ref={moodBoxRef}
        className={`backdrop-blur-lg bg-white/80 rounded-3xl shadow-xl p-10 w-full max-w-md border border-gray-200 transition-all duration-500 min-h-[480px] flex flex-col justify-between ${selectedMood ? `${moodColors[selectedMood.moodType] || 'bg-gray-100'}` : ''}`}
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)' }}
      >
        <h3 className="text-3xl font-extrabold mb-8 text-center text-gray-800 tracking-wide drop-shadow">Mood Details</h3>
        {loading && <div className="text-blue-500 mb-2 animate-pulse">Loading...</div>}
        {error && <div className="text-red-500 mb-2 animate-bounce">{error}</div>}
        {selectedMood ? (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 drop-shadow-2xl">
                {lottieData && <Lottie animationData={lottieData} loop={true} />}
              </div>
              <div className="mt-4 text-2xl font-bold capitalize text-gray-800 tracking-wide">
                {selectedMood.moodType}
              </div>
            </div>
            {editMode ? (
              <div ref={editBoxRef} className="bg-white/95 rounded-2xl p-6 shadow-xl animate-fadeIn">
                <select
                  className="w-full p-3 mb-4 bg-gray-50 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 text-lg transition-all duration-200 font-medium text-gray-700"
                  value={editMoodType}
                  onChange={e => setEditMoodType(e.target.value)}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {Object.keys(emojiMap).map(mood => (
                    <option key={mood} value={mood}>{mood.charAt(0).toUpperCase() + mood.slice(1)}</option>
                  ))}
                </select>
                <textarea
                  className="w-full p-3 mb-4 bg-gray-50 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-400 text-lg transition-all duration-200 font-medium text-gray-700 resize-none"
                  rows={3}
                  value={editNote}
                  onChange={e => setEditNote(e.target.value)}
                  placeholder="Update your notes..."
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
                <div className="flex gap-4 justify-center mt-2">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-all duration-200" onClick={handleSave} disabled={loading}>Save</button>
                  <button className="bg-gray-300 px-6 py-2 rounded-lg font-semibold shadow hover:bg-gray-400 transition-all duration-200" onClick={handleCancel}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 text-lg text-gray-700 bg-white/80 rounded-lg p-4 shadow-inner">
                  <span className="font-semibold text-blue-700">Notes:</span> {selectedMood.notes || <span className="italic text-gray-400">No notes</span>}
                </div>
                <div className="flex justify-center">
                  <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-8 py-2 rounded-lg font-bold shadow hover:scale-105 hover:from-blue-600 hover:to-blue-800 transition-all duration-200" onClick={handleEdit}>Edit</button>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-gray-500 text-center text-lg font-semibold animate-fadeIn">No mood recorded for this day.</div>
        )}
      </div>
    </div>
  );
};

export default MoodHistory; 