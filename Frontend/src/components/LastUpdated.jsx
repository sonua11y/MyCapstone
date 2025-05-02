import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/LastUpdated.css';

const LastUpdated = () => {
  const [lastUpdate, setLastUpdate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [source, setSource] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchLastUpdate = async () => {
      try {
        const response = await api.get('/students/last-updated');
        if (response.data) {
          setLastUpdate(response.data.lastModified);
          setSource(response.data.source);
          if (response.data.message) {
            setMessage(response.data.message);
          }
        } else {
          setLastUpdate(new Date().toLocaleDateString('en-GB'));
          setSource('fallback');
          setMessage('No data received from server');
        }
      } catch (error) {
        console.error('Error fetching last update time:', error);
        setError('Failed to fetch last update time');
        setLastUpdate(new Date().toLocaleDateString('en-GB'));
        setSource('error');
        setMessage('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    fetchLastUpdate();
  }, []);

  if (loading) {
    return <div className="last-updated">Loading...</div>;
  }

  if (error) {
    return <div className="last-updated error">{error}</div>;
  }

  return (
    <div className="last-updated">
      <span className="label">Last Updated:</span>
      <span className="date">{lastUpdate}</span>
      {message && <span className="message">({message})</span>}
    </div>
  );
};

export default LastUpdated; 