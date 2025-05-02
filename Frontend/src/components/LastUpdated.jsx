import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/LastUpdated.css';

const LastUpdated = () => {
  const [lastUpdate, setLastUpdate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLastUpdate = async () => {
      try {
        const response = await api.get('/api/last-update');
        if (response.data && response.data.lastModified) {
          setLastUpdate(response.data.lastModified);
        } else {
          setLastUpdate(new Date().toLocaleDateString('en-GB'));
        }
      } catch (error) {
        console.error('Error fetching last update time:', error);
        setError('Failed to fetch last update time');
        setLastUpdate(new Date().toLocaleDateString('en-GB'));
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
    </div>
  );
};

export default LastUpdated; 