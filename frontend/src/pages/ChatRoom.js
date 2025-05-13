import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [userId, setUserId] = useState('');
  const [copied, setCopied] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef();

  useEffect(() => {
    if (!roomId) {
      navigate('/chat/global');
      return;
    }
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username') || 'Guest';
    socketRef.current = io('http://localhost:5001', {
      auth: { token: token || null },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    socketRef.current.on('connect', () => {
      setUserId(socketRef.current.id);
      socketRef.current.emit('joinRoom', { username, room: roomId });
    });
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    socketRef.current.on('chatHistory', ({ messages, participants }) => {
      setMessages(messages);
      setParticipants(Array.isArray(participants) ? participants : []);
      scrollToBottom();
    });
    socketRef.current.on('groupMessage', (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });
    socketRef.current.on('updateParticipants', (updatedParticipants) => {
      setParticipants(Array.isArray(updatedParticipants) ? updatedParticipants : []);
    });
    socketRef.current.on('userJoined', (data) => {
      setMessages(prev => [...prev, {
        type: 'system',
        content: `${data.username} joined the room`,
        timestamp: new Date()
      }]);
    });
    socketRef.current.on('userLeft', (data) => {
      setMessages(prev => [...prev, {
        type: 'system',
        content: `${data.username} left the room`,
        timestamp: new Date()
      }]);
    });
    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, navigate]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const newMessage = {
      id: uuidv4(),
      content: message,
      sender: userId,
      senderName: localStorage.getItem('username') || 'Guest',
      timestamp: new Date().toISOString(),
      room: roomId
    };
    socketRef.current.emit('groupMessage', newMessage);
    setMessage('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleLeaveChat = () => {
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Left Sidebar: Participants */}
      <div className="w-72 bg-gray-900 flex flex-col p-4 border-r border-gray-800">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Participants</h2>
          <div className="flex flex-col gap-3">
            {(participants || []).map((p) => (
              <div
                key={p.id || p.username}
                className={`flex items-center gap-3 p-2 rounded-lg ${p.id === userId ? 'bg-blue-800' : 'bg-gray-800'}`}
              >
                <div className="relative">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-lg font-bold">
                    {getInitials(p.username)}
                  </span>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-gray-900 rounded-full" title="Online"></span>
                </div>
                <span className="font-medium">{p.username || 'Guest'}</span>
                {p.id === userId && <span className="ml-auto text-xs bg-blue-500 px-2 py-0.5 rounded">You</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <button
            onClick={handleCopyLink}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-semibold mb-1 flex items-center justify-center gap-2"
          >
            <span>Copy Room Link</span>
            {copied && <span className="text-green-400">Copied!</span>}
          </button>
          <button
            onClick={handleLeaveChat}
            className="w-full py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-semibold"
          >
            Leave Chat
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 bg-black">
          {messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`mb-6 flex ${msg.sender === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-lg p-4 rounded-2xl shadow-lg ${
                  msg.type === 'system'
                    ? 'bg-gray-700 text-gray-200 italic'
                    : msg.sender === userId
                    ? 'bg-blue-700 text-white'
                    : 'bg-gray-800 text-white'
                }`}
              >
                {msg.type !== 'system' && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{msg.senderName || 'Guest'}</span>
                    <span className="text-xs opacity-60">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                )}
                <div className="text-base">{msg.content}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="p-6 bg-gray-900 border-t border-gray-800">
          <div className="flex space-x-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-3 rounded-lg bg-gray-800 text-white border-none focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
