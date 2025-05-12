import React, { useState } from 'react';
import { ReactMic } from 'react-mic';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/assessment';

const softColors = {
  bg: 'bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50',
  card: 'bg-white/80 backdrop-blur shadow-lg rounded-xl',
  label: 'text-teal-700 font-semibold',
  input: 'border border-teal-200 rounded-md p-3 w-full focus:outline-none focus:ring-2 focus:ring-teal-300',
  hint: 'text-blue-700 text-sm mt-1',
  button: 'bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded transition',
};

function Assessment() {
  // Trauma
  const [traumaText, setTraumaText] = useState('');
  const [traumaScore, setTraumaScore] = useState(0);
  const [traumaHints, setTraumaHints] = useState([]);
  // Medication
  const [medText, setMedText] = useState('');
  const [medScore, setMedScore] = useState(0);
  const [medHints, setMedHints] = useState([]);
  // Voice
  const [record, setRecord] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceScore, setVoiceScore] = useState(0);
  const [voiceTranscription, setVoiceTranscription] = useState('');
  const [voiceSentiment, setVoiceSentiment] = useState('');
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  // Real-time trauma analysis
  const analyzeTrauma = async (text) => {
    setTraumaText(text);
    if (!text.trim()) {
      setTraumaScore(0);
      setTraumaHints([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/trauma`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setTraumaScore(data.score || 0);
      setTraumaHints(data.hints || []);
    } catch (e) {
      setTraumaScore(0);
      setTraumaHints(["Error analyzing trauma input."]);
    }
  };

  // Real-time medication analysis
  const analyzeMedication = async (text) => {
    setMedText(text);
    if (!text.trim()) {
      setMedScore(0);
      setMedHints([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/medication`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setMedScore(data.score || 0);
      setMedHints(data.hints || []);
    } catch (e) {
      setMedScore(0);
      setMedHints(["Error analyzing medication input."]);
    }
  };

  // Voice recording handlers
  const onData = (recordedBlob) => {
    // Optionally handle live data
  };
  const onStop = (recordedBlob) => {
    setVoiceBlob(recordedBlob.blob);
    setVoiceTranscription('');
    setVoiceSentiment('');
    setVoiceScore(0);
    setVoiceError('');
  };

  // Send voice to backend for analysis
  const analyzeVoice = async () => {
    if (!voiceBlob) return;
    setVoiceLoading(true);
    setVoiceError('');
    setVoiceTranscription('');
    setVoiceSentiment('');
    setVoiceScore(0);
    try {
      const formData = new FormData();
      formData.append('audio', voiceBlob, 'voice.wav');
      const res = await fetch(`${API_BASE}/voice`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setVoiceTranscription(data.transcription || '');
      setVoiceSentiment(data.sentiment || '');
      setVoiceScore(data.score || 0);
      setVoiceError(data.error || '');
    } catch (e) {
      setVoiceError('Error analyzing voice input.');
    }
    setVoiceLoading(false);
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setTotalScore(traumaScore + medScore + voiceScore);
    setShowModal(true);
  };

  return (
    <div className={`min-h-screen ${softColors.bg} flex items-center justify-center py-8`}> 
      <form className={`max-w-2xl w-full p-8 ${softColors.card} space-y-8`} onSubmit={handleSubmit}>
        <h1 className="text-3xl font-bold text-center text-teal-700 mb-4">Mental Health Assessment</h1>
        {/* Trauma Section */}
        <div>
          <label className={softColors.label} htmlFor="trauma">1. Trauma History</label>
          <textarea
            id="trauma"
            className={`${softColors.input} mt-2 h-24`}
            placeholder="Describe any past traumatic experiences..."
            value={traumaText}
            onChange={e => analyzeTrauma(e.target.value)}
          />
          <div className="flex items-center mt-2">
            <span className="text-teal-600 font-bold mr-2">Score: {traumaScore}/40</span>
            {traumaHints.length > 0 && (
              <ul className={softColors.hint}>
                {traumaHints.map((hint, i) => <li key={i}>• {hint}</li>)}
              </ul>
            )}
          </div>
        </div>
        {/* Medication Section */}
        <div>
          <label className={softColors.label} htmlFor="medication">2. Medication History</label>
          <textarea
            id="medication"
            className={`${softColors.input} mt-2 h-20`}
            placeholder="List any psychiatric/mental health medications..."
            value={medText}
            onChange={e => analyzeMedication(e.target.value)}
          />
          <div className="flex items-center mt-2">
            <span className="text-teal-600 font-bold mr-2">Score: {medScore}/40</span>
            {medHints.length > 0 && (
              <ul className={softColors.hint}>
                {medHints.map((hint, i) => <li key={i}>• {hint}</li>)}
              </ul>
            )}
          </div>
        </div>
        {/* Voice Section */}
        <div>
          <label className={softColors.label}>3. Voice Input</label>
          <div className="mt-2 flex flex-col items-center">
            <ReactMic
              record={record}
              className="w-full"
              onStop={onStop}
              onData={onData}
              strokeColor="#14b8a6"
              backgroundColor="#f1f5f9"
              mimeType="audio/wav"
            />
            <div className="flex gap-2 mt-2">
              <button type="button" className={softColors.button} onClick={() => setRecord(true)} disabled={record}>Record</button>
              <button type="button" className={softColors.button} onClick={() => setRecord(false)} disabled={!record}>Stop</button>
              <button type="button" className={softColors.button} onClick={analyzeVoice} disabled={!voiceBlob || voiceLoading}>Analyze</button>
            </div>
            {voiceBlob && (
              <audio controls src={URL.createObjectURL(voiceBlob)} className="mt-2" />
            )}
            {voiceLoading && <div className="text-teal-600 mt-2">Analyzing...</div>}
            {voiceError && <div className="text-red-500 mt-2">{voiceError}</div>}
            {voiceTranscription && (
              <div className="mt-2 text-blue-700">
                <div><b>Transcription:</b> {voiceTranscription}</div>
                <div><b>Sentiment:</b> {voiceSentiment}</div>
                <div><b>Score:</b> {voiceScore}/20</div>
              </div>
            )}
          </div>
        </div>
        {/* Submit */}
        <div className="flex justify-center">
          <button type="submit" className={softColors.button + " w-40"}>Submit</button>
        </div>
      </form>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-teal-700 mb-2">Assessment Complete</h2>
            <p className="text-lg mb-4">Your score is <span className="font-bold text-blue-700">{totalScore}/100</span></p>
            <p className="text-teal-600 mb-4">It's okay to seek support 🌱<br/>Consider reaching out to a professional if you need to talk.</p>
            <button className={softColors.button} onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Assessment; 