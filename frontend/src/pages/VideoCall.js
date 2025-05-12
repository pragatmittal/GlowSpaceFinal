import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as faceapi from 'face-api.js';
import io from 'socket.io-client';
import './VideoCall.css';

const VideoCall = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState(null);
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isDoctor, setIsDoctor] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const [emotion, setEmotion] = useState('');
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('Loading models...');

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    validateRoom();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId]);

  const validateRoom = async () => {
    try {
      const response = await axios.get(`/api/video/validate/${roomId}`);
      if (response.data.success) {
        setAppointment(response.data.appointment);
        setIsAuthenticated(true);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error validating room');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="video-call-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading video call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-call-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="return-button">
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-call-container">
      <div className="video-grid">
        <div className="video-wrapper">
          <video ref={localVideoRef} autoPlay muted playsInline className="local-video" />
          <div className="video-controls">
            <button onClick={() => setIsMuted(!isMuted)} className="control-button">
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button onClick={() => setIsVideoOff(!isVideoOff)} className="control-button">
              {isVideoOff ? 'Turn On Video' : 'Turn Off Video'}
            </button>
          </div>
        </div>
        <div className="video-wrapper">
          <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
        </div>
      </div>
      <div className="emotion-display">
        <p>Current Emotion: {emotion || 'Detecting...'}</p>
      </div>
    </div>
  );
};

export default VideoCall; 