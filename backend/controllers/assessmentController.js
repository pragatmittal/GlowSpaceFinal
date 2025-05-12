const { traumaKeywords, traumaHints } = require('../utils/traumaKeywords');
const { medicationKeywords, medicationHints, medicationScores } = require('../utils/medicationKeywords');
const axios = require('axios');
const FormData = require('form-data');

// Helper: Normalize text
function normalize(text) {
  return text.toLowerCase();
}

// Trauma analysis
exports.analyzeTrauma = (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required.' });
  const normText = normalize(text);
  let score = 0;
  let found = [];
  let hints = [];
  traumaKeywords.forEach(word => {
    if (normText.includes(word)) {
      score += 2; // Each trauma keyword = 2 points
      found.push(word);
      if (traumaHints[word]) hints.push(traumaHints[word]);
    }
  });
  // Cap score at 40 (20 keywords)
  if (score > 40) score = 40;
  res.json({ score, found, hints });
};

// Medication analysis
exports.analyzeMedication = (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required.' });
  const normText = normalize(text);
  let score = 0;
  let found = [];
  let hints = [];
  medicationKeywords.forEach(word => {
    if (normText.includes(word)) {
      const medScore = medicationScores[word] || 2; // Default 2, high-risk 4/5
      score += medScore;
      found.push(word);
      if (medicationHints[word]) hints.push(medicationHints[word]);
    }
  });
  // Cap score at 40
  if (score > 40) score = 40;
  // If no keywords found, give a default score and suggestion
  if (score === 0) {
    score = 5;
    hints.push("No specific psychiatric medications recognized. If you are taking any, please mention their names (e.g., Zoloft, Xanax, Prozac, etc.). For general medication history, consult your healthcare provider for a full review.");
  }
  res.json({ score, found, hints });
};

// Voice analysis (OpenAI Whisper + simple sentiment)
exports.analyzeVoice = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file uploaded.' });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'OpenAI API key not set.' });

    // Send audio to OpenAI Whisper
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: 'audio.wav',
      contentType: req.file.mimetype,
    });
    formData.append('model', 'whisper-1');

    const whisperRes = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...formData.getHeaders(),
      },
      maxBodyLength: Infinity,
    });
    const transcription = whisperRes.data.text;

    // Simple sentiment analysis (placeholder)
    let sentiment = 'neutral';
    let score = 10; // default
    if (/sad|angry|upset|anxious|panic|afraid|scared|cry|depressed|hopeless|helpless/i.test(transcription)) {
      sentiment = 'negative';
      score = 18;
    } else if (/happy|calm|relaxed|peaceful|hopeful|confident|joy|content/i.test(transcription)) {
      sentiment = 'positive';
      score = 5;
    }

    res.json({ transcription, sentiment, score });
  } catch (err) {
    console.error('Voice analysis error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Voice analysis failed.' });
  }
}; 