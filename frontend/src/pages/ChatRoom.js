import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const ChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [userId, setUserId] = useState('');
  const socketRef = useRef();
  const messagesEndRef = useRef();

  useEffect(() => {
    // If no roomId is provided, redirect to the global chat room
    if (!roomId) {
      navigate('/chat/global');
      return;
    }

    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username') || 'Guest';
    
    // Initialize socket connection
    socketRef.current = io('http://localhost:5001', {
      auth: {
        token: token || null
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Socket event listeners
    socketRef.current.on('connect', () => {
      console.log('Connected to socket server');
      // Set the userId from the socket connection
      setUserId(socketRef.current.id);
      socketRef.current.emit('joinRoom', { username, room: roomId });
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socketRef.current.on('chatHistory', ({ messages, participants }) => {
      console.log('Received chat history:', messages);
      setMessages(messages);
      setParticipants(participants);
      scrollToBottom();
    });

    socketRef.current.on('groupMessage', (message) => {
      console.log('Received new message:', message);
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    socketRef.current.on('updateParticipants', (updatedParticipants) => {
      console.log('Updated participants:', updatedParticipants);
      setParticipants(updatedParticipants);
    });

    socketRef.current.on('userJoined', (data) => {
      console.log('User joined:', data);
      setMessages(prev => [...prev, {
        type: 'system',
        content: `${data.username} joined the room`,
        timestamp: new Date()
      }]);
    });

    socketRef.current.on('userLeft', (data) => {
      console.log('User left:', data);
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

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 ${
              msg.sender === userId ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                msg.sender === userId
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800'
              }`}
            >
              <p className="text-sm font-semibold mb-1">
                {msg.senderName || 'Guest'}
              </p>
              <p>{msg.content}</p>
              <p className="text-xs mt-1 opacity-75">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;
